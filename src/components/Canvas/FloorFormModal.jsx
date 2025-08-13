import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addFloor, updateFloor } from "../../redux/features/app/floorSlice";
import { createFloorInBackend } from "../../utils/floorRoomApi";

const FloorFormModal = ({ floor, onClose, onSave, isNewFloor = false }) => {
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    floorHeight: 3200, // in mm
    slabThickness: 200, // in mm
    material: "RCC",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Initialize form data when floor changes
  useEffect(() => {
    if (floor) {
      setFormData({
        name: floor.name || "",
        floorHeight: floor.floorHeight || 3200,
        slabThickness: floor.slabThickness || 200,
        material: floor.material || "RCC",
      });
    }
  }, [floor]);

  // Material options
  const materialOptions = [
    "RCC",
    "Steel",
    "Wood",
    "Composite",
    "Precast Concrete",
    "Other"
  ];

  // Validate floor name
  const validateFloorName = (name) => {
    if (!name || name.trim() === "") {
      return "Floor name is required";
    }
    if (name.length < 2) {
      return "Floor name must be at least 2 characters long";
    }
    return null;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for name field
    if (field === 'name') {
      setValidationError("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate floor name
    const nameError = validateFloorName(formData.name);
    if (nameError) {
      setValidationError(nameError);
      return;
    }

    setIsSaving(true);
    
    try {
      // Create complete floor data
      const completeFloorData = {
        ...floor,
        name: formData.name,
        floorHeight: formData.floorHeight,
        slabThickness: formData.slabThickness,
        material: formData.material,
        updatedAt: new Date().toISOString()
      };

      if (isNewFloor) {
        // Add new floor to Redux
        dispatch(addFloor(completeFloorData));
        
        // Save to backend
        // try {
        //   await createFloorInBackend(completeFloorData, floor.levelId || 'default');
        // } catch (error) {
        //   console.warn('Failed to save floor to backend:', error);
        //   // Continue with frontend state even if backend fails
        // }
      } else {
        // Update existing floor
        dispatch(updateFloor({ 
          id: floor.id, 
          updates: completeFloorData 
        }));
      }

      // Call onSave callback
      if (onSave) {
        onSave(completeFloorData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving floor:', error);
      setValidationError('Failed to save floor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  // Calculate floor dimensions
  const floorWidthMeters = floor ? (floor.widthInMeters || floor.width / 100) : 0;
  const floorHeightMeters = floor ? (floor.heightInMeters || floor.height / 100) : 0;
  const floorArea = floor ? (floor.areaSqM || (floorWidthMeters * floorHeightMeters)) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
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
              <p className="text-red-500 text-sm mt-1">{validationError}</p>
            )}
          </div>

          {/* Floor Dimensions (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width
              </label>
              <input
                type="text"
                value={`${floorWidthMeters.toFixed(2)} m`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height
              </label>
              <input
                type="text"
                value={`${floorHeightMeters.toFixed(2)} m`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Floor Area (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <input
              type="text"
              value={`${floorArea.toFixed(2)} m²`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              readOnly
            />
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
              min="1000"
              max="10000"
              step="100"
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
              min="50"
              max="1000"
              step="10"
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : (isNewFloor ? "Create Floor" : "Update Floor")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorFormModal; 