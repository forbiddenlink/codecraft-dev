/**
 * Dialogue Box Component
 * Visual novel-style dialogue interface
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Angry,
  ArrowRight,
  Award,
  Frown,
  HelpCircle,
  Lock,
  Meh,
  Smile,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { DialogueChoice, DialogueNode } from '@/utils/dialogueSystem'

export interface DialogueBoxProps {
  npcName: string
  npcAvatar?: string
  node: DialogueNode
  choices: DialogueChoice[]
  onChoice: (choiceId: string) => void
  onContinue: () => void
  onClose: () => void
}

const emotionColors = {
  happy: 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30',
  neutral: 'from-zinc-600/20 to-zinc-800/20 border-zinc-500/30',
  sad: 'from-sky-600/20 to-sky-800/20 border-sky-500/30',
  excited: 'from-amber-600/20 to-amber-800/20 border-amber-500/30',
  angry: 'from-red-600/20 to-red-800/20 border-red-500/30',
  confused: 'from-slate-600/20 to-slate-800/20 border-slate-500/30',
  proud: 'from-orange-600/20 to-orange-800/20 border-orange-500/30',
}

const emotionIcons: Record<keyof typeof emotionColors, LucideIcon> = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  excited: Sparkles,
  angry: Angry,
  confused: HelpCircle,
  proud: Award,
}

export function DialogueBox({
  npcName,
  npcAvatar,
  node,
  choices,
  onChoice,
  onContinue,
  onClose,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const emotion = node.emotion || 'neutral'
  const colorClass = emotionColors[emotion]

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < node.text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(node.text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 30) // Typing speed

      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [currentIndex, node.text])

  // Reset typing when node changes
  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
    setIsTyping(true)
  }, [node.id])

  const handleSkipTyping = () => {
    setDisplayedText(node.text)
    setCurrentIndex(node.text.length)
    setIsTyping(false)
  }

  const hasChoices = choices.length > 0

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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(30_58_138)] text-xl font-bold text-white">
                {npcName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-white">{npcName}</p>
              <p className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Icon icon={emotionIcons[emotion]} size={14} />
                <span className="capitalize">{emotion}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-600"
            aria-label="Close dialogue"
          >
            <Icon icon={X} size={14} />
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
              {isTyping && <span className="inline-block w-2 h-5 bg-white ml-1 animate-pulse" />}
            </p>
          </div>

          {/* Choices or Continue */}
          {!isTyping && (
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 border-t border-gray-700">
              {hasChoices ? (
                <div className="space-y-2">
                  {choices.map((choice) => {
                    const isAvailable = !choice.requirementText
                    return (
                      <button
                        key={choice.id}
                        onClick={() => isAvailable && onChoice(choice.id)}
                        disabled={!isAvailable}
                        className={`w-full rounded-lg p-4 text-left font-medium transition-all ${
                          isAvailable
                            ? 'border border-[rgb(var(--accent-subtle)/0.35)] bg-[rgb(var(--accent)/0.2)] text-white hover:bg-[rgb(var(--accent)/0.35)]'
                            : 'cursor-not-allowed border border-zinc-700 bg-zinc-800/50 text-zinc-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex-1">{choice.text}</span>
                          {!isAvailable && (
                            <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                              <Icon icon={Lock} size={12} />
                              {choice.requirementText}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[rgb(var(--accent))] py-3 font-medium text-white transition-colors hover:bg-[rgb(30_64_175)]"
                >
                  <span>Continue</span>
                  <Icon icon={ArrowRight} size={16} />
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
  )
}
