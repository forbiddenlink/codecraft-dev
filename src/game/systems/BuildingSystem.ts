import { store } from '@/store/store';
import { v4 as uuidv4 } from 'uuid';
import { Vector3 } from 'three';
import { 
  placeBuilding, 
  demolishBuilding, 
  updateConstructionProgress,
  setBuildingStatus,
  updateBuildingPosition,
  updateBuildingRotation,
  connectBuildingToHtml
} from '@/store/slices/buildingSlice';
import { 
  addResources,
  consumeResources,
  addGenerator
} from '@/store/slices/resourceSlice';
import { buildingTemplates } from '@/data/buildingTemplates';
import { checkBuildingCollision } from '@/utils/buildingUtils';
import { GameStructureNode } from '@/utils/htmlParser';

export class BuildingSystem {
  /**
   * Place a new building in the world
   */
  placeBuilding(templateId: string, position: Vector3, rotation: number) {
    // 1. Get building template
    const template = buildingTemplates[templateId];
    if (!template) return null;
    
    // 2. Check for valid placement
    const existingBuildings = store.getState().building.placedBuildings;
    if (checkBuildingCollision(position, templateId, rotation, existingBuildings)) {
      return null;
    }
    
    // 3. Check resource requirements
    const resources = store.getState().resource.storage;
    const hasSufficientResources = template.costs.every(cost => {
      return resources[cost.resourceId] >= cost.amount;
    });
    
    if (!hasSufficientResources) {
      return null;
    }
    
    // 4. Consume resources
    template.costs.forEach(cost => {
      store.dispatch(consumeResources({
        type: cost.resourceId as any,
        amount: cost.amount
      }));
    });
    
    // 5. Create and place building
    const buildingId = uuidv4();
    store.dispatch(placeBuilding({
      templateId,
      position: { x: position.x, y: position.y, z: position.z },
      rotation,
      status: 'construction',
      constructionProgress: 0,
      health: 100,
      efficiency: 1,
      effects: template.effects || [],
      id: buildingId
    }));
    
    // 6. Start construction animation/process
    this.startConstruction(buildingId, template.constructionTime);
    
    return buildingId;
  }
  
  /**
   * Start construction process for a building
   */
  startConstruction(buildingId: string, time: number) {
    const interval = setInterval(() => {
      const building = store.getState().building.placedBuildings.find(b => b.id === buildingId);
      if (!building) {
        clearInterval(interval);
        return;
      }
      
      // Update construction progress
      const progress = building.constructionProgress + (1 / (time * 10));
      store.dispatch(updateConstructionProgress({
        buildingId,
        progress: Math.min(1, progress)
      }));
      
      // Complete construction when progress reaches 1
      if (progress >= 1) {
        clearInterval(interval);
        store.dispatch(setBuildingStatus({
          buildingId,
          status: 'active'
        }));
        
        // Set up resource generation
        this.setupResourceGeneration(buildingId);
      }
    }, 100);
  }
  
  /**
   * Set up resource generation for a building
   */
  setupResourceGeneration(buildingId: string) {
    const building = store.getState().building.placedBuildings.find(b => b.id === buildingId);
    if (!building) return;
    
    // Find resource production effects
    const resourceEffects = building.effects.filter(effect => 
      effect.type === 'resource' && effect.value > 0
    );
    
    // Add generator for each resource effect
    resourceEffects.forEach(effect => {
      store.dispatch(addGenerator({
        id: uuidv4(),
        type: building.templateId,
        position: [building.position.x, building.position.y, building.position.z],
        rotation: [0, building.rotation, 0],
        outputRate: effect.value,
        resourceType: effect.target as any,
        status: 'active',
        efficiency: building.efficiency,
        lastCollection: Date.now()
      }));
    });
  }
  
  /**
   * Demolish a building
   */
  demolishBuilding(buildingId: string) {
    const building = store.getState().building.placedBuildings.find(b => b.id === buildingId);
    if (!building) return;
    
    // Return some resources (partial refund)
    const template = buildingTemplates[building.templateId];
    if (template) {
      template.costs.forEach(cost => {
        // Return 50% of the original cost
        const refundAmount = Math.floor(cost.amount * 0.5);
        if (refundAmount > 0) {
          store.dispatch(addResources({
            type: cost.resourceId as any,
            amount: refundAmount
          }));
        }
      });
    }
    
    // Remove the building
    store.dispatch(demolishBuilding(buildingId));
  }
  
  /**
   * Connect a building to an HTML node
   */
  connectBuildingToHtml(buildingId: string, htmlNode: GameStructureNode) {
    if (!htmlNode) return;
    
    // Generate a reference for the node
    const nodeReference = this.generateNodeReference(htmlNode);
    
    // Get CSS selectors for this node
    const cssRef = this.generateCssSelector(htmlNode);
    
    // Connect in Redux
    store.dispatch(connectBuildingToHtml({
      buildingId,
      htmlNodeRef: nodeReference,
      cssRef
    }));
  }
  
  /**
   * Generate reference for an HTML node
   */
  private generateNodeReference(node: GameStructureNode): string {
    const idPart = node.attributes?.id ? `#${node.attributes.id}` : '';
    const classPart = node.classes.length > 0 ? `.${node.classes.join('.')}` : '';
    const linePart = node.lineNumber ? `:${node.lineNumber}` : '';
    
    return `${node.elementType}${idPart}${classPart}${linePart}`;
  }
  
  /**
   * Generate CSS selector for an HTML node
   */
  private generateCssSelector(node: GameStructureNode): string {
    if (node.attributes?.id) {
      return `#${node.attributes.id}`;
    }
    
    if (node.classes.length > 0) {
      return `.${node.classes.join('.')}`;
    }
    
    // Create a selector based on the node's position in the document
    let selector = node.elementType;
    
    // Add parent contexts if available
    if (node.parent) {
      if (node.parent.attributes?.id) {
        selector = `#${node.parent.attributes.id} > ${selector}`;
      } else if (node.parent.classes.length > 0) {
        selector = `.${node.parent.classes[0]} > ${selector}`;
      }
    }
    
    return selector;
  }
  
  /**
   * Move a building to a new position
   */
  moveBuilding(buildingId: string, position: Vector3) {
    store.dispatch(updateBuildingPosition({
      buildingId,
      position: { x: position.x, y: position.y, z: position.z }
    }));
  }
  
  /**
   * Rotate a building
   */
  rotateBuilding(buildingId: string, rotation: number) {
    store.dispatch(updateBuildingRotation({
      buildingId,
      rotation
    }));
  }
}

// Export singleton instance
export const buildingSystem = new BuildingSystem(); 