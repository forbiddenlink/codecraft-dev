'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { nextStep, previousStep, endTutorial } from '@/store/slices/tutorialSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface HighlightOverlayProps {
  focusArea: string;
}

interface TutorialOverlayProps {
  currentStep?: number;
  focusArea?: string;
  onComplete?: () => void;
}

/**
 * HighlightOverlay component to highlight specific areas of the UI
 */
const HighlightOverlay: React.FC<HighlightOverlayProps> = ({ focusArea }) => {
  // Get the position of the element to highlight
  const getHighlightPosition = () => {
    // In a real implementation, you would find the actual DOM element
    // and calculate its position relative to the viewport
    switch (focusArea) {
      case 'editor':
        return { left: '0%', top: '50%', width: '40%', height: '80%' };
      case 'game':
        return { left: '50%', top: '50%', width: '50%', height: '100%' };
      case 'header':
        return { left: '50%', top: '0%', width: '100%', height: '10%' };
      case 'buildingMenu':
        return { right: '0%', bottom: '0%', width: '300px', height: '300px' };
      case 'resourceHUD':
        return { right: '0%', top: '0%', width: '300px', height: '200px' };
      case 'controls':
        return { left: '50%', bottom: '0%', width: '50%', height: '15%' };
      default:
        return { left: '50%', top: '50%', width: '50%', height: '50%' };
    }
  };

  const position = getHighlightPosition();

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div className="absolute inset-0 bg-black bg-opacity-70">
        {/* Cutout for the highlighted area */}
        <div
          className="absolute bg-transparent border-2 border-cosmic-blue shadow-cosmic"
          style={{
            ...position,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 15px rgba(30, 58, 138, 0.8)',
            transition: 'all 0.3s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};

/**
 * TutorialOverlay component to guide users through tutorials
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ currentStep, focusArea, onComplete }) => {
  const dispatch = useAppDispatch();
  const tutorialState = useAppSelector((state) => state.tutorial);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);

  // Extract current step from Redux state if not provided via props
  const step = currentStep !== undefined ? 
    tutorialState.steps[currentStep] : 
    (tutorialState.steps[tutorialState.currentStepIndex] || null);
  const currentFocusArea = focusArea || (step?.focusArea || 'game');

  // Handle step completion
  const handleStepComplete = () => {
    if (onComplete) {
      onComplete();
    }
    
    dispatch(nextStep());

    // Show completion message if this was the last step
    if (tutorialState.currentStepIndex === tutorialState.steps.length - 1) {
      setShowCompleteMessage(true);
      
      // Hide completion message after a delay
      setTimeout(() => {
        setShowCompleteMessage(false);
      }, 3000);
    }
  };

  // Skip the tutorial entirely
  const handleSkipTutorial = () => {
    dispatch(endTutorial());
  };

  if (!tutorialState.isActive || !step || !tutorialState.showTutorialUI) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Highlight the focused area */}
      <HighlightOverlay focusArea={currentFocusArea} />

      {/* Tutorial panel */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-96 bg-deep-space bg-opacity-95 border border-cosmic-blue rounded-lg p-4 pointer-events-auto"
        >
          {showCompleteMessage ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-terraforming-green mb-2">Tutorial Complete!</h3>
              <p className="text-stellar-white mb-4">You've completed this tutorial.</p>
              <button 
                onClick={() => setShowCompleteMessage(false)}
                className="px-4 py-2 bg-cosmic-blue hover:bg-opacity-90 text-stellar-white rounded-md transition-all"
              >
                Continue
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-stellar-white">{step.title}</h3>
                <span className="text-sm text-cosmic-dust">
                  {tutorialState.currentStepIndex + 1} / {tutorialState.steps.length}
                </span>
              </div>
              
              <p className="text-stellar-white mb-4">{step.description}</p>
              
              {/* Pixel's dialogue if available */}
              {step.pixelDialogue && (
                <div className="bg-nebula-purple bg-opacity-20 p-2 rounded mb-4 border border-nebula-purple">
                  <p className="text-stellar-white italic">{step.pixelDialogue}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                {tutorialState.currentStepIndex > 0 && (
                  <button 
                    onClick={() => dispatch(previousStep())}
                    className="px-3 py-1 border border-interface-blue text-interface-blue hover:bg-interface-blue hover:bg-opacity-20 rounded-md transition-all"
                  >
                    Previous
                  </button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={handleSkipTutorial}
                    className="px-3 py-1 text-cosmic-dust hover:text-stellar-white transition-all"
                  >
                    Skip Tutorial
                  </button>
                  
                  {step.completion?.type === 'manual' && (
                    <button 
                      onClick={handleStepComplete}
                      className="px-4 py-2 bg-cosmic-blue hover:bg-opacity-90 text-stellar-white rounded-md transition-all"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialOverlay; 