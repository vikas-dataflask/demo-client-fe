/**
 * Generate a unique ID for floors
 * @returns {string} - Unique ID
 */
export const generateFloorId = () => {
  return `floor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get floor level name based on level number
 * @param {number} level - Floor level (0, 1, 2, etc.)
 * @returns {string} - Floor level name
 */
export const getFloorLevelName = (level) => {
  switch (level) {
    case 0:
      return 'Ground Floor';
    case 1:
      return 'First Floor';
    case 2:
      return 'Second Floor';
    case 3:
      return 'Third Floor';
    case 4:
      return 'Fourth Floor';
    case 5:
      return 'Fifth Floor';
    default:
      return `${level}th Floor`;
  }
};

/**
 * Get floor display name with level
 * @param {string} name - Floor name
 * @param {number} level - Floor level
 * @returns {string} - Display name
 */
export const getFloorDisplayName = (name, level) => {
  const levelName = getFloorLevelName(level);
  return `${name} (Level ${level})`;
};

/**
 * Create a new floor object
 * @param {string} name - Floor name
 * @param {number} level - Floor level
 * @param {number} height - Floor height in mm
 * @returns {Object} - New floor object
 */
export const createNewFloor = (name, level, height = 3200) => {
  const floorName = name || getFloorLevelName(level);
  return {
    id: generateFloorId(),
    name: floorName,
    description: `${floorName} - Level ${level} floor`,
    level: level,
    height: height,
    shapes: [],
    canvasSettings: {
      scale: 1,
      position: { x: 0, y: 0 },
      grid: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Sort floors by level
 * @param {Array} floors - Array of floor objects
 * @returns {Array} - Sorted floors array
 */
export const sortFloorsByLevel = (floors) => {
  return [...floors].sort((a, b) => a.level - b.level);
};

/**
 * Get next available floor level
 * @param {Array} floors - Array of floor objects
 * @returns {number} - Next available level
 */
export const getNextFloorLevel = (floors) => {
  if (floors.length === 0) return 0;
  const maxLevel = Math.max(...floors.map(f => f.level));
  return maxLevel + 1;
};

/**
 * Validate floor data
 * @param {Object} floor - Floor object to validate
 * @returns {Object} - Validation result { isValid: boolean, errors: Array }
 */
export const validateFloor = (floor) => {
  const errors = [];
  
  if (!floor.name || floor.name.trim() === '') {
    errors.push('Floor name is required');
  }
  
  if (typeof floor.level !== 'number' || floor.level < 0) {
    errors.push('Floor level must be a non-negative number');
  }
  
  if (typeof floor.height !== 'number' || floor.height <= 0) {
    errors.push('Floor height must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 