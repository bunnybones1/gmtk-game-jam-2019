import { Color } from 'three'

class BlocksRecipes {
  private blocks = new Map<
    number,
    Map<number, Map<number, Map<number, number>>>
  >()
  register(
    x: number,
    y: number,
    width: number,
    height: number,
    colour: number
  ) {
    if (!this.blocks.has(x)) {
      this.blocks.set(x, new Map())
    }
    const blocksX = this.blocks.get(x)!
    if (!blocksX.has(colour)) {
      blocksX.set(colour, new Map())
    }

    const blocksColour = blocksX.get(colour)!
    if (!blocksColour.has(width)) {
      blocksColour.set(width, new Map())
    }

    const blocksWidth = blocksColour.get(width)!
    let merged = false
    for (const [key, value] of blocksWidth.entries()) {
      if (key + value === y) {
        blocksWidth.set(key, value + 1)
        merged = true
      }
    }
    if (!merged) {
      blocksWidth.set(y, height)
    }
  }
  process(
    cb: (
      x: number,
      y: number,
      width: number,
      height: number,
      colour: number
    ) => void
  ) {
    this.blocks.forEach((blocksX, x) => {
      blocksX.forEach((blocksColour, colour) => {
        blocksColour.forEach((blocksWidth, width) => {
          blocksWidth.forEach((height, y) => {
            cb(x, y, width, height, colour)
          })
        })
      })
    })
  }
}

export default class PNGLevel {
  constructor(
    baseName: string,
    blockProcessor: (
      x: number,
      y: number,
      width: number,
      height: number,
      colour: number
    ) => void,
    onReady: () => void,
    onError?: () => void
  ) {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = imageEvent => {
      const blockRecipes = new BlocksRecipes()
      const canvas = document.createElement('canvas')
      const width = img.width
      const height = img.height
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')!
      context.drawImage(img, 0, 0, width, height)
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data
      let accumilator = 0
      const colour = new Color()
      const nextColour = new Color()
      for (let i = 0; i < data.length; i++) {
        function log(msg: string) {
          const x = i % width
          const y = Math.floor(i / width)
          console.log(`build? x(${x})y(${y}), ${msg}`)
        }

        function logc() {
          const x = i % width
          const y = Math.floor(i / width)
          console.log(`position: x(${x})y(${y}), colour= ${colour.r} ${colour.g} ${colour.b},
            cHex = ${cHex}, is opaque? = ${opaque}`)
        }

        function lognc() {
          console.log(`nextColour= ${nextColour.r} ${nextColour.g} ${nextColour.b},
            ncHex = ${ncHex}, is nextOpaque? = ${nextOpaque}`)
        }

        colour.r = data[i * 4 + 0] / 255
        colour.g = data[i * 4 + 1] / 255
        colour.b = data[i * 4 + 2] / 255
        const cHex = colour.getHex()
        const opaque = data[i * 4 + 3] > 128
        //logc()

        const j = i + 1
        nextColour.r = data[j * 4 + 0] / 255
        nextColour.g = data[j * 4 + 1] / 255
        nextColour.b = data[j * 4 + 2] / 255
        const ncHex = nextColour.getHex()
        const nextOpaque = data[j * 4 + 3] > 128
        //lognc()

        let build = false

        if (opaque) {
          accumilator++
          if (cHex !== ncHex) {
            build = true
            //log('next colour changes')
          }
          if (opaque !== nextOpaque) {
            build = true
            //log('next opaque changes')
          }
        } else {
          build = true
          //log('not opaque')
        }
        if ((i + 1) % width === 0) {
          build = true
          //log('wrap-around')
        }
        if (build && accumilator > 0) {
          const iCol = i % width
          const iRow = Math.floor(i / width)
          blockRecipes.register(iCol, iRow, accumilator, 1, cHex)
          //log(`Accume= ${accumilator}, Colour= ${cHex}`)
          accumilator = 0
          //log('YES, BUILD EET!')
        }
      }
      blockRecipes.process(blockProcessor)
      onReady()
    }
    img.onerror = errorEvent => {
      console.error('image not found: ' + errorEvent)
    }
    img.src = `game/levels/${baseName}.png`
  }
}
