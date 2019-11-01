import { rigToGamePad } from '~/helpers/utils/gamePad'
import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import { __physicsScale } from '~/settings/physics'
import {
  cleanRemoveFromArrayMap,
  pushToArrayMap,
  removeFromArray
} from '~/utils/arrayUtils'
import {
  createPhysicBox,
  getContactBetweenSensorAndRigidBody,
  makeBitMask
} from '~/utils/physics'
import {
  BodyType,
  Contact,
  ContactListener,
  Filter,
  Fixture,
  RayCastInput,
  RayCastOutput
} from '~/vendor/Box2D/Box2D'

import TestPhysicsScene from './TestPhysics'

function clean(val: number) {
  const sign = Math.sign(val)
  return Math.max(0, Math.abs(val) * 1.2 - 0.2) * sign
}

type SCB = (other: Fixture) => void

class AvatarContactListener extends ContactListener {
  contactPairs = new Map<Fixture, Fixture[]>()
  sensorBeginCallbacks = new Map<Fixture, SCB[]>()
  sensorEndCallbacks = new Map<Fixture, SCB[]>()
  constructor() {
    super()

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true
  }
  listenForSensorBeginContact(sensor: Fixture, scb: SCB) {
    pushToArrayMap(this.sensorBeginCallbacks, sensor, scb)
  }
  listenForSensorEndContact(sensor: Fixture, scb: SCB) {
    pushToArrayMap(this.sensorEndCallbacks, sensor, scb)
  }
  BeginContact(contact: Contact) {
    const contactPair = getContactBetweenSensorAndRigidBody(contact)
    if (contactPair) {
      if (this.sensorBeginCallbacks.has(contactPair.sensor)) {
        for (const scb of this.sensorBeginCallbacks.get(contactPair.sensor)!) {
          scb(contactPair.rigidBody)
        }
      }
      pushToArrayMap(
        this.contactPairs,
        contactPair.sensor,
        contactPair.rigidBody
      )
    }
  }

  EndContact(contact: Contact) {
    const contactPair = getContactBetweenSensorAndRigidBody(contact)
    if (contactPair) {
      if (this.sensorEndCallbacks.has(contactPair.sensor)) {
        for (const scb of this.sensorEndCallbacks.get(contactPair.sensor)!) {
          scb(contactPair.rigidBody)
        }
      }
      if (contactPair) {
        cleanRemoveFromArrayMap(
          this.contactPairs,
          contactPair.sensor,
          contactPair.rigidBody
        )
      }
    }
  }
}

export default class TestPhysicsCharacterScene extends TestPhysicsScene {
  protected postUpdates: Array<() => void> = []
  constructor() {
    super(true, 20, false)
    const avatarContactListener = new AvatarContactListener()
    this.myB2World.SetContactListener(avatarContactListener)

    rigToGamePad(controller => {
      const intent = { x: 0, y: 0 }
      const aim = { x: 0, y: 0 }

      const onSolidGrounds: Fixture[] = []
      let running = false
      let requestJump = false

      const avatarBody = createPhysicBox(
        this.myB2World,
        0,
        0,
        0.01,
        0.01,
        BodyType.kinematicBody,
        0,
        1,
        true
      )
      const filter = new Filter()
      filter.categoryBits = makeBitMask(['hero'])
      filter.maskBits = makeBitMask(['environment', 'enemyWeapon'])

      avatarBody.GetFixtureList()!.SetFilterData(filter)
      const gunBody = createPhysicBox(
        this.myB2World,
        0,
        0,
        0.01,
        0.002,
        BodyType.kinematicBody,
        0,
        1,
        true
      )

      const avFixt = avatarBody.GetFixtureList()!
      avatarContactListener.listenForSensorBeginContact(avFixt, fixt => {
        if (fixt.GetBody().GetType() === BodyType.staticBody) {
          onSolidGrounds.push(fixt)
        }
      })
      avatarContactListener.listenForSensorEndContact(avFixt, fixt => {
        if (fixt.GetBody().GetType() === BodyType.staticBody) {
          removeFromArray(onSolidGrounds, fixt)
        }
      })

      function aimGun() {
        const angle = Math.atan2(aim.y, aim.x)
        gunBody.SetAngle(angle)
      }
      controller.listenToAxis(0, (val, timestamp) => {
        intent.x = clean(val)
      })
      controller.listenToAxis(1, (val, timestamp) => {
        intent.y = clean(-val)
      })
      controller.listenToAxis(2, (val, timestamp) => {
        aim.x = clean(val)
        aimGun()
      })
      controller.listenToAxis(3, (val, timestamp) => {
        aim.y = clean(-val)
        aimGun()
      })
      controller.listenToButton(0, val => {
        if (val && onSolidGrounds) {
          requestJump = true
        }
      })
      controller.listenToButton(2, val => {
        running = val !== 0
      })

      //quick way to check which button you pressed
      // for (let i = 0; i < controller.buttonsCount; i++) {
      // 	function p(j:number) {
      // 		controller.listenToButton(j, val => {
      // 			console.log(j, val)
      // 		})
      // 	}
      // 	p(i)
      // }

      const rcOut = new RayCastOutput()
      const rcIn = new RayCastInput()
      const v = { x: 0, y: 0 }
      this.postUpdates.push(() => {
        const bp = avatarBody.GetPosition()
        v.x = intent.x * (running ? 2 : 1) + this.myB2World.m_gravity.x / 60
        v.y += this.myB2World.m_gravity.y / 60
        if (onSolidGrounds.length > 0 && v.y < 0) {
          rcIn.p1.Set(bp.x, bp.y + 0.1)
          rcIn.p2.Set(bp.x, bp.y - 0.2)
          rcIn.maxFraction = 1
          for (const fixt of onSolidGrounds) {
            if (fixt.RayCast(rcOut, rcIn, 0)) {
              v.y = 0
              avatarBody.SetPositionXY(bp.x, bp.y + 0.1 - rcOut.fraction * 0.2)
            }
          }
        }
        if (requestJump) {
          v.y = 2.5
          requestJump = false
        }
        if (bp.y < -1) {
          avatarBody.SetPositionXY(bp.x, 0)
          v.y = 0
        }
        gunBody.SetPosition(avatarBody.GetPosition())
        avatarBody.SetLinearVelocity(v)
        gunBody.SetLinearVelocity(v)
      })
    })
  }
  update(dt: number) {
    super.update(dt) //does actual physics
    for (const pu of this.postUpdates) {
      pu()
    }
  }
}
