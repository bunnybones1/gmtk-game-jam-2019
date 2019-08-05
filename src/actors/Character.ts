import { Mesh, Object3D } from 'three'
import { materialLibrary } from '~/materials/library'
import CharacterPhysics from '~/physics/CharacterPhysics'
import { __physicsScale } from '~/settings/physics'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'
import { World } from '~/vendor/Box2D/Box2D'

export default class Character {
  visuals: Object3D
  private physics: CharacterPhysics
  private torsoMesh: Mesh
  constructor(world: World) {
    this.physics = new CharacterPhysics(world)
    const s = this.physics.bodySize
    const o = this.physics.bodyOffset
    const visuals = new Object3D()
    const padding = 0.003
    const w = s.x + padding
    const h = s.y + padding
    const torsoMesh = new Mesh(
      getCachedChamferedBoxGeometry(w, h, w, 0.001),
      materialLibrary.keyboardPlasticKey
    )
    const w2 = w - 0.002
    const undersideMesh = new Mesh(
      getCachedChamferedBoxGeometry(w2, 0.002, w2, 0.0005),
      materialLibrary.keyboardPlasticKeyUnderside
    )
    undersideMesh.position.y = -0.0045
    torsoMesh.add(undersideMesh)
    // const mouthMesh = new Mesh(
    // 	getCachedChamferedBoxGeometry(
    //     w * 0.5,
    //     0.006,
    //     w - 0.002,
    //     0.0015
    //   ),
    //   materialLibrary.keyboardPlasticKeyMouth
    // )
    // mouthMesh.position.x += 0.0045
    // torsoMesh.add(mouthMesh)

    torsoMesh.castShadow = true
    torsoMesh.receiveShadow = true
    torsoMesh.position.set(o.x, o.y, 0)
    visuals.add(torsoMesh)
    this.torsoMesh = torsoMesh
    this.visuals = visuals
  }
  update(dt: number) {
    const char = this.physics
    char.update(dt)
    let pos = char.body.GetPosition()
    pos = char.body.GetPosition()
    this.visuals.position.set(pos.x / __physicsScale, pos.y / __physicsScale, 0)
    this.visuals.position.x -= 0.12
    this.visuals.position.y += 0.158
    this.visuals.rotation.z = this.physics.body.GetAngle()
    const s = this.physics.bodySize
    const ds = this.physics.defaultBodySize
    const w = s.x / ds.x
    const h = s.y / ds.y
    this.torsoMesh.scale.set(w, h, w)

    const o = this.physics.bodyOffset
    this.torsoMesh.position.set(o.x, o.y, 0)
  }
}
