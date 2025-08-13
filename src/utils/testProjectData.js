// Test utility for project data loading and persistence
export const testProjectData = {
  // Test floor data structure
  testFloorData: {
    id: 'test-floor-1',
    name: 'Test Floor',
    level: 0,
    height: 3200,
    shapes: [],
    canvasSettings: {
      scale: 1,
      position: { x: 0, y: 0 },
      grid: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: 'test-project-1'
  },

  // Test room data structure
  testRoomData: {
    id: 'test-room-1',
    name: 'Test Room',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    area: 30000,
    roomType: 'Office',
    wallThickness: 0.2,
    falseCeiling: 'Yes',
    floorId: 'test-floor-1',
    createdAt: new Date().toISOString()
  },

  // Test project data loading
  testProjectLoading: (store, projectId) => {
    console.log('🧪 Testing project data loading for:', projectId);
    
    const state = store.getState();
    const floorState = state.floor;
    const roomState = state.rooms;
    
    console.log('📊 Current floor state:', {
      currentProjectId: floorState.currentProjectId,
      floorsCount: floorState.floors.length,
      currentFloorId: floorState.currentFloorId,
      isLoading: floorState.isLoading,
      error: floorState.error
    });
    
    console.log('📊 Current room state:', {
      currentProjectId: roomState.currentProjectId,
      roomsCount: roomState.rooms.length,
      isLoading: roomState.isLoading,
      error: roomState.error
    });
    
    return {
      floors: floorState.floors,
      rooms: roomState.rooms,
      currentFloorId: floorState.currentFloorId,
      isLoading: floorState.isLoading || roomState.isLoading,
      error: floorState.error || roomState.error
    };
  },

  // Test data persistence
  testDataPersistence: (store) => {
    console.log('🧪 Testing data persistence');
    
    const state = store.getState();
    const floorState = state.floor;
    const roomState = state.rooms;
    
    // Check if data is properly structured
    const floorDataValid = Array.isArray(floorState.floors);
    const roomDataValid = Array.isArray(roomState.rooms);
    const projectIdValid = typeof floorState.currentProjectId === 'string' || floorState.currentProjectId === null;
    
    console.log('✅ Data structure validation:', {
      floorDataValid,
      roomDataValid,
      projectIdValid
    });
    
    return {
      floorDataValid,
      roomDataValid,
      projectIdValid,
      floorsCount: floorState.floors.length,
      roomsCount: roomState.rooms.length
    };
  },

  // Test project switching
  testProjectSwitching: (store, newProjectId) => {
    console.log('🧪 Testing project switching to:', newProjectId);
    
    const beforeState = store.getState();
    const beforeFloorCount = beforeState.floor.floors.length;
    const beforeRoomCount = beforeState.rooms.rooms.length;
    
    console.log('📊 Before switching:', {
      projectId: beforeState.floor.currentProjectId,
      floorsCount: beforeFloorCount,
      roomsCount: beforeRoomCount
    });
    
    // Simulate project change (this would normally be done by the hook)
    // For testing, we'll just log the expected behavior
    
    console.log('🔄 Expected behavior after switching:');
    console.log('- Floor data should be cleared and reloaded');
    console.log('- Room data should be cleared and reloaded');
    console.log('- Current project ID should be updated');
    console.log('- Loading states should be set to true');
    
    return {
      beforeProjectId: beforeState.floor.currentProjectId,
      beforeFloorCount,
      beforeRoomCount,
      newProjectId
    };
  },

  // Test error handling
  testErrorHandling: (store) => {
    console.log('🧪 Testing error handling');
    
    const state = store.getState();
    const floorError = state.floor.error;
    const roomError = state.rooms.error;
    
    console.log('📊 Error states:', {
      floorError,
      roomError,
      hasErrors: !!(floorError || roomError)
    });
    
    return {
      floorError,
      roomError,
      hasErrors: !!(floorError || roomError)
    };
  },

  // Comprehensive test
  runComprehensiveTest: (store, projectId) => {
    console.log('🧪 Running comprehensive project data test');
    console.log('='.repeat(50));
    
    const loadingTest = testProjectData.testProjectLoading(store, projectId);
    const persistenceTest = testProjectData.testDataPersistence(store);
    const switchingTest = testProjectData.testProjectSwitching(store, projectId);
    const errorTest = testProjectData.testErrorHandling(store);
    
    console.log('='.repeat(50));
    console.log('📋 Test Summary:');
    console.log('- Loading:', loadingTest.isLoading ? '⏳ Loading...' : '✅ Loaded');
    console.log('- Floors:', persistenceTest.floorsCount);
    console.log('- Rooms:', persistenceTest.roomsCount);
    console.log('- Errors:', errorTest.hasErrors ? '❌ Has errors' : '✅ No errors');
    console.log('- Data valid:', persistenceTest.floorDataValid && persistenceTest.roomDataValid ? '✅ Valid' : '❌ Invalid');
    
    return {
      loadingTest,
      persistenceTest,
      switchingTest,
      errorTest,
      overallSuccess: !loadingTest.isLoading && !errorTest.hasErrors && persistenceTest.floorDataValid && persistenceTest.roomDataValid
    };
  }
}; 