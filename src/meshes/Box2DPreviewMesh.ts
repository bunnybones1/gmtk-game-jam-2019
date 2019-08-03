import {
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineStrip,
  Matrix4,
  Quaternion,
  Sphere,
  Vector3
} from 'three'
import device from '~/device'
import { Box2DPreviewMaterial } from '~/materials/Box2DPreviewMaterial'
import { getUrlFlag } from '~/utils/location'
import { rand2 } from '~/utils/math'
import {
  Body,
  CircleShape,
  Fixture,
  PolygonShape,
  Shape,
  ShapeType,
  Vec2,
  World
} from '~/vendor/Box2D/Box2D'

const __debugViewScale = 1
const __circleSegs = 16

const __colorMatrixVisible = new Matrix4().compose(
  new Vector3(0.5, 0.5, 0.5),
  new Quaternion(),
  new Vector3(0.5, 0.5, 0.5)
)
const __defaultQuaternion = new Quaternion()
const __defaultColorScale = new Vector3(0.5, 0.5, 0.5)

const __debugPolygonPhysics = getUrlFlag('debugPhysicsPolygon')
class DebugColors {
  fixtureColors: Map<Fixture, Vector3>
  bodyMatrices: Map<Body, Matrix4>
  constructor() {
    this.fixtureColors = new Map<Fixture, Vector3>()
    this.bodyMatrices = new Map<Body, Matrix4>()
  }
  getFixtureColor(fixture: Fixture): Vector3 {
    if (!this.fixtureColors.has(fixture)) {
      const color = new Vector3(rand2(), rand2(), rand2())
        .applyMatrix4(this.getBodyMatrix(fixture.m_body))
        .applyMatrix4(__colorMatrixVisible)
      this.fixtureColors.set(fixture, color)
      return color
    }
    return this.fixtureColors.get(fixture)!
  }
  getBodyMatrix(body: Body): Matrix4 {
    if (!this.bodyMatrices.has(body)) {
      const matrix = new Matrix4().compose(
        new Vector3(rand2(), rand2(), rand2()),
        __defaultQuaternion,
        __defaultColorScale
      )
      this.bodyMatrices.set(body, matrix)
      return matrix
    }
    return this.bodyMatrices.get(body)!
  }
}

function getShapeWorldVerts(shape: Shape, body: Body) {
  switch (shape.m_type) {
    case ShapeType.e_polygonShape:
      if (__debugPolygonPhysics) {
        return getPolygonShapeWorldVerts(shape as PolygonShape, body)
      } else {
        return undefined
      }
    case ShapeType.e_circleShape:
      return getCircleShapeWorldVerts(shape as CircleShape, body)
    default:
      console.error('unsupported box2d shape type for debug view')
      return undefined
  }
}

function getShapeWorldVertsCount(shape: Shape) {
  switch (shape.m_type) {
    case ShapeType.e_polygonShape:
      if (__debugPolygonPhysics) {
        return (shape as PolygonShape).m_vertices.length
      } else {
        return 0
      }
    case ShapeType.e_circleShape:
      return __circleSegs
    default:
      return 0
  }
}

function getPolygonShapeWorldVerts(polygon: PolygonShape, body: Body) {
  return polygon.m_vertices.map(vert => {
    const worldVert = new Vec2()
    body.GetWorldPoint(vert, worldVert)
    worldVert.x /= device.aspect
    return worldVert
  })
}

function getCircleShapeWorldVerts(circle: CircleShape, body: Body) {
  const worldVerts: Vec2[] = []
  const radius = circle.m_radius
  const offset = circle.m_p
  for (let i = 0; i < __circleSegs; i++) {
    const angle = (i / __circleSegs) * Math.PI * 2
    const vert = new Vec2(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ).SelfAdd(offset)
    const worldVert = new Vec2()
    body.GetWorldPoint(vert, worldVert)
    worldVert.x /= device.aspect
    worldVerts.push(worldVert)
  }
  return worldVerts
}

function createGeometry(myB2World: World, debugColors: DebugColors) {
  let fixtureVertsCount = 0
  let body = myB2World.m_bodyList
  //measure first
  while (body) {
    let fixture = body.m_fixtureList
    while (fixture) {
      fixtureVertsCount += getShapeWorldVertsCount(fixture.m_shape) + 3
      //count + 3, to add extra vert to close shape and 2 extra verts to jump with transparency between shapes
      fixture = fixture.m_next
    }
    body = body.m_next
  }

  const geometry = new BufferGeometry()
  geometry.boundingSphere = new Sphere(undefined, Infinity)

  const posArr = new Float32Array(fixtureVertsCount * 2)
  const colArr = new Float32Array(fixtureVertsCount * 4)

  let posArrIndex = 0
  let colArrIndex = 0

  function writeVert(vert: Vec2, color: Vector3, opacity: number = 1) {
    posArr[posArrIndex] = vert.x
    posArr[posArrIndex + 1] = vert.y
    posArrIndex += 2
    color.toArray(colArr, colArrIndex)
    colArr[colArrIndex + 3] = opacity
    colArrIndex += 4
  }

  body = myB2World.m_bodyList
  while (body) {
    let fixture = body.m_fixtureList
    while (fixture) {
      const shape = fixture.m_shape
      const worldVerts = getShapeWorldVerts(shape, body)
      if (worldVerts) {
        if (__debugViewScale !== 1) {
          worldVerts.forEach(vert => vert.SelfMul(__debugViewScale))
        }

        const color = debugColors.getFixtureColor(fixture)
        const vert0 = worldVerts[0]

        //first double transparent vert to jump from last shape
        writeVert(vert0, color, 0)

        //do all verts in shape
        for (const worldVert of worldVerts) {
          writeVert(worldVert, color, 1)
        }

        //extra vert to close shape
        writeVert(vert0, color, 1)

        //extra transparent vert to jump to next shape
        writeVert(vert0, color, 0)
      }
      fixture = fixture.m_next
    }
    body = body.m_next
  }

  geometry.addAttribute('position', new Float32BufferAttribute(posArr, 2))
  geometry.addAttribute('color', new Float32BufferAttribute(colArr, 4))
  return geometry
}

export class Box2DPreviewMesh extends Line {
  myB2World: World
  debugColors: DebugColors
  constructor(myB2World: World) {
    const debugColors = new DebugColors()
    super(
      createGeometry(myB2World, debugColors),
      new Box2DPreviewMaterial(),
      LineStrip
    )
    this.debugColors = debugColors
    this.myB2World = myB2World

    this.renderOrder = 100000
  }
  update(dt: number) {
    this.geometry.dispose()
    this.geometry = createGeometry(this.myB2World, this.debugColors)
  }
}
