import {
  WebGLRenderer
} from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import {
  BodyDef,
  BodyType,
  CircleShape,
  FixtureDef,
  PolygonShape,
  Vec2,
  World
} from '~/vendor/Box2D/Box2D'

import { BaseTestScene } from './BaseTestScene'

export default class TestPhysicsScene extends BaseTestScene {
  private b2Preview: Box2DPreviewMesh
  private myB2World: World
  constructor() {
    super()
    const myB2World = new World(new Vec2(0, -9.8))

    const bodyDef = new BodyDef()
    const fixtureDef = new FixtureDef()

    bodyDef.fixedRotation = true
    bodyDef.type = BodyType.staticBody
    const borderBody = myB2World.CreateBody(bodyDef)
    fixtureDef.friction = 0.1
    fixtureDef.restitution = 0.7
    const templateRect = new PolygonShape().SetAsBox(0.3, 0.3)
    fixtureDef.shape = templateRect
    borderBody.CreateFixture(fixtureDef)

    const b2Preview = new Box2DPreviewMesh(myB2World)
    this.scene.add(b2Preview)

    const circle = new CircleShape(0.05)
    circle.m_p.Set(0, 0.6)
    fixtureDef.shape = circle
    fixtureDef.density = 1
    fixtureDef.friction = 0.2
    fixtureDef.restitution = 0.7
    bodyDef.type = BodyType.dynamicBody
    const fingerBody = myB2World.CreateBody(bodyDef)
    fingerBody.CreateFixture(fixtureDef)

    this.myB2World = myB2World
    this.b2Preview = b2Preview
  }
  update(dt: number) {
    super.update(dt)
    this.myB2World.Step(dt, 4, 4)
    this.b2Preview.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
