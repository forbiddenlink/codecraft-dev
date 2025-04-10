import { BuildingTemplate } from '@/types/buildings';

export const buildingTemplates: Record<string, BuildingTemplate> = {
  // Basic Habitat - First building players create
  basicHabitat: {
    id: 'basicHabitat',
    name: 'Basic Habitat',
    category: 'habitat',
    description: 'A simple habitat module for your first colonists.',
    htmlTemplate: 
`<header>
  <h1>Habitat Module</h1>
</header>
<main>
  <section class="living-area">
    <h2>Living Area</h2>
    <div class="room"></div>
  </section>
</main>`,
    cssTemplate:
`.living-area {
  background-color: #2c3e50;
  padding: 20px;
  border-radius: 8px;
}

.room {
  height: 100px;
  background-color: #34495e;
  border: 2px solid #3498db;
}`,
    model: 'models/buildings/habitat-basic.glb', // We'll need to create these 3D models
    icon: '🏠',
    costs: [
      { resourceId: 'energy', amount: 50 },
      { resourceId: 'code', amount: 25 },
    ],
    buildTime: 30,
    effects: [
      { type: 'capacity', target: 'population', value: 5 },
      { type: 'resource', target: 'energy', value: -1 }, // Consumes energy
    ],
    requiredLevel: 1,
    gridSize: { width: 2, height: 2 },
    previewScale: 1,
  },

  // Resource Generator - Basic energy production
  energyGenerator: {
    id: 'energyGenerator',
    name: 'Energy Generator',
    category: 'production',
    description: 'Generates energy for your colony using solar panels.',
    htmlTemplate:
`<section class="generator">
  <div class="solar-panel"></div>
  <div class="status">
    <h2>Energy Output</h2>
    <div class="output-meter"></div>
  </div>
</section>`,
    cssTemplate:
`.generator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.solar-panel {
  width: 100px;
  height: 60px;
  background: linear-gradient(45deg, #2980b9, #3498db);
  border: 2px solid #2c3e50;
  transform: rotate(30deg);
}

.output-meter {
  width: 80px;
  height: 20px;
  background: linear-gradient(to right, #27ae60, #2ecc71);
  border-radius: 10px;
}`,
    model: 'models/buildings/generator-basic.glb',
    icon: '⚡',
    costs: [
      { resourceId: 'code', amount: 30 },
      { resourceId: 'data', amount: 15 },
    ],
    buildTime: 20,
    effects: [
      { type: 'resource', target: 'energy', value: 2 }, // Generates energy
    ],
    requiredLevel: 1,
    gridSize: { width: 1, height: 1 },
    previewScale: 0.8,
  },

  // Code Repository - Increases code fragment generation
  codeRepository: {
    id: 'codeRepository',
    name: 'Code Repository',
    category: 'storage',
    description: 'Stores and organizes code fragments, increasing collection efficiency.',
    htmlTemplate:
`<div class="repository">
  <header>
    <h2>Code Repository</h2>
    <div class="status-indicator"></div>
  </header>
  <main class="storage">
    <div class="fragment"></div>
    <div class="fragment"></div>
    <div class="fragment"></div>
  </main>
</div>`,
    cssTemplate:
`.repository {
  background-color: #2c3e50;
  padding: 15px;
  border-radius: 8px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  background-color: #2ecc71;
  border-radius: 50%;
  margin-left: 10px;
}

.storage {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.fragment {
  height: 40px;
  background-color: #34495e;
  border: 1px solid #3498db;
  border-radius: 4px;
}`,
    model: 'models/buildings/repository-basic.glb',
    icon: '📚',
    costs: [
      { resourceId: 'energy', amount: 40 },
      { resourceId: 'code', amount: 20 },
      { resourceId: 'data', amount: 10 },
    ],
    buildTime: 25,
    effects: [
      { type: 'efficiency', target: 'code', value: 1.5 }, // 50% more efficient code collection
      { type: 'capacity', target: 'code', value: 100 }, // Increased code storage
    ],
    requiredLevel: 2,
    gridSize: { width: 2, height: 1 },
    previewScale: 0.9,
  },
}; 