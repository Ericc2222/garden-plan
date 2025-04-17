/**
 * Application Constants
 * Contains constants used throughout the garden planner application
 */

// Soil Types
const SOIL_TYPES = {
    SANDY: 'sandy',
    CLAY: 'clay',
    LOAMY: 'loamy',
    SILTY: 'silty',
    PEATY: 'peaty',
    CHALKY: 'chalky',
    REGULAR: 'regular', // Generic soil type
    RICH: 'rich' // Nutrient-rich soil
};

// Sunlight Levels
const SUNLIGHT_LEVELS = {
    FULL: 'full', // 6+ hours direct sunlight
    PARTIAL: 'partial', // 4-6 hours direct sunlight
    SHADE: 'shade', // Less than 4 hours direct sunlight
    FULL_SHADE: 'full-shade' // Less than 2 hours direct sunlight
};

// Moisture Levels
const MOISTURE_LEVELS = {
    DRY: 'dry',
    NORMAL: 'normal',
    MOIST: 'moist',
    WET: 'wet'
};

// Plant Categories
const PLANT_CATEGORIES = {
    VEGETABLE: 'vegetable',
    HERB: 'herb',
    FRUIT: 'fruit',
    FLOWER: 'flower',
    SHRUB: 'shrub',
    TREE: 'tree',
    GROUND_COVER: 'ground-cover',
    NATIVE: 'native'
};

// Experience Levels
const EXPERIENCE_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
};

// Seasons
const SEASONS = {
    SPRING: 'spring',
    SUMMER: 'summer',
    FALL: 'fall',
    WINTER: 'winter'
};

// Garden Size Options
const GARDEN_SIZES = {
    SMALL: 'small', // Up to 100 sq ft
    MEDIUM: 'medium', // 100-300 sq ft
    LARGE: 'large' // 300+ sq ft
};

// Garden Tools
const GARDEN_TOOLS = {
    SELECT: 'select',
    PLANT: 'plant',
    REMOVE: 'remove',
    SOIL: 'soil',
    ZONE: 'zone',
    WATER: 'water',
    SUNLIGHT: 'sunlight'
};

// Color Palette
const COLORS = {
    // Primary Theme Colors
    PRIMARY: '#4CAF50',
    SECONDARY: '#2196F3',
    ACCENT: '#FF9800',
    
    // UI Colors
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F5F5F5',
    BORDER: '#E0E0E0',
    
    // Text Colors
    TEXT_PRIMARY: '#212121',
    TEXT_SECONDARY: '#757575',
    TEXT_HINT: '#9E9E9E',
    
    // Status Colors
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    INFO: '#2196F3',
    
    // Plant Category Colors
    VEGETABLE_COLOR: '#4CAF50', // Green
    HERB_COLOR: '#9C27B0',      // Purple
    FRUIT_COLOR: '#F44336',     // Red
    FLOWER_COLOR: '#FF9800',    // Orange
    SHRUB_COLOR: '#795548',     // Brown
    TREE_COLOR: '#3F51B5',      // Indigo
    GROUND_COVER_COLOR: '#009688', // Teal
    NATIVE_COLOR: '#8BC34A'     // Light Green
};

// Time Constants
const TIME = {
    SIMULATION_SPEED: {
        SLOW: 2000,
        NORMAL: 1000,
        FAST: 500
    },
    MONTH_NAMES: ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'],
    MONTH_SHORT_NAMES: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    DAY_NAMES: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    DAY_SHORT_NAMES: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

// Default Garden Grid Dimensions
const DEFAULT_GRID = {
    WIDTH: 10,
    HEIGHT: 10,
    CELL_SIZE: 40 // pixels
};

// Local Storage Keys
const STORAGE_KEYS = {
    PROFILE: 'gardenProfile',
    GARDEN: 'gardenData',
    SETTINGS: 'gardenSettings',
    RECENT_PLANS: 'recentPlans'
};

// Export constants
window.SOIL_TYPES = SOIL_TYPES;
window.SUNLIGHT_LEVELS = SUNLIGHT_LEVELS;
window.MOISTURE_LEVELS = MOISTURE_LEVELS;
window.PLANT_CATEGORIES = PLANT_CATEGORIES;
window.EXPERIENCE_LEVELS = EXPERIENCE_LEVELS;
window.SEASONS = SEASONS;
window.GARDEN_SIZES = GARDEN_SIZES;
window.GARDEN_TOOLS = GARDEN_TOOLS;
window.COLORS = COLORS;
window.TIME = TIME;
window.DEFAULT_GRID = DEFAULT_GRID;
window.STORAGE_KEYS = STORAGE_KEYS;