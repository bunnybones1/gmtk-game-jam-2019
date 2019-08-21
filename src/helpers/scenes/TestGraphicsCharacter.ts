import { Vector3 } from 'three'
import Character from '~/actors/Character'
import { __physicsScale, __pixelSizeMeters } from '~/settings/physics'
import { getUrlInt } from '~/utils/location'
import { lerp } from '~/utils/math'

import TestGraphicsLevelScene from './TestGraphicsLevel'

export default class TestGraphicsCharacterScene extends TestGraphicsLevelScene {
  protected characters: Character[] = []
  constructor() {
    super('test-layout')
    for (let i = 0; i < getUrlInt('characters', 1, 1, 40); i++) {
      const character = new Character(
        this.myB2World,
        '',
        (sensor, rigidBody) => {
          const pos = sensor.GetBody().GetPosition()
          character.physics.startX = pos.x / __physicsScale
          character.physics.startY = pos.y / __physicsScale
        }
      )
      this.characters.push(character)
      this.scene.add(character.visuals)
    }
  }
  update(dt: number) {
    const camTarget = this.characters.length
      ? this.getCharactersPosition()
      : this.keyboardMesh.position
    super.update(dt)
    for (const character of this.characters) {
      character.update(dt)
    }

    const camPos = this.camera.position
    const newCamPos = camTarget.clone()
    newCamPos.x += 0.04 * 0.7
    newCamPos.y += 0.15 * 0.7
    newCamPos.z += 0.35 * 0.7
    newCamPos.y = Math.max(0, newCamPos.y)
    this.camera.position.x = lerp(camPos.x, newCamPos.x, 0.1)
    this.camera.position.y = lerp(camPos.y, newCamPos.y, 0.01)
    this.camera.position.z = newCamPos.z
    const backupAngle = this.camera.quaternion.clone()
    const lookAt = camTarget.clone()
    lookAt.x += 0.04
    this.camera.lookAt(lookAt)
    this.camera.quaternion.slerp(backupAngle, 0.99)
    this.sunLight.position.x = this.camera.position.x + 0.2
    this.sunLight.target.position.x = this.camera.position.x
    this.sunLight.target.updateMatrixWorld(true)
    this.sunLight.updateMatrixWorld(true)
  }
  private getCharactersPosition() {
    const pos = new Vector3()
    for (const character of this.characters) {
      pos.add(character.visuals.position)
    }
    pos.multiplyScalar(1 / this.characters.length)
    return pos
  }
}
