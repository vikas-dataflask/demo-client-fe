import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentFloorId } from "../../redux/features/app/floorSlice";
import { setRooms, updateRoomProperties } from "../../redux/features/app/roomSlice";
import { createRooms } from "../../redux/features/app/newRoomSlice";

import { ReloadIcon } from "../../icons/ReloadIcon";
import PlusIcon from "../../icons/PlusIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import CircleIcon from "../../icons/CircleIcon";
import PolygonalIcon from "../../icons/PolygonalIcon";
import RoomCreationModal from "./RoomCreationModal";
import { calculateAreaInMeters } from "../../utils/canvasUtils";

const GRID_SIZE = 100; // 100px = 1m for proper unit conversion

const AreaMarkupSidebar = ({setCreated}) => {
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
  
  // AI Rooms data from Redux
  const aiRooms = useSelector((state) => state.aiRoomData?.rooms || []);
  const [showAIRoomsModal, setShowAIRoomsModal] = useState(false);
  const [aiRoomsStatus, setAiRoomsStatus] = useState({ type: 'info', message: '' });
  const [isImportingAIRooms, setIsImportingAIRooms] = useState(false);

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

  // Debug logging for AI rooms
  useEffect(() => {
    console.log("🤖 AreaMarkupSideBar: AI Rooms data:", {
      aiRoomsCount: aiRooms?.length || 0,
      aiRooms: aiRooms?.map(room => ({
        name: room.name,
        category: room.category,
        dimensions: room.dimensions,
        width: room.width,
        height: room.height
      }))
    });
  }, [aiRooms]);

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

  // Convert meters to pixels (for AI room dimensions)
  const convertMetersToPixels = (meters) => {
    return meters * GRID_SIZE;
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

  // Function to handle AI rooms import
  const handleImportAIRooms = () => {
    if (!currentFloorId) {
      setAiRoomsStatus({
        type: 'error',
        message: 'Please select a floor first before importing AI rooms.'
      });
      return;
    }

    if (!aiRooms || aiRooms.length === 0) {
      setAiRoomsStatus({
        type: 'warning',
        message: 'No AI rooms found. Please use the AI File Processor to extract room data first.'
      });
      return;
    }

    if (!currentFloor || !currentFloor.shapes || currentFloor.shapes.length === 0) {
      setAiRoomsStatus({
        type: 'error',
        message: 'No floor shapes found. Please create a floor first in the Floor Editor.'
      });
      return;
    }

    try {
      setIsImportingAIRooms(true);
      
      // Get the floor shape to calculate boundaries
      const floorShape = currentFloor.shapes[0]; // Use the first shape as the main floor
      if (!floorShape) {
        throw new Error('No floor shape found');
      }

      // Calculate floor boundaries based on shape type
      let floorBounds;
      if (floorShape.shape === 'rectangle') {
        // Rectangle floor
        floorBounds = {
          x: floorShape.x || 0,
          y: floorShape.y || 0,
          width: floorShape.width || 1000,
          height: floorShape.height || 1000
        };
      } else if (floorShape.shape === 'polygon' && floorShape.points) {
        // Polygon floor - calculate bounding box
        const points = floorShape.points;
        const xCoords = points.map(p => p.x);
        const yCoords = points.map(p => p.y);
        
        floorBounds = {
          x: Math.min(...xCoords),
          y: Math.min(...yCoords),
          width: Math.max(...xCoords) - Math.min(...xCoords),
          height: Math.max(...yCoords) - Math.min(...yCoords)
        };
      } else {
        // Fallback to default bounds
        floorBounds = {
          x: 0,
          y: 0,
          width: 1000,
          height: 1000
        };
      }

      console.log('🏗️ Floor bounds for AI room placement:', floorBounds);

      // Calculate total area of all AI rooms to scale them proportionally
      const totalAIRoomArea = aiRooms.reduce((total, room) => {
        const roomArea = (room.width || 0) * (room.height || 0);
        return total + roomArea;
      }, 0);

      // Calculate floor area in square meters
      const floorAreaInMeters = (floorBounds.width / GRID_SIZE) * (floorBounds.height / GRID_SIZE);
      
      // Calculate scaling factor to fit AI rooms within floor
      const scaleFactor = Math.sqrt(floorAreaInMeters / totalAIRoomArea) * 0.8; // 80% of floor area

      console.log('📏 AI Room scaling:', {
        totalAIRoomArea,
        floorAreaInMeters,
        scaleFactor
      });

      // Convert AI rooms to room format and add to Redux
      const convertedRooms = aiRooms.map((aiRoom, index) => {
        // Scale dimensions according to floor size
        const scaledWidth = (aiRoom.width || 0) * scaleFactor;
        const scaledHeight = (aiRoom.height || 0) * scaleFactor;
        
        // Convert scaled dimensions from meters to pixels
        const widthInPixels = convertMetersToPixels(scaledWidth);
        const heightInPixels = convertMetersToPixels(scaledHeight);
        
        // Calculate area in pixels
        const areaInPixels = widthInPixels * heightInPixels;
        
        // Generate unique room ID
        const roomId = `ai-room-${Date.now()}-${index}`;
        
        // Calculate room position within floor boundaries
        // Use proportional positioning based on room index and total rooms
        const totalRooms = aiRooms.length;
        const roomsPerRow = Math.ceil(Math.sqrt(totalRooms));
        const row = Math.floor(index / roomsPerRow);
        const col = index % roomsPerRow;
        
        // Calculate spacing between rooms
        const padding = 50; // 50px padding between rooms
        const availableWidth = floorBounds.width - (padding * (roomsPerRow + 1));
        const availableHeight = floorBounds.height - (padding * (Math.ceil(totalRooms / roomsPerRow) + 1));
        
        // Calculate room size to fit within available space
        const maxRoomWidth = Math.min(widthInPixels, availableWidth / roomsPerRow);
        const maxRoomHeight = Math.min(heightInPixels, availableHeight / Math.ceil(totalRooms / roomsPerRow));
        
        // Position room within floor boundaries
        const startX = floorBounds.x + padding + (col * (maxRoomWidth + padding));
        const startY = floorBounds.y + padding + (row * (maxRoomHeight + padding));
        
        // Ensure room doesn't exceed floor boundaries
        const finalX = Math.max(floorBounds.x + padding, Math.min(startX, floorBounds.x + floorBounds.width - maxRoomWidth - padding));
        const finalY = Math.max(floorBounds.y + padding, Math.min(startY, floorBounds.y + floorBounds.height - maxRoomHeight - padding));
        
        // For polygon floors, ensure the room center is within the polygon
        let adjustedX = finalX;
        let adjustedY = finalY;
        
        if (floorShape.shape === 'polygon' && floorShape.points) {
          // Check if room center is within polygon bounds
          const roomCenterX = finalX + (maxRoomWidth / 2);
          const roomCenterY = finalY + (maxRoomHeight / 2);
          
          // Simple boundary check - ensure room center is within the bounding box
          if (roomCenterX < floorBounds.x || roomCenterX > floorBounds.x + floorBounds.width ||
              roomCenterY < floorBounds.y || roomCenterY > floorBounds.y + floorBounds.height) {
            // Adjust position to keep room within bounds
            adjustedX = Math.max(floorBounds.x + padding, Math.min(adjustedX, floorBounds.x + floorBounds.width - maxRoomWidth - padding));
            adjustedY = Math.max(floorBounds.y + padding, Math.min(adjustedY, floorBounds.y + floorBounds.height - maxRoomHeight - padding));
          }
        }
        
        console.log(`🏠 AI Room ${index + 1} placement:`, {
          name: aiRoom.name,
          originalDimensions: `${aiRoom.width}m × ${aiRoom.height}m`,
          scaledDimensions: `${scaledWidth.toFixed(2)}m × ${scaledHeight.toFixed(2)}m`,
          pixelDimensions: `${maxRoomWidth}px × ${maxRoomHeight}px`,
          position: `(${adjustedX}, ${adjustedY})`,
          floorBounds,
          floorShapeType: floorShape.shape
        });
        
        return {
          id: roomId,
          x: adjustedX,
          y: adjustedY,
          width: Math.max(maxRoomWidth, 50), // Minimum 50px width
          height: Math.max(maxRoomHeight, 50), // Minimum 50px height
          area: areaInPixels,
          name: aiRoom.name || `AI Room ${index + 1}`,
          roomType: aiRoom.category || "AI Generated",
          wallThickness: 0.2,
          falseCeiling: "",
          floorId: currentFloorId,
          createdAt: new Date().toISOString(),
          source: 'ai',
          originalDimensions: aiRoom.dimensions,
          category: aiRoom.category,
          // Store scaling information for reference
          scalingInfo: {
            originalWidth: aiRoom.width,
            originalHeight: aiRoom.height,
            scaleFactor: scaleFactor,
            floorArea: floorAreaInMeters
          }
        };
      });

      console.log('🤖 Converting AI rooms to room format:', convertedRooms);

      // Add rooms to both Redux slices for compatibility
      convertedRooms.forEach(room => {
        dispatch(createRooms(room));
        dispatch(updateRoomProperties({ id: room.id, updates: room }));
      });

      setAiRoomsStatus({
        type: 'success',
        message: `Successfully imported ${convertedRooms.length} AI rooms to the current floor.`
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setAiRoomsStatus({ type: 'info', message: '' });
      }, 3000);

    } catch (error) {
      console.error('Error importing AI rooms:', error);
      setAiRoomsStatus({
        type: 'error',
        message: `Error importing AI rooms: ${error.message}`
      });
    } finally {
      setIsImportingAIRooms(false);
    }
    setCreated(true)
  };

  // Function to clear AI rooms status
  const clearAIRoomsStatus = () => {
    setAiRoomsStatus({ type: 'info', message: '' });
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



      {/* AI Rooms Import Section */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-md">
        <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-2">
          <span className="text-lg">🤖</span>
          AI Rooms Import
        </h4>
        
        {/* AI Rooms Status */}
        {aiRoomsStatus.message && (
          <div className={`mb-3 p-2 rounded text-xs ${
            aiRoomsStatus.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : aiRoomsStatus.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-200'
              : aiRoomsStatus.type === 'warning'
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>{aiRoomsStatus.message}</span>
              <button 
                onClick={clearAIRoomsStatus}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* AI Rooms Info */}
        <div className="mb-3 text-xs text-purple-700">
          <div className="flex items-center justify-between mb-1">
            <span>Available AI Rooms:</span>
            <span className="font-medium">{aiRooms?.length || 0}</span>
          </div>
          {aiRooms && aiRooms.length > 0 && (
            <div className="text-xs text-purple-600">
              {aiRooms.slice(0, 3).map((room, index) => (
                <div key={index} className="truncate">
                  • {room.name} ({room.width || 0}m × {room.height || 0}m)
                </div>
              ))}
              {aiRooms.length > 3 && (
                <div className="text-purple-500">... and {aiRooms.length - 3} more</div>
              )}
            </div>
          )}
        </div>

        {/* Import Button */}
        <button
          onClick={handleImportAIRooms}
          disabled={!currentFloorId || !aiRooms || aiRooms.length === 0 || isImportingAIRooms}
          className={`w-full py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
            currentFloorId && aiRooms && aiRooms.length > 0 && !isImportingAIRooms
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:shadow-md active:scale-95'
              : isImportingAIRooms
              ? 'bg-purple-400 text-white cursor-wait'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isImportingAIRooms ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto mb-1"></div>
              Importing AI Rooms...
            </>
          ) : aiRooms && aiRooms.length > 0 ? (
            `Import ${aiRooms.length} AI Room${aiRooms.length !== 1 ? 's' : ''}`
          ) : (
            'No AI Rooms Available'
          )}
        </button>

        {/* Help Text */}
        <p className="text-xs text-purple-600 mt-2">
          Use AI File Processor to extract room data from PDFs, then import here
        </p>
        
        {/* AI Import Status Notice */}
        {isImportingAIRooms && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Room creation is temporarily disabled during AI import</span>
            </div>
          </div>
        )}
        
        {/* AI Rooms Status Notice */}
        {(() => {
          const aiRoomsOnFloor = ROOMS?.filter(room => 
            room.floorId === currentFloorId && room.source === 'ai'
          ) || [];
          
          if (aiRoomsOnFloor.length > 0) {
            return (
              <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Manual room creation permanently disabled - {aiRoomsOnFloor.length} AI room{aiRoomsOnFloor.length !== 1 ? 's' : ''} exist</span>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Draw Building Rooms */}
      <p className="text-[#333333] text-[13px] mb-[6px]">Draw Building rooms</p>
      {currentFloor ? (
        (() => {
          const aiRoomsOnFloor = ROOMS?.filter(room => 
            room.floorId === currentFloorId && room.source === 'ai'
          ) || [];
          
          if (aiRoomsOnFloor.length > 0) {
            return (
              <p className="text-xs text-purple-600 mb-2">
                🚫 Room creation disabled - {aiRoomsOnFloor.length} AI room{aiRoomsOnFloor.length !== 1 ? 's' : ''} already exist
              </p>
            );
          } else if (isImportingAIRooms) {
            return (
              <p className="text-xs text-yellow-600 mb-2">
                ⏳ Room creation temporarily disabled during AI import
              </p>
            );
          } else {
            return (
              <p className="text-xs text-green-600 mb-2">
                ✓ Click and drag on the canvas to draw rooms
              </p>
            );
          }
        })()
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

            // Check if this is an AI-generated room
            const isAIRoom = room.source === 'ai';

            return (
              <div
                key={room.id || room._id || `room-${index}`}
                onClick={() => handleRoomClick(room)}
                className={`cursor-pointer flex items-center border rounded-[8px] px-[10px] py-[6px] transition ${
                  hasFalseCeiling
                    ? "border-pink-400 bg-pink-50 text-gray-700 hover:bg-pink-100"
                    : isAIRoom
                    ? "border-purple-400 bg-purple-50 text-gray-700 hover:bg-purple-100"
                    : "border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div className="text-sm text-gray-700 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {hasFalseCeiling ? "🏠" : isAIRoom ? "🤖" : "🏠"}
                    </span>
                    <p className="font-medium text-blue-600 flex-1">
                      {room.name || "Unnamed Room"} – {areaInMeters.toFixed(1)}{" "}
                      m²
                    </p>
                    {room.roomType && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        isAIRoom 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {room.roomType}
                      </span>
                    )}
                    {hasFalseCeiling && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        False Ceiling
                      </span>
                    )}
                    {isAIRoom && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        AI Generated
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
                    {isAIRoom && room.originalDimensions && (
                      <span className="ml-2">
                        <span className="font-medium">AI Data:</span>{" "}
                        {room.originalDimensions}
                      </span>
                    )}
                    {isAIRoom && room.scalingInfo && (
                      <span className="ml-2">
                        <span className="font-medium">Scaled:</span>{" "}
                        {(room.scalingInfo.originalWidth * room.scalingInfo.scaleFactor).toFixed(2)}m × {(room.scalingInfo.originalHeight * room.scalingInfo.scaleFactor).toFixed(2)}m
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
