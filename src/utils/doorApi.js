const API_BASE_URL = "http://localhost:8000/api";

// Create a new door
export const createDoor = async (doorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doors`, {
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
    console.error('Error creating door:', error);
    throw error;
  }
};

// Get doors for a specific room
export const getDoorsByRoom = async (roomId, projectId, floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doors/room/${roomId}?projectId=${projectId}&floorId=${floorId}`, {
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
    console.error('Error fetching doors:', error);
    return [];
  }
};

// Get doors for a specific wall
export const getDoorsByWall = async (wallId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doors/wall/${wallId}`, {
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
    console.error('Error fetching doors by wall:', error);
    return [];
  }
};

// Update door
export const updateDoor = async (doorId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doors/${doorId}`, {
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
    console.error('Error updating door:', error);
    throw error;
  }
};

// Delete door
export const deleteDoor = async (doorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doors/${doorId}`, {
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
    console.error('Error deleting door:', error);
    throw error;
  }
}; 