/**
 * Sprinkler Layout Calculator based on NFPA 13 standards
 * Calculates optimal sprinkler placement for fire protection systems
 */

/**
 * Calculate sprinkler layout based on room dimensions and hazard class
 * @param {Object} params - Input parameters
 * @param {number} params.length - Room length in meters
 * @param {number} params.width - Room width in meters
 * @param {string} params.hazardClass - Hazard class: "Light", "Ordinary", or "Extra"
 * @returns {Object} Sprinkler layout calculation results
 */
function calculateSprinklerLayout({ length, width, hazardClass }) {
  // Input validation
  if (!length || !width || !hazardClass) {
    throw new Error(
      "Missing required parameters: length, width, and hazardClass are required"
    );
  }

  if (length <= 0 || width <= 0) {
    throw new Error("Room dimensions must be positive numbers");
  }

  if (typeof length !== "number" || typeof width !== "number") {
    throw new Error("Room dimensions must be numbers");
  }

  // Hazard class mapping (coverage area per sprinkler in m²)
  const hazardMap = {
    Light: 21,
    Ordinary: 12,
    Extra: 9,
  };

  if (!hazardMap[hazardClass]) {
    throw new Error(
      'Invalid hazard class. Must be "Light", "Ordinary", or "Extra"'
    );
  }

  // Get coverage area per sprinkler based on hazard class
  const coveragePerSprinkler = hazardMap[hazardClass];

  // Calculate total room area
  const roomArea = length * width;

  // Calculate required number of sprinklers
  const sprinklersRequired = Math.ceil(roomArea / coveragePerSprinkler);

  // Calculate optimal spacing between sprinklers
  const spacing = Math.sqrt(coveragePerSprinkler);

  // Calculate number of rows and columns
  const rows = Math.ceil(length / spacing);
  const columns = Math.ceil(width / spacing);

  // Generate sprinkler positions (2D grid layout)
  const layout = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = (col + 0.5) * spacing;
      const y = (row + 0.5) * spacing;

      // Only add sprinklers within room boundaries
      if (x <= width && y <= length) {
        layout.push({
          x: parseFloat(x.toFixed(2)),
          y: parseFloat(y.toFixed(2)),
          id: `sprinkler-${row}-${col}`,
          row: row + 1,
          col: col + 1,
        });
      }
    }
  }

  // Calculate actual coverage area
  const actualCoverage = layout.length * coveragePerSprinkler;
  const coverageRatio = (actualCoverage / roomArea) * 100;

  // Calculate spacing details
  const actualSpacingX = width / columns;
  const actualSpacingY = length / rows;

  return {
    // Input parameters
    roomLength: length,
    roomWidth: width,
    hazardClass: hazardClass,

    // Area calculations
    roomArea: parseFloat(roomArea.toFixed(2)),
    coveragePerSprinkler: coveragePerSprinkler,

    // Sprinkler requirements
    sprinklersRequired: sprinklersRequired,
    actualSprinklersPlaced: layout.length,

    // Grid layout
    spacing: parseFloat(spacing.toFixed(2)),
    actualSpacingX: parseFloat(actualSpacingX.toFixed(2)),
    actualSpacingY: parseFloat(actualSpacingY.toFixed(2)),
    rows: rows,
    columns: columns,

    // Layout data
    layout: layout,

    // Coverage analysis
    actualCoverage: parseFloat(actualCoverage.toFixed(2)),
    coverageRatio: parseFloat(coverageRatio.toFixed(1)),

    // NFPA compliance
    isCompliant: coverageRatio >= 100,
    complianceMessage:
      coverageRatio >= 100
        ? "Layout meets NFPA 13 coverage requirements"
        : `Warning: Coverage ratio is ${coverageRatio}% (minimum 100% required)`,

    // Metadata
    calculationDate: new Date().toISOString(),
    standard: "NFPA 13",
    version: "1.0.0",
  };
}

/**
 * Validate sprinkler layout parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result
 */
function validateSprinklerLayoutParams(params) {
  const errors = [];
  const warnings = [];

  // Required field validation
  if (!params.length) errors.push("Room length is required");
  if (!params.width) errors.push("Room width is required");
  if (!params.hazardClass) errors.push("Hazard class is required");

  // Type validation
  if (params.length && typeof params.length !== "number") {
    errors.push("Room length must be a number");
  }
  if (params.width && typeof params.width !== "number") {
    errors.push("Room width must be a number");
  }

  // Range validation
  if (params.length && params.length <= 0) {
    errors.push("Room length must be positive");
  }
  if (params.width && params.width <= 0) {
    errors.push("Room width must be positive");
  }

  // Hazard class validation
  const validHazardClasses = ["Light", "Ordinary", "Extra"];
  if (params.hazardClass && !validHazardClasses.includes(params.hazardClass)) {
    errors.push('Hazard class must be "Light", "Ordinary", or "Extra"');
  }

  // Size warnings
  if (params.length && params.width) {
    const area = params.length * params.width;
    if (area > 1000) {
      warnings.push(
        "Large room detected. Consider multiple zones for better coverage."
      );
    }
    if (area < 10) {
      warnings.push(
        "Small room detected. Minimum sprinkler requirements may apply."
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
  };
}

/**
 * Get hazard class information
 * @param {string} hazardClass - Hazard class name
 * @returns {Object} Hazard class details
 */
function getHazardClassInfo(hazardClass) {
  const hazardInfo = {
    Light: {
      description: "Light Hazard",
      coveragePerSprinkler: 21,
      maxSpacing: 4.6,
      typicalApplications: ["Offices", "Schools", "Churches", "Hospitals"],
      color: "#4ade80",
    },
    Ordinary: {
      description: "Ordinary Hazard",
      coveragePerSprinkler: 12,
      maxSpacing: 3.7,
      typicalApplications: ["Manufacturing", "Warehouses", "Parking Garages"],
      color: "#fbbf24",
    },
    Extra: {
      description: "Extra Hazard",
      coveragePerSprinkler: 9,
      maxSpacing: 3.0,
      typicalApplications: [
        "Chemical Storage",
        "Paint Shops",
        "Flammable Storage",
      ],
      color: "#f87171",
    },
  };

  return hazardInfo[hazardClass] || null;
}

/**
 * Calculate optimal sprinkler spacing for given dimensions
 * @param {number} length - Room length
 * @param {number} width - Room width
 * @param {number} coveragePerSprinkler - Coverage area per sprinkler
 * @returns {Object} Optimal spacing calculations
 */
function calculateOptimalSpacing(length, width, coveragePerSprinkler) {
  const area = length * width;
  const totalSprinklers = Math.ceil(area / coveragePerSprinkler);

  // Try different row/column combinations
  const options = [];

  for (let rows = 1; rows <= Math.ceil(length / 2); rows++) {
    const cols = Math.ceil(totalSprinklers / rows);
    const spacingX = width / cols;
    const spacingY = length / rows;

    options.push({
      rows: rows,
      columns: cols,
      spacingX: parseFloat(spacingX.toFixed(2)),
      spacingY: parseFloat(spacingY.toFixed(2)),
      totalSprinklers: rows * cols,
      efficiency: (rows * cols * coveragePerSprinkler) / area,
    });
  }

  // Sort by efficiency (closest to 1.0 is best)
  options.sort(
    (a, b) => Math.abs(1 - a.efficiency) - Math.abs(1 - b.efficiency)
  );

  return options[0] || null;
}

export {
  calculateSprinklerLayout,
  validateSprinklerLayoutParams,
  getHazardClassInfo,
  calculateOptimalSpacing,
};
