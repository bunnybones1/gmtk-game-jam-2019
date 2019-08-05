class BlocksRecipes {
  private blocks = new Map<number, Map<number, Map<number, number>>>()
  register(x: number, y: number, width: number, height: number) {
    if (!this.blocks.has(x)) {
      this.blocks.set(x, new Map())
    }
    const blocksX = this.blocks.get(x)!
    if (!blocksX.has(width)) {
      blocksX.set(width, new Map())
    }
    const blocksWidth = blocksX.get(width)!
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
  process(cb: (x: number, y: number, width: number, height: number) => void) {
    this.blocks.forEach((blocksX, x) => {
      blocksX.forEach((blocksWidth, width) => {
        blocksWidth.forEach((height, y) => {
          cb(x, y, width, height)
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
      height: number
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
          blockRecipes.register(iCol, iRow, accumilator, 1)
          accumilator = 0
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
