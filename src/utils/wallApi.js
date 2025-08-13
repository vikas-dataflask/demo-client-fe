const API_BASE_URL = 'http://localhost:8000/api';

// Create a new wall
export const createWall = async (wallData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wallData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating wall:', error);
    throw error;
  }
};

// Get walls for a specific room
export const getWallsByRoom = async (roomId, projectId, floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls/room/${roomId}?projectId=${projectId}&floorId=${floorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching walls for room:', error);
    return [];
  }
};

// Get all walls for a floor
export const getWallsByFloor = async (projectId, floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls/floor/${projectId}/${floorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching walls for floor:', error);
    return [];
  }
};

// Update wall properties
export const updateWall = async (wallId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls/${wallId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating wall:', error);
    throw error;
  }
};

// Delete wall
export const deleteWall = async (wallId, roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls/${wallId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting wall:', error);
    throw error;
  }
};

// Process room walls (extract walls from room geometry)
export const processRoomWalls = async (projectId, floorId, roomId, roomGeometry) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls/process-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        floorId,
        roomId,
        roomGeometry
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error processing room walls:', error);
    throw error;
  }
};

// Get wall statistics for a floor
export const getWallStats = async (projectId, floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/walls/stats/${projectId}/${floorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching wall stats:', error);
    return null;
  }
};

// Wall utility functions
export const wallUtils = {
  // Check if two walls are the same (shared)
  isSharedWall: (wallA, wallB) => {
    const tolerance = 1; // 1px tolerance for floating point comparison
    
    const sameDirection = (
      Math.abs(wallA.start.x - wallB.start.x) < tolerance &&
      Math.abs(wallA.start.y - wallB.start.y) < tolerance &&
      Math.abs(wallA.end.x - wallB.end.x) < tolerance &&
      Math.abs(wallA.end.y - wallB.end.y) < tolerance
    );
    
    const reverseDirection = (
      Math.abs(wallA.start.x - wallB.end.x) < tolerance &&
      Math.abs(wallA.start.y - wallB.end.y) < tolerance &&
      Math.abs(wallA.end.x - wallB.start.x) < tolerance &&
      Math.abs(wallA.end.y - wallB.start.y) < tolerance
    );
    
    return sameDirection || reverseDirection;
  },

  // Calculate wall length
  getWallLength: (wall) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Calculate wall angle in degrees
  getWallAngle: (wall) => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  },

  // Normalize wall direction (ensure start is always "smaller" than end)
  normalizeWall: (wall) => {
    const startX = Math.min(wall.start.x, wall.end.x);
    const startY = Math.min(wall.start.y, wall.end.y);
    const endX = Math.max(wall.start.x, wall.end.x);
    const endY = Math.max(wall.start.y, wall.end.y);
    
    return {
      ...wall,
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    };
  },

  // Extract wall segments from room geometry
  extractWallSegments: (roomGeometry) => {
    const segments = [];
    
    if (roomGeometry.shape === 'rectangle') {
      const { x, y, width, height } = roomGeometry;
      
      // Top wall
      segments.push({
        start: { x, y },
        end: { x: x + width, y }
      });
      
      // Right wall
      segments.push({
        start: { x: x + width, y },
        end: { x: x + width, y: y + height }
      });
      
      // Bottom wall
      segments.push({
        start: { x: x + width, y: y + height },
        end: { x, y: y + height }
      });
      
      // Left wall
      segments.push({
        start: { x, y: y + height },
        end: { x, y }
      });
    } else if (roomGeometry.shape === 'polygon' && roomGeometry.points) {
      const points = roomGeometry.points;
      
      for (let i = 0; i < points.length; i++) {
        const start = points[i];
        const end = points[(i + 1) % points.length]; // Connect last point to first
        
        segments.push({ start, end });
      }
    }
    
    return segments;
  },

  // Get wall color based on type
  getWallColor: (wallType) => {
    switch (wallType) {
      case 'Load-bearing':
        return '#8B4513'; // Brown
      case 'Glass':
        return '#87CEEB'; // Sky blue
      case 'Exterior':
        return '#696969'; // Dim gray
      case 'Partition':
      default:
        return '#A0522D'; // Sienna
    }
  },

  // Get wall stroke width based on thickness
  getWallStrokeWidth: (thickness) => {
    // Convert mm to pixels (assuming 100px = 1m, so 1mm = 0.1px)
    // But cap it at a reasonable maximum for visibility
    const pixelWidth = Math.max(2, Math.min(10, Math.round(thickness * 0.1)));
    return pixelWidth;
  }
}; 