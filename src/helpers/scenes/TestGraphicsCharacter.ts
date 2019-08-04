import { Mesh, Object3D } from 'three'
import device from '~/device'
import { materialLibrary } from '~/materials/library'
import CharacterPhysics from '~/physics/CharacterPhysics'
import { __physicsScale, __pixelSizeMeters } from '~/settings/physics'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'
import { lerp } from '~/utils/math'

import TestGraphicsLevelScene from './TestGraphicsLevel'

export default class TestGraphicsCharacterScene extends TestGraphicsLevelScene {
  private character: CharacterPhysics
  private characterBase: Object3D
  private torsoMesh: Mesh
  constructor() {
    super('test-layout', false)
    this.character = new CharacterPhysics(this.myB2World)
    const s = this.character.bodySize
    const o = this.character.bodyOffset
    const characterBase = new Object3D()
    const torsoMesh = new Mesh(
      getCachedChamferedBoxGeometry(
        s.x + 0.003,
        s.y + 0.003,
        s.x + 0.003,
        0.001
      ),
      materialLibrary.keyboardPlasticKey
    )
    torsoMesh.castShadow = true
    torsoMesh.receiveShadow = true
    torsoMesh.position.set(o.x, o.y, 0)
    characterBase.add(torsoMesh)
    this.scene.add(characterBase)
    this.torsoMesh = torsoMesh
    this.characterBase = characterBase
  }
  update(dt: number) {
    const char = this.character
    char.update(dt)
    let pos = char.body.GetPosition()
    this.b2Preview.offset.Set(pos.x / device.aspect, pos.y)
    super.update(dt) //does actual physics
    pos = char.body.GetPosition()
    this.characterBase.position.set(
      pos.x / __physicsScale,
      pos.y / __physicsScale,
      0
    )
    this.characterBase.position.x -= 0.12
    this.characterBase.position.y += 0.158
    this.characterBase.rotation.z = this.character.body.GetAngle()
    const s = this.character.bodySize
    const ds = this.character.defaultBodySize
    const w = s.x / ds.x
    const h = s.y / ds.y
    this.torsoMesh.scale.set(w, h, w)

    const o = this.character.bodyOffset
    this.torsoMesh.position.set(o.x, o.y, 0)

    const camPos = this.camera.position
    const newCamPos = this.characterBase.position.clone()
    newCamPos.x += 0.04 * 0.7
    newCamPos.y += 0.15 * 0.7
    newCamPos.z += 0.35 * 0.7
    newCamPos.y = Math.max(0, newCamPos.y)
    this.camera.position.x = lerp(camPos.x, newCamPos.x, 0.1)
    this.camera.position.y = lerp(camPos.y, newCamPos.y, 0.01)
    this.camera.position.z = newCamPos.z
    const backupAngle = this.camera.quaternion.clone()
    const lookAt = this.characterBase.position.clone()
    lookAt.x += 0.04
    this.camera.lookAt(lookAt)
    this.camera.quaternion.slerp(backupAngle, 0.99)
    this.sunLight.position.x = this.camera.position.x + 0.2
    this.sunLight.target.position.x = this.camera.position.x
    this.sunLight.target.updateMatrixWorld(true)
    this.sunLight.updateMatrixWorld(true)
  }
}
