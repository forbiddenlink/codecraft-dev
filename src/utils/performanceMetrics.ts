/**
 * WebGL Performance Metrics Utilities
 * Provides tools for measuring and monitoring 3D scene performance
 */

import type { WebGLRenderer } from 'three';

export interface WebGLMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  geometries: number;
  programs: number;
  timestamp: number;
}

export interface PerformanceSnapshot {
  metrics: WebGLMetrics;
  frameTime: number;
  memoryUsage?: MemoryInfo;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceBaseline {
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgDrawCalls: number;
  avgTriangles: number;
  sampleCount: number;
  duration: number;
}

/**
 * Extracts WebGL metrics from a Three.js renderer
 */
export function getWebGLMetrics(renderer: WebGLRenderer): WebGLMetrics {
  const info = renderer.info;
  return {
    fps: 0, // FPS must be calculated externally
    drawCalls: info.render?.calls ?? 0,
    triangles: info.render?.triangles ?? 0,
    textures: info.memory?.textures ?? 0,
    geometries: info.memory?.geometries ?? 0,
    programs: info.programs?.length ?? 0,
    timestamp: performance.now(),
  };
}

/**
 * Gets memory information if available (Chrome only)
 */
export function getMemoryInfo(): MemoryInfo | undefined {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as Performance & { memory?: MemoryInfo }).memory;
    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
  }
  return undefined;
}

/**
 * Performance monitor class for tracking WebGL metrics over time
 */
export class PerformanceMonitor {
  private samples: PerformanceSnapshot[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = 0;
  private currentFps: number = 0;
  private isRunning: boolean = false;
  private onSample?: (snapshot: PerformanceSnapshot) => void;

  constructor(options?: {
    fpsUpdateInterval?: number;
    onSample?: (snapshot: PerformanceSnapshot) => void;
  }) {
    if (options?.fpsUpdateInterval) {
      this.fpsUpdateInterval = options.fpsUpdateInterval;
    }
    if (options?.onSample) {
      this.onSample = options.onSample;
    }
  }

  /**
   * Start monitoring - call this in your animation loop
   */
  start(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = performance.now();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Record a frame - call this at the end of each render
   */
  recordFrame(renderer: WebGLRenderer): PerformanceSnapshot | null {
    if (!this.isRunning) return null;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    // Update FPS calculation
    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.currentFps = Math.round(
        (this.frameCount * 1000) / (now - this.lastFpsUpdate)
      );
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    const metrics = getWebGLMetrics(renderer);
    metrics.fps = this.currentFps;

    const snapshot: PerformanceSnapshot = {
      metrics,
      frameTime,
      memoryUsage: getMemoryInfo(),
    };

    this.samples.push(snapshot);
    this.onSample?.(snapshot);

    return snapshot;
  }

  /**
   * Get the baseline from collected samples
   */
  getBaseline(): PerformanceBaseline | null {
    if (this.samples.length === 0) return null;

    const fpsValues = this.samples.map((s) => s.metrics.fps).filter((f) => f > 0);
    const drawCallValues = this.samples.map((s) => s.metrics.drawCalls);
    const triangleValues = this.samples.map((s) => s.metrics.triangles);

    const firstTimestamp = this.samples[0].metrics.timestamp;
    const lastTimestamp = this.samples[this.samples.length - 1].metrics.timestamp;

    return {
      avgFps: fpsValues.length > 0
        ? Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length)
        : 0,
      minFps: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
      maxFps: fpsValues.length > 0 ? Math.max(...fpsValues) : 0,
      avgDrawCalls: Math.round(
        drawCallValues.reduce((a, b) => a + b, 0) / drawCallValues.length
      ),
      avgTriangles: Math.round(
        triangleValues.reduce((a, b) => a + b, 0) / triangleValues.length
      ),
      sampleCount: this.samples.length,
      duration: lastTimestamp - firstTimestamp,
    };
  }

  /**
   * Clear all collected samples
   */
  clear(): void {
    this.samples = [];
    this.frameCount = 0;
    this.currentFps = 0;
  }

  /**
   * Get raw samples
   */
  getSamples(): PerformanceSnapshot[] {
    return [...this.samples];
  }

  /**
   * Check if performance meets target
   */
  meetsTarget(targetFps: number = 30): boolean {
    const baseline = this.getBaseline();
    if (!baseline) return false;
    return baseline.avgFps >= targetFps;
  }
}

/**
 * Format metrics for logging
 */
export function formatMetrics(metrics: WebGLMetrics): string {
  return [
    `FPS: ${metrics.fps}`,
    `Draw calls: ${metrics.drawCalls}`,
    `Triangles: ${metrics.triangles.toLocaleString()}`,
    `Textures: ${metrics.textures}`,
    `Geometries: ${metrics.geometries}`,
    `Programs: ${metrics.programs}`,
  ].join(' | ');
}

/**
 * Format baseline for reporting
 */
export function formatBaseline(baseline: PerformanceBaseline): string {
  return [
    `Performance Baseline (${baseline.sampleCount} samples, ${(baseline.duration / 1000).toFixed(1)}s)`,
    `  FPS: ${baseline.avgFps} avg (${baseline.minFps}-${baseline.maxFps})`,
    `  Draw calls: ${baseline.avgDrawCalls} avg`,
    `  Triangles: ${baseline.avgTriangles.toLocaleString()} avg`,
  ].join('\n');
}

/**
 * Performance thresholds for different device tiers
 */
export const PERFORMANCE_THRESHOLDS = {
  high: {
    minFps: 60,
    maxDrawCalls: 200,
    maxTriangles: 500000,
  },
  medium: {
    minFps: 30,
    maxDrawCalls: 100,
    maxTriangles: 200000,
  },
  low: {
    minFps: 20,
    maxDrawCalls: 50,
    maxTriangles: 50000,
  },
} as const;

/**
 * Determine device tier based on metrics
 */
export function getDeviceTier(metrics: WebGLMetrics): 'high' | 'medium' | 'low' {
  if (
    metrics.fps >= PERFORMANCE_THRESHOLDS.high.minFps &&
    metrics.drawCalls <= PERFORMANCE_THRESHOLDS.high.maxDrawCalls
  ) {
    return 'high';
  }
  if (
    metrics.fps >= PERFORMANCE_THRESHOLDS.medium.minFps &&
    metrics.drawCalls <= PERFORMANCE_THRESHOLDS.medium.maxDrawCalls
  ) {
    return 'medium';
  }
  return 'low';
}
