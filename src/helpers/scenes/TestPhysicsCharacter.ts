import device from '~/device'
import { __phyicsScale } from '~/settings/physics'
import { Body, Vec2 } from '~/vendor/Box2D/Box2D'

import TestPhysicsPNGScene from './TestPhysicsPNG'

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private character: Body
  constructor() {
    super('test-run', 20)
    const character = this.createBox(0, 0.05, 0.005, 0.004, false, 0.005)
    this.character = character
    this.character.ApplyLinearImpulseToCenter(new Vec2(0.01, 0), true)
  }
  update(dt: number) {
    if (this.character.GetPosition().y < -1) {
      this.character.SetLinearVelocity(new Vec2(0.0, 0.0))
      this.character.SetPositionXY(0 * __phyicsScale, 0.05 * __phyicsScale)
    }
    const pos = this.character.GetPosition()
    pos.x /= device.aspect
    this.b2Preview.offset.Copy(pos)
    super.update(dt) //does actual physics
  }
}
