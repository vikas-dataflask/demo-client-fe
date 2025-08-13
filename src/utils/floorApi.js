// const API_BASE_URL = import.meta.env.VITE_API_URL;

// // Convert floor shape to backend format for direct floor creation
// const convertFloorToBackendFormat = (floor, levelId) => {
//   // Map frontend shape values to backend enum values
//   const mapShapeToBackend = (shape) => {
//     switch (shape) {
//       case 'rectangle':
//         return 'rect';
//       case 'polygon':
//         return 'polygon';
//       default:
//         return 'rect'; // Default fallback
//     }
//   };

//   // Convert coordinates if they exist
//   const coordinates = floor.points ? floor.points.map(point => ({
//     x: point.x,
//     y: point.y
//   })) : [];

//   // Calculate width and height in meters
//   const widthInMeters = floor.widthInMeters || (floor.width / 100); // Convert pixels to meters
//   const heightInMeters = floor.heightInMeters || (floor.height / 100); // Convert pixels to meters

//   return {
//     projectId: floor.projectId,
//     name: floor.name,
//     description: floor.description || `${floor.name} - ${floor.shape || 'rectangle'} floor`,
//     shape: {
//       type: mapShapeToBackend(floor.shape),
//       coordinates: coordinates,
//       width: widthInMeters,
//       height: heightInMeters
//     },
//     height: (floor.floorHeight || 3200) / 1000, // Convert mm to meters
//     material: floor.material || "RCC",
//     slabThickness: (floor.slabThickness || 200) / 1000, // Convert mm to meters
//     unit: "m", // Add missing required field
//     level: floor.level || 0,
//     source: floor.source || "manual",
//     layer: floor.layer || "A-FLOR"
//   };
// };

// // Convert backend format to floor shape
// const convertFloorFromBackendFormat = (backendFloor) => {
//   try {
//     // Map backend shape type to frontend shape type
//     const mapShapeToFrontend = (shapeType) => {
//       switch (shapeType) {
//         case 'rect':
//           return 'rectangle';
//         case 'polygon':
//           return 'polygon';
//         default:
//           return 'rectangle';
//       }
//     };

//     return {
//       id: backendFloor._id || backendFloor.id,
//       name: backendFloor.name,
//       shape: mapShapeToFrontend(backendFloor.shape?.type),
//       points: backendFloor.shape?.coordinates || [],
//       width: (backendFloor.shape?.width || 0) * 100, // Convert meters to pixels
//       height: (backendFloor.shape?.height || 0) * 100, // Convert meters to pixels
//       widthInMeters: backendFloor.shape?.width || 0,
//       heightInMeters: backendFloor.shape?.height || 0,
//       areaSqM: (backendFloor.shape?.width || 0) * (backendFloor.shape?.height || 0),
//       floorHeight: backendFloor.height || 3.2,
//       slabThickness: backendFloor.slabThickness || 0.2,
//       material: backendFloor.material || "RCC",
//       layer: backendFloor.layer || "A-FLOR",
//       source: backendFloor.source || "manual",
//       level: backendFloor.level || 0,
//       projectId: backendFloor.projectId,
//       createdAt: backendFloor.createdAt,
//       updatedAt: backendFloor.updatedAt
//     };
//   } catch (error) {
//     console.error('Error converting backend floor format:', error);
//     return null;
//   }
// };

// // Update floor shape in backend (updates level description)
// export const updateFloorInBackend = async (floorId, floorData, levelId) => {
//   try {
//     // For now, we'll use a default level ID since floors are stored in level descriptions
//     const defaultLevelId = levelId || '507f1f77bcf86cd799439011';
    
//     const backendData = convertFloorToBackendFormat(floorData, defaultLevelId);
    
//     const response = await fetch(`${API_BASE_URL}/levels/${defaultLevelId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         // Add Authorization header when authentication is implemented
//         // 'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(backendData)
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Floor updated in backend:', result);
//     return result;
//   } catch (error) {
//     console.error('Error updating floor in backend:', error);
//     // For now, let's not throw the error to prevent frontend crashes
//     // Instead, just log it and continue
//     console.warn('Backend update failed, continuing with frontend state only');
//     return null;
//   }
// };

// // Get floors for a level
// export const getFloorsForLevel = async (levelId) => {
//   try {
//     const defaultLevelId = levelId || '507f1f77bcf86cd799439011';
    
//     const response = await fetch(`${API_BASE_URL}/levels/${defaultLevelId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         // Add Authorization header when authentication is implemented
//         // 'Authorization': `Bearer ${token}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Level fetched from backend:', result);
    
//     // Convert backend format to frontend format
//     const floor = convertFloorFromBackendFormat(result.data);
//     return floor ? [floor] : [];
//   } catch (error) {
//     console.error('Error fetching floors from backend:', error);
//     // Return empty array instead of throwing
//     return [];
//   }
// };

// // Create new floor in backend (creates/updates level)
// export const createFloorInBackend = async (floorData, levelId) => {
//   try {
//     const defaultLevelId = levelId || '507f1f77bcf86cd799439011';
    
//     const backendData = convertFloorToBackendFormat(floorData, defaultLevelId);
    
//     const response = await fetch(`${API_BASE_URL}/levels/${defaultLevelId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         // Add Authorization header when authentication is implemented
//         // 'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(backendData)
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Floor created in backend:', result);
//     return convertFloorFromBackendFormat(result.data);
//   } catch (error) {
//     console.error('Error creating floor in backend:', error);
//     // For now, let's not throw the error to prevent frontend crashes
//     console.warn('Backend creation failed, continuing with frontend state only');
//     return null;
//   }
// };

// // Delete floor from backend (clears level description)
// export const deleteFloorFromBackend = async (floorId) => {
//   try {
//     const defaultLevelId = '507f1f77bcf86cd799439011';
    
//     const response = await fetch(`${API_BASE_URL}/levels/${defaultLevelId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         // Add Authorization header when authentication is implemented
//         // 'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         description: JSON.stringify({ floors: [] })
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     console.log('Floor deleted from backend:', floorId);
//     return true;
//   } catch (error) {
//     console.error('Error deleting floor from backend:', error);
//     // For now, let's not throw the error to prevent frontend crashes
//     console.warn('Backend deletion failed, continuing with frontend state only');
//     return false;
//   }
// }; 