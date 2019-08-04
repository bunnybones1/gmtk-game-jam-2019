import { Mesh } from 'three'
import { materialLibrary } from '~/materials/library'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'

export default class KeyButtonMesh extends Mesh {
  constructor(
    width: number,
    height: number,
    depth: number,
    chamfer: number = 0.005
  ) {
    super(
      getCachedChamferedBoxGeometry(width, height, depth, chamfer),
      materialLibrary.keyboardPlasticKey
    )
    this.renderOrder = 200
    this.castShadow = true
    this.receiveShadow = true
  }
}
