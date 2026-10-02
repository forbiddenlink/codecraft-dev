// Shared by the DOM game shell and the lazily loaded 3D canvas, so the shell never imports three.
export const ENVIRONMENT_CONFIG = {
  stars: {
    radius: 300,
    depth: 150,
    count: 5000,
    factor: 7,
    saturation: 1,
    fade: true,
  },
  sky: {
    distance: 450000,
    sunPosition: [0, -1, 0] as [number, number, number],
    inclination: 0.1,
    azimuth: 0.25,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.85,
    rayleigh: 0.3,
    turbidity: 2,
  },
  fog: {
    color: '#0f172a',
    near: 150,
    far: 500,
  },
  grid: {
    width: 200,
    height: 200,
    cellSize: 5,
  },
  scene: {
    background: '#0f172a',
    groundColor: '#1e293b',
  },
  camera: {
    position: [20, 25, 35] as [number, number, number],
    fov: 45,
    near: 0.1,
    far: 1000,
    minDistance: 5,
    maxDistance: 50,
  },
}
