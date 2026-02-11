'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/store/hooks';
import { startTutorial } from '@/store/slices/tutorialSlice';
import { WELCOME_TUTORIAL } from '@/data/tutorialData';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  visual: string; // emoji or icon
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function OnboardingFlow() {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('codecraft_onboarding_complete');
    if (!hasCompletedOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CodeCraft! 🚀',
      description: 'Embark on an epic journey to build a galactic colony while learning to code. Your adventure begins on Planet Codex-7, where ancient ruins hold the secrets of web development.',
      visual: '🌌'
    },
    {
      id: 'name',
      title: 'Who are you, Commander?',
      description: 'Every great developer needs a name. What should we call you?',
      visual: '👤'
    },
    {
      id: 'pixel',
      title: 'Meet Pixel 🤖',
      description: 'Pixel is your AI companion who will guide you through challenges, provide hints, and celebrate your victories. Together, you\'ll unlock the mysteries of the ancient code ruins!',
      visual: '✨'
    },
    {
      id: 'gameplay',
      title: 'How It Works',
      description: 'Write real HTML, CSS, and JavaScript code to build structures in your colony. Each challenge teaches you new concepts while expanding your galactic empire!',
      visual: '💻'
    },
    {
      id: 'challenges',
      title: 'Progressive Learning',
      description: 'Start with simple HTML elements and progress to advanced JavaScript. Each challenge builds on the last, creating a complete learning path from beginner to master.',
      visual: '📚'
    },
    {
      id: 'rewards',
      title: 'Earn Rewards',
      description: 'Complete challenges to earn XP, unlock buildings, recruit villagers, and discover achievements. Your colony grows as your coding skills improve!',
      visual: '🏆'
    },
    {
      id: 'ready',
      title: 'Ready to Begin?',
      description: 'The ancient ruins await, Commander. Your first challenge is to establish a communication beacon. Pixel will be with you every step of the way!',
      visual: '🎯'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep === 1 && !username.trim()) {
      alert('Please enter your name, Commander!');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip the introduction? You can always replay it later.')) {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // Save username if provided
    if (username.trim()) {
      localStorage.setItem('codecraft_username', username);
    }

    // Mark onboarding as complete
    localStorage.setItem('codecraft_onboarding_complete', 'true');

    // Start the welcome tutorial
    dispatch(startTutorial({
      tutorialId: WELCOME_TUTORIAL.id,
      steps: WELCOME_TUTORIAL.steps
    }));

    // Hide onboarding
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
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
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <motion.div
          className="relative max-w-2xl w-full mx-4"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Skip Introduction
              </button>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Content card */}
          <motion.div
            key={currentStep}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl border border-white/10"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Visual */}
            <motion.div
              className="text-8xl text-center mb-6"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {currentStepData.visual}
            </motion.div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-white text-center mb-4">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-white/80 text-center mb-8 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Username input (step 2) */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your commander name..."
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors text-center text-xl"
                  maxLength={20}
                  autoFocus
                />
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {currentStep === steps.length - 1 ? 'Start Adventure! 🚀' : 'Next →'}
              </button>
            </div>

            {/* Keyboard hint */}
            <div className="mt-4 text-center text-white/40 text-sm">
              Press Enter to continue
            </div>
          </motion.div>

          {/* Features showcase (bottom) */}
          <motion.div
            className="mt-6 grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { icon: '💻', label: 'Real Code' },
              { icon: '🎮', label: 'Fun Gameplay' },
              { icon: '🏆', label: 'Achievements' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm p-4 rounded-lg text-center border border-white/10"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <div className="text-white/60 text-sm">{feature.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Keyboard navigation */}
        <div
          className="fixed inset-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNext();
            if (e.key === 'Escape') handleSkip();
          }}
          tabIndex={-1}
        />
      </motion.div>
    </AnimatePresence>
  );
}

