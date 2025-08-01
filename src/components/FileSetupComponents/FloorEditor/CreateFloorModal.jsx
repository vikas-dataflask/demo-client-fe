import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateFloorModal = ({ isOpen, onClose, onCreateFloor }) => {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    x: '',
    y: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const x = parseFloat(dimensions.x);
    const y = parseFloat(dimensions.y);

    if (length > 0 && width > 0) {
      onCreateFloor({
        type: 'floor',
        shape: 'rectangle',
        x: x || 0,
        y: y || 0,
        width: length * 100, // Convert meters to pixels (100 pixels per meter)
        height: width * 100,
        areaSqM: length * width,
        source: 'manual',
        id: 'floor-1',
        name: 'Ground Floor',
        floorHeight: 3.2,
        slabThickness: 200,
        material: 'RCC'
      });
      onClose();
      setDimensions({ length: '', width: '', x: '', y: '' });
    }
  };

  const handleInputChange = (field, value) => {
    setDimensions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Enter Floor Dimensions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (meters)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={dimensions.length}
              onChange={(e) => handleInputChange('length', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter length in meters"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (meters)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={dimensions.width}
              onChange={(e) => handleInputChange('width', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter width in meters"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X Position (meters)
              </label>
              <input
                type="number"
                step="0.01"
                value={dimensions.x}
                onChange={(e) => handleInputChange('x', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y Position (meters)
              </label>
              <input
                type="number"
                step="0.01"
                value={dimensions.y}
                onChange={(e) => handleInputChange('y', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Floor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFloorModal;
