/**
 * Planner Screen Controller
 * Manages the garden planner interface and interactions
 */
const PlannerController = {
    // Properties
    garden: null,
    profile: null,
    activeTool: 'select',
    selectedPlant: null,
    draggedPlant: null,
    dragSource: null,
    selectedCell: null,
    gridElement: null,
    libraryElement: null,
    detailsElement: null,
    seasonsToggle: null,
    currentSeason: 'summer',
    zoneMode: false,
    currentZone: null,
    
    /**
     * Initialize the planner UI
     * @param {Object} profile - User profile
     * @param {Object} garden - Garden data (optional)
     */
    initialize(profile, garden) {
        console.log("Initializing PlannerController", { profile, garden });
        this.profile = profile;
        
        // Create or load garden
        if (garden) {
            this.garden = garden;
        } else {
            try {
                console.log("Creating new garden instance");
                this.garden = new Garden({
                    name: 'My Garden',
                    width: 10,
                    height: 10
                });
                console.log("Garden created:", this.garden);
            } catch (error) {
                console.error("Error creating garden:", error);
                // Fallback to simple object if Garden class isn't available
                this.garden = {
                    name: 'My Garden',
                    width: 10,
                    height: 10,
                    cells: this.createEmptyCells(10, 10)
                };
                console.log("Using fallback garden object");
            }
        }
        
        // Get UI elements
        this.gridElement = document.getElementById('garden-grid');
        this.libraryElement = document.getElementById('plant-library');
        this.detailsElement = document.getElementById('details-panel');
        this.seasonsToggle = document.getElementById('seasons-toggle');
        
        console.log("Found UI elements:", {
            grid: this.gridElement,
            library: this.libraryElement,
            details: this.detailsElement,
            seasonsToggle: this.seasonsToggle
        });
        
        if (!this.gridElement) {
            console.error("Garden grid element not found!");
            return; // Don't continue if we can't find the grid
        }
        
        // Initialize components
        try {
            this.initGrid();
            this.initPlantLibrary();
            this.initTools();
            this.initSeasonsToggle();
            this.renderGarden();
            this.updateStats();
            console.log("Planner initialized successfully");
        } catch (error) {
            console.error("Error initializing planner:", error);
        }
    },
    
    /**
     * Create empty cells for garden grid
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     * @returns {Array} 2D array of empty cells
     */
    createEmptyCells(width, height) {
        const cells = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
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
    },
    
    /**
     * Initialize the garden grid
     */
    initGrid() {
        console.log("Initializing garden grid");
        
        if (!this.gridElement) {
            console.error("Grid element not found");
            return;
        }
        
        try {
            // Clear existing grid
            this.gridElement.innerHTML = '';
            
            // Make sure garden has width and height
            const width = this.garden.width || 10;
            const height = this.garden.height || 10;
            
            console.log(`Setting up grid with dimensions ${width}x${height}`);
            
            // Hard-coded styles to ensure visibility
            this.gridElement.style.display = "grid";
            this.gridElement.style.gridGap = "4px";
            this.gridElement.style.backgroundColor = "#EEEEEE";
            this.gridElement.style.padding = "10px";
            this.gridElement.style.margin = "20px auto";
            this.gridElement.style.maxWidth = "90%";
            this.gridElement.style.border = "1px solid #CCCCCC";
            
            // Set grid template
            this.gridElement.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
            this.gridElement.style.gridTemplateRows = `repeat(${height}, 1fr)`;
            
            // Create cells
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'garden-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    
                    // Add visual identifier (temporary for debugging)
                    cell.textContent = `${x},${y}`;
                    cell.style.fontSize = '10px';
                    cell.style.color = '#999';
                    
                    // Hard-coded styles to ensure visibility
                    cell.style.backgroundColor = "#FFFFFF";
                    cell.style.minWidth = "40px";
                    cell.style.minHeight = "40px";
                    cell.style.cursor = "pointer";
                    cell.style.display = "flex";
                    cell.style.alignItems = "center";
                    cell.style.justifyContent = "center";
                    cell.style.border = "1px solid #E0E0E0";
                    
                    // Add event listeners
                    cell.addEventListener('click', (e) => this.onCellClick(e, x, y));
                    cell.addEventListener('dragover', (e) => this.onCellDragOver(e, x, y));
                    cell.addEventListener('drop', (e) => this.onCellDrop(e, x, y));
                    cell.addEventListener('dragenter', (e) => this.onCellDragEnter(e, x, y));
                    cell.addEventListener('dragleave', (e) => this.onCellDragLeave(e, x, y));
                    
                    this.gridElement.appendChild(cell);
                }
            }
            
            console.log("Grid initialized with", width * height, "cells");
        } catch (error) {
            console.error("Error initializing grid:", error);
            
            // Fallback - create a simple grid for testing
            this.gridElement.innerHTML = '';
            this.gridElement.style.display = 'grid';
            this.gridElement.style.gridTemplateColumns = 'repeat(5, 1fr)';
            this.gridElement.style.gridTemplateRows = 'repeat(5, 1fr)';
            this.gridElement.style.gap = '2px';
            
            for (let i = 0; i < 25; i++) {
                const cell = document.createElement('div');
                cell.className = 'garden-cell';
                cell.style.backgroundColor = '#e0e0e0';
                cell.style.minHeight = '50px';
                cell.textContent = i;
                this.gridElement.appendChild(cell);
            }
            
            console.log("Used fallback grid");
        }
    },
    
    /**
     * Initialize the plant library
     */
    initPlantLibrary() {
        // Clear library
        this.libraryElement.innerHTML = '';
        
        // Get plants suitable for the user's zone
        const zoneSuitablePlants = PlantsData.getByZone(parseInt(this.profile.zone, 10));
        
        // Group plants by category
        const categories = {
            'vegetable': { name: 'Vegetables', plants: [] },
            'herb': { name: 'Herbs', plants: [] },
            'fruit': { name: 'Fruits', plants: [] },
            'flower': { name: 'Flowers', plants: [] }
        };
        
        // Add plants to categories
        zoneSuitablePlants.forEach(plant => {
            if (categories[plant.category]) {
                categories[plant.category].plants.push(plant);
            }
        });
        
        // Create category sections
        for (const [categoryId, category] of Object.entries(categories)) {
            if (category.plants.length === 0) continue;
            
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.name;
            this.libraryElement.appendChild(categoryHeader);
            
            // Create plant list
            const plantList = document.createElement('div');
            plantList.className = 'plant-list';
            
            // Add plants
            category.plants.forEach(plant => {
                const plantItem = document.createElement('div');
                plantItem.className = 'plant-item';
                plantItem.dataset.plantId = plant.id;
                plantItem.draggable = true;
                
                // Plant icon/image
                const plantIcon = document.createElement('div');
                plantIcon.className = 'plant-icon';
                plantIcon.style.backgroundColor = this.getPlantColor(plant);
                plantItem.appendChild(plantIcon);
                
                // Plant name
                const plantName = document.createElement('span');
                plantName.className = 'plant-name';
                plantName.textContent = plant.name;
                plantItem.appendChild(plantName);
                
                // Add event listeners
                plantItem.addEventListener('dragstart', (e) => this.onPlantDragStart(e, plant));
                plantItem.addEventListener('click', (e) => this.onPlantSelect(e, plant));
                
                plantList.appendChild(plantItem);
            });
            
            this.libraryElement.appendChild(plantList);
        }
        
        // Add search box
        const searchBox = document.createElement('div');
        searchBox.className = 'plant-search';
        searchBox.innerHTML = `
            <input type="text" id="plant-search-input" placeholder="Search plants...">
            <button id="plant-search-button">Search</button>
        `;
        
        this.libraryElement.prepend(searchBox);
        
        // Add search event listener
        document.getElementById('plant-search-button').addEventListener('click', () => {
            const query = document.getElementById('plant-search-input').value;
            this.searchPlants(query);
        });
        
        document.getElementById('plant-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = document.getElementById('plant-search-input').value;
                this.searchPlants(query);
            }
        });
    },
    
    /**
     * Initialize tool buttons
     */
    initTools() {
        const toolButtons = document.querySelectorAll('.tool-button');
        
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tool = button.dataset.tool;
                
                // Remove active class from all tools
                toolButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to selected tool
                button.classList.add('active');
                
                // Set active tool
                this.activeTool = tool;
                
                // Special handling for zone tool
                if (tool === 'zone') {
                    this.zoneMode = true;
                    this.showZoneOptions();
                } else {
                    this.zoneMode = false;
                    this.hideZoneOptions();
                }
                
                // Clear selection if switching tools
                this.selectedCell = null;
                this.selectedPlant = null;
                this.updateDetailsPanel();
            });
        });
        
        // Initialize garden controls
        document.getElementById('garden-resize-button').addEventListener('click', () => {
            const widthInput = document.getElementById('garden-width');
            const heightInput = document.getElementById('garden-height');
            
            const width = parseInt(widthInput.value, 10);
            const height = parseInt(heightInput.value, 10);
            
            if (width > 0 && height > 0) {
                this.resizeGarden(width, height);
            }
        });
        
        // Initialize save button
        document.getElementById('save-garden-button').addEventListener('click', () => {
            this.saveGarden();
        });
        
        // Initialize clear button
        document.getElementById('clear-garden-button').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the garden? This cannot be undone.')) {
                this.clearGarden();
            }
        });
    },
    
    /**
     * Initialize seasons toggle
     */
    initSeasonsToggle() {
        if (!this.seasonsToggle) return;
        
        const seasonButtons = this.seasonsToggle.querySelectorAll('.season-button');
        
        seasonButtons.forEach(button => {
            button.addEventListener('click', () => {
                const season = button.dataset.season;
                
                // Remove active class from all season buttons
                seasonButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to selected season
                button.classList.add('active');
                
                // Set current season
                this.currentSeason = season;
                
                // Update garden visualization
                this.renderGarden();
            });
        });
    },
    
    /**
     * Search plants in the library
     * @param {string} query - Search query
     */
    searchPlants(query) {
        if (!query) {
            this.initPlantLibrary();
            return;
        }
        
        const results = PlantsData.search(query);
        
        // Clear library
        this.libraryElement.innerHTML = '';
        
        // Add search box back
        const searchBox = document.createElement('div');
        searchBox.className = 'plant-search';
        searchBox.innerHTML = `
            <input type="text" id="plant-search-input" placeholder="Search plants..." value="${query}">
            <button id="plant-search-button">Search</button>
        `;
        
        this.libraryElement.appendChild(searchBox);
        
        // Add search event listener
        document.getElementById('plant-search-button').addEventListener('click', () => {
            const newQuery = document.getElementById('plant-search-input').value;
            this.searchPlants(newQuery);
        });
        
        document.getElementById('plant-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const newQuery = document.getElementById('plant-search-input').value;
                this.searchPlants(newQuery);
            }
        });
        
        // Create results header
        const resultsHeader = document.createElement('h3');
        resultsHeader.className = 'category-header';
        resultsHeader.textContent = `Search Results (${results.length})`;
        this.libraryElement.appendChild(resultsHeader);
        
        // Create plant list
        const plantList = document.createElement('div');
        plantList.className = 'plant-list';
        
        // Add plants
        results.forEach(plant => {
            const plantItem = document.createElement('div');
            plantItem.className = 'plant-item';
            plantItem.dataset.plantId = plant.id;
            plantItem.draggable = true;
            
            // Plant icon/image
            const plantIcon = document.createElement('div');
            plantIcon.className = 'plant-icon';
            plantIcon.style.backgroundColor = this.getPlantColor(plant);
            plantItem.appendChild(plantIcon);
            
            // Plant name
            const plantName = document.createElement('span');
            plantName.className = 'plant-name';
            plantName.textContent = plant.name;
            plantItem.appendChild(plantName);
            
            // Add event listeners
            plantItem.addEventListener('dragstart', (e) => this.onPlantDragStart(e, plant));
            plantItem.addEventListener('click', (e) => this.onPlantSelect(e, plant));
            
            plantList.appendChild(plantItem);
        });
        
        this.libraryElement.appendChild(plantList);
        
        // Add reset link
        const resetLink = document.createElement('button');
        resetLink.className = 'reset-search';
        resetLink.textContent = 'Reset Search';
        resetLink.addEventListener('click', () => {
            this.initPlantLibrary();
        });
        
        this.libraryElement.appendChild(resetLink);
    },
    
    /**
     * Render the garden grid
     */
    renderGarden() {
        for (let y = 0; y < this.garden.height; y++) {
            for (let x = 0; x < this.garden.width; x++) {
                const cellData = this.garden.cells[y][x];
                const cellElement = this.getCellElement(x, y);
                
                if (!cellElement) continue;
                
                // Reset cell classes
                cellElement.className = 'garden-cell';
                cellElement.innerHTML = '';
                
                // Add zone class if applicable
                if (cellData.zoneId) {
                    const zone = this.garden.zones.find(z => z.id === cellData.zoneId);
                    if (zone) {
                        cellElement.style.backgroundColor = this.hexToRgba(zone.color, 0.3);
                    }
                } else {
                    cellElement.style.backgroundColor = '';
                }
                
                // Add soil class
                cellElement.classList.add(`soil-${cellData.soil}`);
                
                // Add sunlight class
                cellElement.classList.add(`sunlight-${cellData.sunlight}`);
                
                // Add moisture class
                cellElement.classList.add(`moisture-${cellData.moisture}`);
                
                // Add plant if it exists
                if (cellData.plant) {
                    const plant = PlantsData.getById(cellData.plant.id);
                    
                    if (plant) {
                        // Create plant visualization
                        const plantEl = document.createElement('div');
                        plantEl.className = 'plant-visualization';
                        plantEl.style.backgroundColor = this.getPlantColor(plant);
                        
                        // Add seasonal appearance
                        if (this.isPlantVisibleInSeason(plant, this.currentSeason)) {
                            plantEl.classList.add('plant-visible');
                            
                            // Add plant status (flowering, fruiting, etc)
                            const plantStatus = this.getPlantSeasonalStatus(plant, this.currentSeason);
                            if (plantStatus) {
                                plantEl.classList.add(`plant-${plantStatus}`);
                            }
                        } else {
                            plantEl.classList.add('plant-dormant');
                        }
                        
                        cellElement.appendChild(plantEl);
                    }
                }
                
                // Add selected class if applicable
                if (this.selectedCell && this.selectedCell.x === x && this.selectedCell.y === y) {
                    cellElement.classList.add('selected');
                }
            }
        }
    },
    
    /**
     * Get the cell element for a given position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {HTMLElement} The cell element
     */
    getCellElement(x, y) {
        return document.querySelector(`.garden-cell[data-x="${x}"][data-y="${y}"]`);
    },
    
    /**
     * Show plant details in the details panel
     * @param {Object} plant - The plant data
     */
    showPlantDetails(plant) {
        if (!plant) {
            this.detailsElement.innerHTML = '<p>Select a plant or cell to see details</p>';
            return;
        }
        
        this.detailsElement.innerHTML = `
            <h3>${plant.name}</h3>
            <div class="plant-details">
                <div class="plant-preview" style="background-color: ${this.getPlantColor(plant)}"></div>
                <div class="plant-info">
                    <p>${plant.description}</p>
                    <div class="plant-data">
                        <div class="data-item">
                            <span class="label">Harvest Time:</span>
                            <span class="value">${plant.harvestTime} days</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Spacing:</span>
                            <span class="value">${plant.spacing} cm</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Sunlight:</span>
                            <span class="value">${plant.sunlightNeeds}</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Water Needs:</span>
                            <span class="value">${plant.waterNeeds}</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Soil:</span>
                            <span class="value">${plant.soilPreference}</span>
                        </div>
                        <div class="data-item">
                            <span class="label">Zone:</span>
                            <span class="value">${plant.zoneRange}</span>
                        </div>
                    </div>
                </div>
            </div>
            <h4>Companions</h4>
            <div class="companions-list">
                ${this.renderCompanionsList(plant)}
            </div>
            <h4>Seasonal Planting</h4>
            <div class="seasonal-chart">
                ${this.renderSeasonalChart(plant)}
            </div>
            <div class="actions-row">
                <button id="quick-add-button">Quick Add</button>
                <button id="companion-check-button">Check Compatibility</button>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('quick-add-button').addEventListener('click', () => {
            this.quickAddPlant(plant);
        });
        
        document.getElementById('companion-check-button').addEventListener('click', () => {
            this.checkCompatibility(plant);
        });
    },
    
    /**
     * Show cell details in the details panel
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    showCellDetails(x, y) {
        const cell = this.garden.cells[y][x];
        
        if (cell.plant) {
            const plant = PlantsData.getById(cell.plant.id);
            if (plant) {
                this.showPlantDetails(plant);
                return;
            }
        }
        
        // Show cell details
        this.detailsElement.innerHTML = `
            <h3>Cell (${x}, ${y})</h3>
            <div class="cell-details">
                <div class="cell-preview ${cell.zoneId ? 'has-zone' : ''}" style="${cell.zoneId ? `background-color: ${this.getZoneColor(cell.zoneId)}` : ''}">
                    <div class="cell-position">(${x}, ${y})</div>
                </div>
                <div class="cell-properties">
                    <div class="property-group">
                        <label>Soil Type:</label>
                        <select id="soil-type">
                            <option value="regular" ${cell.soil === 'regular' ? 'selected' : ''}>Regular</option>
                            <option value="sandy" ${cell.soil === 'sandy' ? 'selected' : ''}>Sandy</option>
                            <option value="clay" ${cell.soil === 'clay' ? 'selected' : ''}>Clay</option>
                            <option value="loamy" ${cell.soil === 'loamy' ? 'selected' : ''}>Loamy</option>
                            <option value="rich" ${cell.soil === 'rich' ? 'selected' : ''}>Rich</option>
                        </select>
                    </div>
                    
                    <div class="property-group">
                        <label>Sunlight:</label>
                        <select id="sunlight">
                            <option value="full" ${cell.sunlight === 'full' ? 'selected' : ''}>Full Sun</option>
                            <option value="partial" ${cell.sunlight === 'partial' ? 'selected' : ''}>Partial Sun</option>
                            <option value="shade" ${cell.sunlight === 'shade' ? 'selected' : ''}>Shade</option>
                        </select>
                    </div>
                    
                    <div class="property-group">
                        <label>Moisture:</label>
                        <select id="moisture">
                            <option value="dry" ${cell.moisture === 'dry' ? 'selected' : ''}>Dry</option>
                            <option value="normal" ${cell.moisture === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="moist" ${cell.moisture === 'moist' ? 'selected' : ''}>Moist</option>
                            <option value="wet" ${cell.moisture === 'wet' ? 'selected' : ''}>Wet</option>
                        </select>
                    </div>
                    
                    <div class="property-group">
                        <label>Zone:</label>
                        <select id="zone">
                            <option value="">No Zone</option>
                            ${this.garden.zones.map(zone => 
                                `<option value="${zone.id}" ${cell.zoneId === zone.id ? 'selected' : ''}>${zone.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="actions-row">
                <button id="update-cell-button">Update Cell</button>
                ${cell.plant ? '<button id="remove-plant-button">Remove Plant</button>' : ''}
            </div>
            <div class="plant-suggestions">
                <h4>Suggested Plants for This Cell</h4>
                <div id="plant-suggestions-list">
                    ${this.getSuggestedPlantsForCell(x, y)}
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('update-cell-button').addEventListener('click', () => {
            this.updateCellProperties(x, y);
        });
        
        const removeButton = document.getElementById('remove-plant-button');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                this.removePlant(x, y);
            });
        }
    },
    
    /**
     * Update the details panel
     */
    updateDetailsPanel() {
        if (this.selectedPlant) {
            this.showPlantDetails(this.selectedPlant);
        } else if (this.selectedCell) {
            this.showCellDetails(this.selectedCell.x, this.selectedCell.y);
        } else {
            this.detailsElement.innerHTML = '<p>Select a plant or cell to see details</p>';
        }
    },
    
    /**
     * Update garden statistics
     */
    updateStats() {
        const statsElement = document.getElementById('garden-stats');
        if (!statsElement) return;
        
        this.garden.updateStats();
        const stats = this.garden.stats;
        
        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${stats.plantCount}</span>
                <span class="stat-label">Plants</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.varietyCount}</span>
                <span class="stat-label">Varieties</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.maintenanceHours}</span>
                <span class="stat-label">Maint. Hours/Year</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.waterNeeds}</span>
                <span class="stat-label">Water Needs</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${stats.harvestWeight} kg</span>
                <span class="stat-label">Est. Harvest</span>
            </div>
            <div class="stat-item eco-score">
                <span class="stat-value">${stats.ecoScore}</span>
                <span class="stat-label">Eco Score</span>
            </div>
        `;
    },
    
    /**
     * Render companions list for a plant
     * @param {Object} plant - Plant data
     * @returns {string} HTML for companions list
     */
    renderCompanionsList(plant) {
        if (!plant.companions || plant.companions.length === 0) {
            return '<p>No companions listed</p>';
        }
        
        let html = '<div class="companion-items">';
        
        for (const companionId of plant.companions) {
            const companion = PlantsData.getById(companionId);
            if (companion) {
                html += `
                    <div class="companion-item" data-plant-id="${companion.id}">
                        <div class="companion-icon" style="background-color: ${this.getPlantColor(companion)}"></div>
                        <span>${companion.name}</span>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        
        if (plant.antagonists && plant.antagonists.length > 0) {
            html += '<h4>Avoid Planting Near</h4><div class="antagonist-items">';
            
            for (const antagonistId of plant.antagonists) {
                const antagonist = PlantsData.getById(antagonistId);
                if (antagonist) {
                    html += `
                        <div class="antagonist-item" data-plant-id="${antagonist.id}">
                            <div class="antagonist-icon" style="background-color: ${this.getPlantColor(antagonist)}"></div>
                            <span>${antagonist.name}</span>
                        </div>
                    `;
                }
            }
            
            html += '</div>';
        }
        
        return html;
    },
    
    /**
     * Render a seasonal planting chart for a plant
     * @param {Object} plant - Plant data
     * @returns {string} HTML for seasonal chart
     */
    renderSeasonalChart(plant) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let html = '<div class="month-chart">';
        
        months.forEach((month, index) => {
            const monthNum = index + 1;
            const isPlantingMonth = plant.seedingMonths.includes(monthNum);
            const isHarvestMonth = plant.harvestMonths.includes(monthNum);
            
            let monthClass = '';
            if (isPlantingMonth && isHarvestMonth) {
                monthClass = 'plant-harvest';
            } else if (isPlantingMonth) {
                monthClass = 'planting';
            } else if (isHarvestMonth) {
                monthClass = 'harvest';
            }
            
            html += `<div class="month ${monthClass}" title="${month}: ${isPlantingMonth ? 'Planting ' : ''}${isHarvestMonth ? 'Harvest' : ''}">${month}</div>`;
        });
        
        html += '</div>';
        html += `
            <div class="chart-legend">
                <div class="legend-item"><div class="color-box planting"></div><span>Planting</span></div>
                <div class="legend-item"><div class="color-box harvest"></div><span>Harvest</span></div>
                <div class="legend-item"><div class="color-box plant-harvest"></div><span>Both</span></div>
            </div>
        `;
        
        return html;
    },
    
    /**
     * Get suggested plants for a specific cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} HTML for plant suggestions
     */
    getSuggestedPlantsForCell(x, y) {
        const cell = this.garden.cells[y][x];
        const currentMonth = new Date().getMonth() + 1; // 1-12
        
        // Get plants suitable for the user's zone
        const zoneSuitablePlants = PlantsData.getByZone(parseInt(this.profile.zone, 10));
        
        // Filter by current month for planting
        const seasonalPlants = PlantsData.getByPlantingMonth(currentMonth);
        
        // Filter by cell conditions
        const suitablePlants = zoneSuitablePlants.filter(plant => {
            // Check soil compatibility
            if (plant.soilPreference !== 'any' && plant.soilPreference !== cell.soil) {
                return false;
            }
            
            // Check sunlight requirements
            if (plant.sunlightNeeds !== 'any') {
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
            if (plant.moistureNeeds !== 'any' && plant.moistureNeeds !== cell.moisture) {
                return false;
            }
            
            return true;
        });
        
        // Prioritize plants that are also in season
        suitablePlants.sort((a, b) => {
            const aInSeason = seasonalPlants.includes(a);
            const bInSeason = seasonalPlants.includes(b);
            
            if (aInSeason && !bInSeason) return -1;
            if (!aInSeason && bInSeason) return 1;
            return 0;
        });
        
        // Limit to top 5 suggestions
        const topSuggestions = suitablePlants.slice(0, 5);
        
        if (topSuggestions.length === 0) {
            return '<p>No plants match this cell\'s conditions</p>';
        }
        
        let html = '<div class="suggestion-list">';
        
        topSuggestions.forEach(plant => {
            const isInSeason = seasonalPlants.includes(plant);
            html += `
                <div class="suggestion-item ${isInSeason ? 'in-season' : ''}" data-plant-id="${plant.id}">
                    <div class="suggestion-icon" style="background-color: ${this.getPlantColor(plant)}"></div>
                    <span class="suggestion-name">${plant.name}</span>
                    ${isInSeason ? '<span class="in-season-badge">In Season</span>' : ''}
                    <button class="add-suggestion" data-plant-id="${plant.id}">Add</button>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add event listeners after rendering
        setTimeout(() => {
            const addButtons = document.querySelectorAll('.add-suggestion');
            addButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const plantId = e.target.dataset.plantId;
                    const plant = PlantsData.getById(plantId);
                    if (plant) {
                        this.addPlant(x, y, plant);
                    }
                });
            });
        }, 0);
        
        return html;
    },
    
    /**
     * Show zone creation options
     */
    showZoneOptions() {
        const zoneOptions = document.getElementById('zone-options');
        if (!zoneOptions) return;
        
        zoneOptions.classList.add('visible');
        
        // Clear existing options
        zoneOptions.innerHTML = `
            <h3>Garden Zones</h3>
            <div class="zones-list">
                ${this.renderZonesList()}
            </div>
            <div class="zone-actions">
                <input type="text" id="new-zone-name" placeholder="New Zone Name">
                <input type="color" id="new-zone-color" value="#CCCCCC">
                <button id="create-zone-button">Create Zone</button>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('create-zone-button').addEventListener('click', () => {
            const name = document.getElementById('new-zone-name').value;
            const color = document.getElementById('new-zone-color').value;
            
            if (name) {
                const zoneId = this.garden.createZone(name, color);
                this.currentZone = zoneId;
                this.showZoneOptions(); // Refresh zone list
            }
        });
        
        // Add event listeners to zone items
        setTimeout(() => {
            const zoneItems = document.querySelectorAll('.zone-item');
            zoneItems.forEach(item => {
                item.addEventListener('click', () => {
                    const zoneId = item.dataset.zoneId;
                    this.currentZone = zoneId === 'none' ? null : zoneId;
                    
                    // Update selected state
                    zoneItems.forEach(zi => zi.classList.remove('selected'));
                    item.classList.add('selected');
                });
            });
        }, 0);
    },
    
    /**
     * Hide zone options
     */
    hideZoneOptions() {
        const zoneOptions = document.getElementById('zone-options');
        if (!zoneOptions) return;
        
        zoneOptions.classList.remove('visible');
    },
    
    /**
     * Render the zones list
     * @returns {string} HTML for zones list
     */
    renderZonesList() {
        let html = `
            <div class="zone-item ${!this.currentZone ? 'selected' : ''}" data-zone-id="none">
                <div class="zone-color" style="background-color: transparent; border: 1px dashed #999;"></div>
                <span class="zone-name">No Zone</span>
            </div>
        `;
        
        this.garden.zones.forEach(zone => {
            html += `
                <div class="zone-item ${this.currentZone === zone.id ? 'selected' : ''}" data-zone-id="${zone.id}">
                    <div class="zone-color" style="background-color: ${zone.color};"></div>
                    <span class="zone-name">${zone.name}</span>
                </div>
            `;
        });
        
        return html;
    },
    
    /**
     * Resize the garden
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resizeGarden(width, height) {
        this.garden.resize(width, height);
        this.initGrid();
        this.renderGarden();
    },
    
    /**
     * Save the garden
     */
    saveGarden() {
        this.garden.save();
        
        // Show save confirmation
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Garden saved successfully!';
        document.body.appendChild(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    },
    
    /**
     * Clear the garden
     */
    clearGarden() {
        this.garden = new Garden({
            name: this.garden.name,
            width: this.garden.width,
            height: this.garden.height
        });
        
        this.renderGarden();
        this.updateStats();
    },
    
    /**
     * Handle cell click event
     * @param {Event} e - Click event
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    onCellClick(e, x, y) {
        // Handle based on active tool
        switch (this.activeTool) {
            case 'select':
                this.selectCell(x, y);
                break;
            
            case 'plant':
                if (this.selectedPlant) {
                    this.addPlant(x, y, this.selectedPlant);
                }
                break;
            
            case 'remove':
                this.removePlant(x, y);
                break;
            
            case 'zone':
                if (this.zoneMode) {
                    this.applyZone(x, y);
                }
                break;
        }
    },
    
    /**
     * Select a cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    selectCell(x, y) {
        // Deselect previously selected cell
        if (this.selectedCell) {
            const prevCellEl = this.getCellElement(this.selectedCell.x, this.selectedCell.y);
            if (prevCellEl) {
                prevCellEl.classList.remove('selected');
            }
        }
        
        // Select new cell
        this.selectedCell = { x, y };
        const cellEl = this.getCellElement(x, y);
        if (cellEl) {
            cellEl.classList.add('selected');
        }
        
        // Update details panel
        this.showCellDetails(x, y);
    },
    
    /**
     * Add a plant to a cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} plant - Plant data
     */
    addPlant(x, y, plant) {
        const success = this.garden.addPlant(x, y, plant);
        
        if (success) {
            this.renderGarden();
            this.updateStats();
            
            // If the cell is selected, update the details panel
            if (this.selectedCell && this.selectedCell.x === x && this.selectedCell.y === y) {
                this.showCellDetails(x, y);
            }
        } else {
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Cannot place plant here. Check compatibility or growing conditions.';
            document.body.appendChild(notification);
            
            // Remove notification after a delay
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        }
    },
    
    /**
     * Remove a plant from a cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    removePlant(x, y) {
        const success = this.garden.removePlant(x, y);
        
        if (success) {
            this.renderGarden();
            this.updateStats();
            
            // If the cell is selected, update the details panel
            if (this.selectedCell && this.selectedCell.x === x && this.selectedCell.y === y) {
                this.showCellDetails(x, y);
            }
        }
    },
    
    /**
     * Apply a zone to a cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    applyZone(x, y) {
        const cell = this.garden.cells[y][x];
        
        if (cell.zoneId === this.currentZone) {
            // Toggle zone off if clicking the same zone
            this.garden.updateCell(x, y, { zoneId: null });
        } else {
            this.garden.updateCell(x, y, { zoneId: this.currentZone });
        }
        
        this.renderGarden();
        
        // If the cell is selected, update the details panel
        if (this.selectedCell && this.selectedCell.x === x && this.selectedCell.y === y) {
            this.showCellDetails(x, y);
        }
    },
    
    /**
     * Update cell properties
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    updateCellProperties(x, y) {
        const soilType = document.getElementById('soil-type').value;
        const sunlight = document.getElementById('sunlight').value;
        const moisture = document.getElementById('moisture').value;
        const zoneId = document.getElementById('zone').value;
        
        this.garden.updateCell(x, y, {
            soil: soilType,
            sunlight,
            moisture,
            zoneId: zoneId === '' ? null : zoneId
        });
        
        this.renderGarden();
        this.showCellDetails(x, y);
    },
    
    /**
     * Handle plant selection
     * @param {Event} e - Click event
     * @param {Object} plant - Plant data
     */
    onPlantSelect(e, plant) {
        this.selectedPlant = plant;
        
        // Update visual selection in the library
        const plantItems = document.querySelectorAll('.plant-item');
        plantItems.forEach(item => {
            item.classList.remove('selected');
        });
        
        e.currentTarget.classList.add('selected');
        
        // Update details panel
        this.showPlantDetails(plant);
        
        // Automatically switch to plant tool
        const plantTool = document.querySelector('.tool-button[data-tool="plant"]');
        if (plantTool) {
            const toolButtons = document.querySelectorAll('.tool-button');
            toolButtons.forEach(btn => btn.classList.remove('active'));
            plantTool.classList.add('active');
            this.activeTool = 'plant';
        }
    },
    
    /**
     * Quick add a plant to an optimal location
     * @param {Object} plant - Plant data
     */
    quickAddPlant(plant) {
        // Find suitable locations
        const suitableLocations = [];
        
        for (let y = 0; y < this.garden.height; y++) {
            for (let x = 0; x < this.garden.width; x++) {
                const cell = this.garden.cells[y][x];
                
                // Skip cells that already have plants
                if (cell.plant) continue;
                
                // Check growing conditions
                if (this.garden.checkGrowingConditions(x, y, plant) && this.garden.checkPlantCompatibility(x, y, plant)) {
                    suitableLocations.push({ x, y });
                }
            }
        }
        
        if (suitableLocations.length === 0) {
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'No suitable locations found for this plant.';
            document.body.appendChild(notification);
            
            // Remove notification after a delay
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
            
            return;
        }
        
        // Pick a random suitable location
        const location = suitableLocations[Math.floor(Math.random() * suitableLocations.length)];
        
        // Add the plant
        this.addPlant(location.x, location.y, plant);
        
        // Briefly highlight the cell
        const cellEl = this.getCellElement(location.x, location.y);
        if (cellEl) {
            cellEl.classList.add('highlight');
            setTimeout(() => {
                cellEl.classList.remove('highlight');
            }, 2000);
        }
    },
    
    /**
     * Check garden for compatibility with a plant
     * @param {Object} plant - Plant data
     */
    checkCompatibility(plant) {
        // First check if there are any plants that would conflict
        const incompatibleCells = [];
        
        for (let y = 0; y < this.garden.height; y++) {
            for (let x = 0; x < this.garden.width; x++) {
                const cell = this.garden.cells[y][x];
                
                if (cell.plant) {
                    const existingPlant = PlantsData.getById(cell.plant.id);
                    
                    if (existingPlant) {
                        // Check if the plants are antagonists
                        if (plant.antagonists && plant.antagonists.includes(existingPlant.id)) {
                            incompatibleCells.push({ x, y, plant: existingPlant });
                        }
                        
                        if (existingPlant.antagonists && existingPlant.antagonists.includes(plant.id)) {
                            incompatibleCells.push({ x, y, plant: existingPlant });
                        }
                    }
                }
            }
        }
        
        // Highlight incompatible cells
        incompatibleCells.forEach(cell => {
            const cellEl = this.getCellElement(cell.x, cell.y);
            if (cellEl) {
                cellEl.classList.add('incompatible');
                
                // Create tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = `${cell.plant.name} conflicts with ${plant.name}`;
                cellEl.appendChild(tooltip);
                
                // Remove highlight after delay
                setTimeout(() => {
                    cellEl.classList.remove('incompatible');
                    cellEl.removeChild(tooltip);
                }, 5000);
            }
        });
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        if (incompatibleCells.length > 0) {
            notification.classList.add('warning');
            notification.textContent = `Found ${incompatibleCells.length} incompatible plants. Conflicts highlighted.`;
        } else {
            notification.textContent = 'No conflicts found. This plant is compatible with your garden.';
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    },
    
    /**
     * Handle plant drag start
     * @param {Event} e - Drag event
     * @param {Object} plant - Plant data
     */
    onPlantDragStart(e, plant) {
        this.draggedPlant = plant;
        this.dragSource = e.currentTarget;
        
        // Set drag image
        const dragImage = document.createElement('div');
        dragImage.className = 'drag-image';
        dragImage.style.backgroundColor = this.getPlantColor(plant);
        document.body.appendChild(dragImage);
        
        e.dataTransfer.setDragImage(dragImage, 25, 25);
        e.dataTransfer.setData('text/plain', plant.id);
        
        // Remove drag image after drag starts
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    },
    
    /**
     * Handle cell drag over
     * @param {Event} e - Drag event
     */
    onCellDragOver(e, x, y) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    },
    
    /**
     * Handle cell drag enter
     * @param {Event} e - Drag event
     */
    onCellDragEnter(e, x, y) {
        const cellEl = e.currentTarget;
        cellEl.classList.add('drag-over');
    },
    
    /**
     * Handle cell drag leave
     * @param {Event} e - Drag event
     */
    onCellDragLeave(e, x, y) {
        const cellEl = e.currentTarget;
        cellEl.classList.remove('drag-over');
    },
    
    /**
     * Handle cell drop
     * @param {Event} e - Drop event
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    onCellDrop(e, x, y) {
        e.preventDefault();
        
        const cellEl = e.currentTarget;
        cellEl.classList.remove('drag-over');
        
        const plantId = e.dataTransfer.getData('text/plain');
        const plant = PlantsData.getById(plantId);
        
        if (plant) {
            this.addPlant(x, y, plant);
        }
    },
    
    /**
     * Check if a plant is visible in the current season
     * @param {Object} plant - Plant data
     * @param {string} season - Season name
     * @returns {boolean} Whether plant is visible
     */
    isPlantVisibleInSeason(plant, season) {
        // This is a simplified version - a real implementation would use
        // more sophisticated logic based on the plant lifecycle and weather
        switch (season) {
            case 'spring':
                return plant.seedingMonths.some(month => month >= 3 && month <= 5);
            case 'summer':
                return plant.seedingMonths.some(month => month >= 6 && month <= 8) ||
                       plant.harvestMonths.some(month => month >= 6 && month <= 8);
            case 'fall':
                return plant.harvestMonths.some(month => month >= 9 && month <= 11);
            case 'winter':
                return plant.category === 'herb' || (plant.zoneRange.includes('11') && plant.zoneRange.includes('13'));
            default:
                return true;
        }
    },
    
    /**
     * Get plant seasonal status
     * @param {Object} plant - Plant data
     * @param {string} season - Season name
     * @returns {string|null} Plant status
     */
    getPlantSeasonalStatus(plant, season) {
        // This is a simplified version - a real implementation would use
        // more sophisticated logic based on the plant lifecycle and weather
        switch (season) {
            case 'spring':
                if (plant.seedingMonths.some(month => month >= 3 && month <= 5)) {
                    return 'seedling';
                }
                return null;
            case 'summer':
                if (plant.harvestMonths.some(month => month >= 6 && month <= 8)) {
                    return 'fruiting';
                }
                if (plant.seedingMonths.some(month => month >= 6 && month <= 8)) {
                    return 'growing';
                }
                return 'mature';
            case 'fall':
                if (plant.harvestMonths.some(month => month >= 9 && month <= 11)) {
                    return 'fruiting';
                }
                return 'mature';
            case 'winter':
                return 'dormant';
            default:
                return null;
        }
    },
    
    /**
     * Get a color for a plant
     * @param {Object} plant - Plant data
     * @returns {string} CSS color
     */
    getPlantColor(plant) {
        // Different colors based on plant category
        const categoryColors = {
            'vegetable': '#4CAF50', // Green
            'herb': '#9C27B0',      // Purple
            'fruit': '#F44336',     // Red
            'flower': '#FF9800'     // Orange
        };
        
        return categoryColors[plant.category] || '#2196F3'; // Default blue
    },
    
    /**
     * Get color for a zone
     * @param {string} zoneId - Zone ID
     * @returns {string} CSS color
     */
    getZoneColor(zoneId) {
        const zone = this.garden.zones.find(z => z.id === zoneId);
        return zone ? zone.color : 'transparent';
    },
    
    /**
     * Convert a hex color to rgba with opacity
     * @param {string} hex - Hex color
     * @param {number} opacity - Opacity value
     * @returns {string} RGBA color
     */
    hexToRgba(hex, opacity) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Return rgba
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
};

// Export the planner controller
window.PlannerController = PlannerController;