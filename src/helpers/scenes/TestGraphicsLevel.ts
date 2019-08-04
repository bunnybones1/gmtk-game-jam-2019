import { WebGLRenderer } from 'three'
import KeyboardInput from '~/input/KeyboardInput'

import ProceduralKeyboardMesh from '../../meshes/ProceduralKeyboardMesh'

import TestLightingScene from './TestLighting'

export default class TestGraphicsLevelScene extends TestLightingScene {
  constructor() {
    super(false)
    const keyboardMesh = new ProceduralKeyboardMesh()
    const keyboardInput = new KeyboardInput()
    keyboardInput.addListener(keyboardMesh.onKeyCodeEvent)
    this.scene.add(keyboardMesh)
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
