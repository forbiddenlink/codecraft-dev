/**
 * Resource Panel
 * Displays resource status and production rates
 */

import React, { useState, useEffect } from 'react';
import { getResourceManager } from '@/utils/resourceManagement';
import type { Resource, ResourceForecast } from '@/utils/resourceManagement';

const resourceIcons: Record<string, string> = {
  energy: '⚡',
  minerals: '💎',
  water: '💧',
  food: '🍎',
  knowledge: '📚',
  bytes: '💾',
};

const resourceColors: Record<string, string> = {
  energy: 'from-yellow-500 to-orange-500',
  minerals: 'from-purple-500 to-pink-500',
  water: 'from-blue-500 to-cyan-500',
  food: 'from-green-500 to-emerald-500',
  knowledge: 'from-indigo-500 to-violet-500',
  bytes: 'from-gray-500 to-slate-500',
};

export function ResourcePanel() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [forecasts, setForecasts] = useState<ResourceForecast[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const resourceManager = getResourceManager();

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateData = () => {
    setResources(resourceManager.getAllResources());
    setForecasts(resourceManager.getAllForecasts());
    setSuggestions(resourceManager.getOptimizationSuggestions());
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span>🏭</span>
          Resources
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {resources.map((resource) => {
          const forecast = forecasts.find((f) => f.resource === resource.type);
          const percentage = (resource.amount / resource.capacity) * 100;
          const netRate = resource.productionRate - resource.consumptionRate;

          return (
            <div
              key={resource.type}
              className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              {/* Icon & Name */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{resourceIcons[resource.type]}</span>
                <span className="text-white text-sm font-medium capitalize">
                  {resource.type}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-2">
                <p className="text-2xl font-bold text-white">
                  {Math.round(resource.amount)}
                </p>
                <p className="text-gray-400 text-xs">/ {resource.capacity}</p>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
                <div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${resourceColors[resource.type]} transition-all duration-500`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Net Rate */}
              <div className="flex items-center gap-1 text-xs">
                {netRate > 0 ? (
                  <span className="text-green-400">+{netRate.toFixed(1)}/hr</span>
                ) : netRate < 0 ? (
                  <span className="text-red-400">{netRate.toFixed(1)}/hr</span>
                ) : (
                  <span className="text-gray-400">±0/hr</span>
                )}
                {!forecast?.isOptimal && <span className="text-orange-400">⚠️</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Forecasts */}
          <div>
            <h4 className="text-white font-medium mb-2">📊 Forecasts</h4>
            <div className="space-y-2">
              {forecasts.map((forecast) => (
                <div
                  key={forecast.resource}
                  className="bg-gray-700/30 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium capitalize flex items-center gap-2">
                      <span>{resourceIcons[forecast.resource]}</span>
                      {forecast.resource}
                    </span>
                    {!forecast.isOptimal && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                        Needs Attention
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">1 Hour</p>
                      <p className="text-white font-bold">
                        {Math.round(forecast.projected1Hour)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">6 Hours</p>
                      <p className="text-white font-bold">
                        {Math.round(forecast.projected6Hours)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">24 Hours</p>
                      <p className="text-white font-bold">
                        {Math.round(forecast.projected24Hours)}
                      </p>
                    </div>
                  </div>
                  {forecast.timeToEmpty && (
                    <p className="text-red-400 text-xs mt-2">
                      ⏱️ Depletes in {Math.round(forecast.timeToEmpty)} minutes
                    </p>
                  )}
                  {forecast.timeToFull && (
                    <p className="text-green-400 text-xs mt-2">
                      ⏱️ Full in {Math.round(forecast.timeToFull)} minutes
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2">💡 Suggestions</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
                  >
                    <p className="text-blue-400 text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
