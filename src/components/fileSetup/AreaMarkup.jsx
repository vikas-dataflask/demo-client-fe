import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Layer, Rect, Line, Text, Image, Group, Circle } from "react-konva";
import AreaMarkupSidebar from "./AreaMarkupSideBar";
import EntityRenderer from "../../drawing/EntityRender";
import CanvasWrapper from "../Canvas/CanvasWrapper";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import {
  resetRooms,
  setRooms,
  updateRoomProperties,
  removeRoom,
  updateRoomPosition,
} from "../../redux/features/app/roomSlice";
import {
  setCurrentFloorId,
  addFloor,
} from "../../redux/features/app/floorSlice";
import {
  processRoomWallsAsync,
  setHighlightedWalls,
  fetchWallsByFloor,
  clearWalls,
} from "../../redux/features/app/wallSlice";
import RoomCreationModal from "./RoomCreationModal";
import RoomDebugPanel from "./RoomDebugPanel";
import { calculateAreaInMeters } from "../../utils/canvasUtils";
import WallRenderer from "../Canvas/WallRenderer";
import WallEditor from "../Canvas/WallEditor";
import {
  useGetRoomsByFloorQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
} from "../../redux/features/api/floorRoomApi";
import {
  convertRoomToBackendFormat,
  convertRoomFromBackendFormat,
} from "../../utils/floorRoomApi";
import { getRoomsByFloor } from "../../utils/floorRoomApi";
import {
  createRooms,
  updateRoomPosition as updateNewRoomPosition,
  clearRooms,
} from "../../redux/features/app/newRoomSlice";
import { selectPixelsPerMeter } from "../../redux/features/app/calibrationSlice";

const AreaMarkup = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);

  const [created, setCreated] = useState(false);

  // Room drawing state
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [roomStartPoint, setRoomStartPoint] = useState(null);
  const [roomCurrentPoint, setRoomCurrentPoint] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newlyCreatedRoom, setNewlyCreatedRoom] = useState(null);
  const [showWallEditor, setShowWallEditor] = useState(false);
  const [dragUpdateCounter, setDragUpdateCounter] = useState(0);

  // PNG image state for PDF conversions (same as Editor.jsx)
  const [pngImage, setPngImage] = useState(null);
  const [pngDimensions, setPngDimensions] = useState({ width: 0, height: 0 });
  const [pngError, setPngError] = useState(null);

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};
  const rooms = useSelector((state) => state.rooms.rooms);
  const ROOMS = useSelector((state) => state.newRooms.rooms);
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find((f) => f.id === currentFloorId);
  const selectedScale = useSelector((state) => state.project.scale);
  const walls = useSelector((state) => state.walls.walls);
  const pixelsPerMeter = useSelector(selectPixelsPerMeter); // Get calibrated scale from Redux

  // Get PNG data from Redux state (same as Editor.jsx)
  const dxfData = useSelector((state) => state.floor.floor_dxf) || {};

  // Handle PNG image from PDF conversion (same logic as Editor.jsx)
  useEffect(() => {
    console.log("🎯 AreaMarkup: PNG image effect triggered", {
      hasDxfData: !!dxfData,
      source: dxfData?.source,
      hasPng: !!dxfData?.png,
      pngType: dxfData?.png ? typeof dxfData.png : "none",
    });

    // Clear any previous errors
    setPngError(null);

    if (dxfData?.source === "pdf" && dxfData?.png) {
      console.log("🎯 AreaMarkup: Processing PNG data for PDF source");

      // Convert base64 or buffer to image
      const img = new window.Image();

      img.onload = () => {
        console.log("🎯 AreaMarkup: PNG image loaded successfully", {
          width: img.width,
          height: img.height,
        });
        setPngDimensions({
          width: img.width,
          height: img.height,
        });
        setPngImage(img);
      };

      img.onerror = (error) => {
        console.error("🎯 AreaMarkup: PNG image failed to load:", error);
        setPngError("Failed to load PNG image");
        setPngImage(null);
        setPngDimensions({ width: 0, height: 0 });
      };

      // Handle different PNG data formats
      if (typeof dxfData.png === "string") {
        console.log(
          "🎯 AreaMarkup: PNG is base64 string, length:",
          dxfData.png.length
        );
        // If it's a base64 string
        img.src = dxfData.png;
      } else if (dxfData.png instanceof ArrayBuffer) {
        console.log(
          "🎯 AreaMarkup: PNG is ArrayBuffer, size:",
          dxfData.png.byteLength
        );
        // If it's a buffer, convert to blob URL
        const blob = new Blob([dxfData.png], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        img.src = url;

        // Cleanup function
        return () => URL.revokeObjectURL(url);
      }
    } else {
      console.log("🎯 AreaMarkup: No PNG data available, clearing image state");
      setPngImage(null);
      setPngDimensions({ width: 0, height: 0 });
    }
  }, [dxfData]);

  // Debug logging for PNG state
  useEffect(() => {
    console.log("🎯 AreaMarkup: PNG state updated", {
      hasPngImage: !!pngImage,
      pngDimensions,
      hasDxfData: !!dxfData,
      source: dxfData?.source,
    });
  }, [pngImage, pngDimensions, dxfData]);

  // API hooks for room operations
  const {
    data: roomsData,
    isLoading: roomsLoading,
    error: roomsError,
  } = useGetRoomsByFloorQuery(currentFloorId, {
    skip:
      !currentFloorId ||
      currentFloorId === "undefined" ||
      currentFloorId === "null" ||
      currentFloorId.startsWith("floor-") ||
      !/^[0-9a-fA-F]{24}$/.test(currentFloorId) ||
      floors.length === 0,
  });
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();

  // Calculate hasFloor early to avoid initialization issues
  const hasEntities = entities.length > 0;
  const hasFloor =
    currentFloor && currentFloor.shapes && currentFloor.shapes.length > 0;

  // Debug logging
  useEffect(() => {}, [
    ROOMS,
    currentFloorId,
    currentFloor,
    data,
    isLoading,
    isError,
    projectId,
    hasFloor,
    dragUpdateCounter,
  ]);

  // Reset rooms when component mounts or when floor changes
  useEffect(() => {
    dispatch(resetRooms());
  }, [dispatch, currentFloorId]);

  // Set current floor if none is selected and floors exist
  useEffect(() => {
    if (!currentFloorId && floors.length > 0) {
      dispatch(setCurrentFloorId(floors[0].id));
    }
  }, [currentFloorId, floors, dispatch]);

  // Fetch walls and rooms for the current floor
  useEffect(() => {
    if (currentFloorId && projectId) {
      // Clear existing walls first
      dispatch(clearWalls());
      // Fetch walls for the current floor
      dispatch(fetchWallsByFloor({ projectId, floorId: currentFloorId }));

      // Load existing rooms for this floor
      const loadRooms = async () => {
        try {
          // Validate floor ID before making the API call
          const isValidFloorId =
            currentFloorId &&
            typeof currentFloorId === "string" &&
            currentFloorId.trim() !== "" &&
            currentFloorId !== "undefined" &&
            currentFloorId !== "null" &&
            !currentFloorId.startsWith("floor-") &&
            /^[0-9a-fA-F]{24}$/.test(currentFloorId);

          if (!isValidFloorId) {
            return;
          }

          const backendRooms = await getRoomsByFloor(currentFloorId);

          // Convert backend rooms to frontend format
          const frontendRooms = backendRooms.data
            ? backendRooms.data.map((room) =>
                convertRoomFromBackendFormat(room)
              )
            : [];

          // Set rooms from backend (this replaces all existing rooms)
          dispatch(setRooms(frontendRooms));

          // Also update the newRooms slice to keep them in sync
          // Clear existing rooms first to avoid duplicates
          dispatch(clearRooms());
          frontendRooms.forEach((room) => {
            dispatch(createRooms(room));
          });
        } catch (error) {
          console.error("Error loading rooms:", error);
        }
      };

      loadRooms();
    }
  }, [currentFloorId, projectId, dispatch]);

  // Early returns after all hooks
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading project.</div>;

  // Room drawing handlers
  const handleMouseDown = (e) => {
    if (!hasFloor) {
      return;
    }

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    // Get canvas position and scale directly from stage
    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    // Convert pointer to canvas coordinate
    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;

    // Handle room drawing
    setIsDrawingRoom(true);
    setRoomStartPoint({ x: canvasX, y: canvasY });
    setRoomCurrentPoint({ x: canvasX, y: canvasY });
  };

  const handleMouseMove = (e) => {
    if (isDrawingRoom) {
    }

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;

    // Handle room drawing
    if (isDrawingRoom) {
      setRoomCurrentPoint({ x: canvasX, y: canvasY });
    }
  };

  // Check if a room overlaps with existing rooms
  const isRoomOverlapping = (newRoom) => {
    return ROOMS?.some((existingRoom) => {
      // Skip if it's the same room
      if (existingRoom.id === newRoom.id) return false;

      // Check for overlap
      const overlapX =
        newRoom.x < existingRoom.x + existingRoom.width &&
        newRoom.x + newRoom.width > existingRoom.x;
      const overlapY =
        newRoom.y < existingRoom.y + existingRoom.height &&
        newRoom.y + newRoom.height > existingRoom.y;

      return overlapX && overlapY;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawingRoom || !roomStartPoint || !roomCurrentPoint) {
      return;
    }

    const x = Math.min(roomStartPoint.x, roomCurrentPoint.x);
    const y = Math.min(roomStartPoint.y, roomCurrentPoint.y);
    const width = Math.abs(roomCurrentPoint.x - roomStartPoint.x);
    const height = Math.abs(roomCurrentPoint.y - roomStartPoint.y);
    console.log("ROOMIE", width, height);

    // Minimum size validation (10px minimum)
    if (width > 10 && height > 10) {
      // Check if we're already creating a room to prevent duplicates
      if (showRoomModal || newlyCreatedRoom) {
        setIsDrawingRoom(false);
        setRoomStartPoint(null);
        setRoomCurrentPoint(null);
        return;
      }

      const roomId = `room-${Date.now()}`;
      const newRoom = {
        id: roomId,
        x,
        y,
        width,
        height,
        area: width * height,
        name: "", // Will be set in modal
        roomType: "Residential",
        wallThickness: 0.2,
        falseCeiling: "",
        floorId: currentFloorId,
        createdAt: new Date().toISOString(),
      };

      // Check for overlap with existing rooms
      if (isRoomOverlapping(newRoom)) {
        alert(
          "Room overlaps with an existing room. Please draw in a different area."
        );
        setIsDrawingRoom(false);
        setRoomStartPoint(null);
        setRoomCurrentPoint(null);
        return;
      }

      // Add room to Redux state immediately for rendering

      // Set the newly created room and show modal
      setNewlyCreatedRoom(newRoom);
      setShowRoomModal(true);
    } else {
    }

    setIsDrawingRoom(false);
    setRoomStartPoint(null);
    setRoomCurrentPoint(null);
  };

  // Modal handlers
  const handleRoomModalClose = () => {
    // If it's a new room that hasn't been saved yet, remove it from Redux
    if (newlyCreatedRoom && !newlyCreatedRoom._id) {
      dispatch(removeRoom(newlyCreatedRoom.id));
    }

    setShowRoomModal(false);
    setNewlyCreatedRoom(null);
  };

  const handleRoomModalSave = async (updatedRoomData) => {
    if (updatedRoomData && projectId && currentFloorId) {
      try {
        // Update the room in Redux with the details from modal
        const updatedRoom = {
          ...updatedRoomData,
          name: updatedRoomData.name || "Unnamed Room",
          roomType: updatedRoomData.roomType || "Residential",
          wallThickness: updatedRoomData.wallThickness || 0.2,
          falseCeiling: updatedRoomData.falseCeiling || "",
          floorId: currentFloorId,
        };

        // Update room properties in Redux
        dispatch(
          updateRoomProperties({ id: updatedRoomData.id, updates: updatedRoom })
        );

        // Update in ROOMSslice as well
        dispatch(createRooms(updatedRoom));

        // Save room to backend using new API (only if we have valid IDs)
        if (currentFloorId && /^[0-9a-fA-F]{24}$/.test(currentFloorId)) {
          try {
            const backendRoomData = convertRoomToBackendFormat({
              ...updatedRoom,
              floorId: currentFloorId,
              projectId: projectId,
            });

            const result = await createRoom(backendRoomData).unwrap();

            // Convert backend response to frontend format and update Redux
            const frontendRoomData = convertRoomFromBackendFormat(result.data);
            dispatch(
              updateRoomProperties({
                id: updatedRoomData.id,
                updates: frontendRoomData,
              })
            );

            // Process walls for the newly created room after successful backend save
            const roomGeometry = {
              shape: "rectangle",
              x: updatedRoom.x,
              y: updatedRoom.y,
              width: updatedRoom.width,
              height: updatedRoom.height,
            };

            const wallsResult = await dispatch(
              processRoomWallsAsync({
                projectId,
                floorId: currentFloorId,
                roomId: result.data?.id || updatedRoomData.id,
                roomGeometry,
              })
            ).unwrap();
          } catch (error) {
            console.error("Backend save failed:", error);
            // Show user-friendly error message but don't block the UI
            console.warn(
              `Failed to save room to backend: ${error.message}. Room is saved locally only.`
            );
          }
        } else {
          console.warn("Invalid floorId, skipping backend save");
        }
      } catch (error) {
        console.error("Error processing walls for room:", error);
      }
    }

    setShowRoomModal(false);
    setNewlyCreatedRoom(null);
  };

  const handleRoomClick = (room) => {
    setNewlyCreatedRoom(room);
    setShowRoomModal(true);

    // Highlight walls for this room
    dispatch(setHighlightedWalls([room.id]));
  };

  // Room drag handlers
  const handleRoomDragStart = (e, room) => {
    // Store initial position for reference
    e.target.setAttrs({
      originalX: room.x,
      originalY: room.y,
    });
  };

  const handleRoomDragMove = (e, room) => {
    // Get the new position from the Konva object
    const newX = e.target.x();
    const newY = e.target.y();

    console.log("Room drag move:", {
      roomId: room.id,
      newX,
      newY,
      roomX: room.x,
      roomY: room.y,
    });

    // Update the room object locally for immediate UI update
    room.x = newX;
    room.y = newY;

    // Force a re-render by updating the room in Redux immediately
    dispatch(updateRoomPosition({ id: room.id, x: newX, y: newY }));
    dispatch(updateNewRoomPosition({ id: room.id, x: newX, y: newY }));

    // Force a re-render by incrementing the counter
    setDragUpdateCounter((prev) => prev + 1);
  };

  const handleRoomDragEnd = (e, room) => {
    // Get the new position from the Konva object
    const newX = e.target.x();
    const newY = e.target.y();

    console.log("Room drag end:", {
      roomId: room.id,
      from: { x: room.x, y: room.y },
      to: { x: newX, y: newY },
    });

    // Update room position in both Redux slices
    dispatch(updateRoomPosition({ id: room.id, x: newX, y: newY }));
    dispatch(updateNewRoomPosition({ id: room.id, x: newX, y: newY }));

    // Update the room object locally for immediate UI update
    room.x = newX;
    room.y = newY;

    // Reset the Konva object position to 0 since we're managing position through props
    e.target.x(0);
    e.target.y(0);
  };

  return (
    <div className="flex">
      <div className="w-[340px] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
        <AreaMarkupSidebar setCreated={setCreated} />

        {/* PNG Status Indicator */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">PNG Image Status</h4>
          {dxfData?.source === "pdf" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    pngError
                      ? "bg-red-500"
                      : pngImage
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-xs">
                  {pngError
                    ? "PNG Error"
                    : pngImage
                    ? "PNG Loaded"
                    : "PNG Loading..."}
                </span>
              </div>
              {pngImage && (
                <div className="text-xs text-gray-600">
                  <div>
                    Dimensions: {pngDimensions.width} × {pngDimensions.height}
                  </div>
                  <div>Source: PDF Conversion</div>
                </div>
              )}
              {pngError && (
                <div className="text-xs text-red-600">{pngError}</div>
              )}
              {dxfData?.png && !pngImage && !pngError && (
                <div className="text-xs text-orange-600">
                  PNG data available but not yet loaded
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              No PDF/PNG data available
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-full">
        {!hasFloor ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Floor Defined
              </h3>
              <p className="text-gray-600 mb-4">
                {pngImage ? (
                  <>
                    PNG background is visible, but please create a floor in the
                    Floor Editor page first to start marking up areas.
                  </>
                ) : (
                  "Please create a floor in the Floor Editor page first."
                )}
              </p>
              <button
                onClick={() => (window.location.href = "/floor-editor")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Floor Editor
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* PNG Background Notice */}
            {pngImage && (
              <div className="absolute top-4 left-4 z-10 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-blue-700 font-medium">
                    PNG Background Active
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  PDF content is visible as background for reference
                </p>
              </div>
            )}

            <CanvasWrapper
              // onMouseDown={handleMouseDown}
              // onMouseMove={handleMouseMove}
              // onMouseUp={handleMouseUp}
              onMouseDown={created ? undefined : handleMouseDown}
              onMouseMove={created ? undefined : handleMouseMove}
              onMouseUp={created ? undefined : handleMouseUp}
            >
              <Layer>
                {/* Render PNG image as background layer (same as Editor.jsx) */}
                {pngImage && dxfData?.source === "pdf" && (
                  <Group>
                    {/* PNG Image - positioned at center of canvas */}
                    <Image
                      image={pngImage}
                      x={(10000 - pngDimensions.width) / 2}
                      y={(6000 - pngDimensions.height) / 2}
                      width={pngDimensions.width}
                      height={pngDimensions.height}
                      opacity={0.7}
                      listening={false}
                    />

                    {/* PNG bounds indicator for debugging */}
                    <Rect
                      x={(10000 - pngDimensions.width) / 2 - 5}
                      y={(6000 - pngDimensions.height) / 2 - 5}
                      width={pngDimensions.width + 10}
                      height={pngDimensions.height + 10}
                      fill="rgba(255, 255, 255, 0.05)"
                      stroke="rgba(0, 0, 255, 0.3)"
                      strokeWidth={2}
                      cornerRadius={3}
                      listening={false}
                      draggable={created}
                    />
                  </Group>
                )}

                {/* Render DXF entities if available */}
                {hasEntities && (
                  <EntityRenderer
                    entities={entities}
                    blocks={blocks}
                    layers={layers}
                  />
                )}

                {/* Render current floor shapes */}
                {currentFloor &&
                  currentFloor.shapes &&
                  currentFloor.shapes.map((shape, index) => {
                    if (shape.shape === "rectangle") {
                      return (
                        <Rect
                          key={shape.id || index}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height}
                          fill="rgba(200,200,200,0.3)"
                          stroke="black"
                          strokeWidth={2}
                          listening={false}
                          draggable={created}
                        />
                      );
                    } else if (shape.shape === "polygon" && shape.points) {
                      return (
                        <Line
                          key={shape.id || index}
                          points={shape.points.flatMap((point) => [
                            point.x,
                            point.y,
                          ])}
                          stroke="black"
                          strokeWidth={2}
                          fill="rgba(200,200,200,0.3)"
                          closed={true}
                          listening={false}
                        />
                      );
                    }
                    return null;
                  })}

                {/* Render walls */}
                <WallRenderer
                  showWallLabels={false}
                  showWallThickness={true}
                  highlightSelectedRoom={newlyCreatedRoom?.id}
                  onWallClick={(wall) => {
                    setShowWallEditor(true);
                  }}
                />

                {/* Render rooms */}
                {ROOMS?.map((room, index) => {
                  const centerX = room.x + room.width / 2;
                  const centerY = room.y + room.height / 2;
                  const areaInMeters = calculateAreaInMeters(
                    room.width,
                    room.height,
                    pixelsPerMeter
                  );

                  // Debug logging for room positions during render
                  if (dragUpdateCounter > 0) {
                    console.log(`Rendering room ${room.id}:`, {
                      x: room.x,
                      y: room.y,
                      centerX,
                      centerY,
                    });
                  }

                  // Determine fill color based on false ceiling status
                  const hasFalseCeiling =
                    room.falseCeiling && room.falseCeiling.trim() !== "";
                  const fillColor = hasFalseCeiling
                    ? "rgba(255, 0, 255, 0.5)"
                    : "rgba(100, 200, 100, 0.5)"; // Magenta for false ceiling, green for normal

                  return (
                    <React.Fragment
                      key={`${room.id || room._id || `room-${index}`}-${
                        room.x
                      }-${room.y}-${dragUpdateCounter}`}
                    >
                      <Rect
                        {...room}
                        fill={fillColor}
                        stroke="black"
                        strokeWidth={1}
                        listening={true}
                        onClick={() => handleRoomClick(room)}
                        onTap={() => handleRoomClick(room)}
                        draggable={created}
                        onDragStart={(e) => handleRoomDragStart(e, room)}
                        onDragMove={(e) => handleRoomDragMove(e, room)}
                        onDragEnd={(e) => handleRoomDragEnd(e, room)}
                      />
                      <Text
                        x={centerX}
                        y={centerY}
                        text={`${
                          room.name || "Unnamed Room"
                        }\n${areaInMeters.toFixed(1)} m²`}
                        fontSize={21} // Reduced from 42 to half size as requested
                        fill="#333"
                        align="center"
                        verticalAlign="middle"
                        listening={false}
                        fontFamily="Arial, sans-serif"
                        fontStyle="normal"
                        fontWeight="700"
                      />
                    </React.Fragment>
                  );
                })}

                {/* Room drawing preview */}
                {isDrawingRoom && roomStartPoint && roomCurrentPoint && (
                  <Rect
                    x={Math.min(roomStartPoint.x, roomCurrentPoint.x)}
                    y={Math.min(roomStartPoint.y, roomCurrentPoint.y)}
                    width={Math.abs(roomCurrentPoint.x - roomStartPoint.x)}
                    height={Math.abs(roomCurrentPoint.y - roomStartPoint.y)}
                    fill="rgba(100, 200, 100, 0.3)"
                    stroke="green"
                    strokeWidth={2}
                    dash={[5, 5]}
                    draggable={created}
                  />
                )}
              </Layer>
            </CanvasWrapper>
          </div>
        )}

        {/* Room Creation Modal */}
        {showRoomModal && newlyCreatedRoom && (
          <RoomCreationModal
            room={newlyCreatedRoom}
            onClose={handleRoomModalClose}
            onSave={handleRoomModalSave}
            isNewRoom={!newlyCreatedRoom._id}
          />
        )}

        {/* Debug Panel
        <RoomDebugPanel /> */}

        {/* Wall Editor */}
        {showWallEditor && (
          <div className="fixed top-4 right-4 z-50">
            <WallEditor onClose={() => setShowWallEditor(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaMarkup;
