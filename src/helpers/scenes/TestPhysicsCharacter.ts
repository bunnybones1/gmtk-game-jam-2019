import value from '*.vert'
import device from '~/device'
import { __phyicsScale } from '~/settings/physics'
import { cleanRemoveFromArrayMap, pushToArrayMap } from '~/utils/arrayUtils'
import {
  Body,
  CircleShape,
  Contact,
  ContactListener,
  Fixture,
  FixtureDef,
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
const dangerAngleMin = Math.PI * -dangerAngleRange
const dangerAngleMax = Math.PI * dangerAngleRange

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private autoJumpCooldown = 3
  private character: Body
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

    const character = this.createBox(0, 0.05, 0.004, 0.0035, false, 0.5, 1.5)
    const bodyZoneFixtureDef = new FixtureDef()
    const legShape = new CircleShape(0.0025 * __phyicsScale)
    legShape.m_p.Set(0, -0.015 * __phyicsScale)
    bodyZoneFixtureDef.shape = legShape
    bodyZoneFixtureDef.isSensor = true
    bodyZoneFixtureDef.userData = { type: 'legs' }
    this.legsFixture = character.CreateFixture(bodyZoneFixtureDef)
    const bellyShape = new CircleShape(0.0025 * __phyicsScale)
    bellyShape.m_p.Set(0, -0.006 * __phyicsScale)
    bodyZoneFixtureDef.shape = bellyShape
    bodyZoneFixtureDef.userData = { type: 'belly', enabled: true }
    this.bellyFixture = character.CreateFixture(bodyZoneFixtureDef)
    const armsShape = new CircleShape(0.0075 * __phyicsScale)
    armsShape.m_p.Set(0, 0.003 * __phyicsScale)
    bodyZoneFixtureDef.shape = armsShape
    bodyZoneFixtureDef.userData = { type: 'arms' }
    this.armsFixture = character.CreateFixture(bodyZoneFixtureDef)
    character.SetAngularDamping(5)
    character.SetAngle(Math.PI)
    this.character = character
    this.characterContacts = characterContactListener.contactPairs
  }
  update(dt: number) {
    const char = this.character
    this.autoJumpCooldown -= dt
    const vel = char.GetLinearVelocity()
    if (this.characterContacts.size > 0) {
      const angle = char.GetAngle()
      const walkSafe = angle > safeAngleMin && angle < safeAngleMax
      if (this.characterContacts.has(this.legsFixture) && walkSafe) {
        const runSpeed = vel.x < 0 ? vel.x * 0.6 : vel.x
        if (vel.y < 0) {
          char.SetLinearVelocity(new Vec2(runSpeed, 0)) //stop if falling
        }
        char.ApplyForceToCenter(new Vec2(0.01, 0)) // run right
      }
      if (
        this.bellyFixture.m_userData.enabled &&
        this.characterContacts.has(this.bellyFixture)
      ) {
        char.ApplyLinearImpulseToCenter(new Vec2(0, 0.0015), true)
      }
      const thrash =
        (angle < dangerAngleMin || angle > dangerAngleMax) &&
        this.characterContacts.has(this.armsFixture)

      if (thrash && this.autoJumpCooldown <= 0) {
        this.autoJumpCooldown = 0.5
        char.ApplyLinearImpulseToCenter(new Vec2(0, 0.01), true)
        if (angle < 0) {
          char.ApplyAngularImpulse(0.0001)
        } else if (angle > 0) {
          char.ApplyAngularImpulse(-0.0001)
        }
      }
      if (
        this.autoJumpCooldown <= 0 &&
        this.characterContacts.has(this.legsFixture)
      ) {
        this.autoJumpCooldown = 2
        char.ApplyLinearImpulseToCenter(new Vec2(0, 0.03), true)
      }
    } else {
      const angle = char.GetAngle()
      if (angle < safeAngleMin) {
        char.ApplyAngularImpulse(0.00001)
      } else if (angle > safeAngleMax) {
        char.ApplyAngularImpulse(-0.00001)
      }
    }
    if (char.GetPosition().y < -1) {
      char.SetLinearVelocity(new Vec2(0.0, 0.0))
      char.SetPositionXY(0 * __phyicsScale, 0.05 * __phyicsScale)
      this.autoJumpCooldown = 3
    }
    const pos = char.GetPosition()
    this.b2Preview.offset.Set(pos.x / device.aspect, pos.y)
    super.update(dt) //does actual physics
  }
}
