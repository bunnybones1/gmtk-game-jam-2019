import { __phyicsScale } from '~/settings/physics'
import {
  BodyDef,
  BodyType,
  CircleShape,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

export function createPhysicBox(
  world: World,
  x: number,
  y: number,
  width: number,
  height: number,
  staticBody = false,
  friction = 0.1,
  density = 1
) {
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  bodyDef.fixedRotation = false
  bodyDef.type = staticBody ? BodyType.staticBody : BodyType.dynamicBody
  const boxBody = world.CreateBody(bodyDef)
  boxBody.SetPositionXY(x * __phyicsScale, y * __phyicsScale)
  fixtureDef.friction = friction
  fixtureDef.restitution = 0.7
  fixtureDef.density = density
  const templateRect = new PolygonShape().SetAsBox(
    width * 0.5 * __phyicsScale,
    height * 0.5 * __phyicsScale
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
  const circle = new CircleShape(radius * __phyicsScale)
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  fixtureDef.shape = circle
  fixtureDef.density = 1
  fixtureDef.friction = 0.2
  fixtureDef.restitution = 0.7
  bodyDef.type = BodyType.dynamicBody
  const circleBody = world.CreateBody(bodyDef)
  circleBody.SetPositionXY(x * __phyicsScale, y * __phyicsScale)
  circleBody.CreateFixture(fixtureDef)
  return circleBody
}
