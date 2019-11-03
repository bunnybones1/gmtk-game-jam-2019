import { WebGLRenderer } from 'three'
import getKeyboardInput from '~/input/getKeyboardInput'

import ProceduralKeyboardMesh from '../../meshes/ProceduralKeyboardMesh'

import TestLightingScene from './TestLighting'

export default class TestKeyboardInputScene extends TestLightingScene {
  constructor() {
    super(false)
    const keyboardMesh = new ProceduralKeyboardMesh()
    getKeyboardInput().addListener(keyboardMesh.onKeyCodeEvent)
    this.scene.add(keyboardMesh)
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
