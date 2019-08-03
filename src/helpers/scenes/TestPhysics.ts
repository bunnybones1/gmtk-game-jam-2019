import { WebGLRenderer } from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import { __phyicsScale } from '~/settings/physics'
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
  constructor(testBox = true, totalBalls = 20) {
    super()
    const myB2World = new World(new Vec2(0, -9.8))
    const b2Preview = new Box2DPreviewMesh(myB2World)
    this.scene.add(b2Preview)

    this.myB2World = myB2World
    this.b2Preview = b2Preview

    for (let i = 0; i < totalBalls; i++) {
      this.createCircle(rand(-0.1, 0.1), 0.1 + rand(-0.02, 0.02), 0.005)
    }

    if (testBox) {
      this.createBox(0, 0, 0.05, 0.05, true)
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
        circleBody.SetPositionXY(
          rand(-0.1, 0.1) * __phyicsScale,
          0.6 + rand(-0.1, 0.1) * __phyicsScale
        )
      }
    }
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
  protected createBox(
    x: number,
    y: number,
    width: number,
    height: number,
    staticBody = false
  ) {
    const bodyDef = new BodyDef()
    const fixtureDef = new FixtureDef()
    bodyDef.fixedRotation = true
    bodyDef.type = staticBody ? BodyType.staticBody : BodyType.dynamicBody
    const borderBody = this.myB2World.CreateBody(bodyDef)
    borderBody.SetPositionXY(x * __phyicsScale, y * __phyicsScale)
    fixtureDef.friction = 0.1
    fixtureDef.restitution = 0.7
    const templateRect = new PolygonShape().SetAsBox(
      width * __phyicsScale,
      height * __phyicsScale
    )
    fixtureDef.shape = templateRect
    borderBody.CreateFixture(fixtureDef)
  }
  protected createCircle(x: number, y: number, radius: number) {
    const circle = new CircleShape(radius * __phyicsScale)
    const bodyDef = new BodyDef()
    const fixtureDef = new FixtureDef()
    fixtureDef.shape = circle
    fixtureDef.density = 1
    fixtureDef.friction = 0.2
    fixtureDef.restitution = 0.7
    bodyDef.type = BodyType.dynamicBody
    const circleBody = this.myB2World.CreateBody(bodyDef)
    circleBody.SetPositionXY(x * __phyicsScale, y * __phyicsScale)
    circleBody.CreateFixture(fixtureDef)
    this.circleBodies.push(circleBody)
  }
}
