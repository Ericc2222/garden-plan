/**
 * Hardiness Zones Data
 * Contains information about USDA plant hardiness zones
 */
const ZonesData = {
    // Zone data
    1: {
        minTemp: '-60°F to -50°F',
        season: 'Very Short',
        description: 'Extremely cold winter temperatures, very short growing season.',
        examples: 'Parts of Alaska',
        firstFrost: 'August',
        lastFrost: 'June',
        growingSeason: '1-2 months'
    },
    2: {
        minTemp: '-50°F to -40°F',
        season: 'Very Short',
        description: 'Very cold winter temperatures, short growing season.',
        examples: 'Northern Alaska, northern Canada',
        firstFrost: 'Early September',
        lastFrost: 'Late May',
        growingSeason: '2-3 months'
    },
    3: {
        minTemp: '-40°F to -30°F',
        season: 'Short',
        description: 'Cold winters with late spring and early fall frosts.',
        examples: 'North Dakota, Minnesota, northern Maine',
        firstFrost: 'Mid-September',
        lastFrost: 'Mid-May',
        growingSeason: '3-4 months'
    },
    4: {
        minTemp: '-30°F to -20°F',
        season: 'Short',
        description: 'Cold winters but longer growing season than zone 3.',
        examples: 'Northern New England, northern New York, Michigan Upper Peninsula',
        firstFrost: 'Late September',
        lastFrost: 'Early May',
        growingSeason: '4-5 months'
    },
    5: {
        minTemp: '-20°F to -10°F',
        season: 'Medium',
        description: 'Moderately cold winters, distinct four seasons.',
        examples: 'Southern New England, Great Lakes region, Iowa',
        firstFrost: 'Early October',
        lastFrost: 'Late April',
        growingSeason: '5-6 months'
    },
    6: {
        minTemp: '-10°F to 0°F',
        season: 'Medium',
        description: 'Moderate winters, good growing season.',
        examples: 'Ohio, Pennsylvania, New Jersey, Missouri',
        firstFrost: 'Mid-October',
        lastFrost: 'Mid-April',
        growingSeason: '6 months'
    },
    7: {
        minTemp: '0°F to 10°F',
        season: 'Long',
        description: 'Mild winters, long growing season.',
        examples: 'Virginia, Tennessee, Oklahoma, northern Texas',
        firstFrost: 'Late October',
        lastFrost: 'Early April',
        growingSeason: '7 months'
    },
    8: {
        minTemp: '10°F to 20°F',
        season: 'Long',
        description: 'Mild winters with occasional brief freezes, extended growing season.',
        examples: 'Georgia, Texas, Arizona, coastal California',
        firstFrost: 'November',
        lastFrost: 'March',
        growingSeason: '8-9 months'
    },
    9: {
        minTemp: '20°F to 30°F',
        season: 'Very Long',
        description: 'Very mild winters, rare freezes, very long growing season.',
        examples: 'Florida, southern Texas, southern California',
        firstFrost: 'December',
        lastFrost: 'February',
        growingSeason: '9-10 months'
    },
    10: {
        minTemp: '30°F to 40°F',
        season: 'Very Long',
        description: 'Mild winters with no sustained freezes.',
        examples: 'Southern Florida, southern California, Hawaii (coastal)',
        firstFrost: 'Rare',
        lastFrost: 'Rare',
        growingSeason: '10-11 months'
    },
    11: {
        minTemp: '40°F to 50°F',
        season: 'Almost Year-round',
        description: 'Warm year-round with minimal temperature fluctuation.',
        examples: 'Hawaii, Puerto Rico, southern Florida',
        firstFrost: 'None',
        lastFrost: 'None',
        growingSeason: '11-12 months'
    },
    12: {
        minTemp: '50°F to 60°F',
        season: 'Year-round',
        description: 'Tropical climate with warm temperatures year-round.',
        examples: 'Hawaii, Puerto Rico (lower elevations)',
        firstFrost: 'None',
        lastFrost: 'None',
        growingSeason: '12 months'
    },
    13: {
        minTemp: '60°F and Above',
        season: 'Year-round',
        description: 'Consistently warm tropical climate.',
        examples: 'Hawaii (lowest elevations), Puerto Rico (coastal)',
        firstFrost: 'None',
        lastFrost: 'None',
        growingSeason: '12 months'
    },
    
    /**
     * Get zone information by zone number
     * @param {number} zone - Zone number (1-13)
     * @returns {Object|null} Zone information or null if not found
     */
    getZoneInfo(zone) {
        const zoneNumber = parseInt(zone, 10);
        return this[zoneNumber] || null;
    },
    
    /**
     * Get growing season length in months
     * @param {number} zone - Zone number (1-13)
     * @returns {number} Approximate growing season length in months
     */
    getGrowingSeasonMonths(zone) {
        const zoneNumber = parseInt(zone, 10);
        const info = this[zoneNumber];
        
        if (!info) return 0;
        
        // Parse growing season string
        const match = info.growingSeason.match(/(\d+)(?:-(\d+))?/);
        if (!match) return 0;
        
        // If range, take average
        if (match[2]) {
            return (parseInt(match[1], 10) + parseInt(match[2], 10)) / 2;
        }
        
        return parseInt(match[1], 10);
    },
    
    /**
     * Get recommended plants for a zone
     * @param {number} zone - Zone number (1-13)
     * @returns {Object} Recommended plants by category
     */
    getRecommendedPlants(zone) {
        // This would typically come from a database
        // Simplified example with common plants by zone
        const zoneNumber = parseInt(zone, 10);
        
        const recommendations = {
            vegetables: [],
            fruits: [],
            herbs: [],
            flowers: []
        };
        
        // Cold climate (Zones 1-3)
        if (zoneNumber >= 1 && zoneNumber <= 3) {
            recommendations.vegetables = ['Cabbage', 'Kale', 'Potatoes', 'Carrots', 'Radishes'];
            recommendations.fruits = ['Raspberries', 'Currants'];
            recommendations.herbs = ['Chives', 'Mint'];
            recommendations.flowers = ['Sunflowers', 'Marigolds', 'Pansies'];
        }
        // Cool climate (Zones 4-5)
        else if (zoneNumber >= 4 && zoneNumber <= 5) {
            recommendations.vegetables = ['Broccoli', 'Spinach', 'Peas', 'Lettuce', 'Beets'];
            recommendations.fruits = ['Apples', 'Cherries', 'Plums', 'Strawberries'];
            recommendations.herbs = ['Parsley', 'Thyme', 'Sage'];
            recommendations.flowers = ['Daffodils', 'Tulips', 'Black-eyed Susans'];
        }
        // Moderate climate (Zones 6-7)
        else if (zoneNumber >= 6 && zoneNumber <= 7) {
            recommendations.vegetables = ['Tomatoes', 'Peppers', 'Cucumbers', 'Squash', 'Corn'];
            recommendations.fruits = ['Peaches', 'Pears', 'Grapes', 'Blackberries'];
            recommendations.herbs = ['Basil', 'Rosemary', 'Oregano', 'Cilantro'];
            recommendations.flowers = ['Roses', 'Zinnias', 'Coneflowers', 'Lavender'];
        }
        // Warm climate (Zones 8-9)
        else if (zoneNumber >= 8 && zoneNumber <= 9) {
            recommendations.vegetables = ['Okra', 'Sweet Potatoes', 'Eggplant', 'Melons', 'Pumpkins'];
            recommendations.fruits = ['Figs', 'Oranges', 'Lemons', 'Limes', 'Pomegranates'];
            recommendations.herbs = ['Lemongrass', 'Bay Laurel', 'Mexican Tarragon'];
            recommendations.flowers = ['Hibiscus', 'Lantana', 'Salvia', 'Bougainvillea'];
        }
        // Hot climate (Zones 10-13)
        else if (zoneNumber >= 10) {
            recommendations.vegetables = ['Cassava', 'Ginger', 'Turmeric', 'Long Beans', 'Okra'];
            recommendations.fruits = ['Bananas', 'Mangoes', 'Papayas', 'Avocados', 'Pineapples'];
            recommendations.herbs = ['Curry Leaf', 'Lemongrass', 'Vietnamese Coriander'];
            recommendations.flowers = ['Bird of Paradise', 'Plumeria', 'Orchids', 'Passionflower'];
        }
        
        return recommendations;
    },
    
    /**
     * Get planting calendar for a zone
     * @param {number} zone - Zone number (1-13)
     * @returns {Object} Monthly planting guide
     */
    getPlantingCalendar(zone) {
        const zoneNumber = parseInt(zone, 10);
        const calendar = {};
        
        // Initialize months
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        
        months.forEach(month => {
            calendar[month] = {
                plant: [],
                maintain: [],
                harvest: []
            };
        });
        
        // Very cold zones (1-3)
        if (zoneNumber >= 1 && zoneNumber <= 3) {
            // Limited outdoor growing season
            calendar['January'].maintain = ['Plan garden', 'Order seeds'];
            calendar['February'].plant = ['Start seedlings indoors'];
            calendar['March'].plant = ['Continue indoor seedlings'];
            calendar['April'].plant = ['Cold-hardy seedlings'];
            calendar['May'].plant = ['Cold-hardy plants', 'Late spring crops'];
            calendar['June'].plant = ['All remaining crops'];
            calendar['June'].maintain = ['Weed control', 'Watering'];
            calendar['July'].maintain = ['Watering', 'Pest control'];
            calendar['July'].harvest = ['Early vegetables'];
            calendar['August'].maintain = ['Watering', 'Pest control'];
            calendar['August'].harvest = ['Main harvest period'];
            calendar['September'].harvest = ['Final harvests', 'Preserve'];
            calendar['October'].maintain = ['Clean up garden', 'Compost'];
            calendar['November'].maintain = ['Prepare soil for next year'];
            calendar['December'].maintain = ['Plan for next season'];
        }
        // Cool zones (4-5)
        else if (zoneNumber >= 4 && zoneNumber <= 5) {
            calendar['January'].maintain = ['Plan garden', 'Order seeds'];
            calendar['February'].plant = ['Start seedlings indoors'];
            calendar['March'].plant = ['Cool-season crops indoors'];
            calendar['April'].plant = ['Cool-season crops outdoors', 'Potatoes'];
            calendar['May'].plant = ['Warm-season seedlings', 'Direct sow hardy plants'];
            calendar['June'].plant = ['All remaining crops'];
            calendar['June'].maintain = ['Weeding', 'Watering'];
            calendar['July'].maintain = ['Watering', 'Pest control'];
            calendar['July'].harvest = ['Early vegetables'];
            calendar['August'].harvest = ['Main harvest period'];
            calendar['August'].plant = ['Fall crops'];
            calendar['September'].harvest = ['Main harvest period'];
            calendar['September'].plant = ['Cover crops', 'Garlic'];
            calendar['October'].harvest = ['Late season crops'];
            calendar['October'].maintain = ['Garden cleanup'];
            calendar['November'].maintain = ['Final cleanup', 'Soil amendments'];
            calendar['December'].maintain = ['Plan for next season'];
        }
        // Moderate zones (6-7)
        else if (zoneNumber >= 6 && zoneNumber <= 7) {
            calendar['January'].plant = ['Plan garden', 'Order seeds'];
            calendar['February'].plant = ['Start seedlings indoors', 'Peas'];
            calendar['March'].plant = ['Cool-season crops', 'Root vegetables'];
            calendar['April'].plant = ['Cold-sensitive seedlings', 'Greens'];
            calendar['May'].plant = ['Warm-season crops', 'Tomatoes', 'Peppers'];
            calendar['June'].plant = ['Heat-loving crops', 'Succession plantings'];
            calendar['June'].harvest = ['Spring crops'];
            calendar['July'].maintain = ['Watering', 'Pest control'];
            calendar['July'].harvest = ['Early summer crops'];
            calendar['August'].harvest = ['Summer vegetables'];
            calendar['August'].plant = ['Fall crops'];
            calendar['September'].harvest = ['Main harvest period'];
            calendar['September'].plant = ['Cover crops', 'Garlic', 'Greens'];
            calendar['October'].harvest = ['Late season crops'];
            calendar['October'].plant = ['Overwintering crops'];
            calendar['November'].maintain = ['Garden cleanup', 'Compost'];
            calendar['December'].maintain = ['Plan for next season'];
        }
        // Warm zones (8-9)
        else if (zoneNumber >= 8 && zoneNumber <= 9) {
            calendar['January'].plant = ['Cool-season crops', 'Early spring vegetables'];
            calendar['February'].plant = ['Spring vegetables', 'Potatoes'];
            calendar['March'].plant = ['Warm-season crops'];
            calendar['April'].plant = ['Heat-loving crops', 'Sweet potatoes'];
            calendar['April'].harvest = ['Cool-season crops'];
            calendar['May'].plant = ['Tropical plants', 'Melons'];
            calendar['May'].harvest = ['Spring vegetables'];
            calendar['June'].maintain = ['Watering', 'Heat protection'];
            calendar['June'].harvest = ['Early summer crops'];
            calendar['July'].maintain = ['Heat protection', 'Watering'];
            calendar['July'].harvest = ['Summer vegetables'];
            calendar['August'].plant = ['Fall garden planning'];
            calendar['August'].harvest = ['Summer crops'];
            calendar['September'].plant = ['Fall crops', 'Second season'];
            calendar['October'].plant = ['Cool-season crops', 'Greens'];
            calendar['November'].plant = ['Cool-season crops', 'Root vegetables'];
            calendar['December'].plant = ['Winter vegetables'];
            calendar['December'].harvest = ['Hardy winter crops'];
        }
        // Hot zones (10-13)
        else if (zoneNumber >= 10) {
            calendar['January'].plant = ['Cool-season crops'];
            calendar['January'].harvest = ['Winter vegetables'];
            calendar['February'].plant = ['Spring vegetables'];
            calendar['February'].harvest = ['Winter crops'];
            calendar['March'].plant = ['Warm-season crops'];
            calendar['March'].harvest = ['Cool-season crops'];
            calendar['April'].plant = ['Heat-loving crops'];
            calendar['April'].harvest = ['Spring vegetables'];
            calendar['May'].maintain = ['Heat protection', 'Irrigation'];
            calendar['May'].harvest = ['Spring crops'];
            calendar['June'].maintain = ['Heat protection', 'Pest control'];
            calendar['July'].maintain = ['Heat protection', 'Water conservation'];
            calendar['August'].maintain = ['Heat protection', 'Preparation for fall'];
            calendar['September'].plant = ['Fall vegetables'];
            calendar['September'].maintain = ['Soil preparation'];
            calendar['October'].plant = ['Cool-season crops'];
            calendar['November'].plant = ['Winter vegetables'];
            calendar['November'].harvest = ['Fall crops'];
            calendar['December'].plant = ['Cool-season crops'];
            calendar['December'].harvest = ['Winter vegetables'];
        }
        
        return calendar;
    }
};

// Export the zones data
window.ZonesData = ZonesData;