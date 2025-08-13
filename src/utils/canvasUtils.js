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
 * Convert pixels to meters (assuming 100px = 1m)
 * @param {number} pixels - Number of pixels
 * @returns {number} - Equivalent meters
 */
export const pixelsToMeters = (pixels) => {
  return pixels / 100;
};

/**
 * Convert meters to pixels (assuming 100px = 1m)
 * @param {number} meters - Number of meters
 * @returns {number} - Equivalent pixels
 */
export const metersToPixels = (meters) => {
  return meters * 100;
};

/**
 * Calculate area in square meters from pixel dimensions
 * @param {number} widthPixels - Width in pixels
 * @param {number} heightPixels - Height in pixels
 * @returns {number} - Area in square meters
 */
export const calculateAreaInMeters = (widthPixels, heightPixels) => {
  const widthMeters = pixelsToMeters(widthPixels);
  const heightMeters = pixelsToMeters(heightPixels);
  return widthMeters * heightMeters;
}; 