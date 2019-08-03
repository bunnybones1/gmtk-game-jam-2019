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
  legs: Fixture
  level: Fixture
  set(legs: Fixture, level: Fixture) {
    this.legs = legs
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
class LegContactListener extends ContactListener {
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
      pushToArrayMap(this.contactPairs, contactPair.legs, contactPair.level)
    }
  }

  EndContact(contact: Contact) {
    const contactPair = getContactBetweenLegZoneAndLevel(contact)
    if (contactPair) {
      if (contactPair) {
        cleanRemoveFromArrayMap(
          this.contactPairs,
          contactPair.legs,
          contactPair.level
        )
      }
    }
  }
}

export default class TestPhysicsCharacterScene extends TestPhysicsPNGScene {
  private autoJumpCooldown = 2
  private character: Body
  private legsFixture: Fixture
  private bellyFixture: Fixture
  private legContactListener: LegContactListener
  constructor() {
    super('test-run', 0)

    const legContactListener = new LegContactListener(this.myB2World)
    this.myB2World.SetContactListener(legContactListener)

    const character = this.createBox(0, 0.05, 0.005, 0.004, false, 0.015)
    const bodyZoneFixtureDef = new FixtureDef()
    const legShape = new CircleShape(0.005 * __phyicsScale)
    legShape.m_p.Set(0, -0.01 * __phyicsScale)
    bodyZoneFixtureDef.shape = legShape
    bodyZoneFixtureDef.isSensor = true
    bodyZoneFixtureDef.userData = { type: 'legs' }
    this.legsFixture = character.CreateFixture(bodyZoneFixtureDef)
    const bellyShape = new CircleShape(0.0025 * __phyicsScale)
    bellyShape.m_p.Set(0, -0.006 * __phyicsScale)
    bodyZoneFixtureDef.shape = bellyShape
    bodyZoneFixtureDef.userData = { type: 'belly' }
    this.bellyFixture = character.CreateFixture(bodyZoneFixtureDef)
    character.SetAngularDamping(5)
    this.character = character
    this.legContactListener = legContactListener
  }
  update(dt: number) {
    const char = this.character
    this.autoJumpCooldown -= dt
    if (this.autoJumpCooldown <= 0) {
      this.autoJumpCooldown = 2
      char.ApplyLinearImpulseToCenter(new Vec2(0, 0.03), true)
    }
    const vel = char.GetLinearVelocity()
    if (this.legContactListener.contactPairs.size > 0) {
      if (
        vel.y < 0 &&
        this.legContactListener.contactPairs.has(this.legsFixture)
      ) {
        char.SetLinearVelocity(new Vec2(vel.x, 0))
      }
      if (this.legContactListener.contactPairs.has(this.bellyFixture)) {
        char.ApplyLinearImpulseToCenter(new Vec2(0, 0.0015), true)
      }
    }
    char.ApplyLinearImpulseToCenter(new Vec2(0.0001, 0), true)
    if (char.GetPosition().y < -1) {
      char.SetLinearVelocity(new Vec2(0.0, 0.0))
      char.SetPositionXY(0 * __phyicsScale, 0.05 * __phyicsScale)
    }
    const pos = char.GetPosition()
    this.b2Preview.offset.Set(pos.x / device.aspect, pos.y)
    super.update(dt) //does actual physics
  }
}
