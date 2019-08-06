import CharacterMesh from '~/meshes/CharacterMesh'

import TestLightingScene from './TestLighting'

export default class TestStencilsScene extends TestLightingScene {
  constructor() {
    super()
    const characterMesh = new CharacterMesh(0.013, 0.012)
    characterMesh.rotation.y += Math.PI * -0.15
    characterMesh.position.set(0, 0.15, 0.3)
    this.scene.add(characterMesh)
  }
}
