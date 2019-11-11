import { Vector2 } from 'three'
import CharacterGamePadController from '~/controllers/CharacterGamePadController'
import CharacterKeyboardController from '~/controllers/CharacterKeyboardController'
import ICharacterController from '~/controllers/ICharacterController'
import { makeWobblyCircleShapePath } from '~/factories/shapePaths'
import { rigToGamePad } from '~/helpers/utils/gamePad'
import { rigToKeyboard } from '~/input/getKeyboardInput'
import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import AvatarContactListener from '~/physics/AvatarContactListener'
import makePolygonPhysics from '~/physics/makePolygonPhysics'
import PhysicsCharacter from '~/physics/PhysicsCharacter'
import { BodyType } from '~/vendor/Box2D/Box2D'

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

    const wobblyCircleVerts = makeWobblyCircleShapePath(0.1, 0.25, 40, 6)
    makePolygonPhysics(
      this.myB2World,
      wobblyCircleVerts,
      BodyType.staticBody,
      new Vector2(-0.5, 0)
    )
    makePolygonPhysics(
      this.myB2World,
      wobblyCircleVerts,
      BodyType.staticBody,
      new Vector2(-1, 0)
    )
  }
  update(dt: number) {
    super.update(dt) //does actual physics
    for (const pu of this.postUpdates) {
      pu()
    }
  }
}
