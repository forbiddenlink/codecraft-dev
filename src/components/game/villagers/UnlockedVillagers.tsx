"use client";
import { getAvailableVillagers } from "@/data/villagers";
import VillagerMesh from "@/components/game/villager/VillagerMesh";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useAppSelector } from "@/hooks/reduxHooks";

export default function UnlockedVillagers() {
  const { completed } = useChallengeProgress();
  const playerLevel = useAppSelector((state) => state.player.level);

  // Get villagers that are unlocked based on player progress
  const availableVillagers = getAvailableVillagers(playerLevel, completed);

  return (
    <>
      {availableVillagers.map((villager) => (
        <VillagerMesh
          key={villager.id}
          villager={villager}
          position={villager.location.position}
        />
      ))}
    </>
  );
}
