import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateRoomProperties,
  removeRoom,
  addRoom,
} from "../../redux/features/app/roomSlice";
import { createRooms } from "../../redux/features/app/newRoomSlice";
// import { saveRoomToBackend } from "../../utils/roomApi"; // Commented out until authentication is implemented

const GRID_SIZE = 100; // 100px = 1m for proper unit conversion

const RoomCreationModal = ({ room, onClose, onSave, isNewRoom = false }) => {
  const dispatch = useDispatch();
  const selectedScale = useSelector((state) => state.project.scale);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const existingRooms = useSelector((state) => state.newRooms?.rooms || []);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    roomType: "Residential",
    wallThickness: 0.2,
    falseCeiling: "",
    hasFalseCeiling: false,
    width: 0,
    height: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Initialize form data when room changes
  useEffect(() => {
    if (room) {
      const roomWidthMeters = convertPixelsToMeters(room.width);
      const roomHeightMeters = convertPixelsToMeters(room.height);

      setFormData({
        name: room.name || "",
        roomType: room.roomType || "Residential",
        wallThickness: room.wallThickness || 0.2,
        falseCeiling: room.falseCeiling || "",
        hasFalseCeiling: !!room.falseCeiling,
        width: roomWidthMeters,
        height: roomHeightMeters,
      });
    }
  }, [room]);

  // Convert pixels to meters (100px = 1m)
  const convertPixelsToMeters = (pixels) => {
    return pixels / GRID_SIZE;
  };

  // Convert meters to pixels
  const convertMetersToPixels = (meters) => {
    return meters * GRID_SIZE;
  };

  // Get unit label based on selected scale
  const getUnitLabel = () => {
    switch (selectedScale) {
      case "Inches":
        return "in";
      case "Feet":
        return "ft";
      case "Square Yards":
        return "yd";
      default:
        return "m";
    }
  };

  // Convert area to selected scale
  const convertArea = (pixelArea) => {
    const areaInSquareMeters = pixelArea / (GRID_SIZE * GRID_SIZE);

    switch (selectedScale) {
      case "Inches":
        return areaInSquareMeters * 1550.0031;
      case "Feet":
        return areaInSquareMeters * 10.7639;
      case "Square Yards":
        return areaInSquareMeters * 1.19599;
      default:
        return areaInSquareMeters;
    }
  };

  // Calculate room dimensions in meters (use form data for editable values)
  const roomWidthMeters = formData.width;
  const roomHeightMeters = formData.height;
  const roomArea = room
    ? convertArea(
        convertMetersToPixels(formData.width) *
          convertMetersToPixels(formData.height)
      )
    : 0;
  const unitLabel = getUnitLabel();

  // Room type options
  const roomTypes = [
    "Residential",
    "Commercial",
    "Industrial",
    "Educational",
    "Healthcare",
    "Hospitality",
    "Recreational",
    "Storage",
    "Utility",
    "Other",
  ];

  // False ceiling options
  const falseCeilingOptions = [
    "Gypsum Board",
    "Mineral Fiber",
    "Metal",
    "Wood",
    "PVC",
    "Fabric",
    "None",
  ];

  // Validate duplicate room names
  const validateRoomName = (name) => {
    if (!name.trim()) {
      return "Room name is required";
    }

    // Check for duplicate names on the same floor
    const isDuplicateName = existingRooms.some(
      (existingRoom) =>
        existingRoom.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        existingRoom.id !== room?.id &&
        existingRoom.floorId === currentFloorId
    );

    if (isDuplicateName) {
      return "A room with this name already exists on this floor";
    }

    return "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (field === "name" && validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!room) return;

    // Validate room name
    const nameValidation = validateRoomName(formData.name);
    if (nameValidation) {
      setValidationError(nameValidation);
      return;
    }

    // Prevent duplicate submissions
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setValidationError("");

    try {
      if (isNewRoom) {
        // Create room data with proper structure for ROOMSslice
        const roomData = {
          id: room.id, // Use the existing room ID
          name: formData.name,
          roomType: formData.roomType,
          wallThickness: formData.wallThickness,
          falseCeiling: formData.hasFalseCeiling ? formData.falseCeiling : "",
          floorId: currentFloorId,
          width: convertMetersToPixels(formData.width), // Convert to pixels
          height: convertMetersToPixels(formData.height), // Convert to pixels
          area:
            convertMetersToPixels(formData.width) *
            convertMetersToPixels(formData.height), // Pixel-based area
          x: room?.x || 0, // Preserve room position
          y: room?.y || 0,
        };

        // Add to Redux state first
        dispatch(addRoom(roomData));

        // Then create in ROOMSslice
        console.log("ROOMIE", roomData);
        dispatch(createRooms(roomData));
        console.log("ROOMIE", "createRooms dispatched");
      } else {
        // For existing rooms, just update properties
        const updates = {
          name: formData.name,
          roomType: formData.roomType,
          wallThickness: formData.wallThickness,
          falseCeiling: formData.hasFalseCeiling ? formData.falseCeiling : "",
          floorId: currentFloorId,
          width: convertMetersToPixels(formData.width),
          height: convertMetersToPixels(formData.height),
        };

        dispatch(
          updateRoomProperties({
            id: room.id,
            updates,
          })
        );
      }

      // Call onSave callback if provided
      if (onSave) {
        // Pass the updated room data to the callback
        const updatedRoomData = {
          ...room,
          name: formData.name,
          roomType: formData.roomType,
          wallThickness: formData.wallThickness,
          falseCeiling: formData.hasFalseCeiling ? formData.falseCeiling : "",
          floorId: currentFloorId,
          width: convertMetersToPixels(formData.width),
          height: convertMetersToPixels(formData.height),
        };
        onSave(updatedRoomData);
      }

      onClose();
    } catch (error) {
      console.error("RoomCreationModal: Error saving room:", error);
      setValidationError("Error saving room. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Only remove the room if it's a new room that hasn't been saved yet
    if (isNewRoom && room) {
      dispatch(removeRoom(room.id));
    }
    onClose();
  };

  if (!room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isNewRoom ? "Create New Room" : "Edit Room Details"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter room name (e.g., Living Room, Bedroom 1)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {validationError && (
              <p className="text-red-500 text-sm mt-1">{validationError}</p>
            )}
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              value={formData.roomType}
              onChange={(e) => handleInputChange("roomType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions (Editable) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width ({unitLabel})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={roomWidthMeters}
                onChange={(e) =>
                  handleInputChange("width", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length ({unitLabel})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={roomHeightMeters}
                onChange={(e) =>
                  handleInputChange("height", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (
                {selectedScale === "Inches"
                  ? "in²"
                  : selectedScale === "Feet"
                  ? "ft²"
                  : selectedScale === "Square Yards"
                  ? "yd²"
                  : "m²"}
                )
              </label>
              <input
                type="text"
                value={roomArea.toFixed(2)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                readOnly
              />
            </div>
          </div>

          {/* Wall Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wall Thickness ({unitLabel})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.05"
              max="1.0"
              value={formData.wallThickness}
              onChange={(e) =>
                handleInputChange(
                  "wallThickness",
                  parseFloat(e.target.value) || 0.2
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Standard wall thickness is 200mm (0.2m)
            </p>
          </div>

          {/* False Ceiling */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <input
                type="checkbox"
                checked={formData.hasFalseCeiling}
                onChange={(e) =>
                  handleInputChange("hasFalseCeiling", e.target.checked)
                }
                className="form-checkbox text-blue-600 rounded"
              />
              False Ceiling
            </label>
            {formData.hasFalseCeiling && (
              <select
                value={formData.falseCeiling}
                onChange={(e) =>
                  handleInputChange("falseCeiling", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
              >
                <option value="">Select false ceiling type</option>
                {falseCeilingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Room Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Room Preview
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>Position:</strong> ({room.x.toFixed(0)},{" "}
                {room.y.toFixed(0)}) pixels
              </p>
              <p>
                <strong>Dimensions:</strong> {roomWidthMeters.toFixed(2)} ×{" "}
                {roomHeightMeters.toFixed(2)} {unitLabel}
              </p>
              <p>
                <strong>Area:</strong> {roomArea.toFixed(2)}{" "}
                {selectedScale === "Inches"
                  ? "in²"
                  : selectedScale === "Feet"
                  ? "ft²"
                  : selectedScale === "Square Yards"
                  ? "yd²"
                  : "m²"}
              </p>
              <p>
                <strong>Floor ID:</strong> {currentFloorId || "Not assigned"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              {isNewRoom ? "Cancel & Delete" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-md transition-colors ${
                isSaving
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSaving
                ? "Saving..."
                : isNewRoom
                ? "Create Room"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomCreationModal;
