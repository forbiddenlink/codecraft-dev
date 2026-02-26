import React from 'react';

// Mock @react-three/drei Line component
jest.mock('@react-three/drei', () => ({
  Line: ({ points, color, lineWidth, dashed }: {
    points: [number, number, number][];
    color: string;
    lineWidth: number;
    dashed: boolean;
  }) => (
    <mesh data-testid="line" data-points={JSON.stringify(points)} data-color={color}>
      <bufferGeometry />
      <lineBasicMaterial />
    </mesh>
  ),
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useThree: () => ({ gl: {}, scene: {} }),
}));

import { render, screen } from '@testing-library/react';

// Import after mocks are set up
import BuildingGrid from '../BuildingGrid';

describe('BuildingGrid', () => {
  describe('visibility', () => {
    it('returns null when showGridLines is false', () => {
      const { container } = render(
        <BuildingGrid width={100} height={100} cellSize={10} showGridLines={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders lines when showGridLines is true', () => {
      render(
        <BuildingGrid width={100} height={100} cellSize={10} showGridLines={true} />
      );
      const lines = screen.getAllByTestId('line');
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('grid calculation', () => {
    it('renders correct number of grid lines', () => {
      // width=100, cellSize=10 → 11 vertical lines (-50 to 50 in steps of 10)
      // height=100, cellSize=10 → 11 horizontal lines
      // Total: 22 lines
      render(
        <BuildingGrid width={100} height={100} cellSize={10} showGridLines={true} />
      );
      const lines = screen.getAllByTestId('line');
      expect(lines.length).toBe(22);
    });

    it('renders fewer lines with larger cell size', () => {
      // width=100, cellSize=20 → 6 vertical lines (-50 to 50 in steps of 20)
      // height=100, cellSize=20 → 6 horizontal lines
      // Total: 12 lines
      render(
        <BuildingGrid width={100} height={100} cellSize={20} showGridLines={true} />
      );
      const lines = screen.getAllByTestId('line');
      expect(lines.length).toBe(12);
    });

    it('handles asymmetric dimensions', () => {
      // width=200, cellSize=50 → 5 vertical lines (-100 to 100 in steps of 50)
      // height=100, cellSize=50 → 3 horizontal lines (-50 to 50 in steps of 50)
      // Total: 8 lines
      render(
        <BuildingGrid width={200} height={100} cellSize={50} showGridLines={true} />
      );
      const lines = screen.getAllByTestId('line');
      expect(lines.length).toBe(8);
    });
  });

  describe('line properties', () => {
    it('uses correct color', () => {
      render(
        <BuildingGrid width={20} height={20} cellSize={10} showGridLines={true} />
      );
      const lines = screen.getAllByTestId('line');
      // Check first line has expected color attribute
      expect(lines[0]).toHaveAttribute('data-color', '#64748b');
    });

    it('creates lines at expected positions', () => {
      render(
        <BuildingGrid width={20} height={20} cellSize={10} showGridLines={true} />
      );
      const lines = screen.getAllByTestId('line');
      // Parse points from first line
      const firstLinePoints = JSON.parse(lines[0].getAttribute('data-points') || '[]');
      // First horizontal line should be at z = -10 (height/2 = 10, so starts at -10)
      expect(firstLinePoints).toEqual([
        [-10, 0.1, -10],
        [10, 0.1, -10]
      ]);
    });
  });
});
