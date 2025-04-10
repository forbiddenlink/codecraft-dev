// File: /src/components/game/pixel/PixelDialog.tsx
'use client';
import { Html } from '@react-three/drei';
import { PixelMood } from '@/hooks/usePixelMood';
import { useSpring, animated, SpringValue } from '@react-spring/web';

interface DialogProps {
  message: string;
  mood?: PixelMood;
}

interface AnimatedDivProps {
  style: {
    scale: SpringValue<number>;
    background: string;
    color: string;
    border: string;
    padding: string;
    borderRadius: string;
    fontFamily: string;
    fontSize: string;
    maxWidth: string;
    boxShadow: string;
    transformOrigin: string;
    display: string;
  };
  children: React.ReactNode;
}

export default function PixelDialog({ message, mood = 'neutral' }: DialogProps) {
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

  const animation = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      if (mood === 'happy') {
        await next({ scale: 1.15 });
        await next({ scale: 1 });
      } else if (mood === 'confused') {
        await next({ scale: 0.95 });
        await next({ scale: 1 });
      }
    },
    config: { tension: 200, friction: 12 },
    reset: true,
  });

  const AnimatedDiv = animated.div as React.FC<AnimatedDivProps>;

  return (
    <Html position={[-2.5, 2.5, 0]} center distanceFactor={12}>
      <AnimatedDiv
        style={{
          ...animation,
          background,
          color,
          border,
          padding: '0.6rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxWidth: '180px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transformOrigin: 'center',
          display: 'inline-block'
        }}
      >
        {message}
      </AnimatedDiv>
    </Html>
  );
}