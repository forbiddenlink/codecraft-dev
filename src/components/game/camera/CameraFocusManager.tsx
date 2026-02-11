'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectBuilding } from '@/store/slices/buildingSlice';
import * as THREE from 'three';

interface CameraFocusConfig {
  /** Distance from the target when focused */
  focusDistance: number;
  /** Height offset when focused */
  focusHeightOffset: number;
  /** Animation duration in seconds */
  animationDuration: number;
}

const DEFAULT_CONFIG: CameraFocusConfig = {
  focusDistance: 12,
  focusHeightOffset: 8,
  animationDuration: 1.0,
};

interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  startCameraPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  endCameraPos: THREE.Vector3;
  endTarget: THREE.Vector3;
}

// Easing function for smooth animation
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

interface CameraFocusManagerProps {
  controlsRef: React.RefObject<{
    target: THREE.Vector3;
    object: THREE.Camera;
    update: () => void;
    enabled: boolean;
  } | null>;
  config?: Partial<CameraFocusConfig>;
}

/**
 * CameraFocusManager handles camera animations when buildings are selected.
 * It smoothly transitions the camera to focus on selected buildings and
 * returns to the original view when selection is cleared.
 */
export default function CameraFocusManager({
  controlsRef,
  config = {}
}: CameraFocusManagerProps) {
  const { camera } = useThree();
  const dispatch = useAppDispatch();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Get building selection state from Redux
  const selectedBuildingId = useAppSelector(state => state.building.selectedBuildingId);
  const placedBuildings = useAppSelector(state => state.building.placedBuildings);

  // Animation state ref
  const animationRef = useRef<AnimationState | null>(null);

  // Track focus state
  const focusStateRef = useRef<{
    isFocused: boolean;
    originalCameraPosition: THREE.Vector3;
    originalTarget: THREE.Vector3;
    focusedBuildingId: string | null;
  }>({
    isFocused: false,
    originalCameraPosition: new THREE.Vector3(20, 25, 35),
    originalTarget: new THREE.Vector3(0, 0, -15),
    focusedBuildingId: null,
  });

  // Store original camera position on mount
  useEffect(() => {
    if (controlsRef.current) {
      focusStateRef.current.originalCameraPosition.copy(camera.position);
      focusStateRef.current.originalTarget.copy(controlsRef.current.target);
    }
  }, [camera, controlsRef]);

  /**
   * Calculate the ideal camera position to focus on a target
   */
  const calculateFocusPosition = useCallback((targetPos: THREE.Vector3): {
    cameraPos: THREE.Vector3;
    lookAt: THREE.Vector3
  } => {
    // Calculate camera position relative to target
    // Position camera at an angle for better view
    const angle = Math.PI / 4; // 45 degrees
    const cameraPos = new THREE.Vector3(
      targetPos.x + Math.sin(angle) * mergedConfig.focusDistance,
      targetPos.y + mergedConfig.focusHeightOffset,
      targetPos.z + Math.cos(angle) * mergedConfig.focusDistance
    );

    // Look at point slightly above the target center
    const lookAt = new THREE.Vector3(
      targetPos.x,
      targetPos.y + 1,
      targetPos.z
    );

    return { cameraPos, lookAt };
  }, [mergedConfig.focusDistance, mergedConfig.focusHeightOffset]);

  /**
   * Start animation to focus on a position
   */
  const startFocusAnimation = useCallback((position: { x: number; y: number; z: number }) => {
    if (!controlsRef.current) return;

    const targetPos = new THREE.Vector3(position.x, position.y, position.z);
    const { cameraPos, lookAt } = calculateFocusPosition(targetPos);

    // Store current state before animating (only if not already focused)
    if (!focusStateRef.current.isFocused) {
      focusStateRef.current.originalCameraPosition.copy(camera.position);
      focusStateRef.current.originalTarget.copy(controlsRef.current.target);
    }

    // Setup animation
    animationRef.current = {
      isAnimating: true,
      startTime: performance.now(),
      startCameraPos: camera.position.clone(),
      startTarget: controlsRef.current.target.clone(),
      endCameraPos: cameraPos,
      endTarget: lookAt,
    };

    focusStateRef.current.isFocused = true;
  }, [camera, controlsRef, calculateFocusPosition]);

  /**
   * Start animation to return to original position
   */
  const startResetAnimation = useCallback(() => {
    if (!controlsRef.current) return;

    // Setup animation back to original position
    animationRef.current = {
      isAnimating: true,
      startTime: performance.now(),
      startCameraPos: camera.position.clone(),
      startTarget: controlsRef.current.target.clone(),
      endCameraPos: focusStateRef.current.originalCameraPosition.clone(),
      endTarget: focusStateRef.current.originalTarget.clone(),
    };

    focusStateRef.current.isFocused = false;
    focusStateRef.current.focusedBuildingId = null;
  }, [camera, controlsRef]);

  // React to building selection changes
  useEffect(() => {
    if (selectedBuildingId) {
      // Find the selected building
      const building = placedBuildings.find(b => b.id === selectedBuildingId);
      if (building && building.id !== focusStateRef.current.focusedBuildingId) {
        focusStateRef.current.focusedBuildingId = building.id;
        startFocusAnimation(building.position);
      }
    } else if (focusStateRef.current.isFocused) {
      // Selection cleared, return to original position
      startResetAnimation();
    }
  }, [selectedBuildingId, placedBuildings, startFocusAnimation, startResetAnimation]);

  // Handle Escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && focusStateRef.current.isFocused) {
        dispatch(selectBuilding(null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // Update animation each frame
  useFrame(() => {
    if (!animationRef.current?.isAnimating || !controlsRef.current) {
      return;
    }

    const elapsed = (performance.now() - animationRef.current.startTime) / 1000;
    const duration = mergedConfig.animationDuration;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    // Interpolate camera position
    camera.position.lerpVectors(
      animationRef.current.startCameraPos,
      animationRef.current.endCameraPos,
      easedProgress
    );

    // Interpolate target
    controlsRef.current.target.lerpVectors(
      animationRef.current.startTarget,
      animationRef.current.endTarget,
      easedProgress
    );

    controlsRef.current.update();

    // Check if animation is complete
    if (progress >= 1) {
      animationRef.current.isAnimating = false;
    }
  });

  // This component doesn't render anything visible
  return null;
}
