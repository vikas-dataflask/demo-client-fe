import React from 'react';
import { useSelector } from 'react-redux';

const RoomDebugPanel = () => {
  const rooms = useSelector((state) => state.rooms?.rooms || []);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const floors = useSelector((state) => state.floor.floors);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Room Debug Info</h3>
      <div className="space-y-1">
        <p><strong>Current Floor ID:</strong> {currentFloorId || 'None'}</p>
        <p><strong>Total Floors:</strong> {floors.length}</p>
        <p><strong>Total Rooms:</strong> {rooms.length}</p>
        <p><strong>Rooms on Current Floor:</strong> {rooms.filter(r => r.floorId === currentFloorId).length}</p>
      </div>
      
      {rooms.length > 0 && (
        <div className="mt-2">
          <p className="font-bold">Room Details:</p>
          {rooms.slice(0, 3).map((room, index) => (
            <div key={room.id} className="text-xs">
              <p>• {room.name || 'Unnamed'} (ID: {room.id}) - Floor: {room.floorId}</p>
            </div>
          ))}
          {rooms.length > 3 && <p>... and {rooms.length - 3} more</p>}
        </div>
      )}
    </div>
  );
};

export default RoomDebugPanel; 