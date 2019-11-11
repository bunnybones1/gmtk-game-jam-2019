import { Vector2 } from 'three'
import {
  createPhysicBox,
  deconstructConcavePath,
  makeBitMask
} from '~/utils/physics'
import {
  BodyDef,
  BodyType,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

const __origin = new Vector2()
export default function makePolygonPhysics(
  world: World,
  verts: Vector2[],
  type: BodyType = BodyType.staticBody,
  position = __origin
) {
  const bodyDef = new BodyDef()
  bodyDef.type = type
  const body = world.CreateBody(bodyDef)
  body.SetPositionXY(position.x, position.y)
  verts.forEach(v =>
    createPhysicBox(world, v.x + position.x, v.y + position.y, 0.002, 0.002)
  )
  const subVerts2 = deconstructConcavePath(verts)
  for (const subVerts of subVerts2) {
    if (subVerts.length < 3) {
      continue
    }
    // for (const v of subVerts) {
    //   createPhysicBox(
    //     world,
    //     v.x / __physicsScale,
    //     v.y / __physicsScale,
    //     0.004,
    //     0.004
    //   )
    // }
    const fixtureDef = new FixtureDef()
    const shape = new PolygonShape()
    shape.SetAsArray(subVerts)
    fixtureDef.shape = shape
    fixtureDef.filter.categoryBits = makeBitMask(['environment'])
    body.CreateFixture(fixtureDef)
  }
  // shape.SetAsBox(
  // 	0.01 * 0.5 * __physicsScale,
  // 	0.01 * 0.5 * __physicsScale
  // )

  // body.SetPositionXY(x * __physicsScale, y * __physicsScale)
  return body
}
