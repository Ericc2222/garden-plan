/**
 * Dashboard Screen Controller
 * Manages the dashboard interface and interactions
 */
const DashboardController = {
    // Properties
    profile: null,
    garden: null,
    weatherData: null,
    
    /**
     * Initialize the dashboard
     * @param {Object} profile - User profile
     * @param {Object} garden - Garden data (optional)
     */
    initialize(profile, garden) {
        this.profile = profile;
        this.garden = garden;
        
        // Render dashboard components
        this.renderProfile();
        this.renderGardenSummary();
        this.renderPlantingCalendar();
        this.renderWeatherWidget();
        this.loadWeatherData();
        
        // Add event listeners
        this.initEventListeners();
    },
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showProfileEdit();
            });
        }
        
        // Create garden buttons - check multiple possible IDs
        const createButtonIds = ['create-garden-btn', 'create-new-plan-btn'];
        
        createButtonIds.forEach(buttonId => {
            const createButton = document.getElementById(buttonId);
            if (createButton) {
                console.log(`Found create button: ${buttonId}`);
                createButton.addEventListener('click', () => {
                    console.log(`Create button clicked: ${buttonId}`);
                    // Navigate to planner screen
                    if (window.GardenApp) {
                        window.GardenApp.showScreen('planner');
                    } else {
                        console.error("GardenApp not found in window");
                    }
                });
            }
        });
        
        // Calendar nav buttons
        const prevMonthBtn = document.getElementById('prev-month');
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.navigateCalendar(-1);
            });
        }
        
        const nextMonthBtn = document.getElementById('next-month');
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.navigateCalendar(1);
            });
        }
    },
    
    /**
     * Render the profile section
     */
    renderProfile() {
        const profileElement = document.getElementById('profile-summary');
        if (!profileElement || !this.profile) return;
        
        const zoneInfo = this.profile.getZoneInfo();
        
        profileElement.innerHTML = `
            <div class="profile-header">
                <h2>${this.profile.name}'s Garden</h2>
                <button id="edit-profile-btn" class="btn btn-small">Edit</button>
            </div>
            <div class="profile-details">
                <div class="profile-detail">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${this.profile.location}</span>
                </div>
                <div class="profile-detail">
                    <span class="detail-label">Growing Zone:</span>
                    <span class="detail-value">Zone ${this.profile.zone} (${zoneInfo.minTemp})</span>
                </div>
                <div class="profile-detail">
                    <span class="detail-label">Growing Season:</span>
                    <span class="detail-value">${zoneInfo.season}</span>
                </div>
                <div class="profile-detail">
                    <span class="detail-label">Experience:</span>
                    <span class="detail-value">${this.profile.getExperienceLevel()}</span>
                </div>
            </div>
        `;
    },
    
    /**
     * Render the garden summary widget
     */
    renderGardenSummary() {
        const summaryElement = document.getElementById('garden-summary');
        if (!summaryElement) return;
        
        if (!this.garden) {
            // No garden yet
            summaryElement.innerHTML = `
                <div class="empty-garden">
                    <h3>No Garden Yet</h3>
                    <p>Start planning your garden to see stats and information here.</p>
                    <button id="create-garden-btn" class="btn btn-primary">Create Garden</button>
                </div>
            `;
            return;
        }
        
        // Garden exists, show summary
        this.garden.updateStats();
        const stats = this.garden.stats;
        
        summaryElement.innerHTML = `
            <div class="garden-summary-header">
                <h3>${this.garden.name}</h3>
                <div class="last-modified">Last Modified: ${this.formatDate(this.garden.lastModified)}</div>
            </div>
            
            <div class="garden-stats">
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
                    <span class="stat-value">${stats.harvestWeight} kg</span>
                    <span class="stat-label">Est. Harvest</span>
                </div>
            </div>
            
            <div class="eco-score-container">
                <div class="eco-score-label">Eco Score</div>
                <div class="eco-score-bar">
                    <div class="eco-score-fill" style="width: ${stats.ecoScore}%;"></div>
                    <div class="eco-score-value">${stats.ecoScore}</div>
                </div>
            </div>
            
            <div class="garden-actions">
                <button id="open-garden-btn" class="btn">Open Garden</button>
                <button id="simulate-btn" class="btn">Simulate Growth</button>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('open-garden-btn').addEventListener('click', () => {
            if (window.GardenApp) {
                window.GardenApp.showScreen('planner');
            }
        });
        
        document.getElementById('simulate-btn').addEventListener('click', () => {
            if (window.GardenApp) {
                window.GardenApp.showScreen('simulation');
            }
        });
    },
    
    /**
     * Render the planting calendar
     * @param {Date} date - Date to center calendar on (defaults to current month)
     */
    renderPlantingCalendar(date = new Date()) {
        const calendarElement = document.getElementById('planting-calendar');
        if (!calendarElement) return;
        
        // Get current month and year
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        
        // Month names
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Get recommendations based on profile zone
        const recommendations = this.profile ? this.profile.getPlantingRecommendations() : {};
        
        // Determine season for current month
        let season = '';
        if (currentMonth >= 2 && currentMonth <= 4) season = 'earlySpring';
        else if (currentMonth >= 5 && currentMonth <= 6) season = 'lateSpring';
        else if (currentMonth >= 7 && currentMonth <= 8) season = 'summer';
        else if (currentMonth >= 9 && currentMonth <= 10) season = 'fall';
        else season = 'winter';
        
        // Render calendar header
        calendarElement.innerHTML = `
            <div class="calendar-header">
                <button id="prev-month" class="calendar-nav-btn">&lt;</button>
                <h3>${monthNames[currentMonth]} ${currentYear}</h3>
                <button id="next-month" class="calendar-nav-btn">&gt;</button>
            </div>
            
            <div class="season-indicator">${this.formatSeason(season)}</div>
            
            <div class="planting-recommendations">
                <h4>Recommended for Planting</h4>
                <ul class="recommendation-list">
                    ${this.renderRecommendationsList(recommendations[season])}
                </ul>
            </div>
            
            <div class="calendar-plants">
                <h4>Plants Ready to Work With</h4>
                <div class="plant-timeline">
                    ${this.renderPlantTimeline(currentMonth + 1)}
                </div>
            </div>
        `;
        
        // Add event listeners for calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.navigateCalendar(-1);
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.navigateCalendar(1);
        });
    },
    
    /**
     * Navigate the calendar forward or backward
     * @param {number} direction - Direction to navigate (-1 for backward, 1 for forward)
     */
    navigateCalendar(direction) {
        // Get current displayed month
        const headerText = document.querySelector('.calendar-header h3').textContent;
        const [monthName, year] = headerText.split(' ');
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        const monthIndex = monthNames.indexOf(monthName);
        const currentYear = parseInt(year, 10);
        
        // Calculate new date
        let newMonth = monthIndex + direction;
        let newYear = currentYear;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        const newDate = new Date(newYear, newMonth, 1);
        this.renderPlantingCalendar(newDate);
    },
    
    /**
     * Render the weather widget
     */
    renderWeatherWidget() {
        const weatherElement = document.getElementById('weather-widget');
        if (!weatherElement) return;
        
        // Default loading state
        weatherElement.innerHTML = `
            <div class="weather-header">
                <h3>Weather Outlook</h3>
                <div class="location">${this.profile ? this.profile.location : 'Your Location'}</div>
            </div>
            <div class="weather-content">
                <div class="loading-spinner">Loading weather data...</div>
            </div>
        `;
    },
    
    /**
     * Load weather data
     * In a real app, this would fetch from a weather API
     */
    loadWeatherData() {
        // Simulate API call with timeout
        setTimeout(() => {
            // Mock weather data - in a real app, this would come from an API
            this.weatherData = {
                current: {
                    temp: 72,
                    condition: 'Partly Cloudy',
                    humidity: 65,
                    windSpeed: 8
                },
                forecast: [
                    { day: 'Today', high: 75, low: 62, condition: 'Partly Cloudy' },
                    { day: 'Tomorrow', high: 77, low: 63, condition: 'Sunny' },
                    { day: 'Wednesday', high: 80, low: 65, condition: 'Sunny' },
                    { day: 'Thursday', high: 82, low: 67, condition: 'Clear' },
                    { day: 'Friday', high: 79, low: 66, condition: 'Partly Cloudy' }
                ],
                gardenTips: [
                    'Perfect conditions for watering in the evening',
                    'Consider adding mulch to retain moisture',
                    'Good week for transplanting seedlings'
                ]
            };
            
            this.updateWeatherWidget();
        }, 1500);
    },
    
    /**
     * Update the weather widget with loaded data
     */
    updateWeatherWidget() {
        const weatherElement = document.getElementById('weather-widget');
        if (!weatherElement || !this.weatherData) return;
        
        weatherElement.innerHTML = `
            <div class="weather-header">
                <h3>Weather Outlook</h3>
                <div class="location">${this.profile ? this.profile.location : 'Your Location'}</div>
            </div>
            
            <div class="current-weather">
                <div class="temp">${this.weatherData.current.temp}°F</div>
                <div class="condition">${this.weatherData.current.condition}</div>
                <div class="weather-details">
                    <div class="detail">Humidity: ${this.weatherData.current.humidity}%</div>
                    <div class="detail">Wind: ${this.weatherData.current.windSpeed} mph</div>
                </div>
            </div>
            
            <div class="forecast">
                ${this.weatherData.forecast.slice(1, 4).map(day => `
                    <div class="forecast-day">
                        <div class="day">${day.day}</div>
                        <div class="temps">${day.high}° / ${day.low}°</div>
                        <div class="condition">${day.condition}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="garden-tips">
                <h4>Garden Tips</h4>
                <ul>
                    ${this.weatherData.gardenTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    },
    
    /**
     * Show profile edit form
     */
    showProfileEdit() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Profile</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-profile-form" class="profile-form">
                        <div class="form-group">
                            <label for="edit-name">Name</label>
                            <input type="text" id="edit-name" value="${this.profile.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-location">Location</label>
                            <input type="text" id="edit-location" value="${this.profile.location}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-growing-zone">Growing Zone</label>
                            <select id="edit-growing-zone" required>
                                ${Array.from({length: 13}, (_, i) => i + 1).map(zone => 
                                    `<option value="${zone}" ${this.profile.zone == zone ? 'selected' : ''}>Zone ${zone}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-garden-size">Garden Size</label>
                            <select id="edit-garden-size">
                                <option value="small" ${this.profile.gardenSize === 'small' ? 'selected' : ''}>Small</option>
                                <option value="medium" ${this.profile.gardenSize === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="large" ${this.profile.gardenSize === 'large' ? 'selected' : ''}>Large</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-experience-level">Experience Level</label>
                            <select id="edit-experience-level">
                                <option value="beginner" ${this.profile.experience === 'beginner' ? 'selected' : ''}>Beginner</option>
                                <option value="intermediate" ${this.profile.experience === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                <option value="advanced" ${this.profile.experience === 'advanced' ? 'selected' : ''}>Advanced</option>
                            </select>
                        </div>
                        
                        <div class="form-group preferences-group">
                            <label>Preferences</label>
                            <div class="checkbox-group">
                                <label>
                                    <input type="checkbox" id="pref-organic" ${this.profile.preferences.organic ? 'checked' : ''}>
                                    Organic Growing
                                </label>
                                <label>
                                    <input type="checkbox" id="pref-water" ${this.profile.preferences.waterConservation ? 'checked' : ''}>
                                    Water Conservation
                                </label>
                                <label>
                                    <input type="checkbox" id="pref-maintenance" ${this.profile.preferences.lowMaintenance ? 'checked' : ''}>
                                    Low Maintenance
                                </label>
                                <label>
                                    <input type="checkbox" id="pref-child" ${this.profile.preferences.childFriendly ? 'checked' : ''}>
                                    Child Friendly
                                </label>
                                <label>
                                    <input type="checkbox" id="pref-pollinator" ${this.profile.preferences.pollinatorFriendly ? 'checked' : ''}>
                                    Pollinator Friendly
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfileChanges(modal);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },
    
    /**
     * Save profile changes
     * @param {HTMLElement} modal - The modal element
     */
    saveProfileChanges(modal) {
        // Get form values
        const name = modal.querySelector('#edit-name').value;
        const location = modal.querySelector('#edit-location').value;
        const zone = modal.querySelector('#edit-growing-zone').value;
        const gardenSize = modal.querySelector('#edit-garden-size').value;
        const experience = modal.querySelector('#edit-experience-level').value;
        
        // Get preferences
        const preferences = {
            organic: modal.querySelector('#pref-organic').checked,
            waterConservation: modal.querySelector('#pref-water').checked,
            lowMaintenance: modal.querySelector('#pref-maintenance').checked,
            childFriendly: modal.querySelector('#pref-child').checked,
            pollinatorFriendly: modal.querySelector('#pref-pollinator').checked
        };
        
        // Update profile
        this.profile.name = name;
        this.profile.location = location;
        this.profile.zone = zone;
        this.profile.gardenSize = gardenSize;
        this.profile.experience = experience;
        this.profile.preferences = preferences;
        
        // Save to local storage
        this.profile.save();
        
        // Close modal
        document.body.removeChild(modal);
        
        // Update the dashboard
        this.renderProfile();
        this.renderPlantingCalendar();
        
        // Show confirmation
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Profile updated successfully!';
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
     * Render list of planting recommendations
     * @param {Array} recommendations - Array of recommendation strings
     * @returns {string} HTML for recommendations list
     */
    renderRecommendationsList(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            return '<li>No specific recommendations for this period</li>';
        }
        
        return recommendations.map(rec => `<li>${rec}</li>`).join('');
    },
    
    /**
     * Render timeline of plants for a given month
     * @param {number} month - Month number (1-12)
     * @returns {string} HTML for plant timeline
     */
    renderPlantTimeline(month) {
        // Get plants suitable for the user's zone
        const zoneSuitablePlants = window.PlantsData ? 
            window.PlantsData.getByZone(parseInt(this.profile.zone, 10)) : [];
        
        // Filter plants by current month
        const plantingPlants = window.PlantsData ? 
            window.PlantsData.getByPlantingMonth(month) : [];
        
        const harvestingPlants = window.PlantsData ? 
            window.PlantsData.getByHarvestMonth(month) : [];
        
        // Combine and get unique plants
        const plants = [...new Set([...plantingPlants, ...harvestingPlants])];
        
        if (plants.length === 0) {
            return '<p>No plants to work with this month</p>';
        }
        
        return `
            <div class="timeline-activities">
                <div class="activity planting">
                    <h5>Planting</h5>
                    <div class="plant-list">
                        ${plantingPlants.slice(0, 5).map(plant => `
                            <div class="plant-chip">
                                <div class="plant-color" style="background-color: ${this.getPlantColor(plant)}"></div>
                                <span>${plant.name}</span>
                            </div>
                        `).join('')}
                        ${plantingPlants.length > 5 ? `<div class="more-plants">+${plantingPlants.length - 5} more</div>` : ''}
                    </div>
                </div>
                
                <div class="activity harvesting">
                    <h5>Harvesting</h5>
                    <div class="plant-list">
                        ${harvestingPlants.slice(0, 5).map(plant => `
                            <div class="plant-chip">
                                <div class="plant-color" style="background-color: ${this.getPlantColor(plant)}"></div>
                                <span>${plant.name}</span>
                            </div>
                        `).join('')}
                        ${harvestingPlants.length > 5 ? `<div class="more-plants">+${harvestingPlants.length - 5} more</div>` : ''}
                    </div>
                </div>
            </div>
            
            <button id="view-all-plants-btn" class="btn btn-small">View All Plants</button>
        `;
    },
    
    /**
     * Format a date string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },
    
    /**
     * Format season name for display
     * @param {string} season - Season key
     * @returns {string} Formatted season name
     */
    formatSeason(season) {
        const seasons = {
            'earlySpring': 'Early Spring',
            'lateSpring': 'Late Spring',
            'summer': 'Summer',
            'fall': 'Fall',
            'winter': 'Winter'
        };
        
        return seasons[season] || season;
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
    }
};

// Export the dashboard controller
window.DashboardController = DashboardController;