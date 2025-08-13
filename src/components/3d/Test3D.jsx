import React, { useState } from 'react';
import { generateSampleRoomData } from '../../api/fetchRoomData';
import ThreeViewer from './ThreeViewer';

const Test3D = () => {
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  const handleObjectClick = (objectData) => {
    console.log('Object clicked:', objectData);
    setSelectedObjectId(objectData.id);
  };

  return (
    <div className="h-screen">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">3D Test Page</h1>
        <p>Testing 3D rendering functionality</p>
      </div>
      <div className="h-full">
        <ThreeViewer
          onObjectClick={handleObjectClick}
          selectedObjectId={selectedObjectId}
          showSampleData={true}
        />
      </div>
    </div>
  );
};

export default Test3D; 