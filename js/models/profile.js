/**
 * User Profile Model
 * Manages the user's profile information and preferences
 */
class Profile {
    constructor(data = {}) {
        this.name = data.name || '';
        this.location = data.location || '';
        this.gardenSize = data.gardenSize || 'medium';
        this.zone = data.zone || '';
        this.experience = data.experience || 'beginner';
        this.created = data.created || new Date().toISOString();
        this.preferences = data.preferences || {
            organic: true,
            waterConservation: false,
            lowMaintenance: false,
            childFriendly: false,
            pollinatorFriendly: true
        };
    }
    
    /**
     * Get the profile as a plain object for storage
     * @returns {Object} Plain object representation of the profile
     */
    toJSON() {
        return {
            name: this.name,
            location: this.location,
            gardenSize: this.gardenSize,
            zone: this.zone,
            experience: this.experience,
            created: this.created,
            preferences: this.preferences
        };
    }
    
    /**
     * Create a Profile instance from stored data
     * @param {string} jsonString - JSON string of profile data
     * @returns {Profile} A new Profile instance
     */
    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return new Profile(data);
        } catch (e) {
            console.error('Error parsing profile data', e);
            return new Profile();
        }
    }
    
    /**
     * Save the profile to local storage
     */
    save() {
        localStorage.setItem('gardenProfile', JSON.stringify(this.toJSON()));
    }
    
    /**
     * Load profile from local storage
     * @returns {Profile|null} The loaded profile or null if none exists
     */
    static load() {
        const data = localStorage.getItem('gardenProfile');
        return data ? Profile.fromJSON(data) : null;
    }
    
    /**
     * Get the experience level as a formatted string
     * @returns {string} Formatted experience level
     */
    getExperienceLevel() {
        const levels = {
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced'
        };
        
        return levels[this.experience] || 'Beginner';
    }
    
    /**
     * Get growing zone information
     * @returns {Object} Zone information with description
     */
    getZoneInfo() {
        // This would typically come from a database or API
        // Simplified version for demonstration
        const zoneInfo = {
            '1': { minTemp: '-60°F to -50°F', season: 'Very Short' },
            '2': { minTemp: '-50°F to -40°F', season: 'Very Short' },
            '3': { minTemp: '-40°F to -30°F', season: 'Short' },
            '4': { minTemp: '-30°F to -20°F', season: 'Short' },
            '5': { minTemp: '-20°F to -10°F', season: 'Medium' },
            '6': { minTemp: '-10°F to 0°F', season: 'Medium' },
            '7': { minTemp: '0°F to 10°F', season: 'Long' },
            '8': { minTemp: '10°F to 20°F', season: 'Long' },
            '9': { minTemp: '20°F to 30°F', season: 'Very Long' },
            '10': { minTemp: '30°F to 40°F', season: 'Very Long' },
            '11': { minTemp: '40°F to 50°F', season: 'Almost Year-round' },
            '12': { minTemp: '50°F to 60°F', season: 'Year-round' },
            '13': { minTemp: '60°F and Above', season: 'Year-round' }
        };
        
        return zoneInfo[this.zone] || { minTemp: 'Unknown', season: 'Unknown' };
    }
    
    /**
     * Gets weather-related planting recommendations based on zone
     * @returns {Object} Planting recommendations
     */
    getPlantingRecommendations() {
        // This would typically come from an API or more sophisticated calculation
        // Simplified version for demonstration
        const recommendations = {
            earlySpring: [],
            lateSpring: [],
            summer: [],
            fall: [],
            winter: []
        };
        
        // Example logic for recommendations based on zone
        const zone = parseInt(this.zone, 10);
        
        if (zone >= 1 && zone <= 4) {
            recommendations.earlySpring.push('Cold-hardy crops like spinach and peas');
            recommendations.lateSpring.push('Root vegetables like carrots and beets');
            recommendations.summer.push('Quick-growing crops like lettuce and radishes');
            recommendations.fall.push('Cold-tolerant greens');
            recommendations.winter.push('Indoor gardening only');
        } else if (zone >= 5 && zone <= 7) {
            recommendations.earlySpring.push('Broccoli, cabbage, and cool-season crops');
            recommendations.lateSpring.push('Tomatoes and peppers after last frost');
            recommendations.summer.push('Most common garden vegetables');
            recommendations.fall.push('Second crop of cool-season vegetables');
            recommendations.winter.push('Winter greens with protection');
        } else if (zone >= 8 && zone <= 10) {
            recommendations.earlySpring.push('Early tomatoes and warm-season crops');
            recommendations.lateSpring.push('Heat-loving crops like melons and eggplant');
            recommendations.summer.push('Heat-tolerant varieties and tropical plants');
            recommendations.fall.push('Fall crop of many vegetables');
            recommendations.winter.push('Cool-season crops like broccoli and greens');
        } else if (zone >= 11) {
            recommendations.earlySpring.push('Tropical fruits and vegetables');
            recommendations.lateSpring.push('Heat-loving crops and tropical varieties');
            recommendations.summer.push('Heat and humidity tolerant varieties');
            recommendations.fall.push('Second crop of warm-season vegetables');
            recommendations.winter.push('Most crops can grow year-round');
        }
        
        return recommendations;
    }
}

// Export the Profile class
window.Profile = Profile;