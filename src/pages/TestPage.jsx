import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Application Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">✅ Application Status</h2>
          <div className="space-y-2">
            <p className="text-green-600">✓ Frontend server is running</p>
            <p className="text-green-600">✓ React components are loading</p>
            <p className="text-green-600">✓ Tailwind CSS is working</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Links</h2>
          <div className="space-y-2">
            <a 
              href="/3d" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Test 3D Page
            </a>
            <a 
              href="/file-setup" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Test File Setup Page
            </a>
            <a 
              href="/home" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Test Home Page
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Debug Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Frontend URL: {window.location.origin}</p>
            <p>Current Path: {window.location.pathname}</p>
            <p>User Agent: {navigator.userAgent}</p>
            <p>Timestamp: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 