import { useRef, useState } from 'react';
import { Html, Trail } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial } from 'three';
import { useAppSelector } from '@/hooks/reduxHooks';
import { buildingTemplates } from '@/data/buildingTemplates';
import { Building } from '@/store/slices/buildingSlice';
import { animated, useSpring } from '@react-spring/three';

interface BuildingInteractionProps {
  building: Building;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export default function BuildingInteraction({ building, onSelect, isSelected }: BuildingInteractionProps) {
  const resources = useAppSelector(state => state.resources.resources);
  const buildingRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animation spring for hover and selection effects
  const { scale, glow } = useSpring({
    scale: isHovered || isSelected ? 1.05 : 1,
    glow: isHovered || isSelected ? 0.8 : 0.5,
    config: { tension: 120, friction: 14 }
  });

  useFrame((state) => {
    if (!buildingRef.current || !materialRef.current) return;

    // Animate building effects
    if (building.status === 'active') {
      const time = state.clock.getElapsedTime();
      materialRef.current.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
    }

    // Resource generation particles
    if (building.status === 'active' && building.effects) {
      building.effects.forEach(effect => {
        if (effect.type === 'resource' && effect.value > 0) {
          // Resource generation visual feedback will be handled by Trail
        }
      });
    }
  });

  const template = buildingTemplates[building.templateId];
  if (!template) return null;

  return (
    <group
      ref={buildingRef}
      onClick={() => onSelect(building.id)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <animated.group scale={scale}>
        {/* Building base with effects */}
        <mesh>
          <meshStandardMaterial
            ref={materialRef}
            color={building.status === 'construction' ? '#666666' : '#4A5568'}
            emissive={building.status === 'active' ? '#3B82F6' : '#000000'}
            emissiveIntensity={glow}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={building.status === 'construction' ? 0.8 : 1}
          />
        </mesh>

        {/* Resource generation effects */}
        {building.status === 'active' && building.effects.map((effect, index) => {
          if (effect.type === 'resource' && effect.value > 0) {
            return (
              <Trail
                key={`${effect.type}-${effect.target}-${index}`}
                width={0.5}
                length={4}
                color={template.category === 'production' ? '#10B981' : '#3B82F6'}
                attenuation={(t) => t * t}
              >
                <mesh visible={false}>
                  <sphereGeometry args={[0.1]} />
                </mesh>
              </Trail>
            );
          }
          return null;
        })}

        {/* Building info overlay */}
        <Html
          position={[0, template.gridSize.height + 0.5, 0]}
          center
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            pointerEvents: 'none',
            transform: 'scale(1.5)',
            opacity: isHovered || isSelected ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span>{template.icon}</span>
              <span>{template.name}</span>
            </div>
            {building.status === 'construction' && (
              <div className="text-center text-green-400">
                {Math.round(building.constructionProgress * 100)}%
              </div>
            )}
            {building.status === 'active' && (
              <div className="flex flex-wrap gap-2 justify-center">
                {building.effects.map((effect, index) => {
                  const resourceIcon = resources[effect.target]?.icon;
                  if (!resourceIcon) return null;

                  return (
                    <div 
                      key={`${effect.type}-${effect.target}-${index}`}
                      className="flex items-center gap-1 text-sm"
                    >
                      {effect.type === 'resource' && effect.value > 0 && '+'}
                      {effect.value}
                      {effect.type === 'efficiency' && 'x '}
                      {resourceIcon}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Html>
      </animated.group>
    </group>
  );
} 