/**
 * Main Menu Component
 * Central navigation hub for all CodeCraft features
 */

'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleMainMenu } from '@/store/slices/uiSlice';
import { openAnalytics } from '@/store/slices/analyticsSlice';
import { toggleSessionBrowser, toggleCreateModal } from '@/store/slices/multiplayerSlice';
import { toggleAchievementProgress } from '@/store/slices/achievementSlice';

export function MainMenu() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.showMainMenu);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const menuItems = [
    {
      id: 'analytics',
      icon: '📊',
      label: 'Analytics Dashboard',
      description: 'View your learning progress',
      action: () => {
        dispatch(openAnalytics());
        dispatch(toggleMainMenu());
      },
      hotkey: 'A',
    },
    {
      id: 'achievements',
      icon: '🏆',
      label: 'Achievements',
      description: 'Track your accomplishments',
      action: () => {
        dispatch(toggleAchievementProgress());
        dispatch(toggleMainMenu());
      },
      hotkey: 'H',
    },
    {
      id: 'multiplayer',
      icon: '👥',
      label: 'Multiplayer',
      description: 'Join or create coding sessions',
      action: () => {
        dispatch(toggleSessionBrowser());
        dispatch(toggleMainMenu());
      },
      hotkey: 'M',
    },
    {
      id: 'create-session',
      icon: '✨',
      label: 'Create Session',
      description: 'Start a new collaboration',
      action: () => {
        dispatch(toggleCreateModal());
        dispatch(toggleMainMenu());
      },
      hotkey: 'C',
    },
    {
      id: 'resources',
      icon: '🏭',
      label: 'Resource Management',
      description: 'Manage colony resources',
      action: () => {
        // Resource panel is already visible, just highlight it
        dispatch(toggleMainMenu());
      },
      hotkey: 'R',
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'Configure your experience',
      action: () => {
        // TODO: Open settings modal
        dispatch(toggleMainMenu());
      },
      hotkey: 'S',
    },
    {
      id: 'help',
      icon: '❓',
      label: 'Help & Tutorials',
      description: 'Learn how to play',
      action: () => {
        // TODO: Open help modal
        dispatch(toggleMainMenu());
      },
      hotkey: '?',
    },
  ];

  return (
    <>
      {/* Menu Button - Keep gradient as the single accent element */}
      <button
        onClick={() => dispatch(toggleMainMenu())}
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-accent hover:bg-accent-hover rounded-[var(--radius-md)] shadow-lg flex items-center justify-center text-xl text-white transition-all duration-150 hover:scale-105 focus-ring"
        aria-label="Main Menu"
        title="Main Menu (Esc)"
      >
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
          ☰
        </span>

        {/* Quick Action Indicators */}
        {showQuickActions && !isOpen && (
          <div className="absolute -right-1 -top-1 flex gap-0.5">
            <div className="w-2 h-2 bg-success rounded-full" title="Achievements" />
            <div className="w-2 h-2 bg-info rounded-full" title="Analytics" />
            <div className="w-2 h-2 bg-accent rounded-full" title="Multiplayer" />
          </div>
        )}
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-start p-4 pointer-events-none">
          {/* Backdrop */}
          <div
            className="modal-backdrop absolute inset-0 pointer-events-auto"
            onClick={() => dispatch(toggleMainMenu())}
          />

          {/* Menu Content */}
          <div className="relative mt-20 ml-4 w-full max-w-md panel overflow-hidden pointer-events-auto animate-slide-up">
            {/* Header */}
            <div className="bg-accent px-6 py-5">
              <h2 className="text-h2 text-white mb-1">CodeCraft Menu</h2>
              <p className="text-white/80 text-body">Access all features and settings</p>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full group bg-surface hover:bg-elevated border border-[rgb(var(--border-subtle))] hover:border-accent/30 rounded-[var(--radius-md)] p-4 transition-all duration-150 text-left focus-ring"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-11 h-11 bg-elevated rounded-[var(--radius-sm)] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-h4">{item.label}</h3>
                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-[var(--radius-sm)] border border-accent/20 font-medium">
                          {item.hotkey}
                        </span>
                      </div>
                      <p className="text-small">{item.description}</p>
                    </div>

                    {/* Arrow */}
                    <div className="text-text-muted group-hover:text-accent transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-elevated/50 border-t border-[rgb(var(--border-subtle))] px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-small">Press ESC to close</span>
                <button
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
  );
}
