import React, { useState, useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";
import { useSelector, useDispatch } from "react-redux";
import {
  setRoomPower,
  addDevice,
  removeDevice,
  clearDevices,
} from "../../redux/features/app/powerSlice";
import SwitchSocketSummaryTable from "./SwitchSocketSummaryTable";

const PowerForm = ({ roomOptions = [], onSubmit }) => {
  const [formData, setFormData] = useState({
    type: "",
    rating: "",
    quantity: "",
    room: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.newRooms?.rooms || []);
  const powerByRoom = useSelector((state) => state.power?.powerByRoom || {});
  const devices = useSelector((state) => state.power?.devices || []);

  // Power device types
  const deviceTypes = [
    { value: "switch", label: "Switch" },
    { value: "socket", label: "Socket" },
    { value: "dimmer", label: "Dimmer" },
    { value: "usb-socket", label: "USB Socket" },
    { value: "timer-switch", label: "Timer Switch" },
  ];

  // Rating options
  const ratingOptions = [
    { value: "6A", label: "6A" },
    { value: "10A", label: "10A" },
    { value: "16A", label: "16A" },
    { value: "20A", label: "20A" },
    { value: "25A", label: "25A" },
    { value: "32A", label: "32A" },
  ];

  // Use provided roomOptions or fallback to Redux rooms
  const availableRooms =
    roomOptions.length > 0
      ? roomOptions
      : rooms
          .map((room) => ({ value: room.id || room._id, label: room.name }))
          .filter(
            (room, index, self) =>
              // Remove duplicates by keeping only the first occurrence of each room.value
              index === self.findIndex((r) => r.value === room.value)
          );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.room) {
      newErrors.room = "Room is required";
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
    }
    if (!formData.rating) {
      newErrors.rating = "Rating is required";
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Get the room name for display
    const selectedRoomName =
      availableRooms.find((room) => room.value === formData.room)?.label ||
      formData.room;

    const submitData = {
      type: formData.type,
      rating: formData.rating,
      quantity: parseInt(formData.quantity),
      room: selectedRoomName, // Use room name instead of ID for display
      roomId: formData.room, // Store room ID for reference
    };

    // Add device to Redux store
    dispatch(addDevice(submitData));

    console.log("Adding new device to Redux:", submitData);

    // Call parent onSubmit if provided
    if (onSubmit) {
      onSubmit(submitData);
    }

    // Also dispatch to Redux for power compatibility
    const selectedRoom = rooms.find(
      (room) => (room.id || room._id) === formData.room
    );
    if (selectedRoom) {
      const powerPerDevice = getPowerPerDevice(formData.type, formData.rating);
      const totalPower = powerPerDevice * parseInt(formData.quantity);
      dispatch(setRoomPower({ roomId: formData.room, totalPower }));
    }

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      type: "",
      rating: "",
      quantity: "",
      room: "",
    });
    setErrors({});
  };

  const handleDeleteDevice = (deviceId) => {
    dispatch(removeDevice(deviceId));
    console.log("Removing device from Redux:", deviceId);
  };

  const handleClearAllDevices = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all power devices? This action cannot be undone."
      )
    ) {
      dispatch(clearDevices());
      console.log("Cleared all devices from Redux");
    }
  };

  const getPowerPerDevice = (type, rating) => {
    const ratingValue = parseInt(rating.replace("A", ""));
    const voltage = 230; // Standard voltage

    switch (type) {
      case "switch":
        return 0; // Switches don't consume power
      case "socket":
        return ratingValue * voltage * 0.8; // 80% of rated capacity
      case "dimmer":
        return ratingValue * voltage * 0.6; // 60% of rated capacity
      case "usb-socket":
        return 5 * voltage; // 5A for USB charging
      case "timer-switch":
        return 5; // Minimal power for timer circuit
      default:
        return 0;
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "switch":
        return "🔌";
      case "socket":
        return "⚡";
      case "dimmer":
        return "💡";
      case "usb-socket":
        return "📱";
      case "timer-switch":
        return "⏰";
      default:
        return "🔌";
    }
  };

  // Filter devices by selected room if a room is selected
  const filteredDevices =
    formData.room && devices.length > 0
      ? devices.filter((device) => device.roomId === formData.room)
      : devices || [];

  return (
    <div className="flex h-screen">
      <div className="w-[440px] h-[90vh] bg-white border-r border-gray-300 px-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start py-4 pb-3 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[16px] font-semibold text-black leading-none">
              Power Devices
            </h1>
            <p className="text-[11px] text-gray-400 mt-[2px]">
              Define switches and sockets per room
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              className="w-[24px] h-[24px] bg-red-500 text-white rounded-md flex items-center justify-center hover:bg-red-600 transition text-xs"
              onClick={handleClearAllDevices}
              title="Clear all devices"
            >
              🗑️
            </button>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={handleCancel}
            >
              <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
            </button>
          </div>
        </div>

        <div className="py-4 space-y-6">
          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-green-800 text-sm font-medium">
                  Power device added successfully!
                </span>
              </div>
            </div>
          )}

          {/* Room Selection - First Priority */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🏠</span>
              Room Selection
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Select Room/Zone
              </label>
              <select
                value={formData.room}
                onChange={(e) => handleInputChange("room", e.target.value)}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.room ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Choose a room to add power devices...</option>
                {availableRooms.map((room) => (
                  <option key={room.value} value={room.value}>
                    {room.label}
                  </option>
                ))}
              </select>
              {errors.room && (
                <p className="text-red-500 text-xs mt-1">{errors.room}</p>
              )}
            </div>
          </div>

          {/* Device Configuration - Only show if room is selected */}
          {formData.room && (
            <div className="border border-gray-200 bg-white rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                Device Configuration
              </h3>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Device Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.type ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Type</option>
                    {deviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {getDeviceIcon(type.value)} {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Rating (Amp)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) =>
                      handleInputChange("rating", e.target.value)
                    }
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rating ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Rating</option>
                    {ratingOptions.map((rating) => (
                      <option key={rating.value} value={rating.value}>
                        {rating.label}
                      </option>
                    ))}
                  </select>
                  {errors.rating && (
                    <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity", e.target.value)
                    }
                    min="1"
                    placeholder="e.g., 3"
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.quantity ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#0083EE] text-white px-4 py-2 rounded-md hover:bg-[#1C78DC] transition text-sm font-medium"
                >
                  Add Item
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Device Preview */}
          {formData.type &&
            formData.rating &&
            formData.quantity &&
            formData.room && (
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-800 mb-2">
                  Device Preview
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Type:</strong>{" "}
                    {deviceTypes.find((t) => t.value === formData.type)?.label}
                  </p>
                  <p>
                    <strong>Rating:</strong> {formData.rating}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {formData.quantity}
                  </p>
                  <p>
                    <strong>Room:</strong>{" "}
                    {
                      availableRooms.find((r) => r.value === formData.room)
                        ?.label
                    }
                  </p>
                  <p>
                    <strong>Estimated Power:</strong>{" "}
                    {(
                      getPowerPerDevice(formData.type, formData.rating) *
                      parseInt(formData.quantity)
                    ).toFixed(0)}{" "}
                    W
                  </p>
                </div>
              </div>
            )}

          {/* Power Summary */}
          {devices.length > 0 && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-blue-800 mb-3">
                Power Summary by Room
              </h3>
              <div className="space-y-2">
                {(() => {
                  // Use the same calculation method as SwitchSocketSummaryTable
                  const loadPerUnitMap = {
                    "6A": 60,
                    "10A": 100,
                    "16A": 1000,
                    "20A": 1500,
                    "25A": 1800,
                    "32A": 2200,
                  };

                  // Group devices by room and calculate total load per room
                  const roomPowerMap = devices.reduce((acc, device) => {
                    const roomName = device.room;
                    const loadPerUnit = loadPerUnitMap[device.rating] || 0;
                    const totalLoad = loadPerUnit * device.quantity;

                    if (!acc[roomName]) {
                      acc[roomName] = 0;
                    }
                    acc[roomName] += totalLoad;
                    return acc;
                  }, {});

                  return Object.entries(roomPowerMap).map(
                    ([roomName, totalPower]) => (
                      <div
                        key={roomName}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-blue-700">{roomName}</span>
                        <span className="font-medium text-blue-800">
                          {totalPower.toLocaleString()} W
                        </span>
                      </div>
                    )
                  );
                })()}
              </div>
            </div>
          )}

          {/* Summary Table - Now positioned below the form */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg">
            <div className="p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="mr-2">📊</span>
                  Device Summary
                </span>
                <span className="text-xs text-gray-500">
                  Total: {devices.length} devices
                </span>
              </h3>

              {/* Use the proper SwitchSocketSummaryTable component */}
              <SwitchSocketSummaryTable
                data={filteredDevices}
                onDelete={handleDeleteDevice}
                selectedRoom={
                  availableRooms.find((r) => r.value === formData.room)
                    ?.label || ""
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canvas View - Now only contains Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview
          drawingMode={null}
          exitDrawingMode={() => {}}
          roomId={formData.room}
          numberOfLights={null}
        />
      </div>
    </div>
  );
};

export default PowerForm;
