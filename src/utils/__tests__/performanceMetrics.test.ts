import {
  PerformanceMonitor,
  formatMetrics,
  formatBaseline,
  getDeviceTier,
  PERFORMANCE_THRESHOLDS,
  WebGLMetrics,
  PerformanceBaseline,
} from '../performanceMetrics';

// Mock Three.js WebGLRenderer
const createMockRenderer = (overrides?: Partial<{
  calls: number;
  triangles: number;
  textures: number;
  geometries: number;
  programs: { length: number };
}>) => ({
  info: {
    render: {
      calls: overrides?.calls ?? 50,
      triangles: overrides?.triangles ?? 10000,
      frame: 0,
    },
    memory: {
      textures: overrides?.textures ?? 5,
      geometries: overrides?.geometries ?? 10,
    },
    programs: overrides?.programs ?? { length: 3 },
  },
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('creates a new monitor instance', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('accepts custom fps update interval', () => {
      const monitor = new PerformanceMonitor({ fpsUpdateInterval: 500 });
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('recording frames', () => {
    it('returns null when not started', () => {
      const monitor = new PerformanceMonitor();
      const mockRenderer = createMockRenderer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = monitor.recordFrame(mockRenderer as any);
      expect(result).toBeNull();
    });

    it('records snapshot after starting', () => {
      const monitor = new PerformanceMonitor();
      monitor.start();
      const mockRenderer = createMockRenderer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = monitor.recordFrame(mockRenderer as any);
      expect(result).not.toBeNull();
      expect(result?.metrics.drawCalls).toBe(50);
      expect(result?.metrics.triangles).toBe(10000);
    });

    it('calls onSample callback', () => {
      const onSample = jest.fn();
      const monitor = new PerformanceMonitor({ onSample });
      monitor.start();
      const mockRenderer = createMockRenderer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      monitor.recordFrame(mockRenderer as any);
      expect(onSample).toHaveBeenCalledTimes(1);
    });

    it('returns null after stopping', () => {
      const monitor = new PerformanceMonitor();
      monitor.start();
      monitor.stop();
      const mockRenderer = createMockRenderer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = monitor.recordFrame(mockRenderer as any);
      expect(result).toBeNull();
    });
  });

  describe('baseline calculation', () => {
    it('returns null with no samples', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor.getBaseline()).toBeNull();
    });

    it('calculates baseline from samples', () => {
      const monitor = new PerformanceMonitor();
      monitor.start();
      const mockRenderer = createMockRenderer();

      // Record multiple frames
      for (let i = 0; i < 5; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        monitor.recordFrame(mockRenderer as any);
      }

      const baseline = monitor.getBaseline();
      expect(baseline).not.toBeNull();
      expect(baseline?.sampleCount).toBe(5);
      expect(baseline?.avgDrawCalls).toBe(50);
      expect(baseline?.avgTriangles).toBe(10000);
    });
  });

  describe('clear', () => {
    it('resets all samples', () => {
      const monitor = new PerformanceMonitor();
      monitor.start();
      const mockRenderer = createMockRenderer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      monitor.recordFrame(mockRenderer as any);
      expect(monitor.getSamples().length).toBe(1);

      monitor.clear();
      expect(monitor.getSamples().length).toBe(0);
      expect(monitor.getBaseline()).toBeNull();
    });
  });

  describe('meetsTarget', () => {
    it('returns false with no samples', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor.meetsTarget(30)).toBe(false);
    });
  });
});

describe('formatMetrics', () => {
  it('formats metrics into readable string', () => {
    const metrics: WebGLMetrics = {
      fps: 60,
      drawCalls: 100,
      triangles: 50000,
      textures: 10,
      geometries: 20,
      programs: 5,
      timestamp: Date.now(),
    };

    const formatted = formatMetrics(metrics);
    expect(formatted).toContain('FPS: 60');
    expect(formatted).toContain('Draw calls: 100');
    expect(formatted).toContain('Triangles: 50,000');
    expect(formatted).toContain('Textures: 10');
    expect(formatted).toContain('Geometries: 20');
    expect(formatted).toContain('Programs: 5');
  });
});

describe('formatBaseline', () => {
  it('formats baseline into readable string', () => {
    const baseline: PerformanceBaseline = {
      avgFps: 55,
      minFps: 30,
      maxFps: 60,
      avgDrawCalls: 80,
      avgTriangles: 45000,
      sampleCount: 100,
      duration: 10000,
    };

    const formatted = formatBaseline(baseline);
    expect(formatted).toContain('100 samples');
    expect(formatted).toContain('10.0s');
    expect(formatted).toContain('FPS: 55 avg');
    expect(formatted).toContain('30-60');
    expect(formatted).toContain('Draw calls: 80 avg');
  });
});

describe('getDeviceTier', () => {
  it('returns high tier for good metrics', () => {
    const metrics: WebGLMetrics = {
      fps: 60,
      drawCalls: 100,
      triangles: 100000,
      textures: 10,
      geometries: 20,
      programs: 5,
      timestamp: Date.now(),
    };
    expect(getDeviceTier(metrics)).toBe('high');
  });

  it('returns medium tier for moderate metrics', () => {
    const metrics: WebGLMetrics = {
      fps: 45,
      drawCalls: 80,
      triangles: 150000,
      textures: 10,
      geometries: 20,
      programs: 5,
      timestamp: Date.now(),
    };
    expect(getDeviceTier(metrics)).toBe('medium');
  });

  it('returns low tier for poor metrics', () => {
    const metrics: WebGLMetrics = {
      fps: 15,
      drawCalls: 200,
      triangles: 300000,
      textures: 10,
      geometries: 20,
      programs: 5,
      timestamp: Date.now(),
    };
    expect(getDeviceTier(metrics)).toBe('low');
  });
});

describe('PERFORMANCE_THRESHOLDS', () => {
  it('has correct tier definitions', () => {
    expect(PERFORMANCE_THRESHOLDS.high.minFps).toBe(60);
    expect(PERFORMANCE_THRESHOLDS.medium.minFps).toBe(30);
    expect(PERFORMANCE_THRESHOLDS.low.minFps).toBe(20);
  });
});
