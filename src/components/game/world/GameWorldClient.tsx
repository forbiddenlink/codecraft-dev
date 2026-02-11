"use client";
import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sky, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useIsLowPowerDevice, useReducedMotion } from '@/hooks/useResponsive';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEditorVisible } from "@/store/slices/editorSlice";
import { setTargetPosition } from "@/store/slices/playerSlice";
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RootState } from "@/store/store";
import { ParsedCSSRule, JSExecutionContext } from "@/store/slices/gameSlice";
import { parseCSSRule } from "@/utils/cssParser";
import ResourceCollectors from "@/components/game/resources/ResourceCollectors";
import ResourceFlowSystem from "@/components/game/resources/ResourceFlowSystem";
import ResourceGenerators from "@/components/game/resources/ResourceGenerators";
import PlacedBuildings from "@/components/game/buildings/PlacedBuildings";
import BuildingPreview from "@/components/game/buildings/BuildingPreview";
import BuildingGrid from "@/components/game/buildings/BuildingGrid";
import HtmlStructureVisualization from "@/components/game/buildings/HtmlStructureVisualization";
import UnlockedVillagers from "@/components/game/villagers/UnlockedVillagers";
import ErrorVisualization from "@/components/game/code/ErrorVisualization";
import WeatherSystem from "@/components/game/environment/WeatherSystem";
import CodeExecutionVisualizer from "@/components/game/code/CodeExecutionVisualizer";
import TutorialOverlay from "@/components/game/tutorial/TutorialOverlay";
import ResourceHUD from "@/components/game/hud/ResourceHUD";
import BuildingMenu from "@/components/game/buildings/BuildingMenu";
// import ChallengeHUD from '@/components/game/challenges/ChallengeHUD';
import { getAvailableChallenges } from '@/data/challenges';
import Ground from "@/components/game/ground/Ground";
import HintPanel from "@/components/game/challenges/HintPanel";
import MasteryDashboard from "@/components/game/challenges/MasteryDashboard";
import StreakDisplay from "@/components/game/streaks/StreakDisplay";
import CelebrationSparkles from "@/components/game/celebrations/CelebrationSparkles";
import { useChallengeProgress, CelebrationType } from "@/hooks/useChallengeProgress";
import { parseHtmlToStructure } from "@/utils/htmlParser";
import type { Challenge } from '@/types/challenge';
import type { HtmlNode } from '@/types/html';
import { ThreeEvent } from '@react-three/fiber';
import Player from '@/components/game/player/Player';
import Pixel from '@/components/game/pixel/Pixel';
import * as THREE from 'three';

// Environment settings
const ENVIRONMENT_CONFIG = {
  stars: {
    radius: 300,
    depth: 150,
    count: 5000,
    factor: 7,
    saturation: 1,
    fade: true
  },
  sky: {
    distance: 450000,
    sunPosition: [0, -1, 0] as [number, number, number],
    inclination: 0.1,
    azimuth: 0.25,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.85,
    rayleigh: 0.3,
    turbidity: 2
  },
  fog: {
    color: '#0f172a',
    near: 150,
    far: 500
  },
  grid: {
    width: 200,
    height: 200,
    cellSize: 5
  },
  scene: {
    background: '#0f172a',
    groundColor: '#1e293b'
  },
  camera: {
    position: [20, 25, 35] as [number, number, number],
    fov: 45,
    near: 0.1,
    far: 1000,
    minDistance: 5,
    maxDistance: 50
  }
};

// Helper function to determine sun position based on time of day (currently unused)
// function getSunPosition(timeOfDay: number): [number, number, number] {
//   const angleRad = ((timeOfDay / 24) * Math.PI * 2) - Math.PI/2;
//   const radius = 100;
//   const x = Math.cos(angleRad) * radius;
//   const y = Math.sin(angleRad) * radius;
//   const adjustedY = y < -20 ? -20 : y;
//   return [x, adjustedY, 0];
// }

// Helper to determine pixel's mood based on context
function determinePixelMood(
  challenge: Challenge | undefined,
  isEditorVisible: boolean,
  errors: Array<{ message: string }> | null
): 'concerned' | 'curious' | 'happy' | 'neutral' {
  if (errors && errors.length > 0) return 'concerned';
  if (isEditorVisible && challenge) return 'curious';
  return 'happy';
}

// Helper to generate contextual tips
function generateContextualTip(
  challenge: Challenge | undefined,
  playerProgress: Record<string, unknown>,
  resources: Record<string, number>
): string {
  if (challenge?.description) return challenge.description;
  
  const resourceArray = Object.entries(resources).map(([resourceId, amount]) => ({
    resourceId,
    amount
  }));
  
  if (resourceArray.some(r => r.amount < 20)) {
    return 'Try building more resource collectors!';
  }
  return 'Explore and build your colony!';
}

// Component Props
type HtmlStructureVisualizationProps = React.ComponentProps<typeof HtmlStructureVisualization>;
type BuildingPreviewProps = React.ComponentProps<typeof BuildingPreview>;
// type ErrorVisualizationProps = React.ComponentProps<typeof ErrorVisualization>;
// type CodeExecutionVisualizerProps = React.ComponentProps<typeof CodeExecutionVisualizer>;

interface ResourceGenerator {
  id: string;
  position: [number, number, number];
  isActive: boolean;
  type: string;
  rotation: [number, number, number];
  outputRate: number;
  resourceType: 'energy' | 'minerals' | 'water' | 'food';
  status: 'active' | 'inactive';
  efficiency: number;
  lastCollection: number;
  customizations: Record<string, unknown>;
  resources: Array<{ resourceId: string; amount: number }>;
}

interface ResourceFlow {
  from: [number, number, number];
  to: [number, number, number];
  resource: string;
  amount: number;
}

interface GameExecutionData {
  variables: Record<string, string | number | boolean | null | undefined>;
  callStack: string[];
  output: string[];
}

interface ParsedHtmlNode {
  type: string;
  attributes?: Record<string, string>;
  level?: number;
  index?: number;
  children?: ParsedHtmlNode[];
  styles?: Record<string, string>;
}

// interface ResourceGeneratorsProps {
//   generators: ResourceGenerator[];
//   showProductionEffects: boolean;
// }

// interface ResourceFlowSystemProps {
//   flows: ResourceFlow[];
// }

// Define building state interface
interface BuildingState {
  buildMode: boolean;
  selectedTemplateId: string | null;
}

// Define game state interface
interface TutorialStep {
  focusArea?: string;
  content?: string;
  position?: [number, number, number];
}

interface GameStatePartial {
  colonyResources?: Record<string, number>;
  cssRules?: ParsedCSSRule[];
  jsExecutionContext?: JSExecutionContext | null;
  tutorialActive?: boolean;
  tutorialStep?: number;
  tutorialState?: {
    active: boolean;
    step: number;
    steps: TutorialStep[];
  };
  building?: BuildingState;
  generators?: ResourceGenerator[];
}

const DarkBackground = () => (
  <mesh position={[0, 0, -100]} scale={[200, 200, 1]}>
    <planeGeometry />
    <meshBasicMaterial color={ENVIRONMENT_CONFIG.scene.background} depthTest={false} side={2} transparent opacity={1} />
  </mesh>
);

const SceneContent = () => {
  const { gl, scene } = useThree();
  
  React.useEffect(() => {
    if (gl && scene) {
      scene.fog = new THREE.Fog(
        ENVIRONMENT_CONFIG.fog.color,
        ENVIRONMENT_CONFIG.fog.near,
        ENVIRONMENT_CONFIG.fog.far
      );
    }
  }, [gl, scene]);

  return (
    <group>
      <ambientLight intensity={0.4} />
      <hemisphereLight
        intensity={0.6}
        color="#ffffff"
        groundColor={ENVIRONMENT_CONFIG.scene.groundColor}
      />
    </group>
  );
};

export default function GameWorldClient() {
  const dispatch = useAppDispatch();
  const [challengeIndex, setChallengeIndex] = useState(0);
  const { completed, pendingCelebration, clearCelebration } = useChallengeProgress();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Performance optimization: detect low-power devices and reduced motion preference
  const isLowPowerDevice = useIsLowPowerDevice();
  const prefersReducedMotion = useReducedMotion();
  
  // Game state selectors with safe defaults
  const isEditorVisible = useAppSelector((state: RootState) => state.editor.isVisible);
  const code = useAppSelector((state: RootState) => state.editor.code);
  const language = useAppSelector((state: RootState) => state.editor.language);
  const errors = useAppSelector((state: RootState) => state.editor.errors);
  const gameState = useAppSelector((state: RootState) => state.game) as GameStatePartial;

  // Safely destructure gameState with defaults
  const {
    colonyResources = {},
    cssRules = [],
    jsExecutionContext: _jsExecutionContext = {},
    tutorialActive = false,
    tutorialStep = 0,
    tutorialState = { active: false, step: 0, steps: [] },
    building = { buildMode: false, selectedTemplateId: null },
    generators = []
  } = gameState;

  const isBuildModeActive = building.buildMode;
  const selectedBuildingTemplateId = building.selectedTemplateId;
  const resourceGenerators = generators as ResourceGenerator[];
  
  // Environment state
  const [_timeOfDay, setTimeOfDay] = useState<number>(12);
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'stormy' | 'foggy'>('clear');
  const [weatherIntensity, setWeatherIntensity] = useState<number>(0.5);
  
  // Building preview state
  const [, setPreviewPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [, setIsValidPlacement] = useState(true);
  
  // Get available challenges based on completed ones
  const availableChallenges = useMemo(() => getAvailableChallenges(completed), [completed]);
  const currentChallenge = availableChallenges[challengeIndex];
  
  // Fix the HTML structure parsing
  const parsedStructure = useMemo(() => {
    if (language === 'html' && code.html) {
      try {
        const structure = parseHtmlToStructure(code.html) as ParsedHtmlNode[];
        // cssRules are already parsed in the Redux store
        const cssRulesParsed = cssRules;
        
        // Convert to HtmlNode format with proper typing
        const convertNode = (node: ParsedHtmlNode): HtmlNode => ({
          elementType: node.type || 'div',
          attributes: node.attributes || {},
          level: node.level || 0,
          index: node.index || 0,
          children: Array.isArray(node.children) ? node.children.map(convertNode) : [],
          styles: typeof node.styles === 'object' ? 
            Object.entries(node.styles || {}).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>) : {}
        });

        const convertedStructure = Array.isArray(structure) ? structure.map(convertNode) : [];
        
        // Apply CSS rules to the converted structure
        const styledStructure = convertedStructure.map(node => ({
          ...node,
          styles: {
            ...node.styles,
            ...cssRulesParsed.reduce((acc, rule) => {
              // Safely handle CSS rule declarations
              const declarations = rule && typeof rule === 'object' ? 
                Object.entries(rule).reduce((styles, [key, value]) => {
                  if (typeof value === 'string' || typeof value === 'number') {
                    styles[key] = String(value);
                  }
                  return styles;
                }, {} as Record<string, string>) : {};
              return { ...acc, ...declarations };
            }, {})
          }
        }));

        return styledStructure;
      } catch (error) {
        console.error('Error parsing HTML structure:', error);
        return [];
      }
    }
    return [];
  }, [code.html, language, cssRules]);

  const [, setPixelMessage] = useState(
    "Welcome to CodeCraft! I'm Pixel, and I'll be your guide on this adventure."
  );

  // Day/night cycle
  React.useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimeOfDay((time) => (time + 0.1) % 24);
    }, 3000);
    return () => clearInterval(timeInterval);
  }, []);
  
  // Weather system
  React.useEffect(() => {
    const weatherInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        const weatherTypes: Array<'clear' | 'cloudy' | 'stormy' | 'foggy'> = ['clear', 'cloudy', 'stormy', 'foggy'];
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        setWeather(newWeather);
        setWeatherIntensity(0.3 + Math.random() * 0.7);
      }
    }, 120000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Type-safe event handlers
  const handleGroundClick = React.useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (event.object.name === 'ground') {
      const point = event.point;
      
      if (isBuildModeActive && selectedBuildingTemplateId) {
        const gridSize = ENVIRONMENT_CONFIG.grid.cellSize;
        const snappedX = Math.round(point.x / gridSize) * gridSize;
        const snappedZ = Math.round(point.z / gridSize) * gridSize;
        console.log(`Placing building at ${snappedX}, ${snappedZ}`);
      } else {
        dispatch(setTargetPosition({
          x: point.x,
          y: 0.5,
          z: point.z
        }));
      }
    }
  }, [dispatch, isBuildModeActive, selectedBuildingTemplateId]);

  const handleGroundHover = React.useCallback((event: ThreeEvent<PointerEvent>) => {
    if (isBuildModeActive && selectedBuildingTemplateId && event.object.name === 'ground') {
      const point = event.point;
      const gridSize = ENVIRONMENT_CONFIG.grid.cellSize;
      setPreviewPosition([
        Math.round(point.x / gridSize) * gridSize,
        0,
        Math.round(point.z / gridSize) * gridSize
      ]);
      setIsValidPlacement(checkValidPlacement(point.x, point.z));
    }
  }, [isBuildModeActive, selectedBuildingTemplateId]);
  
  // Placeholder for checking valid placement
  const checkValidPlacement = (x: number, z: number): boolean => {
    return x >= -ENVIRONMENT_CONFIG.grid.width/2 && 
           x <= ENVIRONMENT_CONFIG.grid.width/2 &&
           z >= -ENVIRONMENT_CONFIG.grid.height/2 &&
           z <= ENVIRONMENT_CONFIG.grid.height/2;
  };

  // Update Pixel's message based on challenge context
  React.useEffect(() => {
    if (isEditorVisible && currentChallenge) {
      setPixelMessage(`Let's work on ${currentChallenge.title}! ${currentChallenge.description}`);
    } else if (errors && errors.length > 0) {
      setPixelMessage(`Hmm, there seems to be an issue with your code. Let's fix it together!`);
    } else if (colonyResources && colonyResources.energy < 20) {
      setPixelMessage(`Your colony's energy levels are getting low. We should build more collectors!`);
    } else {
      setPixelMessage("Welcome to CodeCraft! I'm Pixel, and I'll be your guide on this adventure.");
    }
  }, [isEditorVisible, currentChallenge, errors, colonyResources]);

  const handlePrev = () => setChallengeIndex((i) => (i > 0 ? i - 1 : i));
  const handleNext = () =>
    setChallengeIndex((i) => (i < availableChallenges.length - 1 ? i + 1 : i));

  const handleEditorOpen = () => {
    dispatch(setEditorVisible(true));
  };
  
  const handleTutorialStepComplete = React.useCallback(() => {
    // Tutorial step completion logic would go here
    console.log("Tutorial step completed");
  }, []);

  // Set camera limits and initial position
  React.useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = ENVIRONMENT_CONFIG.camera.minDistance;
      controlsRef.current.maxDistance = ENVIRONMENT_CONFIG.camera.maxDistance;
      controlsRef.current.maxPolarAngle = Math.PI / 2.1;
      controlsRef.current.minPolarAngle = Math.PI / 4;
      
      // Set initial position for a better view of the resources
      controlsRef.current.object.position.set(20, 25, 35);
      controlsRef.current.target.set(0, 0, -15);
      
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      controlsRef.current.rotateSpeed = 0.5;
      controlsRef.current.zoomSpeed = 0.8;
      
      controlsRef.current.update();
    }
  }, []);

  // Transform resource generators into correct format
  const formattedResourceGenerators = useMemo(() => 
    resourceGenerators.map(g => ({
      ...g,
      type: 'default',
      rotation: [0, 0, 0] as [number, number, number],
      outputRate: 1,
      resourceType: 'energy' as const,
      status: g.isActive ? 'active' as const : 'inactive' as const,
      efficiency: 1,
      lastCollection: Date.now(),
      customizations: {}
    })) as ResourceGenerator[],
    [resourceGenerators]
  );

  // Transform resource flows
  const resourceFlows = useMemo(() => 
    formattedResourceGenerators
      .filter(g => g.status === 'active')
      .map(g => ({
        from: g.position,
        to: [0, 5, 0] as [number, number, number],
        resource: g.resourceType,
        amount: g.outputRate * g.efficiency
      })) as ResourceFlow[],
    [formattedResourceGenerators]
  );

  // Use the mood determination function
  const pixelMood = useMemo(() => 
    determinePixelMood(currentChallenge, isEditorVisible, errors),
    [currentChallenge, isEditorVisible, errors]
  );

  // Use the contextual tip function
  const contextualTip = useMemo(() => 
    generateContextualTip(currentChallenge, {}, colonyResources),
    [currentChallenge, colonyResources]
  );

  // Type-safe component props
  const htmlStructureProps: HtmlStructureVisualizationProps = {
    htmlStructure: parsedStructure,
    onBuildingSelect: (node: HtmlNode) => {
      console.log('Selected building:', node);
    }
  };

  const buildingPreviewProps: BuildingPreviewProps = {
    gridSnap: true
  };

  // These props are prepared for future use
  // const errorVisualizationProps: ErrorVisualizationProps = {
  //   position: [0, 5, 0]
  // };

  // const codeExecutionVisualizerProps: CodeExecutionVisualizerProps = {
  //   executionData,
  //   position: [5, 2, 5]
  // };

  return (
    <>
      <style jsx global>{`
        body, html, #__next {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
          background-color: black;
        }
      `}</style>
      
      {/* Main Game Container */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Game Canvas Container */}
        <div className="absolute inset-0 z-0">
          <Canvas
            shadows
            gl={{ 
              alpha: false, 
              antialias: true,
              powerPreference: "high-performance",
              stencil: false,
              logarithmicDepthBuffer: true,
              toneMapping: THREE.NoToneMapping,
              outputColorSpace: THREE.SRGBColorSpace
            }}
            camera={{
              position: ENVIRONMENT_CONFIG.camera.position,
              fov: ENVIRONMENT_CONFIG.camera.fov,
              near: ENVIRONMENT_CONFIG.camera.near,
              far: ENVIRONMENT_CONFIG.camera.far
            }}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            dpr={isLowPowerDevice ? [1, 1.5] : [1, 2]}
            linear
          >
            {/* Scene setup */}
            <color attach="background" args={[ENVIRONMENT_CONFIG.scene.background]} />
            <fog
              attach="fog"
              args={[
                ENVIRONMENT_CONFIG.fog.color,
                ENVIRONMENT_CONFIG.fog.near,
                ENVIRONMENT_CONFIG.fog.far
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
              
              {/* Scene Content */}
              <group>
                <Ground
                  onClick={handleGroundClick}
                  onPointerMove={handleGroundHover}
                  color={ENVIRONMENT_CONFIG.scene.groundColor}
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
                            index % 2 === 0 ? -5 : 5
                          ]
                        }))}
                        showProductionEffects={true}
                      />
                    </group>
                    <ResourceFlowSystem 
                      flows={resourceFlows.map(flow => ({
                        ...flow,
                        from: [flow.from[0], flow.from[1], flow.from[2] - 15],
                        to: [0, 5, 0]
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
                  <Pixel 
                    mood={pixelMood}
                    contextualTip={contextualTip}
                  />
                </group>

                <Environment
                  preset="sunset"
                  background={false}
                  blur={0.8}
                />

                <directionalLight
                  position={[50, 50, 25]}
                  intensity={0.4}
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                  shadow-camera-left={-50}
                  shadow-camera-right={50}
                  shadow-camera-top={50}
                  shadow-camera-bottom={-50}
                />
              </group>
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
                <Bloom intensity={0.5} luminanceThreshold={0.9} />
              </EffectComposer>
            )}
          </Canvas>
        </div>

        {/* UI Layer */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Challenge UI - Left Side */}
          <div className="absolute left-4 top-4 z-50 pointer-events-auto">
            {currentChallenge && (
              <div className="flex flex-col gap-3">
                {/* Challenge Card */}
                <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg max-w-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      Challenge {challengeIndex + 1} of {availableChallenges.length}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      currentChallenge.difficulty === 1 ? 'bg-green-600' :
                      currentChallenge.difficulty === 2 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {currentChallenge.difficulty === 1 ? 'Beginner' :
                       currentChallenge.difficulty === 2 ? 'Intermediate' : 'Advanced'}
                    </span>
                  </div>
                  <h2 className="text-white text-xl font-bold mb-2">{currentChallenge.title}</h2>
                  <p className="text-gray-300 text-sm mb-3">{currentChallenge.description}</p>

                  {/* Objectives */}
                  {currentChallenge.objectives && currentChallenge.objectives.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-400 mb-1">Objectives:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {currentChallenge.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-blue-400">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={challengeIndex === 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={challengeIndex === availableChallenges.length - 1}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <button
                      onClick={handleEditorOpen}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      {completed.includes(currentChallenge.id) ? 'Edit Code' : 'Start Coding'}
                    </button>
                  </div>
                  {completed.includes(currentChallenge.id) && (
                    <div className="mt-2 text-center text-green-400 flex items-center justify-center gap-1">
                      <span>✓</span>
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                {/* Progressive Hints Panel */}
                {!completed.includes(currentChallenge.id) && (
                  <HintPanel challenge={currentChallenge} className="max-w-sm" />
                )}

                {/* Mastery Dashboard */}
                <MasteryDashboard className="max-w-sm mt-2" />

                {/* Daily Streak */}
                <StreakDisplay className="max-w-sm mt-2" />
              </div>
            )}
          </div>

          {/* Pixel Dialog - Bottom Left */}
          <div className="absolute left-4 bottom-4 z-50 pointer-events-auto">
            <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg max-w-sm">
              <div className="text-white">
                <h3 className="text-lg font-bold mb-2">Pixel</h3>
                <p className="text-sm opacity-80">{contextualTip}</p>
                <div className="mt-2 text-xs opacity-60">Current mood: {pixelMood}</div>
              </div>
            </div>
          </div>

          {/* Resource HUD - Top Right */}
          <div className="absolute right-4 top-4 z-50 pointer-events-auto">
            <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg">
              <ResourceHUD />
            </div>
          </div>

          {/* Building Menu - Bottom Right */}
          <div className="absolute right-4 bottom-4 z-50 pointer-events-auto">
            <div className="bg-gray-900 bg-opacity-90 rounded-lg shadow-lg">
              <BuildingMenu />
            </div>
          </div>
          
          {/* Tutorial Overlay */}
          {tutorialActive && (
            <div className="pointer-events-auto">
              <TutorialOverlay
                currentStep={tutorialStep}
                focusArea={tutorialState.steps[tutorialStep]?.focusArea || ''}
                onComplete={handleTutorialStepComplete}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
