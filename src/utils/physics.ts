import { __physicsScale, __pixelSizeMeters } from '~/settings/physics'
import {
  BodyDef,
  BodyType,
  CircleShape,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

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
    true,
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
  staticBody = false,
  friction = 0.1,
  density = 1,
  isSensor = false
) {
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  bodyDef.fixedRotation = false
  bodyDef.type = staticBody ? BodyType.staticBody : BodyType.dynamicBody
  const boxBody = world.CreateBody(bodyDef)
  boxBody.SetPositionXY(x * __physicsScale, y * __physicsScale)
  fixtureDef.friction = friction
  fixtureDef.restitution = 0.7
  fixtureDef.density = density
  fixtureDef.isSensor = isSensor
  const templateRect = new PolygonShape().SetAsBox(
    width * 0.5 * __physicsScale,
    height * 0.5 * __physicsScale
  )
  fixtureDef.shape = templateRect
  boxBody.CreateFixture(fixtureDef)
  return boxBody
}
export function createPhysicsCircle(
  world: World,
  x: number,
  y: number,
  radius: number
) {
  const circle = new CircleShape(radius * __physicsScale)
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  fixtureDef.shape = circle
  fixtureDef.density = 1
  fixtureDef.friction = 0.2
  fixtureDef.restitution = 0.7
  bodyDef.type = BodyType.dynamicBody
  const circleBody = world.CreateBody(bodyDef)
  circleBody.SetPositionXY(x * __physicsScale, y * __physicsScale)
  circleBody.CreateFixture(fixtureDef)
  return circleBody
}
