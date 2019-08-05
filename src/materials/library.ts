import { BackSide, GreaterDepth, Material, MeshStandardMaterial } from 'three'

class MaterialLibrary {
  private _keyboardPlasticKey: Material | undefined
  get keyboardPlasticKey() {
    if (!this._keyboardPlasticKey) {
      this._keyboardPlasticKey = new MeshStandardMaterial({
        color: 0xeeddaa
      })
    }
    return this._keyboardPlasticKey
  }
  private _keyboardPlasticKeyMouth: Material | undefined
  get keyboardPlasticKeyMouth() {
    if (!this._keyboardPlasticKeyMouth) {
      this._keyboardPlasticKeyMouth = new MeshStandardMaterial({
        color: 0x221111,
        depthFunc: GreaterDepth,
        side: BackSide
      })
    }
    return this._keyboardPlasticKeyMouth
  }
  private _keyboardPlasticKeyUnderside: Material | undefined
  get keyboardPlasticKeyUnderside() {
    if (!this._keyboardPlasticKeyUnderside) {
      this._keyboardPlasticKeyUnderside = new MeshStandardMaterial({
        color: 0x070707
      })
    }
    return this._keyboardPlasticKeyUnderside
  }
  private _keyboardPlastic: Material | undefined
  get keyboardPlastic() {
    if (!this._keyboardPlastic) {
      this._keyboardPlastic = new MeshStandardMaterial({
        color: 0xaa9999
      })
    }
    return this._keyboardPlastic
  }
  private _keyboardPlasticHole: Material | undefined
  get keyboardPlasticHole() {
    if (!this._keyboardPlasticHole) {
      this._keyboardPlasticHole = new MeshStandardMaterial({
        color: 0x554444,
        depthFunc: GreaterDepth,
        side: BackSide
      })
    }
    return this._keyboardPlasticHole
  }
  private _levelMaterial: Material | undefined
  get levelMaterial() {
    if (!this._levelMaterial) {
      this._levelMaterial = new MeshStandardMaterial({
        color: 0x112233
      })
    }
    return this._levelMaterial
  }
}
export const materialLibrary = new MaterialLibrary()
