// Test script for room creation functionality
const API_BASE_URL = "http://localhost:8000/api";

// Test room data
const testRoomData = {
  name: `Test Room ${Date.now()}`, // Make name unique
  description: "Test room for debugging",
  floorId: "test-floor-1",
  projectId: "test-project-1",
  geometry: {
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    area: 30000
  },
  shape: "rectangle",
  roomType: "Residential",
  wallThickness: 200,
  falseCeiling: "",
  autoGenerateWalls: true
};

// Test room creation
async function testRoomCreation() {
  try {
    console.log('Testing room creation...');
    console.log('Room data:', testRoomData);
    
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRoomData)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      return;
    }

    const result = await response.json();
    console.log('Success response:', result);
    
    // Test getting rooms for the floor
    console.log('\nTesting get rooms by floor...');
    const getResponse = await fetch(`${API_BASE_URL}/rooms/floor/${testRoomData.floorId}`);
    
    if (getResponse.ok) {
      const roomsResult = await getResponse.json();
      console.log('Rooms for floor:', roomsResult);
    } else {
      console.error('Error getting rooms:', await getResponse.json());
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRoomCreation(); 