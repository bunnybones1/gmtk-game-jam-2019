import { PerspectiveCamera, WebGLRenderer } from 'three'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'

import TestPhysicsScene from './TestPhysics'

export default class TestTextPhysicsScene extends TestPhysicsScene {
  constructor() {
    super()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    const s = 10

    const testCode = new TextMesh(
      [
        '/**',
        '* For the brave souls who get this far: You are the chosen ones,',
        '* the valiant knights of programming who toil away, without rest,',
        '* fixing our most awful code. To you, true saviors, kings of men,',
        '* I say this: never gonna give you up, never gonna let you down,',
        '* never gonna run around and desert you. Never gonna make you cry,',
        '* never gonna say goodbye. Never gonna tell a lie and hurt you.',
        '*/'
      ].join('\n'),
      textSettings.code
    )
    testCode.scale.multiplyScalar(s)
    testCode.position.x -= 2
    this.scene.add(testCode)

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
