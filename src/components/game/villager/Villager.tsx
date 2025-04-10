"use client";
import { Html, Capsule, Sphere, RoundedBox } from "@react-three/drei";
import { useState } from "react";
import { Villager } from "@/data/villagers";

interface Props {
  villager: Villager;
  position: [number, number, number];
}

export default function VillagerMesh({ villager, position }: Props) {
  const [dialogIndex, setDialogIndex] = useState(0);
  const handleClick = () =>
    setDialogIndex((prev) => (prev + 1) % villager.dialog.length);

  const Model = (() => {
    switch (villager.model) {
      case "capsule":
        return Capsule;
      case "sphere":
        return Sphere;
      case "roundedBox":
        return RoundedBox;
      default:
        return Sphere;
    }
  })();

  return (
    <group position={position} onClick={handleClick}>
      <Model args={[0.4, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={villager.color} />
      </Model>
      <Html position={[0, 1.4, 0]} center>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            padding: "6px 10px",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
            lineHeight: "1.4",
            textAlign: "center",
            minWidth: "140px",
          }}
        >
          <strong>{villager.name}</strong>
          <br />
          {villager.dialog[dialogIndex]}
        </div>
      </Html>
    </group>
  );
}
