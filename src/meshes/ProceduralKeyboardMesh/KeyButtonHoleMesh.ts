import { Mesh } from 'three'
import { materialLibrary } from '~/materials/library'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'

export default class KeyButtonHoleMesh extends Mesh {
  constructor(
    width: number,
    height: number,
    depth: number,
    chamfer: number = 0.005
  ) {
    super(
      getCachedChamferedBoxGeometry(
        width + 0.001,
        height,
        depth + 0.001,
        chamfer * 2
      ),
      materialLibrary.keyboardPlasticHole
    )
    this.renderOrder = 100
  }
}