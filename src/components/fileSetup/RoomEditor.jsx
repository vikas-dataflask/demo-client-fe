// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Stage, Layer, Rect, Line, Text, Circle } from "react-konva";
// import { v4 as uuidv4 } from "uuid";
// import EntityRenderer from "../../drawing/EntityRender";
// import { useParams } from "react-router-dom";
// import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
// import CentralModal from "./CentralModal";
// import {
//   convertPixelsToMeters,
//   convertMetersToPixels,
//   convertUnits,
//   displayUnitToGridUnit,
//   UNIT_CONVERSION_CONSTANTS,
// } from "../../utils/unitConversion";

// import {
//   addRoom,
//   updateRoomPosition,
//   updateRoomArea,
// } from "../../redux/features/app/roomSlice";

// const GRID_SIZE = 100;

// const RoomEditor = () => {
//   const [newRoom, setNewRoom] = useState(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRoomId, setSelectedRoomId] = useState(null);
  
//   // Coordinate tracking state
//   const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
//   const [showCoordinates, setShowCoordinates] = useState(true);

//   const floors = useSelector((state) => state.floor.floors);
//   const currentFloorId = useSelector((state) => state.floor.currentFloorId);
//   const currentFloor = floors.find((f) => f.id === currentFloorId);

//   // Add scaling state like Editor.jsx
//   const [scale, setScaleState] = useState(1); // Start with 100% zoom
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [baseScale, setBaseScale] = useState(1); // Store the initial fit-to-screen scale

//   const floorPlan = useSelector((state) => state.floorPlan.rect); //⬅️ Redux-based rect
//   const rooms = useSelector((state) => state.rooms.rooms);
//   const selectedScale = useSelector((state) => state.project.scale);

//   // Add missing selectors to match Editor.jsx
//   const displayUnit = useSelector((state) => state.floor.scale) || "m";
//   const grid = useSelector((state) => state.editor.grid); // Grid toggle

//   const dispatch = useDispatch();

//   const draggingRoomId = useRef(null);
//   const initialRoomPosition = useRef(null);
//   const stageRef = useRef(null); // Add stage ref for zoom functionality

//   const { projectId } = useParams();
//   const { data } = useGetProjectListByIdQuery(projectId);

//   const entities = data?.dxf_entities || [];
//   const blocks = data?.dxf_blocks || {};
//   const layers = data?.dxf_layers || {};

//   // Debug logging for floorPlan data
//   useEffect(() => {
//     console.log("🎯 RoomEditor: FloorPlan data:", {
//       floorPlan,
//       floorPlanType: typeof floorPlan,
//       floorPlanKeys: floorPlan ? Object.keys(floorPlan) : null,
//       floorPlanValues: floorPlan
//         ? {
//             x: floorPlan.x,
//             y: floorPlan.y,
//             width: floorPlan.width,
//             height: floorPlan.height,
//             xType: typeof floorPlan.x,
//             yType: typeof floorPlan.y,
//             widthType: typeof floorPlan.width,
//             heightType: typeof floorPlan.height,
//           }
//         : null,
//       hasNaN: floorPlan
//         ? {
//             x: isNaN(floorPlan.x),
//             y: isNaN(floorPlan.y),
//             width: isNaN(floorPlan.width),
//             height: isNaN(floorPlan.height),
//           }
//         : null,
//     });
//   }, [floorPlan]);

//   // Add comprehensive debugging for scaling and floor data
//   useEffect(() => {
//     console.log("🔍 RoomEditor: SCALING DEBUG:", {
//       scale,
//       baseScale,
//       position,
//       currentFloor: currentFloor
//         ? {
//             id: currentFloor.id,
//             name: currentFloor.name,
//             shapesCount: currentFloor.shapes?.length || 0,
//             shapes:
//               currentFloor.shapes?.map((shape) => {
//                 // Calculate final dimensions using correct logic
//                 const finalWidth = shape.width || 0; // Already in pixels
//                 const finalHeight = shape.height || 0; // Already in pixels

//                 return {
//                   id: shape.id,
//                   shape: shape.shape,
//                   x: shape.x,
//                   y: shape.y,
//                   width: shape.width,
//                   height: shape.height,
//                   widthInMeters: shape.widthInMeters,
//                   heightInMeters: shape.heightInMeters,
//                   finalWidth,
//                   finalHeight,
//                   dataType: "pixels (direct)",
//                   expectedMeters: {
//                     width:
//                       finalWidth / UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                     height:
//                       finalHeight / UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                   },
//                 };
//               }) || [],
//           }
//         : null,
//       stageRef: !!stageRef.current,
//       stageScale: stageRef.current
//         ? {
//             scaleX: stageRef.current.scaleX(),
//             scaleY: stageRef.current.scaleY(),
//             position: stageRef.current.position(),
//           }
//         : null,
//       PIXELS_PER_METER: UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//       // Add scale comparison with Editor.jsx
//       scaleComparison: {
//         currentScale: scale,
//         baseScale,
//         zoomPercentage: ((scale / baseScale) * 100).toFixed(1) + "%",
//         browserDimensions: {
//           width: window.innerWidth,
//           height: window.innerHeight,
//         },
//         calculatedInitialScale: Math.min(
//           (window.innerWidth - 80) / 10000,
//           (window.innerHeight - 160) / 6000,
//           1
//         ),
//         expectedInitialScale: Math.min(
//           (window.innerWidth - 80) / 10000,
//           (window.innerHeight - 160) / 6000,
//           1
//         ),
//       },
//     });
//   }, [scale, baseScale, position, currentFloor]);

//   // Test floor data structure
//   useEffect(() => {
//     if (currentFloor?.shapes?.length) {
//       console.log("🧪 RoomEditor: FLOOR DATA STRUCTURE TEST:", {
//         floorId: currentFloor.id,
//         shapes: currentFloor.shapes.map((shape) => ({
//           id: shape.id,
//           shape: shape.shape,
//           x: shape.x,
//           y: shape.y,
//           width: shape.width,
//           height: shape.height,
//           widthInMeters: shape.widthInMeters,
//           heightInMeters: shape.heightInMeters,
//           // Test both approaches
//           approach1_pixels: {
//             width: shape.width,
//             height: shape.height,
//             meters: {
//               width: shape.width || 0, // UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//               height: shape.height || 0, // UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//             },
//           },
//           approach2_meters: {
//             width: shape.widthInMeters ? shape.widthInMeters : shape.width,
//             height: shape.heightInMeters ? shape.heightInMeters : shape.height,
//             meters: {
//               width: shape.widthInMeters || 0,
//               height: shape.heightInMeters || 0,
//             },
//           },
//         })),
//       });
//     }
//   }, [currentFloor]);

//   // Compare with Editor.jsx approach
//   useEffect(() => {
//     if (currentFloor?.shapes?.length) {
//       console.log("🔍 RoomEditor: COMPARISON WITH EDITOR.JSX APPROACH:", {
//         floorId: currentFloor.id,
//         shapes: currentFloor.shapes.map((shape) => {
//           // Editor.jsx approach
//           const editorWidth = shape.widthInMeters
//             ? shape.widthInMeters
//             : shape.width;
//           const editorHeight = shape.heightInMeters
//             ? shape.heightInMeters
//             : shape.height;

//           // RoomEditor approach (current)
//           const roomEditorWidth = shape.width || 0;
//           const roomEditorHeight = shape.height || 0;

//           return {
//             id: shape.id,
//             shape: shape.shape,
//             // Raw data
//             raw: {
//               width: shape.width,
//               height: shape.height,
//               widthInMeters: shape.widthInMeters,
//               heightInMeters: shape.heightInMeters,
//             },
//             // Editor.jsx calculation
//             editor: {
//               width: editorWidth,
//               height: editorHeight,
//               meters: {
//                 width: shape.widthInMeters || shape.width, // UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                 height: shape.heightInMeters || shape.height, // UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//               },
//             },
//             // RoomEditor calculation (current)
//             roomEditor: {
//               width: roomEditorWidth,
//               height: roomEditorHeight,
//               meters: {
//                 width:
//                   roomEditorWidth / UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                 height:
//                   roomEditorHeight / UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//               },
//             },
//             // Comparison
//             match: {
//               width: Math.abs(editorWidth - roomEditorWidth) < 1,
//               height: Math.abs(editorHeight - roomEditorHeight) < 1,
//               bothMatch:
//                 Math.abs(editorWidth - roomEditorWidth) < 1 &&
//                 Math.abs(editorHeight - roomEditorHeight) < 1,
//             },
//           };
//         }),
//       });
//     }
//   }, [currentFloor]);

//   // Ensure proper scaling when floor data changes
//   useEffect(() => {
//     if (currentFloor?.shapes?.length && stageRef.current) {
//       console.log("🎯 RoomEditor: Floor data changed, ensuring proper scaling");

//       // Re-apply current scale to ensure consistency
//       const currentStageScale = stageRef.current.scaleX();
//       const currentStagePosition = stageRef.current.position();

//       console.log("🎯 RoomEditor: Current stage state:", {
//         scale: currentStageScale,
//         position: currentStagePosition,
//         expectedScale: scale,
//         expectedPosition: position,
//       });

//       // If there's a mismatch, re-apply the expected values
//       if (
//         Math.abs(currentStageScale - scale) > 0.001 ||
//         Math.abs(currentStagePosition.x - position.x) > 0.001 ||
//         Math.abs(currentStagePosition.y - position.y) > 0.001
//       ) {
//         console.log(
//           "🎯 RoomEditor: Detected scale/position mismatch, re-applying"
//         );
//         stageRef.current.scale({ x: scale, y: scale });
//         stageRef.current.position(position);
//       }
//     }
//   }, [currentFloor, scale, position]);

//   // Test stage ref functionality
//   useEffect(() => {
//     if (stageRef.current) {
//       console.log("🎯 RoomEditor: Stage ref is available:", {
//         stageRef: !!stageRef.current,
//         currentScale: stageRef.current.scaleX(),
//         currentPosition: stageRef.current.position(),
//         expectedScale: scale,
//         expectedPosition: position,
//       });
//     } else {
//       console.log("🎯 RoomEditor: Stage ref is NOT available yet");
//     }
//   }, [stageRef.current, scale, position]);

//   // Canvas size logging on mount
//   useEffect(() => {
//     if (stageRef.current) {
//       const stage = stageRef.current;
//       console.log("🎯 RoomEditor: Canvas initialization:", {
//         width: stage.width(),
//         height: stage.height(),
//         scale: stage.scale(),
//         position: stage.position(),
//         PIXELS_PER_METER: UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//         expectedDimensions: {
//           width: 10000,
//           height: 6000
//         }
//       });
//     }
//   }, [stageRef.current]);

//   // Coordinate tracking function (like Editor.jsx)
//   const getMouseCoordinates = (x, y) => {
//     // Convert screen coordinates to world coordinates considering zoom and pan
//     const worldX = (x - position.x) / scale;
//     const worldY = (y - position.y) / scale;
    
//     // Convert to real-world units
//     const realX = convertPixelsToMeters(worldX);
//     const realY = convertPixelsToMeters(worldY);
    
//     // Convert to display units
//     const displayX = convertUnits(realX, 'm', displayUnit);
//     const displayY = convertUnits(realY, 'm', displayUnit);
    
//     // Format for display
//     const formatValue = (value) => {
//       if (displayUnit === 'mm') {
//         return value.toFixed(0);
//       } else if (displayUnit === 'cm') {
//         return value.toFixed(1);
//       } else {
//         return value.toFixed(2);
//       }
//     };
    
//     return {
//       formatted: {
//         x: formatValue(displayX),
//         y: formatValue(displayY)
//       },
//       real: { x: realX, y: realY },
//       pixel: { x: worldX, y: worldY }
//     };
//   };

//   // Validate and sanitize floorPlan data
//   const getValidFloorPlan = () => {
//     if (!floorPlan) {
//       console.log("🎯 RoomEditor: No floorPlan data available");
//       // Return a default floor plan for testing/fallback
//       return {
//         x: 1000,
//         y: 1000,
//         width: 2000,
//         height: 1500,
//       };
//     }

//     const { x, y, width, height } = floorPlan;

//     // Check for NaN values
//     if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
//       console.error("🎯 RoomEditor: FloorPlan contains NaN values:", {
//         x,
//         y,
//         width,
//         height,
//       });
//       // Return a default floor plan if NaN values are found
//       return {
//         x: 1000,
//         y: 1000,
//         width: 2000,
//         height: 1500,
//       };
//     }

//     // Check for undefined or null values
//     if (
//       x === undefined ||
//       y === undefined ||
//       width === undefined ||
//       height === undefined ||
//       x === null ||
//       y === null ||
//       width === null ||
//       height === null
//     ) {
//       console.error(
//         "🎯 RoomEditor: FloorPlan contains undefined/null values:",
//         { x, y, width, height }
//       );
//       // Return a default floor plan if undefined/null values are found
//       return {
//         x: 1000,
//         y: 1000,
//         width: 2000,
//         height: 1500,
//       };
//     }

//     // Ensure all values are numbers and have reasonable defaults
//     const validFloorPlan = {
//       x: Number(x) || 1000,
//       y: Number(y) || 1000,
//       width: Number(width) || 2000,
//       height: Number(height) || 1500,
//     };

//     console.log("🎯 RoomEditor: Valid floorPlan:", validFloorPlan);
//     return validFloorPlan;
//   };

//   const drawGrid = (width, height) => {
//     const lines = [];
//     const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
//     const endX =
//       Math.ceil((10000 - position.x) / scale / GRID_SIZE) * GRID_SIZE;
//     const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
//     const endY = Math.ceil((6000 - position.y) / scale / GRID_SIZE) * GRID_SIZE;

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

//   const validFloorPlan = getValidFloorPlan();

//   useEffect(() => {
//     const fitCanvasToViewport = () => {
//       const browserWidth = window.innerWidth - 80; // Match Editor.jsx offset
//       const browserHeight = window.innerHeight - 160; // Match Editor.jsx offset

//       // Calculate scale to fit the entire canvas (10000px x 6000px) in the viewport
//       const scaleX = browserWidth / 10000;
//       const scaleY = browserHeight / 6000;
//       const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

//       console.log("🎯 RoomEditor: INITIAL SCALING SETUP:", {
//         browserDimensions: {
//           width: browserWidth,
//           height: browserHeight,
//           windowWidth: window.innerWidth,
//           windowHeight: window.innerHeight,
//         },
//         canvasDimensions: {
//           width: 10000,
//           height: 6000,
//         },
//         calculatedScales: {
//           scaleX,
//           scaleY,
//           newScale,
//         },
//         stageRef: !!stageRef.current,
//       });

//       setBaseScale(newScale); // Store the base scale for zoom percentage calculation
//       setScaleState(newScale);
//       setPosition({ x: 0, y: 0 });

//       // Apply zoom and position to stage
//       if (stageRef.current) {
//         stageRef.current.scale({ x: newScale, y: newScale });
//         stageRef.current.position({ x: 0, y: 0 });

//         console.log("🎯 RoomEditor: STAGE SCALING APPLIED:", {
//           stageScale: stageRef.current.scaleX(),
//           stagePosition: stageRef.current.position(),
//         });
//       }
//     };

//     // Small delay to ensure DOM is ready
//     const timer = setTimeout(fitCanvasToViewport, 100);
//     return () => clearTimeout(timer);
//   }, []);

//   // Add mouse wheel zoom functionality (like Editor.jsx)
//   const handleWheel = (e) => {
//     e.evt.preventDefault();
//     const scaleBy = 1.05;
//     const minScale = 0.01;
//     const maxScale = 3;

//     const oldScale = scale;
//     const pointer = {
//       x: e.evt.offsetX,
//       y: e.evt.offsetY,
//     };

//     const mousePointTo = {
//       x: (pointer.x - position.x) / oldScale,
//       y: (pointer.y - position.y) / oldScale,
//     };

//     let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
//     newScale = Math.max(minScale, Math.min(maxScale, newScale));

//     const newPos = {
//       x: pointer.x - mousePointTo.x * newScale,
//       y: pointer.y - mousePointTo.y * newScale,
//     };

//     setScaleState(newScale);
//     setPosition(newPos);

//     // Apply zoom to stage
//     if (stageRef.current) {
//       stageRef.current.scale({ x: newScale, y: newScale });
//       stageRef.current.position(newPos);
//     }
//   };

//   useEffect(() => {
//     rooms.forEach((room) => {
//       const scaledArea = convertArea(room.width * room.height);
//       dispatch(updateRoomArea({ id: room.id, area: scaledArea }));
//     });
//   }, [selectedScale, dispatch]);

//   const convertArea = (pixelArea) => {
//     // Convert pixels to meters first (like Editor.jsx)
//     const areaInMeters = convertPixelsToMeters(Math.sqrt(pixelArea)) ** 2;

//     // Convert to display units (like Editor.jsx)
//     switch (selectedScale) {
//       case "Inches":
//         return areaInMeters * 1550.0031;
//       case "Feet":
//         return areaInMeters * 10.7639;
//       case "Square Yards":
//         return areaInMeters * 1.19599;
//       default:
//         return areaInMeters; // Meters
//     }
//   };

//   const isInsideFloor = (x, y) => {
//     if (!currentFloor?.shapes?.length) return false;

//     // Check if point is inside any floor shape
//     return currentFloor.shapes.some((shape) => {
//       if (shape.shape === "rectangle") {
//         // Use the correct data structure - width/height are already in pixels
//         const shapeX = typeof shape.x === "number" ? shape.x : 0;
//         const shapeY = typeof shape.y === "number" ? shape.y : 0;
//         const width = shape.width || 0; // Already in pixels
//         const height = shape.height || 0; // Already in pixels

//         return (
//           x >= shapeX &&
//           x <= shapeX + width &&
//           y >= shapeY &&
//           y <= shapeY + height
//         );
//       }
//       return false;
//     });
//   };

//   const isOverlapping = (rectA, rectB) => {
//     return (
//       rectA.x < rectB.x + rectB.width &&
//       rectA.x + rectA.width > rectB.x &&
//       rectA.y < rectB.y + rectB.height &&
//       rectA.y + rectA.height > rectB.y
//     );
//   };

//   // Update mouse handlers to use proper coordinate conversion (like Editor.jsx)
//   const handleMouseDown = (e) => {
//     if (!currentFloor?.shapes?.length || isDrawing) return;

//     const stage = e.target.getStage();
//     const pointer = stage.getPointerPosition();

//     // Get canvas position and scale directly from stage (like Editor.jsx)
//     const stageScale = stage.scaleX();
//     const stagePos = stage.position();

//     // Convert pointer to canvas coordinate (like Editor.jsx)
//     const canvasX = (pointer.x - stagePos.x) / stageScale;
//     const canvasY = (pointer.y - stagePos.y) / stageScale;

//     if (!isInsideFloor(canvasX, canvasY)) return;
//     setNewRoom({ x: canvasX, y: canvasY, width: 0, height: 0 });
//     setIsDrawing(true);
//   };

//   const handleMouseMove = (e) => {
//     const stage = e.target.getStage();
//     const pointer = stage.getPointerPosition();

//     // Get canvas position and scale directly from stage (like Editor.jsx)
//     const stageScale = stage.scaleX();
//     const stagePos = stage.position();

//     // Convert pointer to canvas coordinate (like Editor.jsx)
//     const canvasX = (pointer.x - stagePos.x) / stageScale;
//     const canvasY = (pointer.y - stagePos.y) / stageScale;

//     // Update coordinate tracking
//     if (showCoordinates) {
//       const coords = getMouseCoordinates(pointer.x, pointer.y);
//       setMouseCoordinates(coords);
//     }

//     // Handle room drawing
//     if (!isDrawing || !newRoom) return;

//     // Constrain to floor boundaries
//     const x = Math.max(canvasX, 0);
//     const y = Math.max(canvasY, 0);
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

//     // const finalRoom = {
//     //   id: uuidv4(),
//     //   x: newRoom.width < 0 ? newRoom.x + newRoom.width : newRoom.x,
//     //   y: newRoom.height < 0 ? newRoom.y + newRoom.height : newRoom.y,
//     //   width,
//     //   height,
//     //   area: convertArea(width * height), // scaled area
//     //   floorId: currentFloorId, // Add floorId to link room to current floor
//     //   name: "", // Initialize with empty name
//     //   roomType: "", // Initialize with empty room type
//     //   wallThickness: 0.2, // Default wall thickness
//     //   falseCeiling: "", // Initialize with empty false ceiling
//     // };

//     const overlaps = rooms.some((room) => isOverlapping(finalRoom, room));
//     if (overlaps) {
//       setNewRoom(null);
//       setIsDrawing(false);
//       return;
//     }

//     console.log("🎯 RoomEditor: Creating room with data:", finalRoom);
//     // dispatch(addRoom(finalRoom));
//     // setNewRoom(null);
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

//     // Check if room is within any floor shape
//     const withinFloor =
//       isInsideFloor(newX, newY) &&
//       isInsideFloor(newX + updatedRoom.width, newY) &&
//       isInsideFloor(newX, newY + updatedRoom.height) &&
//       isInsideFloor(newX + updatedRoom.width, newY + updatedRoom.height);

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

//   if (!currentFloor?.shapes?.length) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-center text-gray-600">
//           <p>No floor plan available</p>
//           <p className="text-sm">
//             Please create a floor plan in the Editor first
//           </p>
//           <div className="mt-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show a notice if we're using the fallback floor plan
//   const isUsingFallback = false; // No longer using fallback since we match Editor.jsx approach

//   return (
//     <>
//       {/* Zoom Controls - matching Editor.jsx */}
//       <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-2">
//         <div className="zoom-controls flex items-center gap-2">
//           {/* Zoom Level Display */}
//           <div className="text-sm font-bold text-gray-800 min-w-[50px] text-center">
//             {((scale / baseScale) * 100).toFixed(0)}%
//           </div>

//           {/* Zoom Out Button */}
//           <button
//             onClick={() => {
//               const newScale = Math.max(0.01, scale / 1.2);
//               setScaleState(newScale);

//               // Apply zoom to stage
//               if (stageRef.current) {
//                 stageRef.current.scale({ x: newScale, y: newScale });
//               }
//             }}
//             disabled={scale <= 0.01}
//             className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border border-gray-300 transition-colors"
//             title="Zoom Out (Mouse wheel down)"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M20 12H4"
//               />
//             </svg>
//           </button>

//           {/* Zoom In Button */}
//           <button
//             onClick={() => {
//               const newScale = Math.min(3, scale * 1.2);
//               setScaleState(newScale);

//               // Apply zoom to stage
//               if (stageRef.current) {
//                 stageRef.current.scale({ x: newScale, y: newScale });
//               }
//             }}
//             disabled={scale >= 3}
//             className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border border-gray-300 transition-colors"
//             title="Zoom In (Mouse wheel up)"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 4v16m8-8H4"
//               />
//             </svg>
//           </button>

//           {/* Fit All Button */}
//           <button
//             onClick={() => {
//               // Zoom to fit the content (match Editor.jsx logic)
//               const stage = stageRef.current;
//               if (stage && currentFloor?.shapes?.length > 0) {
//                 const stageWidth = 10000;
//                 const stageHeight = 6000;

//                 // Find the bounds of all floor shapes
//                 let minX = Infinity,
//                   minY = Infinity,
//                   maxX = -Infinity,
//                   maxY = -Infinity;

//                 currentFloor.shapes.forEach((shape) => {
//                   if (shape.shape === "rectangle") {
//                     // Use the correct data structure - width/height are already in pixels
//                     const shapeX = typeof shape.x === "number" ? shape.x : 0;
//                     const shapeY = typeof shape.y === "number" ? shape.y : 0;
//                     const width = shape.width || 0; // Already in pixels
//                     const height = shape.height || 0; // Already in pixels

//                     minX = Math.min(minX, shapeX);
//                     minY = Math.min(minY, shapeY);
//                     maxX = Math.max(maxX, shapeX + width);
//                     maxY = Math.max(maxY, shapeY + height);
//                   }
//                 });

//                 const floorWidth = maxX - minX;
//                 const floorHeight = maxY - minY;

//                 const scaleX = (stageWidth * 0.8) / floorWidth;
//                 const scaleY = (stageHeight * 0.8) / floorHeight;
//                 const newScale = Math.min(scaleX, scaleY, 3);

//                 setScaleState(newScale);

//                 // Center the floor
//                 const centerX = (stageWidth - floorWidth * newScale) / 2;
//                 const centerY = (stageHeight - floorHeight * newScale) / 2;
//                 const newPos = { x: centerX, y: centerY };
//                 setPosition(newPos);

//                 // Apply zoom and position to stage
//                 if (stageRef.current) {
//                   stageRef.current.scale({ x: newScale, y: newScale });
//                   stageRef.current.position(newPos);
//                 }
//               }
//             }}
//             className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors text-xs"
//             title="Fit all shapes in view"
//           >
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//               />
//             </svg>
//             <span>Fit All</span>
//           </button>

//           {/* Fit Viewport Button */}
//           <button
//             onClick={() => {
//               // Zoom to fit the entire canvas in the browser window (match Editor.jsx)
//               const browserWidth = window.innerWidth - 40; // Match Editor.jsx offset
//               const browserHeight = window.innerHeight - 140; // Match Editor.jsx offset

//               const scaleX = browserWidth / 10000;
//               const scaleY = browserHeight / 6000;
//               const newScale = Math.min(scaleX, scaleY, 1);

//               setBaseScale(newScale); // Update base scale when fitting to viewport
//               setScaleState(newScale);
//               setPosition({ x: 0, y: 0 });

//               // Apply zoom and position to stage
//               if (stageRef.current) {
//                 stageRef.current.scale({ x: newScale, y: newScale });
//                 stageRef.current.position({ x: 0, y: 0 });
//               }
//             }}
//             className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors text-xs"
//             title="Fit entire canvas in browser window"
//           >
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
//               />
//             </svg>
//             <span>Fit Window</span>
//           </button>

//           {/* Reset Button */}
//           <button
//             onClick={() => {
//               setBaseScale(1); // Reset base scale to 1 (100% zoom)
//               setScaleState(1);
//               setPosition({ x: 0, y: 0 });

//               // Apply zoom and position to stage
//               if (stageRef.current) {
//                 stageRef.current.scale({ x: 1, y: 1 });
//                 stageRef.current.position({ x: 0, y: 0 });
//               }
//             }}
//             className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 transition-colors text-xs"
//             title="Reset zoom to 100%"
//           >
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//               />
//             </svg>
//             <span>Reset</span>
//           </button>

//           {/* Debug Test Button */}
//           <button
//             onClick={() => {
//               console.log("🧪 RoomEditor: DEBUG TEST - Current State:", {
//                 scale,
//                 baseScale,
//                 position,
//                 currentFloor: currentFloor
//                   ? {
//                       id: currentFloor.id,
//                       shapesCount: currentFloor.shapes?.length || 0,
//                       shapes:
//                         currentFloor.shapes?.map((shape) => ({
//                           id: shape.id,
//                           shape: shape.shape,
//                           x: shape.x,
//                           y: shape.y,
//                           width: shape.width,
//                           height: shape.height,
//                           widthInMeters: shape.widthInMeters,
//                           heightInMeters: shape.heightInMeters,
//                           finalWidth: shape.width || 0, // Already in pixels
//                           finalHeight: shape.height || 0, // Already in pixels
//                           expectedMeters: {
//                             width: shape.width || 0, // UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                             height: shape.height || 0, // UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                           },
//                         })) || [],
//                     }
//                   : null,
//                 stageRef: !!stageRef.current,
//                 stageScale: stageRef.current
//                   ? {
//                       scaleX: stageRef.current.scaleX(),
//                       scaleY: stageRef.current.scaleY(),
//                       position: stageRef.current.position(),
//                     }
//                   : null,
//                 PIXELS_PER_METER: UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//               });

//               // Test: Set a known scale and position
//               const testScale = 0.5;
//               const testPosition = { x: 1000, y: 1000 };

//               console.log(
//                 "🧪 RoomEditor: Setting test scale:",
//                 testScale,
//                 "position:",
//                 testPosition
//               );

//               setScaleState(testScale);
//               setPosition(testPosition);

//               if (stageRef.current) {
//                 stageRef.current.scale({ x: testScale, y: testScale });
//                 stageRef.current.position(testPosition);
//               }
//             }}
//             className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 transition-colors text-xs"
//             title="Debug test - set scale to 50%"
//           >
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//               />
//             </svg>
//             <span>Debug</span>
//           </button>

//           {/* Force Editor.jsx Scale Button */}
//           <button
//             onClick={() => {
//               // Force the exact same scale calculation as Editor.jsx
//               const browserWidth = window.innerWidth - 80;
//               const browserHeight = window.innerHeight - 160;
//               const scaleX = browserWidth / 10000;
//               const scaleY = browserHeight / 6000;
//               const newScale = Math.min(scaleX, scaleY, 1);

//               console.log("🧪 RoomEditor: FORCING EDITOR.JSX SCALE:", {
//                 browserWidth,
//                 browserHeight,
//                 scaleX,
//                 scaleY,
//                 newScale,
//                 currentScale: scale,
//                 difference: Math.abs(newScale - scale),
//               });

//               setBaseScale(newScale);
//               setScaleState(newScale);
//               setPosition({ x: 0, y: 0 });

//               if (stageRef.current) {
//                 stageRef.current.scale({ x: newScale, y: newScale });
//                 stageRef.current.position({ x: 0, y: 0 });
//               }
//             }}
//             className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors text-xs"
//             title="Force Editor.jsx scale calculation"
//           >
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 10V3L4 14h7v7l9-11h-7z"
//               />
//             </svg>
//             <span>Force Scale</span>
//           </button>

//           {/* Coordinate Display Toggle */}
//           <button
//             onClick={() => setShowCoordinates(!showCoordinates)}
//             className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors text-xs ${
//               showCoordinates 
//                 ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200' 
//                 : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
//             }`}
//             title="Toggle coordinate display"
//           >
//             <svg
//               className="w-3 h-3"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
//               />
//             </svg>
//             <span>{showCoordinates ? 'Hide Coords' : 'Show Coords'}</span>
//           </button>
//         </div>
//       </div>

//       {/* Fallback Floor Plan Notice */}
//       {/* Removed since we now match Editor.jsx approach */}

//       {/* Debug Info Panel */}
//       <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3 text-xs">
//         <div className="font-bold mb-2">Debug Info</div>
//         <div>Scale: {((scale / baseScale) * 100).toFixed(1)}%</div>
//         <div>Base Scale: {baseScale.toFixed(3)}</div>
//         <div>
//           Position: ({position.x.toFixed(0)}, {position.y.toFixed(0)})
//         </div>
//         {currentFloor?.shapes?.length > 0 && (
//           <div className="mt-2">
//             <div>Floor Shapes: {currentFloor.shapes.length}</div>
//             {currentFloor.shapes.map((shape, index) => (
//               <div key={shape.id} className="ml-2 text-xs">
//                 Shape {index + 1}: {shape.width}px x {shape.height}px (
//                 {(shape.width || 0) //UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER
//                   .toFixed(1)}
//                 m x{" "}
//                 {(shape.height || 0) //UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER
//                   .toFixed(1)}
//                 m)
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="mt-2 text-gray-500">
//           Pixels/Meter: {UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER}
//         </div>
//       </div>

//       {/* Coordinate Display - Bottom Right */}
//       {showCoordinates && (
//         <div
//           style={{
//             position: 'fixed',
//             bottom: '20px',
//             right: '20px',
//             backgroundColor: 'rgba(0, 0, 0, 0.9)',
//             color: 'white',
//             padding: '8px 12px',
//             borderRadius: '6px',
//             fontSize: '12px',
//             fontFamily: 'monospace',
//             lineHeight: '1.4',
//             minWidth: '120px',
//             backdropFilter: 'blur(4px)',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             zIndex: 1000,
//             pointerEvents: 'none'
//           }}
//         >
//           <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#60a5fa' }}>
//             Coordinates ({displayUnit})
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//             <span>X:</span>
//             <span>{mouseCoordinates.formatted?.x || '0.00'}</span>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//             <span>Y:</span>
//             <span>{mouseCoordinates.formatted?.y || '0.00'}</span>
//           </div>
//           {import.meta.env.DEV && (
//             <>
//               <div style={{ 
//                 height: '1px', 
//                 backgroundColor: 'rgba(255, 255, 255, 0.2)', 
//                 margin: '4px 0' 
//               }}></div>
//               <div style={{ fontSize: '10px', color: '#9ca3af' }}>
//                 <div>Pixel: {mouseCoordinates.pixel?.x?.toFixed(0) || '0'}, {mouseCoordinates.pixel?.y?.toFixed(0) || '0'}</div>
//                 <div>Real: {mouseCoordinates.real?.x?.toFixed(3) || '0.000'}, {mouseCoordinates.real?.y?.toFixed(3) || '0.000'}</div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       <Stage
//         width={10000}
//         height={6000}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onWheel={handleWheel}
//         ref={stageRef}
//         scaleX={scale}
//         scaleY={scale}
//         x={position.x}
//         y={position.y}
//         style={{
//           border: '1px solid #ccc',
//           backgroundColor: '#f8f9fa'
//         }}
//       >
//         {/* DXF Entities Layer */}
//         <Layer>
//           <EntityRenderer entities={entities} blocks={blocks} layers={layers} />
//         </Layer>

//         {/* Grid Layer - match Editor.jsx */}
//         {grid && <Layer>{drawGrid(10000, 6000)}</Layer>}

//         {/* Floor Plan + Rooms Layer */}
//         <Layer>
//           {/* Visual Test Rectangle - 100m x 60m (10000px x 6000px) */}
//           <Rect
//             x={0}
//             y={0}
//             width={10000}
//             height={6000}
//             fill="rgba(255, 0, 0, 0.05)"
//             stroke="red"
//             strokeWidth={5}
//             listening={false}
//           />

//           {/* Visual Test Rectangle - 10m x 10m (1000px x 1000px) */}
//           <Rect
//             x={1000}
//             y={1000}
//             width={1000}
//             height={1000}
//             fill="rgba(0, 255, 0, 0.1)"
//             stroke="green"
//             strokeWidth={3}
//             listening={false}
//           />

//           {/* Coordinate Overlay Layer */}
//           {showCoordinates && mouseCoordinates.pixel && (
//             <Layer>
//               {/* Mouse position indicator */}
//               <Circle
//                 x={mouseCoordinates.pixel.x}
//                 y={mouseCoordinates.pixel.y}
//                 radius={3}
//                 fill="rgba(255, 255, 0, 0.8)"
//                 stroke="rgba(255, 0, 0, 0.8)"
//                 strokeWidth={1}
//                 listening={false}
//               />
              
//               {/* Coordinate text overlay */}
//               <Text
//                 x={mouseCoordinates.pixel.x + 10}
//                 y={mouseCoordinates.pixel.y - 20}
//                 text={`X: ${mouseCoordinates.formatted?.x || '0.00'} ${displayUnit}\nY: ${mouseCoordinates.formatted?.y || '0.00'} ${displayUnit}`}
//                 fontSize={12}
//                 fontFamily="monospace"
//                 fill="rgba(0, 0, 0, 0.8)"
//                 stroke="rgba(255, 255, 255, 0.9)"
//                 strokeWidth={0.5}
//                 listening={false}
//                 align="left"
//               />
//             </Layer>
//           )}

//           {currentFloor?.shapes?.map((shape) => {
//             if (shape.shape === "rectangle") {
//               // Use the correct data structure - width/height are already in pixels
//               const x = typeof shape.x === "number" ? shape.x : 0;
//               const y = typeof shape.y === "number" ? shape.y : 0;
//               const width = shape.width || 0; // Already in pixels
//               const height = shape.height || 0; // Already in pixels

//               // Debug logging for each floor shape being rendered
//               console.log("🎯 RoomEditor: RENDERING FLOOR SHAPE:", {
//                 shapeId: shape.id,
//                 original: {
//                   x: shape.x,
//                   y: shape.y,
//                   width: shape.width,
//                   height: shape.height,
//                   widthInMeters: shape.widthInMeters,
//                   heightInMeters: shape.heightInMeters,
//                 },
//                 final: {
//                   x,
//                   y,
//                   width,
//                   height,
//                 },
//                 scale: {
//                   currentScale: scale,
//                   baseScale,
//                   stageScale: stageRef.current
//                     ? stageRef.current.scaleX()
//                     : "N/A",
//                 },
//                 conversion: {
//                   pixelsPerMeter: UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                   dataType: "pixels (direct)",
//                   widthConversion: `Using raw width: ${width}px`,
//                   heightConversion: `Using raw height: ${height}px`,
//                   expectedMeters: {
//                     width: width / UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                     height: height / UNIT_CONVERSION_CONSTANTS.PIXELS_PER_METER,
//                   },
//                 },
//               });

//               return (
//                 <Rect
//                   key={shape.id}
//                   x={x}
//                   y={y}
//                   width={width}
//                   height={height}
//                   fill="rgba(0, 150, 255, 0.1)" // Match Editor.jsx blue color
//                   stroke="#1e40af" // Match Editor.jsx stroke color
//                   strokeWidth={2}
//                   listening={false}
//                 />
//               );
//             } else if (shape.shape === "polygon") {
//               // Convert polygon points from meters to pixels if needed
//               const points = shape.points
//                 .map((point) => {
//                   const x = typeof point.x === "number" ? point.x : 0;
//                   const y = typeof point.y === "number" ? point.y : 0;
//                   return [x, y];
//                 })
//                 .flat();

//               return (
//                 <Line
//                   key={shape.id}
//                   points={points}
//                   stroke="#1e40af" // Match Editor.jsx stroke color
//                   strokeWidth={2}
//                   fill="rgba(0, 150, 255, 0.1)" // Match Editor.jsx blue color
//                   closed={true}
//                   listening={false}
//                 />
//               );
//             }
//             return null;
//           })}

//           {rooms.map((room) => (
//             <Rect
//               key={room.id}
//               {...room}
//               draggable
//               fill="rgba(100, 200, 100, 0.5)"
//               stroke="black"
//               onDragStart={(e) => handleDragStart(room.id, e)}
//               onDragEnd={(e) => handleDragEnd(room.id, e)}
//             />
//           ))}

//           {newRoom && (
//             <Rect
//               {...newRoom}
//               fill="rgba(100, 200, 100, 0.2)"
//               stroke="black"
//               dash={[4, 4]}
//             />
//           )}
//         </Layer>
//       </Stage>

//       {isModalOpen && selectedRoomId && (
//         <CentralModal
//           room={rooms.find((r) => r.id === selectedRoomId)}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// export default RoomEditor;
