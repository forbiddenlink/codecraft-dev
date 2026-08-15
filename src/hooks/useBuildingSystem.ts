import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Vector3 } from 'three'
import { buildingTemplates } from '@/data/buildingTemplates'
import { buildingSystem } from '@/game/systems/BuildingSystem'
import {
  cancelPlacement as cancelPlacementAction,
  rotatePreview,
} from '@/store/slices/buildingSlice'
import type { RootState } from '@/store/store'

export type ResourceType = 'energy' | 'minerals' | 'water' | 'food'

export interface BuildingPlacementError {
  type: 'collision' | 'resources' | 'invalid_position'
  message: string
}

export const useBuildingSystem = (templateId: string) => {
  const dispatch = useDispatch()
  const resources = useSelector((state: RootState) => state.resource.storage)
  const rotation = useSelector((state: RootState) => state.building.previewRotation)
  const isPlacing = useSelector((state: RootState) => state.building.buildMode)
  const template = buildingTemplates[templateId]

  const checkResourceRequirements = useCallback(() => {
    if (!template) return false
    return template.costs.every((cost) => {
      const available = resources[cost.resourceId as ResourceType] || 0
      return available >= cost.amount
    })
  }, [template, resources])

  const startPlacement = useCallback(() => {
    // Template selection already enables build mode via setSelectedTemplateId
  }, [])

  const cancelPlacement = useCallback(() => {
    dispatch(cancelPlacementAction())
  }, [dispatch])

  const rotateBuilding = useCallback(() => {
    dispatch(rotatePreview())
  }, [dispatch])

  const tryPlaceBuilding = useCallback(
    (position: Vector3) => {
      if (!template || !checkResourceRequirements()) {
        return null
      }
      return buildingSystem.placeBuilding(templateId, position, rotation)
    },
    [templateId, rotation, template, checkResourceRequirements]
  )

  const getMissingResources = useCallback(() => {
    if (!template) return []
    return template.costs
      .filter((cost) => {
        const available = resources[cost.resourceId as ResourceType] || 0
        return available < cost.amount
      })
      .map((cost) => ({
        resourceId: cost.resourceId,
        required: cost.amount,
        available: resources[cost.resourceId as ResourceType] || 0,
      }))
  }, [template, resources])

  return {
    isPlacing,
    error: null as BuildingPlacementError | null,
    rotation,
    template,
    startPlacement,
    cancelPlacement,
    rotateBuilding,
    tryPlaceBuilding,
    checkResourceRequirements,
    getMissingResources,
  }
}
