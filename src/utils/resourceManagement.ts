/**
 * Advanced Resource Management System
 * Production chains, optimization, and colony economics
 */

export type ResourceType = 'energy' | 'minerals' | 'water' | 'food' | 'knowledge' | 'bytes';

export interface Resource {
  type: ResourceType;
  amount: number;
  capacity: number;
  productionRate: number; // Per hour
  consumptionRate: number; // Per hour
}

export interface ResourceProducer {
  id: string;
  buildingType: string;
  level: number;
  produces: {
    resource: ResourceType;
    rate: number; // Per hour
  }[];
  consumes: {
    resource: ResourceType;
    rate: number; // Per hour
  }[];
  efficiency: number; // 0-100%
  isActive: boolean;
  upgradeCost?: {
    resources: Partial<Record<ResourceType, number>>;
    xp: number;
  };
}

export interface ProductionChain {
  id: string;
  name: string;
  description: string;
  buildings: string[]; // Building IDs in order
  inputResources: ResourceType[];
  outputResources: ResourceType[];
  efficiency: number;
}

export interface ResourceForecast {
  resource: ResourceType;
  current: number;
  projected1Hour: number;
  projected6Hours: number;
  projected24Hours: number;
  timeToFull: number | null; // Minutes, null if decreasing
  timeToEmpty: number | null; // Minutes, null if increasing
  isOptimal: boolean;
}

export interface TradeDeal {
  id: string;
  give: Partial<Record<ResourceType, number>>;
  receive: Partial<Record<ResourceType, number>>;
  available: boolean;
  cooldown?: number; // Minutes
  lastTraded?: Date;
}

class ResourceManagementSystem {
  private resources: Map<ResourceType, Resource> = new Map();
  private producers: Map<string, ResourceProducer> = new Map();
  private productionChains: Map<string, ProductionChain> = new Map();
  private tradeDeal: Map<string, TradeDeal> = new Map();
  private lastUpdateTime: number = Date.now();
  private storageKey = 'codecraft_resources';

  constructor() {
    this.initializeResources();
    this.loadState();
    this.startProductionLoop();
  }

  /**
   * Initialize default resources
   */
  private initializeResources(): void {
    const defaultResources: ResourceType[] = [
      'energy',
      'minerals',
      'water',
      'food',
      'knowledge',
      'bytes',
    ];

    defaultResources.forEach((type) => {
      this.resources.set(type, {
        type,
        amount: 100,
        capacity: 1000,
        productionRate: 10,
        consumptionRate: 5,
      });
    });
  }

  /**
   * Add or update a resource producer (building)
   */
  addProducer(producer: ResourceProducer): void {
    this.producers.set(producer.id, producer);
    this.recalculateProductionRates();
    this.saveState();
  }

  /**
   * Remove a producer
   */
  removeProducer(producerId: string): void {
    this.producers.delete(producerId);
    this.recalculateProductionRates();
    this.saveState();
  }

  /**
   * Upgrade a producer
   */
  upgradeProducer(producerId: string): boolean {
    const producer = this.producers.get(producerId);
    if (!producer || !producer.upgradeCost) return false;

    // Check if we have enough resources
    for (const [resource, cost] of Object.entries(producer.upgradeCost.resources)) {
      const current = this.resources.get(resource as ResourceType);
      if (!current || current.amount < cost) {
        return false; // Not enough resources
      }
    }

    // Deduct costs
    for (const [resource, cost] of Object.entries(producer.upgradeCost.resources)) {
      this.modifyResource(resource as ResourceType, -cost);
    }

    // Upgrade
    producer.level += 1;
    producer.efficiency = Math.min(100, producer.efficiency + 5);

    // Increase production by 25%
    producer.produces.forEach((p) => {
      p.rate *= 1.25;
    });

    this.recalculateProductionRates();
    this.saveState();
    return true;
  }

  /**
   * Toggle producer active state
   */
  toggleProducer(producerId: string): void {
    const producer = this.producers.get(producerId);
    if (!producer) return;

    producer.isActive = !producer.isActive;
    this.recalculateProductionRates();
    this.saveState();
  }

  /**
   * Recalculate production and consumption rates
   */
  private recalculateProductionRates(): void {
    // Reset rates
    this.resources.forEach((resource) => {
      resource.productionRate = 0;
      resource.consumptionRate = 0;
    });

    // Calculate from active producers
    this.producers.forEach((producer) => {
      if (!producer.isActive) return;

      const efficiencyMultiplier = producer.efficiency / 100;

      producer.produces.forEach(({ resource, rate }) => {
        const res = this.resources.get(resource);
        if (res) {
          res.productionRate += rate * efficiencyMultiplier;
        }
      });

      producer.consumes.forEach(({ resource, rate }) => {
        const res = this.resources.get(resource);
        if (res) {
          res.consumptionRate += rate * efficiencyMultiplier;
        }
      });
    });
  }

  /**
   * Get current resource amount
   */
  getResource(type: ResourceType): Resource | null {
    return this.resources.get(type) || null;
  }

  /**
   * Get all resources
   */
  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Modify resource amount
   */
  modifyResource(type: ResourceType, amount: number): boolean {
    const resource = this.resources.get(type);
    if (!resource) return false;

    const newAmount = resource.amount + amount;

    // Check constraints
    if (newAmount < 0) return false; // Not enough
    if (newAmount > resource.capacity) {
      resource.amount = resource.capacity; // Cap at max
      return true;
    }

    resource.amount = newAmount;
    this.saveState();
    return true;
  }

  /**
   * Set resource capacity
   */
  setCapacity(type: ResourceType, capacity: number): void {
    const resource = this.resources.get(type);
    if (resource) {
      resource.capacity = capacity;
      this.saveState();
    }
  }

  /**
   * Production loop - updates resources based on rates
   */
  private startProductionLoop(): void {
    setInterval(() => {
      this.updateProduction();
    }, 60000); // Update every minute
  }

  /**
   * Update production for time elapsed
   */
  private updateProduction(): void {
    const now = Date.now();
    const minutesElapsed = (now - this.lastUpdateTime) / 60000;
    const hoursElapsed = minutesElapsed / 60;

    this.resources.forEach((resource) => {
      const netRate = resource.productionRate - resource.consumptionRate;
      const change = netRate * hoursElapsed;

      this.modifyResource(resource.type, change);
    });

    this.lastUpdateTime = now;
    this.saveState();
  }

  /**
   * Get resource forecast
   */
  getForecast(type: ResourceType): ResourceForecast | null {
    const resource = this.resources.get(type);
    if (!resource) return null;

    const netRate = resource.productionRate - resource.consumptionRate;

    const forecast: ResourceForecast = {
      resource: type,
      current: resource.amount,
      projected1Hour: Math.max(0, Math.min(resource.capacity, resource.amount + netRate * 1)),
      projected6Hours: Math.max(0, Math.min(resource.capacity, resource.amount + netRate * 6)),
      projected24Hours: Math.max(0, Math.min(resource.capacity, resource.amount + netRate * 24)),
      timeToFull: null,
      timeToEmpty: null,
      isOptimal: true,
    };

    if (netRate > 0) {
      // Filling up
      const remaining = resource.capacity - resource.amount;
      forecast.timeToFull = (remaining / netRate) * 60; // Convert to minutes
    } else if (netRate < 0) {
      // Depleting
      forecast.timeToEmpty = (resource.amount / Math.abs(netRate)) * 60; // Convert to minutes
      forecast.isOptimal = false;
    }

    // Check if optimal (not wasting or depleting too fast)
    if (forecast.projected1Hour <= 0 || forecast.projected1Hour >= resource.capacity) {
      forecast.isOptimal = false;
    }

    return forecast;
  }

  /**
   * Get all forecasts
   */
  getAllForecasts(): ResourceForecast[] {
    return Array.from(this.resources.keys())
      .map((type) => this.getForecast(type))
      .filter((f): f is ResourceForecast => f !== null);
  }

  /**
   * Register a production chain
   */
  registerProductionChain(chain: ProductionChain): void {
    this.productionChains.set(chain.id, chain);
  }

  /**
   * Get production chain efficiency
   */
  getChainEfficiency(chainId: string): number {
    const chain = this.productionChains.get(chainId);
    if (!chain) return 0;

    const buildings = chain.buildings
      .map((id) => this.producers.get(id))
      .filter((b): b is ResourceProducer => b !== undefined);

    if (buildings.length === 0) return 0;

    // Average efficiency of all buildings in chain
    const totalEfficiency = buildings.reduce(
      (sum, b) => sum + (b.isActive ? b.efficiency : 0),
      0
    );

    return totalEfficiency / buildings.length;
  }

  /**
   * Register a trade deal
   */
  registerTrade(deal: TradeDeal): void {
    this.tradeDeal.set(deal.id, deal);
  }

  /**
   * Execute a trade
   */
  executeTrade(dealId: string): boolean {
    const deal = this.tradeDeal.get(dealId);
    if (!deal || !deal.available) return false;

    // Check cooldown
    if (deal.cooldown && deal.lastTraded) {
      const minutesSinceTrade = (Date.now() - deal.lastTraded.getTime()) / 60000;
      if (minutesSinceTrade < deal.cooldown) {
        return false; // Still on cooldown
      }
    }

    // Check if we have enough resources to give
    for (const [resource, amount] of Object.entries(deal.give)) {
      const current = this.resources.get(resource as ResourceType);
      if (!current || current.amount < amount) {
        return false;
      }
    }

    // Execute trade
    for (const [resource, amount] of Object.entries(deal.give)) {
      this.modifyResource(resource as ResourceType, -amount);
    }

    for (const [resource, amount] of Object.entries(deal.receive)) {
      this.modifyResource(resource as ResourceType, amount);
    }

    deal.lastTraded = new Date();
    this.saveState();
    return true;
  }

  /**
   * Get available trades
   */
  getAvailableTrades(): TradeDeal[] {
    return Array.from(this.tradeDeal.values()).filter((deal) => {
      if (!deal.available) return false;

      if (deal.cooldown && deal.lastTraded) {
        const minutesSinceTrade = (Date.now() - deal.lastTraded.getTime()) / 60000;
        if (minutesSinceTrade < deal.cooldown) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    // Check each resource
    this.resources.forEach((resource) => {
      const forecast = this.getForecast(resource.type);
      if (!forecast) return;

      if (forecast.timeToEmpty && forecast.timeToEmpty < 60) {
        suggestions.push(
          `⚠️ ${resource.type} will run out in ${Math.round(forecast.timeToEmpty)} minutes! Increase production or reduce consumption.`
        );
      }

      if (forecast.projected1Hour >= resource.capacity * 0.9) {
        suggestions.push(
          `📦 ${resource.type} storage almost full. Consider upgrading capacity or reducing production.`
        );
      }

      const netRate = resource.productionRate - resource.consumptionRate;
      if (Math.abs(netRate) < 1) {
        suggestions.push(
          `⚖️ ${resource.type} production is balanced. Good job!`
        );
      }
    });

    // Check producer efficiency
    this.producers.forEach((producer) => {
      if (producer.isActive && producer.efficiency < 50) {
        suggestions.push(
          `🔧 ${producer.buildingType} efficiency is low (${producer.efficiency}%). Consider upgrading.`
        );
      }
    });

    return suggestions;
  }

  /**
   * Save state
   */
  private saveState(): void {
    if (typeof window === 'undefined') return;

    try {
      const state = {
        resources: Array.from(this.resources.entries()),
        producers: Array.from(this.producers.entries()),
        lastUpdateTime: this.lastUpdateTime,
        trades: Array.from(this.tradeDeal.entries()).map(([id, deal]) => [
          id,
          {
            ...deal,
            lastTraded: deal.lastTraded?.toISOString(),
          },
        ]),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save resource state:', error);
    }
  }

  /**
   * Load state
   */
  private loadState(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const state = JSON.parse(stored);

      this.resources = new Map(state.resources);
      this.producers = new Map(state.producers);
      this.lastUpdateTime = state.lastUpdateTime || Date.now();

      if (state.trades) {
        this.tradeDeal = new Map(
          state.trades.map(([id, deal]: [string, any]) => [
            id,
            {
              ...deal,
              lastTraded: deal.lastTraded ? new Date(deal.lastTraded) : undefined,
            },
          ])
        );
      }

      this.recalculateProductionRates();
    } catch (error) {
      console.error('Failed to load resource state:', error);
    }
  }
}

// Singleton instance
let resourceInstance: ResourceManagementSystem | null = null;

export function getResourceManager(): ResourceManagementSystem {
  if (!resourceInstance) {
    resourceInstance = new ResourceManagementSystem();
  }
  return resourceInstance;
}

// Convenience exports
export const getResource = (type: ResourceType) => getResourceManager().getResource(type);
export const modifyResource = (type: ResourceType, amount: number) =>
  getResourceManager().modifyResource(type, amount);
export const getResourceForecast = (type: ResourceType) =>
  getResourceManager().getForecast(type);
export const getAllResourceForecasts = () => getResourceManager().getAllForecasts();
export const getOptimizationSuggestions = () =>
  getResourceManager().getOptimizationSuggestions();
