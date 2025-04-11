// File: /src/components/game/pixel/PixelDialog.tsx
'use client';
import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface PixelDialogProps {
  message: string;
  mood?: 'happy' | 'curious' | 'excited' | 'concerned' | 'neutral' | 'thinking';
  isImportant?: boolean;
  onClose?: () => void;
}

// Helper to get mood-based styles
const getMoodStyles = (mood: PixelDialogProps['mood'] = 'neutral') => {
  const baseStyles = {
    background: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  switch (mood) {
    case 'happy':
      return {
        ...baseStyles,
        borderColor: '#10B981',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
      };
    case 'curious':
      return {
        ...baseStyles,
        borderColor: '#3B82F6',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
      };
    case 'excited':
      return {
        ...baseStyles,
        borderColor: '#FBBF24',
        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)',
      };
    case 'concerned':
      return {
        ...baseStyles,
        borderColor: '#EF4444',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
      };
    case 'thinking':
      return {
        ...baseStyles,
        borderColor: '#8B5CF6',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
      };
    default:
      return {
        ...baseStyles,
        borderColor: '#7C3AED',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
      };
  }
};

/**
 * Displays dialogue from Pixel in 3D space using HTML overlay
 * Enhanced with mood-based styling and animations
 */
export default function PixelDialog({ 
  message, 
  mood = 'neutral',
  isImportant = false,
  onClose 
}: PixelDialogProps) {
  const [visible, setVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState('');
  
  // Typing animation effect
  useEffect(() => {
    if (!message || !visible) return;
    
    let currentChar = 0;
    const typingSpeed = isImportant ? 30 : 40; // Type faster for important messages
    
    const typingInterval = setInterval(() => {
      if (currentChar < message.length) {
        setDisplayedMessage(message.slice(0, currentChar + 1));
        currentChar++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [message, visible, isImportant]);
  
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };
  
  if (!visible || !message) return null;

  const moodStyles = getMoodStyles(mood);

  return (
    <Html
      position={[0, 1.2, 0]}
      center
      style={{
        pointerEvents: 'auto',
        transform: 'scale(1)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        style={{
          ...moodStyles,
          padding: '12px 20px',
          borderRadius: '12px',
          minWidth: '200px',
          maxWidth: '400px',
        }}
      >
        <div style={{ position: 'relative' }}>
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'rgba(75, 85, 99, 0.8)',
              color: '#F8FAFC',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              padding: 0,
              transition: 'background-color 0.2s',
            }}
          >
            ×
          </motion.button>

          {/* Message content */}
          <div
            style={{
              color: '#F8FAFC',
              fontSize: isImportant ? '18px' : '16px',
              lineHeight: '1.5',
              margin: '4px 0',
            }}
          >
            {displayedMessage}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.7 }}
                style={{ marginLeft: 4 }}
              >
                ▋
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </Html>
  );
}