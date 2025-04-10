// File: /src/components/game/pixel/PixelDialog.tsx
'use client';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PixelDialogProps {
  message: string;
}

export default function PixelDialog({ message }: PixelDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);

  // Animate message changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setCurrentMessage(message);
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <Html position={[-1.2, 1.8, 0]} center>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg text-white relative min-w-[240px] max-w-[320px]"
          >
            <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {currentMessage}
            </div>
            {/* Improved triangle pointer with gradient */}
            <div
              className="absolute w-0 h-0"
              style={{
                bottom: '-12px',
                left: '20%',
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '12px solid rgba(17, 24, 39, 0.9)',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
              }}
            />
            {/* Subtle pulsing indicator */}
            <motion.div
              className="absolute right-3 bottom-3 w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  );
}