import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addFloor, updateFloor } from "../../redux/features/app/floorSlice";

const FloorPopupModal = ({ 
  isOpen, 
  onClose, 
  floorData, 
  onSave,
  isNewFloor = true 
}) => {
  console.log('FloorPopupModal render:', { isOpen, floorData, isNewFloor });
  const dispatch = useDispatch();
  const floors = useSelector((state) => state.floor.floors);
  
  const [formData, setFormData] = useState({
    name: "",
    floorHeight: 3200, // mm
    slabThickness: 200, // mm
    material: "RCC"
  });
  
  const [validationError, setValidationError] = useState("");

  // Material options
  const materialOptions = [
    "RCC",
    "Steel",
    "Wood",
    "Tile",
    "Marble",
    "Granite",
    "Concrete",
    "Other"
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && floorData) {
      setFormData({
        name: floorData.name || "",
        floorHeight: floorData.floorHeight || 3200,
        slabThickness: floorData.slabThickness || 200,
        material: floorData.material || "RCC"
      });
    }
  }, [isOpen, floorData]);

  // Validate floor name uniqueness
  const validateFloorName = (name) => {
    if (!name.trim()) {
      return "Floor name is required";
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = floors.some(floor => 
      floor.name && 
      floor.name.toLowerCase() === name.toLowerCase() &&
      floor.id !== floorData?.id
    );

    if (isDuplicate) {
      return "A floor with this name already exists";
    }

    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when name is being typed
    if (field === 'name') {
      setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate floor name
    const nameError = validateFloorName(formData.name);
    if (nameError) {
      setValidationError(nameError);
      return;
    }

    // Create the complete floor object
    const completeFloorData = {
      ...floorData,
      ...formData,
      id: floorData?.id || `floor-${Date.now()}`,
      createdAt: floorData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Redux
    if (isNewFloor) {
      dispatch(addFloor(completeFloorData));
    } else {
      dispatch(updateFloor({ id: completeFloorData.id, updates: completeFloorData }));
    }

    // Call the onSave callback
    if (onSave) {
      await onSave(completeFloorData);
    }

    // Close modal
    onClose();
  };

  const handleCancel = () => {
    setValidationError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isNewFloor ? "Create New Floor" : "Edit Floor Details"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Floor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter floor name"
              required
            />
            {validationError && (
              <p className="text-red-500 text-xs mt-1">{validationError}</p>
            )}
          </div>

          {/* Floor Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Height (mm)
            </label>
            <input
              type="number"
              value={formData.floorHeight}
              onChange={(e) => handleInputChange('floorHeight', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3200"
              min="0"
            />
          </div>

          {/* Slab Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slab Thickness (mm)
            </label>
            <input
              type="number"
              value={formData.slabThickness}
              onChange={(e) => handleInputChange('slabThickness', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="200"
              min="0"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Type
            </label>
            <select
              value={formData.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {materialOptions.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Dimensions (Read-only) */}
          {floorData && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Floor Dimensions</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Width:</span> {(floorData.width / 100).toFixed(1)} m
                </div>
                <div>
                  <span className="font-medium">Height:</span> {(floorData.height / 100).toFixed(1)} m
                </div>
                <div>
                  <span className="font-medium">Area:</span> {((floorData.width * floorData.height) / 10000).toFixed(1)} m²
                </div>
                <div>
                  <span className="font-medium">Position:</span> ({Math.round(floorData.x)}, {Math.round(floorData.y)})
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isNewFloor ? "Create Floor" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorPopupModal; 