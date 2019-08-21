import { Mesh, Object3D } from 'three'
import CharacterMesh from '~/meshes/CharacterMesh'
import CharacterPhysics, { SensorCallback } from '~/physics/CharacterPhysics'
import { __physicsScale } from '~/settings/physics'
import { World } from '~/vendor/Box2D/Box2D'

export default class Character {
  visuals: Object3D
  private _physics: CharacterPhysics
  get physics(): CharacterPhysics {
    return this._physics
  }
  private torsoMesh: Mesh
  constructor(
    world: World,
    label: string = '',
    sensorCallback?: SensorCallback
  ) {
    this._physics = new CharacterPhysics(world, sensorCallback)
    const s = this._physics.bodySize
    const o = this._physics.bodyOffset
    const visuals = new Object3D()
    const padding = 0.0027
    const w = s.x + padding
    const h = s.y + padding
    const torsoMesh = new CharacterMesh(w, h, label)
    torsoMesh.position.set(o.x, o.y, 0)
    visuals.add(torsoMesh)
    this.torsoMesh = torsoMesh
    this.visuals = visuals
  }
  update(dt: number) {
    const char = this._physics
    char.update(dt)
    let pos = char.body.GetPosition()
    pos = char.body.GetPosition()
    this.visuals.position.set(pos.x / __physicsScale, pos.y / __physicsScale, 0)
    this.visuals.position.x -= 0.12
    this.visuals.position.y += 0.158
    this.visuals.rotation.z = this._physics.body.GetAngle()
    const s = this._physics.bodySize
    const ds = this._physics.defaultBodySize
    const w = s.x / ds.x
    const h = s.y / ds.y
    this.torsoMesh.scale.set(w, h, w)

    const o = this._physics.bodyOffset
    this.torsoMesh.position.set(o.x, o.y, 0)
  }
}
