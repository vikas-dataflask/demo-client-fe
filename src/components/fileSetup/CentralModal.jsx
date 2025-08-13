import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateRoomName,
  updateRoomDimensions,
} from "../../redux/features/app/roomSlice";

const GRID_SIZE = 100; // Match the scale system from RoomEditor.jsx (100px = 1m)

const CentralModal = ({ room, onClose }) => {
  const [roomName, setRoomName] = useState("");
  const [widthMeters, setWidthMeters] = useState("");
  const [heightMeters, setHeightMeters] = useState("");
  const [roomType, setRoomType] = useState("");
  const [wallThickness, setWallThickness] = useState("0.2");
  const [fallCeiling, setFallCeiling] = useState("");
  const [isWidthEditing, setIsWidthEditing] = useState(false);
  const [isHeightEditing, setIsHeightEditing] = useState(false);
  const dispatch = useDispatch();

  const selectedScale = useSelector((state) => state.project.scale);

  // Convert pixels to logical units (meters)
  const convertToLogicalUnits = (pixels) => {
    return pixels / GRID_SIZE;
  };

  // Convert logical units (meters) to pixels
  const convertToPixels = (logicalUnits) => {
    return logicalUnits * GRID_SIZE;
  };

  // Get the appropriate unit label based on selected scale
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

  // Convert area to the selected scale
  const convertArea = (pixelArea) => {
    const areaInLogicalUnits = pixelArea / (GRID_SIZE * GRID_SIZE);
    const areaInSquareMeters = areaInLogicalUnits;

    switch (selectedScale) {
      case "Inches":
        return areaInSquareMeters * 1550.0031;
      case "Feet":
        return areaInSquareMeters * 10.7639;
      case "Square Yards":
        return areaInSquareMeters * 1.19599;
      default:
        return areaInSquareMeters; // Meters
    }
  };

  useEffect(() => {
    if (room) {
      console.log("🔍 CentralModal: Room data received:", {
        id: room.id,
        name: room.name,
        width: room.width,
        height: room.height,
        area: room.area,
        widthType: typeof room.width,
        heightType: typeof room.height
      });
      
      setRoomName(room.name || "");
      // Convert pixel dimensions to logical units for display
      const widthInMeters = convertToLogicalUnits(room.width);
      const heightInMeters = convertToLogicalUnits(room.height);
      
      console.log("🔍 CentralModal: Converting dimensions:", {
        widthPixels: room.width,
        heightPixels: room.height,
        widthMeters: widthInMeters,
        heightMeters: heightInMeters,
        GRID_SIZE
      });
      
      setWidthMeters(widthInMeters.toFixed(2));
      setHeightMeters(heightInMeters.toFixed(2));
    }
  }, [room]);

  const handleWidthChange = (e) => {
    setWidthMeters(e.target.value);
  };

  const handleHeightChange = (e) => {
    setHeightMeters(e.target.value);
  };

  const handleWidthBlur = () => {
    setIsWidthEditing(false);
    const newWidthMeters = parseFloat(widthMeters) || 0;
    if (newWidthMeters > 0) {
      const newWidthPixels = convertToPixels(newWidthMeters);
      console.log("🔍 CentralModal: Updating width:", {
        newWidthMeters,
        newWidthPixels,
        roomId: room.id,
        GRID_SIZE
      });
      dispatch(
        updateRoomDimensions({
          id: room.id,
          width: newWidthPixels,
          height: room.height,
        })
      );
    } else {
      // Reset to current value if invalid
      setWidthMeters(convertToLogicalUnits(room.width).toFixed(2));
    }
  };

  const handleHeightBlur = () => {
    setIsHeightEditing(false);
    const newHeightMeters = parseFloat(heightMeters) || 0;
    if (newHeightMeters > 0) {
      const newHeightPixels = convertToPixels(newHeightMeters);
      console.log("🔍 CentralModal: Updating height:", {
        newHeightMeters,
        newHeightPixels,
        roomId: room.id,
        GRID_SIZE
      });
      dispatch(
        updateRoomDimensions({
          id: room.id,
          width: room.width,
          height: newHeightPixels,
        })
      );
    } else {
      // Reset to current value if invalid
      setHeightMeters(convertToLogicalUnits(room.height).toFixed(2));
    }
  };

  const handleWidthFocus = () => {
    setIsWidthEditing(true);
  };

  const handleHeightFocus = () => {
    setIsHeightEditing(true);
  };

  const handleSubmit = () => {
    dispatch(updateRoomName({ id: room.id, name: roomName }));
    onClose();
  };

  const currentArea = room ? convertArea(room.width * room.height) : 0;
  const unitLabel = getUnitLabel();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[650px] p-6 rounded-2xl shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-800">Room Details</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">
            &times;
          </button>
        </div>

        <div className="text-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Width ({unitLabel})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={widthMeters}
                onChange={handleWidthChange}
                onFocus={handleWidthFocus}
                onBlur={handleWidthBlur}
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Height ({unitLabel})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={heightMeters}
                onChange={handleHeightChange}
                onFocus={handleHeightFocus}
                onBlur={handleHeightBlur}
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Room Type
              </label>
              <select
                className="w-full bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-0"
                // value={displayUnit}
                // onChange={}
              >
                <option value="m"></option>
                <option value="mm"></option>
                <option value="cm"></option>
                <option value="ft"></option>
                <option value="inch"></option>
                <option value="sq yd"></option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Wall Thickness ({unitLabel})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={wallThickness}
                onChange={handleHeightChange}
                onFocus={handleHeightFocus}
                onBlur={handleHeightBlur}
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1">
                <input
                  type="checkbox"
                  checked={fallCeiling !== ""}
                  onChange={
                    (e) => setFallCeiling(e.target.checked ? "0.3" : "") // default value or reset
                  }
                  className="form-checkbox text-blue-600"
                />
                Fall Ceiling
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={fallCeiling}
                onChange={(e) => setFallCeiling(e.target.value)}
                disabled={fallCeiling === ""}
                className={`w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400 ${
                  fallCeiling === "" ? "bg-gray-100 text-gray-400" : ""
                }`}
                placeholder="e.g. 0.3"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Area:</strong> {currentArea.toFixed(2)}{" "}
              {selectedScale === "Inches"
                ? "in²"
                : selectedScale === "Feet"
                ? "ft²"
                : selectedScale === "Square Yards"
                ? "yd²"
                : "m²"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Changes to width and height will update the room size when you
              finish editing (click outside or press Enter)
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralModal;
