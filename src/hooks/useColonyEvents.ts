'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRandomEvent, shouldTriggerEvent } from '@/data/colonyEvents';
import { triggerColonyEvent, forceColonyEvent } from '@/store/slices/eventSlice';

const CHECK_INTERVAL_MS = 45_000;
const TRIGGER_CHANCE = 0.12;

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
  const lastCheckRef = useRef(0);

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

      const now = Date.now();
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
  }, [activeEventId, tutorialActive, playerLevel, placedBuildings, dispatch]);
}
