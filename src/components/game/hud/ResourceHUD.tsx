'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processTick } from '@/store/slices/resourceSlice';
import { motion } from 'framer-motion';

const RESOURCE_METADATA = {
  energy: {
    name: 'Energy',
    color: '#FFD700',
    icon: '⚡'
  },
  minerals: {
    name: 'Minerals',
    color: '#A0522D',
    icon: '💎'
  },
  water: {
    name: 'Water',
    color: '#4169E1',
    icon: '💧'
  },
  food: {
    name: 'Food',
    color: '#32CD32',
    icon: '🌾'
  }
};

export default function ResourceHUD() {
  const dispatch = useAppDispatch();
  const storage = useAppSelector((state) => state.resource.storage);
  const capacity = useAppSelector((state) => state.resource.capacity);
  const productionRates = useAppSelector((state) => state.resource.productionRates);

  // Process resource generation every frame
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(processTick(1)); // 1 second delta time
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 min-w-[280px] z-50">
      {Object.entries(storage).map(([resourceType, amount]) => (
        <motion.div
          key={resourceType}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 bg-opacity-90 p-4 rounded-lg flex items-center gap-4 shadow-lg"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: RESOURCE_METADATA[resourceType].color + '33' }}
          >
            {RESOURCE_METADATA[resourceType].icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {RESOURCE_METADATA[resourceType].name}
              </span>
              <span className="text-sm text-white whitespace-nowrap ml-2">
                {Math.floor(amount)}/{capacity[resourceType]}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: RESOURCE_METADATA[resourceType].color,
                  width: `${(amount / capacity[resourceType]) * 100}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(amount / capacity[resourceType]) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {/* Production rate */}
            <div className="text-xs text-gray-400 mt-1">
              +{productionRates[resourceType].toFixed(1)}/s
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 