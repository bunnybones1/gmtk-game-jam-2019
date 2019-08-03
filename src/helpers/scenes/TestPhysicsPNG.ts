import { getUrlFlag, getUrlParam } from '~/utils/location'

import TestPhysicsScene from './TestPhysics'

const __pixelsPerMeter = 200
const __pixelSizeMeters = 1 / __pixelsPerMeter

const __phyicsScale = 10
const __pixelSizePhysics = __phyicsScale * __pixelSizeMeters

export default class TestPhysicsPNGScene extends TestPhysicsScene {
  constructor() {
    super(false)
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
      for (let i = 0; i < data.length; i++) {
        if (data[i * 4 + 3] > 128) {
          const iCol = i % width
          const iRow = Math.floor(i / width)
          this.createStaticBox(
            (iCol + offsetX) * __pixelSizePhysics,
            (-iRow + offsetY) * __pixelSizePhysics,
            __pixelSizePhysics * 0.5,
            __pixelSizePhysics * 0.5
          )
        }
      }
    }
    img.onerror = errorEvent => {
      console.error('image not found: ' + errorEvent)
    }
    img.src = `/game/levels/${getUrlParam('level') || 'test'}.png`
  }
}
