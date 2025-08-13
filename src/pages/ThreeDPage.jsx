import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ThreeViewer from '../components/3d/ThreeViewer';
import { generateSampleRoomData } from '../api/fetchRoomData';

const ThreeDPage = () => {
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [showSampleData, setShowSampleData] = useState(false);
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // Get current project and floor info
  const currentProject = useSelector((state) => state.project?.currentProject);
  const currentFloor = useSelector((state) => state.floor?.floors?.find(f => f.id === state.floor?.currentFloorId));
  const rooms = useSelector((state) => state.rooms?.rooms || []);

  // Handle object selection from 3D viewer
  const handleObjectClick = (objectData) => {
    console.log('Object selected in 3D:', objectData);
    setSelectedObjectId(objectData.id);
  };

  // Generate sample data for testing
  const handleGenerateSampleData = () => {
    setShowSampleData(true);
    console.log('Generated sample data for 3D testing');
  };

  // Switch to 2D view
  const handleSwitchTo2D = () => {
    const basePath = projectId ? `/project/${projectId}` : '';
    navigate(`${basePath}/file-setup`); // Default to file-setup page
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">3D Visualization</h1>
            <p className="text-sm text-gray-600 mt-1">
              {currentProject?.name ? `Project: ${currentProject.name}` : 'No project selected'} 
              {currentFloor?.name && ` • Floor: ${currentFloor.name}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 2D Toggle Button */}
            <button
              onClick={handleSwitchTo2D}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex items-center gap-2"
              title="Switch to 2D View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              2D View
            </button>
            
            {/* Sample Data Toggle */}
            <button
              onClick={handleGenerateSampleData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {showSampleData ? 'Use Real Data' : 'Load Sample Data'}
            </button>
            
            {/* Export Options */}
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                📷 Screenshot
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                📁 Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* 3D Viewer */}
        <div className="flex-1">
          <ThreeViewer
            onObjectClick={handleObjectClick}
            selectedObjectId={selectedObjectId}
            showSampleData={showSampleData}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Object Properties */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Object Properties</h3>
            
            {selectedObjectId ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Object ID</label>
                  <input
                    type="text"
                    value={selectedObjectId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    value={selectedObjectId.includes('wall') ? 'Wall' : 
                           selectedObjectId.includes('door') ? 'Door' : 
                           selectedObjectId.includes('window') ? 'Window' : 'Unknown'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                </div>
                
                {/* Add more properties based on object type */}
                {selectedObjectId.includes('wall') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>Brick</option>
                      <option>Concrete</option>
                      <option>Drywall</option>
                      <option>Glass</option>
                    </select>
                  </div>
                )}
                
                {selectedObjectId.includes('door') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Door Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>Single</option>
                      <option>Double</option>
                      <option>Sliding</option>
                      <option>Folding</option>
                    </select>
                  </div>
                )}
                
                {selectedObjectId.includes('window') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Window Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>Single</option>
                      <option>Double</option>
                      <option>Fixed</option>
                      <option>Sliding</option>
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🎯</div>
                <p className="text-gray-500 text-sm">Click on an object in the 3D view to see its properties</p>
              </div>
            )}
          </div>

          {/* Scene Statistics */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Scene Statistics</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Rooms:</span>
                <span className="font-medium">{rooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Walls:</span>
                <span className="font-medium">{rooms.length * 4}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Doors:</span>
                <span className="font-medium">{rooms.reduce((sum, room) => sum + (room.doors?.length || 0), 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Windows:</span>
                <span className="font-medium">{rooms.reduce((sum, room) => sum + (room.windows?.length || 0), 0)}</span>
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Camera Controls</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Perspective</option>
                  <option>Orthographic</option>
                  <option>Wireframe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lighting</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Default</option>
                  <option>Studio</option>
                  <option>Outdoor</option>
                  <option>Night</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                  Reset Camera
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                  Fit to View
                </button>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Help</h3>
            
            <div className="space-y-2 text-xs text-gray-600">
              <p><strong>Mouse Controls:</strong></p>
              <p>• Left click: Select objects</p>
              <p>• Right click + drag: Rotate camera</p>
              <p>• Middle click + drag: Pan camera</p>
              <p>• Scroll: Zoom in/out</p>
              
              <p className="mt-4"><strong>Keyboard Shortcuts:</strong></p>
              <p>• R: Reset camera</p>
              <p>• F: Fit to view</p>
              <p>• W: Toggle wireframe</p>
              <p>• H: Toggle helpers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDPage; 