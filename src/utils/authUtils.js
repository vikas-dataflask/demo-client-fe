/**
 * Utility functions for authentication token management
 */

/**
 * Get the authentication token from localStorage or Redux store
 * Checks both the separate token storage and the user object
 * @returns {string|null} The token or null if not found
 */
export const getAuthToken = () => {
  // First try to get the separate token
  let token = localStorage.getItem('token');
  
  // If no separate token, try to get it from the user object in localStorage
  if (!token) {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userObj = JSON.parse(user);
        token = userObj.token;
      }
    } catch (e) {
      console.error('Error parsing user object from localStorage:', e);
    }
  }
  
  // If still no token, try to get it from Redux Persist storage
  if (!token) {
    try {
      const persistRoot = localStorage.getItem('persist:root');
      if (persistRoot) {
        const persistData = JSON.parse(persistRoot);
        if (persistData.user) {
          const userData = JSON.parse(persistData.user);
          token = userData.token;
        }
      }
    } catch (e) {
      console.error('Error parsing Redux Persist data:', e);
    }
  }
  
  return token;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  
  // Check if user exists in localStorage
  let user = localStorage.getItem('user');
  
  // If no user in localStorage, check Redux Persist
  if (!user) {
    try {
      const persistRoot = localStorage.getItem('persist:root');
      if (persistRoot) {
        const persistData = JSON.parse(persistRoot);
        if (persistData.user) {
          const userData = JSON.parse(persistData.user);
          // Check if user has required fields
          if (userData._id || userData.email || userData.username) {
            user = 'exists'; // Just mark that user exists
          }
        }
      }
    } catch (e) {
      console.error('Error checking Redux Persist user data:', e);
    }
  }
  
  return !!(token && user);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('termsAccepted');
  localStorage.removeItem('termsAcceptedDate');
  
  // Also clear Redux Persist data for user
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (persistRoot) {
      const persistData = JSON.parse(persistRoot);
      delete persistData.user;
      localStorage.setItem('persist:root', JSON.stringify(persistData));
    }
  } catch (e) {
    console.error('Error clearing Redux Persist data:', e);
  }
}; 