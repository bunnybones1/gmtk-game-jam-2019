import { Clock, Color, Vector3 } from 'three'

import { simpleTweener } from './animation/tweeners'
import { BaseTestScene } from './helpers/scenes/BaseTestScene'
import TestGamePadScene from './helpers/scenes/TestGamePad'
import TestGraphicsCharacterScene from './helpers/scenes/TestGraphicsCharacter'
import TestGraphicsLevelScene from './helpers/scenes/TestGraphicsLevel'
import TestKeyboardInputScene from './helpers/scenes/TestKeyboardInput'
import TestLightingScene from './helpers/scenes/TestLighting'
import TestPhysicsScene from './helpers/scenes/TestPhysics'
import TestPhysicsCharacterScene from './helpers/scenes/TestPhysicsCharacter'
import TestPhysicsPNGScene from './helpers/scenes/TestPhysicsPNG'
import TestStencilsScene from './helpers/scenes/TestStencils'
import TestTextScene from './helpers/scenes/TestText'
import renderer from './renderer'
import { timeUniform } from './uniforms'
import { cameraShaker } from './utils/cameraShaker'
import { getUrlParam } from './utils/location'
import { nextFrameUpdate } from './utils/onNextFrame'
import { taskTimer } from './utils/taskTimer'
import UpdateManager from './utils/UpdateManager'

document.addEventListener('gesturestart', e => e.preventDefault()) // disable zooming on mobile

const clock = new Clock()
renderer.setClearColor(new Color(0x344556), 1.0)
cameraShaker.camera.position.set(0, 0.5, 0.5)
cameraShaker.camera.lookAt(new Vector3())

const testClasses: { [K: string]: any } = {
  lighting: TestLightingScene,
  physics: TestPhysicsScene,
  physicsPNG: TestPhysicsPNGScene,
  physicsCharacter: TestPhysicsCharacterScene,
  gamePad: TestGamePadScene,
  keyboard: TestKeyboardInputScene,
  graphicsLevel: TestGraphicsLevelScene,
  graphicsCharacter: TestGraphicsCharacterScene,
  text: TestTextScene,
  stencils: TestStencilsScene
}

let TestClass: new () => BaseTestScene = TestLightingScene
const testParam = getUrlParam('test') || 'graphicsCharacter'
if (testClasses.hasOwnProperty(testParam)) {
  TestClass = testClasses[testParam]
}
const test: BaseTestScene = new TestClass()

const loop = () => {
  const dt = Math.min(clock.getDelta(), 0.1) * simpleTweener.speed

  nextFrameUpdate()
  simpleTweener.rafTick()
  UpdateManager.update(dt)
  taskTimer.update(dt)
  timeUniform.value += dt

  test.update(dt)
  test.render(renderer, dt)

  requestAnimationFrame(loop)
}

// Start loop
requestAnimationFrame(loop)
