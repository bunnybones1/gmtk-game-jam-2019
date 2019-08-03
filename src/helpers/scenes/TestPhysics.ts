import { WebGLRenderer } from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import { rand } from '~/utils/math'
import {
  Body,
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
  private circleBodies: Body[] = []
  constructor(testBox = true) {
    super()
    const myB2World = new World(new Vec2(0, -9.8))
    const b2Preview = new Box2DPreviewMesh(myB2World)
    this.scene.add(b2Preview)

    this.myB2World = myB2World
    this.b2Preview = b2Preview

    for (let i = 0; i < 20; i++) {
      this.createCircle()
    }

    if (testBox) {
      this.createStaticBox(0, 0, 0.3, 0.3)
    }
  }
  update(dt: number) {
    super.update(dt)
    this.myB2World.Step(dt, 4, 4)
    this.b2Preview.update(dt)
    for (const circleBody of this.circleBodies) {
      const p = circleBody.GetPosition()
      if (p.y < -1) {
        circleBody.SetLinearVelocity(new Vec2(0.0, 0.0))
        circleBody.SetPositionXY(rand(-0.1, 0.1), 0.6 + rand(-0.1, 0.1))
      }
    }
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
  protected createStaticBox(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const bodyDef = new BodyDef()
    const fixtureDef = new FixtureDef()
    bodyDef.fixedRotation = true
    bodyDef.type = BodyType.staticBody
    const borderBody = this.myB2World.CreateBody(bodyDef)
    borderBody.SetPositionXY(x, y)
    fixtureDef.friction = 0.1
    fixtureDef.restitution = 0.7
    const templateRect = new PolygonShape().SetAsBox(width, height)
    fixtureDef.shape = templateRect
    borderBody.CreateFixture(fixtureDef)
  }
  protected createCircle() {
    const circle = new CircleShape(0.05)
    const bodyDef = new BodyDef()
    const fixtureDef = new FixtureDef()
    fixtureDef.shape = circle
    fixtureDef.density = 1
    fixtureDef.friction = 0.2
    fixtureDef.restitution = 0.7
    bodyDef.type = BodyType.dynamicBody
    const circleBody = this.myB2World.CreateBody(bodyDef)
    circleBody.SetPositionXY(rand(-0.1, 0.1), 0.6 + rand(-0.1, 0.1))
    circleBody.CreateFixture(fixtureDef)
    this.circleBodies.push(circleBody)
  }
}
