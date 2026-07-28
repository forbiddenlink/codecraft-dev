'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Cog,
  Package,
  FlaskConical,
  Sparkles,
  Building2,
  Zap,
  Gem,
  Droplets,
  Wind,
  Wheat,
  Users,
  Microscope,
  Lock,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { buildingTemplates } from '@/data/buildingTemplates';
import { BUILDING_TEMPLATE_ICONS } from '@/data/buildingIds';
import { toggleBuildMode, setSelectedTemplateId } from '@/store/slices/buildingSlice';
import { setCode, setLanguage } from '@/store/slices/editorSlice';
import { Icon } from '@/components/ui/Icon';
import { HudPanel } from '@/components/ui/HudPanel';

const CATEGORIES: { id: string; name: string; icon: LucideIcon }[] = [
  { id: 'habitat', name: 'Habitat', icon: Home },
  { id: 'production', name: 'Production', icon: Cog },
  { id: 'storage', name: 'Storage', icon: Package },
  { id: 'research', name: 'Research', icon: FlaskConical },
  { id: 'special', name: 'Special', icon: Sparkles },
];

function getResourceIcon(resourceId: string): LucideIcon {
  switch (resourceId) {
    case 'energy':
      return Zap;
    case 'minerals':
      return Gem;
    case 'water':
      return Droplets;
    case 'oxygen':
      return Wind;
    case 'food':
      return Wheat;
    case 'colonists':
      return Users;
    case 'research':
      return Microscope;
    default:
      return Package;
  }
}

export default function BuildingMenu() {
  const dispatch = useAppDispatch();
  const selectedTemplateId = useAppSelector((state) => state.building.selectedTemplateId);
  const isBuildModeActive = useAppSelector((state) => state.building.buildMode);
  const unlockedTemplates = useAppSelector((state) => state.building.unlockedTemplates);
  const playerLevel = useAppSelector((state) => state.user.progress.level);
  const completedChallenges = useAppSelector((state) => state.user.progress.completedChallenges);
  const resources = useAppSelector((state) => state.resource.storage);

  const [activeCategory, setActiveCategory] = useState('habitat');

  const categoryBuildings = useMemo(() => {
    return Object.entries(buildingTemplates)
      .filter(([, template]) => template.category === activeCategory)
      .map(([id, template]) => {
        const levelOk = template.requiredLevel <= playerLevel;
        const rewardUnlocked = unlockedTemplates.includes(id);
        let requirementMet = !template.unlockRequirement;
        let lockReason: string | null = null;

        if (!levelOk) {
          lockReason = `Requires level ${template.requiredLevel}`;
        } else if (template.unlockRequirement) {
          if (template.unlockRequirement.type === 'level') {
            requirementMet =
              playerLevel >= (template.unlockRequirement.value as number);
            if (!requirementMet) {
              lockReason = `Requires level ${template.unlockRequirement.value}`;
            }
          } else if (template.unlockRequirement.type === 'challenge') {
            requirementMet = completedChallenges.includes(
              template.unlockRequirement.value as string,
            );
            if (!requirementMet && !rewardUnlocked) {
              lockReason = 'Complete a coding challenge to unlock';
            }
          }
        }

        const unlocked = levelOk && (rewardUnlocked || requirementMet);
        const missingCosts = template.costs.filter(
          (cost) => (resources as Record<string, number>)[cost.resourceId] < cost.amount,
        );
        const canAfford = missingCosts.length === 0;

        return { id, template, unlocked, lockReason, canAfford, missingCosts };
      });
  }, [
    activeCategory,
    playerLevel,
    unlockedTemplates,
    completedChallenges,
    resources,
  ]);

  const handleBuildingSelect = (templateId: string, unlocked: boolean, canAfford: boolean) => {
    if (!unlocked) return;

    if (selectedTemplateId === templateId) {
      dispatch(setSelectedTemplateId(null));
      dispatch(toggleBuildMode(false));
      return;
    }

    dispatch(setSelectedTemplateId(templateId));
    dispatch(toggleBuildMode(true));

    const template = buildingTemplates[templateId];
    if (template) {
      dispatch(setLanguage('html'));
      dispatch(setCode({ language: 'html', code: template.defaultHtml }));
    }

    if (!canAfford) {
      // Still enter build mode so the player sees costs, but placement will fail.
    }
  };

  return (
    <HudPanel className="w-[300px] text-[rgb(var(--text-primary))]">
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={Building2} size={18} className="text-[rgb(var(--accent-subtle))]" />
        <h2 className="text-base font-semibold">Buildings</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`inline-flex min-w-[88px] flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-xs transition-colors ${
              activeCategory === category.id
                ? 'bg-[rgb(var(--accent))] text-white'
                : 'bg-white/[0.06] text-[rgb(var(--text-secondary))] hover:bg-white/[0.1]'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <Icon icon={category.icon} size={13} />
            <span className="whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="custom-scrollbar max-h-[400px] space-y-2 overflow-y-auto pr-1">
        {categoryBuildings.length === 0 ? (
          <div className="py-6 text-center text-sm text-[rgb(var(--text-muted))]">
            No buildings in this category yet.
          </div>
        ) : (
          categoryBuildings.map(({ id, template, unlocked, lockReason, canAfford }) => {
            const TemplateIcon = BUILDING_TEMPLATE_ICONS[id] || Building2;
            const selected = selectedTemplateId === id;

            return (
              <motion.button
                key={id}
                type="button"
                disabled={!unlocked}
                className={`w-full rounded-[var(--radius-md)] p-3 text-left transition-colors ${
                  !unlocked
                    ? 'cursor-not-allowed bg-white/[0.03] opacity-60'
                    : selected
                      ? 'bg-[rgb(var(--accent))] text-white'
                      : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
                whileHover={unlocked ? { scale: 1.01 } : undefined}
                whileTap={unlocked ? { scale: 0.99 } : undefined}
                onClick={() => handleBuildingSelect(id, unlocked, canAfford)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
                      selected ? 'bg-white/15' : 'bg-[rgb(var(--accent)/0.18)]'
                    }`}
                  >
                    <Icon
                      icon={unlocked ? TemplateIcon : Lock}
                      size={16}
                      className={
                        selected
                          ? 'text-white'
                          : unlocked
                            ? 'text-[rgb(var(--accent-subtle))]'
                            : 'text-[rgb(var(--text-muted))]'
                      }
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium">{template.name}</h3>
                    <p
                      className={`text-xs ${
                        selected ? 'text-white/80' : 'text-[rgb(var(--text-muted))]'
                      }`}
                    >
                      {unlocked ? template.description : lockReason || 'Locked'}
                    </p>
                  </div>
                </div>

                {unlocked && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {template.costs.map((cost, index) => {
                      const have = (resources as Record<string, number>)[cost.resourceId] ?? 0;
                      const ok = have >= cost.amount;
                      return (
                        <span
                          key={`${cost.resourceId}-${index}`}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ${
                            selected
                              ? ok
                                ? 'bg-black/20'
                                : 'bg-[rgb(var(--error)/0.35)]'
                              : ok
                                ? 'bg-black/30'
                                : 'bg-[rgb(var(--error)/0.2)] text-[rgb(var(--error))]'
                          }`}
                          title={`${have} / ${cost.amount} ${cost.resourceId}`}
                        >
                          <Icon icon={getResourceIcon(cost.resourceId)} size={11} />
                          {cost.amount}
                        </span>
                      );
                    })}
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {isBuildModeActive && selectedTemplateId && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[rgb(var(--accent-subtle)/0.35)] bg-[rgb(var(--accent)/0.25)] p-3 text-center">
          <div className="text-sm font-medium">Build mode active</div>
          <div className="mt-1 text-xs text-white/75">Click the ground to place</div>
          <div className="mt-1 font-mono text-[10px] text-white/55">R rotate · Esc cancel</div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(var(--accent-subtle) / 0.45);
          border-radius: 4px;
        }
      `}</style>
    </HudPanel>
  );
}
