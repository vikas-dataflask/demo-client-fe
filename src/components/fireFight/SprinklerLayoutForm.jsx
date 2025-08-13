// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { Stage, Layer, Rect, Text, Line, Circle } from "react-konva";
// import {
//   calculateSprinklerLayout,
//   validateSprinklerLayoutParams,
//   getHazardClassInfo,
// } from "../../components/fireFight/sprinklerLayout";

// // FloorPlanEditor Component for Sprinkler Layout
// const FloorPlanEditor = ({ selectedRoomId, rooms, results }) => {
//   const [zoom, setZoom] = useState(1);
//   const [pan, setPan] = useState({ x: 0, y: 0 });
//   const [showGrid, setShowGrid] = useState(true);
//   const [showMeasurements, setShowMeasurements] = useState(true);

//   // Full screen canvas dimensions
//   const canvasWidth = window.innerWidth - 440; // Fixed sidebar width like DialuxForm
//   const canvasHeight = window.innerHeight - 80;

//   // Convert rooms to display coordinates
//   const roomsDisplay = rooms.map((room) => ({
//     ...room,
//     x: room.x / 100, // Convert from storage format to meters
//     y: room.y / 100,
//     width: room.width / 100,
//     height: room.height / 100,
//   }));

//   // Calculate scale to fit all rooms in canvas
//   const allRoomsBounds =
//     roomsDisplay.length > 0
//       ? roomsDisplay.reduce(
//           (bounds, room) => ({
//             minX: Math.min(bounds.minX, room.x),
//             minY: Math.min(bounds.minY, room.y),
//             maxX: Math.max(bounds.maxX, room.x + room.width),
//             maxY: Math.max(bounds.maxY, room.y + room.height),
//           }),
//           { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
//         )
//       : null;

//   const scale = allRoomsBounds
//     ? Math.min(
//         canvasWidth / (allRoomsBounds.maxX - allRoomsBounds.minX),
//         canvasHeight / (allRoomsBounds.maxY - allRoomsBounds.minY)
//       ) * 0.8
//     : 1; // 0.8 for padding

//   // Convert room coordinates to canvas coordinates
//   const roomsCanvas = roomsDisplay.map((room) => ({
//     ...room,
//     x: (room.x - (allRoomsBounds?.minX || 0)) * scale + 20,
//     y: (room.y - (allRoomsBounds?.minY || 0)) * scale + 20,
//     width: room.width * scale,
//     height: room.height * scale,
//   }));

//   // Generate sprinkler positions if results exist
//   const sprinklerPositions =
//     results?.layout?.map((sprinkler) => ({
//       x: (sprinkler.x - (allRoomsBounds?.minX || 0)) * scale + 20,
//       y: (sprinkler.y - (allRoomsBounds?.minY || 0)) * scale + 20,
//       id: sprinkler.id,
//     })) || [];

//   const handleWheel = (e) => {
//     e.evt.preventDefault();
//     const scaleBy = 1.1;
//     const newZoom = e.evt.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy;
//     setZoom(Math.max(0.1, Math.min(3, newZoom)));
//   };

//   const renderGrid = () => {
//     if (!showGrid) return null;

//     const gridSize = 20 * scale;
//     const lines = [];

//     for (let i = 0; i <= canvasWidth; i += gridSize) {
//       lines.push(
//         <Line
//           key={`v${i}`}
//           points={[i, 0, i, canvasHeight]}
//           stroke="#e0e0e0"
//           strokeWidth={1}
//           opacity={0.5}
//         />
//       );
//     }

//     for (let i = 0; i <= canvasHeight; i += gridSize) {
//       lines.push(
//         <Line
//           key={`h${i}`}
//           points={[0, i, canvasWidth, i]}
//           stroke="#e0e0e0"
//           strokeWidth={1}
//           opacity={0.5}
//         />
//       );
//     }

//     return lines;
//   };

//   return (
//     <div className="flex-1 bg-gray-100">
//       <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
//         <h4 className="font-semibold text-gray-800">Floor Plan Layout</h4>
//         <div className="flex gap-2">
//           <button
//             onClick={() => setShowGrid(!showGrid)}
//             className={`px-3 py-1 text-sm rounded ${
//               showGrid
//                 ? "bg-blue-100 text-blue-700"
//                 : "bg-gray-100 text-gray-600"
//             }`}
//           >
//             Grid
//           </button>
//           <button
//             onClick={() => setShowMeasurements(!showMeasurements)}
//             className={`px-3 py-1 text-sm rounded ${
//               showMeasurements
//                 ? "bg-blue-100 text-blue-700"
//                 : "bg-gray-100 text-gray-600"
//             }`}
//           >
//             Measurements
//           </button>
//         </div>
//       </div>

//       <Stage
//         width={canvasWidth}
//         height={canvasHeight}
//         onWheel={handleWheel}
//         scaleX={zoom}
//         scaleY={zoom}
//         x={pan.x}
//         y={pan.y}
//       >
//         <Layer>
//           {/* Background */}
//           <Rect
//             x={0}
//             y={0}
//             width={canvasWidth}
//             height={canvasHeight}
//             fill="#f8f9fa"
//           />

//           {/* Grid */}
//           {renderGrid()}

//           {/* Rooms */}
//           {roomsCanvas.map((room) => (
//             <React.Fragment key={room.id}>
//               <Rect
//                 x={room.x}
//                 y={room.y}
//                 width={room.width}
//                 height={room.height}
//                 fill={
//                   selectedRoomId === room.id
//                     ? "rgba(59, 130, 246, 0.3)"
//                     : "rgba(100, 200, 100, 0.3)"
//                 }
//                 stroke={selectedRoomId === room.id ? "#3b82f6" : "#000"}
//                 strokeWidth={selectedRoomId === room.id ? 2 : 1}
//               />

//               {/* Room Label */}
//               <Text
//                 x={room.x + 5}
//                 y={room.y + 5}
//                 text={room.name || `Room ${room.id}`}
//                 fontSize={12}
//                 fill="#333"
//                 fontFamily="Arial, sans-serif"
//               />

//               {/* Measurements */}
//               {showMeasurements && (
//                 <>
//                   <Text
//                     x={room.x + room.width / 2}
//                     y={room.y - 15}
//                     text={`${room.width.toFixed(1)}m`}
//                     fontSize={10}
//                     fill="#666"
//                     align="center"
//                     fontFamily="Arial, sans-serif"
//                   />
//                   <Text
//                     x={room.x - 25}
//                     y={room.y + room.height / 2}
//                     text={`${room.height.toFixed(1)}m`}
//                     fontSize={10}
//                     fill="#666"
//                     align="center"
//                     fontFamily="Arial, sans-serif"
//                     rotation={-90}
//                   />
//                 </>
//               )}
//             </React.Fragment>
//           ))}

//           {/* Sprinkler Positions */}
//           {sprinklerPositions.map((sprinkler) => (
//             <Circle
//               key={sprinkler.id}
//               x={sprinkler.x}
//               y={sprinkler.y}
//               radius={4}
//               fill="#ef4444"
//               stroke="#dc2626"
//               strokeWidth={1}
//             />
//           ))}
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// const SprinklerLayoutForm = ({ setData }) => {
//   const rooms = useSelector((state) => state.rooms);

//   const [formData, setFormData] = useState({
//     length: "",
//     width: "",
//     hazardClass: "Light",
//   });

//   const [selectedRoomId, setSelectedRoomId] = useState("");
//   const [results, setResults] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [isCalculating, setIsCalculating] = useState(false);

//   // Auto-populate form when room is selected
//   useEffect(() => {
//     if (selectedRoomId) {
//       const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
//       if (selectedRoom) {
//         // Convert room dimensions from storage format to meters
//         // Storage format: 100 pixels = 1 meter
//         const lengthInMeters = selectedRoom.height / 100;
//         const widthInMeters = selectedRoom.width / 100;

//         setFormData((prev) => ({
//           ...prev,
//           length: lengthInMeters.toFixed(2),
//           width: widthInMeters.toFixed(2),
//         }));

//         // Clear any existing errors
//         setErrors((prev) => ({ ...prev, length: "", width: "" }));
//       }
//     }
//   }, [selectedRoomId, rooms]);

//   const handleRoomSelection = (e) => {
//     const roomId = e.target.value;
//     setSelectedRoomId(roomId);

//     if (!roomId) {
//       // Clear form if no room is selected
//       setFormData((prev) => ({
//         ...prev,
//         length: "",
//         width: "",
//       }));
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         name === "length" || name === "width" ? parseFloat(value) || "" : value,
//     }));
//     // Clear errors when user starts typing
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsCalculating(true);
//     setErrors({});

//     try {
//       // Validate inputs
//       const validation = validateSprinklerLayoutParams(formData);
//       if (!validation.isValid) {
//         const errorObj = {};
//         validation.errors.forEach((error) => {
//           if (error.includes("length")) errorObj.length = error;
//           else if (error.includes("width")) errorObj.width = error;
//           else if (error.includes("hazard")) errorObj.hazardClass = error;
//           else errorObj.general = error;
//         });
//         setErrors(errorObj);
//         setIsCalculating(false);
//         return;
//       }

//       // Calculate sprinkler layout
//       const layoutResults = calculateSprinklerLayout(formData);
//       setResults(layoutResults);

//       // Set data for modal if needed
//       if (setData) {
//         setData(layoutResults);
//       }
//     } catch (error) {
//       setErrors({ general: error.message });
//     } finally {
//       setIsCalculating(false);
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       length: "",
//       width: "",
//       hazardClass: "Light",
//     });
//     setSelectedRoomId("");
//     setResults(null);
//     setErrors({});
//   };

//   const hazardClassInfo = getHazardClassInfo();

//   return (
//     <div className="flex h-screen">
//       {/* Left Sidebar - Fixed width like DialuxForm */}
//       <div className="w-[440px] bg-white p-6 overflow-y-auto">
//         <div className="mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">
//             Sprinkler Layout Calculator
//           </h2>
//           <p className="text-sm text-gray-600">
//             NFPA 13 compliant sprinkler system layout design
//           </p>
//         </div>

//         <div className="space-y-6">
//           {/* Input Parameters Section */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Input Parameters
//             </h3>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Room Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Select Room (Auto-fill dimensions)
//                 </label>
//                 <select
//                   value={selectedRoomId}
//                   onChange={handleRoomSelection}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select a room from project</option>
//                   {rooms.map((room) => (
//                     <option key={room.id} value={room.id}>
//                       {room.name || `Room ${room.id}`} - {room.area} m²
//                     </option>
//                   ))}
//                 </select>
//                 {rooms.length === 0 && (
//                   <p className="text-orange-500 text-xs mt-1">
//                     No rooms found. Please create rooms in the File Setup
//                     section first.
//                   </p>
//                 )}
//               </div>

//               {/* Room Dimensions */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Room Length (m)
//                   </label>
//                   <input
//                     type="number"
//                     name="length"
//                     value={formData.length}
//                     onChange={handleInputChange}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors.length ? "border-red-500" : "border-gray-300"
//                     }`}
//                     placeholder="Enter length"
//                     step="0.1"
//                   />
//                   {errors.length && (
//                     <p className="text-red-500 text-xs mt-1">{errors.length}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Room Width (m)
//                   </label>
//                   <input
//                     type="number"
//                     name="width"
//                     value={formData.width}
//                     onChange={handleInputChange}
//                     className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors.width ? "border-red-500" : "border-gray-300"
//                     }`}
//                     placeholder="Enter width"
//                     step="0.1"
//                   />
//                   {errors.width && (
//                     <p className="text-red-500 text-xs mt-1">{errors.width}</p>
//                   )}
//                 </div>
//               </div>

//               {/* Hazard Class */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Hazard Class
//                 </label>
//                 <select
//                   name="hazardClass"
//                   value={formData.hazardClass}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="Light">Light Hazard</option>
//                   <option value="Ordinary">Ordinary Hazard</option>
//                   <option value="Extra">Extra Hazard</option>
//                 </select>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="submit"
//                   disabled={isCalculating}
//                   className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isCalculating ? "Calculating..." : "Calculate Layout"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Results Section - Now below Input Parameters */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">
//               Layout Results
//             </h3>

//             {errors.general && (
//               <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
//                 <p className="text-red-700 text-sm">{errors.general}</p>
//               </div>
//             )}

//             {results ? (
//               <div className="space-y-4">
//                 {/* Basic Layout Info */}
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-3">
//                     Layout Configuration
//                   </h4>
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span className="text-gray-600">Total sprinklers:</span>
//                       <span className="font-medium ml-2">
//                         {results.actualSprinklersPlaced}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Grid layout:</span>
//                       <span className="font-medium ml-2">
//                         {results.rows} × {results.columns}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Room area:</span>
//                       <span className="font-medium ml-2">
//                         {results.roomArea} m²
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">
//                         Coverage per sprinkler:
//                       </span>
//                       <span className="font-medium ml-2">
//                         {results.coveragePerSprinkler} m²
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Spacing Details */}
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-3">
//                     Spacing Details
//                   </h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Optimal spacing:</span>
//                       <span className="font-medium">{results.spacing} m</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Row spacing:</span>
//                       <span className="font-medium">
//                         {results.actualSpacingY} m
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Column spacing:</span>
//                       <span className="font-medium">
//                         {results.actualSpacingX} m
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* NFPA Compliance */}
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                   <h4 className="font-semibold text-gray-800 mb-3">
//                     NFPA 13 Compliance
//                   </h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className={`w-3 h-3 rounded-full ${
//                           results.isCompliant ? "bg-green-500" : "bg-red-500"
//                         }`}
//                       ></div>
//                       <span
//                         className={
//                           results.isCompliant
//                             ? "text-green-700"
//                             : "text-red-700"
//                         }
//                       >
//                         {results.isCompliant ? "Compliant" : "Non-compliant"}
//                       </span>
//                     </div>
//                     <div className="text-gray-600 text-xs">
//                       Coverage ratio: {results.coverageRatio}%
//                     </div>
//                     <div className="text-gray-600 text-xs">
//                       {results.complianceMessage}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center text-gray-500 py-8">
//                 <svg
//                   className="w-12 h-12 mx-auto mb-4 text-gray-300"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                   />
//                 </svg>
//                 <p>
//                   Select a room or enter dimensions to calculate sprinkler
//                   layout
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Full Screen FloorPlanEditor */}
//       <FloorPlanEditor
//         selectedRoomId={selectedRoomId}
//         rooms={rooms}
//         results={results}
//       />
//     </div>
//   );
// };

// export default SprinklerLayoutForm;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Stage, Layer, Rect, Text, Line, Circle } from "react-konva";
import {
  calculateSprinklerLayout,
  validateSprinklerLayoutParams,
  getHazardClassInfo,
} from "../../components/fireFight/sprinklerLayout";
import {
  useGetSprinklerLayoutQuery,
  useSaveOrUpdateSprinklerLayoutMutation,
} from "../../redux/features/api/api"; // ✅ IMPORT RTK HOOKS

// ---------------- FloorPlanEditor Component ----------------
const FloorPlanEditor = ({ selectedRoomId, rooms, results }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  const canvasWidth = window.innerWidth - 440;
  const canvasHeight = window.innerHeight - 80;

  const roomsDisplay = rooms.map((room) => ({
    ...room,
    x: room.x / 100,
    y: room.y / 100,
    width: room.width / 100,
    height: room.height / 100,
  }));

  const allRoomsBounds =
    roomsDisplay.length > 0
      ? roomsDisplay.reduce(
          (bounds, room) => ({
            minX: Math.min(bounds.minX, room.x),
            minY: Math.min(bounds.minY, room.y),
            maxX: Math.max(bounds.maxX, room.x + room.width),
            maxY: Math.max(bounds.maxY, room.y + room.height),
          }),
          { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        )
      : null;

  const scale = allRoomsBounds
    ? Math.min(
        canvasWidth / (allRoomsBounds.maxX - allRoomsBounds.minX),
        canvasHeight / (allRoomsBounds.maxY - allRoomsBounds.minY)
      ) * 0.8
    : 1;

  const roomsCanvas = roomsDisplay.map((room) => ({
    ...room,
    x: (room.x - (allRoomsBounds?.minX || 0)) * scale + 20,
    y: (room.y - (allRoomsBounds?.minY || 0)) * scale + 20,
    width: room.width * scale,
    height: room.height * scale,
  }));

  const sprinklerPositions =
    results?.layout?.map((sprinkler) => ({
      x: (sprinkler.x - (allRoomsBounds?.minX || 0)) * scale + 20,
      y: (sprinkler.y - (allRoomsBounds?.minY || 0)) * scale + 20,
      id: sprinkler.id,
    })) || [];

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const newZoom = e.evt.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy;
    setZoom(Math.max(0.1, Math.min(3, newZoom)));
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 20 * scale;
    const lines = [];

    for (let i = 0; i <= canvasWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i, 0, i, canvasHeight]}
          stroke="#e0e0e0"
          strokeWidth={1}
          opacity={0.5}
        />
      );
    }

    for (let i = 0; i <= canvasHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h${i}`}
          points={[0, i, canvasWidth, i]}
          stroke="#e0e0e0"
          strokeWidth={1}
          opacity={0.5}
        />
      );
    }

    return lines;
  };

  return (
    <div className="flex-1 bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <h4 className="font-semibold text-gray-800">Floor Plan Layout</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1 text-sm rounded ${
              showGrid
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`px-3 py-1 text-sm rounded ${
              showMeasurements
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Measurements
          </button>
        </div>
      </div>

      <Stage
        width={canvasWidth}
        height={canvasHeight}
        onWheel={handleWheel}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="#f8f9fa"
          />
          {renderGrid()}
          {roomsCanvas.map((room) => (
            <React.Fragment key={room.id}>
              <Rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={
                  selectedRoomId === room.id
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(100, 200, 100, 0.3)"
                }
                stroke={selectedRoomId === room.id ? "#3b82f6" : "#000"}
                strokeWidth={selectedRoomId === room.id ? 2 : 1}
              />
              <Text
                x={room.x + 5}
                y={room.y + 5}
                text={room.name || `Room ${room.id}`}
                fontSize={12}
                fill="#333"
              />
              {showMeasurements && (
                <>
                  <Text
                    x={room.x + room.width / 2}
                    y={room.y - 15}
                    text={`${room.width.toFixed(1)}m`}
                    fontSize={10}
                    fill="#666"
                    align="center"
                  />
                  <Text
                    x={room.x - 25}
                    y={room.y + room.height / 2}
                    text={`${room.height.toFixed(1)}m`}
                    fontSize={10}
                    fill="#666"
                    align="center"
                    rotation={-90}
                  />
                </>
              )}
            </React.Fragment>
          ))}
          {sprinklerPositions.map((sprinkler) => (
            <Circle
              key={sprinkler.id}
              x={sprinkler.x}
              y={sprinkler.y}
              radius={4}
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth={1}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

// ---------------- SprinklerLayoutForm Component ----------------
const SprinklerLayoutForm = ({ setData, projectId }) => {
  const rooms = useSelector((state) => state.rooms?.rooms || []);

  // Debug: Log projectId to verify it's being passed correctly
  console.log("SprinklerLayoutForm - projectId:", projectId);

  const [formData, setFormData] = useState({
    length: "",
    width: "",
    hazardClass: "Light",
  });

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  // ✅ RTK Query Hooks
  const { data: savedData } = useGetSprinklerLayoutQuery(
    { projectId, roomId: selectedRoomId },
    { skip: !projectId || !selectedRoomId }
  );
  const [saveLayout] = useSaveOrUpdateSprinklerLayoutMutation();

  // ✅ Autofill when data comes from DB
  useEffect(() => {
    if (savedData?.data?.length > 0) {
      const saved = savedData.data[0];
      setFormData({
        length: saved.length,
        width: saved.width,
        hazardClass: saved.hazardClass,
      });
      setResults(saved);
    }
  }, [savedData]);

  // Auto-populate when room selected
  useEffect(() => {
    if (selectedRoomId) {
      const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
      if (selectedRoom) {
        const lengthInMeters = selectedRoom.height / 100;
        const widthInMeters = selectedRoom.width / 100;
        setFormData((prev) => ({
          ...prev,
          length: lengthInMeters.toFixed(2),
          width: widthInMeters.toFixed(2),
        }));
        setErrors((prev) => ({ ...prev, length: "", width: "" }));
      }
    }
  }, [selectedRoomId, rooms]);

  const handleRoomSelection = (e) => {
    setSelectedRoomId(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "length" || name === "width" ? parseFloat(value) || "" : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setErrors({});

    // ✅ Validate projectId is available
    if (!projectId) {
      setErrors({ general: "Project ID is required. Please ensure you're in a valid project context." });
      setIsCalculating(false);
      return;
    }

    try {
      const validation = validateSprinklerLayoutParams(formData);
      if (!validation.isValid) {
        const errorObj = {};
        validation.errors.forEach((error) => {
          if (error.includes("length")) errorObj.length = error;
          else if (error.includes("width")) errorObj.width = error;
          else if (error.includes("hazard")) errorObj.hazardClass = error;
          else errorObj.general = error;
        });
        setErrors(errorObj);
        setIsCalculating(false);
        return;
      }

      const layoutResults = calculateSprinklerLayout(formData);
      setResults(layoutResults);

      // ✅ Save or update to DB
      console.log("Saving sprinkler layout with payload:", {
        projectId,
        roomId: selectedRoomId,
        ...formData,
        ...layoutResults,
      });

      await saveLayout({
        projectId,
        roomId: selectedRoomId,
        ...formData,
        ...layoutResults,
      }).unwrap();

      if (setData) setData(layoutResults);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({ length: "", width: "", hazardClass: "Light" });
    setSelectedRoomId("");
    setResults(null);
    setErrors({});
  };

  const hazardClassInfo = getHazardClassInfo();
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Fixed width like DialuxForm */}
      <div className="w-[440px] bg-white p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Sprinkler Layout Calculator
          </h2>
          <p className="text-sm text-gray-600">
            NFPA 13 compliant sprinkler system layout design
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Parameters Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Input Parameters
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Room (Auto-fill dimensions)
                </label>
                <select
                  value={selectedRoomId}
                  onChange={handleRoomSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a room from project</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name || `Room ${room.id}`} - {room.area} m²
                    </option>
                  ))}
                </select>
                {rooms.length === 0 && (
                  <p className="text-orange-500 text-xs mt-1">
                    No rooms found. Please create rooms in the File Setup
                    section first.
                  </p>
                )}
              </div>

              {/* Room Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Length (m)
                  </label>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.length ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter length"
                    step="0.1"
                  />
                  {errors.length && (
                    <p className="text-red-500 text-xs mt-1">{errors.length}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Width (m)
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.width ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter width"
                    step="0.1"
                  />
                  {errors.width && (
                    <p className="text-red-500 text-xs mt-1">{errors.width}</p>
                  )}
                </div>
              </div>

              {/* Hazard Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hazard Class
                </label>
                <select
                  name="hazardClass"
                  value={formData.hazardClass}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Light">Light Hazard</option>
                  <option value="Ordinary">Ordinary Hazard</option>
                  <option value="Extra">Extra Hazard</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? "Calculating..." : "Calculate Layout"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results Section - Now below Input Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Layout Results
            </h3>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {results ? (
              <div className="space-y-4">
                {/* Basic Layout Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Layout Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total sprinklers:</span>
                      <span className="font-medium ml-2">
                        {results.actualSprinklersPlaced}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Grid layout:</span>
                      <span className="font-medium ml-2">
                        {results.rows} × {results.columns}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Room area:</span>
                      <span className="font-medium ml-2">
                        {results.roomArea} m²
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Coverage per sprinkler:
                      </span>
                      <span className="font-medium ml-2">
                        {results.coveragePerSprinkler} m²
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spacing Details */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Spacing Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Optimal spacing:</span>
                      <span className="font-medium">{results.spacing} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Row spacing:</span>
                      <span className="font-medium">
                        {results.actualSpacingY} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Column spacing:</span>
                      <span className="font-medium">
                        {results.actualSpacingX} m
                      </span>
                    </div>
                  </div>
                </div>

                {/* NFPA Compliance */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    NFPA 13 Compliance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          results.isCompliant ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={
                          results.isCompliant
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        {results.isCompliant ? "Compliant" : "Non-compliant"}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs">
                      Coverage ratio: {results.coverageRatio}%
                    </div>
                    <div className="text-gray-600 text-xs">
                      {results.complianceMessage}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>
                  Select a room or enter dimensions to calculate sprinkler
                  layout
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Full Screen FloorPlanEditor */}
      <FloorPlanEditor
        selectedRoomId={selectedRoomId}
        rooms={rooms}
        results={results}
      />
    </div>
  );
};

export default SprinklerLayoutForm;
