import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import { __physicsScale } from '~/settings/physics'

import TestCharacterInputScene from './TestCharacterControl'

export default class TestWebRTCScene extends TestCharacterInputScene {
  protected postUpdates: Array<() => void> = []
  constructor() {
    super()

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true
  }
  update(dt: number) {
    super.update(dt) //does actual physics
    for (const pu of this.postUpdates) {
      pu()
    }
  }
}
