"use client";
import { RoundedBox, Capsule, Sphere, Plane } from "@react-three/drei";
import { GameObject } from "@/utils/parseHtmlToGameObjects";
import { animated, useSpring } from "@react-spring/three";
import { useState } from "react";
import { useAppSelector } from "@/hooks/reduxHooks";

export default function GameObjectMesh({
  el,
  onClick,
  objectKey,
}: {
  el: GameObject;
  onClick: (tag: string) => void;
  objectKey: number;
}) {
  const {
    tag,
    position = [0, 0.6, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
    color,
    opacity = 1,
    children = [],
  } = el;

  const isEditorVisible = useAppSelector(state => state.editor.isVisible);
  const [hovered, setHovered] = useState(false);
  
  // Animate scale and opacity based on hover and editor state
  const { scale: animatedScale, opacity: animatedOpacity } = useSpring({
    scale: hovered ? 1.15 : 1,
    opacity: isEditorVisible ? 1 : 0.8,
    config: { tension: 170, friction: 12 },
  });

  const shape = (() => {
    const commonProps = {
      position,
      scale,
      rotation,
      children: (
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity}
          emissive={hovered ? color : undefined}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      ),
    };

    switch (tag) {
      case "header":
        return <RoundedBox radius={0.2} smoothness={4} {...commonProps} />;
      case "section":
        return <Capsule {...commonProps} />;
      case "footer":
        return <Plane {...commonProps} />;
      case "article":
        return <Sphere {...commonProps} />;
      default:
        return <RoundedBox radius={0.1} {...commonProps} />;
    }
  })();

  return (
    <animated.group
      key={objectKey}
      scale={animatedScale.to((s) => [s, s, s])}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick(tag)}
    >
      <animated.mesh opacity={animatedOpacity}>
        {shape}
      </animated.mesh>
      {children.map((child, i) => (
        <GameObjectMesh
          el={child}
          onClick={onClick}
          objectKey={i + objectKey * 10}
          key={i}
        />
      ))}
    </animated.group>
  );
}
