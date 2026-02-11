'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex shader - passes UV coordinates and position to fragment shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader - creates animated data flow effect
const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uSpeed;
  uniform float uDensity;
  uniform float uGlowIntensity;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Creates flowing digital rain / matrix effect
  float digitalRain(vec2 uv, float time) {
    // Create columns for the rain effect
    float columns = floor(uv.x * uDensity);
    float columnOffset = random(vec2(columns, 0.0));

    // Animate downward flow with per-column variation
    float flowSpeed = uSpeed * (0.5 + columnOffset * 0.5);
    float flow = fract(uv.y * 2.0 - time * flowSpeed + columnOffset);

    // Create discrete "characters" in the rain
    float charHeight = 0.1;
    float charY = floor(flow / charHeight) * charHeight;
    float charIntensity = random(vec2(columns, charY + floor(time * 2.0)));

    // Fade at edges of each character
    float charFade = smoothstep(0.0, 0.3, flow) * smoothstep(1.0, 0.7, flow);

    // Combine for final rain intensity
    float rain = step(0.5, charIntensity) * charFade;

    // Add trail effect
    float trail = exp(-flow * 3.0) * 0.5;

    return rain + trail;
  }

  // Creates circuit board trace pattern
  float circuitTraces(vec2 uv, float time) {
    // Grid-based circuit pattern
    vec2 grid = uv * uDensity * 0.5;
    vec2 gridId = floor(grid);
    vec2 gridUv = fract(grid);

    float circuit = 0.0;

    // Horizontal traces
    float hTrace = smoothstep(0.48, 0.5, gridUv.y) * smoothstep(0.52, 0.5, gridUv.y);
    // Animate trace segments
    float hAnim = step(0.3, random(gridId)) * step(fract(gridId.x * 0.1 + time * uSpeed * 0.5), 0.5);
    circuit += hTrace * hAnim;

    // Vertical traces
    float vTrace = smoothstep(0.48, 0.5, gridUv.x) * smoothstep(0.52, 0.5, gridUv.x);
    float vAnim = step(0.3, random(gridId + 100.0)) * step(fract(gridId.y * 0.1 + time * uSpeed * 0.3), 0.5);
    circuit += vTrace * vAnim;

    // Node points at intersections
    float node = length(gridUv - 0.5);
    float nodePulse = sin(time * 3.0 + random(gridId) * 6.28) * 0.5 + 0.5;
    float nodeGlow = smoothstep(0.2, 0.0, node) * step(0.7, random(gridId + 50.0)) * nodePulse;
    circuit += nodeGlow;

    return circuit;
  }

  // Creates data packet flow effect
  float dataPackets(vec2 uv, float time) {
    float packets = 0.0;

    // Multiple packet streams
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float streamX = 0.2 + fi * 0.3;
      float packetY = fract(time * uSpeed * (0.5 + fi * 0.2) + fi * 0.33);

      // Distance to packet center
      vec2 packetPos = vec2(streamX, packetY);
      float dist = length((uv - packetPos) * vec2(1.0, 3.0));

      // Glowing packet
      float packet = smoothstep(0.15, 0.0, dist);
      packets += packet;
    }

    return packets;
  }

  void main() {
    // Combine effects
    float rain = digitalRain(vUv, uTime);
    float circuit = circuitTraces(vUv, uTime);
    float packets = dataPackets(vUv, uTime);

    // Mix effects together
    float combined = rain * 0.4 + circuit * 0.4 + packets * 0.5;

    // Apply glow
    vec3 glow = uColor * combined * uGlowIntensity;

    // Edge glow effect based on position
    float edgeFactor = 1.0 - smoothstep(0.3, 0.5, abs(vUv.x - 0.5)) * smoothstep(0.3, 0.5, abs(vUv.y - 0.5));
    glow += uColor * edgeFactor * 0.2;

    // Final color with transparency
    float alpha = combined * uOpacity + edgeFactor * uOpacity * 0.3;

    gl_FragColor = vec4(glow, alpha);
  }
`;

// Create shader material with uniforms
function createDataFlowMaterial(
  color: THREE.Color,
  opacity: number,
  speed: number,
  density: number,
  glowIntensity: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: color },
      uOpacity: { value: opacity },
      uSpeed: { value: speed },
      uDensity: { value: density },
      uGlowIntensity: { value: glowIntensity },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

interface DataFlowShaderProps {
  // Dimensions of the building to wrap
  width?: number;
  height?: number;
  depth?: number;
  // Color theme for the effect
  color?: string;
  // Animation speed multiplier
  speed?: number;
  // Effect density (more columns/traces)
  density?: number;
  // Overall opacity of the effect
  opacity?: number;
  // Glow intensity for bloom effect
  glowIntensity?: number;
  // Whether the effect is active
  isActive?: boolean;
  // Offset from building surface
  offset?: number;
}

/**
 * DataFlowShader - Creates a holographic data flow effect overlay for code-generated buildings
 *
 * Features:
 * - Matrix-style falling code animation
 * - Circuit board trace patterns
 * - Animated data packet flows
 * - Edge glow effects
 *
 * Usage: Wrap around or overlay on buildings that were generated from user code
 */
export default function DataFlowShader({
  width = 2,
  height = 2,
  depth = 2,
  color = '#00ff88',
  speed = 1.0,
  density = 10.0,
  opacity = 0.4,
  glowIntensity = 1.5,
  isActive = true,
  offset = 0.05
}: DataFlowShaderProps) {
  // Create materials for each face
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  const frontMaterial = useMemo(
    () => createDataFlowMaterial(threeColor, opacity, speed, density, glowIntensity),
    [threeColor, opacity, speed, density, glowIntensity]
  );

  const sideMaterial = useMemo(
    () => createDataFlowMaterial(threeColor, opacity * 0.8, speed, density, glowIntensity),
    [threeColor, opacity, speed, density, glowIntensity]
  );

  const topMaterial = useMemo(
    () => createDataFlowMaterial(threeColor, opacity * 0.6, speed, density, glowIntensity),
    [threeColor, opacity, speed, density, glowIntensity]
  );

  // Store refs to all materials for animation
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);

  // Animate the shaders
  useFrame((state) => {
    if (isActive) {
      const time = state.clock.elapsedTime;
      materialsRef.current.forEach(material => {
        if (material?.uniforms?.uTime) {
          material.uniforms.uTime.value = time;
        }
      });
    }
  });

  // Don't render if not active
  if (!isActive) return null;

  // Calculate slightly larger dimensions for the overlay
  const overlayWidth = width + offset * 2;
  const overlayHeight = height + offset * 2;
  const overlayDepth = depth + offset * 2;

  // Store materials in ref for animation
  materialsRef.current = [frontMaterial, sideMaterial, topMaterial];

  return (
    <group>
      {/* Front face */}
      <mesh position={[0, 0, depth / 2 + offset]}>
        <planeGeometry args={[overlayWidth, overlayHeight]} />
        <primitive object={frontMaterial} attach="material" />
      </mesh>

      {/* Back face */}
      <mesh position={[0, 0, -depth / 2 - offset]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[overlayWidth, overlayHeight]} />
        <primitive object={frontMaterial} attach="material" />
      </mesh>

      {/* Left face */}
      <mesh position={[-width / 2 - offset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[overlayDepth, overlayHeight]} />
        <primitive object={sideMaterial} attach="material" />
      </mesh>

      {/* Right face */}
      <mesh position={[width / 2 + offset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[overlayDepth, overlayHeight]} />
        <primitive object={sideMaterial} attach="material" />
      </mesh>

      {/* Top face */}
      <mesh position={[0, height / 2 + offset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[overlayWidth, overlayDepth]} />
        <primitive object={topMaterial} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * Simplified version that wraps a single face - useful for flat overlays
 */
export function DataFlowPlane({
  width = 2,
  height = 2,
  color = '#00ff88',
  speed = 1.0,
  density = 10.0,
  opacity = 0.4,
  glowIntensity = 1.5,
  isActive = true,
}: Omit<DataFlowShaderProps, 'depth' | 'offset'>) {
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  const material = useMemo(
    () => createDataFlowMaterial(threeColor, opacity, speed, density, glowIntensity),
    [threeColor, opacity, speed, density, glowIntensity]
  );

  useFrame((state) => {
    if (material && isActive) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!isActive) return null;

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
