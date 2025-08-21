import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetFloorsByProjectQuery, useGetRoomsByFloorQuery } from '../redux/features/api/floorRoomApi';
import { 
  setFloorsFromAPI, 
  setCurrentProjectId, 
  setLoadingState, 
  setErrorState,
  clearProjectData as clearFloorData,
  setCurrentFloorId
} from '../redux/features/app/floorSlice';
import { 
  setRooms, 
  setCurrentProjectId as setRoomProjectId,
  setLoadingState as setRoomLoadingState,
  setErrorState as setRoomErrorState,
  clearProjectData as clearRoomData 
} from '../redux/features/app/roomSlice';

export const useProjectData = (projectId) => {
  const dispatch = useDispatch();
  
  // Validate projectId
  const isValidProjectId = projectId && 
    typeof projectId === 'string' && 
    projectId.trim() !== '' && 
    projectId !== 'undefined' && 
    projectId !== 'null';
  
  // Get current state
  const currentFloorProjectId = useSelector(state => state.floor?.currentProjectId);
  const currentRoomProjectId = useSelector(state => state.rooms?.currentProjectId);
  const floors = useSelector(state => state.floor?.floors || []);
  const rooms = useSelector(state => state.rooms?.rooms || []);
  const currentFloorId = useSelector(state => state.floor?.currentFloorId);
  
  // Validate currentFloorId for room API - more strict validation
  const isValidFloorId = currentFloorId && 
    typeof currentFloorId === 'string' && 
    currentFloorId.trim() !== '' && 
    currentFloorId !== 'undefined' && 
    currentFloorId !== 'null' &&
    // Don't call room API for temporary floor IDs (created locally)
    !currentFloorId.startsWith('floor-') &&
    // Ensure it's a valid MongoDB ObjectId format (24 hex characters)
    /^[0-9a-fA-F]{24}$/.test(currentFloorId) &&
    // Only call room API if floors have been loaded (prevents race conditions)
    floors.length > 0;
  
  // Manual validation check - log everything
  useEffect(() => {
    console.log('🔍 useProjectData: MANUAL VALIDATION CHECK:', {
      currentFloorId,
      currentFloorIdType: typeof currentFloorId,
      currentFloorIdLength: currentFloorId?.length,
      floorsLength: floors.length,
      floors: floors.map(f => ({ id: f.id, name: f.name })),
      validationChecks: {
        exists: !!currentFloorId,
        isString: typeof currentFloorId === 'string',
        notEmpty: currentFloorId?.trim() !== '',
        notUndefined: currentFloorId !== 'undefined',
        notNull: currentFloorId !== 'null',
        notTemporary: !currentFloorId?.startsWith('floor-'),
        isObjectId: currentFloorId ? /^[0-9a-fA-F]{24}$/.test(currentFloorId) : false,
        floorsLoaded: floors.length > 0
      },
      isValidFloorId,
      wouldSkipRoomAPI: !isValidFloorId || floors.length === 0
    });
  }, [currentFloorId, floors, isValidFloorId]);

  // Debug validation logic
  useEffect(() => {
    console.log('🔍 useProjectData: Floor ID validation debug:', {
      currentFloorId,
      currentFloorIdType: typeof currentFloorId,
      currentFloorIdLength: currentFloorId?.length,
      floorsLength: floors.length,
      isEmpty: !currentFloorId,
      isUndefined: currentFloorId === 'undefined',
      isNull: currentFloorId === 'null',
      startsWithFloor: currentFloorId?.startsWith('floor-'),
      isObjectId: currentFloorId ? /^[0-9a-fA-F]{24}$/.test(currentFloorId) : false,
      isValidFloorId,
      validationSteps: {
        exists: !!currentFloorId,
        isString: typeof currentFloorId === 'string',
        notEmpty: currentFloorId?.trim() !== '',
        notUndefined: currentFloorId !== 'undefined',
        notNull: currentFloorId !== 'null',
        notTemporary: !currentFloorId?.startsWith('floor-'),
        isObjectId: currentFloorId ? /^[0-9a-fA-F]{24}$/.test(currentFloorId) : false,
        floorsLoaded: floors.length > 0
      }
    });
  }, [currentFloorId, isValidFloorId, floors.length]);

  // API queries
  const { 
    data: floorsData, 
    isLoading: floorsLoading, 
    error: floorsError,
    refetch: refetchFloors 
  } = useGetFloorsByProjectQuery(projectId, {
    skip: !isValidProjectId
  });

  // Debug API query execution
  useEffect(() => {
    console.log('🔍 useProjectData: API query execution status:', {
      projectId,
      isValidProjectId,
      skip: !isValidProjectId,
      floorsLoading,
      floorsError: floorsError ? { status: floorsError.status, message: floorsError.message } : null,
      hasFloorsData: !!floorsData,
      floorsDataKeys: floorsData ? Object.keys(floorsData) : [],
      floorsDataLength: floorsData?.data?.length || 0
    });
  }, [projectId, isValidProjectId, floorsLoading, floorsError, floorsData]);

  // Debug API call status
  useEffect(() => {
    console.log('🔍 useProjectData: API call status:', {
      projectId,
      isValidProjectId,
      skipCondition: !isValidProjectId,
      floorsLoading,
      floorsError: floorsError ? { status: floorsError.status, message: floorsError.message } : null,
      hasFloorsData: !!floorsData,
      currentFloorId,
      isValidFloorId,
      roomSkipCondition: !isValidFloorId,
      isTemporaryFloor: currentFloorId?.startsWith('floor-'),
      isObjectId: currentFloorId ? /^[0-9a-fA-F]{24}$/.test(currentFloorId) : false,
      apiCalled: !isValidProjectId ? 'SKIPPED' : floorsLoading ? 'LOADING' : floorsError ? 'ERROR' : floorsData ? 'SUCCESS' : 'PENDING'
    });
  }, [projectId, isValidProjectId, floorsLoading, floorsError, floorsData, currentFloorId, isValidFloorId]);

  const { 
    data: roomsData, 
    isLoading: roomsLoading, 
    error: roomsError,
    refetch: refetchRooms 
  } = useGetRoomsByFloorQuery(currentFloorId, {
    skip: !isValidFloorId || floors.length === 0
  });

  // Debug room API call
  useEffect(() => {
    console.log('🔍 useProjectData: Room API call debug:', {
      currentFloorId,
      isValidFloorId,
      floorsLength: floors.length,
      skipCondition: !isValidFloorId || floors.length === 0,
      roomsLoading,
      roomsError: roomsError ? { 
        status: roomsError.status, 
        message: roomsError.message,
        data: roomsError.data 
      } : null,
      hasRoomsData: !!roomsData,
      apiCalled: (!isValidFloorId || floors.length === 0) ? 'SKIPPED' : roomsLoading ? 'LOADING' : roomsError ? 'ERROR' : roomsData ? 'SUCCESS' : 'PENDING'
    });
  }, [currentFloorId, isValidFloorId, floors.length, roomsLoading, roomsError, roomsData]);

  // Comprehensive error tracking
  useEffect(() => {
    if (roomsError) {
      console.error('🚨 useProjectData: ROOM API ERROR DETECTED:', {
        error: roomsError,
        status: roomsError?.status,
        data: roomsError?.data,
        message: roomsError?.message,
        currentFloorId,
        isValidFloorId,
        floorsLength: floors.length,
        skipCondition: !isValidFloorId || floors.length === 0,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        // Additional debugging
        errorKeys: roomsError ? Object.keys(roomsError) : [],
        dataKeys: roomsError?.data ? Object.keys(roomsError.data) : [],
        fullErrorString: JSON.stringify(roomsError, null, 2)
      });
    }
  }, [roomsError, currentFloorId, isValidFloorId, floors.length]);

  // Debug logging for API responses
  useEffect(() => {
    console.log('🔍 useProjectData: Floors API response:', {
      floorsData,
      hasData: !!floorsData,
      dataType: typeof floorsData,
      isArray: Array.isArray(floorsData),
      hasDataProperty: !!floorsData?.data,
      dataPropertyType: typeof floorsData?.data,
      dataPropertyIsArray: Array.isArray(floorsData?.data),
      keys: floorsData ? Object.keys(floorsData) : [],
      dataLength: floorsData?.data?.length || 0,
      rawData: floorsData
    });
  }, [floorsData]);

  useEffect(() => {
    console.log('🔍 useProjectData: Rooms API response:', {
      roomsData,
      hasData: !!roomsData,
      dataType: typeof roomsData,
      isArray: Array.isArray(roomsData),
      hasDataProperty: !!roomsData?.data,
      dataPropertyType: typeof roomsData?.data,
      dataPropertyIsArray: Array.isArray(roomsData?.data),
      keys: roomsData ? Object.keys(roomsData) : [],
      dataLength: roomsData?.data?.length || 0,
      rawData: roomsData
    });
  }, [roomsData]);

  // Clear room data when floor changes or when floor is invalid
  useEffect(() => {
    if (!isValidFloorId || floors.length === 0) {
      console.log('🧹 useProjectData: Clearing room data - invalid floor ID or no floors:', { currentFloorId, floorsLength: floors.length });
      dispatch(setRooms({ rooms: [], projectId: null }));
      dispatch(setRoomLoadingState(false));
      dispatch(setRoomErrorState(null));
    } else if (currentFloorId && currentFloorId.startsWith('floor-')) {
      console.log('⏭️ useProjectData: Skipping room data load for temporary floor:', currentFloorId);
    }
  }, [isValidFloorId, currentFloorId, floors.length, currentRoomProjectId, dispatch]);

  // Handle floor data from API
  useEffect(() => {
    if (floorsData && isValidProjectId) {
      console.log('✅ useProjectData: Floor data received:', floorsData);
      
      // Handle different possible response structures
      let floors = [];
      if (floorsData.data && Array.isArray(floorsData.data)) {
        floors = floorsData.data;
      } else if (Array.isArray(floorsData)) {
        floors = floorsData;
      } else if (floorsData.floors && Array.isArray(floorsData.floors)) {
        floors = floorsData.floors;
      }
      
      console.log('📊 useProjectData: Processed floors array:', floors);
      
      // Convert backend format to frontend format
      const convertedFloors = floors.map(floor => {
        // Convert backend shape to frontend shape format
        let shapes = [];
        if (floor.shape) {
          const shapeData = {
            id: `shape-${floor._id || floor.id}`,
            type: 'floor',
            shape: floor.shape.type === 'rect' ? 'rectangle' : 'polygon',
            x: floor.shape.coordinates?.[0]?.x || 0,
            y: floor.shape.coordinates?.[0]?.y || 0,
            width: floor.shape.width || 0,
            height: floor.shape.height || 0,
            widthInMeters: floor.shape.width || 0,
            heightInMeters: floor.shape.height || 0,
            areaSqM: (floor.shape.width || 0) * (floor.shape.height || 0),
            points: floor.shape.coordinates || [],
            source: 'api',
            floorHeight: floor.height || 3200,
            slabThickness: 200,
            material: 'RCC',
            layer: 'A-FLOR',
            createdAt: floor.createdAt || new Date().toISOString()
          };
          shapes.push(shapeData);
        }
        
        return {
          id: floor._id || floor.id,
          name: floor.name || '',
          level: floor.level || 0,
          height: floor.height || 3200,
          shapes: shapes, // Use converted shapes
          canvasSettings: {
            scale: 1,
            position: { x: 0, y: 0 },
            grid: true
          },
          createdAt: floor.createdAt || new Date().toISOString(),
          updatedAt: floor.updatedAt || new Date().toISOString(),
          projectId: floor.projectId || projectId
        };
      });

      console.log('🔄 useProjectData: Converted floors for Redux:', convertedFloors);
      console.log('🔄 useProjectData: Dispatching setFloorsFromAPI with:', { floors: convertedFloors, projectId });
      
      // Clear any temporary floors and set the real floors from API
      dispatch(setFloorsFromAPI({ floors: convertedFloors, projectId }));
      dispatch(setLoadingState(false));
      
      console.log('🔄 useProjectData: Dispatched setFloorsFromAPI and setLoadingState(false)');
    }
  }, [floorsData, isValidProjectId, projectId, dispatch]);

  // Handle currentFloorId setting separately to avoid race conditions
  useEffect(() => {
    if (floors.length > 0) {
      // Check if current floor exists in the loaded floors
      const currentFloorExists = floors.find(f => f.id === currentFloorId);
      const shouldSetFirstFloor = !currentFloorId || 
                                 currentFloorId.startsWith('floor-') || 
                                 !/^[0-9a-fA-F]{24}$/.test(currentFloorId) ||
                                 !currentFloorExists;
      
      if (shouldSetFirstFloor) {
        const firstFloor = floors[0];
        console.log('🎯 useProjectData: Setting first floor as current:', firstFloor.id);
        dispatch(setCurrentFloorId(firstFloor.id));
      } else if (currentFloorId && currentFloorExists) {
        console.log('🎯 useProjectData: Keeping current floor selection:', currentFloorId);
      }
    }
  }, [floors, currentFloorId, dispatch]);

  // Handle floor loading errors
  useEffect(() => {
    if (floorsError) {
      console.error('❌ useProjectData: Floor loading error:', floorsError);
      console.error('❌ useProjectData: Floor error details:', {
        status: floorsError.status,
        data: floorsError.data,
        message: floorsError.message,
        error: floorsError.error
      });
      
      // Handle specific error cases
      let errorMessage = 'Failed to load floors';
      if (floorsError.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (floorsError.status === 403) {
        errorMessage = 'Access denied to this project.';
      } else if (floorsError.status === 404) {
        errorMessage = 'Project not found.';
      } else if (floorsError.data?.message) {
        errorMessage = floorsError.data.message;
      } else if (floorsError.message) {
        errorMessage = floorsError.message;
      }
      
      dispatch(setErrorState(errorMessage));
      dispatch(setLoadingState(false));
    }
  }, [floorsError, dispatch]);

  // Handle room data from API
  useEffect(() => {
    if (roomsData && isValidFloorId) {
      console.log('✅ useProjectData: Room data received:', roomsData);
      
      // Handle different possible response structures
      let rooms = [];
      if (roomsData.data && Array.isArray(roomsData.data)) {
        rooms = roomsData.data;
      } else if (Array.isArray(roomsData)) {
        rooms = roomsData;
      } else if (roomsData.rooms && Array.isArray(roomsData.rooms)) {
        rooms = roomsData.rooms;
      }
      
      console.log('📊 useProjectData: Processed rooms array:', rooms);
      
      dispatch(setRooms({ rooms, projectId: currentFloorId }));
      dispatch(setRoomLoadingState(false));
    }
  }, [roomsData, isValidFloorId, currentFloorId, dispatch]);

  // Handle room loading errors
  useEffect(() => {
    if (roomsError) {
      console.error('❌ useProjectData: Room loading error:', roomsError);
      console.error('❌ useProjectData: Room error details:', {
        status: roomsError.status,
        data: roomsError.data,
        message: roomsError.message,
        error: roomsError.error
      });
      
      // Handle specific error cases
      let errorMessage = 'Failed to load rooms';
      if (roomsError.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (roomsError.status === 403) {
        errorMessage = 'Access denied to this floor.';
      } else if (roomsError.status === 404) {
        errorMessage = 'Floor not found.';
      } else if (roomsError.status === 400) {
        errorMessage = 'Invalid floor ID provided.';
      } else if (roomsError.data?.message) {
        errorMessage = roomsError.data.message;
      } else if (roomsError.message) {
        errorMessage = roomsError.message;
      }
      
      dispatch(setRoomErrorState(errorMessage));
      dispatch(setRoomLoadingState(false));
    }
  }, [roomsError, dispatch]);

  // Clear project data when switching projects
  const clearProjectData = useCallback(() => {
    console.log('🧹 useProjectData: Clearing project data');
    dispatch(clearFloorData());
    dispatch(clearRoomData());
  }, [dispatch]);

  // Refetch data
  const refetchProjectData = useCallback(() => {
    console.log('🔄 useProjectData: Refetching project data');
    if (isValidProjectId) {
      refetchFloors();
    }
    if (isValidFloorId) {
      refetchRooms();
    }
  }, [isValidProjectId, isValidFloorId, refetchFloors, refetchRooms]);

  // Convert error objects to strings for display
  const getErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.data?.message) return error.data.message;
    if (error.error) return error.error;
    return 'Unknown error occurred';
  };

  const floorErrorMessage = getErrorMessage(floorsError);
  const roomErrorMessage = getErrorMessage(roomsError);
  const displayError = floorErrorMessage || roomErrorMessage;

  return {
    floors: floors || [],
    rooms: rooms || [],
    currentFloorId,
    isLoading: floorsLoading || roomsLoading,
    error: displayError,
    clearProjectData,
    refetchProjectData,
    hasData: (floors && floors.length > 0) || (rooms && rooms.length > 0)
  };
}; 