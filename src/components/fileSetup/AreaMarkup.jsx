import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layer, Rect, Line, Text } from "react-konva";
import AreaMarkupSidebar from "./AreaMarkupSideBar";
import EntityRenderer from "../../drawing/EntityRender";
import CanvasWrapper from "../Canvas/CanvasWrapper";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import {
  resetRooms,
  setRooms,
  updateRoomProperties,
  removeRoom,
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
import { createRooms } from "../../redux/features/app/newRoomSlice";

const AreaMarkup = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);

  // Room drawing state
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [roomStartPoint, setRoomStartPoint] = useState(null);
  const [roomCurrentPoint, setRoomCurrentPoint] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newlyCreatedRoom, setNewlyCreatedRoom] = useState(null);
  const [showWallEditor, setShowWallEditor] = useState(false);

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
        } catch (error) {}
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

  return (
    <div className="flex">
      <div className="w-[340px] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
        <AreaMarkupSidebar />
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
                Please create a floor in the Floor Editor page first.
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
            <CanvasWrapper
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
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
                    room.height
                  );

                  // Determine fill color based on false ceiling status
                  const hasFalseCeiling =
                    room.falseCeiling && room.falseCeiling.trim() !== "";
                  const fillColor = hasFalseCeiling
                    ? "rgba(255, 0, 255, 0.5)"
                    : "rgba(100, 200, 100, 0.5)"; // Magenta for false ceiling, green for normal

                  return (
                    <React.Fragment
                      key={room.id || room._id || `room-${index}`}
                    >
                      <Rect
                        {...room}
                        fill={fillColor}
                        stroke="black"
                        strokeWidth={1}
                        listening={true}
                        onClick={() => handleRoomClick(room)}
                        onTap={() => handleRoomClick(room)}
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
                  />
                )}
              </Layer>
            </CanvasWrapper>

            {/* Room Drawing Instructions */}
            <div className="absolute top-15 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Click and drag to draw rooms</span>
              </div>

              {/* Color Legend */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Color Legend:</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Normal Rooms</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-pink-500 rounded"></div>
                  <span>False Ceiling</span>
                </div>
              </div>
            </div>
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
