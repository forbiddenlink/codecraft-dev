/**
 * Performance Optimization Utilities for CodeCraft
 * Ensures smooth 60fps rendering and efficient resource usage
 */

import * as THREE from 'three';

export class PerformanceOptimizer {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private targetFPS = 60;

  /**
   * Monitor FPS and adjust quality settings
   */
  monitorPerformance(callback: (fps: number) => void): () => void {
    const interval = setInterval(() => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      
      if (deltaTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / deltaTime);
        callback(this.fps);
        
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
    }, 100);

    return () => clearInterval(interval);
  }

  /**
   * Optimize Three.js renderer settings
   */
  optimizeRenderer(renderer: THREE.WebGLRenderer): void {
    // TODO: powerPreference and antialias are constructor options, not settable properties
    // These should be set when creating the renderer
    // renderer.powerPreference = 'high-performance';
    // renderer.antialias = this.fps >= 55; // Disable AA if FPS drops

    // Optimize shadow settings
    renderer.shadowMap.enabled = this.fps >= 50;
    renderer.shadowMap.type = this.fps >= 55 
      ? THREE.PCFSoftShadowMap 
      : THREE.BasicShadowMap;
    
    // Pixel ratio optimization
    const pixelRatio = this.fps >= 55 ? Math.min(window.devicePixelRatio, 2) : 1;
    renderer.setPixelRatio(pixelRatio);
    
    // Tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    console.log(`✅ Renderer optimized for ${this.fps} FPS`);
  }

  /**
   * Optimize geometry for better performance
   */
  optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // Compute bounding sphere for frustum culling
    geometry.computeBoundingSphere();
    
    // Compute vertex normals if not present
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
    
    return geometry;
  }

  /**
   * Create LOD (Level of Detail) system
   */
  createLOD(
    highDetail: THREE.Object3D,
    mediumDetail: THREE.Object3D,
    lowDetail: THREE.Object3D
  ): THREE.LOD {
    const lod = new THREE.LOD();
    
    lod.addLevel(highDetail, 0);      // 0-20 units
    lod.addLevel(mediumDetail, 20);   // 20-50 units
    lod.addLevel(lowDetail, 50);      // 50+ units
    
    return lod;
  }

  /**
   * Object pooling for frequently created/destroyed objects
   */
  createObjectPool<T>(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    const pool: T[] = [];
    
    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      pool.push(factory());
    }

    return {
      acquire: (): T => {
        if (pool.length > 0) {
          return pool.pop()!;
        }
        return factory();
      },
      release: (obj: T): void => {
        reset(obj);
        pool.push(obj);
      },
      size: () => pool.length
    };
  }

  /**
   * Debounce function for expensive operations
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function for frequent events
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Optimize texture loading
   */
  optimizeTexture(texture: THREE.Texture): THREE.Texture {
    // Enable mipmaps
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // Anisotropic filtering (improves quality at angles)
    texture.anisotropy = 4;
    
    return texture;
  }

  /**
   * Frustum culling helper
   */
  setupFrustumCulling(camera: THREE.Camera, objects: THREE.Object3D[]): () => void {
    const frustum = new THREE.Frustum();
    const cameraViewProjectionMatrix = new THREE.Matrix4();

    return () => {
      // Update frustum
      cameraViewProjectionMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

      // Cull objects outside frustum
      objects.forEach(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.visible = frustum.intersectsObject(obj);
        }
      });
    };
  }

  /**
   * Memory cleanup for disposed objects
   */
  disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Dispose geometry
        if (child.geometry) {
          child.geometry.dispose();
        }

        // Dispose materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => this.disposeMaterial(material));
          } else {
            this.disposeMaterial(child.material);
          }
        }
      }
    });
  }

  /**
   * Dispose material and its textures
   */
  private disposeMaterial(material: THREE.Material): void {
    material.dispose();

    // Dispose textures
    Object.keys(material).forEach(key => {
      const value = (material as any)[key];
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    });
  }

  /**
   * Batch draw calls by merging geometries
   * TODO: Import BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
   */
  mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    // return THREE.BufferGeometryUtils.mergeGeometries(geometries);
    // For now, just return the first geometry as a placeholder
    return geometries[0] || new THREE.BufferGeometry();
  }

  /**
   * Instanced rendering for repeated objects
   */
  createInstancedMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    count: number
  ): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    
    // Set up instance matrix
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      matrix.setPosition(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      );
      mesh.setMatrixAt(i, matrix);
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  /**
   * Adaptive quality based on FPS
   */
  getQualitySettings(): {
    shadows: boolean;
    antialiasing: boolean;
    particleCount: number;
    renderDistance: number;
    pixelRatio: number;
  } {
    if (this.fps >= 55) {
      return {
        shadows: true,
        antialiasing: true,
        particleCount: 1000,
        renderDistance: 200,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
      };
    } else if (this.fps >= 45) {
      return {
        shadows: true,
        antialiasing: false,
        particleCount: 500,
        renderDistance: 150,
        pixelRatio: 1.5
      };
    } else if (this.fps >= 30) {
      return {
        shadows: false,
        antialiasing: false,
        particleCount: 250,
        renderDistance: 100,
        pixelRatio: 1
      };
    } else {
      return {
        shadows: false,
        antialiasing: false,
        particleCount: 100,
        renderDistance: 75,
        pixelRatio: 1
      };
    }
  }

  /**
   * Request animation frame with FPS limiting
   */
  createAnimationLoop(
    callback: (deltaTime: number) => void,
    targetFPS: number = 60
  ): () => void {
    let lastTime = performance.now();
    const interval = 1000 / targetFPS;
    let animationId: number;

    const loop = (currentTime: number) => {
      animationId = requestAnimationFrame(loop);
      
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= interval) {
        this.frameCount++;
        callback(deltaTime / 1000); // Convert to seconds
        lastTime = currentTime - (deltaTime % interval);
      }
    };

    animationId = requestAnimationFrame(loop);

    // Return cleanup function
    return () => cancelAnimationFrame(animationId);
  }

  /**
   * Measure performance of a function
   */
  measurePerformance<T>(
    name: string,
    func: () => T
  ): T {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood(): boolean {
    return this.fps >= this.targetFPS * 0.9; // Within 10% of target
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// React hook for performance monitoring
export function usePerformanceMonitor(onFPSChange?: (fps: number) => void) {
  const [fps, setFPS] = React.useState(60);
  const [quality, setQuality] = React.useState(performanceOptimizer.getQualitySettings());

  React.useEffect(() => {
    const cleanup = performanceOptimizer.monitorPerformance((newFPS) => {
      setFPS(newFPS);
      setQuality(performanceOptimizer.getQualitySettings());
      onFPSChange?.(newFPS);
    });

    return cleanup;
  }, [onFPSChange]);

  return { fps, quality };
}

// Import React for the hook
import React from 'react';

