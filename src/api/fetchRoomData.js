import { getRoomsByFloor } from '../utils/roomApi';

// Fetch structured room data for 3D rendering
export const fetchRoomDataFor3D = async (floorId, projectId) => {
  try {
    // Fetch rooms from backend
    const rooms = await getRoomsByFloor(floorId);
    
    // Transform rooms to 3D-compatible format
    const rooms3D = rooms.map(room => ({
      id: room.id || room._id,
      name: room.name,
      x: room.geometry?.x || room.x || 0,
      y: room.geometry?.y || room.y || 0,
      width: room.geometry?.width || room.width || 0,
      height: room.geometry?.height || room.height || 0,
      wallHeight: room.wallHeight || 3000,
      wallThickness: room.wallThickness || 200,
      roomType: room.roomType || 'Residential',
      falseCeiling: room.falseCeiling || '',
      // Extract walls, doors, and windows from room data
      walls: room.walls || [],
      doors: room.doors || [],
      windows: room.windows || []
    }));
    
    return {
      success: true,
      data: {
        floorId,
        projectId,
        rooms: rooms3D,
        metadata: {
          totalRooms: rooms3D.length,
          totalWalls: rooms3D.reduce((sum, room) => sum + (room.walls?.length || 0), 0),
          totalDoors: rooms3D.reduce((sum, room) => sum + (room.doors?.length || 0), 0),
          totalWindows: rooms3D.reduce((sum, room) => sum + (room.windows?.length || 0), 0)
        }
      }
    };
  } catch (error) {
    console.error('Error fetching room data for 3D:', error);
    return {
      success: false,
      error: error.message,
      data: {
        floorId,
        projectId,
        rooms: [],
        metadata: {
          totalRooms: 0,
          totalWalls: 0,
          totalDoors: 0,
          totalWindows: 0
        }
      }
    };
  }
};

// Fetch room data from Redux state (for real-time 3D updates)
export const getRoomDataFromState = (state) => {
  try {
    const rooms = state.rooms || [];
    const currentFloor = state.floor?.floors?.find(f => f.id === state.floor?.currentFloorId);
    
    // Transform rooms to 3D-compatible format
    const rooms3D = rooms.map(room => ({
      id: room.id || room._id,
      name: room.name,
      x: room.x || 0,
      y: room.y || 0,
      width: room.width || 0,
      height: room.height || 0,
      wallHeight: room.wallHeight || 3000,
      wallThickness: room.wallThickness || 200,
      roomType: room.roomType || 'Residential',
      falseCeiling: room.falseCeiling || '',
      // For now, use empty arrays - these will be populated from backend
      walls: [],
      doors: [],
      windows: []
    }));
    
    // Create floor data
    const floorData = currentFloor ? {
      width: currentFloor.width || 40000,
      height: currentFloor.height || 25000,
      thickness: currentFloor.thickness || 200,
      elevation: currentFloor.elevation || 0
    } : {
      width: 40000,
      height: 25000,
      thickness: 200,
      elevation: 0
    };
    
    return {
      success: true,
      data: {
        floor: floorData,
        rooms: rooms3D,
        metadata: {
          totalRooms: rooms3D.length,
          totalWalls: rooms3D.reduce((sum, room) => sum + (room.walls?.length || 0), 0),
          totalDoors: rooms3D.reduce((sum, room) => sum + (room.doors?.length || 0), 0),
          totalWindows: rooms3D.reduce((sum, room) => sum + (room.windows?.length || 0), 0)
        }
      }
    };
  } catch (error) {
    console.error('Error getting room data from state:', error);
    return {
      success: false,
      error: error.message,
      data: {
        floor: { width: 40000, height: 25000, thickness: 200, elevation: 0 },
        rooms: [],
        metadata: {
          totalRooms: 0,
          totalWalls: 0,
          totalDoors: 0,
          totalWindows: 0
        }
      }
    };
  }
};

// Validate room data structure
export const validateRoomData = (roomData) => {
  const errors = [];
  
  if (!roomData.floor) {
    errors.push('Floor data is missing');
  }
  
  if (!Array.isArray(roomData.rooms)) {
    errors.push('Rooms data is not an array');
  }
  
  roomData.rooms?.forEach((room, index) => {
    if (!room.id) {
      errors.push(`Room ${index} is missing ID`);
    }
    if (typeof room.x !== 'number' || typeof room.y !== 'number') {
      errors.push(`Room ${room.id} has invalid coordinates`);
    }
    if (typeof room.width !== 'number' || typeof room.height !== 'number') {
      errors.push(`Room ${room.id} has invalid dimensions`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate sample room data for testing
export const generateSampleRoomData = () => {
  return {
    floor: {
      width: 40000,
      height: 25000,
      thickness: 200,
      elevation: 0
    },
    rooms: [
      {
        id: 'room-1',
        name: 'Living Room',
        x: 1000,
        y: 1000,
        width: 4000,
        height: 5000,
        wallHeight: 3000,
        wallThickness: 200,
        roomType: 'Residential',
        falseCeiling: '',
        walls: [],
        doors: [
          {
            id: 'door-1',
            x: 1200,
            y: 1000,
            width: 900,
            height: 2100,
            sillHeight: 0,
            type: 'Single',
            material: 'Wood'
          }
        ],
        windows: [
          {
            id: 'window-1',
            x: 2500,
            y: 1000,
            width: 1200,
            height: 1500,
            sillHeight: 900,
            type: 'Double',
            material: 'Aluminum'
          }
        ]
      },
      {
        id: 'room-2',
        name: 'Kitchen',
        x: 6000,
        y: 1000,
        width: 3000,
        height: 4000,
        wallHeight: 3000,
        wallThickness: 200,
        roomType: 'Residential',
        falseCeiling: '',
        walls: [],
        doors: [],
        windows: []
      }
    ]
  };
}; 