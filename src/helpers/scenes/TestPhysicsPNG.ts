import { __pixelSizeMeters, __pixelSizePhysics } from '~/settings/physics'
import { getUrlParam } from '~/utils/location'

import TestPhysicsScene from './TestPhysics'

export default class TestPhysicsPNGScene extends TestPhysicsScene {
  constructor(defaultLevel = 'test', totalBalls = 20) {
    super(false, totalBalls)
    const img = new Image()
    img.onload = imageEvent => {
      const canvas = document.createElement('canvas')
      const width = img.width
      const height = img.height
      const offsetX = -16
      const offsetY = 8
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')!
      context.drawImage(img, 0, 0, width, height)
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data
      let accumilator = 0
      for (let i = 0; i < data.length; i++) {
        let build = false
        if (data[i * 4 + 3] > 128) {
          accumilator++
        } else {
          build = true
        }
        if ((i + 1) % width === 0) {
          build = true
        }

        if (build && accumilator > 0) {
          const iCol = i % width
          const iRow = Math.floor(i / width)
          this.createBox(
            (iCol + offsetX - accumilator * 0.5) * __pixelSizeMeters,
            (-iRow + offsetY) * __pixelSizeMeters,
            accumilator * __pixelSizeMeters * 0.5,
            __pixelSizeMeters * 0.5,
            true
          )
          accumilator = 0
        }
      }
    }
    img.onerror = errorEvent => {
      console.error('image not found: ' + errorEvent)
    }
    img.src = `/game/levels/${getUrlParam('level') || defaultLevel}.png`
  }
}
