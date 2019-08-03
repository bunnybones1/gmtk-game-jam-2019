import {
  BoxBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneBufferGeometry,
  SphereBufferGeometry,
  WebGLRenderer
} from 'three'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'
import {
  BodyDef,
  BodyType,
  CircleShape,
  FixtureDef,
  PolygonShape,
  Vec2,
  World
} from '~/vendor/Box2D/Box2D'

import { addPrettyLights } from '../utils/lights'

import { BaseTestScene } from './BaseTestScene'

export default class TestLightingScene extends BaseTestScene {
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

    addPrettyLights(this.scene, this.bgColor)
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }
    const init = async () => {
      const unitSize = 0.06
      const radius = unitSize * 0.5
      const basicMaterial = new MeshStandardMaterial({
        color: 0xaaddee,
        roughness: 0.7
      })
      const floor = new Mesh(new PlaneBufferGeometry(1, 1, 1, 1), basicMaterial)
      floor.castShadow = false
      floor.receiveShadow = true
      this.scene.add(floor)
      floor.rotation.x = Math.PI * -0.5
      const sphere = new Mesh(
        new SphereBufferGeometry(radius, 32, 16),
        basicMaterial
      )
      sphere.castShadow = true
      sphere.receiveShadow = true
      sphere.position.x = -unitSize * 0.5
      sphere.position.y = radius
      sphere.name = 'Sphere'
      this.scene.add(sphere)
      const box = new Mesh(
        new BoxBufferGeometry(unitSize, unitSize, unitSize),
        basicMaterial
      )
      box.castShadow = true
      box.receiveShadow = true
      box.position.x = unitSize * 0.5
      box.position.y = radius
      box.name = 'Cube'
      this.scene.add(box)
    }
    init()
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
