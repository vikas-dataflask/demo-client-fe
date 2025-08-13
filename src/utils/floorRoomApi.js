import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Floor API functions
export const createFloorInBackend = async (floorData) => {
  try {
    // Convert floor data to backend format before sending
    const backendFloorData = convertFloorToBackendFormat(floorData);
    
    const response = await axios.post(`${API_BASE_URL}/floors`, backendFloorData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating floor:', error);
    throw error;
  }
};

export const getFloorsByProject = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/floors?projectId=${projectId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching floors:', error);
    throw error;
  }
};

export const updateFloorInBackend = async (floorId, floorData) => {
  try {
    // Convert floor data to backend format before sending
    const backendFloorData = convertFloorToBackendFormat(floorData);
    
    const response = await axios.patch(`${API_BASE_URL}/floors/${floorId}`, backendFloorData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating floor:', error);
    throw error;
  }
};

export const deleteFloorFromBackend = async (floorId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/floors/${floorId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting floor:', error);
    throw error;
  }
};

// Room API functions
export const createRoomInBackend = async (roomData) => {
  try {
    // Use floorId directly as the backend expects floorId
    const response = await axios.post(`${API_BASE_URL}/admin/rooms`, roomData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const getRoomsByFloor = async (floorId) => {
  try {
    // Use floorId directly as the backend expects floorId
    const response = await axios.get(`${API_BASE_URL}/admin/rooms?floorId=${floorId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const updateRoomInBackend = async (roomId, roomData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/rooms/${roomId}`, roomData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const deleteRoomFromBackend = async (roomId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Utility functions for data conversion
export const convertPixelsToMeters = (pixels) => {
  // Assuming 100 pixels = 1 meter (adjust based on your scale)
  return pixels / 100;
};

export const convertMetersToPixels = (meters) => {
  // Assuming 1 meter = 100 pixels (adjust based on your scale)
  return meters * 100;
};

// Convert frontend floor data to backend format
export const convertFloorToBackendFormat = (floorData) => {
  console.log('🔄 Converting floor data to backend format:', floorData);
  
  // Validate input
  if (!floorData) {
    throw new Error('floorData is required');
  }
  
  if (!floorData.name) {
    throw new Error('floorData.name is required');
  }
  
  if (!floorData.projectId) {
    throw new Error('floorData.projectId is required');
  }
  
  console.log('🔄 Floor data fields:', {
    name: floorData.name,
    description: floorData.description,
    shape: floorData.shape,
    projectId: floorData.projectId
  });
  
  // Map frontend shape values to backend enum values
  const mapShapeToBackend = (shape) => {
    switch (shape) {
      case 'rectangle':
        return 'rect';
      case 'polygon':
        return 'polygon';
      default:
        return 'rect'; // Default fallback
    }
  };
  
  // Use heightInMeters for shape height, floorHeight for floor height
  const shapeWidth = floorData.widthInMeters || convertPixelsToMeters(floorData.width);
  const shapeHeight = floorData.heightInMeters || convertPixelsToMeters(floorData.height);
  const floorHeight = floorData.floorHeight || floorData.height || 3200; // Support both floorHeight and height
  
  // Get current user ID from localStorage
  const storedUser = localStorage.getItem("user");
  let currentUserId = null;
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      currentUserId = user.user_id || user._id;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  
  const backendData = {
    projectId: floorData.projectId,
    name: floorData.name,
    description: floorData.description || `${floorData.name} - ${floorData.shape || 'rectangle'} floor`,
    createdBy: currentUserId, // Add createdBy field
    shape: {
      type: mapShapeToBackend(floorData.shape),
      coordinates: floorData.coordinates || floorData.points || [
        { x: floorData.x, y: floorData.y },
        { x: floorData.x + floorData.width, y: floorData.y },
        { x: floorData.x + floorData.width, y: floorData.y + floorData.height },
        { x: floorData.x, y: floorData.y + floorData.height }
      ],
      width: shapeWidth,
      height: shapeHeight
    },
    height: (floorHeight || 3200) / 1000, // Convert mm to meters
    material: floorData.material || 'RCC',
    slabThickness: (floorData.slabThickness || 200) / 1000, // Convert mm to meters (200mm = 0.2m)
    unit: 'm', // Add missing required field
    level: floorData.level || 0,
    source: floorData.source || 'manual',
    layer: floorData.layer || 'A-FLOR'
  };
  
  console.log('✅ Backend floor data:', backendData);
  return backendData;
};

// Convert backend floor data to frontend format
export const convertFloorFromBackendFormat = (backendFloor) => {
  console.log('🔄 Converting backend floor to frontend format:', backendFloor);
  
  // Map backend shape type to frontend shape type
  const mapShapeToFrontend = (shapeType) => {
    switch (shapeType) {
      case 'rect':
        return 'rectangle';
      case 'polygon':
        return 'polygon';
      default:
        return 'rectangle';
    }
  };

  const frontendFloor = {
    id: backendFloor._id || backendFloor.id,
    name: backendFloor.name,
    shape: mapShapeToFrontend(backendFloor.shape?.type),
    x: backendFloor.shape?.coordinates?.[0]?.x || 0,
    y: backendFloor.shape?.coordinates?.[0]?.y || 0,
    width: convertMetersToPixels(backendFloor.shape?.width || 0),
    height: convertMetersToPixels(backendFloor.shape?.height || 0),
    widthInMeters: backendFloor.shape?.width || 0,
    heightInMeters: backendFloor.shape?.height || 0,
    areaSqM: (backendFloor.shape?.width || 0) * (backendFloor.shape?.height || 0),
    floorHeight: backendFloor.height || 3.2,
    slabThickness: backendFloor.slabThickness || 0.2,
    material: backendFloor.material || 'RCC',
    layer: backendFloor.layer || 'A-FLOR',
    source: backendFloor.source || 'manual',
    level: backendFloor.level || 0,
    projectId: backendFloor.projectId,
    createdAt: backendFloor.createdAt,
    updatedAt: backendFloor.updatedAt,
    // Add points for polygon shapes
    points: backendFloor.shape?.coordinates || []
  };
  
  console.log('✅ Frontend floor data:', frontendFloor);
  return frontendFloor;
};

// Convert frontend room data to backend format
export const convertRoomToBackendFormat = (roomData) => {
  console.log('🔄 Converting room to backend format:', roomData);
  
  // Validate that we have a real MongoDB ObjectId for floorId
  const floorId = roomData.floorId;
  if (!floorId || typeof floorId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(floorId)) {
    throw new Error(`Invalid floorId: ${floorId}. Must be a valid MongoDB ObjectId (24 hex characters).`);
  }
  
  // Convert pixel coordinates to meters
  const xInMeters = convertPixelsToMeters(roomData.x || 0);
  const yInMeters = convertPixelsToMeters(roomData.y || 0);
  const widthInMeters = convertPixelsToMeters(roomData.width || 0);
  const heightInMeters = convertPixelsToMeters(roomData.height || 0);
  
  const backendData = {
    name: roomData.name,
    description: roomData.description || '',
    floorId: floorId, // Use the real MongoDB ObjectId
    projectId: roomData.projectId,
    geometry: {
      x: xInMeters,
      y: yInMeters,
      width: widthInMeters,
      height: heightInMeters,
      area: widthInMeters * heightInMeters
    },
    shape: roomData.shape || 'rectangle',
    roomType: roomData.roomType || 'Residential',
    wallThickness: roomData.wallThickness || 0.2,
    falseCeiling: roomData.falseCeiling || '',
    autoGenerateWalls: true
  };
  
  console.log('✅ Backend room data:', backendData);
  return backendData;
};

// Convert backend room data to frontend format
export const convertRoomFromBackendFormat = (backendRoom) => {
  // Convert meters back to pixels for frontend
  const xInPixels = convertMetersToPixels(backendRoom.geometry?.x || 0);
  const yInPixels = convertMetersToPixels(backendRoom.geometry?.y || 0);
  const widthInPixels = convertMetersToPixels(backendRoom.geometry?.width || 0);
  const heightInPixels = convertMetersToPixels(backendRoom.geometry?.height || 0);
  
  return {
    id: backendRoom._id || backendRoom.id,
    name: backendRoom.name,
    description: backendRoom.description || '',
    floorId: backendRoom.floorId,
    projectId: backendRoom.projectId,
    x: xInPixels,
    y: yInPixels,
    width: widthInPixels,
    height: heightInPixels,
    area: backendRoom.geometry?.area || 0,
    shape: backendRoom.shape || 'rectangle',
    roomType: backendRoom.roomType || 'Residential',
    wallThickness: backendRoom.wallThickness || 0.2,
    falseCeiling: backendRoom.falseCeiling || '',
    walls: backendRoom.walls || [],
    doors: backendRoom.doors || [],
    windows: backendRoom.windows || [],
    createdAt: backendRoom.createdAt,
    updatedAt: backendRoom.updatedAt
  };
}; 