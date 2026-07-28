'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processTick } from '@/store/slices/resourceSlice';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import {
  RESOURCE_COLORS,
  RESOURCE_ICONS,
  type ColonyResource,
} from '@/components/ui/resourceMeta';

type ResourceType = Extract<ColonyResource, 'energy' | 'minerals' | 'water' | 'food'>;

const RESOURCE_ORDER: ResourceType[] = ['energy', 'minerals', 'water', 'food'];

const RESOURCE_NAMES: Record<ResourceType, string> = {
  energy: 'Energy',
  minerals: 'Minerals',
  water: 'Water',
  food: 'Food',
};

export default function ResourceHUD() {
  const dispatch = useAppDispatch();
  const storage = useAppSelector((state) => state.resource.storage) as Record<ResourceType, number>;
  const capacity = useAppSelector((state) => state.resource.capacity) as Record<ResourceType, number>;
  const productionRates = useAppSelector(
    (state) => state.resource.productionRates,
  ) as Record<ResourceType, number>;

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(processTick(1));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="flex gap-2.5">
      {RESOURCE_ORDER.map((resourceType, index) => {
        const amount = storage[resourceType] ?? 0;
        const color = RESOURCE_COLORS[resourceType];
        const rate = productionRates[resourceType] ?? 0;

        return (
          <motion.div
            key={resourceType}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            className="group relative"
          >
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border border-white/[0.08]"
              style={{
                backgroundColor: `${color}22`,
                boxShadow: `0 0 18px ${color}18`,
              }}
            >
              <Icon
                icon={RESOURCE_ICONS[resourceType]}
                size={20}
                className="text-[rgb(var(--text-primary))]"
                style={{ color }}
              />

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-base))] border border-white/[0.08]">
                {Math.floor(amount)}
              </div>

              {rate !== 0 && (
                <motion.div
                  className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${
                    rate > 0 ? 'bg-[rgb(var(--success))]' : 'bg-[rgb(var(--error))]'
                  }`}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1.15 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 1,
                  }}
                />
              )}
            </div>

            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-white/[0.08] bg-[rgb(var(--bg-base)/0.95)] px-2.5 py-1.5 opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:opacity-100">
              <div className="text-xs text-[rgb(var(--text-primary))]">
                <div className="font-medium">{RESOURCE_NAMES[resourceType]}</div>
                <div className="text-[rgb(var(--text-muted))]">
                  {Math.floor(amount)} / {capacity[resourceType]}
                </div>
                <div
                  className={
                    rate > 0
                      ? 'text-[rgb(var(--success))]'
                      : rate < 0
                        ? 'text-[rgb(var(--error))]'
                        : 'text-[rgb(var(--text-muted))]'
                  }
                >
                  {rate > 0 ? '+' : ''}
                  {rate.toFixed(1)}/s
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
