import { Mesh } from 'three'
import { materialLibrary } from '~/materials/library'
import { getChamferedBoxGeometry } from '~/utils/geometry'

import KeyButtonHoleMesh from './KeyButtonHoleMesh'
import KeyButtonMesh from './KeyButtonMesh'

const KEY_SCALE = 0.013
class KeyInfo {
  constructor(
    public label: string,
    public width: number,
    public keycode: number
  ) {
    this.width *= KEY_SCALE
    //
  }
}
class KeySpace extends KeyInfo {
  constructor(width: number) {
    super('', width, -1)
  }
}
const KEYS = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESCAPE: 27,
  SPACE: 32,
  END: 35,
  HOME: 36,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  INSERT: 45,
  DELETE: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  NUMPAD_0: 96,
  NUMPAD_1: 97,
  NUMPAD_2: 98,
  NUMPAD_3: 99,
  NUMPAD_4: 100,
  NUMPAD_5: 101,
  NUMPAD_6: 102,
  NUMPAD_7: 103,
  NUMPAD_8: 104,
  NUMPAD_9: 105,
  MULTIPLY: 106,
  ADD: 107,
  SUBTRACT: 109,
  DECIMAL_POINT: 110,
  DIVIDE: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  SEMICOLON: 186,
  EQUAL_SIGN: 187,
  COMMA: 188,
  DASH: 189,
  PERIOD: 190,
  FORWARD_SLASH: 191,
  OPEN_BRACKET: 219,
  BACK_SLASH: 220,
  CLOSE_BRAKET: 221,
  SINGLE_QUOTE: 222
}
const board: KeyInfo[][] = [
  [
    new KeyInfo('ESC', 1.3, KEYS.ESCAPE),
    new KeyInfo('F1', 1, KEYS.F1),
    new KeyInfo('F2', 1, KEYS.F2),
    new KeyInfo('F3', 1, KEYS.F3),
    new KeyInfo('F4', 1, KEYS.F4),
    new KeyInfo('F5', 1, KEYS.F5),
    new KeyInfo('F6', 1, KEYS.F6),
    new KeyInfo('F7', 1, KEYS.F7),
    new KeyInfo('F8', 1, KEYS.F8),
    new KeyInfo('F9', 1, KEYS.F9),
    new KeyInfo('F10', 1, KEYS.F10),
    new KeyInfo('F11', 1, KEYS.F11),
    new KeyInfo('F12', 1, KEYS.F12),
    new KeyInfo('DEL', 1.7, KEYS.DELETE),
    new KeySpace(0.5),
    new KeyInfo('PRNT SCRN', 1, -1),
    new KeyInfo('SCRLK', 1, -1),
    new KeyInfo('PAUSE', 1, -1)
  ],
  [
    new KeyInfo('~', 1, -1),
    new KeyInfo('1', 1, KEYS[1]),
    new KeyInfo('2', 1, KEYS[2]),
    new KeyInfo('3', 1, KEYS[3]),
    new KeyInfo('4', 1, KEYS[4]),
    new KeyInfo('5', 1, KEYS[5]),
    new KeyInfo('6', 1, KEYS[6]),
    new KeyInfo('7', 1, KEYS[7]),
    new KeyInfo('8', 1, KEYS[8]),
    new KeyInfo('9', 1, KEYS[9]),
    new KeyInfo('0', 1, KEYS[0]),
    new KeyInfo('_', 1, KEYS.SUBTRACT),
    new KeyInfo('+', 1, KEYS.ADD),
    new KeyInfo('BACKSPACE', 2, KEYS.BACKSPACE),
    new KeySpace(0.5),
    new KeyInfo('INSERT', 1, KEYS.INSERT),
    new KeyInfo('HOME', 1, KEYS.HOME),
    new KeyInfo('PG UP', 1, -1)
  ],
  [
    new KeyInfo('TAB', 1.75, KEYS.TAB),
    new KeyInfo('Q', 1, KEYS.Q),
    new KeyInfo('W', 1, KEYS.W),
    new KeyInfo('E', 1, KEYS.E),
    new KeyInfo('R', 1, KEYS.R),
    new KeyInfo('T', 1, KEYS.T),
    new KeyInfo('Y', 1, KEYS.Y),
    new KeyInfo('U', 1, KEYS.U),
    new KeyInfo('I', 1, KEYS.I),
    new KeyInfo('O', 1, KEYS.O),
    new KeyInfo('P', 1, KEYS.P),
    new KeyInfo('{', 1, KEYS.OPEN_BRACKET),
    new KeyInfo('}', 1, KEYS.CLOSE_BRAKET),
    new KeyInfo('|', 1.25, KEYS.BACK_SLASH),
    new KeySpace(0.5),
    new KeyInfo('DELETE', 1, KEYS.DELETE),
    new KeyInfo('END', 1, KEYS.END),
    new KeyInfo('PG DN', 1, -1)
  ],
  [
    new KeyInfo('CAPS LCK', 2.25, -1),
    new KeyInfo('A', 1, KEYS.A),
    new KeyInfo('S', 1, KEYS.S),
    new KeyInfo('D', 1, KEYS.D),
    new KeyInfo('F', 1, KEYS.F),
    new KeyInfo('G', 1, KEYS.G),
    new KeyInfo('H', 1, KEYS.H),
    new KeyInfo('J', 1, KEYS.J),
    new KeyInfo('K', 1, KEYS.K),
    new KeyInfo('L', 1, KEYS.L),
    new KeyInfo(':', 1, KEYS.SEMICOLON),
    new KeyInfo('"', 1, KEYS.SINGLE_QUOTE),
    new KeyInfo('ENTER', 2.2, KEYS.ENTER)
  ],
  [
    new KeyInfo('SHIFT', 2.9, KEYS.SHIFT),
    new KeyInfo('Z', 1, KEYS.Z),
    new KeyInfo('X', 1, KEYS.X),
    new KeyInfo('C', 1, KEYS.C),
    new KeyInfo('V', 1, KEYS.V),
    new KeyInfo('B', 1, KEYS.B),
    new KeyInfo('N', 1, KEYS.N),
    new KeyInfo('M', 1, KEYS.M),
    new KeyInfo('<', 1, KEYS.COMMA),
    new KeyInfo('>', 1, KEYS.PERIOD),
    new KeyInfo('?', 1, KEYS.FORWARD_SLASH),
    new KeyInfo('SHIFT', 3, KEYS.SHIFT),
    new KeySpace(0.5),
    new KeySpace(1),
    new KeyInfo('UP', 1, KEYS.ARROW_UP)
  ],
  [
    new KeyInfo('CTRL', 1.6, KEYS.CTRL),
    new KeyInfo('FN', 1, -1),
    new KeyInfo('CMD', 1.6, -1),
    new KeyInfo('ALT', 1.6, KEYS.ALT),
    new KeyInfo('SPACE', 7, KEYS.SPACE),
    new KeyInfo('ALT', 1.6, KEYS.ALT),
    new KeyInfo('MENU', 1.6, -1),
    new KeyInfo('CTRL', 1.6, KEYS.CTRL),
    new KeySpace(0.5),
    new KeyInfo('LEFT', 1, KEYS.ARROW_LEFT),
    new KeyInfo('DOWN', 1, KEYS.ARROW_DOWN),
    new KeyInfo('RIGHT', 1, KEYS.ARROW_RIGHT)
  ]
]

export default class ProceduralKeyboardMesh extends Mesh {
  constructor() {
    const width = 0.37
    const height = 0.01
    const depth = 0.13
    super(
      getChamferedBoxGeometry(width, height, depth),
      materialLibrary.keyboardPlastic
    )
    const buttonsByKeyCode = new Map<number, Mesh>()

    const spacing = 0.45 * KEY_SCALE
    let cursorY = -depth * 0.5 + 0.01
    for (const row of board) {
      cursorY += (KEY_SCALE + spacing) * 0.5
      let cursorX = -width * 0.5 + 0.01
      for (const key of row) {
        cursorX += (key.width + spacing) * 0.5
        if (key.label !== '') {
          const keyMeshHole = new KeyButtonHoleMesh(
            key.width,
            0.0075,
            KEY_SCALE,
            0.0025
          )
          this.add(keyMeshHole)
          keyMeshHole.position.set(cursorX, height - 0.001, cursorY)
          const keyMesh = new KeyButtonMesh(
            key.width,
            0.0075,
            KEY_SCALE,
            0.0025
          )
          if (key.keycode !== -1 && !buttonsByKeyCode.has(key.keycode)) {
            buttonsByKeyCode.set(key.keycode, keyMesh)
          }
          this.add(keyMesh)
          keyMesh.position.set(cursorX, height, cursorY)
        }
        cursorX += (key.width + spacing) * 0.5
      }
      cursorY += (KEY_SCALE + spacing) * 0.5
    }

    const keyStates = new Map<number, boolean>()

    function changeKey(ev: KeyboardEvent, down: boolean) {
      const keyCode = ev.keyCode
      ev.preventDefault()
      keyStates.set(keyCode, down)
      if (buttonsByKeyCode.has(keyCode)) {
        buttonsByKeyCode.get(keyCode)!.position.y = down
          ? height - 0.005
          : height
      }
    }

    window.addEventListener('keydown', ev => changeKey(ev, true))
    window.addEventListener('keyup', ev => changeKey(ev, false))

    this.position.y += height
  }
}
