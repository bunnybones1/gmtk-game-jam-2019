import { Mesh, SphereBufferGeometry } from 'three'
import { makeScoopMesh } from '~/helpers/utils/scoopMesh'
import { materialLibrary } from '~/materials/library'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'

export default class CharacterMesh extends Mesh {
  constructor(w: number, h: number) {
    super(
      getCachedChamferedBoxGeometry(w, h, w, 0.001),
      materialLibrary.keyboardPlasticKey
    )
    const w2 = w - 0.004
    const geo = new SphereBufferGeometry(0.0045, 16, 8)
    const posArr = geo.attributes.position.array as number[]
    for (let i = 1; i < posArr.length; i += 3) {
      if (posArr[i] < 0) {
        posArr[i] = 0
      }
    }
    const undersideMesh = new Mesh(
      geo,
      // getCachedChamferedBoxGeometry(w2, h2, w2, 0.0005),
      materialLibrary.keyboardPlasticKeyUnderside
    )
    // undersideMesh.castShadow = true
    undersideMesh.receiveShadow = true
    undersideMesh.renderOrder = 13
    undersideMesh.position.y = -h * 0.5 - 0.0001
    undersideMesh.rotation.y = (Math.PI * 2) / 32
    this.add(undersideMesh)
    makeScoopMesh(undersideMesh)

    // setInterval(() => {
    // 	mouthMesh.visible = !mouthMesh.visible
    // }, 300)

    const mouthGeo = getCachedChamferedBoxGeometry(w, 0.005, w2 - 0.001, 0.0005)

    const mouthMesh = new Mesh(
      mouthGeo,
      materialLibrary.keyboardPlasticKeyMouth
    )
    mouthMesh.renderOrder = 11

    // mouthMesh.position.x += 0.0045
    // this.add(mouthMesh)
    // makeScoopMesh(mouthMesh)

    this.castShadow = true
    this.receiveShadow = true
  }
}
