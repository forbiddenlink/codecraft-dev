// File: /src/components/game/world/DeferredGameCanvas.tsx
'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { GameCanvasProps } from './GameCanvas'

// The three.js scene is a multi-megabyte chunk. Importing it lazily keeps it off the
// critical path; it is only requested once shouldLoad flips.
const GameCanvas = dynamic(() => import('./GameCanvas'), { ssr: false })

type NavigatorHints = Navigator & {
  connection?: { saveData?: boolean }
  deviceMemory?: number
}

/**
 * True when the device can be trusted to render the scene on its own once the page is idle.
 * Phones, touch-first devices, reduced-motion users, Save-Data and low core/memory devices
 * wait for an explicit interaction instead.
 */
export function canAutoLoadScene(): boolean {
  const nav = navigator as NavigatorHints
  if (nav.connection?.saveData) return false
  if ((nav.hardwareConcurrency ?? 8) <= 2) return false
  if ((nav.deviceMemory ?? 8) <= 2) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.matchMedia('(pointer: coarse)').matches) return false
  if (/Mobi|Android|iPhone|iPad/i.test(nav.userAgent)) return false
  if (window.innerWidth < 768) return false
  return true
}

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const

/** Flips to true after first user interaction, or (capable devices only) once the page is idle. */
function useSceneGate(): boolean {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    let cancelled = false
    const cleanups: Array<() => void> = []
    const load = () => {
      if (cancelled) return
      cancelled = true
      for (const fn of cleanups) fn()
      setShouldLoad(true)
    }

    for (const type of INTERACTION_EVENTS) {
      window.addEventListener(type, load, { capture: true, passive: true })
      cleanups.push(() => window.removeEventListener(type, load, { capture: true }))
    }

    if (canAutoLoadScene()) {
      const schedule = () => {
        if (typeof window.requestIdleCallback === 'function') {
          const id = window.requestIdleCallback(load, { timeout: 4000 })
          cleanups.push(() => window.cancelIdleCallback(id))
        } else {
          const id = window.setTimeout(load, 2000)
          cleanups.push(() => window.clearTimeout(id))
        }
      }
      if (document.readyState === 'complete') {
        schedule()
      } else {
        window.addEventListener('load', schedule, { once: true })
        cleanups.push(() => window.removeEventListener('load', schedule))
      }
    }

    return () => {
      cancelled = true
      for (const fn of cleanups) fn()
    }
  }, [])

  return shouldLoad
}

export default function DeferredGameCanvas(props: GameCanvasProps) {
  const shouldLoad = useSceneGate()
  return shouldLoad ? <GameCanvas {...props} /> : null
}
