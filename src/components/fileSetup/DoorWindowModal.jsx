import React, { useState, useEffect } from 'react';

const DoorWindowModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  type, // 'door' or 'window'
  wallData, // wall information for snapping
  position // initial position on wall
}) => {
  const [formData, setFormData] = useState({
    width: type === 'door' ? 900 : 1200, // mm
    height: type === 'door' ? 2100 : 1200, // mm
    sillHeight: type === 'window' ? 900 : 0, // mm (only for windows)
    type: type === 'door' ? 'Single' : 'Single',
    material: type === 'door' ? 'Wood' : 'Aluminum',
    direction: type === 'door' ? 'Left' : undefined, // only for doors
    glazing: type === 'window' ? 'Double' : undefined, // only for windows
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        width: type === 'door' ? 900 : 1200,
        height: type === 'door' ? 2100 : 1200,
        sillHeight: type === 'window' ? 900 : 0,
        type: type === 'door' ? 'Single' : 'Single',
        material: type === 'door' ? 'Wood' : 'Aluminum',
        direction: type === 'door' ? 'Left' : undefined,
        glazing: type === 'window' ? 'Double' : undefined,
      });
    }
  }, [isOpen, type]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      position: position,
      wallId: wallData?.id,
      wallAngle: wallData?.angle
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Insert {type === 'door' ? 'Door' : 'Window'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (mm)
            </label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              max="5000"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (mm)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              max="5000"
            />
          </div>

          {/* Sill Height (Windows only) */}
          {type === 'window' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sill Height (mm)
              </label>
              <input
                type="number"
                value={formData.sillHeight}
                onChange={(e) => handleInputChange('sillHeight', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="3000"
              />
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {type === 'door' ? (
                <>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Sliding">Sliding</option>
                  <option value="Folding">Folding</option>
                  <option value="Revolving">Revolving</option>
                </>
              ) : (
                <>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="D-glass">D-glass</option>
                  <option value="Ventilation">Ventilation</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Sliding">Sliding</option>
                </>
              )}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              value={formData.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {type === 'door' ? (
                <>
                  <option value="Wood">Wood</option>
                  <option value="Metal">Metal</option>
                  <option value="Glass">Glass</option>
                  <option value="Plastic">Plastic</option>
                </>
              ) : (
                <>
                  <option value="Aluminum">Aluminum</option>
                  <option value="Wood">Wood</option>
                  <option value="PVC">PVC</option>
                  <option value="Steel">Steel</option>
                </>
              )}
            </select>
          </div>

          {/* Direction (Doors only) */}
          {type === 'door' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={formData.direction}
                onChange={(e) => handleInputChange('direction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Both">Both</option>
              </select>
            </div>
          )}

          {/* Glazing (Windows only) */}
          {type === 'window' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Glazing
              </label>
              <select
                value={formData.glazing}
                onChange={(e) => handleInputChange('glazing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Width: {formData.width}mm ({(formData.width / 1000).toFixed(1)}m)</div>
              <div>Height: {formData.height}mm ({(formData.height / 1000).toFixed(1)}m)</div>
              {type === 'window' && (
                <div>Sill Height: {formData.sillHeight}mm ({(formData.sillHeight / 1000).toFixed(1)}m)</div>
              )}
              <div>Type: {formData.type}</div>
              <div>Material: {formData.material}</div>
              {type === 'door' && <div>Direction: {formData.direction}</div>}
              {type === 'window' && <div>Glazing: {formData.glazing}</div>}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Insert {type === 'door' ? 'Door' : 'Window'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoorWindowModal; 