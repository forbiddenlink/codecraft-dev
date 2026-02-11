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
      {/* Menu Button */}
      <button
        onClick={() => dispatch(toggleMainMenu())}
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
        className="fixed top-4 left-4 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 group"
        aria-label="Main Menu"
        title="Main Menu (Esc)"
      >
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          ☰
        </span>

        {/* Quick Action Indicators */}
        {showQuickActions && !isOpen && (
          <div className="absolute -right-2 -top-2 flex gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Achievements" />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" title="Analytics" />
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" title="Multiplayer" />
          </div>
        )}
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-start p-4 pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => dispatch(toggleMainMenu())}
          />

          {/* Menu Content */}
          <div className="relative mt-20 ml-4 w-full max-w-md bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden pointer-events-auto animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white mb-1">CodeCraft Menu</h2>
              <p className="text-purple-100 text-sm">Access all features and settings</p>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-200 hover:scale-102 hover:shadow-lg text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{item.label}</h3>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                          {item.hotkey}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-500 group-hover:text-purple-400 transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Press ESC to close</span>
                <button
                  onClick={() => dispatch(toggleMainMenu())}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
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
