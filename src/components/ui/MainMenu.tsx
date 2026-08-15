'use client'

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ChevronRight,
  CircleHelp,
  Factory,
  Menu,
  Scale,
  Settings,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleAchievementProgress } from '@/store/slices/achievementSlice'
import { openAnalytics } from '@/store/slices/analyticsSlice'
import { toggleCreateModal, toggleSessionBrowser } from '@/store/slices/multiplayerSlice'
import { toggleHelp, toggleMainMenu, toggleSettings } from '@/store/slices/uiSlice'

type MenuItem = {
  id: string
  icon: LucideIcon
  label: string
  description: string
  action: () => void
  hotkey: string
}

export function MainMenu() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.showMainMenu)
  const [showQuickActions, setShowQuickActions] = useState(false)

  const menuItems: MenuItem[] = [
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics Dashboard',
      description: 'View your learning progress',
      action: () => {
        dispatch(openAnalytics())
        dispatch(toggleMainMenu())
      },
      hotkey: '⌘A',
    },
    {
      id: 'achievements',
      icon: Trophy,
      label: 'Achievements',
      description: 'Track your accomplishments',
      action: () => {
        dispatch(toggleAchievementProgress())
        dispatch(toggleMainMenu())
      },
      hotkey: '⌘H',
    },
    {
      id: 'multiplayer',
      icon: Users,
      label: 'Multiplayer',
      description: 'Join or create coding sessions',
      action: () => {
        dispatch(toggleSessionBrowser())
        dispatch(toggleMainMenu())
      },
      hotkey: '⌘M',
    },
    {
      id: 'create-session',
      icon: Sparkles,
      label: 'Create Session',
      description: 'Start a new collaboration',
      action: () => {
        dispatch(toggleCreateModal())
        dispatch(toggleMainMenu())
      },
      hotkey: '⌘⇧C',
    },
    {
      id: 'resources',
      icon: Factory,
      label: 'Resource Management',
      description: 'Track colony resources in the top-right HUD',
      action: () => {
        dispatch(toggleMainMenu())
      },
      hotkey: '',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      description: 'Configure your experience',
      action: () => {
        dispatch(toggleSettings())
        dispatch(toggleMainMenu())
      },
      hotkey: '⌘,',
    },
    {
      id: 'help',
      icon: CircleHelp,
      label: 'Help & Tutorials',
      description: 'Learn how to play',
      action: () => {
        dispatch(toggleHelp())
        dispatch(toggleMainMenu())
      },
      hotkey: '?',
    },
  ]

  return (
    <>
      <button
        type="button"
        onClick={() => dispatch(toggleMainMenu())}
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
        className="fixed top-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--accent))] text-white shadow-[var(--shadow-md)] transition-all duration-150 hover:bg-[rgb(var(--accent-hover))] hover:scale-[1.03] focus-ring"
        aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
        title="Main Menu (Esc)"
      >
        <Icon icon={isOpen ? X : Menu} size={22} />
        {showQuickActions && !isOpen && (
          <span className="absolute -right-1 -top-1 flex gap-0.5">
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--success))]" title="Achievements" />
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--info))]" title="Analytics" />
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--energy))]" title="Multiplayer" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-start p-4 pointer-events-none">
          <button
            type="button"
            className="modal-backdrop absolute inset-0 pointer-events-auto cursor-default"
            aria-label="Close menu"
            onClick={() => dispatch(toggleMainMenu())}
          />

          <div className="relative mt-20 ml-4 w-full max-w-md overflow-hidden pointer-events-auto animate-slide-up panel">
            <div className="border-b border-white/[0.08] bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(20_40_100)] px-6 py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                CodeCraft
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">Command Menu</h2>
              <p className="mt-1 text-sm text-white/75">
                Colony tools, learning, and collaboration
              </p>
            </div>

            <div className="max-h-[70vh] space-y-1.5 overflow-y-auto p-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-transparent bg-[rgb(var(--bg-elevated)/0.35)] px-3 py-3 text-left transition-all duration-150 hover:border-[rgb(var(--accent-subtle)/0.35)] hover:bg-[rgb(var(--bg-elevated))] focus-ring"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--accent)/0.18)] text-[rgb(var(--accent-subtle))] transition-transform group-hover:scale-105">
                    <Icon icon={item.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 flex items-center gap-2">
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                        {item.label}
                      </span>
                      {item.hotkey ? (
                        <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-[rgb(var(--text-muted))]">
                          {item.hotkey}
                        </kbd>
                      ) : null}
                    </span>
                    <span className="block text-xs text-[rgb(var(--text-muted))]">
                      {item.description}
                    </span>
                  </span>
                  <Icon
                    icon={ChevronRight}
                    size={16}
                    className="text-[rgb(var(--text-muted))] transition-colors group-hover:text-[rgb(var(--accent-subtle))]"
                  />
                </button>
              ))}
            </div>

            <div className="border-t border-white/[0.08] bg-[rgb(var(--bg-elevated)/0.45)] px-5 py-3">
              <div className="mb-3 flex items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 hover:text-[rgb(var(--accent-subtle))]"
                  onClick={() => dispatch(toggleMainMenu())}
                >
                  <Icon icon={Scale} size={13} />
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1.5 hover:text-[rgb(var(--accent-subtle))]"
                  onClick={() => dispatch(toggleMainMenu())}
                >
                  Terms
                </Link>
                <Link
                  href="/playground"
                  className="inline-flex items-center gap-1.5 hover:text-[rgb(var(--accent-subtle))]"
                  onClick={() => dispatch(toggleMainMenu())}
                >
                  <Icon icon={Terminal} size={13} />
                  Playground
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgb(var(--text-muted))]">Press Esc to close</span>
                <button
                  type="button"
                  onClick={() => dispatch(toggleMainMenu())}
                  className="btn-primary focus-ring"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
