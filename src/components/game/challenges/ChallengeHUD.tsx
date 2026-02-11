import { motion } from 'framer-motion';
import { useChallengeSystem } from '@/hooks/useChallengeSystem';
import { useAppDispatch } from '@/store/hooks';
import { setEditorVisible, setCode } from '@/store/slices/editorSlice';
import type { EditorLanguage } from '@/store/slices/editorSlice';

export default function ChallengeHUD() {
  const dispatch = useAppDispatch();
  const {
    currentChallenge,
    currentIndex,
    isCompleted,
    validateChallenge,
    validationResult,
    isValidating,
    navigateToNextChallenge,
    navigateToPreviousChallenge,
    availableChallenges
  } = useChallengeSystem();
  
  // If no challenges are available
  if (!currentChallenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg text-white"
        style={{ width: '320px' }}
      >
        <h2 className="text-xl font-bold">No Challenges Available</h2>
        <p className="text-gray-300 mt-2">
          You&apos;ve completed all available challenges or need to unlock new ones.
        </p>
      </motion.div>
    );
  }
  
  // Handle starting the challenge coding
  const handleStartCoding = () => {
    // Open editor
    dispatch(setEditorVisible(true));
    
    // Load challenge template code if available
    if (currentChallenge.requirements?.code?.template) {
      dispatch(setCode({
        language: currentChallenge.requirements.code.language as EditorLanguage || 'javascript',
        code: currentChallenge.requirements.code.template
      }));
    }
  };
  
  // Check solution
  const handleCheckSolution = () => {
    validateChallenge();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg text-white"
      style={{ width: '320px' }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {isCompleted ? "✅ " : "🎯 "}Challenge {currentIndex + 1} of {availableChallenges.length}
          </span>
          <span className={`px-2 py-0.5 rounded text-sm ${
            currentChallenge.type === 'building' ? 'bg-green-600' :
            currentChallenge.type === 'coding' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {currentChallenge.type}
          </span>
        </div>
        <h2 className="text-xl font-bold mt-1">{currentChallenge.title}</h2>
        <p className="text-gray-300 mt-2">{currentChallenge.description}</p>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Requirements:</h3>
        <ul className="space-y-1">
          {currentChallenge.requirements.buildings?.map((building: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Build a {building}</span>
            </li>
          ))}
          {currentChallenge.requirements.resources && Object.entries(currentChallenge.requirements.resources).map(([resource, amount], i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Collect {String(amount)} {resource}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Validation result */}
      {validationResult && (
        <div className={`mb-4 p-3 rounded ${
          validationResult.success ? 'bg-green-900 bg-opacity-40' : 'bg-red-900 bg-opacity-40'
        }`}>
          <h3 className="font-semibold">
            {validationResult.success ? '✅ Success!' : '❌ Not quite right'}
          </h3>
          <p>{validationResult.message}</p>
          
          {validationResult.details && validationResult.details.length > 0 && (
            <ul className="mt-2 text-sm">
              {validationResult.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Rewards */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Rewards:</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-900 rounded-full text-sm">
            {currentChallenge.rewards.xp} XP
          </span>
          
          {currentChallenge.rewards.resources && Object.entries(currentChallenge.rewards.resources).map(([resource, amount]) => (
            amount && (
              <span
                key={resource}
                className="px-2 py-1 bg-green-900 rounded-full text-sm flex items-center gap-1"
              >
                {String(amount)} {resource}
              </span>
            )
          ))}
          
          {currentChallenge.rewards.unlocks?.buildings?.map((building: string, i: number) => (
            <span
              key={`building-${i}`}
              className="px-2 py-1 bg-purple-900 rounded-full text-sm"
            >
              🏗️ {building}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <button
          onClick={navigateToPreviousChallenge}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          ⟵ Prev
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleStartCoding}
            className={`px-4 py-1 rounded transition-colors flex-grow text-center ${
              isCompleted
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isCompleted ? "Edit Code" : "Start Coding"}
          </button>
          
          {!isCompleted && (
            <button
              onClick={handleCheckSolution}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50"
              disabled={isValidating}
            >
              {isValidating ? "Checking..." : "Check Solution"}
            </button>
          )}
        </div>
        
        <button
          onClick={navigateToNextChallenge}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === availableChallenges.length - 1}
        >
          Next ⟶
        </button>
      </div>
    </motion.div>
  );
} 