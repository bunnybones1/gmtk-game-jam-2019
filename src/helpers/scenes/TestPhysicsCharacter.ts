import CharacterKeyboardController from '~/controllers/CharacterKeyboardController'
import device from '~/device'
import getKeyboardInput from '~/input/getKeyboardInput'
import AvatarContactListener from '~/physics/AvatarContactListener'
import PhysicsCharacter from '~/physics/PhysicsCharacter'

import TestPhysicsPNGScene from './TestPhysicsPNG'

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private character: PhysicsCharacter
  constructor() {
    super('test-run', 0, () => {
      console.log('level ready')
    })
    const acl = new AvatarContactListener()
    this.myB2World.SetContactListener(acl)
    const c = new CharacterKeyboardController(getKeyboardInput())
    this.character = new PhysicsCharacter(this.myB2World, acl, c)
  }
  update(dt: number) {
    const char = this.character
    const pos = char.avatarBody.GetPosition()
    this.b2Preview.offset.Set(pos.x / device.aspect, pos.y)
    super.update(dt) //does actual physics
    char.postPhysicsUpdate()
  }
}
