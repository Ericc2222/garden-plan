/**
 * Garden Model
 * Manages the garden layout, plants, and related calculations
 */
class Garden {
    constructor(data = {}) {
        this.name = data.name || 'My Garden';
        this.width = data.width || 10;
        this.height = data.height || 10;
        this.cellSize = data.cellSize || 30; // in cm
        this.cells = data.cells || this.createEmptyCells();
        this.zones = data.zones || [];
        this.created = data.created || new Date().toISOString();
        this.lastModified = data.lastModified || new Date().toISOString();
        this.plantCount = data.plantCount || 0;
        this.stats = data.stats || {
            plantCount: 0,
            varietyCount: 0,
            maintenanceHours: 0,
            waterNeeds: 'low',
            harvestWeight: 0,
            ecoScore: 0
        };
    }
    
    /**
     * Create an empty grid of cells
     * @returns {Array} 2D array of empty cells
     */
    createEmptyCells() {
        const cells = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push({
                    x,
                    y,
                    plant: null,
                    soil: 'regular',
                    moisture: 'normal',
                    sunlight: 'full',
                    zoneId: null
                });
            }
            cells.push(row);
        }
        return cells;
    }
    
    /**
     * Resize the garden grid
     * @param {number} newWidth - New width in cells
     * @param {number} newHeight - New height in cells
     */
    resize(newWidth, newHeight) {
        if (newWidth === this.width && newHeight === this.height) {
            return;
        }
        
        const newCells = [];
        for (let y = 0; y < newHeight; y++) {
            const row = [];
            for (let x = 0; x < newWidth; x++) {
                if (y < this.height && x < this.width) {
                    // Copy existing cell
                    row.push(this.cells[y][x]);
                } else {
                    // Create new empty cell
                    row.push({
                        x,
                        y,
                        plant: null,
                        soil: 'regular',
                        moisture: 'normal',
                        sunlight: 'full',
                        zoneId: null
                    });
                }
            }
            newCells.push(row);
        }
        
        this.width = newWidth;
        this.height = newHeight;
        this.cells = newCells;
        this.lastModified = new Date().toISOString();
    }
    
    /**
     * Add a plant to a specific cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} plant - Plant data
     * @returns {boolean} Success status
     */
    addPlant(x, y, plant) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            console.error('Cell coordinates out of bounds');
            return false;
        }
        
        if (!plant || !plant.id) {
            console.error('Invalid plant data');
            return false;
        }
        
        // Check if this plant is compatible with neighboring plants
        if (!this.checkPlantCompatibility(x, y, plant)) {
            console.warn('Plant incompatible with neighbors');
            return false;
        }
        
        // Check if growing conditions are suitable
        if (!this.checkGrowingConditions(x, y, plant)) {
            console.warn('Growing conditions not suitable for this plant');
            return false;
        }
        
        this.cells[y][x].plant = {
            id: plant.id,
            name: plant.name,
            addedDate: new Date().toISOString(),
            health: 100
        };
        
        this.plantCount++;
        this.lastModified = new Date().toISOString();
        this.updateStats();
        return true;
    }
    
    /**
     * Remove a plant from a cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Success status
     */
    removePlant(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        if (this.cells[y][x].plant) {
            this.cells[y][x].plant = null;
            this.plantCount--;
            this.lastModified = new Date().toISOString();
            this.updateStats();
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a plant is compatible with neighboring plants
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} plant - Plant to check
     * @returns {boolean} Whether the plant is compatible
     */
    checkPlantCompatibility(x, y, plant) {
        // This would use a more sophisticated plant compatibility database
        // Simplified version for demonstration
        const neighbors = this.getNeighboringPlants(x, y);
        
        if (plant.antagonists && plant.antagonists.length > 0) {
            for (const neighbor of neighbors) {
                if (plant.antagonists.includes(neighbor.id)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Get plants in neighboring cells
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Array} Array of neighboring plants
     */
    getNeighboringPlants(x, y) {
        const neighbors = [];
        
        // Check the 8 surrounding cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue; // Skip the center cell
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const cell = this.cells[ny][nx];
                    if (cell.plant) {
                        neighbors.push(cell.plant);
                    }
                }
            }
        }
        
        return neighbors;
    }
    
    /**
     * Check if growing conditions are suitable for a plant
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} plant - Plant to check
     * @returns {boolean} Whether conditions are suitable
     */
    checkGrowingConditions(x, y, plant) {
        // This would use more sophisticated logic based on plant requirements
        // Simplified version for demonstration
        const cell = this.cells[y][x];
        
        // Check soil compatibility
        if (plant.soilPreference && plant.soilPreference !== 'any' && plant.soilPreference !== cell.soil) {
            return false;
        }
        
        // Check sunlight requirements
        if (plant.sunlightNeeds && plant.sunlightNeeds !== 'any') {
            if (plant.sunlightNeeds === 'full' && cell.sunlight !== 'full') {
                return false;
            }
            if (plant.sunlightNeeds === 'partial' && cell.sunlight === 'shade') {
                return false;
            }
            if (plant.sunlightNeeds === 'shade' && cell.sunlight === 'full') {
                return false;
            }
        }
        
        // Check moisture compatibility
        if (plant.moistureNeeds && plant.moistureNeeds !== 'any' && plant.moistureNeeds !== cell.moisture) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Update cell properties
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} properties - Properties to update
     * @returns {boolean} Success status
     */
    updateCell(x, y, properties) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        const cell = this.cells[y][x];
        
        // Update provided properties
        if (properties.soil) cell.soil = properties.soil;
        if (properties.moisture) cell.moisture = properties.moisture;
        if (properties.sunlight) cell.sunlight = properties.sunlight;
        if (properties.zoneId !== undefined) cell.zoneId = properties.zoneId;
        
        this.lastModified = new Date().toISOString();
        
        // If cell has a plant, check if conditions are still suitable
        if (cell.plant) {
            // In a real app, we'd fetch plant data and check compatibility
            // For demo purposes, we'll just note this in the console
            console.log('Cell conditions changed, plant compatibility should be rechecked');
        }
        
        return true;
    }
    
    /**
     * Create a new garden zone
     * @param {string} name - Zone name
     * @param {string} color - Zone color
     * @returns {string} Zone ID
     */
    createZone(name, color) {
        const zoneId = 'zone_' + Date.now();
        this.zones.push({
            id: zoneId,
            name: name || 'New Zone',
            color: color || '#CCCCCC',
            created: new Date().toISOString()
        });
        
        this.lastModified = new Date().toISOString();
        return zoneId;
    }
    
    /**
     * Apply zone to multiple cells
     * @param {string} zoneId - Zone ID
     * @param {Array} cells - Array of {x, y} coordinates
     */
    applyZoneToCells(zoneId, cells) {
        if (!this.zones.find(z => z.id === zoneId)) {
            console.error('Zone does not exist');
            return false;
        }
        
        for (const {x, y} of cells) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.cells[y][x].zoneId = zoneId;
            }
        }
        
        this.lastModified = new Date().toISOString();
        return true;
    }
    
    /**
     * Update garden statistics
     */
    updateStats() {
        // Count plants and varieties
        const plantTypes = new Set();
        let totalPlants = 0;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];
                if (cell.plant) {
                    totalPlants++;
                    plantTypes.add(cell.plant.id);
                }
            }
        }
        
        // Calculate maintenance hours (simplified estimate)
        const maintenancePerPlant = 0.1; // hours per week
        const maintenanceHours = totalPlants * maintenancePerPlant * 52; // annual hours
        
        // Calculate water needs (simplified)
        let waterScore = 0;
        if (totalPlants > 0) {
            // Would use actual plant water requirements in a real app
            waterScore = totalPlants / (this.width * this.height);
        }
        
        let waterNeeds = 'low';
        if (waterScore > 0.6) waterNeeds = 'high';
        else if (waterScore > 0.3) waterNeeds = 'medium';
        
        // Calculate harvest (simplified estimate)
        const avgYieldPerPlant = 2; // kg per season
        const harvestWeight = totalPlants * avgYieldPerPlant;
        
        // Calculate eco score (simplified)
        // Would consider plant diversity, native species, water conservation, etc.
        const diversityFactor = plantTypes.size / Math.max(1, totalPlants);
        const ecoScore = Math.round((diversityFactor * 50) + (50 - waterScore * 50));
        
        this.stats = {
            plantCount: totalPlants,
            varietyCount: plantTypes.size,
            maintenanceHours: Math.round(maintenanceHours * 10) / 10,
            waterNeeds,
            harvestWeight: Math.round(harvestWeight * 10) / 10,
            ecoScore: Math.max(0, Math.min(100, ecoScore))
        };
    }
    
    /**
     * Get garden data as a plain object for storage
     * @returns {Object} Garden data
     */
    toJSON() {
        return {
            name: this.name,
            width: this.width,
            height: this.height,
            cellSize: this.cellSize,
            cells: this.cells,
            zones: this.zones,
            created: this.created,
            lastModified: this.lastModified,
            plantCount: this.plantCount,
            stats: this.stats
        };
    }
    
    /**
     * Create a Garden instance from stored data
     * @param {string} jsonString - JSON string of garden data
     * @returns {Garden} A new Garden instance
     */
    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return new Garden(data);
        } catch (e) {
            console.error('Error parsing garden data', e);
            return new Garden();
        }
    }
    
    /**
     * Save the garden to local storage
     */
    save() {
        localStorage.setItem('gardenData', JSON.stringify(this.toJSON()));
    }
    
    /**
     * Load garden from local storage
     * @returns {Garden|null} The loaded garden or null if none exists
     */
    static load() {
        const data = localStorage.getItem('gardenData');
        return data ? Garden.fromJSON(data) : null;
    }
}

// Export the Garden class
window.Garden = Garden;