import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ThreeRenderer from './ThreeRenderer';
import { getRoomDataFromState, generateSampleRoomData } from '../../api/fetchRoomData';

const ThreeViewer = ({ onObjectClick, selectedObjectId }) => {
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('3d'); // '3d', '2d', 'split'
  const [cameraPosition, setCameraPosition] = useState('isometric'); // 'isometric', 'top', 'front', 'side'
  
  // Get data from Redux state
  const state = useSelector((state) => state);
  const currentFloorId = useSelector((state) => state.floor?.currentFloorId);
  const projectId = useSelector((state) => state.project?.currentProjectId);

  // Load room data
  useEffect(() => {
    const loadRoomData = async () => {
      setIsLoading(true);
      
      try {
        // Try to get data from Redux state first
        const stateData = getRoomDataFromState(state);
        
        if (stateData.success && stateData.data.rooms.length > 0) {
          setRoomData(stateData.data);
        } else {
          // Fallback to sample data for testing
          console.log('No room data found in state, using sample data');
          const sampleData = generateSampleRoomData();
          setRoomData(sampleData);
        }
      } catch (error) {
        console.error('Error loading room data:', error);
        // Use sample data as fallback
        const sampleData = generateSampleRoomData();
        setRoomData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoomData();
  }, [state, currentFloorId, projectId]);

  // Handle object selection
  const handleObjectClick = (objectData) => {
    console.log('3D Object clicked:', objectData);
    if (onObjectClick) {
      onObjectClick(objectData);
    }
  };

  // Camera position presets
  const cameraPresets = {
    isometric: { x: 50, y: 30, z: 50 },
    top: { x: 0, y: 100, z: 0 },
    front: { x: 0, y: 0, z: 100 },
    side: { x: 100, y: 0, z: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 3D Scene...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 3D Viewer Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800">3D Viewer</h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3d">3D</option>
                <option value="2d">2D</option>
                <option value="split">Split</option>
              </select>
            </div>

            {/* Camera Position */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Camera:</span>
              <select
                value={cameraPosition}
                onChange={(e) => setCameraPosition(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="isometric">Isometric</option>
                <option value="top">Top</option>
                <option value="front">Front</option>
                <option value="side">Side</option>
              </select>
            </div>
          </div>

          {/* Statistics */}
          {roomData && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Rooms: {roomData.metadata?.totalRooms || roomData.rooms?.length || 0}</span>
              <span>Walls: {roomData.metadata?.totalWalls || 0}</span>
              <span>Doors: {roomData.metadata?.totalDoors || 0}</span>
              <span>Windows: {roomData.metadata?.totalWindows || 0}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-2 text-xs text-gray-500">
          <span className="mr-4">🖱️ Left click: Select objects</span>
          <span className="mr-4">🖱️ Right click + drag: Rotate camera</span>
          <span className="mr-4">🖱️ Middle click + drag: Pan camera</span>
          <span>🖱️ Scroll: Zoom in/out</span>
        </div>
      </div>

      {/* 3D Renderer */}
      <div className="flex-1 relative">
        {viewMode === '3d' && (
          <ThreeRenderer
            roomData={roomData}
            onObjectClick={handleObjectClick}
            selectedObjectId={selectedObjectId}
            cameraPosition={cameraPresets[cameraPosition]}
          />
        )}
        
        {viewMode === '2d' && (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <p className="text-gray-600 mb-2">2D View Mode</p>
              <p className="text-sm text-gray-500">Switch to 3D mode to see the 3D visualization</p>
            </div>
          </div>
        )}
        
        {viewMode === 'split' && (
          <div className="grid grid-cols-2 h-full">
            <div className="border-r border-gray-200">
              <ThreeRenderer
                roomData={roomData}
                onObjectClick={handleObjectClick}
                selectedObjectId={selectedObjectId}
                cameraPosition={cameraPresets[cameraPosition]}
              />
            </div>
            <div className="flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-600 mb-2">2D Canvas</p>
                <p className="text-sm text-gray-500">2D view would be integrated here</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Object Info Panel */}
      {selectedObjectId && (
        <div className="bg-white border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Selected Object</h3>
          <div className="text-xs text-gray-600">
            <p>ID: {selectedObjectId}</p>
            <p>Type: {selectedObjectId.includes('wall') ? 'Wall' : 
                      selectedObjectId.includes('door') ? 'Door' : 
                      selectedObjectId.includes('window') ? 'Window' : 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeViewer; 