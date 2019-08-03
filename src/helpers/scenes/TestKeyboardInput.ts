import { WebGLRenderer } from 'three'

import ProceduralKeyboardMesh from '../../meshes/ProceduralKeyboardMesh'

import TestLightingScene from './TestLighting'

export default class TestKeyboardInputScene extends TestLightingScene {
  constructor() {
    super(false)
    const keyboard = new ProceduralKeyboardMesh()
    this.scene.add(keyboard)
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
