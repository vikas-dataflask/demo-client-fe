/**
 * Fixture Arrangement Utilities
 * Provides algorithms and helper functions for automatic fixture placement
 */

// Point-in-polygon test using ray casting algorithm
export const isPointInPolygon = (point, polygon) => {
  const { x, y } = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// Calculate room center for any shape
export const getRoomCenter = (room) => {
  if (room.points && room.points.length > 0) {
    // Polygonal room
    const sumX = room.points.reduce((sum, point) => sum + point.x, 0);
    const sumY = room.points.reduce((sum, point) => sum + point.y, 0);
    return {
      x: sumX / room.points.length,
      y: sumY / room.points.length
    };
  } else {
    // Rectangular room
    return {
      x: room.x + room.width / 2,
      y: room.y + room.height / 2
    };
  }
};

// Get room bounding box
export const getRoomBoundingBox = (room) => {
  if (room.points && room.points.length > 0) {
    // Polygonal room
    const xs = room.points.map(p => p.x);
    const ys = room.points.map(p => p.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  } else {
    // Rectangular room
    return {
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height
    };
  }
};

// Check if point is inside room with clearance margin
export const isPointInRoomWithClearance = (point, room, clearanceMargin = 0) => {
  console.log('🔍 isPointInRoomWithClearance checking:', {
    point,
    room,
    clearanceMargin,
    hasPoints: !!(room.points && room.points.length > 0)
  });
  
  if (room.points && room.points.length > 0) {
    // For polygonal rooms, we need to check if point is inside the shrunk polygon
    const shrunkPolygon = shrinkPolygon(room.points, clearanceMargin);
    const result = isPointInPolygon(point, shrunkPolygon);
    console.log('🔍 Polygonal room check:', { result, shrunkPolygon: shrunkPolygon.slice(0, 3) });
    return result;
  } else {
    // Rectangular room
    const result = (
      point.x >= room.x + clearanceMargin &&
      point.x <= room.x + room.width - clearanceMargin &&
      point.y >= room.y + clearanceMargin &&
      point.y <= room.y + room.height - clearanceMargin
    );
    
    console.log('🔍 Rectangular room check:', {
      result,
      point,
      roomBounds: {
        minX: room.x + clearanceMargin,
        maxX: room.x + room.width - clearanceMargin,
        minY: room.y + clearanceMargin,
        maxY: room.y + room.height - clearanceMargin
      },
      checks: {
        xMin: point.x >= room.x + clearanceMargin,
        xMax: point.x <= room.x + room.width - clearanceMargin,
        yMin: point.y >= room.y + clearanceMargin,
        yMax: point.y <= room.y + room.height - clearanceMargin
      }
    });
    
    return result;
  }
};

// Shrink polygon by given distance (simplified implementation)
export const shrinkPolygon = (points, distance) => {
  if (points.length < 3) return points;
  
  const shrunk = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    
    // Calculate normal vector
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    if (len1 === 0 || len2 === 0) {
      shrunk.push(curr);
      continue;
    }
    
    // Normalize vectors
    const nx1 = -dy1 / len1;
    const ny1 = dx1 / len1;
    const nx2 = -dy2 / len2;
    const ny2 = dx2 / len2;
    
    // Average normal
    const nx = (nx1 + nx2) / 2;
    const ny = (ny1 + ny2) / 2;
    const len = Math.sqrt(nx * nx + ny * ny);
    
    if (len > 0) {
      shrunk.push({
        x: curr.x + (nx / len) * distance,
        y: curr.y + (ny / len) * distance
      });
    } else {
      shrunk.push(curr);
    }
  }
  
  return shrunk;
};

// Calculate optimal grid dimensions for given count
export const calculateOptimalGrid = (count) => {
  if (count <= 0) return { rows: 0, cols: 0 };
  
  // Find factors closest to square
  let bestRows = 1;
  let bestCols = count;
  let minDiff = count;
  
  for (let i = 1; i <= Math.sqrt(count); i++) {
    if (count % i === 0) {
      const rows = i;
      const cols = count / i;
      const diff = Math.abs(rows - cols);
      if (diff < minDiff) {
        bestRows = rows;
        bestCols = cols;
        minDiff = diff;
      }
    }
  }
  
  return { rows: bestRows, cols: bestCols };
};

// Generate grid positions
export const generateGridPositions = (room, fixtureCount, clearanceMargin = 0) => {
  console.log('🔧 generateGridPositions called with:', {
    room,
    fixtureCount,
    clearanceMargin
  });
  
  const { rows, cols } = calculateOptimalGrid(fixtureCount);
  console.log('📐 Grid dimensions calculated:', { rows, cols, fixtureCount });
  
  const boundingBox = getRoomBoundingBox(room);
  console.log('📦 Room bounding box:', boundingBox);
  
  const effectiveWidth = boundingBox.width - 2 * clearanceMargin;
  const effectiveHeight = boundingBox.height - 2 * clearanceMargin;
  
  console.log('📏 Effective dimensions:', {
    effectiveWidth,
    effectiveHeight,
    clearanceMargin,
    originalWidth: boundingBox.width,
    originalHeight: boundingBox.height
  });
  
  const spacingX = cols > 1 ? effectiveWidth / (cols - 1) : 0;
  const spacingY = rows > 1 ? effectiveHeight / (rows - 1) : 0;
  
  console.log('📏 Spacing calculated:', { spacingX, spacingY, rows, cols });
  
  const positions = [];
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (positions.length >= fixtureCount) break;
      
      const x = boundingBox.x + clearanceMargin + j * spacingX;
      const y = boundingBox.y + clearanceMargin + i * spacingY;
      
      console.log(`📍 Position ${positions.length + 1}: (${x}, ${y}) - row ${i}, col ${j}`);
      
      if (isPointInRoomWithClearance({ x, y }, room, clearanceMargin)) {
        positions.push({ x, y, id: `grid-${i}-${j}` });
        console.log(`✅ Position ${positions.length} added: (${x}, ${y})`);
      } else {
        console.log(`❌ Position rejected: (${x}, ${y}) - not in room with clearance`);
      }
    }
  }
  
  console.log('🎯 generateGridPositions result:', {
    requestedCount: fixtureCount,
    generatedCount: positions.length,
    successRate: positions.length / fixtureCount
  });
  
  return positions;
};

// Generate linear positions along X-axis
export const generateLinearXPositions = (room, fixtureCount, clearanceMargin = 0) => {
  const boundingBox = getRoomBoundingBox(room);
  const center = getRoomCenter(room);
  const effectiveWidth = boundingBox.width - 2 * clearanceMargin;
  
  const spacing = fixtureCount > 1 ? effectiveWidth / (fixtureCount - 1) : 0;
  const positions = [];
  
  for (let i = 0; i < fixtureCount; i++) {
    const x = boundingBox.x + clearanceMargin + i * spacing;
    const y = center.y;
    
    if (isPointInRoomWithClearance({ x, y }, room, clearanceMargin)) {
      positions.push({ x, y, id: `linear-x-${i}` });
    }
  }
  
  return positions;
};

// Generate linear positions along Y-axis
export const generateLinearYPositions = (room, fixtureCount, clearanceMargin = 0) => {
  const boundingBox = getRoomBoundingBox(room);
  const center = getRoomCenter(room);
  const effectiveHeight = boundingBox.height - 2 * clearanceMargin;
  
  const spacing = fixtureCount > 1 ? effectiveHeight / (fixtureCount - 1) : 0;
  const positions = [];
  
  for (let i = 0; i < fixtureCount; i++) {
    const x = center.x;
    const y = boundingBox.y + clearanceMargin + i * spacing;
    
    if (isPointInRoomWithClearance({ x, y }, room, clearanceMargin)) {
      positions.push({ x, y, id: `linear-y-${i}` });
    }
  }
  
  return positions;
};

// Generate perimeter positions
export const generatePerimeterPositions = (room, fixtureCount, clearanceMargin = 0) => {
  const boundingBox = getRoomBoundingBox(room);
  const effectiveWidth = boundingBox.width - 2 * clearanceMargin;
  const effectiveHeight = boundingBox.height - 2 * clearanceMargin;
  
  const perimeter = 2 * (effectiveWidth + effectiveHeight);
  const spacing = fixtureCount > 0 ? perimeter / fixtureCount : 0;
  
  const positions = [];
  let currentDistance = 0;
  let currentSide = 0; // 0: top, 1: right, 2: bottom, 3: left
  
  for (let i = 0; i < fixtureCount; i++) {
    let x, y;
    
    if (currentSide === 0) { // Top edge
      x = boundingBox.x + clearanceMargin + (currentDistance % effectiveWidth);
      y = boundingBox.y + clearanceMargin;
      if (currentDistance >= effectiveWidth) {
        currentSide = 1;
        currentDistance = currentDistance - effectiveWidth;
      }
    } else if (currentSide === 1) { // Right edge
      x = boundingBox.x + boundingBox.width - clearanceMargin;
      y = boundingBox.y + clearanceMargin + (currentDistance % effectiveHeight);
      if (currentDistance >= effectiveHeight) {
        currentSide = 2;
        currentDistance = currentDistance - effectiveHeight;
      }
    } else if (currentSide === 2) { // Bottom edge
      x = boundingBox.x + boundingBox.width - clearanceMargin - (currentDistance % effectiveWidth);
      y = boundingBox.y + boundingBox.height - clearanceMargin;
      if (currentDistance >= effectiveWidth) {
        currentSide = 3;
        currentDistance = currentDistance - effectiveWidth;
      }
    } else { // Left edge
      x = boundingBox.x + clearanceMargin;
      y = boundingBox.y + boundingBox.height - clearanceMargin - (currentDistance % effectiveHeight);
      if (currentDistance >= effectiveHeight) {
        currentSide = 0;
        currentDistance = currentDistance - effectiveHeight;
      }
    }
    
    if (isPointInRoomWithClearance({ x, y }, room, clearanceMargin)) {
      positions.push({ x, y, id: `perimeter-${i}` });
    }
    
    currentDistance += spacing;
  }
  
  return positions;
};

// Generate central cluster positions
export const generateCentralPositions = (room, fixtureCount, clearanceMargin = 0) => {
  const boundingBox = getRoomBoundingBox(room);
  const center = getRoomCenter(room);
  const effectiveWidth = boundingBox.width - 2 * clearanceMargin;
  const effectiveHeight = boundingBox.height - 2 * clearanceMargin;
  
  const clusterSize = Math.ceil(Math.sqrt(fixtureCount));
  const clusterWidth = Math.min(effectiveWidth * 0.6, 200);
  const clusterHeight = Math.min(effectiveHeight * 0.6, 200);
  
  const spacingX = clusterSize > 1 ? clusterWidth / (clusterSize - 1) : 0;
  const spacingY = clusterSize > 1 ? clusterHeight / (clusterSize - 1) : 0;
  
  const clusterStartX = center.x - clusterWidth / 2;
  const clusterStartY = center.y - clusterHeight / 2;
  
  const positions = [];
  
  for (let i = 0; i < clusterSize; i++) {
    for (let j = 0; j < clusterSize; j++) {
      if (positions.length >= fixtureCount) break;
      
      const x = clusterStartX + j * spacingX;
      const y = clusterStartY + i * spacingY;
      
      if (isPointInRoomWithClearance({ x, y }, room, clearanceMargin)) {
        positions.push({ x, y, id: `central-${i}-${j}` });
      }
    }
  }
  
  return positions;
};

// Main function to generate positions based on layout type
export const generateFixturePositions = (room, fixtureCount, layoutType, clearanceMargin = 0) => {
  console.log('🔧 generateFixturePositions called with:', {
    room,
    fixtureCount,
    layoutType,
    clearanceMargin,
    roomArea: room?.area,
    roomWidth: room?.width,
    roomHeight: room?.height
  });
  
  if (!room || fixtureCount <= 0) {
    console.log('❌ generateFixturePositions: Invalid inputs');
    return [];
  }
  
  let positions = [];
  
  switch (layoutType) {
    case 'grid':
      positions = generateGridPositions(room, fixtureCount, clearanceMargin);
      break;
    case 'linear-x':
      positions = generateLinearXPositions(room, fixtureCount, clearanceMargin);
      break;
    case 'linear-y':
      positions = generateLinearYPositions(room, fixtureCount, clearanceMargin);
      break;
    case 'perimeter':
      positions = generatePerimeterPositions(room, fixtureCount, clearanceMargin);
      break;
    case 'central':
      positions = generateCentralPositions(room, fixtureCount, clearanceMargin);
      break;
    default:
      console.log('❌ generateFixturePositions: Unknown layout type:', layoutType);
      return [];
  }
  
  console.log('✅ generateFixturePositions result:', {
    layoutType,
    requestedCount: fixtureCount,
    generatedCount: positions.length,
    positions: positions.slice(0, 3) // Show first 3 for debugging
  });
  
  return positions;
};

// Calculate spacing between fixtures for a given layout
export const calculateFixtureSpacing = (room, fixtureCount, layoutType, clearanceMargin = 0) => {
  const boundingBox = getRoomBoundingBox(room);
  const effectiveWidth = boundingBox.width - 2 * clearanceMargin;
  const effectiveHeight = boundingBox.height - 2 * clearanceMargin;
  
  switch (layoutType) {
    case 'grid': {
      const { rows, cols } = calculateOptimalGrid(fixtureCount);
      return {
        x: cols > 1 ? effectiveWidth / (cols - 1) : 0,
        y: rows > 1 ? effectiveHeight / (rows - 1) : 0
      };
    }
    case 'linear-x':
      return {
        x: fixtureCount > 1 ? effectiveWidth / (fixtureCount - 1) : 0,
        y: 0
      };
    case 'linear-y':
      return {
        x: 0,
        y: fixtureCount > 1 ? effectiveHeight / (fixtureCount - 1) : 0
      };
    case 'perimeter': {
      const perimeter = 2 * (effectiveWidth + effectiveHeight);
      return {
        x: fixtureCount > 0 ? perimeter / fixtureCount : 0,
        y: 0
      };
    }
    case 'central': {
      const clusterSize = Math.ceil(Math.sqrt(fixtureCount));
      const clusterWidth = Math.min(effectiveWidth * 0.6, 200);
      const clusterHeight = Math.min(effectiveHeight * 0.6, 200);
      return {
        x: clusterSize > 1 ? clusterWidth / (clusterSize - 1) : 0,
        y: clusterSize > 1 ? clusterHeight / (clusterSize - 1) : 0
      };
    }
    default:
      return { x: 0, y: 0 };
  }
};

// Validate if arrangement is possible
export const canArrangeFixtures = (room, fixtureCount, layoutType, clearanceMargin = 0) => {
  if (!room || fixtureCount <= 0) return false;
  
  const positions = generateFixturePositions(room, fixtureCount, layoutType, clearanceMargin);
  return positions.length > 0;
};

// Get arrangement statistics
export const getArrangementStats = (room, fixtureCount, layoutType, clearanceMargin = 0) => {
  const positions = generateFixturePositions(room, fixtureCount, layoutType, clearanceMargin);
  const spacing = calculateFixtureSpacing(room, fixtureCount, layoutType, clearanceMargin);
  
  return {
    totalPositions: positions.length,
    requestedCount: fixtureCount,
    successRate: positions.length / fixtureCount,
    spacing,
    layoutType,
    clearanceMargin
  };
}; 