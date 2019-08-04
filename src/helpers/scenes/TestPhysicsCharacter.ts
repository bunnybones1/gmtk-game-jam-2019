import device from '~/device'
import KeyboardInput from '~/input/KeyboardInput'
import { __phyicsScale } from '~/settings/physics'
import { cleanRemoveFromArrayMap, pushToArrayMap } from '~/utils/arrayUtils'
import { KeyboardCodes } from '~/utils/KeyboardCodes'
import { clamp, lerp, radiansDifference } from '~/utils/math'
import {
  Body,
  CircleShape,
  Contact,
  ContactListener,
  Fixture,
  FixtureDef,
  PolygonShape,
  Vec2,
  World
} from '~/vendor/Box2D/Box2D'

import TestPhysicsPNGScene from './TestPhysicsPNG'

class ContactPair {
  characterPart: Fixture
  level: Fixture
  set(characterPart: Fixture, level: Fixture) {
    this.characterPart = characterPart
    this.level = level
    return this
  }
}

const __sharedContactPair = new ContactPair()

function getContactBetweenLegZoneAndLevel(contact: Contact) {
  const fixtureA = contact.GetFixtureA()
  const fixtureB = contact.GetFixtureB()

  // //make sure only one of the fixtures was a sensor
  if (fixtureA.m_isSensor === fixtureB.m_isSensor) {
    return
  }

  if (fixtureA.m_isSensor) {
    return __sharedContactPair.set(fixtureA, fixtureB)
  } else {
    return __sharedContactPair.set(fixtureB, fixtureA)
  }
}
class CharacterContactListener extends ContactListener {
  world: World
  contactPairs: Map<Fixture, Fixture[]>
  constructor(world: World) {
    super()
    this.contactPairs = new Map<Fixture, Fixture[]>()
    this.world = world
  }
  BeginContact(contact: Contact) {
    const contactPair = getContactBetweenLegZoneAndLevel(contact)
    if (contactPair) {
      pushToArrayMap(
        this.contactPairs,
        contactPair.characterPart,
        contactPair.level
      )
    }
  }

  EndContact(contact: Contact) {
    const contactPair = getContactBetweenLegZoneAndLevel(contact)
    if (contactPair) {
      if (contactPair) {
        cleanRemoveFromArrayMap(
          this.contactPairs,
          contactPair.characterPart,
          contactPair.level
        )
      }
    }
  }
}

const safeAngleRange = 0.2
const safeAngleMin = Math.PI * -safeAngleRange
const safeAngleMax = Math.PI * safeAngleRange
const dangerAngleRange = 0.45

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private autoJump = false
  private autoThrash = false
  private jump = false
  private jumpEnergy = 0
  private recoil = 0
  private tucked = false
  private autoJumpCooldown = 3
  private autoThrashCooldown = 0.5
  private character: Body
  private torsoFixture: Fixture
  private torsoShape: PolygonShape
  private legsFixture: Fixture
  private bellyFixture: Fixture
  private armsFixture: Fixture
  private characterContacts: Map<Fixture, Fixture[]>
  constructor() {
    super('test-run', 0)

    const characterContactListener = new CharacterContactListener(
      this.myB2World
    )
    this.myB2World.SetContactListener(characterContactListener)

    const character = this.createBox(0, 0.05, 0.008, 0.007, false, 1.5, 1.5)
    character.m_linearDamping = 1
    this.torsoFixture = character.m_fixtureList!
    this.torsoShape = this.torsoFixture.m_shape as PolygonShape
    const bodyZoneFixtureDef = new FixtureDef()
    const legShape = new CircleShape(0.0025 * __phyicsScale)
    legShape.m_p.Set(0, -0.015 * __phyicsScale)
    bodyZoneFixtureDef.shape = legShape
    bodyZoneFixtureDef.isSensor = true
    bodyZoneFixtureDef.userData = { type: 'legs' }
    this.legsFixture = character.CreateFixture(bodyZoneFixtureDef)
    const bellyShape = new CircleShape(0.0025 * __phyicsScale)
    bellyShape.m_p.Set(0, -0.008 * __phyicsScale)
    bodyZoneFixtureDef.shape = bellyShape
    bodyZoneFixtureDef.userData = { type: 'belly', enabled: true }
    this.bellyFixture = character.CreateFixture(bodyZoneFixtureDef)
    const armsShape = new CircleShape(0.0075 * __phyicsScale)
    armsShape.m_p.Set(0, 0.003 * __phyicsScale)
    bodyZoneFixtureDef.shape = armsShape
    bodyZoneFixtureDef.userData = { type: 'arms' }
    this.armsFixture = character.CreateFixture(bodyZoneFixtureDef)
    character.SetAngularDamping(5)
    this.character = character
    this.characterContacts = characterContactListener.contactPairs

    const keyboardInput = new KeyboardInput()
    keyboardInput.addListener(this.onKeyCodeEvent)
  }
  onKeyCodeEvent = (code: KeyboardCodes, down: boolean) => {
    if (code === 'Space') {
      this.bellyFixture.m_userData.enabled = !down
      this.tucked = down
      if (!down) {
        this.jump = true
      }
      if (down) {
        this.torsoShape.SetAsBox(
          0.005 * __phyicsScale,
          0.0025 * __phyicsScale,
          new Vec2(0, -0.002 * __phyicsScale)
        )
      } else {
        this.recoil = 1
      }
    }
  }
  update(dt: number) {
    if (this.tucked) {
      this.jumpEnergy += dt
    } else if (this.recoil > 0) {
      this.recoil -= dt * 3
      if (this.recoil < 0) {
        this.recoil = 0
      }
      this.torsoShape.SetAsBox(
        lerp(0.004, 0.003, this.recoil) * __phyicsScale,
        lerp(0.0035, 0.0045, this.recoil) * __phyicsScale,
        new Vec2(0, lerp(0, 0.002, this.recoil) * __phyicsScale)
      )
    }
    const char = this.character
    this.autoJumpCooldown -= dt
    this.autoThrashCooldown -= dt
    const vel = char.GetLinearVelocity()
    if (this.characterContacts.size > 0) {
      const angleDiff = radiansDifference(char.GetAngle(), 0)
      const walkSafe = Math.abs(angleDiff) < safeAngleRange
      if (this.characterContacts.has(this.legsFixture) && walkSafe) {
        const runSpeed = vel.x < 0 ? vel.x * 0.6 : vel.x
        if (vel.y < 0) {
          char.SetLinearVelocity(new Vec2(runSpeed, 0)) //stop if falling
        }
        char.ApplyForceToCenter(new Vec2(0.025, 0)) // run right
      }
      if (!this.tucked && this.characterContacts.has(this.bellyFixture)) {
        char.ApplyLinearImpulseToCenter(new Vec2(0, 0.0015), true)
      }
      if (
        Math.abs(angleDiff) > dangerAngleRange &&
        ((this.autoThrash && this.autoThrashCooldown <= 0) || this.jump) &&
        this.characterContacts.has(this.armsFixture)
      ) {
        this.jump = false
        this.jumpEnergy = 0
        this.autoThrashCooldown = 0.5
        char.ApplyLinearImpulseToCenter(
          new Vec2(0, clamp(this.jumpEnergy * 0.05 + 0.002, 0, 0.01)),
          true
        )
        if (angleDiff < 0) {
          char.ApplyAngularImpulse(0.0001)
        } else if (angleDiff > 0) {
          char.ApplyAngularImpulse(-0.0001)
        }
      }
      if (
        ((this.autoJump && this.autoJumpCooldown <= 0) || this.jump) &&
        this.characterContacts.has(this.legsFixture)
      ) {
        this.jump = false
        this.autoJumpCooldown = 2
        const vel = char.GetLinearVelocity()
        char.SetLinearVelocity(
          new Vec2(vel.x, 100 * clamp(this.jumpEnergy * 0.1 + 0.01, 0, 0.04))
        )
        this.jumpEnergy = 0
      }
    }

    const angleDiff = radiansDifference(char.GetAngle(), 0)
    if (angleDiff < safeAngleMin) {
      char.ApplyAngularImpulse(0.00001)
    } else if (angleDiff > safeAngleMax) {
      char.ApplyAngularImpulse(-0.00001)
    }
    if (char.GetPosition().y < -1) {
      char.SetLinearVelocity(new Vec2(0.0, 0.0))
      char.SetPositionXY(0 * __phyicsScale, 0.05 * __phyicsScale)
      this.autoThrashCooldown = 0.5
      this.autoJumpCooldown = 3
    }
    const pos = char.GetPosition()
    this.b2Preview.offset.Set(pos.x / device.aspect, pos.y)
    super.update(dt) //does actual physics
  }
}
