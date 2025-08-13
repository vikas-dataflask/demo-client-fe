import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedObject, updateFloor } from '../../redux/features/app/floorSlice';

const FloorPropertiesPanel = ({ selectedObject, onClose }) => {
  const dispatch = useDispatch();
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);
  
  const [formData, setFormData] = useState({
    name: '',
    floorHeight: 3200,
    slabThickness: 200,
    material: 'RCC'
  });

  // Sync form data when selectedObject changes
  useEffect(() => {
    if (selectedObject) {
      setFormData({
        name: selectedObject.name || `Floor ${selectedObject.id}`,
        floorHeight: selectedObject.floorHeight || 3200,
        slabThickness: selectedObject.slabThickness || 200,
        material: selectedObject.material || 'RCC'
      });
    }
  }, [selectedObject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!selectedObject || !currentFloor) return;

    // Update the selected object with new data
    const updatedObject = {
      ...selectedObject,
      ...formData
    };

    // Update the object in the floor's shapes array
    const updatedShapes = currentFloor.shapes.map(shape => 
      shape.id === selectedObject.id ? updatedObject : shape
    );

    const updatedFloor = {
      ...currentFloor,
      shapes: updatedShapes,
      updatedAt: new Date().toISOString()
    };

    dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
    dispatch(setSelectedObject(updatedObject));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    dispatch(setSelectedObject(null));
  };

  if (!selectedObject) {
    return null;
  }

  // Calculate dimensions based on shape type
  const getDimensions = () => {
    if (selectedObject.shape === 'rectangle') {
      return {
        width: selectedObject.widthInMeters || (selectedObject.width / 100),
        height: selectedObject.heightInMeters || (selectedObject.height / 100),
        area: selectedObject.areaSqM
      };
    } else if (selectedObject.shape === 'polygon') {
      return {
        width: 'Custom',
        height: 'Custom',
        area: selectedObject.areaSqM
      };
    }
    return { width: 0, height: 0, area: 0 };
  };

  const dimensions = getDimensions();

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Floor Properties</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dimensions (Read-only) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (m)
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {typeof dimensions.width === 'number' ? dimensions.width.toFixed(2) : dimensions.width}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (m)
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {typeof dimensions.height === 'number' ? dimensions.height.toFixed(2) : dimensions.height}
            </div>
          </div>
        </div>

        {/* Area (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area (m²)
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
            {dimensions.area.toFixed(2)}
          </div>
        </div>

        {/* Floor Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Floor Height (mm)
          </label>
          <input
            type="number"
            name="floorHeight"
            value={formData.floorHeight}
            onChange={handleChange}
            min="100"
            max="10000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Slab Thickness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slab Thickness (mm)
          </label>
          <input
            type="number"
            name="slabThickness"
            value={formData.slabThickness}
            onChange={handleChange}
            min="50"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material
          </label>
          <select
            name="material"
            value={formData.material}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="RCC">RCC</option>
            <option value="Steel">Steel</option>
            <option value="Wood">Wood</option>
            <option value="Composite">Composite</option>
          </select>
        </div>

        {/* Shape Type (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shape Type
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 capitalize">
            {selectedObject.shape}
          </div>
        </div>

        {/* Layer (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Layer
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
            {selectedObject.layer}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorPropertiesPanel; 