import { BufferGeometry, Vector2 } from 'three'
import { __pixelSizeMeters } from '~/settings/physics'
import TextMesh from '~/text/TextMesh'
import {
  Body,
  BodyDef,
  BodyType,
  CircleShape,
  Contact,
  Fixture,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

import { getArrNext, getArrWrap } from './arrayUtils'
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

class AngledVec2 {
  constructor(public vec: Vector2, public angle: number) {
    //
  }
}
function updateAngle(b: AngledVec2, collection: Vector2[]) {
  const i = collection.indexOf(b.vec)
  const a = getArrWrap(collection, i - 1)
  const c = getArrWrap(collection, i + 1)
  updateAngledVec(b, a, c)
  return b
}

function updateAngledVec(av: AngledVec2, prev: Vector2, next: Vector2) {
  const angle = __tempVec.subVectors(prev, av.vec).angle()
  const angle2 = __tempVec.subVectors(av.vec, next).angle()
  av.angle = wrap(angle2 - angle, -Math.PI, Math.PI)
}

export function deconstructConcavePath2(verts: Vector2[]) {
  const chunks: Vector2[][] = []
  const unsatisfied = verts.slice()
  const angles: AngledVec2[] = verts.map(v =>
    updateAngle(new AngledVec2(v, 0), unsatisfied)
  )
  while (unsatisfied.length >= 3) {
    angles.sort((a, b) => b.angle - a.angle)
    const best = angles.shift()!
    const i = unsatisfied.indexOf(best.vec)
    const chunk = [
      getArrWrap(unsatisfied, i - 1),
      best.vec,
      getArrWrap(unsatisfied, i + 1)
    ]
    unsatisfied.splice(i, 1)
    for (const a of angles) {
      if (chunk.indexOf(a.vec) !== -1) {
        updateAngle(a, unsatisfied)
      }
    }
    chunks.push(chunk)
  }
  // chunks.push(unsatisfied)

  return chunks
    .map(verts => Array.from(new Set(verts)))
    .filter(verts => verts.length >= 3)
}

class Edge {
  constructor(public v1: Vector2, public v2: Vector2) {
    //
  }
}

export function deconstructConcavePath3(verts: Vector2[]) {
  const loops = deconstructConcavePath2(verts)
  console.warn('Not done yet.')
  // const angleLoops: AngledVec2[][] = loops.map(verts => {
  //   return verts.map(v => {
  //     return updateAngle(new AngledVec2(v, 0), verts)
  //   })
  // })
  const edges = new Map<string, Edge>()
  function findOrSet(id: string, edge: Edge) {
    if (edges.has(id)) {
      return edges.get(id)
    } else {
      edges.set(id, edge)
      return undefined
    }
  }
  for (const loop of loops) {
    for (const v1 of loop) {
      const v2 = getArrNext(loop, v1)
      const id1 = verts.indexOf(v1)
      const id2 = verts.indexOf(v2)
      let other: Edge | undefined
      if (id1 < id2) {
        other = findOrSet(id1 + '-' + id2, new Edge(v1, v2))
      } else {
        other = findOrSet(id2 + '-' + id1, new Edge(v2, v1))
      }
      if (other) {
        //WIP
      }
    }
  }
  return loops
}

const TEXT_PHYSICS_SCALE = 10

export function textToPhysicsBodies(mesh: TextMesh, world: World) {
  const bodies: Body[] = []
  if (mesh.geometry instanceof BufferGeometry) {
    const verts = mesh.geometry.attributes.position.array
    const leap = mesh.geometry.attributes.position.itemSize * 4
    const pos = mesh.position
    for (let i = 0; i < verts.length; i += leap) {
      const l = verts[i + 0]
      const r = verts[i + 4]
      const t = verts[i + 1]
      const b = verts[i + 3]
      const bx: number = (l + r) / 2 + pos.x * __pixelSizeMeters
      const by: number = (t + b) / 2 + pos.y * __pixelSizeMeters
      const bwidth: number = r - l
      const bheight: number = t - b

      const body = createPhysicBox(
        world,
        bx * TEXT_PHYSICS_SCALE,
        by * TEXT_PHYSICS_SCALE,
        bwidth * TEXT_PHYSICS_SCALE,
        bheight * TEXT_PHYSICS_SCALE
      )
      bodies.push(body)
    }
  }
  return bodies
}
