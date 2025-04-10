'use client';
import { Html } from '@react-three/drei';

export default function PixelDialog({ message }: { message: string }) {
  return (
    <Html position={[-2.5, 2.5, 0]} center distanceFactor={12}>
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '0.6rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '180px',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        {message}
      </div>
    </Html>
  );
}
