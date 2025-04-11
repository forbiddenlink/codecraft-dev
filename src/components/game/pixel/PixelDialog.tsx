// File: /src/components/game/pixel/PixelDialog.tsx
'use client';
import { useState } from 'react';
import { Html } from '@react-three/drei';

interface PixelDialogProps {
  message: string;
}

/**
 * Displays dialogue from Pixel in 3D space using HTML overlay
 */
export default function PixelDialog({ message }: PixelDialogProps) {
  const [visible, setVisible] = useState(true);
  
  if (!visible || !message) return null;

  return (
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
          onClick={() => setVisible(false)}
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
        {message}
      </div>
    </Html>
  );
}