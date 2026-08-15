'use client'
import VillagerMesh from '@/components/game/villager/VillagerMesh'
import { getAvailableVillagers } from '@/data/villagers'
import { useAppSelector } from '@/hooks/reduxHooks'
import { useChallengeProgress } from '@/hooks/useChallengeProgress'

export default function UnlockedVillagers() {
  const { completed } = useChallengeProgress()
  const playerLevel = useAppSelector((state) => state.user.progress.level)

  // Get villagers that are unlocked based on player progress
  const availableVillagers = getAvailableVillagers(playerLevel, completed)

  return (
    <>
      {availableVillagers.map((villager) => (
        <VillagerMesh key={villager.id} villager={villager} position={villager.location.position} />
      ))}
    </>
  )
}
