"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import React, { useState, useEffect } from "react";
import { challenges } from "@/data/challenges";
import Pixel from "@/components/game/pixel/Pixel";
import Player from "@/components/game/player/Player";
import PixelDialog from "@/components/game/pixel/PixelDialog";
import useChallengeProgress from "@/hooks/useChallengeProgress";
import { villagers } from "@/data/villagers";
import Villager from "@/components/game/villager/Villager";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { setEditorVisible } from "@/store/slices/editorSlice";
import ResourceHUD from "@/components/game/hud/ResourceHUD";
import ResourceCollectors from "@/components/game/resources/ResourceCollectors";
import BuildingPreview from "@/components/game/buildings/BuildingPreview";

// Camera settings as constants for better maintainability
const CAMERA_CONFIG = {
  position: [0, 8, 12] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000,
  minDistance: 4,
  maxDistance: 15,
  maxPolarAngle: Math.PI / 2.1,
};

// Lighting settings
const LIGHTING_CONFIG = {
  ambient: 0.7,
  directional: {
    intensity: 1.2,
    position: [5, 10, 5] as [number, number, number],
  },
};

function HUDOverlay({
  currentChallenge,
  challengePassed,
  onPrev,
  onNext,
  index,
  onStartCoding,
}: {
  currentChallenge: (typeof challenges)[0];
  challengePassed: boolean;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  onStartCoding: () => void;
}) {
  return (
    <div
      className="fixed top-4 left-4 z-50 bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg text-white"
      style={{
        width: "280px",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      <div className="mb-2">
        <strong className="text-lg">
          {challengePassed ? "✅ " : ""}Challenge {index + 1}:
        </strong>
        <div className="font-bold text-lg">{currentChallenge.title}</div>
      </div>
      <p className="mb-4 text-gray-300">{currentChallenge.description}</p>
      <div className="text-sm mb-3">
        Status: {challengePassed ? "✅ Complete" : "🕐 In Progress"}
      </div>
      <div className="flex justify-between gap-2">
        <button
          onClick={onPrev}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          disabled={index === 0}
        >
          ⟵ Prev
        </button>
        <button
          onClick={onStartCoding}
          className={`px-4 py-1 rounded transition-colors flex-grow text-center ${
            challengePassed
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {challengePassed ? "Edit Code" : "Start Coding"}
        </button>
        <button
          onClick={onNext}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          disabled={index === challenges.length - 1}
        >
          Next ⟶
        </button>
      </div>
    </div>
  );
}

export default function GameWorldClient() {
  const dispatch = useAppDispatch();
  const [challengeIndex, setChallengeIndex] = useState(0);
  const currentChallenge = challenges[challengeIndex];
  const [pixelMessage, setPixelMessage] = useState(
    "Welcome to CodeCraft! I'm Pixel, and I'll be your guide on this adventure."
  );

  const { completed: completedArray } = useChallengeProgress();
  const completed = new Set(completedArray);
  const isEditorVisible = useAppSelector((state) => state.editor.isVisible);

  // Update Pixel's message based on challenge context
  useEffect(() => {
    if (isEditorVisible) {
      setPixelMessage(`Let's work on ${currentChallenge.title}! ${currentChallenge.description}`);
    } else {
      setPixelMessage("Welcome to CodeCraft! I'm Pixel, and I'll be your guide on this adventure.");
    }
  }, [isEditorVisible, currentChallenge]);

  const handlePrev = () => setChallengeIndex((i) => (i > 0 ? i - 1 : i));
  const handleNext = () =>
    setChallengeIndex((i) => (i < challenges.length - 1 ? i + 1 : i));

  const handleStartCoding = () => {
    dispatch(setEditorVisible(true));
  };

  return (
    <>
      <HUDOverlay
        currentChallenge={currentChallenge}
        challengePassed={completed.has(currentChallenge.id)}
        onPrev={handlePrev}
        onNext={handleNext}
        index={challengeIndex}
        onStartCoding={handleStartCoding}
      />
      <ResourceHUD />
      <Canvas camera={CAMERA_CONFIG}>
        <ambientLight intensity={LIGHTING_CONFIG.ambient} />
        <directionalLight
          position={LIGHTING_CONFIG.directional.position}
          intensity={LIGHTING_CONFIG.directional.intensity}
        />
        <group position={[0, -1, 0]}>
          {/* Ground plane */}
          <Plane
            args={[100, 100]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
            name="ground"
          >
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
              metalness={0.3}
            />
          </Plane>

          {/* Space villagers */}
          {villagers
            .filter((v) => completed.has(v.unlockAfterChallengeId))
            .map((v) => (
              <Villager key={v.id} villager={v} position={v.position} />
            ))}

          <Player />
          <Pixel position={[-1.2, 0, 0]} />
          <ResourceCollectors />
          <BuildingPreview />
          <PixelDialog message={pixelMessage} />
          <OrbitControls 
            maxPolarAngle={CAMERA_CONFIG.maxPolarAngle}
            minDistance={CAMERA_CONFIG.minDistance}
            maxDistance={CAMERA_CONFIG.maxDistance}
          />
        </group>
      </Canvas>
    </>
  );
}
