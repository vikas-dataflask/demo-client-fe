// Utility functions for wall snapping and distance calculations

// Calculate distance from point to line segment
export const pointToLineDistance = (point, lineStart, lineEnd) => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    // Line segment is actually a point
    return Math.sqrt(A * A + B * B);
  }

  let param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// Find the nearest wall to a point
export const findNearestWall = (point, walls, tolerance = 10) => {
  let nearestWall = null;
  let minDistance = Infinity;
  let snapPoint = null;

  walls.forEach(wall => {
    const distance = pointToLineDistance(point, wall.start, wall.end);
    
    if (distance < minDistance && distance <= tolerance) {
      minDistance = distance;
      nearestWall = wall;
      
      // Calculate the actual snap point on the wall
      snapPoint = getSnapPointOnWall(point, wall);
    }
  });

  return {
    wall: nearestWall,
    distance: minDistance,
    snapPoint: snapPoint
  };
};

// Get the snap point on a wall (closest point on the wall to the given point)
export const getSnapPointOnWall = (point, wall) => {
  const A = point.x - wall.start.x;
  const B = point.y - wall.start.y;
  const C = wall.end.x - wall.start.x;
  const D = wall.end.y - wall.start.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return { x: wall.start.x, y: wall.start.y };
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param)); // Clamp to line segment

  return {
    x: wall.start.x + param * C,
    y: wall.start.y + param * D
  };
};

// Calculate wall angle in degrees
export const getWallAngle = (wall) => {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
};

// Convert mm to pixels (assuming 100px = 1m)
export const mmToPixels = (mm) => {
  return mm * 0.1; // 1mm = 0.1px (since 1000mm = 100px)
};

// Convert pixels to mm
export const pixelsToMm = (pixels) => {
  return pixels * 10; // 1px = 10mm
};

// Check if a door/window can be placed on a wall (check for overlaps)
export const canPlaceOnWall = (wallId, position, width, existingElements) => {
  const wallElements = existingElements.filter(el => el.wallId === wallId);
  
  // Check for overlaps with existing elements
  for (const element of wallElements) {
    const distance = Math.abs(position - element.position);
    const combinedWidth = (width + element.width) / 2;
    
    if (distance < combinedWidth) {
      return false; // Overlap detected
    }
  }
  
  return true;
};

// Calculate position along wall (0-1) from absolute coordinates
export const getPositionAlongWall = (point, wall) => {
  const wallLength = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + 
    Math.pow(wall.end.y - wall.start.y, 2)
  );
  
  if (wallLength === 0) return 0;
  
  const snapPoint = getSnapPointOnWall(point, wall);
  const distanceFromStart = Math.sqrt(
    Math.pow(snapPoint.x - wall.start.x, 2) + 
    Math.pow(snapPoint.y - wall.start.y, 2)
  );
  
  return distanceFromStart / wallLength;
};

// Convert position along wall (0-1) to absolute coordinates
export const getAbsolutePosition = (position, wall) => {
  return {
    x: wall.start.x + position * (wall.end.x - wall.start.x),
    y: wall.start.y + position * (wall.end.y - wall.start.y)
  };
}; 