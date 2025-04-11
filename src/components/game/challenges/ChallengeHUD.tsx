import { motion } from 'framer-motion';
import { Challenge } from '@/types/challenges';
import { useState } from 'react';

interface ChallengeHUDProps {
  challenge: Challenge;
  isCompleted: boolean;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  onStartCoding: () => void;
}

export default function ChallengeHUD({
  challenge,
  isCompleted,
  onPrev,
  onNext,
  index,
  onStartCoding,
}: ChallengeHUDProps) {
  const [showHints, setShowHints] = useState(false);

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
            {isCompleted ? "✅ " : "🎯 "}Challenge {index + 1}:
          </span>
          <span className={`px-2 py-0.5 rounded text-sm ${
            challenge.difficulty === 1 ? 'bg-green-600' :
            challenge.difficulty === 2 ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {challenge.difficulty === 1 ? 'Beginner' :
             challenge.difficulty === 2 ? 'Intermediate' :
             'Advanced'}
          </span>
        </div>
        <h2 className="text-xl font-bold mt-1">{challenge.title}</h2>
        <p className="text-gray-300 mt-2">{challenge.description}</p>
      </div>

      {/* Objectives */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Objectives:</h3>
        <ul className="space-y-1">
          {challenge.objectives.map((objective, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rewards */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Rewards:</h3>
        <div className="flex flex-wrap gap-2">
          {challenge.rewards.map((reward, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-blue-900 rounded-full text-sm flex items-center gap-1"
            >
              {reward.type === 'building' && '🏗️'}
              {reward.type === 'resource' && '💎'}
              {reward.type === 'villager' && '👤'}
              {reward.type === 'ability' && '⭐'}
              {reward.amount ? `${reward.amount} ` : ''}{reward.id}
            </span>
          ))}
        </div>
      </div>

      {/* Hints */}
      <div className="mb-4">
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          {showHints ? '📝 Hide Hints' : '💡 Show Hints'}
        </button>
        {showHints && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-1"
          >
            {challenge.hints.map((hint, i) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <span className="text-yellow-400">#{i + 1}</span>
                <span>{hint}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <button
          onClick={onPrev}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={index === 0}
        >
          ⟵ Prev
        </button>
        <button
          onClick={onStartCoding}
          className={`px-4 py-1 rounded transition-colors flex-grow text-center ${
            isCompleted
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isCompleted ? "Edit Code" : "Start Coding"}
        </button>
        <button
          onClick={onNext}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={index === 2} // Update this based on total challenges
        >
          Next ⟶
        </button>
      </div>
    </motion.div>
  );
} 