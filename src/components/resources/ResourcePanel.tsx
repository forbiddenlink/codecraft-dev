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
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 flex items-center gap-2">
          <span>🏭</span>
          Resources
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-secondary text-body focus-ring"
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
              className="bg-elevated rounded-[var(--radius-md)] p-3 border border-[rgb(var(--border-subtle))] hover:border-accent/20 transition-colors"
            >
              {/* Icon & Name */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{resourceIcons[resource.type]}</span>
                <span className="text-body font-medium capitalize">
                  {resource.type}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-2">
                <p className="text-xl font-semibold text-text-primary">
                  {Math.round(resource.amount)}
                </p>
                <p className="text-small">/ {resource.capacity}</p>
              </div>

              {/* Progress Bar - Keep gradient for resource visualization */}
              <div className="relative h-2 bg-surface rounded-full overflow-hidden mb-2">
                <div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${resourceColors[resource.type]} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Net Rate */}
              <div className="flex items-center gap-1 text-small">
                {netRate > 0 ? (
                  <span className="text-success">+{netRate.toFixed(1)}/hr</span>
                ) : netRate < 0 ? (
                  <span className="text-error">{netRate.toFixed(1)}/hr</span>
                ) : (
                  <span className="text-text-muted">±0/hr</span>
                )}
                {!forecast?.isOptimal && <span className="text-warning">⚠️</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="mt-5 space-y-5">
          {/* Forecasts */}
          <div>
            <h4 className="text-h4 mb-3">📊 Forecasts</h4>
            <div className="space-y-2">
              {forecasts.map((forecast) => (
                <div
                  key={forecast.resource}
                  className="bg-elevated rounded-[var(--radius-md)] p-4 border border-[rgb(var(--border-subtle))]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-h4 capitalize flex items-center gap-2">
                      <span>{resourceIcons[forecast.resource]}</span>
                      {forecast.resource}
                    </span>
                    {!forecast.isOptimal && (
                      <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-[var(--radius-sm)] border border-warning/20 font-medium">
                        Needs Attention
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-small mb-1">1 Hour</p>
                      <p className="text-body font-semibold text-text-primary">
                        {Math.round(forecast.projected1Hour)}
                      </p>
                    </div>
                    <div>
                      <p className="text-small mb-1">6 Hours</p>
                      <p className="text-body font-semibold text-text-primary">
                        {Math.round(forecast.projected6Hours)}
                      </p>
                    </div>
                    <div>
                      <p className="text-small mb-1">24 Hours</p>
                      <p className="text-body font-semibold text-text-primary">
                        {Math.round(forecast.projected24Hours)}
                      </p>
                    </div>
                  </div>
                  {forecast.timeToEmpty && (
                    <p className="text-error text-small mt-3">
                      ⏱️ Depletes in {Math.round(forecast.timeToEmpty)} minutes
                    </p>
                  )}
                  {forecast.timeToFull && (
                    <p className="text-success text-small mt-3">
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
              <h4 className="text-h4 mb-3">💡 Suggestions</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-info/10 border border-info/20 rounded-[var(--radius-md)] p-3"
                  >
                    <p className="text-info text-body">{suggestion}</p>
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
