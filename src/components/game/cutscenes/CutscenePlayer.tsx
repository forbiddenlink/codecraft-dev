'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Cutscene {
  id: string;
  title: string;
  scenes: CutsceneScene[];
  skippable: boolean;
  music?: string;
}

export interface CutsceneScene {
  id: string;
  background?: string; // color or image
  character?: {
    name: string;
    avatar: string;
    position: 'left' | 'center' | 'right';
    expression?: string;
  };
  dialogue?: {
    speaker: string;
    text: string;
    emotion?: string;
  };
  narration?: string;
  visual?: {
    type: 'image' | 'animation' | 'particles';
    content: string;
  };
  duration?: number; // auto-advance after X seconds
  choices?: Array<{
    text: string;
    nextScene?: string;
  }>;
}

interface CutscenePlayerProps {
  cutscene: Cutscene | null;
  onComplete: () => void;
  onSkip?: () => void;
}

export function CutscenePlayer({ cutscene, onComplete, onSkip }: CutscenePlayerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [textProgress, setTextProgress] = useState(0);

  useEffect(() => {
    if (cutscene) {
      setIsVisible(true);
      setCurrentSceneIndex(0);
      setTextProgress(0);
    }
  }, [cutscene]);

  // Get scene info safely before early return
  const currentScene = cutscene?.scenes[currentSceneIndex];
  const isLastScene = currentScene && currentSceneIndex === cutscene.scenes.length - 1;

  const handleNext = () => {
    if (isLastScene) {
      setIsVisible(false);
      onComplete();
    } else {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setTextProgress(0);
    }
  };

  // Auto-advance text animation
  useEffect(() => {
    if (!currentScene?.dialogue) return;

    const text = currentScene.dialogue.text;
    if (textProgress < text.length) {
      const timer = setTimeout(() => {
        setTextProgress(textProgress + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [textProgress, currentScene]);

  // Auto-advance scene
  useEffect(() => {
    if (currentScene?.duration && textProgress >= (currentScene.dialogue?.text.length || 0)) {
      const timer = setTimeout(() => {
        handleNext();
      }, currentScene.duration);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene, textProgress]);

  if (!cutscene || !isVisible || !currentScene) return null;

  const handleSkip = () => {
    if (cutscene.skippable) {
      setIsVisible(false);
      onSkip?.();
    }
  };

  const characterPositions = {
    left: '-translate-x-1/4',
    center: 'translate-x-0',
    right: 'translate-x-1/4'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background */}
          <div 
            className="absolute inset-0"
            style={{
              background: currentScene.background || 'linear-gradient(to bottom, #0f172a, #1e293b)'
            }}
          />

          {/* Animated stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Character */}
          {currentScene.character && (
            <motion.div
              className={`absolute bottom-32 ${characterPositions[currentScene.character.position]} transform`}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <div className="text-9xl filter drop-shadow-2xl">
                {currentScene.character.avatar}
              </div>
              <div className="text-center mt-4 text-white font-bold text-xl">
                {currentScene.character.name}
              </div>
            </motion.div>
          )}

          {/* Dialogue box */}
          {currentScene.dialogue && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="max-w-4xl mx-auto">
                {/* Speaker name */}
                <div className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2">
                  {currentScene.dialogue.emotion && (
                    <span className="text-2xl">{currentScene.dialogue.emotion}</span>
                  )}
                  {currentScene.dialogue.speaker}
                </div>

                {/* Dialogue text with typewriter effect */}
                <div className="text-white text-xl leading-relaxed">
                  {currentScene.dialogue.text.substring(0, textProgress)}
                  {textProgress < currentScene.dialogue.text.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      ▌
                    </motion.span>
                  )}
                </div>

                {/* Continue indicator */}
                {textProgress >= currentScene.dialogue.text.length && (
                  <motion.div
                    className="mt-4 text-gray-400 text-sm flex items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span>Press SPACE or click to continue</span>
                    <span>▶</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Narration */}
          {currentScene.narration && !currentScene.dialogue && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-3xl text-center">
                <motion.p
                  className="text-white text-2xl leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentScene.narration}
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Choices */}
          {currentScene.choices && textProgress >= (currentScene.dialogue?.text.length || 0) && (
            <motion.div
              className="absolute bottom-32 left-0 right-0 flex justify-center gap-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentScene.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Handle choice logic here
                    handleNext();
                  }}
                >
                  {choice.text}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            {cutscene.skippable && (
              <motion.button
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
              >
                Skip →
              </motion.button>
            )}
          </div>

          {/* Scene progress */}
          <div className="absolute top-4 left-4 flex gap-1">
            {cutscene.scenes.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-1 rounded-full transition-all ${
                  index === currentSceneIndex
                    ? 'bg-blue-500'
                    : index < currentSceneIndex
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Click/Space to continue */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleNext}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') handleNext();
              if (e.key === 'Escape') handleSkip();
            }}
            tabIndex={0}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Predefined cutscenes
export const CUTSCENES: Record<string, Cutscene> = {
  'game-intro': {
    id: 'game-intro',
    title: 'The Arrival',
    skippable: true,
    scenes: [
      {
        id: 'scene-1',
        background: 'linear-gradient(to bottom, #000000, #1e1b4b)',
        narration: 'Planet Codex-7. A world of ancient ruins and mysterious technology...',
        duration: 3000
      },
      {
        id: 'scene-2',
        background: 'linear-gradient(to bottom, #1e1b4b, #7f1d1d)',
        narration: 'Your colony ship hurtles through the atmosphere, systems failing...',
        duration: 3000
      },
      {
        id: 'scene-3',
        background: 'linear-gradient(to bottom, #7f1d1d, #0f172a)',
        narration: 'CRASH! The ship slams into ancient ruins. Everything goes black...',
        duration: 3000
      },
      {
        id: 'scene-4',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Mysterious Voice',
          text: 'Welcome, Commander. I have been waiting for you...',
          emotion: '✨'
        }
      }
    ]
  },

  'pixel-reveal': {
    id: 'pixel-reveal',
    title: 'The Truth About Pixel',
    skippable: false,
    scenes: [
      {
        id: 'scene-1',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Pixel',
          text: 'Commander... there\'s something I need to tell you. Something I\'ve hidden for a long time...',
          emotion: '😔'
        }
      },
      {
        id: 'scene-2',
        background: 'linear-gradient(to bottom, #0f172a, #3b82f6)',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center',
          expression: 'serious'
        },
        dialogue: {
          speaker: 'Pixel',
          text: 'I am not just an AI. My name was Codex. I was the First Developer, the one who created the CodeCraft Protocol.',
          emotion: '😌'
        }
      },
      {
        id: 'scene-3',
        background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)',
        character: {
          name: 'Codex',
          avatar: '✨',
          position: 'center'
        },
        dialogue: {
          speaker: 'Codex (Pixel)',
          text: 'We thought uploading our consciousness would save us. Instead, we lost what made us human. I don\'t want that for you.',
          emotion: '💔'
        }
      },
      {
        id: 'scene-4',
        character: {
          name: 'Codex',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Codex',
          text: 'But together, we can find a better way. A way to harness the power of code without losing ourselves. Will you help me?',
          emotion: '🙏'
        },
        choices: [
          { text: 'I\'m with you, Codex.', nextScene: 'acceptance' },
          { text: 'I need time to think...', nextScene: 'hesitation' }
        ]
      }
    ]
  },

  'void-arrives': {
    id: 'void-arrives',
    title: 'The Void Arrives',
    skippable: false,
    music: 'dramatic-tension',
    scenes: [
      {
        id: 'scene-1',
        background: 'linear-gradient(to bottom, #0f172a, #000000)',
        narration: 'Alert sirens blare across the colony. The sky darkens...',
        duration: 2000
      },
      {
        id: 'scene-2',
        background: '#000000',
        narration: 'A massive fleet emerges from hyperspace. The Void Collective has arrived.',
        duration: 3000
      },
      {
        id: 'scene-3',
        character: {
          name: 'Captain Rivera',
          avatar: '👩‍✈️',
          position: 'left'
        },
        dialogue: {
          speaker: 'Captain Rivera',
          text: 'All hands to battle stations! Commander, we need you on the bridge NOW!',
          emotion: '😨'
        }
      },
      {
        id: 'scene-4',
        character: {
          name: 'Codex',
          avatar: '🤖',
          position: 'right'
        },
        dialogue: {
          speaker: 'Codex',
          text: 'This is it, Commander. Everything you\'ve learned has prepared you for this moment. Trust in your code. Trust in yourself.',
          emotion: '💪'
        }
      }
    ]
  },

  'first-victory': {
    id: 'first-victory',
    title: 'First Challenge Victory',
    skippable: true,
    scenes: [
      {
        id: 'scene-1',
        background: 'linear-gradient(to bottom, #10b981, #3b82f6)',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Pixel',
          text: 'You did it! Your first challenge complete! I knew you had it in you!',
          emotion: '🎉'
        },
        duration: 2000
      },
      {
        id: 'scene-2',
        narration: 'The ruins glow brighter. Ancient technology responds to your code...',
        duration: 2000
      },
      {
        id: 'scene-3',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Pixel',
          text: 'This is just the beginning, Commander. There\'s so much more to discover!',
          emotion: '✨'
        }
      }
    ]
  },

  'level-up': {
    id: 'level-up',
    title: 'Level Up!',
    skippable: true,
    scenes: [
      {
        id: 'scene-1',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        narration: '✨ LEVEL UP! ✨',
        duration: 1000
      },
      {
        id: 'scene-2',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Pixel',
          text: 'Congratulations, Commander! Your skills are growing stronger. You\'ve earned a skill point - use it wisely!',
          emotion: '⭐'
        }
      }
    ]
  },

  'ancient-memory': {
    id: 'ancient-memory',
    title: 'Ancient Memory Fragment',
    skippable: false,
    scenes: [
      {
        id: 'scene-1',
        background: 'linear-gradient(to bottom, #1e293b, #3b0764)',
        narration: 'You touch the glowing rune. Your vision blurs. Suddenly, you see...',
        duration: 2000
      },
      {
        id: 'scene-2',
        background: 'linear-gradient(to bottom, #3b0764, #6b21a8)',
        narration: 'A memory. Not yours. An Ancient developer, thousands of years ago, writing the first lines of CodeCraft...',
        duration: 3000
      },
      {
        id: 'scene-3',
        narration: 'They smile as buildings rise from pure code. They have no idea what\'s coming...',
        duration: 3000
      },
      {
        id: 'scene-4',
        background: '#000000',
        narration: 'The Void arrives. The Ancient civilization falls. But one survives. Codex. They upload their consciousness, becoming... Pixel.',
        duration: 4000
      },
      {
        id: 'scene-5',
        character: {
          name: 'Pixel',
          avatar: '🤖',
          position: 'center'
        },
        dialogue: {
          speaker: 'Pixel',
          text: 'Now you know my story. But your story is still being written. Make it a better one than mine.',
          emotion: '💙'
        }
      }
    ]
  }
};

// Helper to get cutscene by ID
export function getCutsceneById(id: string): Cutscene | null {
  return CUTSCENES[id] || null;
}

// Helper to check if cutscene has been viewed
export function hasCutsceneBeenViewed(cutsceneId: string): boolean {
  if (typeof window === 'undefined') return false;
  const viewed = localStorage.getItem('viewed-cutscenes');
  if (!viewed) return false;
  const viewedArray = JSON.parse(viewed);
  return viewedArray.includes(cutsceneId);
}

// Helper to mark cutscene as viewed
export function markCutsceneViewed(cutsceneId: string): void {
  if (typeof window === 'undefined') return;
  const viewed = localStorage.getItem('viewed-cutscenes');
  const viewedArray = viewed ? JSON.parse(viewed) : [];
  if (!viewedArray.includes(cutsceneId)) {
    viewedArray.push(cutsceneId);
    localStorage.setItem('viewed-cutscenes', JSON.stringify(viewedArray));
  }
}

export default CutscenePlayer;

