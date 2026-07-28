'use client';

import { useCallback, useEffect } from 'react';
import { X, Gift, AlertTriangle, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { COLONY_EVENTS, type ColonyEvent } from '@/data/colonyEvents';
import { markEventResolved, clearColonyEvent } from '@/store/slices/eventSlice';
import { addResources, consumeResources } from '@/store/slices/resourceSlice';
import { gainXP } from '@/store/slices/userSlice';
import { Icon } from '@/components/ui/Icon';
import { getColonyEventIcon } from '@/components/ui/eventIcons';

type EffectBag = {
  resources?: Record<string, number>;
  xp?: number;
  morale?: number;
};

function applyEffects(
  dispatch: ReturnType<typeof useAppDispatch>,
  effects?: EffectBag,
) {
  if (!effects) return;

  if (effects.xp && effects.xp > 0) {
    dispatch(gainXP(effects.xp));
  }

  if (effects.resources) {
    Object.entries(effects.resources).forEach(([resource, amount]) => {
      if (amount > 0) {
        dispatch(addResources({ type: resource as any, amount }));
      } else if (amount < 0) {
        dispatch(consumeResources({ type: resource as any, amount: Math.abs(amount) }));
      }
    });
  }
}

function typeStyles(type: ColonyEvent['type']) {
  switch (type) {
    case 'positive':
      return {
        accent: 'text-[rgb(var(--success))]',
        border: 'border-[rgb(var(--success)/0.35)]',
        badge: 'bg-[rgb(var(--success)/0.18)] text-[rgb(var(--success))]',
        IconGlyph: Gift,
      };
    case 'negative':
      return {
        accent: 'text-[rgb(var(--error))]',
        border: 'border-[rgb(var(--error)/0.35)]',
        badge: 'bg-[rgb(var(--error)/0.18)] text-[rgb(var(--error))]',
        IconGlyph: AlertTriangle,
      };
    case 'choice':
      return {
        accent: 'text-[rgb(var(--energy))]',
        border: 'border-[rgb(var(--energy)/0.35)]',
        badge: 'bg-[rgb(var(--energy)/0.18)] text-[rgb(var(--energy))]',
        IconGlyph: Sparkles,
      };
    default:
      return {
        accent: 'text-[rgb(var(--accent-subtle))]',
        border: 'border-[rgb(var(--accent-subtle)/0.35)]',
        badge: 'bg-[rgb(var(--accent)/0.18)] text-[rgb(var(--accent-subtle))]',
        IconGlyph: Sparkles,
      };
  }
}

export function ColonyEventModal() {
  const dispatch = useAppDispatch();
  const activeEventId = useAppSelector((state) => state.events.activeEventId);
  const resources = useAppSelector((state) => state.resource.storage);

  const event = activeEventId
    ? COLONY_EVENTS.find((item) => item.id === activeEventId) ?? null
    : null;

  // Drop stale / unknown ids so the queue cannot get stuck
  useEffect(() => {
    if (activeEventId && !event) {
      dispatch(clearColonyEvent());
    }
  }, [activeEventId, event, dispatch]);

  const close = useCallback(() => {
    dispatch(clearColonyEvent());
  }, [dispatch]);

  const resolveWithEffects = useCallback(
    (effects?: EffectBag) => {
      applyEffects(dispatch, effects);
      dispatch(markEventResolved());
    },
    [dispatch],
  );

  if (!event) return null;

  const styles = typeStyles(event.type);
  const EventIcon = getColonyEventIcon(event.icon);

  const canAfford = (required?: Record<string, number>) => {
    if (!required) return true;
    return Object.entries(required).every(([resource, amount]) => {
      const have = (resources as Record<string, number>)[resource] ?? 0;
      return have >= amount;
    });
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Dismiss event backdrop"
        onClick={() => {
          if (event.canDismiss) close();
        }}
      />

      <div
        role="dialog"
        aria-labelledby="colony-event-title"
        className={`relative w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border bg-[rgb(var(--bg-surface)/0.96)] shadow-[var(--shadow-lg)] ${styles.border}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white/[0.06] ${styles.accent}`}
            >
              <Icon icon={EventIcon} size={22} />
            </span>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${styles.badge}`}>
                  {event.type}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-[rgb(var(--text-muted))]">
                  {event.rarity}
                </span>
              </div>
              <h2
                id="colony-event-title"
                className="text-lg font-semibold text-[rgb(var(--text-primary))]"
              >
                {event.title}
              </h2>
            </div>
          </div>
          {event.canDismiss && (
            <button
              type="button"
              onClick={close}
              className="btn-icon focus-ring"
              aria-label="Dismiss event"
            >
              <Icon icon={X} size={16} />
            </button>
          )}
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
            {event.description}
          </p>

          {event.effects && !event.choices?.length && (
            <div className="rounded-[var(--radius-sm)] border border-white/[0.08] bg-white/[0.04] p-3 text-xs text-[rgb(var(--text-muted))]">
              <p className="mb-1 font-medium text-[rgb(var(--text-secondary))]">Effects</p>
              <ul className="space-y-1">
                {event.effects.xp ? <li>+{event.effects.xp} XP</li> : null}
                {event.effects.morale ? (
                  <li>
                    {event.effects.morale > 0 ? '+' : ''}
                    {event.effects.morale} morale
                  </li>
                ) : null}
                {event.effects.resources &&
                  Object.entries(event.effects.resources).map(([resource, amount]) => (
                    <li key={resource}>
                      {amount > 0 ? '+' : ''}
                      {amount} {resource}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {event.choices && event.choices.length > 0 ? (
            <div className="space-y-2">
              {event.choices.map((choice) => {
                const affordable = canAfford(choice.requirements?.resource);
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={!affordable}
                    onClick={() => resolveWithEffects(choice.outcome.effects)}
                    className={`w-full rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
                      affordable
                        ? 'border-white/[0.08] bg-white/[0.04] hover:border-[rgb(var(--accent-subtle)/0.4)] hover:bg-white/[0.07]'
                        : 'cursor-not-allowed border-white/[0.05] bg-white/[0.02] opacity-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {choice.text}
                    </div>
                    <div className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                      {choice.description}
                      {!affordable && choice.requirements?.resource
                        ? ' — insufficient resources'
                        : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => resolveWithEffects(event.effects)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
