import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWall } from '../../redux/features/app/wallSlice';

const WallPropertiesPanel = ({ selectedWallId, onClose }) => {
  const dispatch = useDispatch();
  const walls = useSelector((state) => state.walls);
  const rooms = useSelector((state) => state.rooms);
  
  const selectedWall = walls.find(wall => wall.id === selectedWallId);
  
  const [formData, setFormData] = useState({
    thickness: 200,
    type: 'RCC'
  });

  useEffect(() => {
    if (selectedWall) {
      setFormData({
        thickness: selectedWall.thickness,
        type: selectedWall.type
      });
    }
  }, [selectedWall]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'thickness' ? parseInt(value) : value
    }));
  };

  const handleSave = () => {
    if (selectedWall) {
      dispatch(updateWall({
        id: selectedWall.id,
        updates: {
          thickness: formData.thickness,
          type: formData.type
        }
      }));
    }
  };

  const getRoomNames = (roomIds) => {
    return roomIds.map(roomId => {
      const room = rooms.find(r => r.id === roomId);
      return room ? room.name || `Room ${roomId.slice(-4)}` : `Room ${roomId.slice(-4)}`;
    });
  };

  const wallTypes = [
    { value: 'RCC', label: 'RCC (Reinforced Concrete)' },
    { value: 'Brick', label: 'Brick' },
    { value: 'Glass', label: 'Glass' },
    { value: 'Wood', label: 'Wood' },
    { value: 'Steel', label: 'Steel' },
    { value: 'Drywall', label: 'Drywall' },
    { value: 'Stone', label: 'Stone' }
  ];

  if (!selectedWall) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-sm">Select a wall to view properties</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Wall Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <hr className="border-gray-200" />

      {/* Wall Information */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wall ID
          </label>
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            {selectedWall.id.slice(-8)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Connected Rooms
          </label>
          <div className="space-y-1">
            {getRoomNames(selectedWall.roomIds).map((roomName, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200"
              >
                {roomName}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wall Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {wallTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thickness (mm)
          </label>
          <input
            type="number"
            name="thickness"
            value={formData.thickness}
            onChange={handleChange}
            min="50"
            max="1000"
            step="10"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Range: 50mm - 1000mm
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wall Length
          </label>
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            {Math.sqrt(
              Math.pow(selectedWall.end.x - selectedWall.start.x, 2) +
              Math.pow(selectedWall.end.y - selectedWall.start.y, 2)
            ).toFixed(2)} pixels
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Point
          </label>
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            ({selectedWall.start.x.toFixed(1)}, {selectedWall.start.y.toFixed(1)})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Point
          </label>
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            ({selectedWall.end.x.toFixed(1)}, {selectedWall.end.y.toFixed(1)})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created
          </label>
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            {new Date(selectedWall.createdAt).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Updated
          </label>
          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            {new Date(selectedWall.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WallPropertiesPanel; 