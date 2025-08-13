// Redux middleware to log project changes and data clearing
export const projectLoggerMiddleware = store => next => action => {
  const prevState = store.getState();
  
  // Log project-specific actions
  if (action.type === 'floor/setCurrentProjectId') {
    console.log('🔄 Project Change: Floor project ID changed to:', action.payload);
  }
  
  if (action.type === 'rooms/setCurrentProjectId') {
    console.log('🔄 Project Change: Room project ID changed to:', action.payload);
  }
  
  if (action.type === 'floor/clearProjectData') {
    console.log('🧹 Project Data Cleared: Floor data cleared');
  }
  
  if (action.type === 'rooms/clearProjectData') {
    console.log('🧹 Project Data Cleared: Room data cleared');
  }
  
  if (action.type === 'floor/setFloorsFromAPI') {
    console.log('📥 Floor Data Loaded:', {
      projectId: action.payload.projectId,
      floorsCount: action.payload.floors?.length || 0
    });
  }
  
  if (action.type === 'rooms/setRooms') {
    console.log('📥 Room Data Loaded:', {
      projectId: action.payload.projectId,
      roomsCount: action.payload.rooms?.length || 0
    });
  }
  
  // Call the next middleware
  const result = next(action);
  
  // Log state changes for debugging
  const nextState = store.getState();
  
  // Check if floors changed
  if (prevState.floor?.floors !== nextState.floor?.floors) {
    console.log('📊 Floor State Updated:', {
      prevCount: prevState.floor?.floors?.length || 0,
      nextCount: nextState.floor?.floors?.length || 0,
      currentProjectId: nextState.floor?.currentProjectId
    });
  }
  
  // Check if rooms changed
  if (prevState.rooms?.rooms !== nextState.rooms?.rooms) {
    console.log('📊 Room State Updated:', {
      prevCount: prevState.rooms?.rooms?.length || 0,
      nextCount: nextState.rooms?.rooms?.length || 0,
      currentProjectId: nextState.rooms?.currentProjectId
    });
  }
  
  return result;
}; 