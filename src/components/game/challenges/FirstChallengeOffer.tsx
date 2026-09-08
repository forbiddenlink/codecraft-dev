'use client'

import { useEffect, useRef } from 'react'
import type { FirstChallengeOfferProgress } from '@/hooks/useChallengeProgress'
import { trackEvent } from '@/utils/analytics'

const GUIDE_URL =
  'https://www.portfoliopro.dev/free-guide?utm_source=codecraft&utm_medium=game&utm_campaign=first_challenge'

function trackOffer(action: 'shown' | 'clicked' | 'dismissed'): void {
  void trackEvent({
    name: `first_challenge_offer_${action}`,
    properties: {
      challenge_id: 'intro-1',
      surface: 'post_placement_panel',
      campaign: 'first_challenge',
    },
  })
}

export default function FirstChallengeOffer({
  completed,
  progress,
  blocked,
  onShown,
  onHide,
}: {
  completed: string[]
  progress: FirstChallengeOfferProgress
  blocked: boolean
  onShown: () => void
  onHide: () => void
}) {
  const recordedShown = useRef(false)
  const visible =
    completed.length === 1 &&
    completed[0] === 'intro-1' &&
    progress.placed &&
    !progress.hidden &&
    !blocked

  useEffect(() => {
    if (!visible || progress.shown || recordedShown.current) return
    recordedShown.current = true
    onShown()
    trackOffer('shown')
  }, [visible, progress.shown, onShown])

  if (!visible) return null

  return (
    <div className="mt-3 rounded-[var(--radius-sm)] border border-[rgb(var(--accent-subtle)/0.35)] bg-[rgb(var(--accent)/0.15)] p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">
          Want to build this for real?
        </h3>
        <button
          type="button"
          aria-label="Dismiss free guide offer"
          className="btn-secondary"
          onClick={() => {
            onHide()
            trackOffer('dismissed')
          }}
        >
          ×
        </button>
      </div>
      <p className="mb-2 text-sm text-[rgb(var(--text-secondary))]">
        Portfolio Pro teaches the same HTML and CSS through projects you can actually ship.
      </p>
      <a
        href={GUIDE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full"
        onClick={() => {
          onHide()
          trackOffer('clicked')
        }}
      >
        Get the free guide →
      </a>
    </div>
  )
}
