/**
 * Simulation Screen Controller
 * Manages the garden simulation interface and interactions
 */
const SimulationController = {
    // Properties
    profile: null,
    garden: null,
    simulationData: null,
    currentTimePoint: 0,
    timePoints: ['1 Week', '2 Weeks', '1 Month', '2 Months', '3 Months', '6 Months'],
    playInterval: null,
    speed: 1000, // milliseconds between auto-advance
    
    /**
     * Initialize the simulation screen
     * @param {Object} profile - User profile
     * @param {Object} garden - Garden data
     */
    initialize(profile, garden) {
        this.profile = profile;
        this.garden = garden;
        
        if (!this.garden) {
            this.showNoGardenMessage();
            return;
        }
        
        // Generate simulation data
        this.generateSimulationData();
        
        // Initialize UI
        this.initializeUI();
        this.renderTimeControls();
        this.renderGardenView();
        this.updateStats();
        
        // Add event listeners
        this.initEventListeners();
    },
    
    /**
     * Show message when no garden exists
     */
    showNoGardenMessage() {
        const simulationContainer = document.getElementById('simulation-container');
        if (!simulationContainer) return;
        
        simulationContainer.innerHTML = `
            <div class="no-garden-message">
                <h3>No Garden to Simulate</h3>
                <p>You need to create a garden before you can run a simulation.</p>
                <button id="create-garden-btn-sim" class="btn btn-primary">Create Garden</button>
            </div>
        `;
        
        // Add event listener
        document.getElementById('create-garden-btn-sim').addEventListener('click', () => {
            if (window.GardenApp) {
                window.GardenApp.showScreen('planner');
            }
        });
    },
    
    /**
     * Generate simulation data for the garden
     */
    generateSimulationData() {
        // In a real app, this would be a much more sophisticated simulation
        // based on plant growth rates, local climate, etc.
        
        // Create simulation data for each time point
        this.simulationData = [];
        
        // Clone the garden for simulation
        const simGarden = JSON.parse(JSON.stringify(this.garden));
        
        // For each time point, calculate garden state
        for (let i = 0; i < this.timePoints.length; i++) {
            const timePoint = {
                label: this.timePoints[i],
                garden: JSON.parse(JSON.stringify(simGarden)),
                stats: {},
                events: []
            };
            
            // Calculate plant growth and health for this time point
            this.simulatePlantGrowth(timePoint.garden, i);
            
            // Calculate garden stats
            this.calculateGardenStats(timePoint);
            
            // Generate random events
            this.generateEvents(timePoint, i);
            
            this.simulationData.push(timePoint);
        }
    },
    
    /**
     * Simulate plant growth for a given time point
     * @param {Object} garden - Garden data
     * @param {number} timeIndex - Time point index
     */
    simulatePlantGrowth(garden, timeIndex) {
        // Growth factors based on time passed
        const growthFactors = [0.2, 0.35, 0.6, 0.85, 0.95, 1.0];
        const growthFactor = growthFactors[timeIndex];
        
        // Update each plant in the garden
        for (let y = 0; y < garden.height; y++) {
            for (let x = 0; x < garden.width; x++) {
                const cell = garden.cells[y][x];
                
                if (cell.plant) {
                    // Get plant data
                    const plantData = window.PlantsData ? 
                        window.PlantsData.getById(cell.plant.id) : null;
                    
                    if (plantData) {
                        // Calculate growth stage
                        let growthStage = 'seedling';
                        if (growthFactor > 0.8) growthStage = 'mature';
                        else if (growthFactor > 0.5) growthStage = 'growing';
                        else if (growthFactor > 0.2) growthStage = 'established';
                        
                        // Calculate plant health based on growing conditions
                        let health = 100;
                        
                        // Check soil compatibility
                        if (plantData.soilPreference !== 'any' && plantData.soilPreference !== cell.soil) {
                            health -= 20;
                        }
                        
                        // Check sunlight requirements
                        if (plantData.sunlightNeeds !== 'any') {
                            if (plantData.sunlightNeeds === 'full' && cell.sunlight !== 'full') {
                                health -= 25;
                            }
                            if (plantData.sunlightNeeds === 'partial' && cell.sunlight === 'shade') {
                                health -= 15;
                            }
                            if (plantData.sunlightNeeds === 'shade' && cell.sunlight === 'full') {
                                health -= 25;
                            }
                        }
                        
                        // Check moisture compatibility
                        if (plantData.moistureNeeds !== 'any' && plantData.moistureNeeds !== cell.moisture) {
                            health -= 20;
                        }
                        
                        // Check plant incompatibility with neighbors
                        const neighbors = this.getNeighboringPlants(garden, x, y);
                        for (const neighbor of neighbors) {
                            const neighborData = window.PlantsData ? 
                                window.PlantsData.getById(neighbor.id) : null;
                            
                            if (neighborData && plantData.antagonists && plantData.antagonists.includes(neighborData.id)) {
                                health -= 15;
                            }
                        }
                        
                        // Apply time factor to health
                        // Plants degrade slightly over time if conditions aren't perfect
                        if (health < 90) {
                            health -= timeIndex * 5;
                        }
                        
                        // Set minimum health
                        health = Math.max(20, health);
                        
                        // Update plant data
                        cell.plant.growth = growthFactor;
                        cell.plant.stage = growthStage;
                        cell.plant.health = health;
                        
                        // Calculate yield based on health and growth
                        const yieldFactor = (health / 100) * growthFactor;
                        cell.plant.yield = Math.round((plantData.annualYield * yieldFactor) * 10) / 10;
                    }
                }
            }
        }
    },
    
    /**
     * Get plants in neighboring cells
     * @param {Object} garden - Garden data
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Array} Array of neighboring plants
     */
    getNeighboringPlants(garden, x, y) {
        const neighbors = [];
        
        // Check the 8 surrounding cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue; // Skip the center cell
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < garden.width && ny >= 0 && ny < garden.height) {
                    const cell = garden.cells[ny][nx];
                    if (cell.plant) {
                        neighbors.push(cell.plant);
                    }
                }
            }
        }
        
        return neighbors;
    },
    
    /**
     * Calculate garden statistics for a time point
     * @param {Object} timePoint - Time point data
     */
    calculateGardenStats(timePoint) {
        const garden = timePoint.garden;
        
        // Calculate basic stats
        let totalPlants = 0;
        let healthyPlants = 0;
        let totalYield = 0;
        const plantTypes = new Set();
        
        // Sum up stats from all cells
        for (let y = 0; y < garden.height; y++) {
            for (let x = 0; x < garden.width; x++) {
                const cell = garden.cells[y][x];
                
                if (cell.plant) {
                    totalPlants++;
                    plantTypes.add(cell.plant.id);
                    
                    if (cell.plant.health >= 70) {
                        healthyPlants++;
                    }
                    
                    totalYield += cell.plant.yield || 0;
                }
            }
        }
        
        // Calculate derived stats
        const healthPercentage = totalPlants > 0 ? Math.round((healthyPlants / totalPlants) * 100) : 0;
        
        // Calculate more sophisticated stats
        const maintenancePerPlant = 0.1; // hours per week
        const maintenanceHours = totalPlants * maintenancePerPlant * 52; // annual hours
        
        // Calculate water needs (simplified)
        let waterScore = 0;
        if (totalPlants > 0) {
            // Would use actual plant water requirements in a real app
            waterScore = totalPlants / (garden.width * garden.height);
        }
        
        let waterNeeds = 'low';
        if (waterScore > 0.6) waterNeeds = 'high';
        else if (waterScore > 0.3) waterNeeds = 'medium';
        
        // Calculate eco score (simplified)
        const diversityFactor = plantTypes.size / Math.max(1, totalPlants);
        const ecoScore = Math.round((diversityFactor * 50) + (50 - waterScore * 50));
        
        // Store stats in time point
        timePoint.stats = {
            plantCount: totalPlants,
            healthyPlantCount: healthyPlants,
            healthPercentage,
            varietyCount: plantTypes.size,
            harvestWeight: Math.round(totalYield * 10) / 10,
            maintenanceHours: Math.round(maintenanceHours * 10) / 10,
            waterNeeds,
            ecoScore: Math.max(0, Math.min(100, ecoScore))
        };
    },
    
    /**
     * Generate random events for a time point
     * @param {Object} timePoint - Time point data
     * @param {number} timeIndex - Time point index
     */
    generateEvents(timePoint, timeIndex) {
        // More events occur as time passes
        const eventCount = Math.min(3, Math.floor(timeIndex / 2) + 1);
        
        // Possible event types
        const eventTypes = [
            { type: 'weather', probability: 0.7 },
            { type: 'pest', probability: 0.4 },
            { type: 'disease', probability: 0.3 },
            { type: 'wildlife', probability: 0.2 },
            { type: 'success', probability: 0.5 }
        ];
        
        // Weather events
        const weatherEvents = [
            { name: 'Heavy Rain', impact: 'moisture increase', effect: 'Your garden received heavy rainfall, increasing soil moisture.' },
            { name: 'Heat Wave', impact: 'moisture decrease', effect: 'A heat wave dried out some soil areas. Water-sensitive plants may need extra care.' },
            { name: 'Frost', impact: 'cold damage', effect: 'An unexpected frost damaged cold-sensitive plants.' },
            { name: 'Perfect Weather', impact: 'growth boost', effect: 'Ideal conditions led to excellent growth across your garden.' }
        ];
        
        // Pest events
        const pestEvents = [
            { name: 'Aphid Infestation', impact: 'health decrease', effect: 'Aphids have infested some plants, reducing their health.' },
            { name: 'Cabbage Moths', impact: 'specific damage', effect: 'Cabbage moths have damaged brassicas in your garden.' },
            { name: 'Slugs', impact: 'seedling damage', effect: 'Slugs have damaged some seedlings and younger plants.' }
        ];
        
        // Disease events
        const diseaseEvents = [
            { name: 'Powdery Mildew', impact: 'health decrease', effect: 'Powdery mildew has appeared on some plants, reducing their health.' },
            { name: 'Blight', impact: 'specific damage', effect: 'Blight has affected tomatoes and potatoes in your garden.' },
            { name: 'Root Rot', impact: 'moisture problem', effect: 'Some plants are showing signs of root rot due to excessive moisture.' }
        ];
        
        // Wildlife events
        const wildlifeEvents = [
            { name: 'Bird Visitors', impact: 'mixed', effect: 'Birds visited your garden, eating some pests but also damaging berries.' },
            { name: 'Rabbit Visit', impact: 'damage', effect: 'Rabbits nibbled on some of your vegetables.' },
            { name: 'Beneficial Insects', impact: 'positive', effect: 'Beneficial insects have increased, helping with pollination and pest control.' }
        ];
        
        // Success events
        const successEvents = [
            { name: 'Abundant Growth', impact: 'yield increase', effect: 'Some plants are producing better than expected!' },
            { name: 'Perfect Conditions', impact: 'health increase', effect: 'Your garden layout has created ideal growing conditions in some areas.' },
            { name: 'Companion Benefits', impact: 'synergy', effect: 'Your companion planting is showing positive effects on plant health.' }
        ];
        
        // Generate events based on probabilities
        const events = [];
        
        for (const eventType of eventTypes) {
            if (Math.random() < eventType.probability) {
                let eventOptions;
                
                switch (eventType.type) {
                    case 'weather':
                        eventOptions = weatherEvents;
                        break;
                    case 'pest':
                        eventOptions = pestEvents;
                        break;
                    case 'disease':
                        eventOptions = diseaseEvents;
                        break;
                    case 'wildlife':
                        eventOptions = wildlifeEvents;
                        break;
                    case 'success':
                        eventOptions = successEvents;
                        break;
                }
                
                if (eventOptions && eventOptions.length > 0) {
                    const event = eventOptions[Math.floor(Math.random() * eventOptions.length)];
                    events.push({
                        type: eventType.type,
                        name: event.name,
                        impact: event.impact,
                        effect: event.effect,
                        timePoint: timeIndex
                    });
                }
                
                // Only add up to eventCount events
                if (events.length >= eventCount) break;
            }
        }
        
        timePoint.events = events;
    },
    
    /**
     * Initialize the simulation UI
     */
    initializeUI() {
        const simulationContainer = document.getElementById('simulation-container');
        if (!simulationContainer) return;
        
        simulationContainer.innerHTML = `
            <div class="simulation-header">
                <h2>Garden Simulation</h2>
                <div class="time-display">
                    <span class="current-time">${this.simulationData[0].label}</span>
                </div>
            </div>
            
            <div class="simulation-body">
                <div class="time-controls">
                    <!-- Time slider and controls will go here -->
                </div>
                
                <div class="garden-view">
                    <!-- Simulated garden visualization will go here -->
                </div>
                
                <div class="side-panel">
                    <div class="stats-panel">
                        <h3>Garden Stats</h3>
                        <div id="sim-stats" class="stats-content">
                            <!-- Stats will go here -->
                        </div>
                    </div>
                    
                    <div class="events-panel">
                        <h3>Garden Events</h3>
                        <div id="sim-events" class="events-content">
                            <!-- Events will go here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Time slider
        const timeSlider = document.getElementById('time-slider');
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                this.setTimePoint(parseInt(e.target.value, 10));
            });
        }
        
        // Play/pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }
        
        // Next button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextTimePoint();
            });
        }
        
        // Previous button
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevTimePoint();
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSimulation();
            });
        }
        
        // Speed control
        const speedControl = document.getElementById('speed-control');
        if (speedControl) {
            speedControl.addEventListener('change', (e) => {
                this.setSpeed(e.target.value);
            });
        }
    },
    
    /**
     * Render time controls
     */
    renderTimeControls() {
        const controlsContainer = document.querySelector('.time-controls');
        if (!controlsContainer) return;
        
        controlsContainer.innerHTML = `
            <div class="slider-container">
                <input type="range" id="time-slider" min="0" max="${this.timePoints.length - 1}" value="0" step="1">
                <div class="time-markers">
                    ${this.timePoints.map((tp, i) => `<div class="time-marker">${tp}</div>`).join('')}
                </div>
            </div>
            
            <div class="playback-controls">
                <button id="reset-btn" class="control-btn" title="Reset">⏮</button>
                <button id="prev-btn" class="control-btn" title="Previous">⏪</button>
                <button id="play-pause-btn" class="control-btn" title="Play/Pause">▶</button>
                <button id="next-btn" class="control-btn" title="Next">⏩</button>
                
                <div class="speed-control-container">
                    <label for="speed-control">Speed:</label>
                    <select id="speed-control">
                        <option value="2000">Slow</option>
                        <option value="1000" selected>Normal</option>
                        <option value="500">Fast</option>
                    </select>
                </div>
            </div>
        `;
        
        // Reinitialize event listeners
        this.initEventListeners();
    },
    
    /**
     * Render the garden view for the current time point
     */
    renderGardenView() {
        const gardenView = document.querySelector('.garden-view');
        if (!gardenView) return;
        
        const timePoint = this.simulationData[this.currentTimePoint];
        const garden = timePoint.garden;
        
        // Create garden grid
        gardenView.innerHTML = `
            <div class="simulated-garden" style="
                grid-template-columns: repeat(${garden.width}, 1fr);
                grid-template-rows: repeat(${garden.height}, 1fr);"
            >
                ${this.renderGardenCells(garden)}
            </div>
        `;
        
        // Add event listeners to cells for inspection
        const cells = document.querySelectorAll('.sim-garden-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const x = parseInt(e.currentTarget.dataset.x, 10);
                const y = parseInt(e.currentTarget.dataset.y, 10);
                this.showCellDetails(x, y);
            });
        });
    },
    
    /**
     * Render garden cells for the simulated view
     * @param {Object} garden - Garden data
     * @returns {string} HTML for garden cells
     */
    renderGardenCells(garden) {
        let html = '';
        
        for (let y = 0; y < garden.height; y++) {
            for (let x = 0; x < garden.width; x++) {
                const cell = garden.cells[y][x];
                
                // Cell base class
                let cellClass = 'sim-garden-cell';
                
                // Add soil class
                cellClass += ` soil-${cell.soil}`;
                
                // Add sunlight class
                cellClass += ` sunlight-${cell.sunlight}`;
                
                // Add moisture class
                cellClass += ` moisture-${cell.moisture}`;
                
                // Cell content
                let cellContent = '';
                
                // Add plant if it exists
                if (cell.plant) {
                    const plantData = window.PlantsData ? 
                        window.PlantsData.getById(cell.plant.id) : null;
                    
                    // Display plant with health indicator
                    const plantColor = this.getPlantColor(plantData);
                    
                    // Determine plant display size based on growth
                    const growthPercent = cell.plant.growth * 100;
                    
                    // Determine health indicator
                    let healthClass = 'healthy';
                    if (cell.plant.health < 40) healthClass = 'unhealthy';
                    else if (cell.plant.health < 70) healthClass = 'stressed';
                    
                    cellContent = `
                        <div class="sim-plant ${healthClass}" 
                             style="background-color: ${plantColor}; 
                                   width: ${Math.max(50, growthPercent)}%; 
                                   height: ${Math.max(50, growthPercent)}%;"
                             title="${plantData ? plantData.name : 'Plant'} (${cell.plant.health}% health)"
                        ></div>
                    `;
                }
                
                // Render the cell
                html += `
                    <div class="${cellClass}" data-x="${x}" data-y="${y}">
                        ${cellContent}
                    </div>
                `;
            }
        }
        
        return html;
    },
    
    /**
     * Update statistics for the current time point
     */
    updateStats() {
        const statsElement = document.getElementById('sim-stats');
        if (!statsElement) return;
        
        const timePoint = this.simulationData[this.currentTimePoint];
        const stats = timePoint.stats;
        
        statsElement.innerHTML = `
            <div class="sim-stat-row">
                <div class="sim-stat">
                    <span class="stat-label">Plants:</span>
                    <span class="stat-value">${stats.plantCount}</span>
                </div>
                <div class="sim-stat">
                    <span class="stat-label">Varieties:</span>
                    <span class="stat-value">${stats.varietyCount}</span>
                </div>
            </div>
            
            <div class="sim-stat-row">
                <div class="sim-stat">
                    <span class="stat-label">Plant Health:</span>
                    <span class="stat-value">${stats.healthPercentage}%</span>
                </div>
                <div class="sim-stat">
                    <span class="stat-label">Est. Harvest:</span>
                    <span class="stat-value">${stats.harvestWeight} kg</span>
                </div>
            </div>
            
            <div class="sim-stat-row">
                <div class="sim-stat">
                    <span class="stat-label">Maint. Required:</span>
                    <span class="stat-value">${stats.maintenanceHours} hrs/yr</span>
                </div>
                <div class="sim-stat">
                    <span class="stat-label">Water Needs:</span>
                    <span class="stat-value">${stats.waterNeeds}</span>
                </div>
            </div>
            
            <div class="eco-score-container">
                <div class="eco-score-label">Eco Score</div>
                <div class="eco-score-bar">
                    <div class="eco-score-fill" style="width: ${stats.ecoScore}%;"></div>
                    <div class="eco-score-value">${stats.ecoScore}</div>
                </div>
            </div>
        `;
        
        // Update events
        this.updateEvents();
    },
    
    /**
     * Update events for the current time point
     */
    updateEvents() {
        const eventsElement = document.getElementById('sim-events');
        if (!eventsElement) return;
        
        const timePoint = this.simulationData[this.currentTimePoint];
        const events = timePoint.events || [];
        
        if (events.length === 0) {
            eventsElement.innerHTML = `<p class="no-events">No significant events at this time point.</p>`;
            return;
        }
        
        let html = `<div class="events-list">`;
        
        for (const event of events) {
            let eventClass = 'event-item';
            
            // Add class based on event type
            eventClass += ` event-${event.type}`;
            
            // Add class based on impact
            if (event.impact === 'positive' || event.impact === 'growth boost' || 
                event.impact === 'yield increase' || event.impact === 'health increase') {
                eventClass += ' positive-event';
            } else if (event.impact === 'damage' || event.impact === 'health decrease' || 
                       event.impact === 'specific damage') {
                eventClass += ' negative-event';
            }
            
            html += `
                <div class="${eventClass}">
                    <div class="event-header">
                        <span class="event-name">${event.name}</span>
                        <span class="event-type">${this.formatEventType(event.type)}</span>
                    </div>
                    <div class="event-effect">${event.effect}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        eventsElement.innerHTML = html;
    },
    
    /**
     * Show details for a specific cell
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    showCellDetails(x, y) {
        const timePoint = this.simulationData[this.currentTimePoint];
        const garden = timePoint.garden;
        const cell = garden.cells[y][x];
        
        // Create modal for cell details
        const modal = document.createElement('div');
        modal.className = 'sim-modal';
        
        // Modal content
        let modalContent = `
            <div class="sim-modal-content">
                <div class="sim-modal-header">
                    <h3>Cell (${x}, ${y})</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="sim-modal-body">
                    <div class="cell-conditions">
                        <h4>Growing Conditions</h4>
                        <div class="condition-row">
                            <span class="condition-label">Soil Type:</span>
                            <span class="condition-value">${this.formatSoilType(cell.soil)}</span>
                        </div>
                        <div class="condition-row">
                            <span class="condition-label">Sunlight:</span>
                            <span class="condition-value">${this.formatSunlight(cell.sunlight)}</span>
                        </div>
                        <div class="condition-row">
                            <span class="condition-label">Moisture:</span>
                            <span class="condition-value">${this.formatMoisture(cell.moisture)}</span>
                        </div>
                    </div>
        `;
        
        // Add plant details if plant exists
        if (cell.plant) {
            const plantData = window.PlantsData ? 
                window.PlantsData.getById(cell.plant.id) : null;
            
            if (plantData) {
                // Determine health status
                let healthStatus = 'Excellent';
                if (cell.plant.health < 40) healthStatus = 'Poor';
                else if (cell.plant.health < 70) healthStatus = 'Fair';
                else if (cell.plant.health < 90) healthStatus = 'Good';
                
                modalContent += `
                    <div class="plant-details">
                        <h4>${plantData.name}</h4>
                        <div class="plant-preview" style="background-color: ${this.getPlantColor(plantData)}"></div>
                        
                        <div class="plant-status">
                            <div class="status-row">
                                <span class="status-label">Growth:</span>
                                <span class="status-value">${this.formatGrowthStage(cell.plant.stage)}</span>
                            </div>
                            <div class="status-row">
                                <span class="status-label">Health:</span>
                                <span class="status-value ${cell.plant.health < 70 ? 'warning' : ''}">${healthStatus} (${cell.plant.health}%)</span>
                            </div>
                            <div class="status-row">
                                <span class="status-label">Est. Yield:</span>
                                <span class="status-value">${cell.plant.yield} kg</span>
                            </div>
                        </div>
                        
                        <div class="plant-issues">
                            ${this.getPlantIssues(cell, plantData)}
                        </div>
                    </div>
                `;
            }
        } else {
            // No plant, show planting recommendations
            modalContent += `
                <div class="planting-recommendations">
                    <h4>Recommended Plants</h4>
                    <p>Based on this cell's conditions:</p>
                    <div class="recommendations-list">
                        ${this.getRecommendedPlants(cell)}
                    </div>
                </div>
            `;
        }
        
        modalContent += `
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },
    
    /**
     * Get plant issues for a cell
     * @param {Object} cell - Cell data
     * @param {Object} plantData - Plant data
     * @returns {string} HTML for plant issues
     */
    getPlantIssues(cell, plantData) {
        const issues = [];
        
        // Check soil compatibility
        if (plantData.soilPreference !== 'any' && plantData.soilPreference !== cell.soil) {
            issues.push('Soil type is not ideal for this plant.');
        }
        
        // Check sunlight requirements
        if (plantData.sunlightNeeds !== 'any') {
            if (plantData.sunlightNeeds === 'full' && cell.sunlight !== 'full') {
                issues.push('This plant needs more sunlight than it\'s getting.');
            }
            if (plantData.sunlightNeeds === 'partial' && cell.sunlight === 'shade') {
                issues.push('This plant isn\'t getting enough sunlight.');
            }
            if (plantData.sunlightNeeds === 'shade' && cell.sunlight === 'full') {
                issues.push('This plant is getting too much sunlight.');
            }
        }
        
        // Check moisture compatibility
        if (plantData.moistureNeeds !== 'any' && plantData.moistureNeeds !== cell.moisture) {
            if (plantData.moistureNeeds === 'high' && 
                (cell.moisture === 'dry' || cell.moisture === 'normal')) {
                issues.push('This plant needs more water than it\'s getting.');
            } else if (plantData.moistureNeeds === 'low' && 
                      (cell.moisture === 'moist' || cell.moisture === 'wet')) {
                issues.push('This plant is getting too much water.');
            } else {
                issues.push('Moisture level is not ideal for this plant.');
            }
        }
        
        if (issues.length === 0) {
            return '<p>No issues detected. This plant is well-suited to these conditions.</p>';
        }
        
        return `
            <h5>Issues</h5>
            <ul>
                ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        `;
    },
    
    /**
     * Get recommended plants for a cell
     * @param {Object} cell - Cell data
     * @returns {string} HTML for recommended plants
     */
    getRecommendedPlants(cell) {
        // Get plants suitable for the user's zone
        const zoneSuitablePlants = window.PlantsData ? 
            window.PlantsData.getByZone(parseInt(this.profile.zone, 10)) : [];
        
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
        
        // Limit to top 5
        const topRecommendations = suitablePlants.slice(0, 5);
        
        if (topRecommendations.length === 0) {
            return '<p>No plants are ideally suited for these exact conditions.</p>';
        }
        
        return `
            <div class="plant-recommendations">
                ${topRecommendations.map(plant => `
                    <div class="recommended-plant">
                        <div class="plant-color" style="background-color: ${this.getPlantColor(plant)}"></div>
                        <span>${plant.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Set the current time point
     * @param {number} index - Time point index
     */
    setTimePoint(index) {
        if (index < 0 || index >= this.simulationData.length) return;
        
        this.currentTimePoint = index;
        
        // Update slider position
        const slider = document.getElementById('time-slider');
        if (slider) {
            slider.value = index;
        }
        
        // Update time display
        const timeDisplay = document.querySelector('.current-time');
        if (timeDisplay) {
            timeDisplay.textContent = this.simulationData[index].label;
        }
        
        // Update visualization
        this.renderGardenView();
        this.updateStats();
    },
    
    /**
     * Go to the next time point
     */
    nextTimePoint() {
        if (this.currentTimePoint < this.simulationData.length - 1) {
            this.setTimePoint(this.currentTimePoint + 1);
        } else {
            // Stop auto-play if we've reached the end
            this.stopPlayback();
        }
    },
    
    /**
     * Go to the previous time point
     */
    prevTimePoint() {
        if (this.currentTimePoint > 0) {
            this.setTimePoint(this.currentTimePoint - 1);
        }
    },
    
    /**
     * Reset the simulation to the beginning
     */
    resetSimulation() {
        this.stopPlayback();
        this.setTimePoint(0);
    },
    
    /**
     * Toggle play/pause of the simulation
     */
    togglePlayPause() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        
        if (this.playInterval) {
            this.stopPlayback();
            if (playPauseBtn) {
                playPauseBtn.textContent = '▶';
                playPauseBtn.title = 'Play';
            }
        } else {
            this.startPlayback();
            if (playPauseBtn) {
                playPauseBtn.textContent = '⏸';
                playPauseBtn.title = 'Pause';
            }
        }
    },
    
    /**
     * Start automatic playback of the simulation
     */
    startPlayback() {
        if (this.playInterval) clearInterval(this.playInterval);
        
        this.playInterval = setInterval(() => {
            if (this.currentTimePoint < this.simulationData.length - 1) {
                this.nextTimePoint();
            } else {
                this.stopPlayback();
            }
        }, this.speed);
    },
    
    /**
     * Stop automatic playback
     */
    stopPlayback() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
            
            const playPauseBtn = document.getElementById('play-pause-btn');
            if (playPauseBtn) {
                playPauseBtn.textContent = '▶';
                playPauseBtn.title = 'Play';
            }
        }
    },
    
    /**
     * Set playback speed
     * @param {number} speedValue - Speed in milliseconds between frames
     */
    setSpeed(speedValue) {
        this.speed = parseInt(speedValue, 10);
        
        // Restart playback if it's currently running
        if (this.playInterval) {
            this.stopPlayback();
            this.startPlayback();
        }
    },
    
    /**
     * Get a color for a plant
     * @param {Object} plant - Plant data
     * @returns {string} CSS color
     */
    getPlantColor(plant) {
        if (!plant) return '#999999';
        
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
     * Format soil type for display
     * @param {string} soil - Soil type
     * @returns {string} Formatted soil type
     */
    formatSoilType(soil) {
        const soilTypes = {
            'regular': 'Regular',
            'sandy': 'Sandy',
            'clay': 'Clay',
            'loamy': 'Loamy',
            'rich': 'Rich'
        };
        
        return soilTypes[soil] || soil;
    },
    
    /**
     * Format sunlight for display
     * @param {string} sunlight - Sunlight level
     * @returns {string} Formatted sunlight level
     */
    formatSunlight(sunlight) {
        const sunlightTypes = {
            'full': 'Full Sun',
            'partial': 'Partial Sun',
            'shade': 'Shade'
        };
        
        return sunlightTypes[sunlight] || sunlight;
    },
    
    /**
     * Format moisture for display
     * @param {string} moisture - Moisture level
     * @returns {string} Formatted moisture level
     */
    formatMoisture(moisture) {
        const moistureTypes = {
            'dry': 'Dry',
            'normal': 'Normal',
            'moist': 'Moist',
            'wet': 'Wet'
        };
        
        return moistureTypes[moisture] || moisture;
    },
    
    /**
     * Format growth stage for display
     * @param {string} stage - Growth stage
     * @returns {string} Formatted growth stage
     */
    formatGrowthStage(stage) {
        const stages = {
            'seedling': 'Seedling',
            'established': 'Established',
            'growing': 'Growing',
            'mature': 'Mature'
        };
        
        return stages[stage] || stage;
    },
    
    /**
     * Format event type for display
     * @param {string} type - Event type
     * @returns {string} Formatted event type
     */
    formatEventType(type) {
        const types = {
            'weather': 'Weather',
            'pest': 'Pest',
            'disease': 'Disease',
            'wildlife': 'Wildlife',
            'success': 'Success'
        };
        
        return types[type] || type;
    }
};

// Export the simulation controller
window.SimulationController = SimulationController;