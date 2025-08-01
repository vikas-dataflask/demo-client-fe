import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Edit3, Save } from 'lucide-react';
import { 
  setFloor, 
  setFloorHeight, 
  setFloorArea, 
  setFloorVolume 
} from '../../../redux/features/app/floorSlice';
import { convertPixelsToMeters, convertUnits } from '../../../utils/unitConversion';

const FloorPropertiesPanel = ({ isOpen, onClose, floorData }) => {
  const dispatch = useDispatch();
  const displayUnit = useSelector((state) => state.floor.scale) || "m";
  const heightFromStore = useSelector((state) => state.floor.floor_height) || 3.2;

  const [properties, setProperties] = useState({
    name: 'Ground Floor',
    floorHeight: 3.2,
    slabThickness: 200,
    material: 'RCC'
  });

  const [isEditing, setIsEditing] = useState(false);

  // Initialize properties when floor data changes
  useEffect(() => {
    if (floorData) {
      setProperties({
        name: floorData.name || 'Ground Floor',
        floorHeight: floorData.floorHeight || 3.2,
        slabThickness: floorData.slabThickness || 200,
        material: floorData.material || 'RCC'
      });
    }
  }, [floorData]);

  // Calculate area based on floor shape
  const calculateArea = () => {
    if (!floorData) return 0;
    
    if (floorData.shape === 'rectangle') {
      const widthInMeters = convertPixelsToMeters(floorData.width);
      const heightInMeters = convertPixelsToMeters(floorData.height);
      return widthInMeters * heightInMeters;
    } else if (floorData.shape === 'polygon' && floorData.points) {
      // For polygon, use the pre-calculated area
      return floorData.areaSqM || 0;
    }
    return 0;
  };

  const area = calculateArea();

  const handlePropertyChange = (field, value) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!floorData) return;

    const updatedFloor = {
      ...floorData,
      ...properties
    };

    // Update Redux state
    dispatch(setFloor(updatedFloor));
    dispatch(setFloorHeight(properties.floorHeight));
    
    // Recalculate volume
    const volumeInMeters = area * properties.floorHeight;
    const volumeInDisplayUnit = convertUnits(volumeInMeters, 'm', displayUnit);
    dispatch(setFloorVolume(volumeInDisplayUnit.toFixed(2)));

    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    if (floorData) {
      setProperties({
        name: floorData.name || 'Ground Floor',
        floorHeight: floorData.floorHeight || 3.2,
        slabThickness: floorData.slabThickness || 200,
        material: floorData.material || 'RCC'
      });
    }
    setIsEditing(false);
  };

  console.log('FloorPropertiesPanel: isOpen', isOpen, 'floorData', floorData);
  
  if (!isOpen || !floorData) {
    console.log('FloorPropertiesPanel: Not rendering - isOpen:', isOpen, 'floorData:', !!floorData);
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-300 shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Floor Properties</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Floor Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-sm font-semibold text-blue-700 mb-2">Floor Information</div>
          <div className="text-xs text-blue-600 space-y-1">
            <div>Shape: {floorData.shape}</div>
            <div>Area: {area.toFixed(2)} m²</div>
            <div>Source: {floorData.source}</div>
          </div>
        </div>

        {/* Properties Form */}
        <div className="space-y-4">
          {/* Floor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Name
            </label>
            <input
              type="text"
              value={properties.name}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter floor name"
            />
          </div>

          {/* Auto-Calculated Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (Auto-Calculated)
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {area.toFixed(2)} m²
            </div>
          </div>

          {/* Floor Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Height
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={properties.floorHeight}
                onChange={(e) => handlePropertyChange('floorHeight', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="3.2"
              />
              <span className="text-sm text-gray-500">m</span>
            </div>
          </div>

          {/* Slab Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slab Thickness
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="0"
                value={properties.slabThickness}
                onChange={(e) => handlePropertyChange('slabThickness', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="200"
              />
              <span className="text-sm text-gray-500">mm</span>
            </div>
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <select
              value={properties.material}
              onChange={(e) => handlePropertyChange('material', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="RCC">RCC</option>
              <option value="Tile">Tile</option>
              <option value="Concrete">Concrete</option>
              <option value="Raised">Raised</option>
              <option value="Steel">Steel</option>
            </select>
          </div>

          {/* Volume Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {(area * properties.floorHeight).toFixed(2)} m³
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Edit Properties
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPropertiesPanel; 