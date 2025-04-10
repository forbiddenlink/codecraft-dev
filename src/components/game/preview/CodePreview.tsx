'use client';
import { useAppSelector } from '@/hooks/reduxHooks';
import { parseHtmlToGameObjects } from '@/utils/parseHtmlToGameObjects';
import GameObjectMesh from '@/components/game/world/GameObjectMesh';
import { useEffect, useState } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

export default function CodePreview() {
  const code = useAppSelector(state => state.editor.currentCode);
  const isEditorVisible = useAppSelector(state => state.editor.isVisible);
  const [previewObjects, setPreviewObjects] = useState<ReturnType<typeof parseHtmlToGameObjects>>([]);
  const [previewGroup, setPreviewGroup] = useState<Group | null>(null);

  // Parse code into game objects when code changes
  useEffect(() => {
    try {
      const objects = parseHtmlToGameObjects(code);
      setPreviewObjects(objects);
    } catch (error) {
      console.error('Error parsing code:', error);
    }
  }, [code]);

  // Animate preview appearance/disappearance
  useFrame((state, delta) => {
    if (!previewGroup) return;

    if (isEditorVisible) {
      // When editor is visible, smoothly move preview to side of screen
      previewGroup.position.x = previewGroup.position.x + (5 - previewGroup.position.x) * delta * 2;
      previewGroup.rotation.y = previewGroup.rotation.y + (Math.PI / 6 - previewGroup.rotation.y) * delta * 2;
    } else {
      // When editor is hidden, move preview to center
      previewGroup.position.x = previewGroup.position.x + (0 - previewGroup.position.x) * delta * 2;
      previewGroup.rotation.y = previewGroup.rotation.y + (0 - previewGroup.rotation.y) * delta * 2;
    }
  });

  return (
    <group 
      ref={setPreviewGroup}
      position={[0, 0, -2]} // Start slightly in front of player
    >
      {previewObjects.map((obj, index) => (
        <GameObjectMesh
          key={index}
          el={obj}
          objectKey={index}
          onClick={() => {}} // We'll implement interaction later
          completed={new Set()}
        />
      ))}
    </group>
  );
} 