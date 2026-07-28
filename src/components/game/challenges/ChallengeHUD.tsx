import { motion } from 'framer-motion';
import { useChallengeSystem } from '@/hooks/useChallengeSystem';
import { useAppDispatch } from '@/store/hooks';
import { setEditorVisible, setCode, setLanguage } from '@/store/slices/editorSlice';

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
    availableChallenges,
  } = useChallengeSystem();

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

  const handleStartCoding = () => {
    dispatch(setEditorVisible(true));
    dispatch(setLanguage('html'));
    if (currentChallenge.htmlTemplate) {
      dispatch(setCode({ language: 'html', code: currentChallenge.htmlTemplate }));
    }
    if (currentChallenge.cssTemplate) {
      dispatch(setCode({ language: 'css', code: currentChallenge.cssTemplate }));
    }
  };

  const handleCheckSolution = () => {
    validateChallenge();
  };

  const difficultyLabel =
    currentChallenge.difficulty === 1
      ? 'Beginner'
      : currentChallenge.difficulty === 2
        ? 'Intermediate'
        : 'Advanced';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg text-white"
      style={{ width: '320px' }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {isCompleted ? '✅ ' : '🎯 '}Challenge {currentIndex + 1} of {availableChallenges.length}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-sm ${
              currentChallenge.difficulty === 1
                ? 'bg-green-600'
                : currentChallenge.difficulty === 2
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
            }`}
          >
            {difficultyLabel}
          </span>
        </div>
        <h2 className="text-xl font-bold mt-1">{currentChallenge.title}</h2>
        <p className="text-gray-300 mt-2">{currentChallenge.description}</p>
      </div>

      {currentChallenge.objectives?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Objectives:</h3>
          <ul className="space-y-1">
            {currentChallenge.objectives.map((objective, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResult && (
        <div
          className={`mb-4 p-3 rounded ${
            validationResult.success ? 'bg-green-900 bg-opacity-40' : 'bg-red-900 bg-opacity-40'
          }`}
        >
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

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Rewards:</h3>
        <div className="flex flex-wrap gap-2">
          {currentChallenge.rewards.map((reward, i) => (
            <span key={`${reward.type}-${reward.id}-${i}`} className="px-2 py-1 bg-purple-900 rounded-full text-sm">
              {reward.type}: {reward.id}
              {reward.amount ? ` ×${reward.amount}` : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={navigateToPreviousChallenge}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          ⟵ Prev
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStartCoding}
            className={`px-4 py-1 rounded transition-colors flex-grow text-center ${
              isCompleted ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isCompleted ? 'Edit Code' : 'Start Coding'}
          </button>

          {!isCompleted && (
            <button
              type="button"
              onClick={handleCheckSolution}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50"
              disabled={isValidating}
            >
              {isValidating ? 'Checking...' : 'Check Solution'}
            </button>
          )}
        </div>

        <button
          type="button"
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
