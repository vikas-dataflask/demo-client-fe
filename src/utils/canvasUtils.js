// Canvas utility functions

/**
 * Calculate the centroid (center point) of a polygon
 * @param {Array} points - Array of points with x, y coordinates
 * @returns {Object} - {x, y} coordinates of the centroid
 */
export const calculatePolygonCentroid = (points) => {
  if (!points || points.length < 3) {
    return { x: 0, y: 0 };
  }

  let area = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const cross = points[i].x * points[j].y - points[j].x * points[i].y;
    area += cross;
    centroidX += (points[i].x + points[j].x) * cross;
    centroidY += (points[i].y + points[j].y) * cross;
  }

  area /= 2;
  const factor = 1 / (6 * area);

  return {
    x: centroidX * factor,
    y: centroidY * factor
  };
};

/**
 * Calculate the area of a polygon using the shoelace formula
 * @param {Array} points - Array of points with x, y coordinates
 * @returns {number} - Area of the polygon
 */
export const calculatePolygonArea = (points) => {
  if (!points || points.length < 3) {
    return 0;
  }

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area) / 2;
};

/**
 * Convert pixels to meters using calibrated scale
 * @param {number} pixels - Number of pixels
 * @param {number} pixelsPerMeter - Calibrated pixels per meter ratio (default: 100)
 * @returns {number} - Equivalent meters
 */
export const pixelsToMeters = (pixels, pixelsPerMeter = 100) => {
  return pixels / pixelsPerMeter;
};

/**
 * Convert meters to pixels using calibrated scale
 * @param {number} meters - Number of meters
 * @param {number} pixelsPerMeter - Calibrated pixels per meter ratio (default: 100)
 * @returns {number} - Equivalent pixels
 */
export const metersToPixels = (meters, pixelsPerMeter = 100) => {
  return meters * pixelsPerMeter;
};

/**
 * Calculate area in square meters from pixel dimensions using calibrated scale
 * @param {number} widthPixels - Width in pixels
 * @param {number} heightPixels - Height in pixels
 * @param {number} pixelsPerMeter - Calibrated pixels per meter ratio (default: 100)
 * @returns {number} - Area in square meters
 */
export const calculateAreaInMeters = (widthPixels, heightPixels, pixelsPerMeter = 100) => {
  const widthMeters = pixelsToMeters(widthPixels, pixelsPerMeter);
  const heightMeters = pixelsToMeters(heightPixels, pixelsPerMeter);
  return widthMeters * heightMeters;
};

/**
 * Get calibrated scale information
 * @param {Object} store - Redux store instance
 * @returns {Object} - { pixelsPerMeter, isCalibrated, lastCalibratedAt }
 */
export const getCalibratedScale = (store) => {
  const state = store.getState();
  return {
    pixelsPerMeter: state.calibration?.pixelsPerMeter || 100,
    isCalibrated: state.calibration?.isCalibrated || false,
    lastCalibratedAt: state.calibration?.lastCalibratedAt || null,
  };
};

/**
 * Convert pixels to meters using current calibrated scale from Redux
 * @param {number} pixels - Number of pixels
 * @param {Object} store - Redux store instance
 * @returns {number} - Equivalent meters
 */
export const pixelsToMetersCalibrated = (pixels, store) => {
  const { pixelsPerMeter } = getCalibratedScale(store);
  return pixelsToMeters(pixels, pixelsPerMeter);
};

/**
 * Convert meters to pixels using current calibrated scale from Redux
 * @param {number} meters - Number of meters
 * @param {Object} store - Redux store instance
 * @returns {number} - Equivalent pixels
 */
export const metersToPixelsCalibrated = (meters, store) => {
  const { pixelsPerMeter } = getCalibratedScale(store);
  return metersToPixels(meters, pixelsPerMeter);
}; 