"use client";
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sphere, Box, Cylinder, RoundedBox } from "@react-three/drei";
import { Villager } from "@/data/villagers";
import { Vector3, Group } from "three";
import { useAppSelector } from "@/hooks/reduxHooks";

interface Props {
  villager: Villager;
  position: [number, number, number];
}

export default function VillagerMesh({ villager, position }: Props) {
  const villagerRef = useRef<Group>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [isPlayerNearby, setIsPlayerNearby] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [animation, setAnimation] = useState("idle");
  const { camera } = useThree();
  
  const playerPosition = useAppSelector(state => state.player.position);
  
  const getSpecialtyIcon = () => {
    switch (villager.specialty) {
      case "html": return "🧱";
      case "css": return "🎨";
      case "javascript": return "⚙️";
      case "git": return "🔄";
      case "backend": return "🖥️";
      default: return "👩‍💻";
    }
  };
  
  useEffect(() => {
    const checkProximity = () => {
      if (!villagerRef.current) return;
      
      const villagerPos = new Vector3(...position);
      const playerPos = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
      const distance = villagerPos.distanceTo(playerPos);
      
      setIsPlayerNearby(distance < 3);
      
      if (distance < 3 && !showDialog) {
        setDialogIndex(0);
        setShowDialog(true);
        setAnimation("greeting");
        setTimeout(() => setAnimation("idle"), 2000);
      } else if (distance > 5 && showDialog) {
        setShowDialog(false);
      }
    };
    
    const interval = setInterval(checkProximity, 1000);
    return () => clearInterval(interval);
  }, [position, playerPosition, showDialog]);
  
  useFrame((state) => {
    if (!villagerRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    if (animation === "idle") {
      villagerRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.03;
      if (Math.sin(time * 0.2) > 0.95) {
        villagerRef.current.rotation.y += 0.02;
      }
    } else if (animation === "greeting") {
      villagerRef.current.rotation.y = position[1] + Math.sin(time * 5) * 0.2;
    }
    
    if (isPlayerNearby) {
      const targetAngle = Math.atan2(
        playerPosition.x - position[0],
        playerPosition.z - position[2]
      );
      villagerRef.current.rotation.y = targetAngle;
    }
  });
  
  const handleClick = () => {
    if (!showDialog) {
      setShowDialog(true);
      setDialogIndex(0);
      setAnimation("greeting");
      setTimeout(() => setAnimation("idle"), 1500);
    } else {
      setDialogIndex((prev) => (prev + 1) % villager.dialog.length);
    }
  };
  
  // Update DOM-based labels and dialog
  useEffect(() => {
    // Create container for all labels
    const labelContainer = document.createElement('div');
    labelContainer.id = `villager-labels-${villager.id}`;
    labelContainer.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-family: sans-serif;
    `;
    
    // Name label
    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = `
      color: white;
      font-size: 14px;
      text-shadow: 0 0 4px black;
      background: rgba(0, 0, 0, 0.5);
      padding: 2px 8px;
      border-radius: 4px;
    `;
    nameLabel.textContent = villager.name;
    labelContainer.appendChild(nameLabel);
    
    // Specialty icon
    const iconLabel = document.createElement('div');
    iconLabel.style.cssText = `
      font-size: 20px;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
    `;
    iconLabel.textContent = getSpecialtyIcon();
    labelContainer.appendChild(iconLabel);
    
    // Hover text
    if (hovered && !showDialog) {
      const hoverLabel = document.createElement('div');
      hoverLabel.style.cssText = `
        color: white;
        font-size: 12px;
        text-shadow: 0 0 4px black;
        background: rgba(59, 130, 246, 0.8);
        padding: 2px 8px;
        border-radius: 4px;
      `;
      hoverLabel.textContent = "Click to talk";
      labelContainer.appendChild(hoverLabel);
    }
    
    document.body.appendChild(labelContainer);
    
    // Dialog box - built using DOM methods to avoid XSS
    if (showDialog) {
      const dialog = document.createElement('div');
      dialog.id = `villager-dialog-${villager.id}`;
      dialog.style.cssText = `
        position: fixed;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        width: 300px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        color: white;
        font-family: sans-serif;
        font-size: 14px;
        z-index: 1000;
        pointer-events: none;
      `;

      // Build dialog content safely using DOM methods
      const headerDiv = document.createElement('div');
      headerDiv.style.marginBottom = '8px';

      const iconSpan = document.createElement('span');
      iconSpan.style.marginRight = '8px';
      iconSpan.textContent = getSpecialtyIcon();

      const nameSpan = document.createElement('span');
      nameSpan.style.color = villager.color;
      nameSpan.textContent = villager.name;

      headerDiv.appendChild(iconSpan);
      headerDiv.appendChild(nameSpan);

      const dialogTextDiv = document.createElement('div');
      dialogTextDiv.textContent = villager.dialog[dialogIndex];

      dialog.appendChild(headerDiv);
      dialog.appendChild(dialogTextDiv);

      document.body.appendChild(dialog);
    }
    
    // Update label positions in animation frame
    let animationFrameId: number;
    const updateLabelPositions = () => {
      if (villagerRef.current) {
        const vector = new Vector3(0, 2, 0);
        vector.setFromMatrixPosition(villagerRef.current.matrixWorld);
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        
        labelContainer.style.transform = `translate(${x}px, ${y}px)`;
        animationFrameId = requestAnimationFrame(updateLabelPositions);
      }
    };
    updateLabelPositions();
    
    return () => {
      if (document.body.contains(labelContainer)) {
        document.body.removeChild(labelContainer);
      }
      if (showDialog) {
        const dialog = document.getElementById(`villager-dialog-${villager.id}`);
        if (dialog && document.body.contains(dialog)) {
          document.body.removeChild(dialog);
        }
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [showDialog, dialogIndex, hovered, villager, camera]);
  
  return (
    <group 
      ref={villagerRef} 
      position={position} 
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {villager.model === "capsule" && (
        <Cylinder args={[0.2, 0.2, 1, 16]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={villager.color} />
        </Cylinder>
      )}
      {villager.model === "sphere" && (
        <Sphere args={[0.3, 24, 24]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={villager.color} />
        </Sphere>
      )}
      {villager.model === "roundedBox" && (
        <RoundedBox args={[0.4, 1, 0.4]} position={[0, 0.5, 0]} radius={0.1}>
          <meshStandardMaterial color={villager.color} />
        </RoundedBox>
      )}
    </group>
  );
}
