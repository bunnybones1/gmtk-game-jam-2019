import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import { createPhysicBox } from '~/utils/physics'

import { startControllableCharacters } from './TestCharacterControl'
import TestPhysicsScene from './TestPhysics'
import { runTextPhysicsTest } from './TestTextPhysics'

export default class TestCharacterControlOnTextScene extends TestPhysicsScene {
  private _postUpdate: (dt: number) => void
  constructor() {
    super(false, 20, false)

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true

    for (let i = 0; i < 10; i++) {
      createPhysicBox(this.myB2World, i - 5, -0.3, 0.5, 0.1)
    }

    this._postUpdate = startControllableCharacters(
      this.myB2World,
      this.b2Preview
    )
    runTextPhysicsTest(this.scene, this.myB2World)
  }

  update(dt: number) {
    super.update(dt) //does actual physics
    this._postUpdate(dt)
  }
}
