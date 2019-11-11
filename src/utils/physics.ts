import { Vector2 } from 'three'
import { __pixelSizeMeters } from '~/settings/physics'
import {
  BodyDef,
  BodyType,
  CircleShape,
  Contact,
  Fixture,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

import { getArrWrap } from './arrayUtils'
import { wrap } from './math'

const offsetX = -16
const offsetY = 8

export function createPhysicBoxFromPixels(
  world: World,
  x: number,
  y: number,
  width: number,
  height: number,
  isSensor = false
) {
  createPhysicBox(
    world,
    (x + offsetX - width * 0.5) * __pixelSizeMeters,
    (-y + offsetY - height * 0.5) * __pixelSizeMeters,
    width * __pixelSizeMeters,
    height * __pixelSizeMeters,
    BodyType.staticBody,
    undefined,
    undefined,
    isSensor
  )
}

export function createPhysicBox(
  world: World,
  x: number,
  y: number,
  width: number,
  height: number,
  bodyType: BodyType = BodyType.staticBody,
  friction = 0.1,
  density = 1,
  isSensor = false
) {
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  bodyDef.fixedRotation = false
  bodyDef.type = bodyType
  const boxBody = world.CreateBody(bodyDef)
  boxBody.SetPositionXY(x, y)
  fixtureDef.friction = friction
  fixtureDef.restitution = 0.7
  fixtureDef.density = density
  fixtureDef.isSensor = isSensor
  if (bodyType === BodyType.staticBody) {
    fixtureDef.filter.categoryBits = makeBitMask(['environment'])
  }
  const templateRect = new PolygonShape().SetAsBox(width * 0.5, height * 0.5)
  fixtureDef.shape = templateRect
  boxBody.CreateFixture(fixtureDef)
  return boxBody
}
export function createPhysicsCircle(
  world: World,
  x: number,
  y: number,
  radius: number,
  ballsSelfCollide = false
) {
  const circle = new CircleShape(radius)
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  fixtureDef.shape = circle
  fixtureDef.density = 1
  fixtureDef.friction = 0.2
  fixtureDef.restitution = 0.7
  bodyDef.type = BodyType.dynamicBody
  fixtureDef.filter.categoryBits = makeBitMask(['enemy'])
  const maskArr: PBits[] = ['environment', 'hero', 'heroWeapon']
  if (ballsSelfCollide) {
    maskArr.push('enemy')
  }
  fixtureDef.filter.maskBits = makeBitMask(maskArr)
  const circleBody = world.CreateBody(bodyDef)
  circleBody.SetPositionXY(x, y)
  circleBody.CreateFixture(fixtureDef)
  return circleBody
}

export type SensorCallback = (sensor: Fixture, rigidBody: Fixture) => void

export class ContactPair {
  sensor: Fixture
  rigidBody: Fixture
  set(sensor: Fixture, rigidBody: Fixture) {
    this.sensor = sensor
    this.rigidBody = rigidBody
    return this
  }
}

const __sharedContactPair = new ContactPair()

export function getContactBetweenSensorAndRigidBody(contact: Contact) {
  const fixtureA = contact.GetFixtureA()
  const fixtureB = contact.GetFixtureB()

  // //make sure only one of the fixtures was a sensor
  if (fixtureA.m_isSensor === fixtureB.m_isSensor) {
    return
  }

  if (fixtureA.m_isSensor) {
    return __sharedContactPair.set(fixtureA, fixtureB)
  } else {
    return __sharedContactPair.set(fixtureB, fixtureA)
  }
}

export type PBits =
  | 'environment'
  | 'hero'
  | 'heroWeapon'
  | 'enemy'
  | 'enemyWeapon'

const pBitsArr: PBits[] = [
  'environment',
  'hero',
  'heroWeapon',
  'enemy',
  'enemyWeapon'
]

export function makeBitMask(pbits: PBits[]) {
  let bitMask = 0
  for (const pbit of pbits) {
    bitMask |= Math.pow(2, pBitsArr.indexOf(pbit) + 1)
  }
  return bitMask
}

const __tempVec = new Vector2()
export function deconstructConcavePath(verts: Vector2[]) {
  const chunks: Vector2[][] = []
  let unsatisfied: Vector2[]
  let limit = 5
  do {
    unsatisfied = []
    limit--
    let chunk: Vector2[] = []
    for (let i = 0; i < verts.length; i++) {
      const a = getArrWrap(verts, i - 1)
      const b = getArrWrap(verts, i)
      const c = getArrWrap(verts, i + 1)
      const angle = __tempVec.subVectors(a, b).angle()
      const angle2 = __tempVec.subVectors(b, c).angle()
      const delta = wrap(angle2 - angle, -Math.PI, Math.PI)
      if (delta >= 0) {
        chunk.push(a, b, c)
      } else {
        unsatisfied.push(b)
        chunks.push(chunk)
        chunk = [b]
      }
    }
    chunks.push(chunk)
    verts = unsatisfied
  } while (unsatisfied.length > 3 && limit > 0)

  return chunks
    .map(verts => Array.from(new Set(verts)))
    .filter(verts => verts.length >= 3)
}
