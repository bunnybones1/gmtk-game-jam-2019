import Character from '~/actors/Character'
import { __physicsScale, __pixelSizeMeters } from '~/settings/physics'
import { lerp } from '~/utils/math'

import TestGraphicsLevelScene from './TestGraphicsLevel'

export default class TestGraphicsCharacterScene extends TestGraphicsLevelScene {
  protected character: Character
  constructor() {
    super('test-layout', false)
    const character = new Character(this.myB2World)
    this.character = character
    this.scene.add(character.visuals)
  }
  update(dt: number) {
    super.update(dt)
    const char = this.character
    char.update(dt)

    const camPos = this.camera.position
    const newCamPos = char.visuals.position.clone()
    newCamPos.x += 0.04 * 0.7
    newCamPos.y += 0.15 * 0.7
    newCamPos.z += 0.35 * 0.7
    newCamPos.y = Math.max(0, newCamPos.y)
    this.camera.position.x = lerp(camPos.x, newCamPos.x, 0.1)
    this.camera.position.y = lerp(camPos.y, newCamPos.y, 0.01)
    this.camera.position.z = newCamPos.z
    const backupAngle = this.camera.quaternion.clone()
    const lookAt = char.visuals.position.clone()
    lookAt.x += 0.04
    this.camera.lookAt(lookAt)
    this.camera.quaternion.slerp(backupAngle, 0.99)
    this.sunLight.position.x = this.camera.position.x + 0.2
    this.sunLight.target.position.x = this.camera.position.x
    this.sunLight.target.updateMatrixWorld(true)
    this.sunLight.updateMatrixWorld(true)
  }
}
