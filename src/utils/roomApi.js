// Room API utility for backend operations

const API_BASE_URL = "http://localhost:8000/api";

// Create a new room with comprehensive data
export const createRoom = async (roomData) => {
  try {
    console.log('roomApi: Creating room with data:', roomData);
    
    // Ensure required fields are present
    const requiredFields = ['name', 'floorId', 'projectId', 'geometry'];
    for (const field of requiredFields) {
      if (!roomData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate geometry structure
    if (!roomData.geometry.x || !roomData.geometry.y || !roomData.geometry.width || !roomData.geometry.height) {
      throw new Error('Invalid geometry: missing x, y, width, or height');
    }

    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('roomApi: Backend error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('roomApi: Room created successfully:', result);
    return result.data;
  } catch (error) {
    console.error('roomApi: Error creating room:', error);
    throw error;
  }
};

// Get all rooms for a specific floor
export const getRoomsByFloor = async (floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/floor/${floorId}`, {
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
    console.error('Error fetching rooms:', error);
    return [];
  }
};

// Get a specific room by ID
export const getRoomById = async (roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
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
    console.error('Error fetching room:', error);
    throw error;
  }
};

// Update room properties
export const updateRoom = async (roomId, updates) => {
  try {
    console.log('roomApi: Updating room:', roomId, 'with updates:', updates);
    
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('roomApi: Backend error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('roomApi: Room updated successfully:', result);
    return result.data;
  } catch (error) {
    console.error('roomApi: Error updating room:', error);
    throw error;
  }
};

// Save room to backend (create or update)
export const saveRoomToBackend = async (roomData, isNewRoom = false) => {
  try {
    console.log('roomApi: saveRoomToBackend called with isNewRoom:', isNewRoom, 'roomData:', roomData);
    
    if (isNewRoom) {
      console.log('roomApi: Creating new room');
      return await createRoom(roomData);
    } else {
      console.log('roomApi: Updating existing room with ID:', roomData.id);
      return await updateRoom(roomData.id, roomData);
    }
  } catch (error) {
    console.error('roomApi: Error saving room to backend:', error);
    throw error;
  }
};

// Delete room (soft delete)
export const deleteRoom = async (roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Wall operations
export const addWallToRoom = async (roomId, wallData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/walls`, {
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
    console.error('Error adding wall:', error);
    throw error;
  }
};

export const updateWallInRoom = async (roomId, wallId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/walls/${wallId}`, {
      method: 'PATCH',
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

export const removeWallFromRoom = async (roomId, wallId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/walls/${wallId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error removing wall:', error);
    throw error;
  }
};

export const markWallAsShared = async (roomId, wallId, sharedWithRoomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/walls/${wallId}/share`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sharedWithRoomId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error marking wall as shared:', error);
    throw error;
  }
};

// Door operations
export const addDoorToRoom = async (roomId, doorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/doors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doorData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error adding door:', error);
    throw error;
  }
};

export const updateDoorInRoom = async (roomId, doorId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/doors/${doorId}`, {
      method: 'PATCH',
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
    console.error('Error updating door:', error);
    throw error;
  }
};

export const removeDoorFromRoom = async (roomId, doorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/doors/${doorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error removing door:', error);
    throw error;
  }
};

// Window operations
export const addWindowToRoom = async (roomId, windowData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/windows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(windowData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error adding window:', error);
    throw error;
  }
};

export const updateWindowInRoom = async (roomId, windowId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/windows/${windowId}`, {
      method: 'PATCH',
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
    console.error('Error updating window:', error);
    throw error;
  }
};

export const removeWindowFromRoom = async (roomId, windowId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/windows/${windowId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error removing window:', error);
    throw error;
  }
};

// Utility operations
export const getRoomsWithSharedWalls = async (floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/floor/${floorId}/shared-walls`, {
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
    console.error('Error fetching rooms with shared walls:', error);
    return [];
  }
};

export const generateWallsFromGeometry = async (roomId, wallThickness) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/generate-walls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallThickness })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error generating walls:', error);
    throw error;
  }
};

// Helper function to create room data structure
export const createRoomData = ({
  name,
  description,
  floorId,
  projectId,
  geometry,
  shape = 'rectangle',
  roomType = 'Residential',
  wallThickness = 200,
  falseCeiling = '',
  autoGenerateWalls = true
}) => {
  return {
    name,
    description,
    floorId,
    projectId,
    geometry,
    shape,
    roomType,
    wallThickness,
    falseCeiling,
    autoGenerateWalls
  };
};

// Helper function to create wall data structure
export const createWallData = ({
  start,
  end,
  thickness = 200,
  height = 3000,
  type = 'Partition',
  material = 'Brick',
  sharedWithRoomId = null
}) => {
  return {
    start,
    end,
    thickness,
    height,
    type,
    material,
    sharedWithRoomId
  };
};

// Helper function to create door data structure
export const createDoorData = ({
  wallId,
  position,
  width = 900,
  height = 2100,
  sillHeight = 0,
  type = 'Single',
  material = 'Wood',
  direction = 'Left'
}) => {
  return {
    wallId,
    position,
    width,
    height,
    sillHeight,
    type,
    material,
    direction
  };
};

// Helper function to create window data structure
export const createWindowData = ({
  wallId,
  position,
  width = 1200,
  height = 1200,
  sillHeight = 900,
  type = 'Single',
  material = 'Aluminum',
  glazing = 'Double'
}) => {
  return {
    wallId,
    position,
    width,
    height,
    sillHeight,
    type,
    material,
    glazing
  };
}; 