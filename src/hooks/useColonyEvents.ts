'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRandomEvent, shouldTriggerEvent } from '@/data/colonyEvents';
import { triggerColonyEvent, forceColonyEvent } from '@/store/slices/eventSlice';

/** How often we consider rolling for an event once eligible. */
const CHECK_INTERVAL_MS = 60_000;
/** Chance to spawn when a check fires. */
const TRIGGER_CHANCE = 0.1;
/**
 * After the player finishes the first challenge + places a building,
 * wait this long before the first roll so the core loop stays clear.
 */
const FIRST_EVENT_GRACE_MS = 90_000;

/**
 * Periodically rolls for a colony event when the player is past onboarding
 * and not already viewing an event/tutorial.
 */
export function useColonyEvents() {
  const dispatch = useAppDispatch();
  const activeEventId = useAppSelector((state) => state.events.activeEventId);
  const tutorialActive = useAppSelector((state) => state.tutorial.isActive);
  const playerLevel = useAppSelector((state) => state.user.progress.level);
  const placedBuildings = useAppSelector((state) => state.building.placedBuildings);
  const completedChallenges = useAppSelector((state) => state.challenges.completed);
  const lastCheckRef = useRef(0);
  const eligibleSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    const w = window as Window & {
      __triggerColonyEvent?: (id: string) => void;
      __getColonyEventState?: () => { activeEventId: string | null };
    };

    w.__triggerColonyEvent = (id: string) => {
      dispatch(forceColonyEvent(id));
    };
    w.__getColonyEventState = () => ({ activeEventId });

    return () => {
      delete w.__triggerColonyEvent;
      delete w.__getColonyEventState;
    };
  }, [dispatch, activeEventId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onboardingDone = localStorage.getItem('codecraft_onboarding_complete') === 'true';
    if (!onboardingDone) return;

    const id = window.setInterval(() => {
      if (activeEventId || tutorialActive) return;

      // Keep the first-run challenge → place path free of random interruptions.
      const coreLoopReady =
        completedChallenges.length > 0 && placedBuildings.length > 0;
      if (!coreLoopReady) {
        eligibleSinceRef.current = null;
        return;
      }

      const now = Date.now();
      if (eligibleSinceRef.current === null) {
        eligibleSinceRef.current = now;
      }
      if (now - eligibleSinceRef.current < FIRST_EVENT_GRACE_MS) return;

      if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
      lastCheckRef.current = now;

      if (!shouldTriggerEvent(TRIGGER_CHANCE)) return;

      const event = getRandomEvent(
        playerLevel,
        placedBuildings.map((b) => b.templateId),
        'any',
      );

      if (event) {
        dispatch(triggerColonyEvent(event.id));
      }
    }, 5_000);

    return () => window.clearInterval(id);
  }, [
    activeEventId,
    tutorialActive,
    playerLevel,
    placedBuildings,
    completedChallenges,
    dispatch,
  ]);
}
