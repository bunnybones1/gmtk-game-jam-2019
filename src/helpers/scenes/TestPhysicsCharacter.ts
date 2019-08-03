import TestPhysicsPNGScene from './TestPhysicsPNG'

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private character: Body
  constructor() {
    super('test-run', 0)
    const character = this.createBox(0, 0.05, 0.005, 0.004)
  }
}
