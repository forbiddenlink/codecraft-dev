'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { processTick } from '@/store/slices/resourceSlice';
import { motion } from 'framer-motion';

export default function ResourceHUD() {
  const dispatch = useAppDispatch();
  const resources = useAppSelector((state) => state.resources.resources);

  // Process resource generation every frame
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(processTick());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 min-w-[280px] z-50">
      {Object.values(resources).map((resource) => (
        <motion.div
          key={resource.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 bg-opacity-90 p-4 rounded-lg flex items-center gap-4 shadow-lg"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: resource.color + '33' }} // Add transparency to the color
          >
            {resource.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {resource.name}
              </span>
              <span className="text-sm text-white whitespace-nowrap ml-2">
                {Math.floor(resource.amount)}/{resource.capacity}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: resource.color,
                  width: `${(resource.amount / resource.capacity) * 100}%`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(resource.amount / resource.capacity) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {/* Generation rate */}
            <div className="text-xs text-gray-400 mt-1">
              +{resource.generationRate.toFixed(1)}/s
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 