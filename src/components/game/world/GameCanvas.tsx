// File: /src/components/game/world/GameCanvas.tsx
'use client'
// The three.js scene. Loaded on demand by DeferredGameCanvas so the first paint and the
// DOM game shell never pay for three, drei, rapier or postprocessing.
import { Environment, OrbitControls, Sky, Stars } from '@react-three/drei'
import { Canvas, type ThreeEvent, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import BuildingGrid from '@/components/game/buildings/BuildingGrid'
import BuildingPreview from '@/components/game/buildings/BuildingPreview'
import HtmlStructureVisualization from '@/components/game/buildings/HtmlStructureVisualization'
import PlacedBuildings from '@/components/game/buildings/PlacedBuildings'
import CameraFocusManager from '@/components/game/camera/CameraFocusManager'
import CelebrationSparkles from '@/components/game/celebrations/CelebrationSparkles'
import WeatherSystem from '@/components/game/environment/WeatherSystem'
import { PhysicsGround, PhysicsProvider } from '@/components/game/physics'
import Pixel from '@/components/game/pixel/Pixel'
import Player from '@/components/game/player/Player'
import ResourceCollectors from '@/components/game/resources/ResourceCollectors'
import ResourceFlowSystem from '@/components/game/resources/ResourceFlowSystem'
import ResourceGenerators from '@/components/game/resources/ResourceGenerators'
import UnlockedVillagers from '@/components/game/villagers/UnlockedVillagers'
import type { CelebrationType } from '@/hooks/useChallengeProgress'
import { ENVIRONMENT_CONFIG } from './sceneConfig'

type HtmlStructureVisualizationProps = React.ComponentProps<typeof HtmlStructureVisualization>
type BuildingPreviewProps = React.ComponentProps<typeof BuildingPreview>
type ResourceGeneratorsProps = React.ComponentProps<typeof ResourceGenerators>
type ResourceFlowSystemProps = React.ComponentProps<typeof ResourceFlowSystem>

export interface GameCanvasProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  isLowPowerDevice: boolean
  prefersReducedMotion: boolean
  weather: 'clear' | 'cloudy' | 'stormy' | 'foggy'
  weatherIntensity: number
  isBuildModeActive: boolean
  selectedBuildingTemplateId: string | null
  htmlStructureProps: HtmlStructureVisualizationProps
  buildingPreviewProps: BuildingPreviewProps
  formattedResourceGenerators: ResourceGeneratorsProps['generators']
  resourceFlows: ResourceFlowSystemProps['flows']
  pixelMood: 'concerned' | 'curious' | 'happy' | 'neutral'
  contextualTip: string
  pendingCelebration: CelebrationType | null
  clearCelebration: () => void
  onGroundClick: (event: ThreeEvent<PointerEvent>) => void
  onGroundHover: (event: ThreeEvent<PointerEvent>) => void
}

/** True while the tab is visible and the canvas is on screen, so the loop can stop otherwise. */
function useRenderLoopActive(target: React.RefObject<HTMLElement | null>): boolean {
  const [tabVisible, setTabVisible] = useState(true)
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden')
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    const el = target.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return tabVisible && onScreen
}

const SceneContent = () => {
  const { gl, scene } = useThree()

  React.useEffect(() => {
    if (gl && scene) {
      scene.fog = new THREE.Fog(
        ENVIRONMENT_CONFIG.fog.color,
        ENVIRONMENT_CONFIG.fog.near,
        ENVIRONMENT_CONFIG.fog.far
      )
    }
  }, [gl, scene])

  return (
    <group>
      <ambientLight intensity={0.4} />
      <hemisphereLight
        intensity={0.6}
        color="#ffffff"
        groundColor={ENVIRONMENT_CONFIG.scene.groundColor}
      />
    </group>
  )
}

export default function GameCanvas({
  controlsRef,
  isLowPowerDevice,
  prefersReducedMotion,
  weather,
  weatherIntensity,
  isBuildModeActive,
  selectedBuildingTemplateId,
  htmlStructureProps,
  buildingPreviewProps,
  formattedResourceGenerators,
  resourceFlows,
  pixelMood,
  contextualTip,
  pendingCelebration,
  clearCelebration,
  onGroundClick: handleGroundClick,
  onGroundHover: handleGroundHover,
}: GameCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const isActive = useRenderLoopActive(wrapRef)

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        shadows
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          logarithmicDepthBuffer: true,
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{
          position: ENVIRONMENT_CONFIG.camera.position,
          fov: ENVIRONMENT_CONFIG.camera.fov,
          near: ENVIRONMENT_CONFIG.camera.near,
          far: ENVIRONMENT_CONFIG.camera.far,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        dpr={isLowPowerDevice ? [1, 1.25] : [1, 2]}
        frameloop={isActive ? 'always' : 'never'}
        linear
      >
        {/* Scene setup */}
        <color attach="background" args={[ENVIRONMENT_CONFIG.scene.background]} />
        <fog
          attach="fog"
          args={[
            ENVIRONMENT_CONFIG.fog.color,
            ENVIRONMENT_CONFIG.fog.near,
            ENVIRONMENT_CONFIG.fog.far,
          ]}
        />

        {/* Sky and environment first */}
        <Sky
          distance={ENVIRONMENT_CONFIG.sky.distance}
          sunPosition={ENVIRONMENT_CONFIG.sky.sunPosition}
          inclination={ENVIRONMENT_CONFIG.sky.inclination}
          azimuth={ENVIRONMENT_CONFIG.sky.azimuth}
          mieCoefficient={ENVIRONMENT_CONFIG.sky.mieCoefficient}
          mieDirectionalG={ENVIRONMENT_CONFIG.sky.mieDirectionalG}
          rayleigh={ENVIRONMENT_CONFIG.sky.rayleigh}
          turbidity={ENVIRONMENT_CONFIG.sky.turbidity}
        />
        <Stars
          radius={ENVIRONMENT_CONFIG.stars.radius}
          depth={ENVIRONMENT_CONFIG.stars.depth}
          count={isLowPowerDevice ? 2000 : ENVIRONMENT_CONFIG.stars.count}
          factor={ENVIRONMENT_CONFIG.stars.factor}
          saturation={ENVIRONMENT_CONFIG.stars.saturation}
          fade={ENVIRONMENT_CONFIG.stars.fade}
        />

        {/* Rest of scene content */}
        <Suspense fallback={null}>
          <SceneContent />

          {/* Physics-enabled Scene Content */}
          <PhysicsProvider gravity={[0, -9.81, 0]}>
            <PhysicsGround
              onClick={handleGroundClick}
              onPointerMove={handleGroundHover}
              color={ENVIRONMENT_CONFIG.scene.groundColor}
              size={ENVIRONMENT_CONFIG.grid.width}
            />

            <BuildingGrid
              width={ENVIRONMENT_CONFIG.grid.width}
              height={ENVIRONMENT_CONFIG.grid.height}
              cellSize={ENVIRONMENT_CONFIG.grid.cellSize}
              showGridLines={isBuildModeActive}
            />

            {/* Weather - reduced or disabled for accessibility/performance */}
            {!prefersReducedMotion && (
              <WeatherSystem
                currentWeather={weather}
                intensity={isLowPowerDevice ? weatherIntensity * 0.5 : weatherIntensity}
              />
            )}

            {/* Colony Structure */}
            <group name="colony-root">
              <HtmlStructureVisualization {...htmlStructureProps} />

              {/* Resource section spread out in a wider area */}
              <group name="section-resources">
                <group position={[-20, 0, -20]}>
                  <ResourceCollectors />
                </group>
                <group position={[0, 0, -15]}>
                  <ResourceGenerators
                    generators={formattedResourceGenerators.map((gen, index) => ({
                      ...gen,
                      position: [
                        (index - formattedResourceGenerators.length / 2) * 15,
                        0,
                        index % 2 === 0 ? -5 : 5,
                      ],
                    }))}
                    showProductionEffects={true}
                  />
                </group>
                <ResourceFlowSystem
                  flows={resourceFlows.map((flow) => ({
                    ...flow,
                    from: [flow.from[0], flow.from[1], flow.from[2] - 15],
                    to: [0, 5, 0],
                  }))}
                />
              </group>

              <group name="section-buildings" position={[-10, 0, 0]}>
                <PlacedBuildings />
                {isBuildModeActive && selectedBuildingTemplateId && (
                  <BuildingPreview {...buildingPreviewProps} />
                )}
              </group>

              <group name="section-villagers" position={[0, 0, 10]}>
                <UnlockedVillagers />
              </group>

              <Player />
              <Pixel mood={pixelMood} contextualTip={contextualTip} />
            </group>

            <Environment preset="sunset" background={false} blur={0.8} />

            <directionalLight
              position={[50, 50, 25]}
              intensity={0.4}
              castShadow
              shadow-mapSize={isLowPowerDevice ? [1024, 1024] : [2048, 2048]}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
            />
          </PhysicsProvider>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={ENVIRONMENT_CONFIG.camera.minDistance}
          maxDistance={ENVIRONMENT_CONFIG.camera.maxDistance}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          screenSpacePanning={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          // Set initial target to center of resources
          target={[0, 0, -15]}
        />

        {/* Camera Focus Manager - handles smooth camera transitions when buildings are selected */}
        <CameraFocusManager
          controlsRef={controlsRef}
          config={{
            focusDistance: 10,
            focusHeightOffset: 6,
            animationDuration: 0.8,
          }}
        />

        {/* Celebration Effects */}
        {pendingCelebration && (
          <CelebrationSparkles
            position={[0, 3, -15]}
            type={pendingCelebration}
            onComplete={clearCelebration}
          />
        )}

        {/* Post-processing effects - disabled on mobile for performance */}
        {!isLowPowerDevice && (
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
