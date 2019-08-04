import { Mesh } from 'three'
import { materialLibrary } from '~/materials/library'
import { getChamferedBoxGeometry } from '~/utils/geometry'
import { KeyboardCodes } from '~/utils/KeyboardCodes'

import KeyButtonHoleMesh from './KeyButtonHoleMesh'
import KeyButtonMesh from './KeyButtonMesh'

const KEY_SCALE = 0.013
class KeyInfo {
  constructor(
    public label: string,
    public width: number,
    public eventCode: KeyboardCodes
  ) {
    this.width *= KEY_SCALE
    //
  }
}
class KeySpace extends KeyInfo {
  constructor(width: number) {
    super('', width, undefined)
  }
}

const board: KeyInfo[][] = [
  [
    new KeyInfo('ESC', 1.3, 'Escape'),
    new KeyInfo('F1', 1, 'F1'),
    new KeyInfo('F2', 1, 'F2'),
    new KeyInfo('F3', 1, 'F3'),
    new KeyInfo('F4', 1, 'F4'),
    new KeyInfo('F5', 1, 'F5'),
    new KeyInfo('F6', 1, 'F6'),
    new KeyInfo('F7', 1, 'F7'),
    new KeyInfo('F8', 1, 'F8'),
    new KeyInfo('F9', 1, 'F9'),
    new KeyInfo('F10', 1, 'F10'),
    new KeyInfo('F11', 1, 'F11'),
    new KeyInfo('F12', 1, 'F12'),
    new KeyInfo('DEL', 1.7, 'Delete'),
    new KeySpace(0.5),
    new KeyInfo('PRNT SCRN', 1, 'F13'),
    new KeyInfo('SCRLK', 1, 'F14'),
    new KeyInfo('PAUSE', 1, 'F15')
  ],
  [
    new KeyInfo('~', 1, 'Backquote'),
    new KeyInfo('1', 1, 'Digit1'),
    new KeyInfo('2', 1, 'Digit2'),
    new KeyInfo('3', 1, 'Digit3'),
    new KeyInfo('4', 1, 'Digit4'),
    new KeyInfo('5', 1, 'Digit5'),
    new KeyInfo('6', 1, 'Digit6'),
    new KeyInfo('7', 1, 'Digit7'),
    new KeyInfo('8', 1, 'Digit8'),
    new KeyInfo('9', 1, 'Digit9'),
    new KeyInfo('0', 1, 'Digit0'),
    new KeyInfo('-', 1, 'Minus'),
    new KeyInfo('=', 1, 'Equal'),
    new KeyInfo('BACKSPACE', 2, 'Backspace'),
    new KeySpace(0.5),
    new KeyInfo('INSERT', 1, 'Insert'),
    new KeyInfo('HOME', 1, 'Home'),
    new KeyInfo('PG UP', 1, 'PageUp')
  ],
  [
    new KeyInfo('TAB', 1.75, 'Tab'),
    new KeyInfo('Q', 1, 'KeyQ'),
    new KeyInfo('W', 1, 'KeyW'),
    new KeyInfo('E', 1, 'KeyE'),
    new KeyInfo('R', 1, 'KeyR'),
    new KeyInfo('T', 1, 'KeyT'),
    new KeyInfo('Y', 1, 'KeyY'),
    new KeyInfo('U', 1, 'KeyU'),
    new KeyInfo('I', 1, 'KeyI'),
    new KeyInfo('O', 1, 'KeyO'),
    new KeyInfo('P', 1, 'KeyP'),
    new KeyInfo('{', 1, 'BracketLeft'),
    new KeyInfo('}', 1, 'BracketRight'),
    new KeyInfo('|', 1.25, 'Backslash'),
    new KeySpace(0.5),
    new KeyInfo('DELETE', 1, 'Delete'),
    new KeyInfo('END', 1, 'End'),
    new KeyInfo('PG DN', 1, 'PageDown')
  ],
  [
    new KeyInfo('CAPS LCK', 2.25, 'CapsLock'),
    new KeyInfo('A', 1, 'KeyA'),
    new KeyInfo('S', 1, 'KeyS'),
    new KeyInfo('D', 1, 'KeyD'),
    new KeyInfo('F', 1, 'KeyF'),
    new KeyInfo('G', 1, 'KeyG'),
    new KeyInfo('H', 1, 'KeyH'),
    new KeyInfo('J', 1, 'KeyJ'),
    new KeyInfo('K', 1, 'KeyK'),
    new KeyInfo('L', 1, 'KeyL'),
    new KeyInfo(':', 1, 'Semicolon'),
    new KeyInfo('"', 1, 'Quote'),
    new KeyInfo('ENTER', 2.2, 'Enter')
  ],
  [
    new KeyInfo('LEFTSHIFT', 2.9, 'ShiftLeft'),
    new KeyInfo('Z', 1, 'KeyZ'),
    new KeyInfo('X', 1, 'KeyX'),
    new KeyInfo('C', 1, 'KeyC'),
    new KeyInfo('V', 1, 'KeyV'),
    new KeyInfo('B', 1, 'KeyB'),
    new KeyInfo('N', 1, 'KeyN'),
    new KeyInfo('M', 1, 'KeyM'),
    new KeyInfo(',', 1, 'Comma'),
    new KeyInfo('.', 1, 'Period'),
    new KeyInfo('/', 1, 'Slash'),
    new KeyInfo('RIGHTSHIFT', 3, 'ShiftRight'),
    new KeySpace(0.5),
    new KeySpace(1),
    new KeyInfo('UP', 1, 'ArrowUp')
  ],
  [
    new KeyInfo('LEFTCTRL', 1.6, 'ControlLeft'),
    new KeyInfo('FN', 1, undefined),
    new KeyInfo('CMD', 1.6, 'MetaLeft'),
    new KeyInfo('LEFTALT', 1.6, 'AltLeft'),
    new KeyInfo('SPACE', 7, 'Space'),
    new KeyInfo('RIGHTALT', 1.6, 'AltRight'),
    new KeyInfo('MENU', 1.6, 'ContextMenu'),
    new KeyInfo('RIGHTCTRL', 1.6, 'ControlRight'),
    new KeySpace(0.5),
    new KeyInfo('LEFT', 1, 'ArrowLeft'),
    new KeyInfo('DOWN', 1, 'ArrowDown'),
    new KeyInfo('RIGHT', 1, 'ArrowRight')
  ]
]

const width = 0.37
const height = 0.01
const depth = 0.13
export default class ProceduralKeyboardMesh extends Mesh {
  private buttonsByEventCode: Map<KeyboardCodes, Mesh>
  constructor() {
    super(
      getChamferedBoxGeometry(width, height, depth),
      materialLibrary.keyboardPlastic
    )
    const buttonsByEventCode = new Map<KeyboardCodes, Mesh>()

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
          if (
            key.eventCode !== undefined &&
            !buttonsByEventCode.has(key.eventCode)
          ) {
            buttonsByEventCode.set(key.eventCode, keyMesh)
          }
          this.add(keyMesh)
          keyMesh.position.set(cursorX, height, cursorY)
        }
        cursorX += (key.width + spacing) * 0.5
      }
      cursorY += (KEY_SCALE + spacing) * 0.5
    }
    this.buttonsByEventCode = buttonsByEventCode
    this.position.y += height
  }
  onKeyCodeEvent = (eventCode: KeyboardCodes, down: boolean) => {
    if (this.buttonsByEventCode.has(eventCode)) {
      this.buttonsByEventCode.get(eventCode)!.position.y = down
        ? height - 0.005
        : height
    }
  }
}
