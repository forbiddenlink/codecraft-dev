"use client";
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sky } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEditorVisible } from "@/store/slices/editorSlice";
import { setTargetPosition } from "@/store/slices/playerSlice";
import Player from "@/components/game/player/Player";
import Pixel from "@/components/game/pixel/Pixel";
import PixelDialog from "@/components/game/pixel/PixelDialog";
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
import ChallengeHUD from '@/components/game/challenges/ChallengeHUD';
import { getAvailableChallenges } from '@/data/challenges';
import Ground from "@/components/game/ground/Ground";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { parseHtmlToStructure } from "@/utils/htmlParser";
import { applyStyles } from "@/utils/cssParser";

// Environment settings
const ENVIRONMENT_CONFIG = {
  stars: {
    radius: 100,
    depth: 50,
    count: 3000,
    factor: 4,
    saturation: 0
  },
  fog: {
    color: '#080e1a',
    near: 50,
    far: 150
  },
  grid: {
    width: 50,
    height: 50,
    cellSize: 5
  }
};

// Helper function to determine sun position based on time of day
function getSunPosition(timeOfDay) {
  // Convert time (0-24) to radians (0-2π)
  const angleRad = ((timeOfDay / 24) * Math.PI * 2) - Math.PI/2;
  
  // Calculate position on a circular path
  const radius = 20;
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;
  
  // During "night" move the sun below the horizon
  const adjustedY = y < 0 ? y * 3 : y;
  
  return [x, adjustedY, 0];
}

// Helper to determine pixel's mood based on context
function determinePixelMood(challenge, isEditorVisible, errors) {
  if (errors && errors.length > 0) return 'concerned';
  if (isEditorVisible) return 'curious';
  if (challenge) return 'happy';
  return 'neutral';
}

// Helper to generate contextual tips
function generateContextualTip(challenge, playerProgress, colony) {
  if (!challenge) return null;
  
  if (colony && colony.resources.energy < 20) {
    return "I notice your colony's energy is running low. You might want to build some solar collectors.";
  }
  
  if (playerProgress.justUnlocked.length > 0) {
    return `You've unlocked new building types! Check them out in the building menu.`;
  }
  
  return null;
}

export default function GameWorldClient() {
  const dispatch = useAppDispatch();
  const [challengeIndex, setChallengeIndex] = useState(0);
  const { completed } = useChallengeProgress();
  const controlsRef = useRef();
  
  // Game state selectors
  const isEditorVisible = useAppSelector((state) => state.editor.isVisible);
  const editorContent = useAppSelector((state) => state.editor.currentCode);
  const editorLanguage = useAppSelector((state) => state.editor.language);
  const editorErrors = useAppSelector((state) => state.editor.validationErrors);
  const colony = useAppSelector((state) => state.game.colony);
  const cssRules = useAppSelector((state) => state.game.cssRules);
  const jsExecutionContext = useAppSelector((state) => state.game.jsExecutionContext);
  const isBuildModeActive = useAppSelector((state) => state.building.buildMode);
  const selectedBuildingTemplateId = useAppSelector((state) => state.building.selectedTemplateId);
  const tutorialState = useAppSelector((state) => state.tutorial);
  const playerProgress = useAppSelector((state) => state.user.progress);
  const resourceGenerators = useAppSelector((state) => state.resource.generators);
  
  // Environment state
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24 hour scale
  const [weather, setWeather] = useState('clear');
  const [weatherIntensity, setWeatherIntensity] = useState(0.5);
  
  // Building preview state
  const [previewPosition, setPreviewPosition] = useState([0, 0, 0]);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  
  // Get available challenges based on completed ones
  const availableChallenges = useMemo(() => getAvailableChallenges(completed), [completed]);
  const currentChallenge = availableChallenges[challengeIndex];
  
  // Parsed HTML structure from code editor
  const parsedStructure = useMemo(() => {
    if (editorLanguage === 'html' && editorContent) {
      const structure = parseHtmlToStructure(editorContent);
      return applyStyles(structure, cssRules);
    }
    return [];
  }, [editorContent, editorLanguage, cssRules]);

  const [pixelMessage, setPixelMessage] = useState(
    "Welcome to CodeCraft! I'm Pixel, and I'll be your guide on this adventure."
  );

  // Day/night cycle
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimeOfDay((time) => (time + 0.1) % 24);
    }, 3000); // Slower cycle for better gameplay
    
    return () => clearInterval(timeInterval);
  }, []);
  
  // Weather system
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      // 20% chance to change weather every 2 minutes
      if (Math.random() < 0.2) {
        const weatherTypes = ['clear', 'cloudy', 'stormy', 'foggy'];
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        setWeather(newWeather);
        setWeatherIntensity(0.3 + Math.random() * 0.7);
      }
    }, 120000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  // Handle ground click for player movement and building placement
  const handleGroundClick = useCallback((event) => {
    event.stopPropagation();
    if (event.object.name === 'ground') {
      const point = event.point;
      
      if (isBuildModeActive && selectedBuildingTemplateId) {
        // Snap to grid
        const gridSize = ENVIRONMENT_CONFIG.grid.cellSize;
        const snappedX = Math.round(point.x / gridSize) * gridSize;
        const snappedZ = Math.round(point.z / gridSize) * gridSize;
        
        // Place building code here
        console.log(`Placing building at ${snappedX}, ${snappedZ}`);
      } else {
        // Move player
        dispatch(setTargetPosition({
          x: point.x,
          y: 0.5,
          z: point.z
        }));
      }
    }
  }, [dispatch, isBuildModeActive, selectedBuildingTemplateId]);
  
  // Update preview position on mouse move when in build mode
  const handleGroundHover = useCallback((event) => {
    if (isBuildModeActive && selectedBuildingTemplateId && event.object.name === 'ground') {
      const point = event.point;
      const gridSize = ENVIRONMENT_CONFIG.grid.cellSize;
      const snappedX = Math.round(point.x / gridSize) * gridSize;
      const snappedZ = Math.round(point.z / gridSize) * gridSize;
      
      setPreviewPosition([snappedX, 0, snappedZ]);
      
      // Check if placement is valid (example logic)
      const isValid = checkValidPlacement(snappedX, snappedZ);
      setIsValidPlacement(isValid);
    }
  }, [isBuildModeActive, selectedBuildingTemplateId]);
  
  // Placeholder for checking valid placement
  const checkValidPlacement = (x, z) => {
    // Simple check - would be more complex in real implementation
    return x >= -ENVIRONMENT_CONFIG.grid.width/2 && 
           x <= ENVIRONMENT_CONFIG.grid.width/2 &&
           z >= -ENVIRONMENT_CONFIG.grid.height/2 &&
           z <= ENVIRONMENT_CONFIG.grid.height/2;
  };

  // Update Pixel's message based on challenge context
  useEffect(() => {
    if (isEditorVisible && currentChallenge) {
      setPixelMessage(`Let's work on ${currentChallenge.title}! ${currentChallenge.description}`);
    } else if (editorErrors && editorErrors.length > 0) {
      setPixelMessage(`Hmm, there seems to be an issue with your code. Let's fix it together!`);
    } else if (colony && colony.resources.energy < 20) {
      setPixelMessage(`Your colony's energy levels are getting low. We should build more collectors!`);
    } else {
      setPixelMessage("Welcome to CodeCraft! I'm Pixel, and I'll be your guide on this adventure.");
    }
  }, [isEditorVisible, currentChallenge, editorErrors, colony]);

  const handlePrev = () => setChallengeIndex((i) => (i > 0 ? i - 1 : i));
  const handleNext = () =>
    setChallengeIndex((i) => (i < availableChallenges.length - 1 ? i + 1 : i));

  const handleEditorOpen = () => {
    dispatch(setEditorVisible(true));
  };
  
  const handleTutorialStepComplete = useCallback(() => {
    // Tutorial step completion logic would go here
    console.log("Tutorial step completed");
  }, []);

  // Set camera limits
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.minDistance = 5;
      controlsRef.current.maxDistance = 50;
      controlsRef.current.maxPolarAngle = Math.PI / 2.1;
      controlsRef.current.minPolarAngle = 0;
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Left Side UI */}
      <div className="fixed left-4 top-4 bottom-4 z-50 flex flex-col gap-4 w-[300px]">
        {currentChallenge && (
          <ChallengeHUD
            challenge={currentChallenge}
            isCompleted={completed.includes(currentChallenge.id)}
            onPrev={handlePrev}
            onNext={handleNext}
            index={challengeIndex}
            onStartCoding={handleEditorOpen}
          />
        )}
      </div>

      {/* Right Side UI */}
      <div className="fixed right-4 top-4 bottom-4 z-50 flex flex-col gap-4 w-[300px]">
        <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg">
          <ResourceHUD />
        </div>
        <div className="mt-auto">
          <BuildingMenu />
        </div>
      </div>
      
      {/* Tutorial Overlay */}
      {tutorialState?.isActive && (
        <TutorialOverlay
          currentStep={tutorialState.currentStepIndex}
          focusArea={tutorialState.steps[tutorialState.currentStepIndex]?.focusArea}
          onComplete={handleTutorialStepComplete}
        />
      )}

      {/* 3D Game World */}
      <Canvas shadows camera={{ position: [20, 20, 20], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={timeOfDay > 6 && timeOfDay < 18 ? 0.4 : 0.1} />
        <directionalLight
          castShadow
          position={getSunPosition(timeOfDay)}
          intensity={timeOfDay > 6 && timeOfDay < 18 ? 1 : 0.2}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* Environment */}
        <Stars {...ENVIRONMENT_CONFIG.stars} />
        <Sky 
          distance={450000}
          sunPosition={getSunPosition(timeOfDay)}
          inclination={0.49}
          azimuth={0.25}
        />
        <fog attach="fog" args={[ENVIRONMENT_CONFIG.fog.color, ENVIRONMENT_CONFIG.fog.near, ENVIRONMENT_CONFIG.fog.far]} />
        <Ground onClick={handleGroundClick} onPointerMove={handleGroundHover} />
        <BuildingGrid 
          width={ENVIRONMENT_CONFIG.grid.width}
          height={ENVIRONMENT_CONFIG.grid.height}
          cellSize={ENVIRONMENT_CONFIG.grid.cellSize}
          showGridLines={isBuildModeActive}
        />
        
        {/* Weather */}
        <WeatherSystem
          currentWeather={weather}
          intensity={weatherIntensity}
        />
        
        {/* Colony Structure following HTML mapping */}
        <group name="colony-root">
          {/* Dynamic HTML structure visualization */}
          <HtmlStructureVisualization 
            htmlStructure={parsedStructure}
            cssRules={cssRules}
          />
          
          {/* Main colony center */}
          <group name="main" position={[0, 0, 0]}>
            {/* Colony entrance and player area */}
            <group name="header" position={[0, 0, -10]}>
              <Player />
              <Pixel 
                mood={determinePixelMood(currentChallenge, isEditorVisible, editorErrors)}
                contextualTip={generateContextualTip(currentChallenge, playerProgress, colony)}
              />
              <PixelDialog message={pixelMessage} />
            </group>
            
            {/* Primary resource area */}
            <group name="section-resources" position={[10, 0, 0]}>
              <ResourceCollectors />
              <ResourceGenerators
                generators={resourceGenerators}
                showProductionEffects={true}
              />
              <ResourceFlowSystem
                flows={resourceGenerators.filter(g => g.isActive).map(g => ({
                  from: g.position,
                  to: [0, 5, 0], // Storage location
                  resource: g.resources[0].resourceId,
                  amount: g.resources[0].amount
                }))}
              />
            </group>
            
            {/* Colony buildings area */}
            <group name="section-buildings" position={[-10, 0, 0]}>
              <PlacedBuildings />
              {isBuildModeActive && selectedBuildingTemplateId && (
                <BuildingPreview
                  templateId={selectedBuildingTemplateId}
                  position={previewPosition}
                  isValid={isValidPlacement}
                  gridSnap={true}
                />
              )}
            </group>
            
            {/* Villager district */}
            <group name="section-villagers" position={[0, 0, 10]}>
              <UnlockedVillagers />
            </group>
          </group>
        </group>
        
        {/* Error visualization */}
        {editorErrors && editorErrors.length > 0 && (
          <ErrorVisualization
            errors={editorErrors}
            position={[0, 5, 0]}
          />
        )}
        
        {/* Code execution visualization */}
        {jsExecutionContext && Object.keys(jsExecutionContext).length > 0 && (
          <CodeExecutionVisualizer
            executionData={jsExecutionContext}
            position={[0, 10, 0]}
          />
        )}

        {/* Camera and controls */}
        <OrbitControls
          ref={controlsRef}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={50}
        />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
