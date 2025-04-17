/**
 * Plant Database
 * Contains data for all available plants in the garden planner
 */
const PlantsData = {
    // Vegetables
    tomato: {
        id: 'tomato',
        name: 'Tomato',
        category: 'vegetable',
        description: 'Popular garden vegetable with many varieties.',
        image: 'assets/plants/tomato.png',
        harvestTime: 70, // days from planting to harvest
        spacing: 45, // cm between plants
        height: 120, // cm
        width: 45, // cm
        sunlightNeeds: 'full', // full, partial, shade
        waterNeeds: 'medium', // low, medium, high
        soilPreference: 'rich', // sandy, clay, loamy, rich
        zoneRange: '3-11', // USDA zones
        companions: ['basil', 'onion', 'marigold', 'carrot', 'parsley'],
        antagonists: ['potato', 'corn', 'fennel'],
        seedingMonths: [3, 4, 5], // 1-based months (March, April, May)
        harvestMonths: [7, 8, 9, 10], // July through October
        maintenance: 'medium',
        difficulty: 'easy',
        annualYield: 3.5, // kg per plant average
        nutritionScore: 85,
        ecoScore: 70
    },
    
    cucumber: {
        id: 'cucumber',
        name: 'Cucumber',
        category: 'vegetable',
        description: 'Cool and crisp summer vegetable, perfect for salads.',
        image: 'assets/plants/cucumber.png',
        harvestTime: 55,
        spacing: 40,
        height: 30,
        width: 90, // vine spread
        sunlightNeeds: 'full',
        waterNeeds: 'high',
        soilPreference: 'rich',
        zoneRange: '4-11',
        companions: ['sunflower', 'corn', 'beans', 'peas', 'radish'],
        antagonists: ['potato', 'aromatic herbs'],
        seedingMonths: [4, 5, 6],
        harvestMonths: [7, 8, 9],
        maintenance: 'medium',
        difficulty: 'easy',
        annualYield: 2.5,
        nutritionScore: 65,
        ecoScore: 60
    },
    
    carrot: {
        id: 'carrot',
        name: 'Carrot',
        category: 'vegetable',
        description: 'Sweet root vegetable, perfect for many dishes.',
        image: 'assets/plants/carrot.png',
        harvestTime: 70,
        spacing: 5,
        height: 30,
        width: 5,
        sunlightNeeds: 'full',
        waterNeeds: 'medium',
        soilPreference: 'sandy',
        zoneRange: '3-10',
        companions: ['tomato', 'onion', 'rosemary', 'sage'],
        antagonists: ['dill'],
        seedingMonths: [3, 4, 5, 8, 9],
        harvestMonths: [5, 6, 7, 10, 11],
        maintenance: 'low',
        difficulty: 'moderate',
        annualYield: 1.2,
        nutritionScore: 90,
        ecoScore: 85
    },
    
    lettuce: {
        id: 'lettuce',
        name: 'Lettuce',
        category: 'vegetable',
        description: 'Fast-growing leafy green for salads and sandwiches.',
        image: 'assets/plants/lettuce.png',
        harvestTime: 30,
        spacing: 20,
        height: 25,
        width: 25,
        sunlightNeeds: 'partial',
        waterNeeds: 'medium',
        soilPreference: 'rich',
        zoneRange: '4-9',
        companions: ['carrot', 'radish', 'cucumber', 'strawberry'],
        antagonists: ['broccoli', 'cabbage'],
        seedingMonths: [3, 4, 5, 8, 9],
        harvestMonths: [4, 5, 6, 9, 10],
        maintenance: 'low',
        difficulty: 'easy',
        annualYield: 0.8,
        nutritionScore: 70,
        ecoScore: 90
    },
    
    // Herbs
    basil: {
        id: 'basil',
        name: 'Basil',
        category: 'herb',
        description: 'Aromatic herb essential for Italian cooking.',
        image: 'assets/plants/basil.png',
        harvestTime: 30,
        spacing: 25,
        height: 60,
        width: 30,
        sunlightNeeds: 'full',
        waterNeeds: 'medium',
        soilPreference: 'rich',
        zoneRange: '4-10',
        companions: ['tomato', 'pepper', 'oregano', 'parsley'],
        antagonists: ['rue'],
        seedingMonths: [4, 5, 6],
        harvestMonths: [6, 7, 8, 9],
        maintenance: 'low',
        difficulty: 'easy',
        annualYield: 0.5,
        nutritionScore: 60,
        ecoScore: 75
    },
    
    rosemary: {
        id: 'rosemary',
        name: 'Rosemary',
        category: 'herb',
        description: 'Aromatic perennial herb with needle-like leaves.',
        image: 'assets/plants/rosemary.png',
        harvestTime: 90,
        spacing: 60,
        height: 120,
        width: 60,
        sunlightNeeds: 'full',
        waterNeeds: 'low',
        soilPreference: 'sandy',
        zoneRange: '7-10',
        companions: ['sage', 'cabbage', 'carrot', 'beans'],
        antagonists: ['pumpkin'],
        seedingMonths: [3, 4, 5],
        harvestMonths: [6, 7, 8, 9, 10, 11],
        maintenance: 'low',
        difficulty: 'easy',
        annualYield: 0.3,
        nutritionScore: 50,
        ecoScore: 95
    },
    
    // Flowers
    marigold: {
        id: 'marigold',
        name: 'Marigold',
        category: 'flower',
        description: 'Bright flowers that help repel garden pests.',
        image: 'assets/plants/marigold.png',
        harvestTime: 50,
        spacing: 25,
        height: 30,
        width: 25,
        sunlightNeeds: 'full',
        waterNeeds: 'medium',
        soilPreference: 'any',
        zoneRange: '2-11',
        companions: ['tomato', 'pepper', 'cabbage', 'squash'],
        antagonists: ['bean'],
        seedingMonths: [4, 5, 6],
        harvestMonths: [6, 7, 8, 9, 10],
        maintenance: 'low',
        difficulty: 'easy',
        annualYield: 0,
        nutritionScore: 0,
        ecoScore: 80
    },
    
    sunflower: {
        id: 'sunflower',
        name: 'Sunflower',
        category: 'flower',
        description: 'Tall flowers with edible seeds, attracts pollinators.',
        image: 'assets/plants/sunflower.png',
        harvestTime: 80,
        spacing: 60,
        height: 250,
        width: 60,
        sunlightNeeds: 'full',
        waterNeeds: 'medium',
        soilPreference: 'rich',
        zoneRange: '4-9',
        companions: ['cucumber', 'corn', 'tomato'],
        antagonists: ['potato'],
        seedingMonths: [4, 5, 6],
        harvestMonths: [8, 9, 10],
        maintenance: 'low',
        difficulty: 'easy',
        annualYield: 0.1, // seed yield in kg
        nutritionScore: 65,
        ecoScore: 85
    },
    
    // Fruits
    strawberry: {
        id: 'strawberry',
        name: 'Strawberry',
        category: 'fruit',
        description: 'Sweet berries that grow well in gardens or containers.',
        image: 'assets/plants/strawberry.png',
        harvestTime: 90,
        spacing: 30,
        height: 20,
        width: 30,
        sunlightNeeds: 'full',
        waterNeeds: 'medium',
        soilPreference: 'rich',
        zoneRange: '3-10',
        companions: ['lettuce', 'spinach', 'onion', 'thyme'],
        antagonists: ['cabbage', 'broccoli'],
        seedingMonths: [3, 4],
        harvestMonths: [6, 7, 8],
        maintenance: 'medium',
        difficulty: 'moderate',
        annualYield: 0.5,
        nutritionScore: 80,
        ecoScore: 70
    },
    
    // Get all plants
    getAll() {
        const plants = [];
        for (const key in this) {
            if (typeof this[key] === 'object' && this[key].id) {
                plants.push(this[key]);
            }
        }
        return plants;
    },
    
    // Get plant by ID
    getById(id) {
        return this[id] || null;
    },
    
    // Get plants by category
    getByCategory(category) {
        return this.getAll().filter(plant => plant.category === category);
    },
    
    // Get plants by zone compatibility
    getByZone(zone) {
        return this.getAll().filter(plant => {
            const zoneRange = plant.zoneRange.split('-');
            const minZone = parseInt(zoneRange[0], 10);
            const maxZone = parseInt(zoneRange[1], 10);
            return zone >= minZone && zone <= maxZone;
        });
    },
    
    // Get plants suitable for a given month (1-12)
    getByPlantingMonth(month) {
        return this.getAll().filter(plant => {
            return plant.seedingMonths.includes(month);
        });
    },
    
    // Get plants that can be harvested in a given month (1-12)
    getByHarvestMonth(month) {
        return this.getAll().filter(plant => {
            return plant.harvestMonths.includes(month);
        });
    },
    
    // Get companion plants for a given plant ID
    getCompanions(plantId) {
        const plant = this.getById(plantId);
        if (!plant || !plant.companions) return [];
        
        return plant.companions.map(id => this.getById(id)).filter(p => p !== null);
    },
    
    // Get antagonistic plants for a given plant ID
    getAntagonists(plantId) {
        const plant = this.getById(plantId);
        if (!plant || !plant.antagonists) return [];
        
        return plant.antagonists.map(id => this.getById(id)).filter(p => p !== null);
    },
    
    // Search plants by name or description
    search(query) {
        const normalizedQuery = query.toLowerCase();
        return this.getAll().filter(plant => {
            return plant.name.toLowerCase().includes(normalizedQuery) ||
                   plant.description.toLowerCase().includes(normalizedQuery);
        });
    }
};

// Export the plants data
window.PlantsData = PlantsData;