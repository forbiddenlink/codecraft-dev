import playerReducer, {
  setPlayerPosition,
  setTargetPosition,
  updatePlayerPosition,
  setIsMoving,
} from '../slices/playerSlice';

describe('playerSlice', () => {
  const initialState = {
    position: { x: 0, y: 0.5, z: 0 },
    isMoving: false,
    targetPosition: null,
  };

  it('should return the initial state', () => {
    expect(playerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setPlayerPosition', () => {
    it('should set the player position', () => {
      const newPosition = { x: 5, y: 1, z: 3 };
      const actual = playerReducer(initialState, setPlayerPosition(newPosition));
      expect(actual.position).toEqual(newPosition);
    });
  });

  describe('setTargetPosition', () => {
    it('should set the target position', () => {
      const target = { x: 10, y: 0, z: 10 };
      const actual = playerReducer(initialState, setTargetPosition(target));
      expect(actual.targetPosition).toEqual(target);
    });

    it('should allow null target position', () => {
      const stateWithTarget = {
        ...initialState,
        targetPosition: { x: 5, y: 0, z: 5 },
      };
      const actual = playerReducer(stateWithTarget, setTargetPosition(null));
      expect(actual.targetPosition).toBeNull();
    });
  });

  describe('updatePlayerPosition', () => {
    it('should partially update position', () => {
      const actual = playerReducer(initialState, updatePlayerPosition({ x: 10 }));
      expect(actual.position).toEqual({ x: 10, y: 0.5, z: 0 });
    });

    it('should update multiple coordinates', () => {
      const actual = playerReducer(initialState, updatePlayerPosition({ x: 5, z: 5 }));
      expect(actual.position).toEqual({ x: 5, y: 0.5, z: 5 });
    });
  });

  describe('setIsMoving', () => {
    it('should set isMoving to true', () => {
      const actual = playerReducer(initialState, setIsMoving(true));
      expect(actual.isMoving).toBe(true);
    });

    it('should set isMoving to false', () => {
      const movingState = { ...initialState, isMoving: true };
      const actual = playerReducer(movingState, setIsMoving(false));
      expect(actual.isMoving).toBe(false);
    });
  });
});
