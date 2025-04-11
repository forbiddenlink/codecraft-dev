'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processTick } from '@/store/slices/resourceSlice';
import { motion } from 'framer-motion';

type ResourceType = 'energy' | 'minerals' | 'water' | 'food';

const RESOURCE_METADATA: Record<ResourceType, {
  name: string;
  color: string;
  icon: string;
}> = {
  energy: {
    name: 'Energy',
    color: '#FBBF24',
    icon: '⚡'
  },
  minerals: {
    name: 'Minerals',
    color: '#3B82F6',
    icon: '💎'
  },
  water: {
    name: 'Water',
    color: '#1E3A8A',
    icon: '💧'
  },
  food: {
    name: 'Food',
    color: '#10B981',
    icon: '🌾'
  }
};

export default function ResourceHUD() {
  const dispatch = useAppDispatch();
  const storage = useAppSelector(state => state.resource.storage) as Record<ResourceType, number>;
  const capacity = useAppSelector(state => state.resource.capacity) as Record<ResourceType, number>;
  const productionRates = useAppSelector(state => state.resource.productionRates) as Record<ResourceType, number>;

  // Process resource generation every frame
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(processTick(1)); // 1 second delta time
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="fixed top-4 right-4 flex gap-4">
      {(Object.entries(storage) as [ResourceType, number][]).map(([resourceType, amount], index) => (
        <motion.div
          key={resourceType}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="w-16 h-16 relative group"
        >
          <div 
            className="w-full h-full rounded-lg flex items-center justify-center text-2xl"
            style={{ 
              backgroundColor: `${RESOURCE_METADATA[resourceType].color}33`,
              boxShadow: `0 0 20px ${RESOURCE_METADATA[resourceType].color}33`
            }}
          >
            {RESOURCE_METADATA[resourceType].icon}
          </div>
          
          {/* Resource amount indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#0A0E17] px-2 py-0.5 rounded text-xs font-bold text-[#F8FAFC]">
            {Math.floor(amount)}
          </div>

          {/* Hover tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[#0A0E17] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <div className="text-[#F8FAFC] text-xs">
              {RESOURCE_METADATA[resourceType].name}
              <br />
              {Math.floor(amount)}/{capacity[resourceType]}
              <br />
              <span className={productionRates[resourceType] > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                {productionRates[resourceType] > 0 ? '+' : ''}{productionRates[resourceType].toFixed(1)}/s
              </span>
            </div>
          </div>

          {/* Production rate indicator */}
          {productionRates[resourceType] !== 0 && (
            <motion.div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                productionRates[resourceType] > 0 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
} 