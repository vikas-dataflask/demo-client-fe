import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stage, Layer, Rect, Line } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";

import {
  addRoom,
  updateRoomPosition,
  updateRoomArea,
  updateRoomDimensions,
} from "../../redux/features/app/roomSlice";
import { setGrid } from "../../redux/features/app/editorSlice";
import {
  generateWallsForRoom,
  detectSharedWalls,
  resetWalls
} from "../../redux/features/app/wallSlice";
import WallRenderer from "./WallRenderer";

const GRID_SIZE = 30; // Match the scale system from RoomEditorWithZoom.jsx

const WallEditor = ({ onWallSelect }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedWallId, setSelectedWallId] = useState(null);
  const [showWallLabels, setShowWallLabels] = useState(true);
  const [showWallThickness, setShowWallThickness] = useState(true);

  const dispatch = useDispatch();
  const stageRef = useRef(null);

  // Redux selectors - must be declared before useEffect hooks
  const floorRect = useSelector((state) => state.floor.floor_rect); // Floor from Editor.jsx
  const rooms = useSelector((state) => state.rooms);
  const walls = useSelector((state) => state.walls);
  const selectedScale = useSelector((state) => state.project.scale);
  const grid = useSelector((state) => state.editor.grid); // Grid toggle from Redux
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedRoomId(null);
        setSelectedWallId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate walls for existing rooms on component mount
  useEffect(() => {
    if (rooms.length > 0 && walls.length === 0) {
      console.log('Rooms in state:', rooms);
      
      // Remove any existing walls first to prevent duplicates
      dispatch(resetWalls());
      
      // Generate walls for all existing rooms (only once)
      const uniqueRooms = rooms.filter((room, index, self) => 
        index === self.findIndex(r => r.id === room.id)
      );
      
      console.log('Unique rooms after filtering:', uniqueRooms);
      
      uniqueRooms.forEach(room => {
        dispatch(generateWallsForRoom({ roomId: room.id, room }));
      });
      
      // Detect shared walls after a short delay
      setTimeout(() => {
        dispatch(detectSharedWalls({ tolerance: 1 }));
      }, 100);
    }
  }, [rooms.length, dispatch]); // Only depend on rooms.length, not rooms array

  // Detect shared walls whenever rooms change
  useEffect(() => {
    if (walls.length > 0) {
      dispatch(detectSharedWalls({ tolerance: 1 }));
    }
  }, [walls.length, dispatch]); // Only depend on walls.length

  const { projectId } = useParams();
  const { data } = useGetProjectListByIdQuery(projectId);

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  useEffect(() => {
    rooms.forEach((room) => {
      const scaledArea = convertArea(room.width * room.height);
      dispatch(updateRoomArea({ id: room.id, area: scaledArea }));
    });
  }, [selectedScale, dispatch, rooms]);

  const convertArea = (pixelArea) => {
    // Convert pixel area to logical units using GRID_SIZE (same as Editor.jsx)
    const areaInLogicalUnits = pixelArea / (GRID_SIZE * GRID_SIZE);
    
    // Convert to square meters (assuming 1 logical unit = 1 meter)
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

  const convertToLogicalUnits = (pixels) => {
    return pixels / GRID_SIZE;
  };

  const convertToPixels = (logicalUnits) => {
    return logicalUnits * GRID_SIZE;
  };

  // Handle room selection
  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
    setSelectedWallId(null); // Deselect wall when room is selected
  };

  // Handle wall selection
  const handleWallClick = (wallId) => {
    setSelectedWallId(wallId);
    setSelectedRoomId(null); // Deselect room when wall is selected
    
    // Notify parent component
    if (onWallSelect) {
      onWallSelect(wallId);
    }
  };

  // Handle wall hover
  const handleWallHover = (wallId, isHovered) => {
    // Optional: Add hover effects or tooltips
  };

  const drawGrid = (width, height) => {
    const lines = [];
    const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil((width - position.x) / scale / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil((height - position.y) / scale / GRID_SIZE) * GRID_SIZE;

    for (let i = startX; i <= endX; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, startY, i, endY]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }

    for (let j = startY; j <= endY; j += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${j}`}
          points={[startX, j, endX, j]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const minScale = 0.5;
    const maxScale = 3;

    const oldScale = scale;
    const pointer = {
      x: e.evt.offsetX,
      y: e.evt.offsetY,
    };

    const stage = stageRef.current;
    if (!stage) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    let newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  const handleMouseDown = (e) => {
    // Check if clicking on a room or wall
    const clickedOnRoom = e.target.hasName('room');
    const clickedOnWall = e.target.hasName('wall');
    
    if (!clickedOnRoom && !clickedOnWall) {
      // Deselect room and wall if clicking on empty space
      setSelectedRoomId(null);
      setSelectedWallId(null);
    }
  };



  if (!floorRect && (!currentFloor || !currentFloor.shapes || currentFloor.shapes.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        Please create a floor plan first in the Drawing File section
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div className="absolute top-2 left-2 bg-white p-2 rounded shadow z-10 text-sm space-y-1">
        <p>Zoom: {(scale * 100).toFixed(0)}%</p>
        <p>Floor: {floorRect ? `${convertToLogicalUnits(floorRect.width).toFixed(2)}m x ${convertToLogicalUnits(floorRect.height).toFixed(2)}m` : 'Not set'}</p>
        <p>Rooms: {rooms.length}</p>
        <p>Walls: {walls.length}</p>
        <p>Total Area: {rooms.reduce((sum, room) => sum + room.area, 0).toFixed(2)} {selectedScale || 'm²'}</p>
        {selectedRoomId && (
          <p className="text-blue-600 font-semibold">
            Selected: {rooms.find(r => r.id === selectedRoomId)?.name || 'Room'} 
            ({convertToLogicalUnits(rooms.find(r => r.id === selectedRoomId)?.width || 0).toFixed(2)}m x {convertToLogicalUnits(rooms.find(r => r.id === selectedRoomId)?.height || 0).toFixed(2)}m)
          </p>
        )}
        {selectedWallId && (
          <p className="text-green-600 font-semibold">
            Selected: Wall {selectedWallId.slice(-4)} 
            ({walls.find(w => w.id === selectedWallId)?.type || 'Unknown'})
          </p>
        )}
                 <div className="flex gap-1">
           <button 
             onClick={() => dispatch(setGrid(!grid))}
             className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
           >
             Grid: {grid ? 'ON' : 'OFF'}
           </button>
           <button 
             onClick={() => setShowWallLabels(!showWallLabels)}
             className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
           >
             Labels: {showWallLabels ? 'ON' : 'OFF'}
           </button>
           <button 
             onClick={() => setShowWallThickness(!showWallThickness)}
             className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
           >
             Thickness: {showWallThickness ? 'ON' : 'OFF'}
           </button>
           <button 
             onClick={() => {
               dispatch(resetWalls());
               rooms.forEach(room => {
                 dispatch(generateWallsForRoom({ roomId: room.id, room }));
               });
               setTimeout(() => dispatch(detectSharedWalls({ tolerance: 1 })), 100);
             }}
             className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
           >
             Regenerate Walls
           </button>
         </div>
      </div>
      
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow z-10 text-xs text-gray-600">
        <p>Click room to select for material assignment</p>
        <p>Click wall to view/edit properties</p>
        <p>Rooms are fixed - use mouse wheel to zoom</p>
        <p>Scale: 1 grid unit = 1 meter</p>
      </div>

      <Stage
        width={window.innerWidth - 440}
        height={window.innerHeight - 80}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        {grid && (
          <Layer>
            {drawGrid(window.innerWidth - 440, window.innerHeight - 80)}
          </Layer>
        )}
        
        <Layer>
          {/* Render floor from Editor.jsx */}
          {floorRect && (
            <Rect
              {...floorRect}
              fill="rgba(200,200,200,0.3)"
              stroke="black"
              strokeWidth={2}
              listening={false}
            />
          )}

          {/* Render floor shapes from Editor.jsx */}
          {currentFloor && currentFloor.shapes && currentFloor.shapes.map((shape, index) => {
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

          {/* Render rooms from RoomEditor */}
          {rooms.map((room) => (
            <Rect
              key={room.id}
              id={`room-${room.id}`}
              name="room"
              {...room}
              draggable={false}
              fill={selectedRoomId === room.id ? "rgba(100, 200, 100, 0.7)" : "rgba(100, 200, 100, 0.5)"}
              stroke={selectedRoomId === room.id ? "blue" : "black"}
              strokeWidth={selectedRoomId === room.id ? 2 : 1}
              onClick={() => handleRoomClick(room.id)}
            />
          ))}

          {/* Render walls */}
          <WallRenderer
            walls={walls}
            scale={scale}
            selectedWallId={selectedWallId}
            onWallClick={handleWallClick}
            onWallHover={handleWallHover}
            showWallLabels={showWallLabels}
            showWallThickness={showWallThickness}
          />

        </Layer>
      </Stage>
    </div>
  );
};

export default WallEditor; 