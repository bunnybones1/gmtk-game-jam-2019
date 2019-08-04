import { Mesh, WebGLRenderer } from 'three'
import KeyboardInput from '~/input/KeyboardInput'
import { materialLibrary } from '~/materials/library'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import PNGLevel from '~/PNGLevel'
import { __pixelSizeMeters } from '~/settings/physics'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'
import { getUrlParam } from '~/utils/location'
import { createPhysicBoxFromPixels } from '~/utils/physics'
import { Vec2, World } from '~/vendor/Box2D/Box2D'

import ProceduralKeyboardMesh from '../../meshes/ProceduralKeyboardMesh'

import TestLightingScene from './TestLighting'

export default class TestGraphicsLevelScene extends TestLightingScene {
  protected b2Preview: Box2DPreviewMesh
  protected myB2World: World
  constructor(defaultLevel = 'test-layout', showKeyboard = true) {
    super(false, false)
    const myB2World = new World(new Vec2(0, -9.8))
    const b2Preview = new Box2DPreviewMesh(myB2World)

    this.myB2World = myB2World
    this.b2Preview = b2Preview

    this.scene.add(b2Preview)

    new PNGLevel(
      getUrlParam('level') || defaultLevel,
      (x: number, y: number, width: number, height: number) => {
        createPhysicBoxFromPixels(myB2World, x, y, width, height)
        const depth = (width + height) * 0.5 * __pixelSizeMeters
        if (y + height >= 32) {
          height += 100
        }
        const mesh = new Mesh(
          getCachedChamferedBoxGeometry(
            width * __pixelSizeMeters,
            height * __pixelSizeMeters,
            depth,
            0.001
          ),
          materialLibrary.levelMaterial
        )
        mesh.receiveShadow = true
        mesh.castShadow = true
        mesh.position.set(
          -0.2 + (x - width * 0.5) * __pixelSizeMeters,
          0.2 - (y + height * 0.5) * __pixelSizeMeters,
          0
        )
        this.scene.add(mesh)
      },
      () => {
        if (showKeyboard) {
          const keyboardMesh = new ProceduralKeyboardMesh()
          const keyboardInput = new KeyboardInput()
          keyboardInput.addListener(keyboardMesh.onKeyCodeEvent)
          // keyboardMesh.scale.multiplyScalar(0.3)
          keyboardMesh.position.set(-0, 0.162, 0)
          this.scene.add(keyboardMesh)
        }
      }
    )
  }
  update(dt: number) {
    super.update(dt)
    this.myB2World.Step(dt, 10, 4)
    this.b2Preview.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
