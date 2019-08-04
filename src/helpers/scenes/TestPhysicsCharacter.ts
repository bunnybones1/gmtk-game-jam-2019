import device from '~/device'
import CharacterPhysics from '~/physics/CharacterPhysics'
import { __phyicsScale } from '~/settings/physics'

import TestPhysicsPNGScene from './TestPhysicsPNG'

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private character: CharacterPhysics
  constructor() {
    super('test-run', 0, () => {
      console.log('level ready')
    })

    this.character = new CharacterPhysics(this.myB2World)
  }
  update(dt: number) {
    const char = this.character
    char.update(dt)
    const pos = char.body.GetPosition()
    this.b2Preview.offset.Set(pos.x / device.aspect, pos.y)
    super.update(dt) //does actual physics
  }
}
