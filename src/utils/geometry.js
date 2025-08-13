// Geometry utilities for 2D/3D conversion and shape generation

// Unit conversion constants
export const UNITS = {
  PIXELS_PER_METER: 100, // 100px = 1m in canvas
  PIXELS_PER_MM: 0.1,    // 1px = 10mm
  MM_PER_METER: 1000,    // 1000mm = 1m
};

// Convert pixels to millimeters (canvas to real-world)
export const pixelsToMm = (pixels) => {
  return pixels * 10; // 1px = 10mm
};

// Convert millimeters to pixels (real-world to canvas)
export const mmToPixels = (mm) => {
  return mm * 0.1; // 1mm = 0.1px
};

// Convert pixels to meters
export const pixelsToMeters = (pixels) => {
  return pixels / UNITS.PIXELS_PER_METER;
};

// Convert meters to pixels
export const metersToPixels = (meters) => {
  return meters * UNITS.PIXELS_PER_METER;
};

// Convert canvas coordinates to 3D world coordinates
export const canvasToWorldCoords = (x, y, z = 0) => {
  return {
    x: pixelsToMeters(x),
    y: pixelsToMeters(z), // Z in canvas becomes Y in 3D
    z: pixelsToMeters(y)  // Y in canvas becomes Z in 3D
  };
};

// Convert 3D world coordinates to canvas coordinates
export const worldToCanvasCoords = (x, y, z) => {
  return {
    x: metersToPixels(x),
    y: metersToPixels(z), // Z in 3D becomes Y in canvas
    z: metersToPixels(y)  // Y in 3D becomes Z in canvas
  };
};

// Generate wall geometry for a room
export const generateRoomWalls = (room) => {
  const { x, y, width, height, wallHeight = 3000, wallThickness = 200 } = room;
  
  // Convert to mm
  const wallHeightMm = wallHeight;
  const wallThicknessMm = wallThickness;
  const xMm = pixelsToMm(x);
  const yMm = pixelsToMm(y);
  const widthMm = pixelsToMm(width);
  const heightMm = pixelsToMm(height);
  
  const walls = [
    // North wall (top)
    {
      id: `${room.id}-wall-north`,
      start: { x: xMm, y: yMm },
      end: { x: xMm + widthMm, y: yMm },
      thickness: wallThicknessMm,
      height: wallHeightMm,
      type: 'Partition',
      material: 'Brick'
    },
    // East wall (right)
    {
      id: `${room.id}-wall-east`,
      start: { x: xMm + widthMm, y: yMm },
      end: { x: xMm + widthMm, y: yMm + heightMm },
      thickness: wallThicknessMm,
      height: wallHeightMm,
      type: 'Partition',
      material: 'Brick'
    },
    // South wall (bottom)
    {
      id: `${room.id}-wall-south`,
      start: { x: xMm + widthMm, y: yMm + heightMm },
      end: { x: xMm, y: yMm + heightMm },
      thickness: wallThicknessMm,
      height: wallHeightMm,
      type: 'Partition',
      material: 'Brick'
    },
    // West wall (left)
    {
      id: `${room.id}-wall-west`,
      start: { x: xMm, y: yMm + heightMm },
      end: { x: xMm, y: yMm },
      thickness: wallThicknessMm,
      height: wallHeightMm,
      type: 'Partition',
      material: 'Brick'
    }
  ];
  
  return walls;
};

// Calculate wall angle in degrees
export const calculateWallAngle = (start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
};

// Calculate wall length
export const calculateWallLength = (start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Find which wall a door/window belongs to based on position
export const findWallForElement = (element, walls) => {
  const elementX = pixelsToMm(element.x);
  const elementY = pixelsToMm(element.y);
  
  for (const wall of walls) {
    const wallLength = calculateWallLength(wall.start, wall.end);
    const wallAngle = calculateWallAngle(wall.start, wall.end);
    
    // Calculate distance from element to wall line
    const distance = pointToLineDistance(
      { x: elementX, y: elementY },
      wall.start,
      wall.end
    );
    
    // If element is close to wall (within tolerance)
    if (distance < wall.thickness) {
      // Calculate position along wall (0-1)
      const position = getPositionAlongWall({ x: elementX, y: elementY }, wall);
      
      return {
        wallId: wall.id,
        position: position,
        wallAngle: wallAngle
      };
    }
  }
  
  return null;
};

// Calculate distance from point to line segment
export const pointToLineDistance = (point, lineStart, lineEnd) => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return Math.sqrt(A * A + B * B);
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// Get position along wall (0-1)
export const getPositionAlongWall = (point, wall) => {
  const wallLength = calculateWallLength(wall.start, wall.end);
  
  if (wallLength === 0) return 0;
  
  const dx = point.x - wall.start.x;
  const dy = point.y - wall.start.y;
  const wallDx = wall.end.x - wall.start.x;
  const wallDy = wall.end.y - wall.start.y;
  
  const dot = dx * wallDx + dy * wallDy;
  const position = dot / (wallLength * wallLength);
  
  return Math.max(0, Math.min(1, position));
};

// Convert room data to 3D structure
export const convertRoomTo3DStructure = (room) => {
  const walls = generateRoomWalls(room);
  
  // Convert doors to 3D format
  const doors = (room.doors || []).map(door => {
    const wallInfo = findWallForElement(door, walls);
    return {
      id: door.id,
      wallId: wallInfo?.wallId,
      position: wallInfo?.position || 0,
      width: door.width || 900,
      height: door.height || 2100,
      sillHeight: door.sillHeight || 0,
      type: door.type || 'Single',
      material: door.material || 'Wood'
    };
  });
  
  // Convert windows to 3D format
  const windows = (room.windows || []).map(window => {
    const wallInfo = findWallForElement(window, walls);
    return {
      id: window.id,
      wallId: wallInfo?.wallId,
      position: wallInfo?.position || 0,
      width: window.width || 1200,
      height: window.height || 1200,
      sillHeight: window.sillHeight || 900,
      type: window.type || 'Single',
      material: window.material || 'Aluminum'
    };
  });
  
  return {
    id: room.id,
    x: pixelsToMm(room.x),
    y: pixelsToMm(room.y),
    width: pixelsToMm(room.width),
    height: pixelsToMm(room.height),
    wallHeight: room.wallHeight || 3000,
    wallThickness: room.wallThickness || 200,
    walls: walls,
    doors: doors,
    windows: windows
  };
};

// Convert floor data to 3D structure
export const convertFloorTo3DStructure = (floor) => {
  return {
    width: pixelsToMm(floor.width || 40000),
    height: pixelsToMm(floor.height || 25000),
    thickness: floor.thickness || 200,
    elevation: floor.elevation || 0
  };
};

// Generate complete 3D structure from canvas data
export const generate3DStructure = (floorData, rooms) => {
  const floor3D = convertFloorTo3DStructure(floorData);
  const rooms3D = rooms.map(convertRoomTo3DStructure);
  
  return {
    floor: floor3D,
    rooms: rooms3D
  };
}; 