import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layer, Rect, Line, Group } from "react-konva";
import { useParams } from "react-router-dom";
import PencilIcon from "../../icons/PencilIcon";
import PositionActiveApertureIcon from "../../icons/PositionActiveApertureIcon";
import ReplaceSelectedIcon from "../../icons/ReplaceSelectedIcon";
import ReplaceSimilarIcon from "../../icons/ReplaceSimilarIcon";
import { ReloadIcon } from "../../icons/ReloadIcon";
import CanvasWrapper from "../Canvas/CanvasWrapper";
import DoorWindowModal from "./DoorWindowModal";
import { findNearestWall, getWallAngle, getPositionAlongWall, mmToPixels } from "../../utils/wallSnapping";
import { createDoor, getDoorsByRoom, updateDoor, deleteDoor } from "../../utils/doorApi";
import { createWindow, getWindowsByRoom, updateWindow, deleteWindow } from "../../utils/windowApi";

const DoorMarkup = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  
  // Local state for door/window functionality (isolated from global state)
  const [activeTool, setActiveTool] = useState("none"); // 'none', 'door', 'window'
  const [hoveredWall, setHoveredWall] = useState(null);
  const [previewElement, setPreviewElement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  
  // Local state for doors and windows (not in global Redux)
  const [doors, setDoors] = useState([]);
  const [windows, setWindows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get data from Redux (read-only)
  const rooms = useSelector((state) => state.rooms?.rooms || []);
  const walls = useSelector((state) => state.walls.walls);
  const floorRect = useSelector((state) => state.floor.floor_rect);
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);

  // Load doors and windows for current floor
  useEffect(() => {
    if (currentFloorId && projectId) {
      loadDoorsAndWindows();
    }
  }, [currentFloorId, projectId]);

  const loadDoorsAndWindows = async () => {
    setIsLoading(true);
    try {
      // Load doors and windows for all rooms in the current floor
      const allDoors = [];
      const allWindows = [];
      
      for (const room of rooms) {
        if (room.floorId === currentFloorId) {
          const roomDoors = await getDoorsByRoom(room.id || room._id, projectId, currentFloorId);
          const roomWindows = await getWindowsByRoom(room.id || room._id, projectId, currentFloorId);
          
          allDoors.push(...roomDoors);
          allWindows.push(...roomWindows);
        }
      }
      
      setDoors(allDoors);
      setWindows(allWindows);
    } catch (error) {
      console.error('Error loading doors and windows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Canvas mouse event handlers
  const handleMouseMove = useCallback((e) => {
    if (activeTool !== 'door' && activeTool !== 'window') {
      setHoveredWall(null);
      setPreviewElement(null);
      return;
    }

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const stageScale = stage.scaleX();
    const stagePos = stage.position();
    
    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;

    const nearestWall = findNearestWall({ x: canvasX, y: canvasY }, walls || [], 10);
    
    if (nearestWall.wall) {
      setHoveredWall(nearestWall.wall);
      
      // Create preview element
      const wallAngle = getWallAngle(nearestWall.wall);
      const positionAlongWall = getPositionAlongWall({ x: canvasX, y: canvasY }, nearestWall.wall);
      
      setPreviewElement({
        type: activeTool,
        position: nearestWall.snapPoint,
        wallAngle: wallAngle,
        positionAlongWall: positionAlongWall,
        wall: nearestWall.wall
      });
    } else {
      setHoveredWall(null);
      setPreviewElement(null);
    }
  }, [activeTool, walls]);

  const handleMouseClick = useCallback((e) => {
    if (activeTool !== 'door' && activeTool !== 'window') return;
    if (!hoveredWall || !previewElement) return;

    setModalData({
      type: activeTool,
      wall: hoveredWall,
      position: previewElement.position,
      wallAngle: previewElement.wallAngle,
      positionAlongWall: previewElement.positionAlongWall
    });
    setShowModal(true);
  }, [activeTool, hoveredWall, previewElement]);

  // Handle modal save
  const handleModalSave = async (formData) => {
    if (!modalData || !projectId || !currentFloorId) return;

    try {
      const elementData = {
        projectId,
        floorId: currentFloorId,
        roomId: modalData.wall.connectedRooms?.[0] || rooms[0]?.id, // Use first connected room or first room
        wallId: modalData.wall.id || modalData.wall._id,
        position: modalData.position,
        positionAlongWall: modalData.positionAlongWall,
        wallAngle: modalData.wallAngle,
        ...formData
      };

      let newElement;
      if (modalData.type === 'door') {
        newElement = await createDoor(elementData);
        setDoors(prev => [...prev, newElement]);
      } else if (modalData.type === 'window') {
        newElement = await createWindow(elementData);
        setWindows(prev => [...prev, newElement]);
      }

      // Reset tool state
      setActiveTool('none');
      setModalData(null);
      setShowModal(false);
      setHoveredWall(null);
      setPreviewElement(null);
    } catch (error) {
      console.error('Error creating element:', error);
    }
  };

  // Handle element selection
  const handleElementClick = (element, type) => {
    setSelectedElement({ ...element, type });
  };

  // Handle element deletion
  const handleDeleteElement = async () => {
    if (!selectedElement) return;

    try {
      if (selectedElement.type === 'door') {
        await deleteDoor(selectedElement.id || selectedElement._id);
        setDoors(prev => prev.filter(d => (d.id || d._id) !== (selectedElement.id || selectedElement._id)));
      } else if (selectedElement.type === 'window') {
        await deleteWindow(selectedElement.id || selectedElement._id);
        setWindows(prev => prev.filter(w => (w.id || w._id) !== (selectedElement.id || selectedElement._id)));
      }
      setSelectedElement(null);
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElement) {
        handleDeleteElement();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const tools = [
    {
      id: "none",
      label: "Select",
      Icon: PositionActiveApertureIcon,
    },
    {
      id: "door",
      label: "Insert Door",
      Icon: PencilIcon,
    },
    {
      id: "window",
      label: "Insert Window",
      Icon: PencilIcon,
    },
  ];

  // Render door element
  const renderDoor = (door) => {
    const isSelected = selectedElement && selectedElement.id === (door.id || door._id) && selectedElement.type === 'door';
    const width = mmToPixels(door.width || 900);
    const height = mmToPixels(door.height || 2100);
    
    return (
      <Group
        key={`door-${door.id || door._id}`}
        x={door.position.x}
        y={door.position.y}
        rotation={door.wallAngle || 0}
        onClick={() => handleElementClick(door, 'door')}
      >
        <Rect
          width={width}
          height={height}
          x={-width / 2}
          y={-height / 2}
          fill={isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.8)"}
          stroke={isSelected ? "#3b82f6" : "#666"}
          strokeWidth={isSelected ? 3 : 2}
          listening={true}
        />
        <Line
          points={[0, -height / 2, width / 2, -height / 2]}
          stroke="#333"
          strokeWidth={2}
          listening={false}
        />
        {door.width && (
          <Line
            points={[0, -height / 2 - 10, 0, -height / 2 - 20]}
            stroke="#333"
            strokeWidth={1}
            listening={false}
          />
        )}
      </Group>
    );
  };

  // Render window element
  const renderWindow = (window) => {
    const isSelected = selectedElement && selectedElement.id === (window.id || window._id) && selectedElement.type === 'window';
    const width = mmToPixels(window.width || 1200);
    const height = mmToPixels(window.height || 1200);
    
    return (
      <Group
        key={`window-${window.id || window._id}`}
        x={window.position.x}
        y={window.position.y}
        rotation={window.wallAngle || 0}
        onClick={() => handleElementClick(window, 'window')}
      >
        <Rect
          width={width}
          height={height}
          x={-width / 2}
          y={-height / 2}
          fill={isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(173, 216, 230, 0.8)"}
          stroke={isSelected ? "#3b82f6" : "#666"}
          strokeWidth={isSelected ? 3 : 2}
          listening={true}
        />
        {/* Window mullions */}
        <Line
          points={[0, -height / 2, 0, height / 2]}
          stroke="#333"
          strokeWidth={1}
          listening={false}
        />
        <Line
          points={[-width / 2, 0, width / 2, 0]}
          stroke="#333"
          strokeWidth={1}
          listening={false}
        />
      </Group>
    );
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-[400px] h-[90vh] border-r border-gray-300 bg-white p-4 text-sm font-medium overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-gray-800 font-semibold">
              Door and Window Markup
            </h2>
            <p className="text-[12px] text-gray-400 mt-[2px]">
              Updated: Just now
            </p>
          </div>
          <button 
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={loadDoorsAndWindows}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        <hr className="mb-4" />

        {/* Tools */}
        <div className="space-y-2 mb-6">
          {tools.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={`w-full flex items-center gap-2 rounded-lg px-2 py-1 transition ${
                activeTool === id 
                  ? "bg-blue-500 text-white" 
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              <div
                className={`w-[32px] h-[32px] flex items-center justify-center rounded-md ${
                  activeTool === id ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    activeTool === id ? "stroke-white" : "stroke-gray-700"
                  }`}
                />
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        {activeTool === 'door' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Click on a wall to insert a door. Hover over walls to see preview.
            </p>
          </div>
        )}

        {activeTool === 'window' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Click on a wall to insert a window. Hover over walls to see preview.
            </p>
          </div>
        )}

        {/* Selected Element Properties */}
        {selectedElement && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">
              Selected {selectedElement.type === 'door' ? 'Door' : 'Window'}
            </h3>
            <div className="space-y-1 text-sm">
              <p>Width: {selectedElement.width}mm</p>
              <p>Height: {selectedElement.height}mm</p>
              {selectedElement.type === 'window' && (
                <p>Sill Height: {selectedElement.sillHeight}mm</p>
              )}
              <p>Type: {selectedElement.doorType || selectedElement.windowType}</p>
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setSelectedElement(null)}
                className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Deselect
              </button>
              <button
                onClick={handleDeleteElement}
                className="w-full px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Statistics</h3>
          <div className="space-y-1 text-sm">
            <p>Doors: {doors.length}</p>
            <p>Windows: {windows.length}</p>
            <p>Total: {doors.length + windows.length}</p>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-[90vh] relative">
        <CanvasWrapper
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
        >
          <Layer>
            {/* Render floor */}
            {floorRect && (
              <Rect
                {...floorRect}
                fill="rgba(200,200,200,0.3)"
                stroke="black"
                strokeWidth={2}
                listening={false}
              />
            )}

            {/* Render floor shapes */}
            {currentFloor && currentFloor.shapes && Array.isArray(currentFloor.shapes) && currentFloor.shapes.map((shape, index) => {
              if (shape.shape === 'rectangle') {
                return (
                  <Rect
                    key={shape.id || index}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="rgba(0, 150, 255, 0.1)"
                    stroke="#1e40af"
                    strokeWidth={3}
                    listening={false}
                  />
                );
              } else if (shape.shape === 'polygon' && shape.points) {
                return (
                  <Line
                    key={shape.id || index}
                    points={shape.points.flatMap(point => [point.x, point.y])}
                    stroke="#1e40af"
                    strokeWidth={3}
                    fill="rgba(0, 150, 255, 0.1)"
                    closed={true}
                    listening={false}
                  />
                );
              }
              return null;
            })}

            {/* Render rooms */}
            {rooms && Array.isArray(rooms) && rooms.map((room) => (
              <Rect
                key={room.id || room._id}
                {...room}
                fill="rgba(100, 200, 100, 0.5)"
                stroke="black"
                strokeWidth={1}
                listening={false}
              />
            ))}

            {/* Render walls */}
            {walls && Array.isArray(walls) && walls.map((wall) => (
              <Line
                key={wall.id || wall._id}
                points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
                stroke={hoveredWall && (hoveredWall.id === wall.id || hoveredWall._id === wall._id) ? "#FFD700" : "#666"}
                strokeWidth={hoveredWall && (hoveredWall.id === wall.id || hoveredWall._id === wall._id) ? 4 : 2}
                listening={false}
              />
            ))}

            {/* Render doors */}
            {doors.map(renderDoor)}

            {/* Render windows */}
            {windows.map(renderWindow)}

            {/* Render preview element */}
            {previewElement && (
              <Group
                x={previewElement.position.x}
                y={previewElement.position.y}
                rotation={previewElement.wallAngle}
              >
                <Rect
                  width={mmToPixels(previewElement.type === 'door' ? 900 : 1200)}
                  height={mmToPixels(previewElement.type === 'door' ? 2100 : 1200)}
                  x={-mmToPixels(previewElement.type === 'door' ? 900 : 1200) / 2}
                  y={-mmToPixels(previewElement.type === 'door' ? 2100 : 1200) / 2}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dash={[5, 5]}
                  listening={false}
                />
              </Group>
            )}
          </Layer>
        </CanvasWrapper>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        )}
      </div>

      {/* Door/Window Modal */}
      {showModal && modalData && (
        <DoorWindowModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setModalData(null);
            setActiveTool('none');
          }}
          onSave={handleModalSave}
          type={modalData.type}
          wallData={modalData.wall}
          position={modalData.position}
        />
      )}
    </div>
  );
};

export default DoorMarkup;
