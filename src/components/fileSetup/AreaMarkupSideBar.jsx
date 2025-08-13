import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentFloorId } from "../../redux/features/app/floorSlice";

import { ReloadIcon } from "../../icons/ReloadIcon";
import PlusIcon from "../../icons/PlusIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import CircleIcon from "../../icons/CircleIcon";
import PolygonalIcon from "../../icons/PolygonalIcon";
import RoomCreationModal from "./RoomCreationModal";
import { calculateAreaInMeters } from "../../utils/canvasUtils";

const GRID_SIZE = 100; // 100px = 1m for proper unit conversion

const AreaMarkupSidebar = () => {
  const dispatch = useDispatch();
  const [selectedShape, setSelectedShape] = useState("square");
  // const [buildingName, setBuildingName] = useState("Building 1");
  const [storeys, setStoreys] = useState("10");
  const [floorHeight, setFloorHeight] = useState(3200); // Default floor height in mm
  const [unit, setUnit] = useState("mm");

  const rooms = useSelector((state) => state.rooms?.rooms);
  const ROOMS = useSelector((state) => state.newRooms?.rooms);
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find((f) => f.id === currentFloorId);
  const selectedScale = useSelector((state) => state.project.scale);

  // Debug logging for room data
  useEffect(() => {
    console.log("🔍 AreaMarkupSideBar: Room data debug:", {
      totalRooms: ROOMS?.length,
      currentFloorId,
      currentFloor: currentFloor
        ? { id: currentFloor.id, name: currentFloor.name }
        : null,
      roomsWithFloorId: ROOMS?.filter((room) => room.floorId === currentFloorId)
        .length,
      allRooms: ROOMS?.map((room) => ({
        id: room.id,
        name: room.name,
        floorId: room.floorId,
        width: room.width,
        height: room.height,
        area: room.area,
      })),
    });

    // Check for duplicate room IDs
    if (ROOMS && ROOMS.length > 0) {
      const roomIds = ROOMS.map((room) => room.id || room._id);
      const uniqueIds = new Set(roomIds);
      if (roomIds.length !== uniqueIds.size) {
        console.warn("⚠️ Duplicate room IDs detected:", {
          totalRooms: roomIds.length,
          uniqueRooms: uniqueIds.size,
          duplicates: roomIds.filter(
            (id, index) => roomIds.indexOf(id) !== index
          ),
        });
      }
    }
  }, [ROOMS, currentFloorId, currentFloor]);

  // Sync floor height from current floor data
  useEffect(() => {
    if (currentFloor) {
      // Check for floorHeight property first (from Floor Editor)
      if (
        currentFloor.floorHeight !== undefined &&
        currentFloor.floorHeight !== null
      ) {
        // Ensure the value is in mm and reasonable range
        let heightValue = currentFloor.floorHeight;

        // If the value is too large (likely in micrometers or wrong unit), convert
        if (heightValue > 10000) {
          heightValue = heightValue / 1000;
        }

        // If the value is too small (likely in meters), convert to mm
        if (heightValue < 10) {
          heightValue = heightValue * 1000;
        }

        setFloorHeight(heightValue);
      }
      // Check for height property (alternative)
      else if (
        currentFloor.height !== undefined &&
        currentFloor.height !== null
      ) {
        let heightValue = currentFloor.height;

        // If the value is too large, convert
        if (heightValue > 10000) {
          heightValue = heightValue / 1000;
        }

        // If the value is too small (likely in meters), convert to mm
        if (heightValue < 10) {
          heightValue = heightValue * 1000;
        }

        setFloorHeight(heightValue);
      }
      // Use default
      else {
        setFloorHeight(3200);
      }
    } else {
      // No floor selected, use default
      setFloorHeight(3200);
    }
  }, [currentFloor]);

  // Convert pixels to logical units (meters)
  const convertToLogicalUnits = (pixels) => {
    return pixels / GRID_SIZE;
  };

  const convertPixelsToMeters = (meters) => {
    return meters / GRID_SIZE;
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

  // State for modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleCloseModal = () => {
    setShowRoomModal(false);
    setSelectedRoom(null);
  };

  const handleRoomModalSave = (roomId) => {
    setShowRoomModal(false);
    setSelectedRoom(null);
  };

  return (
    <div className="w-[340px] h-[90vh] bg-white p-[16px] border-r border-gray-300 text-sm font-medium s relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[#222222] font-semibold text-[14px] leading-[18px]">
            Area markup
          </h2>
          <p className="text-[11px] text-[#A0A0A0] mt-[2px]">
            Updated: Just now
          </p>
        </div>
        <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
          <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
        </button>
      </div>

      <hr className="my-[16px] border-gray-200" />

      {/* Current Floor Information */}
      {currentFloor && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Current Floor
          </h4>
          <p className="text-xs text-blue-700 mb-1">
            <span className="font-medium">Name:</span>{" "}
            {currentFloor.name || `Floor ${currentFloor.id}`}
          </p>
          {currentFloor.shapes && currentFloor.shapes.length > 0 && (
            <p className="text-xs text-blue-700">
              <span className="font-medium">Shapes:</span>{" "}
              {currentFloor.shapes.length} shape(s)
            </p>
          )}
        </div>
      )}

      {/* Add building */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Floor
        </label>
        <select
          className="mt-1 block w-full h-[35px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={currentFloorId || ""}
          onChange={(e) => {
            dispatch(setCurrentFloorId(e.target.value));
          }}
        >
          <option value="">-- Select Floor --</option>
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.name || `Floor ${floor.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Draw Building Rooms */}
      <p className="text-[#333333] text-[13px] mb-[6px]">Draw Building rooms</p>
      {currentFloor ? (
        <p className="text-xs text-green-600 mb-2">
          ✓ Click and drag on the canvas to draw rooms
        </p>
      ) : (
        <p className="text-xs text-red-600 mb-2">
          ⚠ Please select a floor first
        </p>
      )}
      <div className="flex gap-[6px] mb-[16px]">
        <button
          className={`flex-1 h-[36px] border rounded-[8px] flex items-center justify-center transition ${
            selectedShape === "square"
              ? "bg-[#0083EE] text-white border-[#0083EE]"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
          onClick={() => setSelectedShape("square")}
        >
          <ReactangleIcon className="w-[16px] h-[16px]" />
        </button>
        <button
          className={`flex-1 h-[36px] border rounded-[8px] flex items-center justify-center transition ${
            selectedShape === "circle"
              ? "bg-[#0083EE] text-white border-[#0083EE]"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
          onClick={() => setSelectedShape("circle")}
        >
          <CircleIcon className="w-[16px] h-[16px]" />
        </button>
        <button
          className={`flex-1 h-[36px] border rounded-[8px] flex items-center justify-center transition ${
            selectedShape === "hex"
              ? "bg-[#0083EE] text-white border-[#0083EE]"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
          onClick={() => setSelectedShape("hex")}
        >
          <PolygonalIcon className="w-[16px] h-[16px]" />
        </button>
      </div>

      <hr className="my-[16px] border-gray-200" />

      {/* Floor Height */}
      <p className="text-[#333333] text-[13px] mb-[6px]">Floor Height</p>
      <div className="flex gap-[8px] mb-[16px]">
        <input
          className="flex-1 border border-gray-300 rounded-[8px] px-[10px] py-[6px] bg-gray-100 text-[13px] text-gray-600"
          value={floorHeight.toFixed(0)}
          readOnly
          placeholder="Floor height from Floor Editor"
        />
        <select
          className="w-[80px] border border-gray-300 rounded-[8px] px-[6px] py-[6px] bg-gray-100 text-[13px] text-gray-600"
          value={unit}
          disabled
        >
          <option>mm</option>
        </select>
      </div>

      {/* Rooms */}
      <p className="text-[#333333] text-[13px] mb-[6px]">
        Rooms created{" "}
        {currentFloorId
          ? `(Floor: ${currentFloor?.name || currentFloorId})`
          : "(All Floors)"}
      </p>
      <div className="space-y-[8px]">
        {(() => {
          // Filter rooms once and store the result
          const filteredRooms = currentFloorId
            ? ROOMS?.filter((room) => {
                return room.floorId === currentFloorId;
              })
            : ROOMS;

          // Remove duplicates based on room ID to prevent double rendering
          const uniqueRooms = filteredRooms
            ? filteredRooms.filter(
                (room, index, self) =>
                  index ===
                  self.findIndex(
                    (r) => (r.id || r._id) === (room.id || room._id)
                  )
              )
            : [];

          // Check if no rooms exist
          if (!uniqueRooms || uniqueRooms.length === 0) {
            return (
              <div className="text-center py-4 text-gray-500 text-sm">
                {currentFloorId
                  ? `No rooms created on ${
                      currentFloor?.name || "this floor"
                    } yet. Draw a room on the canvas to get started.`
                  : "No rooms created yet. Select a floor and draw rooms on the canvas to get started."}
              </div>
            );
          }

          // Render the rooms
          return uniqueRooms.map((room, index) => {
            // Calculate area with fallback to room.area if width/height are not available
            let areaInMeters;
            if (
              room.width !== undefined &&
              room.width !== null &&
              room.height !== undefined &&
              room.height !== null
            ) {
              areaInMeters = calculateAreaInMeters(room.width, room.height);
            } else if (room.area !== undefined && room.area !== null) {
              // Use the stored area if dimensions are not available
              areaInMeters = room.area;
            } else {
              areaInMeters = 0;
            }

            const hasFalseCeiling =
              room.falseCeiling && room.falseCeiling.trim() !== "";

            return (
              <div
                key={room.id || room._id || `room-${index}`}
                onClick={() => handleRoomClick(room)}
                className={`cursor-pointer flex items-center border rounded-[8px] px-[10px] py-[6px] transition ${
                  hasFalseCeiling
                    ? "border-pink-400 bg-pink-50 text-gray-700 hover:bg-pink-100"
                    : "border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div className="text-sm text-gray-700 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {hasFalseCeiling ? "🏠" : "🏠"}
                    </span>
                    <p className="font-medium text-blue-600 flex-1">
                      {room.name || "Unnamed Room"} – {areaInMeters.toFixed(1)}{" "}
                      m²
                    </p>
                    {room.roomType && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {room.roomType}
                      </span>
                    )}
                    {hasFalseCeiling && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        False Ceiling
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Dimensions:</span>{" "}
                    {room.width !== undefined &&
                    room.width !== null &&
                    room.height !== undefined &&
                    room.height !== null
                      ? `${convertPixelsToMeters(
                          room.width
                        )} × ${convertPixelsToMeters(room.height)} m`
                      : "Dimensions not available"}
                    {room.wallThickness && (
                      <span className="ml-2">
                        <span className="font-medium">Wall:</span>{" "}
                        {room.wallThickness}m
                      </span>
                    )}
                    {room.falseCeiling && (
                      <span className="ml-2">
                        <span className="font-medium">Ceiling:</span>{" "}
                        {room.falseCeiling}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Room Creation Modal */}
      {showRoomModal && selectedRoom && (
        <RoomCreationModal
          room={selectedRoom}
          onClose={handleCloseModal}
          onSave={handleRoomModalSave}
          isNewRoom={false}
        />
      )}
    </div>
  );
};

export default AreaMarkupSidebar;
