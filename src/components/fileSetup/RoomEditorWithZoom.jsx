// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
// import { v4 as uuidv4 } from "uuid";
// import { useParams } from "react-router-dom";
// import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
// import CentralModal from "./CentralModal";

// import {
//   addRoom,
//   updateRoomPosition,
//   updateRoomArea,
//   updateRoomDimensions,
// } from "../../redux/features/app/roomSlice";
// import { setGrid } from "../../redux/features/app/editorSlice";

// const GRID_SIZE = 30; // Match the scale system from Editor.jsx

// const RoomEditorWithZoom = () => {
//   const [newRoom, setNewRoom] = useState(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRoomId, setSelectedRoomId] = useState(null);
//   const [scale, setScale] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [baseScale, setBaseScale] = useState(1); // Store the initial fit-to-screen scale

//   // Add keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         setNewRoom(null);
//         setIsDrawing(false);
//       }
//       if (e.key === 'Delete' && selectedRoomId) {
//         // Add delete room functionality if needed
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [selectedRoomId]);

//   const floorRect = useSelector((state) => state.floor.floor_rect); // Floor from Editor.jsx
//   const rooms = useSelector((state) => state.rooms.rooms);
//   const selectedScale = useSelector((state) => state.project.scale);
//   const grid = useSelector((state) => state.editor.grid); // Grid toggle from Redux

//   const dispatch = useDispatch();
//   const stageRef = useRef(null);
//   const transformerRef = useRef(null);
//   const draggingRoomId = useRef(null);
//   const initialRoomPosition = useRef(null);

//   const { projectId } = useParams();
//   const { data } = useGetProjectListByIdQuery(projectId);

//   const entities = data?.dxf_entities || [];
//   const blocks = data?.dxf_blocks || {};
//   const layers = data?.dxf_layers || {};

//   useEffect(() => {
//     rooms.forEach((room) => {
//       const scaledArea = convertArea(room.width * room.height);
//       dispatch(updateRoomArea({ id: room.id, area: scaledArea }));
//     });
//   }, [selectedScale, dispatch, rooms]);

//   // Auto-fit the canvas in the viewport on initial render
//   useEffect(() => {
//     const fitCanvasToViewport = () => {
//       const browserWidth = window.innerWidth - 440; // Account for sidebar and padding
//       const browserHeight = window.innerHeight - 80; // Account for header and padding

//       // Calculate scale to fit the floor rectangle in the viewport
//       if (floorRect) {
//         const scaleX = browserWidth / floorRect.width;
//         const scaleY = browserHeight / floorRect.height;
//         const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

//         setBaseScale(newScale); // Store the base scale for zoom percentage calculation
//         setScale(newScale);
//         setPosition({ x: 0, y: 0 });
//       }
//     };

//     // Small delay to ensure DOM is ready
//     const timer = setTimeout(fitCanvasToViewport, 100);
//     return () => clearTimeout(timer);
//   }, [floorRect]);

//   const convertArea = (pixelArea) => {
//     // Convert pixel area to logical units using GRID_SIZE (same as Editor.jsx)
//     const areaInLogicalUnits = pixelArea / (GRID_SIZE * GRID_SIZE);

//     // Convert to square meters (assuming 1 logical unit = 1 meter)
//     const areaInSquareMeters = areaInLogicalUnits;

//     switch (selectedScale) {
//       case "Inches":
//         return areaInSquareMeters * 1550.0031;
//       case "Feet":
//         return areaInSquareMeters * 10.7639;
//       case "Square Yards":
//         return areaInSquareMeters * 1.19599;
//       default:
//         return areaInSquareMeters; // Meters
//     }
//   };

//   const convertToLogicalUnits = (pixels) => {
//     return pixels / GRID_SIZE;
//   };

//   const convertToPixels = (logicalUnits) => {
//     return logicalUnits * GRID_SIZE;
//   };

//   // Handle room selection for transformer
//   const handleRoomClick = (roomId) => {
//     setSelectedRoomId(roomId);
//   };

//   // Update transformer when selected room changes
//   useEffect(() => {
//     if (selectedRoomId && transformerRef.current) {
//       const stage = stageRef.current;
//       const selectedNode = stage.findOne(`#room-${selectedRoomId}`);
//       if (selectedNode) {
//         transformerRef.current.nodes([selectedNode]);
//         transformerRef.current.getLayer().batchDraw();
//       }
//     }
//   }, [selectedRoomId]);

//   const drawGrid = (width, height) => {
//     const lines = [];
//     const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
//     const endX = Math.ceil((width - position.x) / scale / GRID_SIZE) * GRID_SIZE;
//     const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
//     const endY = Math.ceil((height - position.y) / scale / GRID_SIZE) * GRID_SIZE;

//     for (let i = startX; i <= endX; i += GRID_SIZE) {
//       lines.push(
//         <Line
//           key={`v-${i}`}
//           points={[i, startY, i, endY]}
//           stroke="#ccc"
//           strokeWidth={1}
//         />
//       );
//     }

//     for (let j = startY; j <= endY; j += GRID_SIZE) {
//       lines.push(
//         <Line
//           key={`h-${j}`}
//           points={[startX, j, endX, j]}
//           stroke="#ccc"
//           strokeWidth={1}
//         />
//       );
//     }

//     return lines;
//   };

//   const handleWheel = (e) => {
//     e.evt.preventDefault();
//     const scaleBy = 1.05;
//     const minScale = 0.5;
//     const maxScale = 3;

//     const oldScale = scale;
//     const pointer = {
//       x: e.evt.offsetX,
//       y: e.evt.offsetY,
//     };

//     const stage = stageRef.current;
//     if (!stage) return;

//     const mousePointTo = {
//       x: (pointer.x - position.x) / oldScale,
//       y: (pointer.y - position.y) / oldScale,
//     };

//     const direction = e.evt.deltaY > 0 ? 1 : -1;
//     let newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
//     newScale = Math.max(minScale, Math.min(maxScale, newScale));

//     const newPos = {
//       x: pointer.x - mousePointTo.x * newScale,
//       y: pointer.y - mousePointTo.y * newScale,
//     };

//     setScale(newScale);
//     setPosition(newPos);
//   };

//   const isInsideFloor = (x, y) => {
//     if (!floorRect) return false;
//     return (
//       x >= floorRect.x &&
//       x <= floorRect.x + floorRect.width &&
//       y >= floorRect.y &&
//       y <= floorRect.y + floorRect.height
//     );
//   };

//   const isOverlapping = (rectA, rectB) => {
//     return (
//       rectA.x < rectB.x + rectB.width &&
//       rectA.x + rectA.width > rectB.x &&
//       rectA.y < rectB.y + rectB.height &&
//       rectA.y + rectA.height > rectB.y
//     );
//   };

//   const handleMouseDown = (e) => {
//     if (!floorRect || isDrawing) return;

//     // Check if clicking on a room
//     const clickedOnRoom = e.target.hasName('room');
//     if (!clickedOnRoom) {
//       // Deselect room if clicking on empty space
//       setSelectedRoomId(null);
//     }

//     const stage = stageRef.current;
//     const point = stage.getPointerPosition();

//     // Convert screen coordinates to world coordinates
//     const worldX = (point.x - position.x) / scale;
//     const worldY = (point.y - position.y) / scale;

//     if (!isInsideFloor(worldX, worldY)) return;
//     setNewRoom({ x: worldX, y: worldY, width: 0, height: 0 });
//     setIsDrawing(true);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing || !newRoom) return;
//     const stage = stageRef.current;
//     const point = stage.getPointerPosition();

//     // Convert screen coordinates to world coordinates
//     const worldX = (point.x - position.x) / scale;
//     const worldY = (point.y - position.y) / scale;

//     // Constrain to floor boundaries
//     const x = Math.min(
//       Math.max(worldX, floorRect.x),
//       floorRect.x + floorRect.width
//     );
//     const y = Math.min(
//       Math.max(worldY, floorRect.y),
//       floorRect.y + floorRect.height
//     );
//     const width = x - newRoom.x;
//     const height = y - newRoom.y;
//     setNewRoom({ ...newRoom, width, height });
//   };

//   const handleMouseUp = () => {
//     if (!newRoom) return;

//     const width = Math.abs(newRoom.width);
//     const height = Math.abs(newRoom.height);

//     if (width === 0 || height === 0) {
//       setNewRoom(null);
//       setIsDrawing(false);
//       return;
//     }

//     const finalRoom = {
//       id: uuidv4(),
//       x: newRoom.width < 0 ? newRoom.x + newRoom.width : newRoom.x,
//       y: newRoom.height < 0 ? newRoom.y + newRoom.height : newRoom.y,
//       width,
//       height,
//       area: width * height, // Store raw pixel area, conversion happens in display
//     };

//     const overlaps = rooms.some((room) => isOverlapping(finalRoom, room));
//     if (overlaps) {
//       setNewRoom(null);
//       setIsDrawing(false);
//       return;
//     }

//     dispatch(addRoom(finalRoom));
//     setNewRoom(null);
//     setIsDrawing(false);
//     setSelectedRoomId(finalRoom.id);
//     setIsModalOpen(true);
//   };

//   const handleDragStart = (id, e) => {
//     draggingRoomId.current = id;
//     const shape = e.target;
//     initialRoomPosition.current = { x: shape.x(), y: shape.y() };
//   };

//   const handleDragEnd = (id, e) => {
//     const shape = e.target;
//     const newX = shape.x();
//     const newY = shape.y();

//     const draggedRoom = rooms.find((r) => r.id === id);
//     if (!draggedRoom) return;

//     const updatedRoom = {
//       ...draggedRoom,
//       x: newX,
//       y: newY,
//     };

//     const withinFloor =
//       updatedRoom.x >= floorRect.x &&
//       updatedRoom.y >= floorRect.y &&
//       updatedRoom.x + updatedRoom.width <= floorRect.x + floorRect.width &&
//       updatedRoom.y + updatedRoom.height <= floorRect.y + floorRect.height;

//     if (!withinFloor) {
//       shape.position(initialRoomPosition.current);
//       return;
//     }

//     const overlapping = rooms.some(
//       (room) => room.id !== id && isOverlapping(updatedRoom, room)
//     );

//     if (overlapping) {
//       shape.position(initialRoomPosition.current);
//       return;
//     }

//     dispatch(updateRoomPosition({ id, x: newX, y: newY }));
//   };

//   // Handle room transformation (resizing)
//   const handleRoomTransform = (id) => {
//     const room = rooms.find((r) => r.id === id);
//     if (!room) return;

//     const stage = stageRef.current;
//     const selectedNode = stage.findOne(`#room-${id}`);
//     if (!selectedNode) return;

//     const scaleX = selectedNode.scaleX();
//     const scaleY = selectedNode.scaleY();

//     // Reset scale to 1 to apply changes
//     selectedNode.scaleX(1);
//     selectedNode.scaleY(1);

//     const newWidth = selectedNode.width() * scaleX;
//     const newHeight = selectedNode.height() * scaleY;

//     // Constrain to minimum size
//     const minSize = 20;
//     const finalWidth = Math.max(minSize, newWidth);
//     const finalHeight = Math.max(minSize, newHeight);

//     const updatedRoom = {
//       ...room,
//       width: finalWidth,
//       height: finalHeight,
//     };

//     // Check if the resized room is within floor boundaries
//     const withinFloor =
//       updatedRoom.x >= floorRect.x &&
//       updatedRoom.y >= floorRect.y &&
//       updatedRoom.x + updatedRoom.width <= floorRect.x + floorRect.width &&
//       updatedRoom.y + updatedRoom.height <= floorRect.y + floorRect.height;

//     if (!withinFloor) {
//       // Reset to original size if outside floor
//       selectedNode.width(room.width);
//       selectedNode.height(room.height);
//       selectedNode.getLayer().batchDraw();
//       return;
//     }

//     // Check for overlaps with other rooms
//     const overlapping = rooms.some(
//       (r) => r.id !== id && isOverlapping(updatedRoom, r)
//     );

//     if (overlapping) {
//       // Reset to original size if overlapping
//       selectedNode.width(room.width);
//       selectedNode.height(room.height);
//       selectedNode.getLayer().batchDraw();
//       return;
//     }

//     // Update room dimensions in Redux
//     dispatch(updateRoomDimensions({ id, width: finalWidth, height: finalHeight }));

//     // Update area calculation
//     const newArea = convertArea(finalWidth * finalHeight);
//     dispatch(updateRoomArea({ id, area: newArea }));
//   };

//   if (!floorRect) return <div className="flex items-center justify-center h-full">Please create a floor plan first in the Drawing File section</div>;

//   return (
//     <>
//       <div className="h-full relative">
//         <div className="absolute top-2 left-2 bg-white p-2 rounded shadow z-10 text-sm space-y-1">
//           <p>Zoom: {((scale / baseScale) * 100).toFixed(0)}%</p>
//           <p>Floor: {floorRect ? `${convertToLogicalUnits(floorRect.width).toFixed(2)}m x ${convertToLogicalUnits(floorRect.height).toFixed(2)}m` : 'Not set'}</p>
//           <p>Rooms: {rooms.length}</p>
//           <p>Total Area: {rooms.reduce((sum, room) => sum + room.area, 0).toFixed(2)} {selectedScale || 'm²'}</p>
//           {selectedRoomId && (
//             <p className="text-blue-600 font-semibold">
//               Selected: {rooms.find(r => r.id === selectedRoomId)?.name || 'Room'}
//               ({convertToLogicalUnits(rooms.find(r => r.id === selectedRoomId)?.width || 0).toFixed(2)}m x {convertToLogicalUnits(rooms.find(r => r.id === selectedRoomId)?.height || 0).toFixed(2)}m)
//             </p>
//           )}
//           <button
//             onClick={() => dispatch(setGrid(!grid))}
//             className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
//           >
//             Grid: {grid ? 'ON' : 'OFF'}
//           </button>
//           {isDrawing && (
//             <>
//               <p className="text-blue-600 font-semibold">Drawing room...</p>
//               {newRoom && (
//                 <p className="text-xs text-gray-600">
//                   {convertToLogicalUnits(Math.abs(newRoom.width)).toFixed(2)}m x {convertToLogicalUnits(Math.abs(newRoom.height)).toFixed(2)}m
//                 </p>
//               )}
//             </>
//           )}
//         </div>

//         <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow z-10 text-xs text-gray-600">
//           <p>Click and drag to create rooms</p>
//           <p>Click room to select and resize</p>
//           <p>Use mouse wheel to zoom</p>
//           <p>Press ESC to cancel drawing</p>
//           <p>Scale: 1 grid unit = 1 meter</p>
//         </div>

//         <Stage
//           width={window.innerWidth - 440}
//           height={window.innerHeight - 80}
//           onWheel={handleWheel}
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           ref={stageRef}
//           scaleX={scale}
//           scaleY={scale}
//           x={position.x}
//           y={position.y}
//         >
//           {grid && (
//             <Layer>
//               {drawGrid(window.innerWidth - 440, window.innerHeight - 80)}
//             </Layer>
//           )}
//           <Layer>
//             <Rect
//               {...floorRect}
//               fill="rgba(200,200,200,0.3)"
//               stroke="black"
//               strokeWidth={2}
//               listening={false}
//             />

//             {rooms.map((room) => (
//               <Rect
//                 key={room.id}
//                 id={`room-${room.id}`}
//                 name="room"
//                 {...room}
//                 draggable
//                 fill={selectedRoomId === room.id ? "rgba(100, 200, 100, 0.7)" : "rgba(100, 200, 100, 0.5)"}
//                 stroke={selectedRoomId === room.id ? "blue" : "black"}
//                 strokeWidth={selectedRoomId === room.id ? 2 : 1}
//                 onClick={() => handleRoomClick(room.id)}
//                 onDragStart={(e) => handleDragStart(room.id, e)}
//                 onDragEnd={(e) => handleDragEnd(room.id, e)}
//                 onTransformEnd={() => handleRoomTransform(room.id)}
//               />
//             ))}

//             {/* Transformer for resizing selected room */}
//             {selectedRoomId && (
//               <Transformer
//                 ref={transformerRef}
//                 boundBoxFunc={(oldBox, newBox) => {
//                   // Constrain minimum size
//                   if (newBox.width < 20 || newBox.height < 20) {
//                     return oldBox;
//                   }
//                   return newBox;
//                 }}
//                 rotateEnabled={false}
//               />
//             )}

//             {newRoom && (
//               <Rect
//                 {...newRoom}
//                 fill="rgba(100, 200, 100, 0.2)"
//                 stroke="black"
//                 dash={[4, 4]}
//               />
//             )}
//           </Layer>
//         </Stage>
//       </div>

//       {isModalOpen && selectedRoomId && (
//         <CentralModal
//           room={rooms.find((r) => r.id === selectedRoomId)}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// export default RoomEditorWithZoom;
