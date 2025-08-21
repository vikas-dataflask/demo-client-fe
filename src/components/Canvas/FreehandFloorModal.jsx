import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  setFirstFloorCoordinates, 
  updateFloor, 
  setSelectedObject, 
  setHasDrawn 
} from "../../redux/features/app/floorSlice";
import { setRect } from "../../redux/features/app/FloorPlanSlice";
import { convertPixelsToMeters, convertMetersToPixels } from "../../utils/unitConversion";
import { useSelector } from "react-redux";
import { selectPixelsPerMeter } from "../../redux/features/app/calibrationSlice";

const FreehandFloorModal = ({ floor, onClose, onSave, isNewFloor = false }) => {
  console.log('FreehandFloorModal: Component rendered with props:', { floor, onClose, onSave, isNewFloor });
  const dispatch = useDispatch();
  const pixelsPerMeter = useSelector(selectPixelsPerMeter);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    widthInMeters: 0,
    heightInMeters: 0,
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
        widthInMeters: floor.widthInMeters || convertPixelsToMeters(floor.width, pixelsPerMeter),
        heightInMeters: floor.heightInMeters || convertPixelsToMeters(floor.height, pixelsPerMeter),
        floorHeight: floor.floorHeight || 3200,
        slabThickness: floor.slabThickness || 200,
        material: floor.material || "RCC",
      });
    }
  }, [floor, pixelsPerMeter]);

  // Material options
  const materialOptions = [
    "RCC",
    "Steel",
    "Wood",
    "Composite",
    "Precast Concrete",
    "Other"
  ];

  // Validate form data
  const validateForm = () => {
    if (!formData.name || formData.name.trim() === "") {
      return "Floor name is required";
    }
    if (formData.name.length < 2) {
      return "Floor name must be at least 2 characters long";
    }
    
    // Only validate dimensions for rectangle shapes
    if (floor.shape !== 'polygon') {
      if (formData.widthInMeters <= 0) {
        return "Width must be greater than 0";
      }
      if (formData.heightInMeters <= 0) {
        return "Height must be greater than 0";
      }
    }
    
    return null;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error
    setValidationError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    setIsSaving(true);
    
    try {
      let widthPx, heightPx, areaInMeters;
      
      if (floor.shape === 'polygon') {
        // For polygon shapes, use existing dimensions and area
        widthPx = floor.width || 0;
        heightPx = floor.height || 0;
        areaInMeters = floor.areaSqM || 0;
      } else {
        // For rectangle shapes, convert meters back to pixels
        widthPx = convertMetersToPixels(formData.widthInMeters, pixelsPerMeter);
        heightPx = convertMetersToPixels(formData.heightInMeters, pixelsPerMeter);
        areaInMeters = formData.widthInMeters * formData.heightInMeters;
      }

      // Create complete floor data
      const completeFloorData = {
        ...floor,
        name: formData.name,
        shape: floor.shape || 'rectangle', // Use existing shape or default to rectangle
        description: `${formData.name} - ${floor.shape || 'rectangle'} floor`, // Add missing description field
        width: widthPx,
        height: heightPx,
        widthInMeters: floor.shape === 'polygon' ? undefined : formData.widthInMeters,
        heightInMeters: floor.shape === 'polygon' ? undefined : formData.heightInMeters,
        areaSqM: areaInMeters,
        floorHeight: formData.floorHeight,
        slabThickness: formData.slabThickness,
        material: formData.material,
        source: 'manual', // Add missing source field
        layer: 'A-FLOR', // Add missing layer field
        level: 0, // Add missing level field
        updatedAt: new Date().toISOString()
      };

      // Store first floor coordinates for consistency
      if (!floor.firstFloorCoordinates) {
        dispatch(setFirstFloorCoordinates({ x: floor.x, y: floor.y }));
        console.log('Editor: Stored first floor coordinates from freehand modal:', { x: floor.x, y: floor.y });
      }
      
      // Add shape to current floor
      if (floor.currentFloor) {
        const updatedFloor = {
          ...floor.currentFloor,
          name: formData.name, // Update the floor's name with the user-entered name
          shapes: [...(floor.currentFloor.shapes || []), completeFloorData],
          updatedAt: new Date().toISOString()
        };
        dispatch(updateFloor({ id: floor.currentFloor.id, updates: updatedFloor }));
        console.log('Editor: Added floor shape to current floor from freehand modal:', completeFloorData);
        console.log('Editor: Updated floor name to:', formData.name);
      }
      
      // Set the created floor as selected object
      dispatch(setSelectedObject(completeFloorData));
      
      // Mark as drawn to prevent further floor creation
      dispatch(setHasDrawn(true));
      
      // Set the floor plan rect for RoomEditor.jsx compatibility
      const finalRect = {
        x: floor.x,
        y: floor.y,
        width: widthPx,
        height: heightPx,
        draggable: true,
      };
      dispatch(setRect(finalRect));
      localStorage.setItem("floorPlan", JSON.stringify(finalRect));
      console.log('Editor: Set floor plan rect for RoomEditor compatibility from freehand modal:', finalRect);

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

  // Calculate floor area
  const floorArea = floor.shape === 'polygon' 
    ? (floor.areaSqM || 0) 
    : formData.widthInMeters * formData.heightInMeters;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Debug alert */}
        {console.log('FreehandFloorModal: Rendering modal content')}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {floor.shape === 'polygon' ? 'Finalize Polygon Floor' : 'Finalize Floor Dimensions'}
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
          </div>

          {/* Floor Dimensions (Editable) */}
          {floor.shape === 'polygon' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Polygon Area (m²)
              </label>
              <input
                type="text"
                value={floorArea.toFixed(2)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Area calculated from {floor.points?.length || 0} polygon points
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (m) *
                </label>
                <input
                  type="number"
                  value={formData.widthInMeters}
                  onChange={(e) => handleInputChange('widthInMeters', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                    min="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (m) *
                  </label>
                  <input
                    type="number"
                    value={formData.heightInMeters}
                    onChange={(e) => handleInputChange('heightInMeters', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
              </div>
            )}

          {/* Floor Area (Calculated) */}
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

          {/* Validation Error */}
          {validationError && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {validationError}
            </div>
          )}

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
              {isSaving ? "Finalizing..." : "Finalize Floor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreehandFloorModal; 