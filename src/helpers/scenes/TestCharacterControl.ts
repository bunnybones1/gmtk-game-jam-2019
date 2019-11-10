import CharacterGamePadController from '~/controllers/CharacterGamePadController'
import CharacterKeyboardController from '~/controllers/CharacterKeyboardController'
import ICharacterController from '~/controllers/ICharacterController'
import { rigToGamePad } from '~/helpers/utils/gamePad'
import { rigToKeyboard } from '~/input/getKeyboardInput'
import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import AvatarContactListener from '~/physics/AvatarContactListener'
import makePolygonPhysics from '~/physics/makePolygonPhysics'
import PhysicsCharacter from '~/physics/PhysicsCharacter'
import { __physicsScale } from '~/settings/physics'

import TestPhysicsScene from './TestPhysics'

export default class TestCharacterControlScene extends TestPhysicsScene {
  protected postUpdates: Array<() => void> = []
  constructor() {
    super(true, 20, false)

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true

    const avatarContactListener = new AvatarContactListener()
    this.myB2World.SetContactListener(avatarContactListener)

    const makeCharacter = (controller: ICharacterController) => {
      const pChar = new PhysicsCharacter(
        this.myB2World,
        avatarContactListener,
        controller
      )
      this.postUpdates.push(pChar.postPhysicsUpdate.bind(pChar))
    }

    rigToGamePad(gamePadAPI =>
      makeCharacter(new CharacterGamePadController(gamePadAPI))
    )

    // hacky way of testing two characters on a keyboard
    // rigToKeyboard(keyboardAPI => {
    //   makeCharacter(new CharacterKeyboardController(keyboardAPI))
    //   makeCharacter(new CharacterKeyboardController(keyboardAPI, true))
    // })

    rigToKeyboard(keyboardAPI =>
      makeCharacter(new CharacterKeyboardController(keyboardAPI))
    )

    makePolygonPhysics(this.myB2World)
  }
  update(dt: number) {
    super.update(dt) //does actual physics
    for (const pu of this.postUpdates) {
      pu()
    }
  }
}
