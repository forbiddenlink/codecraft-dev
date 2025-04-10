// File: /src/components/game/world/GameWorldClient.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  RoundedBox,
  Plane,
  Capsule,
  Sphere,
} from "@react-three/drei";
import { useAppSelector } from "@/hooks/reduxHooks";
import {
  parseHtmlToGameObjects,
  GameObject,
} from "@/utils/parseHtmlToGameObjects";
import React, { useState, useEffect } from "react";
import { validateCode } from "@/utils/validateCode";
import { challenges } from "@/data/challenges";
import Pixel from "@/components/game/pixel/Pixel";
import PixelDialog from "@/components/game/pixel/PixelDialog";
import useChallengeProgress from "@/hooks/useChallengeProgress";
import usePixelMood from "@/hooks/usePixelMood";
import useChallengeCode from "@/hooks/useChallengeCode";

function HUDOverlay({
  currentChallenge,
  challengePassed,
  onPrev,
  onNext,
  index,
}: {
  currentChallenge: (typeof challenges)[0];
  challengePassed: boolean;
  onPrev: () => void;
  onNext: () => void;
  index: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.75)",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        color: "white",
        fontFamily: "monospace",
        maxWidth: "220px",
        wordWrap: "break-word",
        textAlign: "left",
        fontSize: "12px",
        zIndex: 10,
      }}
    >
      <p>
        <strong>
          {challengePassed ? "✅ " : ""}Challenge {index + 1}:
        </strong>
        <br />
        {currentChallenge.title}
      </p>
      <p>{currentChallenge.description}</p>
      <p>Status: {challengePassed ? "✅ Complete" : "🕐 In Progress"}</p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.5rem",
        }}
      >
        <button
          onClick={onPrev}
          style={{
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "0.2rem 0.5rem",
            fontSize: "12px",
          }}
        >
          ⟵ Prev
        </button>
        <button
          onClick={onNext}
          style={{
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "0.2rem 0.5rem",
            fontSize: "12px",
          }}
        >
          Next ⟶
        </button>
      </div>
    </div>
  );
}

export default function GameWorldClient() {
  const code = useAppSelector((state) => state.editor.currentCode);
  const elements = parseHtmlToGameObjects(code);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const currentChallenge = challenges[challengeIndex];
  useChallengeCode(currentChallenge.id);

  const [challengePassed, setChallengePassed] = useState(false);
  const [pixelMessage, setPixelMessage] = useState(
    "Welcome to CodeCraft! Let's start building."
  );

  const { markComplete } = useChallengeProgress();
  const mood = usePixelMood(challengePassed);

  useEffect(() => {
    const result = validateCode(code, currentChallenge);
    setChallengePassed(result);
    if (result) markComplete(currentChallenge.id);
    setPixelMessage(
      result
        ? "🎉 Great job! You passed the challenge."
        : "Hmm, not quite right. Try again!"
    );
  }, [code, currentChallenge, markComplete]);

  const handlePrev = () => setChallengeIndex((i) => (i > 0 ? i - 1 : i));
  const handleNext = () =>
    setChallengeIndex((i) => (i < challenges.length - 1 ? i + 1 : i));

  const handleObjectClick = (tag: string) => {
    const tagMessages: Record<string, string> = {
      header: "This looks like the command center!",
      section: "Nice section! Maybe this is living quarters.",
      footer: "Probably the space docking station!",
      article: "An article orb? Looks knowledgey!",
      default: "Huh? What even is this thing? 🤔",
    };
    setPixelMessage(tagMessages[tag] || tagMessages.default);
  };

  function renderObject(el: GameObject, key: number): JSX.Element {
    const {
      tag,
      position = [0, 0.6, 0],
      scale = [1, 1, 1],
      rotation = [0, 0, 0],
      color,
      opacity = 1,
      children = [],
    } = el;

    const shape = (() => {
      switch (tag) {
        case "header":
          return (
            <RoundedBox
              position={position}
              scale={scale}
              rotation={rotation}
              radius={0.2}
              smoothness={4}
            >
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </RoundedBox>
          );
        case "section":
          return (
            <Capsule position={position} scale={scale} rotation={rotation}>
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </Capsule>
          );
        case "footer":
          return (
            <Plane position={position} scale={scale} rotation={rotation}>
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </Plane>
          );
        case "article":
          return (
            <Sphere position={position} scale={scale} rotation={rotation}>
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </Sphere>
          );
        default:
          return (
            <RoundedBox
              position={position}
              scale={scale}
              rotation={rotation}
              radius={0.1}
            >
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </RoundedBox>
          );
      }
    })();

    return (
      <group key={key} onClick={() => handleObjectClick(tag)}>
        {shape}
        {children.map((child, i) => renderObject(child, i + key * 10))}
      </group>
    );
  }

  return (
    <>
      <HUDOverlay
        currentChallenge={currentChallenge}
        challengePassed={challengePassed}
        onPrev={handlePrev}
        onNext={handleNext}
        index={challengeIndex}
      />
      <Canvas camera={{ position: [0, 3, 8], fov: 50, near: 0.1, far: 1000 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <group position={[0, -1, 0]}>
          <Plane
            args={[100, 100]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
          >
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
              metalness={0.3}
            />
          </Plane>

          {elements.map((el, index) => renderObject(el, index))}

          <Pixel />
          <PixelDialog message={pixelMessage} mood={mood} />
          <OrbitControls />
        </group>
      </Canvas>
    </>
  );
}
