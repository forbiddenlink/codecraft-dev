'use client'
import VillagerMesh from '@/components/game/villager/VillagerMesh'
import { getAvailableVillagers } from '@/data/villagers'
import { useAppSelector } from '@/store/hooks'

export default function UnlockedVillagers() {
  const completed = useAppSelector((state) => state.challenges.completed)
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
