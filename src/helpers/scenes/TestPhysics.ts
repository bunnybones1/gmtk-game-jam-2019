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
  protected b2Preview: Box2DPreviewMesh
  protected myB2World: World
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
      this.createBox(0, 0, 0.1, 0.1, true)
    }
  }
  update(dt: number) {
    super.update(dt)
    this.myB2World.Step(dt, 10, 4)
    this.b2Preview.update(dt)
    for (const circleBody of this.circleBodies) {
      const p = circleBody.GetPosition()
      if (p.y < -1) {
        circleBody.SetLinearVelocity(new Vec2(0.0, 0.0))
        circleBody.SetPositionXY(
          rand(-0.1, 0.1) * __phyicsScale,
          (0.1 + rand(-0.02, 0.02)) * __phyicsScale
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
    staticBody = false,
    friction = 0.1,
    density = 1
  ) {
    const bodyDef = new BodyDef()
    const fixtureDef = new FixtureDef()
    bodyDef.fixedRotation = false
    bodyDef.type = staticBody ? BodyType.staticBody : BodyType.dynamicBody
    const boxBody = this.myB2World.CreateBody(bodyDef)
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
    return circleBody
  }
}
