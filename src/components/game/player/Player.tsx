'use client';
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Html } from '@react-three/drei';
import { Group, Vector3, MathUtils } from 'three';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setIsMoving } from '@/store/slices/playerSlice';

interface DialogState {
  message: string;
  visible: boolean;
}

export default function Player() {
  const playerRef = useRef<Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new Vector3());
  const dispatch = useAppDispatch();
  
  // State for animation and dialog
  const [armSwing, setArmSwing] = useState(0);
  const [dialog, setDialog] = useState<DialogState>({
    message: '',
    visible: false
  });

  // Player state from Redux
  const playerPosition = useAppSelector(state => state.player.position);
  const targetPosition = useAppSelector(state => state.player.targetPosition);
  const speed = 0.15;

  // Memoize materials to prevent recreations
  const materials = useMemo(() => ({
    suit: <meshStandardMaterial
      color="#1E3A8A" // Cosmic Blue
      emissive="#3B82F6"
      emissiveIntensity={0.2}
      metalness={0.3}
      roughness={0.6}
    />,
    helmet: <meshStandardMaterial
      color="#3B82F6" // Interface Blue
      metalness={0.7}
      roughness={0.2}
      transparent
      opacity={0.8}
    />,
    visor: <meshStandardMaterial
      color="#F8FAFC" // Stellar White
      emissive="#F8FAFC"
      emissiveIntensity={0.3}
      metalness={0.9}
      roughness={0.1}
      transparent
      opacity={0.7}
    />,
    backpack: <meshStandardMaterial
      color="#4B5563" // Asteroid Grey
      metalness={0.5}
      roughness={0.8}
    />,
    arms: <meshStandardMaterial
      color="#1E3A8A" // Cosmic Blue
      metalness={0.3}
      roughness={0.6}
    />,
    boots: <meshStandardMaterial
      color="#9CA3AF" // Cosmic Dust
      metalness={0.8}
      roughness={0.2}
    />,
    light: <meshStandardMaterial
      color="#FBBF24" // Energy Yellow
      emissive="#FBBF24"
      emissiveIntensity={1}
    />
  }), []);

  useFrame((state) => {
    if (!playerRef.current || !targetPosition) return;

    // Update position smoothly
    const currentPos = playerRef.current.position;
    const target = new Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
    
    // Calculate distance to target
    const distance = currentPos.distanceTo(target);
    const isMoving = distance > 0.01;
    
    // Update Redux with movement state
    dispatch(setIsMoving(isMoving));

    if (isMoving) {
      // Calculate movement vector
      velocity.current.subVectors(target, currentPos);
      
      // Clamp velocity to max speed
      if (velocity.current.length() > speed) {
        velocity.current.normalize();
        velocity.current.multiplyScalar(speed);
      }

      // Apply movement with smoothing (using lerp for smoother transitions)
      currentPos.x = MathUtils.lerp(currentPos.x, currentPos.x + velocity.current.x, 0.1);
      currentPos.z = MathUtils.lerp(currentPos.z, currentPos.z + velocity.current.z, 0.1);

      // Rotate player towards movement direction
      if (velocity.current.length() > 0.01) {
        const angle = Math.atan2(velocity.current.x, velocity.current.z);
        playerRef.current.rotation.y = MathUtils.lerp(
          playerRef.current.rotation.y,
          angle,
          0.1
        );
      }

      // Animate bob while moving
      const bobHeight = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      currentPos.y = targetPosition.y + bobHeight;
      
      // Animate arm swing while moving
      const swing = Math.sin(state.clock.elapsedTime * 8) * 0.3;
      setArmSwing(swing);
      
      // Body tilt forward slightly while moving
      if (bodyRef.current) {
        bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, 0.2, 0.1);
      }
    } else {
      // Stand upright when stopped
      if (bodyRef.current) {
        bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
      }
      
      // Reset arm swing when stopped
      setArmSwing(MathUtils.lerp(armSwing, 0, 0.1));
      
      // Slight hover effect when idle
      const hoverHeight = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      currentPos.y = targetPosition.y + hoverHeight;
    }
  });

  return (
    <group ref={playerRef} position={[playerPosition.x, playerPosition.y, playerPosition.z]}>
      {/* Dialog */}
      {dialog.visible && (
        <Html
          position={[0, 1.2, 0]}
          center
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            color: '#F8FAFC',
            padding: '12px 20px',
            borderRadius: '8px',
            width: 'auto',
            whiteSpace: 'nowrap',
            fontSize: '16px',
            transform: 'scale(1)',
            pointerEvents: 'auto',
            userSelect: 'none'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '300px' }}>
            <button
              onClick={() => setDialog(prev => ({ ...prev, visible: false }))}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'rgba(75, 85, 99, 0.8)',
                color: '#F8FAFC',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                padding: 0
              }}
            >
              ×
            </button>
            {dialog.message}
          </div>
        </Html>
      )}

      {/* Movement trail */}
      <Trail
        width={0.5}
        length={8}
        color={'#60A5FA'}
        attenuation={(t) => t * t}
        opacity={0.4}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.1]} />
        </mesh>
      </Trail>

      {/* Player model */}
      <group ref={bodyRef}>
        {/* Helmet */}
        <Sphere args={[0.25, 24, 24]} position={[0, 0.4, 0]} castShadow>
          {materials.helmet}
        </Sphere>
        
        {/* Visor */}
        <Sphere 
          args={[0.15, 20, 20]} 
          position={[0, 0.42, 0.15]} 
          scale={[1, 0.8, 0.5]} 
          castShadow
        >
          {materials.visor}
        </Sphere>
        
        {/* Body */}
        <Sphere 
          args={[0.2, 20, 20]} 
          position={[0, 0.05, 0]} 
          scale={[0.8, 1.3, 0.7]} 
          castShadow
        >
          {materials.suit}
        </Sphere>
        
        {/* Backpack */}
        <Sphere 
          args={[0.15, 16, 16]} 
          position={[0, 0.1, -0.2]} 
          scale={[0.8, 1, 0.5]} 
          castShadow
        >
          {materials.backpack}
        </Sphere>
        
        {/* Arms */}
        <Sphere 
          args={[0.08, 16, 16]} 
          position={[0.22, 0.15, 0]} 
          scale={[0.5, 1.5, 0.5]} 
          rotation={[0, 0, armSwing - 0.5]} 
          castShadow
        >
          {materials.arms}
        </Sphere>
        
        <Sphere 
          args={[0.08, 16, 16]} 
          position={[-0.22, 0.15, 0]} 
          scale={[0.5, 1.5, 0.5]} 
          rotation={[0, 0, -armSwing + 0.5]} 
          castShadow
        >
          {materials.arms}
        </Sphere>
        
        {/* Legs */}
        <Sphere 
          args={[0.08, 16, 16]} 
          position={[0.1, -0.25, 0]} 
          scale={[0.6, 1.5, 0.6]} 
          rotation={[0.3, 0, armSwing * 0.7]} 
          castShadow
        >
          {materials.suit}
        </Sphere>
        
        <Sphere 
          args={[0.08, 16, 16]} 
          position={[-0.1, -0.25, 0]} 
          scale={[0.6, 1.5, 0.6]} 
          rotation={[0.3, 0, -armSwing * 0.7]} 
          castShadow
        >
          {materials.suit}
        </Sphere>
        
        {/* Boots */}
        <Sphere 
          args={[0.1, 16, 16]} 
          position={[0.1, -0.5, 0.05]} 
          scale={[0.7, 0.4, 1.2]} 
          castShadow
        >
          {materials.boots}
        </Sphere>
        
        <Sphere 
          args={[0.1, 16, 16]} 
          position={[-0.1, -0.5, 0.05]} 
          scale={[0.7, 0.4, 1.2]} 
          castShadow
        >
          {materials.boots}
        </Sphere>
        
        {/* Helmet light */}
        <Sphere 
          args={[0.05, 12, 12]} 
          position={[0, 0.5, 0.2]} 
          castShadow
        >
          {materials.light}
        </Sphere>
        
        {/* Light emission */}
        <mesh position={[0, 0.5, 0.2]}>
          <pointLight color="#FBBF24" intensity={1} distance={3} />
        </mesh>
        
        <mesh position={[0, 0.5, 0.2]}>
          <spotLight 
            color="#FBBF24"
            intensity={0.8}
            angle={Math.PI / 4}
            penumbra={0.5}
            distance={10}
            castShadow
            target-position={[0, 0, 5]}
          />
        </mesh>
      </group>
    </group>
  );
} 