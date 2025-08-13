// Test API connection utility
export const testApiConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    
    const response = await fetch('http://localhost:8000/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ API connection successful:', data);
      return true;
    } else {
      console.error('❌ API connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection error:', error);
    return false;
  }
};

// Test floor API specifically
export const testFloorApi = async () => {
  try {
    console.log('🔍 Testing Floor API...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      return false;
    }
    
    const response = await fetch('http://localhost:8000/api/floors?projectId=test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Floor API response status:', response.status);
    
    if (response.status === 401) {
      console.error('❌ Authentication failed - invalid token');
      return false;
    } else if (response.status === 404) {
      console.log('✅ Floor API endpoint exists (404 expected for invalid projectId)');
      return true;
    } else if (response.ok) {
      console.log('✅ Floor API working correctly');
      return true;
    } else {
      console.error('❌ Floor API error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Floor API connection error:', error);
    return false;
  }
}; 