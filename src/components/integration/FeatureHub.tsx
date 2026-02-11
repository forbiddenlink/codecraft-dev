/**
 * Feature Integration Hub
 * Connects all Phase 1-3 features to the game
 */

'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { unlockAchievement, dismissUnlock, dismissToast, initializeAchievements } from '@/store/slices/achievementSlice';
import { allDialogueTrees } from '@/data/exampleDialogues';
import { registerDialogue } from '@/utils/dialogueSystem';

// Dynamic imports for performance
const AnalyticsDashboard = dynamic(() =>
  import('@/components/analytics/AnalyticsDashboard').then((mod) => ({ default: mod.AnalyticsDashboard }))
);
const AchievementUnlock = dynamic(() =>
  import('@/components/achievements/AchievementUnlock').then((mod) => ({ default: mod.AchievementUnlock }))
);
const AchievementToast = dynamic(() =>
  import('@/components/achievements/AchievementToast').then((mod) => ({ default: mod.AchievementToast }))
);
const AchievementProgress = dynamic(() =>
  import('@/components/achievements/AchievementProgress').then((mod) => ({ default: mod.AchievementProgress }))
);
const SessionBrowser = dynamic(() =>
  import('@/components/multiplayer/SessionBrowser').then((mod) => ({ default: mod.SessionBrowser }))
);
const CreateSessionModal = dynamic(() =>
  import('@/components/multiplayer/CreateSessionModal').then((mod) => ({ default: mod.CreateSessionModal }))
);
const CollaborationPanel = dynamic(() =>
  import('@/components/multiplayer/CollaborationPanel').then((mod) => ({ default: mod.CollaborationPanel }))
);
const DialogueBox = dynamic(() =>
  import('@/components/dialogue/DialogueBox').then((mod) => ({ default: mod.DialogueBox }))
);

export function FeatureHub() {
  const dispatch = useAppDispatch();

  // Redux state
  const analyticsState = useAppSelector((state) => state.analytics);
  const achievementState = useAppSelector((state) => state.achievement);
  const multiplayerState = useAppSelector((state) => state.multiplayer);
  const dialogueState = useAppSelector((state) => state.dialogue);
  const userState = useAppSelector((state) => state.user);
  const challengeState = useAppSelector((state) => state.challenges);

  // Initialize systems on mount
  useEffect(() => {
    // Register dialogue trees
    allDialogueTrees.forEach((tree) => registerDialogue(tree));

    // Initialize achievements
    const achievements = [
      {
        id: 'first_challenge',
        title: 'First Steps',
        description: 'Complete your first coding challenge',
        icon: '🎯',
        rarity: 'common' as const,
        xpReward: 50,
        isUnlocked: false,
        progress: 0,
        requirement: 'Complete 1 challenge',
      },
      {
        id: 'five_challenges',
        title: 'Getting Started',
        description: 'Complete 5 coding challenges',
        icon: '🚀',
        rarity: 'common' as const,
        xpReward: 100,
        isUnlocked: false,
        progress: 0,
        requirement: 'Complete 5 challenges',
      },
      {
        id: 'perfect_score',
        title: 'Perfectionist',
        description: 'Get a perfect score on a challenge',
        icon: '⭐',
        rarity: 'rare' as const,
        xpReward: 200,
        isUnlocked: false,
        progress: 0,
        requirement: 'Get 100% on any challenge',
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Complete a challenge in under 2 minutes',
        icon: '⚡',
        rarity: 'rare' as const,
        xpReward: 150,
        isUnlocked: false,
        progress: 0,
        requirement: 'Complete challenge < 2 minutes',
      },
      {
        id: 'master_builder',
        title: 'Master Builder',
        description: 'Place 10 buildings in your colony',
        icon: '🏗️',
        rarity: 'epic' as const,
        xpReward: 300,
        isUnlocked: false,
        progress: 0,
        requirement: 'Place 10 buildings',
      },
      {
        id: 'code_master',
        title: 'Code Master',
        description: 'Complete all beginner challenges',
        icon: '👑',
        rarity: 'epic' as const,
        xpReward: 500,
        isUnlocked: false,
        progress: 0,
        requirement: 'Complete all beginner challenges',
      },
      {
        id: 'legend',
        title: 'Living Legend',
        description: 'Reach level 20',
        icon: '🌟',
        rarity: 'legendary' as const,
        xpReward: 1000,
        isUnlocked: false,
        progress: 0,
        requirement: 'Reach level 20',
      },
    ];

    dispatch(initializeAchievements(achievements));
  }, [dispatch]);

  // Watch for challenge completion to unlock achievements
  useEffect(() => {
    const completedCount = challengeState.completed?.length || 0;

    if (completedCount >= 1 && !achievementState.achievements.find((a: any) => a.id === 'first_challenge')?.isUnlocked) {
      dispatch(unlockAchievement('first_challenge'));
    }

    if (completedCount >= 5 && !achievementState.achievements.find((a: any) => a.id === 'five_challenges')?.isUnlocked) {
      dispatch(unlockAchievement('five_challenges'));
    }
  }, [challengeState.completed, achievementState.achievements, dispatch]);

  // Create mock user for multiplayer
  const currentUser = {
    id: userState.id || 'user_1',
    username: userState.username || 'Player',
    color: '#6366f1',
    level: userState.progress.level || 1,
    xp: userState.progress.xp || 0,
  };

  return (
    <>
      {/* Analytics Dashboard */}
      {analyticsState.isOpen && (
        <AnalyticsDashboard
          playerId={currentUser.id}
          onClose={() => dispatch({ type: 'analytics/closeAnalytics' })}
        />
      )}

      {/* Achievement Unlock Animation */}
      {achievementState.pendingUnlock && (
        <AchievementUnlock
          achievement={achievementState.pendingUnlock}
          onClose={() => dispatch(dismissUnlock())}
          autoCloseDelay={5000}
        />
      )}

      {/* Achievement Toast Notification */}
      {achievementState.showToast && (
        <AchievementToast
          achievement={achievementState.showToast}
          onClose={() => dispatch(dismissToast())}
          duration={4000}
        />
      )}

      {/* Achievement Progress Tracker */}
      {achievementState.showProgress && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-7xl w-full max-h-[90vh] overflow-auto">
            <AchievementProgress
              achievements={Object.values(achievementState.achievements).map((achievement: any) => ({
                ...achievement,
                progress: achievement.progress ?? 0
              }))}
              onAchievementClick={(id) => console.log('Achievement clicked:', id)}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => dispatch({ type: 'achievement/toggleAchievementProgress' })}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Browser */}
      {multiplayerState.showSessionBrowser && (
        <SessionBrowser
          currentUser={currentUser}
          onJoinSession={(sessionId) => {
            dispatch({
              type: 'multiplayer/joinSession',
              payload: { sessionId, isHost: false, canEdit: true },
            });
          }}
          onCreateSession={() => {
            dispatch({ type: 'multiplayer/toggleCreateModal' });
          }}
          onClose={() => dispatch({ type: 'multiplayer/toggleSessionBrowser' })}
        />
      )}

      {/* Create Session Modal */}
      {multiplayerState.showCreateModal && (
        <CreateSessionModal
          currentUser={currentUser}
          onSessionCreated={(session) => {
            dispatch({
              type: 'multiplayer/joinSession',
              payload: { sessionId: session.id, isHost: true, canEdit: true },
            });
          }}
          onClose={() => dispatch({ type: 'multiplayer/toggleCreateModal' })}
        />
      )}

      {/* Collaboration Panel */}
      {multiplayerState.isInSession && multiplayerState.showCollaborationPanel && multiplayerState.sessionId && (
        <div className="fixed right-4 top-20 bottom-4 w-96 z-40">
          <CollaborationPanel
            sessionId={multiplayerState.sessionId}
            currentUser={currentUser}
            onClose={() => dispatch({ type: 'multiplayer/toggleCollaborationPanel' })}
          />
        </div>
      )}

      {/* Dialogue Box */}
      {dialogueState.isActive && dialogueState.currentNPCId && (
        <DialogueBox
          npcName={dialogueState.currentNPCId}
          node={{
            id: 'demo',
            speaker: dialogueState.currentNPCId,
            text: 'This is a demo dialogue. Full integration coming soon!',
            emotion: 'happy',
          }}
          choices={[]}
          onChoice={(id) => console.log('Choice:', id)}
          onContinue={() => dispatch({ type: 'dialogue/endDialogue' })}
          onClose={() => dispatch({ type: 'dialogue/endDialogue' })}
        />
      )}
    </>
  );
}
