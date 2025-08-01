// Grid utilities and coordinate conversion functions
export const GRID_UNITS = {
  METERS: 'meters',
  FEET: 'feet',
  MILLIMETERS: 'millimeters',
  CENTIMETERS: 'centimeters',
  INCHES: 'inches'
};

// Grid size in pixels per meter
export const GRID_SIZE = 100;

// Coordinate conversion functions
export const pixelToRealWorld = (pixels, scale = 1, unit = GRID_UNITS.METERS) => {
  const meters = pixels / GRID_SIZE;
  
  switch (unit) {
    case GRID_UNITS.FEET:
      return meters * 3.28084; // Convert meters to feet
    case GRID_UNITS.MILLIMETERS:
      return meters * 1000; // Convert meters to millimeters
    case GRID_UNITS.CENTIMETERS:
      return meters * 100; // Convert meters to centimeters
    case GRID_UNITS.INCHES:
      return meters * 39.3701; // Convert meters to inches
    case GRID_UNITS.METERS:
    default:
      return meters;
  }
};

export const realWorldToPixel = (realValue, unit = GRID_UNITS.METERS) => {
  let meters;
  
  switch (unit) {
    case GRID_UNITS.FEET:
      meters = realValue / 3.28084; // Convert feet to meters
      break;
    case GRID_UNITS.MILLIMETERS:
      meters = realValue / 1000; // Convert millimeters to meters
      break;
    case GRID_UNITS.CENTIMETERS:
      meters = realValue / 100; // Convert centimeters to meters
      break;
    case GRID_UNITS.INCHES:
      meters = realValue / 39.3701; // Convert inches to meters
      break;
    case GRID_UNITS.METERS:
    default:
      meters = realValue;
  }
  
  return meters * GRID_SIZE;
};

// Format coordinates for display
export const formatCoordinates = (x, y, unit = GRID_UNITS.METERS) => {
  const formatValue = (value) => {
    if (unit === GRID_UNITS.MILLIMETERS) {
      return value.toFixed(0);
    } else if (unit === GRID_UNITS.CENTIMETERS) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  };
  
  return {
    x: formatValue(x),
    y: formatValue(y)
  };
};

// Get unit symbol for display
export const getUnitSymbol = (unit = GRID_UNITS.METERS) => {
  switch (unit) {
    case GRID_UNITS.FEET:
      return 'ft';
    case GRID_UNITS.MILLIMETERS:
      return 'mm';
    case GRID_UNITS.CENTIMETERS:
      return 'cm';
    case GRID_UNITS.INCHES:
      return 'in';
    case GRID_UNITS.METERS:
    default:
      return 'm';
  }
}; 