import { PerspectiveCamera, WebGLRenderer } from 'three'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'

import { BaseTestScene } from './BaseTestScene'

export default class TestTextScene extends BaseTestScene {
  constructor() {
    super()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    this.scene.add(new TextMesh('Hello World!'))
    const title = new TextMesh('ANY KEY', textSettings.title)
    this.scene.add(title)

    const keys = new TextMesh('Q W E R T Y', textSettings.keyLabel)
    keys.position.y = -0.04
    this.scene.add(keys)

    const keys2 = new TextMesh('← ↑ → ↓ ⇧', textSettings.keyLabel)
    keys2.position.y = -0.05
    this.scene.add(keys2)

    const init = async () => {
      //
    }
    init()
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
