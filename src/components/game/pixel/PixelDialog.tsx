'use client';
import { Html } from '@react-three/drei';
import { PixelMood } from '@/hooks/usePixelMood';

export default function PixelDialog({
  message,
  mood = 'neutral',
}: {
  message: string;
  mood?: PixelMood;
}) {
  let background = 'rgba(255,255,255,0.9)';
  let color = '#333';
  let border = 'none';

  if (mood === 'happy') {
    background = 'rgba(220, 255, 220, 0.95)';
    color = '#207020';
    border = '1px solid #66cc66';
  }

  if (mood === 'confused') {
    background = 'rgba(255, 230, 230, 0.95)';
    color = '#802020';
    border = '1px solid #ff9999';
  }

  return (
    <Html position={[-2.5, 2.5, 0]} center distanceFactor={12}>
      <div style={{
        background,
        color,
        border,
        padding: '0.6rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '180px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        {message}
      </div>
    </Html>
  );
}
