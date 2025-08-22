export class MeasurementTools {
  constructor(scaleManager) {
    this.scaleManager = scaleManager;
  }

  /**
   * Calculate distance between two points
   */
  measureDistance(point1, point2, unit = 'meter', pixelsPerMeter = 100) {
    const pixelDistance = Math.hypot(point2.x - point1.x, point2.y - point1.y);
    return this.scaleManager.pixelsToUnits(pixelDistance, unit, pixelsPerMeter);
  }

  /**
   * Calculate area of rectangle
   */
  measureRectangleArea(rect, unit = 'meter', pixelsPerMeter = 100) {
    const pixelArea = rect.width * rect.height;
    return this.scaleManager.pixelAreaToUnits(pixelArea, unit, pixelsPerMeter);
  }

  /**
   * Calculate perimeter of rectangle
   */
  measureRectanglePerimeter(rect, unit = 'meter', pixelsPerMeter = 100) {
    const pixelPerimeter = 2 * ( rect.width + rect.height);
    return this.scaleManager.pixelsToUnits(pixelPerimeter, unit, pixelsPerMeter);
  }

  /**
   * Format measurement for display
   */
  formatMeasurement(value, unit, precision = 2) {
    const unitSymbols = {
      meter: 'm',
      inch: 'in',
      feet: 'ft',
      'square yards': 'yd²',
      mm: 'mm',
      cm: 'cm',
      ft: 'ft',
      'sq yd': 'sq yd'
    };
    
    const symbol = unitSymbols[unit.toLowerCase()] || unit;
    return `${value.toFixed(precision)} ${symbol}`;
  }

  /**
   * Convert pixels to real-world units
   */
  pixelsToUnits(pixels, unit = 'meter', pixelsPerMeter = 100) {
    const meters = pixels / pixelsPerMeter; // Use calibrated scale
    
    switch (unit.toLowerCase()) {
      case 'mm':
        return meters * 1000;
      case 'cm':
        return meters * 100;
      case 'ft':
        return meters * 3.28084;
      case 'inch':
        return meters * 39.3701;
      case 'meter':
      case 'm':
      default:
        return meters;
    }
  }

  /**
   * Convert pixel area to real-world units
   */
  pixelAreaToUnits(pixelArea, unit = 'meter', pixelsPerMeter = 100) {
    const squareMeters = pixelArea / (pixelsPerMeter * pixelsPerMeter); // Use calibrated scale
    
    switch (unit.toLowerCase()) {
      case 'sq yd':
        return squareMeters * 1.19599;
      case 'ft':
        return squareMeters * 10.7639;
      case 'meter':
      case 'm':
      default:
        return squareMeters;
    }
  }
} 