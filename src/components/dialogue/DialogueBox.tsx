/**
 * Dialogue Box Component
 * Visual novel-style dialogue interface
 */

import React, { useState, useEffect } from 'react';
import type { DialogueNode, DialogueChoice } from '@/utils/dialogueSystem';

export interface DialogueBoxProps {
  npcName: string;
  npcAvatar?: string;
  node: DialogueNode;
  choices: DialogueChoice[];
  onChoice: (choiceId: string) => void;
  onContinue: () => void;
  onClose: () => void;
}

const emotionColors = {
  happy: 'from-green-600/20 to-green-800/20 border-green-500/30',
  neutral: 'from-gray-600/20 to-gray-800/20 border-gray-500/30',
  sad: 'from-blue-600/20 to-blue-800/20 border-blue-500/30',
  excited: 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30',
  angry: 'from-red-600/20 to-red-800/20 border-red-500/30',
  confused: 'from-purple-600/20 to-purple-800/20 border-purple-500/30',
  proud: 'from-orange-600/20 to-orange-800/20 border-orange-500/30',
};

const emotionEmojis = {
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  excited: '🤩',
  angry: '😠',
  confused: '😕',
  proud: '😤',
};

export function DialogueBox({
  npcName,
  npcAvatar,
  node,
  choices,
  onChoice,
  onContinue,
  onClose,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const emotion = node.emotion || 'neutral';
  const colorClass = emotionColors[emotion];

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < node.text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(node.text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30); // Typing speed

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, node.text]);

  // Reset typing when node changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [node.id]);

  const handleSkipTyping = () => {
    setDisplayedText(node.text);
    setCurrentIndex(node.text.length);
    setIsTyping(false);
  };

  const hasChoices = choices.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 pointer-events-auto">
      <div className="max-w-4xl w-full mb-8">
        {/* NPC Info Card */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl px-6 py-3 border border-gray-700 border-b-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {npcAvatar ? (
              <img
                src={npcAvatar}
                alt={npcName}
                className="w-12 h-12 rounded-full border-2 border-purple-500"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {npcName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-white font-bold">{npcName}</p>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <span>{emotionEmojis[emotion]}</span>
                <span className="capitalize">{emotion}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 transition-colors"
            aria-label="Close dialogue"
          >
            ✕
          </button>
        </div>

        {/* Dialogue Content */}
        <div className={`bg-gradient-to-br ${colorClass} border rounded-b-2xl overflow-hidden`}>
          {/* Text Display */}
          <div
            className="p-6 min-h-32 cursor-pointer"
            onClick={isTyping ? handleSkipTyping : undefined}
          >
            <p className="text-white text-lg leading-relaxed">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />
              )}
            </p>
          </div>

          {/* Choices or Continue */}
          {!isTyping && (
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 border-t border-gray-700">
              {hasChoices ? (
                <div className="space-y-2">
                  {choices.map((choice) => {
                    const isAvailable = !choice.requirementText;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => isAvailable && onChoice(choice.id)}
                        disabled={!isAvailable}
                        className={`w-full text-left p-4 rounded-lg font-medium transition-all ${
                          isAvailable
                            ? 'bg-purple-600/20 hover:bg-purple-600/40 text-white border border-purple-500/30 hover:border-purple-500/60'
                            : 'bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex-1">{choice.text}</span>
                          {!isAvailable && (
                            <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                              🔒 {choice.requirementText}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  onClick={onContinue}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              )}
            </div>
          )}

          {/* Skip Typing Hint */}
          {isTyping && (
            <div className="bg-gray-900/30 px-4 py-2 border-t border-gray-700">
              <p className="text-gray-400 text-xs text-center">
                Click anywhere to skip typing animation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
