/**
 * Three.js Performance Optimizations
 * Implements instanced rendering, LOD, and other performance enhancements
 */

import * as THREE from 'three';

// Object Pool for frequent allocations
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }
}

// Particle System Pool
export const particlePool = new ObjectPool<THREE.Vector3>(
  () => new THREE.Vector3(),
  (v) => v.set(0, 0, 0),
  100
);

// Instanced Mesh Manager
export class InstancedMeshManager {
  private mesh: THREE.InstancedMesh;
  private count: number;
  private maxCount: number;
  private matrix = new THREE.Matrix4();
  private position = new THREE.Vector3();
  private rotation = new THREE.Euler();
  private quaternion = new THREE.Quaternion();
  private scale = new THREE.Vector3(1, 1, 1);

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, maxCount: number) {
    this.mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    this.maxCount = maxCount;
    this.count = 0;

    // Enable frustum culling
    this.mesh.frustumCulled = true;
  }

  addInstance(
    position: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): number {
    if (this.count >= this.maxCount) {
      console.warn('Maximum instance count reached');
      return -1;
    }

    this.position.copy(position);

    if (rotation) {
      this.quaternion.setFromEuler(rotation);
    } else {
      this.quaternion.set(0, 0, 0, 1);
    }

    if (scale) {
      this.scale.copy(scale);
    } else {
      this.scale.set(1, 1, 1);
    }

    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.mesh.setMatrixAt(this.count, this.matrix);

    const index = this.count;
    this.count++;
    this.mesh.instanceMatrix.needsUpdate = true;

    return index;
  }

  updateInstance(
    index: number,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): void {
    if (index < 0 || index >= this.count) return;

    // Get current transform
    this.mesh.getMatrixAt(index, this.matrix);
    this.matrix.decompose(this.position, this.quaternion, this.scale);

    // Update components
    if (position) this.position.copy(position);
    if (rotation) this.quaternion.setFromEuler(rotation);
    if (scale) this.scale.copy(scale);

    // Set new transform
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.mesh.setMatrixAt(index, this.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  setColor(index: number, color: THREE.Color): void {
    if (!this.mesh.instanceColor) {
      this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(this.maxCount * 3),
        3
      );
    }

    this.mesh.instanceColor.setXYZ(index, color.r, color.g, color.b);
    this.mesh.instanceColor.needsUpdate = true;
  }

  getMesh(): THREE.InstancedMesh {
    return this.mesh;
  }

  clear(): void {
    this.count = 0;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((mat) => mat.dispose());
    } else {
      this.mesh.material.dispose();
    }
  }
}

// LOD (Level of Detail) Helper
export class LODManager {
  private lods: THREE.LOD[] = [];

  createLOD(
    geometries: THREE.BufferGeometry[],
    material: THREE.Material,
    distances: number[]
  ): THREE.LOD {
    const lod = new THREE.LOD();

    geometries.forEach((geometry, index) => {
      const mesh = new THREE.Mesh(geometry, material);
      lod.addLevel(mesh, distances[index] || index * 50);
    });

    this.lods.push(lod);
    return lod;
  }

  update(camera: THREE.Camera): void {
    this.lods.forEach((lod) => lod.update(camera));
  }

  dispose(): void {
    this.lods.forEach((lod) => {
      lod.levels.forEach((level) => {
        if (level.object instanceof THREE.Mesh) {
          level.object.geometry.dispose();
          if (Array.isArray(level.object.material)) {
            level.object.material.forEach((mat) => mat.dispose());
          } else {
            level.object.material.dispose();
          }
        }
      });
    });
    this.lods = [];
  }
}

// Geometry Optimization
export function optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  // Compute bounding sphere for frustum culling
  geometry.computeBoundingSphere();

  // Compute vertex normals if needed
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }

  // Merge vertices to reduce draw calls
  // geometry = BufferGeometryUtils.mergeVertices(geometry); // Requires import

  return geometry;
}

// Texture Optimization
export function optimizeTexture(texture: THREE.Texture): THREE.Texture {
  // Generate mipmaps
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Anisotropic filtering
  texture.anisotropy = 16;

  return texture;
}

// Material Optimization
export function optimizeMaterial(material: THREE.Material): THREE.Material {
  // Enable flat shading for better performance if possible
  if ('flatShading' in material) {
    (material as THREE.MeshStandardMaterial).flatShading = false;
  }

  // Reduce precision for mobile
  if ('precision' in material) {
    (material as any).precision = 'mediump';
  }

  return material;
}

// Frustum Culling Helper
export class FrustumCuller {
  private frustum = new THREE.Frustum();
  private matrix = new THREE.Matrix4();

  updateFrustum(camera: THREE.Camera): void {
    camera.updateMatrixWorld();
    this.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.matrix);
  }

  isVisible(object: THREE.Object3D): boolean {
    // Only Mesh objects have geometry
    if (!(object instanceof THREE.Mesh) || !object.geometry) return true;

    // Check bounding sphere
    if (object.geometry.boundingSphere) {
      const sphere = object.geometry.boundingSphere.clone();
      sphere.applyMatrix4(object.matrixWorld);
      return this.frustum.intersectsSphere(sphere);
    }

    return true;
  }

  cullObjects(objects: THREE.Object3D[]): THREE.Object3D[] {
    return objects.filter((obj) => this.isVisible(obj));
  }
}

// Render Budget Manager
export class RenderBudgetManager {
  private frameTime = 16.67; // 60 FPS target
  private lastFrameTime = 0;
  private fpsSamples: number[] = [];
  private maxSamples = 60;

  measureFrame(): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.fpsSamples.push(delta);
    if (this.fpsSamples.length > this.maxSamples) {
      this.fpsSamples.shift();
    }
  }

  getAverageFPS(): number {
    if (this.fpsSamples.length === 0) return 60;

    const avgDelta =
      this.fpsSamples.reduce((sum, delta) => sum + delta, 0) / this.fpsSamples.length;
    return 1000 / avgDelta;
  }

  isUnderBudget(): boolean {
    return this.getAverageFPS() >= 55; // Allow 5 FPS margin
  }

  getQualityMultiplier(): number {
    const fps = this.getAverageFPS();

    if (fps >= 58) return 1.0; // High quality
    if (fps >= 45) return 0.75; // Medium quality
    if (fps >= 30) return 0.5; // Low quality
    return 0.25; // Minimal quality
  }
}

// Batch Renderer
export class BatchRenderer {
  private batches: Map<string, THREE.Mesh[]> = new Map();

  addToBatch(key: string, mesh: THREE.Mesh): void {
    if (!this.batches.has(key)) {
      this.batches.set(key, []);
    }
    this.batches.get(key)!.push(mesh);
  }

  createInstancedMesh(key: string): THREE.InstancedMesh | null {
    const meshes = this.batches.get(key);
    if (!meshes || meshes.length === 0) return null;

    const geometry = meshes[0].geometry;
    const material = meshes[0].material;

    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material as THREE.Material,
      meshes.length
    );

    const matrix = new THREE.Matrix4();
    meshes.forEach((mesh, index) => {
      mesh.updateMatrix();
      instancedMesh.setMatrixAt(index, mesh.matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }

  clear(): void {
    this.batches.clear();
  }
}

// Dispose Helper
export function disposeObject(obj: THREE.Object3D): void {
  if (obj instanceof THREE.Mesh) {
    obj.geometry?.dispose();

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => mat.dispose());
      } else {
        obj.material.dispose();
      }
    }
  }

  obj.children.forEach((child) => disposeObject(child));
}

// Memory Monitor
export class MemoryMonitor {
  getMemoryUsage(): { geometries: number; textures: number } {
    return {
      geometries: (THREE as any).Cache?.files?.size || 0,
      textures: 0, // Would need to track manually
    };
  }

  logMemoryUsage(): void {
    const usage = this.getMemoryUsage();
    console.log('Memory Usage:', usage);

    // performance.memory is a non-standard Chrome-only feature
    if ((performance as any).memory) {
      console.log('JS Heap:', {
        used: ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: ((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      });
    }
  }
}
