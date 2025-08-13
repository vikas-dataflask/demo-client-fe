import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  generateFixtureId, 
  selectIsLoading, 
  selectError, 
  selectLastGeneratedId,
  clearError 
} from '../redux/features/app/fixtureSlice';

/**
 * Custom hook for fixture ID generation
 * Provides functions to generate unique fixture IDs and access related state
 */
export const useFixtureId = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  
  // Select state from Redux
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastGeneratedId = useSelector(selectLastGeneratedId);

  /**
   * Generate a new fixture ID for a zone
   * @param {string} zone - The zone name (e.g., "Office 1")
   * @param {string} roomId - The room ID
   * @param {Object} position - The fixture position { x, y }
   * @returns {Promise<string>} - The generated fixture ID
   */
  const generateId = useCallback(async (zone, roomId, position = { x: 0, y: 0 }) => {
    // Input validation
    if (!zone || typeof zone !== 'string' || zone.trim().length === 0) {
      throw new Error('Zone must be a non-empty string');
    }

    if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
      throw new Error('Room ID must be a non-empty string');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Validate position coordinates
    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new Error('Position must have numeric x and y coordinates');
    }

    // Validate position ranges (reasonable canvas bounds)
    if (position.x < 0 || position.y < 0 || position.x > 10000 || position.y > 10000) {
      throw new Error('Position coordinates are out of reasonable range');
    }

    try {
      const result = await dispatch(generateFixtureId({
        zone: zone.trim(),
        projectId,
        roomId: roomId.trim(),
        position
      })).unwrap();

      console.log(`✅ Generated fixture ID: ${result.fixtureId} for zone: ${zone}`);
      return result.fixtureId;
    } catch (error) {
      console.error('❌ Failed to generate fixture ID:', error);
      
      // Provide more specific error messages
      if (error.includes('Zone must be a non-empty string')) {
        throw new Error('Please provide a valid zone name');
      }
      if (error.includes('Room ID must be a non-empty string')) {
        throw new Error('Please provide a valid room ID');
      }
      if (error.includes('Invalid zone name')) {
        throw new Error('The zone name contains invalid characters');
      }
      if (error.includes('Fixture ID already exists')) {
        throw new Error('A fixture with this ID already exists. Please try again.');
      }
      if (error.includes('Position must have numeric')) {
        throw new Error('Invalid position coordinates provided');
      }
      
      throw new Error(error || 'Failed to generate fixture ID. Please try again.');
    }
  }, [dispatch, projectId]);

  /**
   * Clear any error state
   */
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Get the last generated fixture ID
   * @returns {string|null} - The last generated ID or null
   */
  const getLastGeneratedId = useCallback(() => {
    return lastGeneratedId;
  }, [lastGeneratedId]);

  /**
   * Check if fixture ID generation is in progress
   * @returns {boolean} - True if loading, false otherwise
   */
  const isGenerating = useCallback(() => {
    return isLoading;
  }, [isLoading]);

  /**
   * Get the current error message
   * @returns {string|null} - The error message or null
   */
  const getError = useCallback(() => {
    return error;
  }, [error]);

  /**
   * Validate zone name format
   * @param {string} zone - The zone name to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateZone = useCallback((zone) => {
    if (!zone || typeof zone !== 'string' || zone.trim().length === 0) {
      return false;
    }
    
    // Check for reasonable length
    if (zone.trim().length > 100) {
      return false;
    }
    
    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    return validPattern.test(zone.trim());
  }, []);

  /**
   * Validate room ID format
   * @param {string} roomId - The room ID to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateRoomId = useCallback((roomId) => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
      return false;
    }
    
    // Check for reasonable length
    if (roomId.trim().length > 50) {
      return false;
    }
    
    // Check for valid characters (letters, numbers, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    return validPattern.test(roomId.trim());
  }, []);

  return {
    generateId,
    clearError: clearErrorState,
    getLastGeneratedId,
    isGenerating,
    getError,
    validateZone,
    validateRoomId,
    isLoading,
    error,
    lastGeneratedId
  };
};

export default useFixtureId; 