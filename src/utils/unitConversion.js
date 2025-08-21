// Unit conversion constants and helper functions
export const UNIT_CONVERSION_CONSTANTS = {
  PIXELS_PER_METER: 100,  // Default: 100 pixels = 1 meter
  
  DXF_UNITS_TO_METERS: {
    'MILLIMETERS': 0.001,
    'CENTIMETERS': 0.01, 
    'METERS': 1.0,
    'INCHES': 0.0254,
    'FEET': 0.3048
  },
  
  DEFAULT_SCALES: {
    'ARCHITECTURAL': 0.01,    // 1:100 scale
    'ENGINEERING': 0.001,     // 1:1000 scale
    'SITE_PLAN': 0.1          // 1:10 scale
  }
};

// Helper function to convert DXF units to meters
export const convertDxfUnitsToMeters = (value, dxfUnit = 'METERS') => {
  const conversionFactor = UNIT_CONVERSION_CONSTANTS.DXF_UNITS_TO_METERS[dxfUnit] || 1.0;
  return value * conversionFactor;
};

// Helper function to convert meters to pixels using calibrated scale
export const convertMetersToPixels = (meters, pixelsPerMeter = UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER) => {
  return meters * pixelsPerMeter;
};

// Helper function to convert pixels to meters using calibrated scale
export const convertPixelsToMeters = (pixels, pixelsPerMeter = UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER) => {
  return pixels / pixelsPerMeter;
};

// Helper function to get calibrated pixels per meter from Redux store
export const getCalibratedPixelsPerMeter = (store) => {
  if (store && store.getState && store.getState().calibration) {
    return store.getState().calibration.pixelsPerMeter || UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER;
  }
  return UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER;
};

// Helper function to convert meters to pixels using current calibrated scale
export const convertMetersToPixelsCalibrated = (meters, store) => {
  const pixelsPerMeter = getCalibratedPixelsPerMeter(store);
  return convertMetersToPixels(meters, pixelsPerMeter);
};

// Helper function to convert pixels to meters using current calibrated scale
export const convertPixelsToMetersCalibrated = (pixels, store) => {
  const pixelsPerMeter = getCalibratedPixelsPerMeter(store);
  return convertPixelsToMeters(pixels, pixelsPerMeter);
};

// Helper function to convert between different display units
export const convertUnits = (value, fromUnit, toUnit) => {
  const unitConversions = {
    'm': 1.0,
    'mm': 0.001,
    'cm': 0.01,
    'ft': 0.3048,
    'inch': 0.0254,
    'sq yd': 0.836127 // square yards to square meters
  };

  // Convert to meters first
  const meters = value * (unitConversions[fromUnit] || 1.0);
  
  // Convert from meters to target unit
  return meters / (unitConversions[toUnit] || 1.0);
};

// Helper function to convert display unit to grid unit
export const displayUnitToGridUnit = (displayUnit) => {
  const unitMapping = {
    'm': 'meters',
    'mm': 'millimeters', 
    'cm': 'centimeters',
    'ft': 'feet',
    'inch': 'inches'
  };
  return unitMapping[displayUnit] || 'meters';
};

// Helper function to get the appropriate scale factor based on DXF units
export const getScaleFactor = (dxfUnit = 'METERS', drawingScale = 'ARCHITECTURAL') => {
  const unitFactor = UNIT_CONVERSION_CONSTANTS.DXF_UNITS_TO_METERS[dxfUnit] || 1.0;
  const scaleFactor = UNIT_CONVERSION_CONSTANTS.DEFAULT_SCALES[drawingScale] || 0.01;
  return unitFactor * scaleFactor;
};

// Helper function to format measurements with appropriate units
export const formatMeasurement = (value, unit) => {
  if (unit === 'sq yd') {
    return `${value.toFixed(2)} sq yd`;
  }
  return `${value.toFixed(2)} ${unit}`;
}; 