import { Vector2 } from 'three'
import CharacterGamePadController from '~/controllers/CharacterGamePadController'
import CharacterKeyboardController from '~/controllers/CharacterKeyboardController'
import ICharacterController from '~/controllers/ICharacterController'
import device from '~/device'
import { makeWobblyCircleShapePath } from '~/factories/shapePaths'
import { rigToGamePad } from '~/helpers/utils/gamePad'
import { rigToKeyboard } from '~/input/getKeyboardInput'
import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import AvatarContactListener from '~/physics/AvatarContactListener'
import makePolygonPhysics from '~/physics/makePolygonPhysics'
import PhysicsCharacter from '~/physics/PhysicsCharacter'
import {
  createPhysicBox,
  deconstructConcavePath2,
  deconstructConcavePath3
} from '~/utils/physics'
import { BodyType, Vec2 } from '~/vendor/Box2D/Box2D'

import TestPhysicsScene from './TestPhysics'

export default class TestCharacterControlScene extends TestPhysicsScene {
  protected postUpdates: Array<(dt: number) => void> = []
  private firstCharacter: PhysicsCharacter | undefined
  constructor() {
    super(false, 20, false)

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
      if (!this.firstCharacter) {
        this.firstCharacter = pChar
      }
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

    for (let i = 0; i < 10; i++) {
      createPhysicBox(this.myB2World, i - 5, -0.3, 0.5, 0.1)
    }

    //for (let i = 0; i < totalEnemies; i++) {
    //  const circleBody = createPhysicsCircle(
    //    this.myB2World,
    //    rand(-1, 1),
    //    1 + rand(-0.2, 0.2),
    //    0.05,
    //    enemiesSelfCollide
    //  )
    //  this.circleBodies.push(circleBody)
    //}

    /*
    const wobblyCircleVerts = makeWobblyCircleShapePath(0.1, 0.25, 40, 6)
    makePolygonPhysics(
      this.myB2World,
      wobblyCircleVerts,
      BodyType.staticBody,
      new Vector2(-0.5, 0),
      deconstructConcavePath2
    )

    const testShape = makeWobblyCircleShapePath(0.2, 0.125, 12, 3, 0.25)
    const pos = new Vector2(-1, 0)
    for (const v of testShape) {
      createPhysicBox(this.myB2World, v.x + pos.x, v.y + pos.y, 0.04, 0.04)
    }
    makePolygonPhysics(
      this.myB2World,
      testShape,
      BodyType.staticBody,
      pos,
      deconstructConcavePath3
    )
    */
  }

  update(dt: number) {
    if (this.firstCharacter) {
      this.b2Preview.offset.Copy(this.firstCharacter.avatarBody.GetPosition())
    }
    super.update(dt) //does actual physics
    for (const pu of this.postUpdates) {
      pu(dt)
    }
  }
}
