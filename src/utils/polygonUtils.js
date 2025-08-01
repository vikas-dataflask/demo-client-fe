/**
 * Calculate the area of a polygon using the shoelace formula
 * @param {Array} points - Array of {x, y} points
 * @returns {number} - Area in square units
 */
export const calculatePolygonArea = (points) => {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  return Math.abs(area) / 2;
};

/**
 * Calculate distance between two points
 * @param {Object} point1 - {x, y}
 * @param {Object} point2 - {x, y}
 * @returns {number} - Distance
 */
export const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if a point is near another point (within threshold)
 * @param {Object} point1 - {x, y}
 * @param {Object} point2 - {x, y}
 * @param {number} threshold - Distance threshold
 * @returns {boolean} - True if points are near each other
 */
export const isPointNear = (point1, point2, threshold = 15) => {
  return calculateDistance(point1, point2) <= threshold;
};

/**
 * Check if a point is close to the starting point for polygon closing
 * @param {Object} currentPoint - Current mouse position {x, y}
 * @param {Object} startPoint - First point of polygon {x, y}
 * @param {number} threshold - Distance threshold (default 15 pixels)
 * @returns {boolean} - True if close enough to start point
 */
export const isCloseToStart = (currentPoint, startPoint, threshold = 15) => {
  const dx = currentPoint.x - startPoint.x;
  const dy = currentPoint.y - startPoint.y;
  return Math.sqrt(dx * dx + dy * dy) < threshold;
};

/**
 * Validate if polygon has enough points to be valid
 * @param {Array} points - Array of {x, y} points
 * @param {number} minPoints - Minimum points required (default 3)
 * @returns {boolean} - True if polygon is valid
 */
export const isValidPolygon = (points, minPoints = 3) => {
  return points && points.length >= minPoints;
};

/**
 * Create a closed polygon by connecting last point to first
 * @param {Array} points - Array of {x, y} points
 * @returns {Array} - Closed polygon points
 */
export const closePolygon = (points) => {
  if (!points || points.length < 3) return points;
  
  // Check if already closed (last point equals first point)
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
    return points; // Already closed
  }
  
  // Add first point to end to close the polygon
  return [...points, { x: firstPoint.x, y: firstPoint.y }];
};

/**
 * Convert polygon points from pixels to meters
 * @param {Array} points - Array of {x, y} points in pixels
 * @param {number} pixelsPerMeter - Conversion factor
 * @returns {Array} - Array of {x, y} points in meters
 */
export const convertPolygonToMeters = (points, pixelsPerMeter = 100) => {
  return points.map(point => ({
    x: point.x / pixelsPerMeter,
    y: point.y / pixelsPerMeter
  }));
};

/**
 * Convert polygon points from meters to pixels
 * @param {Array} points - Array of {x, y} points in meters
 * @param {number} pixelsPerMeter - Conversion factor
 * @returns {Array} - Array of {x, y} points in pixels
 */
export const convertPolygonToPixels = (points, pixelsPerMeter = 100) => {
  return points.map(point => ({
    x: point.x * pixelsPerMeter,
    y: point.y * pixelsPerMeter
  }));
}; 