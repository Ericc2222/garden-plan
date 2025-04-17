/**
 * Main application controller for the Garden Planner
 */
class App {
    constructor() {
        this.currentScreen = null;
        this.profile = null;
        this.garden = null;
        
        // Screen elements
        this.screens = {
            profileSetup: document.getElementById('profile-setup-screen'),
            dashboard: document.getElementById('dashboard-screen'),
            planner: document.getElementById('planner-screen'),
            simulation: document.getElementById('simulation-screen')
        };
        
        // Navigation elements
        this.navItems = document.querySelectorAll('.nav-item');
        
        // Initialize components when DOM is ready
        this.initializeEventListeners();
        this.loadSavedData();
        
        // Show the appropriate starting screen
        this.showStartingScreen();
    }
    
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Navigation event listeners
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const screenId = e.currentTarget.dataset.screen;
                if (screenId) {
                    this.showScreen(screenId);
                }
            });
        });
        
        // Profile setup form submission
        const profileForm = document.getElementById('profile-setup-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
                this.showScreen('dashboard');
            });
        }
        
        // Create garden button - check multiple IDs that might be used
        let createGardenBtn = document.getElementById('create-garden-btn');
        if (!createGardenBtn) {
            // Try alternate ID from dashboard
            createGardenBtn = document.getElementById('create-new-plan-btn');
        }
        
        if (createGardenBtn) {
            console.log("Found create garden button:", createGardenBtn);
            createGardenBtn.addEventListener('click', () => {
                console.log("Create garden button clicked");
                this.showScreen('planner');
            });
        } else {
            console.error("Create garden button not found!");
        }
        
        // Simulation button
        const simulateBtn = document.getElementById('simulate-btn');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                this.showScreen('simulation');
            });
        }
    }
    
    /**
     * Show the appropriate starting screen based on user data
     */
    showStartingScreen() {
        console.log('Starting screen, profile:', this.profile);
        
        // Add hidden class to all screens initially
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
            }
        });
        
        if (this.profile) {
            this.showScreen('dashboard');
        } else {
            this.showScreen('profile-setup');
        }
    }
    
    /**
     * Switch to a different screen
     * @param {string} screenId - The ID of the screen to show
     */
    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        
        // Normalize the screenId for more flexible matching
        const normalizedId = screenId.replace(/[-_\s]/g, '').toLowerCase();
        let targetScreenId = screenId;
        
        // Map common IDs to actual screen IDs
        if (normalizedId.includes('planner') || normalizedId.includes('garden')) {
            targetScreenId = 'planner';
        } else if (normalizedId.includes('dashboard') || normalizedId.includes('home')) {
            targetScreenId = 'dashboard';
        } else if (normalizedId.includes('profile') || normalizedId.includes('setup')) {
            targetScreenId = 'profileSetup';
        } else if (normalizedId.includes('simulation') || normalizedId.includes('simulate')) {
            targetScreenId = 'simulation';
        }
        
        console.log(`Normalized screen ID "${screenId}" to "${targetScreenId}"`);
        
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
                screen.classList.remove('active');
                // Ensure hidden with direct style
                screen.style.display = 'none';
            }
        });
        
        // Also hide all screens by class in case our object is not catching all of them
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
            // Ensure hidden with direct style
            screen.style.display = 'none';
        });
        
        // Try to find the screen first by direct ID match
        let screen = this.screens[targetScreenId];
        
        if (screen) {
            // Show the requested screen
            screen.classList.remove('hidden');
            screen.classList.add('active');
            // Ensure visible with direct style
            screen.style.display = 'block';
            screen.style.visibility = 'visible';
            
            this.currentScreen = targetScreenId;
            
            console.log('Screen element is now visible:', screen);
            
            // Update nav items
            this.navItems.forEach(item => {
                if (item.dataset.screen === targetScreenId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Initialize the screen if needed
            this.initializeScreen(targetScreenId);
            
            // Force immediate redraw
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 10);
        } else {
            console.error('Screen not found:', targetScreenId);
            
            // As a fallback, try to find and show any screen with a matching ID
            const screenElements = document.querySelectorAll('.screen');
            for (const element of screenElements) {
                if (element.id.toLowerCase().includes(normalizedId)) {
                    element.classList.remove('hidden');
                    element.classList.add('active');
                    element.style.display = 'block';
                    element.style.visibility = 'visible';
                    console.log('Fallback: found and showing screen with ID:', element.id);
                    
                    // Try to initialize the screen
                    if (element.id === 'planner-screen' && window.PlannerController) {
                        setTimeout(() => {
                            window.PlannerController.initialize(this.profile, this.garden);
                        }, 100);
                    }
                    
                    break;
                }
            }
        }
    }
    
    /**
     * Initialize screen-specific components
     * @param {string} screenId - The ID of the screen to initialize
     */
    initializeScreen(screenId) {
        switch(screenId) {
            case 'dashboard':
                if (window.DashboardController) {
                    console.log("Initializing dashboard with profile:", this.profile);
                    window.DashboardController.initialize(this.profile, this.garden);
                } else {
                    console.error("Dashboard controller not found!");
                }
                break;
            case 'planner':
                if (window.PlannerController) {
                    console.log("Initializing planner with profile:", this.profile);
                    window.PlannerController.initialize(this.profile, this.garden);
                    
                    // Force re-initialization after a short delay to ensure elements are ready
                    setTimeout(() => {
                        if (window.PlannerController && window.PlannerController.initGrid) {
                            console.log("Reinitializing planner grid after delay");
                            window.PlannerController.initGrid();
                        }
                    }, 200);
                } else {
                    console.error("Planner controller not found!");
                }
                break;
            case 'simulation':
                if (window.SimulationController) {
                    window.SimulationController.initialize(this.profile, this.garden);
                }
                break;
        }
    }
    
    /**
     * Save profile data from the form
     */
    saveProfile() {
        const form = document.getElementById('profile-setup-form');
        if (!form) return;
        
        // Get the zip code or location
        const zipCode = form.querySelector('#zip-code').value;
        
        // Get the zone
        const zone = form.querySelector('#hardiness-zone').value;
        
        // Get soil type
        const soilType = form.querySelector('#soil-type').value;
        
        // Get sun exposure
        const sunExposure = form.querySelector('#sun-exposure').value;
        
        // Get goals
        const goalsSelect = form.querySelector('#gardening-goals');
        const goals = Array.from(goalsSelect.selectedOptions).map(option => option.value);
        
        // Get experience level
        const experienceInputs = form.querySelectorAll('input[name="experience"]');
        let experience = 'beginner';
        experienceInputs.forEach(input => {
            if (input.checked) {
                experience = input.value;
            }
        });
        
        // Get name
        const name = form.querySelector('#gardener-name').value;
        
        // Create profile object
        try {
            this.profile = new Profile({
                name: name || "Gardener", // Use provided name or default to "Gardener"
                location: zipCode || "Your Location",
                zone: zone || "6", // Default to zone 6 if not selected
                soilType: soilType,
                sunExposure: sunExposure,
                experience: experience,
                goals: goals,
                created: new Date().toISOString(),
                preferences: {
                    organic: goals.includes('eco-friendly'),
                    waterConservation: goals.includes('eco-friendly'),
                    lowMaintenance: goals.includes('low-maintenance'),
                    childFriendly: false,
                    pollinatorFriendly: goals.includes('pollinators')
                }
            });
            
            // Save profile to local storage
            this.profile.save();
            console.log("Profile saved:", this.profile);
        } catch (error) {
            console.error("Error saving profile:", error);
            // Fallback to creating a simple profile object
            this.profile = {
                name: name || "Gardener",
                location: zipCode || "Your Location",
                zone: zone || "6",
                experience: experience,
                created: new Date().toISOString()
            };
            
            // Save to local storage directly
            localStorage.setItem('gardenProfile', JSON.stringify(this.profile));
            console.log("Fallback profile saved:", this.profile);
        }
        
        // Show dashboard regardless of save method
        console.log("Transitioning to dashboard...");
    }
    
    /**
     * Load saved data from local storage
     */
    loadSavedData() {
        // Load profile
        const profileData = localStorage.getItem('gardenProfile');
        if (profileData) {
            try {
                this.profile = JSON.parse(profileData);
            } catch (e) {
                console.error('Error loading profile data', e);
            }
        }
        
        // Load garden data
        const gardenData = localStorage.getItem('gardenData');
        if (gardenData) {
            try {
                this.garden = JSON.parse(gardenData);
            } catch (e) {
                console.error('Error loading garden data', e);
            }
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GardenApp = new App();
});