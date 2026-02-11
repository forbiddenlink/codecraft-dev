/**
 * Touch Gesture System for Mobile Devices
 * Handles swipe, pinch, tap, and drag gestures
 */

import * as THREE from 'three';

export interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export interface GestureEvent {
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'pan';
  position: { x: number; y: number };
  delta?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  velocity?: number;
}

export type GestureCallback = (event: GestureEvent) => void;

export class TouchGestureManager {
  private element: HTMLElement;
  private touches: Map<number, TouchPoint> = new Map();
  private startTime: number = 0;
  private startPosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastTapTime: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isPanning: boolean = false;

  // Gesture callbacks
  private callbacks: Map<GestureEvent['type'], GestureCallback[]> = new Map();

  // Configuration
  private config = {
    doubleTapDelay: 300,
    longPressDelay: 500,
    swipeThreshold: 50,
    pinchThreshold: 10,
    tapMaxDistance: 10,
  };

  constructor(element: HTMLElement) {
    this.element = element;
    this.initialize();
  }

  private initialize(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart);
    this.element.addEventListener('touchmove', this.handleTouchMove);
    this.element.addEventListener('touchend', this.handleTouchEnd);
    this.element.addEventListener('touchcancel', this.handleTouchCancel);

    // Prevent default touch behaviors
    this.element.style.touchAction = 'none';
  }

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();

    const now = Date.now();
    this.startTime = now;

    // Track all touches
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      });
    }

    // Single touch
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.startPosition = { x: touch.clientX, y: touch.clientY };

      // Long press detection
      this.longPressTimer = setTimeout(() => {
        this.emit('longPress', {
          type: 'longPress',
          position: this.startPosition,
        });
      }, this.config.longPressDelay);
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();

    // Cancel long press if moving
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (e.touches.length === 1) {
      // Pan gesture
      const touch = e.touches[0];
      const delta = {
        x: touch.clientX - this.startPosition.x,
        y: touch.clientY - this.startPosition.y,
      };

      this.isPanning = true;

      this.emit('pan', {
        type: 'pan',
        position: { x: touch.clientX, y: touch.clientY },
        delta,
      });
    } else if (e.touches.length === 2) {
      // Pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const currentDistance = this.getDistance(
        touch1.clientX,
        touch1.clientY,
        touch2.clientX,
        touch2.clientY
      );

      const startTouch1 = this.touches.get(touch1.identifier);
      const startTouch2 = this.touches.get(touch2.identifier);

      if (startTouch1 && startTouch2) {
        const startDistance = this.getDistance(
          startTouch1.x,
          startTouch1.y,
          startTouch2.x,
          startTouch2.y
        );

        const scale = currentDistance / startDistance;

        if (Math.abs(scale - 1) > this.config.pinchThreshold / 100) {
          this.emit('pinch', {
            type: 'pinch',
            position: {
              x: (touch1.clientX + touch2.clientX) / 2,
              y: (touch1.clientY + touch2.clientY) / 2,
            },
            scale,
          });
        }
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();

    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const now = Date.now();
    const duration = now - this.startTime;

    if (e.changedTouches.length === 1 && !this.isPanning) {
      const touch = e.changedTouches[0];
      const endPosition = { x: touch.clientX, y: touch.clientY };

      const distance = this.getDistance(
        this.startPosition.x,
        this.startPosition.y,
        endPosition.x,
        endPosition.y
      );

      // Tap or swipe?
      if (distance < this.config.tapMaxDistance) {
        // Check for double tap
        if (now - this.lastTapTime < this.config.doubleTapDelay) {
          this.emit('doubleTap', {
            type: 'doubleTap',
            position: endPosition,
          });
          this.lastTapTime = 0; // Reset to prevent triple tap
        } else {
          this.emit('tap', {
            type: 'tap',
            position: endPosition,
          });
          this.lastTapTime = now;
        }
      } else if (distance > this.config.swipeThreshold) {
        // Swipe
        const delta = {
          x: endPosition.x - this.startPosition.x,
          y: endPosition.y - this.startPosition.y,
        };

        const direction = this.getSwipeDirection(delta.x, delta.y);
        const velocity = distance / duration;

        this.emit('swipe', {
          type: 'swipe',
          position: endPosition,
          delta,
          direction,
          velocity,
        });
      }
    }

    // Remove ended touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      this.touches.delete(e.changedTouches[i].identifier);
    }

    this.isPanning = false;
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    this.touches.clear();
    this.isPanning = false;
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  private getSwipeDirection(deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private emit(type: GestureEvent['type'], event: GestureEvent): void {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }

  /**
   * Register gesture callback
   */
  on(type: GestureEvent['type'], callback: GestureCallback): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    this.callbacks.clear();
    this.touches.clear();
  }
}

/**
 * React hook for touch gestures
 */
import { useEffect, useRef } from 'react';

export function useTouchGestures(
  callbacks: Partial<Record<GestureEvent['type'], GestureCallback>>
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<TouchGestureManager | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const manager = new TouchGestureManager(elementRef.current);
    managerRef.current = manager;

    // Register callbacks
    const unsubscribers: (() => void)[] = [];
    Object.entries(callbacks).forEach(([type, callback]) => {
      if (callback) {
        const unsub = manager.on(type as GestureEvent['type'], callback);
        unsubscribers.push(unsub);
      }
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      manager.destroy();
    };
  }, [callbacks]);

  return elementRef;
}

/**
 * Mobile-optimized camera controls for Three.js
 */
export class TouchCameraControls {
  private camera: THREE.Camera;
  private element: HTMLElement;
  private gestureManager: TouchGestureManager;

  private position = { x: 0, y: 0, z: 10 };
  private rotation = { x: 0, y: 0 };
  private zoom = 1;

  private sensitivity = {
    pan: 0.01,
    rotate: 0.005,
    zoom: 0.01,
  };

  constructor(camera: THREE.Camera, element: HTMLElement) {
    this.camera = camera;
    this.element = element;
    this.gestureManager = new TouchGestureManager(element);

    this.initialize();
  }

  private initialize(): void {
    // Pan with one finger
    this.gestureManager.on('pan', (event) => {
      if (event.delta) {
        this.position.x -= event.delta.x * this.sensitivity.pan;
        this.position.y += event.delta.y * this.sensitivity.pan;
        this.updateCamera();
      }
    });

    // Rotate with two-finger pan
    // (In a real implementation, you'd detect two-finger pan differently)

    // Zoom with pinch
    this.gestureManager.on('pinch', (event) => {
      if (event.scale) {
        this.zoom *= event.scale;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom));
        this.updateCamera();
      }
    });

    // Double tap to reset
    this.gestureManager.on('doubleTap', () => {
      this.reset();
    });
  }

  private updateCamera(): void {
    this.camera.position.set(this.position.x, this.position.y, this.position.z * this.zoom);
    this.camera.lookAt(0, 0, 0);
  }

  private reset(): void {
    this.position = { x: 0, y: 0, z: 10 };
    this.zoom = 1;
    this.updateCamera();
  }

  destroy(): void {
    this.gestureManager.destroy();
  }
}
