import TestPhysicsPNGScene from './TestPhysicsPNG'

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private character: Body
  constructor() {
    super('test-run', 0)
    const character = this.createCircle(0, 0.1, 0.006)
  }
}
