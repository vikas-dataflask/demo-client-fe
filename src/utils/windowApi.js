const API_BASE_URL = "http://localhost:8000/api";

// Create a new window
export const createWindow = async (windowData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/windows`, {
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
    console.error('Error creating window:', error);
    throw error;
  }
};

// Get windows for a specific room
export const getWindowsByRoom = async (roomId, projectId, floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/windows/room/${roomId}?projectId=${projectId}&floorId=${floorId}`, {
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
    console.error('Error fetching windows:', error);
    return [];
  }
};

// Get windows for a specific wall
export const getWindowsByWall = async (wallId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/windows/wall/${wallId}`, {
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
    console.error('Error fetching windows by wall:', error);
    return [];
  }
};

// Update window
export const updateWindow = async (windowId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/windows/${windowId}`, {
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
    console.error('Error updating window:', error);
    throw error;
  }
};

// Delete window
export const deleteWindow = async (windowId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/windows/${windowId}`, {
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
    console.error('Error deleting window:', error);
    throw error;
  }
}; 