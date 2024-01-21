/*! *****************************************************************************
Copyright (c) 2023 Tencent, Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
***************************************************************************** */

declare namespace phys3D {
  // pvd调试配置
  export interface PhysicsDebugConfig {
    isNetwork: boolean // 采用网络的方式
    ip?: string // 如果isNetwork为true，调试信息会通过tcp转发的方式转发到打开了pvd调试软件的电脑，需要注意的是，防火墙要对pvd打开
    port?: 5425 // pvd默认接口
    timeout?: 1000 // 默认耗时
    path?: string // 如果isNetwork为false，调试信息会通过写本地文件的方式落地，文件名建议为xxx.pxd2，导入pvd调试即可
  }

  export enum QueryTriggerInteraction {
    UseGlobal = 0,
    Ignore = 1,
    Collide = 2,
  }

  export class PhysSystem {
    constructor(config?: PhysicsDebugConfig)
    gravity: RawVec3f
    bounceThreshold: number
    defaultMaxAngularSpeed: number
    defaultSolverIterations: number
    defaultSolverVelocityIterations: number
    sleepThreshold: number
    defaultContactOffset: number
    destroyScene: () => void
    createScene: () => number
    Simulate: (step: number) => void
    SyncFromTransforms: (() => void) | undefined // added in 2021.06
    SetCollisionMask: (mask: ArrayBuffer) => void
    Raycast: (
      origin: RawVec3f,
      unitDir: RawVec3f,
      distance: number,
      hit: RaycastHit,
      layerMask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ) => boolean
    RaycastAll: (
      origin: RawVec3f,
      unitDir: RawVec3f,
      distance: number,
      layerMask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ) => RaycastHit[]
    CapsuleCast(
      p1: RawVec3f,
      p2: RawVec3f,
      radius: number,
      direction: RawVec3f,
      hit: RaycastHit,
      maxDistance: number,
      layerMask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ): void
    CapsuleCastAll: (
      p1: RawVec3f,
      p2: RawVec3f,
      radius: number,
      direction: RawVec3f,
      maxDistance: number,
      layerMask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ) => RaycastHit[]
    BoxCast(
      center: RawVec3f,
      halfExt: RawVec3f,
      direction: RawVec3f,
      hit: RaycastHit,
      orientation: RawQuaternion,
      maxDistance: number,
      layerMask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ): void
    BoxCastAll: (
      center: RawVec3f,
      halfExt: RawVec3f,
      direction: RawVec3f,
      orientation: RawQuaternion,
      maxDistance: number,
      layerMask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ) => RaycastHit[]
    OverlapBox: (
      center: RawVec3f,
      halfExt: RawVec3f,
      orientation: RawQuaternion,
      layermask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ) => Collider[]
    OverlapCapsule: (
      p1: RawVec3f,
      p2: RawVec3f,
      radius: number,
      layermask?: number,
      queryTriggerInteraction?: QueryTriggerInteraction,
    ) => Collider[]
  }

  export class Rigidbody {
    constructor(system: PhysSystem)
    enabled?: boolean // since 2021.06
    position: RawVec3f
    rotation: RawQuaternion
    AttachToEntity: (pollObj: any, id: number) => void
    Remove(): void
    Detach(): void
    IsAttached(): boolean
  }

  export enum CollisionDetectionMode {
    Discrete = 0,
    Continuous = 1,
    ContinuousDynamic = 2,
    ContinuousSpeculative = 3,
  }

  export enum RigidbodyConstraints {
    None = 0,
    FreezePositionX = 1 << 0,
    FreezePositionY = 1 << 1,
    FreezePositionZ = 1 << 2,
    FreezeRotationX = 1 << 3,
    FreezeRotationY = 1 << 4,
    FreezeRotationZ = 1 << 5,
    FreezePosition = FreezePositionX | FreezePositionY | FreezePositionZ,
    FreezeRotation = FreezeRotationX | FreezeRotationY | FreezeRotationZ,
    FreezeAll = FreezePosition | FreezeRotation,
  }

  export enum ForceMode {
    kForceModeForce = 0,
    kForceModeImpulse = 1 << 0,
    kForceModeVelocityChange = 1 << 1,
    kForceModeAcceleration = 1 << 2,
  }

  export enum CombineMode {
    eAverage = 0,
    eMin,
    eMultiply,
    eMax,
  }

  export enum CookingFlag {
    None = 0,
    CookForFasterSimulation = 1 << 0,
    EnableMeshCleaning = 1 << 1,
    WeldColocatedVertices = 1 << 2,
  }

  export enum CollisionFlags {
    None = 0,
    Sides = 1 << 0,
    Above = 1 << 1,
    Below = 1 << 2,
  }

  export class RawVec3f {
    constructor()
    constructor(x: number, y: number, z: number)
    x: number
    y: number
    z: number
  }

  export class RawQuaternion {
    constructor()
    constructor(x: number, y: number, z: number, w: number)
    x: number
    y: number
    z: number
    w: number
  }

  export class Collider {
    attachedRigidbody: Rigidbody
    bounds: Bounds
    name: string
    contactOffset: number
    enabled: boolean
    isTrigger: boolean
    scale: RawVec3f
    material?: Material
    sharedMateiral?: Material
    ClosestPoint: (raw: RawVec3f) => RawVec3f
    ClosestPointOnBounds: (raw: RawVec3f) => RawVec3f

    onCollisionEnter?: (collision: Collision) => void
    onCollisionExit?: (collision: Collision) => void
    onCollisionStay?: (collision: Collision) => void
    onTriggerEnter?: (collision: Collision) => void
    onTriggerExit?: (collision: Collision) => void
    onTriggerStay?: (collision: Collision) => void

    dettachRigidbody?: () => void

    userData?: unknown
    layer: number
  }

  export class BoxCollider extends Collider {
    constructor(system: PhysSystem, center: RawVec3f, size: RawVec3f)
    center: RawVec3f
    size: RawVec3f
  }

  export class SphereCollider extends Collider {
    constructor(system: PhysSystem, center: RawVec3f, radius: number)
    center: RawVec3f
    radius: number
  }

  export class CapsuleCollider extends Collider {
    constructor(
      system: PhysSystem,
      center: RawVec3f,
      height: number,
      radius: number,
    )
    center: RawVec3f
    height: number
    radius: number
  }

  export class MeshCollider extends Collider {
    constructor(
      system: PhysSystem,
      convex: boolean,
      cookingOptions: number,
      sharedMesh: PhysMesh,
    )
    cookingOptions: number
    sharedMesh: PhysMesh | null
    convex: boolean
  }

  export class CharacterController extends Collider {
    constructor(system: PhysSystem)
    position: RawVec3f
    center: RawVec3f
    collisionFlags: CollisionFlags
    detectCollisions: boolean
    enableOverlapRecovery: boolean
    height: number
    isGrounded: boolean
    minMoveDistance: number
    radius: number
    skinWidth: number
    slopeLimit: number
    stepOffset: number
    velocity: RawVec3f

    Move: (movement: RawVec3f) => CollisionFlags
    SimpleMove: (speed: RawVec3f) => boolean
    AttachToEntity: (pollObj: any, id: number) => void

    OnControllerColliderHit?: (hit: ControllerColliderHit) => void
  }

  export interface ContactPoint {
    normal: RawVec3f
    this_collider: Collider
    other_collider: Collider
    point: RawVec3f
    separation: number
  }

  export interface Collision {
    collider: Collider
    contacts: ContactPoint[]
    impulse: RawVec3f
    relative_velocity: RawVec3f
  }

  export interface ControllerColliderHit {
    collider: Collider
    controller: CharacterController
    moveDirection: RawVec3f
    normal: RawVec3f
    moveLength: number
    point: RawVec3f
  }

  export class Bounds {
    constructor(center: RawVec3f, size: RawVec3f)

    center: RawVec3f
    extents: RawVec3f
    max: RawVec3f
    min: RawVec3f
    size: RawVec3f

    ClosestPoint: (point: RawVec3f) => RawVec3f
    Contains: (point: RawVec3f) => boolean
    Expand: (amount: number) => void
    Intersects: (bounds: Bounds) => boolean
    SetMinMax: (min: RawVec3f, max: RawVec3f) => void
    SqrDistance: (point: RawVec3f) => number
  }

  export class Material {
    constructor(system: PhysSystem)
    dynamicFriction: number
    staticFriction: number
    bounciness: number
    frictionCombine: CombineMode
    bounceCombine: CombineMode
    id: number
  }

  export class DynamicRigidbody extends Rigidbody {
    mass: number
    angularDamping: number
    angularVelocity: RawVec3f
    centerOfMass: RawVec3f
    collisionDetectionMode: CollisionDetectionMode
    constraints: number
    detectCollisions: boolean
    linearDamping: number
    freezeRotation: boolean
    inertiaTensor: number
    // inertiaTensorRotation
    // interpolation
    isKinematic: boolean
    maxAngularVelocity: number
    maxDepenetrationVelocity: number
    sleepThreshold: number
    solverIterations: number
    solverVelocityIterations: number
    useGravity: boolean
    velocity: RawVec3f
    userData?: unknown

    GetWorldCenterOfMass: () => RawVec3f
    AddForce: (force: RawVec3f, mode: ForceMode) => void
    AddTorque: (torque: RawVec3f, mode: ForceMode) => void
    IsSleeping: () => boolean
    Sleep: () => void
    WakeUp: () => void
    AddExplosionForce: (
      explosionForce: number,
      explosionPosition: RawVec3f,
      explosionRadius: number,
      upwardsModifier: number,
      mode: ForceMode,
    ) => void
    AddForceAtPosition: (
      force: RawVec3f,
      position: RawVec3f,
      mode: ForceMode,
    ) => void
    AddRelativeForce: (force: RawVec3f, mode: ForceMode) => void
    AddRelativeTorque: (torque: RawVec3f, mode: ForceMode) => void
    ClosestPointOnBounds: (position: RawVec3f) => RawVec3f
    GetPointVelocity: (worldPoint: RawVec3f) => RawVec3f
    GetRelativePointVelocity: (relativePoint: RawVec3f) => RawVec3f
    MovePosition: (position: RawVec3f) => void
    MoveRotation: (rotation: RawQuaternion) => void
    ResetCenterOfMass: () => void
    ResetInertiaTensor: () => void
    SetDensity: (density: number) => void
    // SweepTest: () => void;
    // SweepTestAll: () => void;
  }

  export class PhysMesh {
    constructor(system: PhysSystem)
    // set vertices
    SetVertices: (buffer: Float32Array, count: number) => void
    // set indices
    SetTriangles: (
      buffer: Uint16Array | Uint32Array,
      count: number,
      useUint16: boolean,
    ) => void
  }

  export class RaycastHit {
    constructor()
    collider: Collider
    distance: number
    normal: RawVec3f
    point: RawVec3f
    rigidbody: Rigidbody
  }
}
