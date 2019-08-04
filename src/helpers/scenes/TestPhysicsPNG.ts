import PNGLevel from '~/PNGLevel'
import { __pixelSizeMeters, __pixelSizePhysics } from '~/settings/physics'
import { getUrlParam } from '~/utils/location'
import { createPhysicBox } from '~/utils/physics'

import TestPhysicsScene from './TestPhysics'

export default class TestPhysicsPNGScene extends TestPhysicsScene {
  constructor(
    defaultLevel = 'test',
    totalBalls = 20,
    onLevelReady: () => void
  ) {
    super(false, totalBalls)
    const offsetX = -16
    const offsetY = 8
    new PNGLevel(
      getUrlParam('level') || defaultLevel,
      (x: number, y: number, width: number, height: number) => {
        createPhysicBox(
          this.myB2World,
          (x + offsetX - width * 0.5) * __pixelSizeMeters,
          (-y + offsetY - height * 0.5) * __pixelSizeMeters,
          width * __pixelSizeMeters,
          height * __pixelSizeMeters,
          true
        )
      },
      onLevelReady
    )
  }
}
