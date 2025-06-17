// import React, { useState } from "react";
// import { ReloadIcon } from "../../icons/ReloadIcon";
// import ReactangleIcon from "../../icons/ReactangleIcon";
// import FloorPreview from "../shared/FloorPreview";
// import { useSelector, useDispatch } from "react-redux";
// import { setDialuxResult } from "../../redux/features/app/dialuxSlice";

// const DialuxForm = () => {
//   const [roomType, setRoomType] = useState("");
//   const [iesFile, setIesFile] = useState(null);
//   const [lumens, setLumens] = useState("");

//   const [illumination, setIllumination] = useState(4);
//   const [uf, setUf] = useState(0.6);
//   const [mf, setMf] = useState(0.8);
//   const [mountingHeight, setMountingHeight] = useState(1000);

//   const [drawingMode, setDrawingMode] = useState(null);
//   const [showResult, setShowResult] = useState(false);
//   const [calculationResult, setCalculationResult] = useState(null);

//   const rooms = useSelector((state) => state.rooms);
//   const selectedRoom = rooms.find((room) => room.id === roomType);
//   const roomArea = selectedRoom?.area || "";
//   const roomHeight = "";

//   const dispatch = useDispatch();

//   const parseIesFile = (text) => {
//     const lines = text.split(/\r?\n/);
//     const tiltIndex = lines.findIndex((line) =>
//       line.trim().toUpperCase().startsWith("TILT=NONE")
//     );
//     if (tiltIndex !== -1 && lines[tiltIndex + 1]) {
//       const values = lines[tiltIndex + 1].trim().split(/\s+/).map(Number);
//       if (!isNaN(values[1])) {
//         setLumens(values[1]);
//       } else {
//         console.warn("Lumens could not be parsed.");
//       }
//     } else {
//       console.warn("TILT=NONE not found or malformed IES file.");
//     }
//   };

//   const handleReload = () => {
//     console.log("Reload clicked");
//   };

//   const handleCalculate = () => {
//     if (!roomArea || !lumens || !illumination || !uf || !mf) {
//       alert(
//         "Please ensure room, lux level, UF, MF, and IES file are provided."
//       );
//       return;
//     }

//     const totalLuminaires = Math.ceil(
//       (illumination * roomArea) / (lumens * uf * mf)
//     );

//     const result = { totalLuminaires };
//     setCalculationResult(result);
//     dispatch(setDialuxResult(result));
//     setShowResult(true);
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
//         <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
//           <div>
//             <h1 className="text-[14px] font-semibold text-black leading-none">
//               Dialux
//             </h1>
//             <p className="text-[11px] text-gray-400 mt-[2px]">
//               Lighting Calculator
//             </p>
//           </div>
//           <button
//             className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC]"
//             onClick={handleReload}
//           >
//             <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
//           </button>
//         </div>

//         <div className="p-2">
//           {/* Room Select */}
//           <p className="text-[11px] text-black mb-1">Room</p>
//           <select
//             value={roomType}
//             onChange={(e) => setRoomType(e.target.value)}
//             className="w-full mb-3 border border-gray-200 rounded-md px-3 py-2 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
//           >
//             <option value="">Select Room</option>
//             {rooms.map((room) => (
//               <option key={room.id} value={room.id}>
//                 {room.name}
//               </option>
//             ))}
//           </select>

//           {/* Area and Height */}
//           <div className="space-y-3 mb-4">
//             <div>
//               <p className="text-[11px] mb-1">Area (m²)</p>
//               <input
//                 type="number"
//                 value={roomArea}
//                 readOnly
//                 className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
//               />
//             </div>
//             <div>
//               <p className="text-[11px] mb-1">Height (m)</p>
//               <input
//                 type="number"
//                 value={roomHeight}
//                 readOnly
//                 className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
//               />
//             </div>
//           </div>

//           {/* Upload IES File */}
//           <div className="mb-4">
//             <p className="text-[11px] mb-1">Upload IES File</p>
//             <input
//               type="file"
//               accept=".ies"
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) {
//                   setIesFile(file);
//                   const reader = new FileReader();
//                   reader.onload = (event) => parseIesFile(event.target.result);
//                   reader.readAsText(file);
//                 }
//               }}
//               className="w-full text-[13px] file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[#0083EE] file:text-white hover:file:bg-[#1C78DC]"
//             />
//             {iesFile && (
//               <p className="text-[11px] text-green-600 mt-1">
//                 Selected: {iesFile.name}
//               </p>
//             )}
//           </div>

//           {/* Light Parameters */}
//           <div className="border border-gray-300 rounded-md p-3 space-y-3 mb-4">
//             {[
//               {
//                 label: "Lux Level",
//                 value: illumination,
//                 set: setIllumination,
//                 unit: "Lux",
//               },
//               { label: "Utilization Factor (UF)", value: uf, set: setUf },
//               { label: "Maintenance Factor (MF)", value: mf, set: setMf },
//               {
//                 label: "Mounting Height",
//                 value: mountingHeight,
//                 set: setMountingHeight,
//                 unit: "m",
//               },
//               { label: "Lumens", value: lumens, set: setLumens },
//             ].map(({ label, value, set, unit }) => (
//               <div key={label}>
//                 <p className="text-[11px] text-black mb-1">{label}</p>
//                 <div className="flex gap-2">
//                   <input
//                     type="number"
//                     value={value}
//                     onChange={(e) => set(parseFloat(e.target.value))}
//                     className="w-full rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
//                   />
//                   {unit && (
//                     <span className="text-[12px] text-gray-500 flex items-center">
//                       {unit}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {/* Calculate */}
//             <button
//               onClick={handleCalculate}
//               className="w-full bg-[#0083EE] text-white px-4 py-2 rounded-md hover:bg-[#1C78DC] transition text-[13px] font-medium"
//             >
//               Calculate
//             </button>

//             {showResult && calculationResult && (
//               <div className="border border-green-400 bg-green-50 text-green-800 rounded-md p-3 text-[13px] mt-3">
//                 <p>Number of Lights: {calculationResult.totalLuminaires}</p>
//               </div>
//             )}
//           </div>

//           {/* Drawing Options */}
//           <p className="text-[11px] text-black mb-2">Distribution Pattern</p>
//           <div className="space-y-2 text-[13px]">
//             <button className="w-full text-left px-3 py-2 flex items-center gap-2 border border-none text-black rounded-md font-medium">
//               <div className="w-[24px] h-[24px] bg-[#0083EE] rounded-md flex items-center justify-center">
//                 <ReactangleIcon className="w-[14px] h-[14px]" />
//               </div>
//               Draw rectangular arrangement
//             </button>

//             {["line", "grid"].map((mode) => (
//               <button
//                 key={mode}
//                 className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
//                 onClick={() => setDrawingMode(mode)}
//               >
//                 {mode === "line"
//                   ? "── Draw line arrangement"
//                   : "⊞ Draw grid arrangement"}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Canvas */}
//       <div className="flex-1 h-full">
//         <FloorPreview
//           drawingMode={drawingMode}
//           exitDrawingMode={() => setDrawingMode(null)}
//           roomId={roomType}
//           numberOfLights={calculationResult?.totalLuminaires}
//         />
//       </div>
//     </div>
//   );
// };

// export default DialuxForm;

import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import FloorPreview from "../shared/FloorPreview";
import { useSelector, useDispatch } from "react-redux";
import { setDialuxResult } from "../../redux/features/app/dialuxSlice";

const DialuxForm = () => {
  const [roomType, setRoomType] = useState("");
  const [iesFile, setIesFile] = useState(null);
  const [lumens, setLumens] = useState("");
  const [illumination, setIllumination] = useState(4);
  const [uf, setUf] = useState(0.6);
  const [mf, setMf] = useState(0.8);
  const [mountingHeight, setMountingHeight] = useState(1000);
  const [drawingMode, setDrawingMode] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [gridRows, setGridRows] = useState(1);
  const [gridCols, setGridCols] = useState(1);

  const rooms = useSelector((state) => state.rooms);
  const selectedRoom = rooms.find((room) => room.id === roomType);
  const roomArea = selectedRoom?.area || "";
  const roomHeight = "";

  const dispatch = useDispatch();

  const parseIesFile = (text) => {
    const lines = text.split(/\r?\n/);
    const tiltIndex = lines.findIndex((line) =>
      line.trim().toUpperCase().startsWith("TILT=NONE")
    );
    if (tiltIndex !== -1 && lines[tiltIndex + 1]) {
      const values = lines[tiltIndex + 1].trim().split(/\s+/).map(Number);
      if (!isNaN(values[1])) {
        setLumens(values[1]);
      } else {
        console.warn("Lumens could not be parsed.");
      }
    } else {
      console.warn("TILT=NONE not found or malformed IES file.");
    }
  };

  const handleReload = () => {
    console.log("Reload clicked");
  };

  const handleCalculate = () => {
    if (!roomArea || !lumens || !illumination || !uf || !mf) {
      alert(
        "Please ensure room, lux level, UF, MF, and IES file are provided."
      );
      return;
    }

    const totalLuminaires = Math.ceil(
      (illumination * roomArea) / (lumens * uf * mf)
    );

    setCalculationResult({ totalLuminaires });
    dispatch(setDialuxResult({ totalLuminaires }));
    setShowResult(true);
  };

  return (
    <div className="flex h-screen">
      <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[14px] font-semibold text-black leading-none">
              Dialux
            </h1>
            <p className="text-[11px] text-gray-400 mt-[2px]">
              Lighting Calculator
            </p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC]"
            onClick={handleReload}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        <div className="p-2">
          {/* Room Select */}
          <p className="text-[11px] text-black mb-1">Room</p>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full mb-3 border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>

          {/* Area and Height */}
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-[11px] mb-1">Area (m²)</p>
              <input
                type="number"
                value={roomArea}
                readOnly
                className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
              />
            </div>
            <div>
              <p className="text-[11px] mb-1">Height (m)</p>
              <input
                type="number"
                value={roomHeight}
                readOnly
                className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
              />
            </div>
          </div>

          {/* Upload IES File */}
          <div className="mb-4">
            <p className="text-[11px] mb-1">Upload IES File</p>
            <input
              type="file"
              accept=".ies"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setIesFile(file);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target.result;
                    console.log("IES File Content:\n", text); // ✅ Console log here
                    parseIesFile(text);
                  };
                  reader.readAsText(file);
                }
              }}
              className="w-full text-[13px] file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[#0083EE] file:text-white hover:file:bg-[#1C78DC]"
            />

            {iesFile && (
              <p className="text-[11px] text-green-600 mt-1">
                Selected: {iesFile.name}
              </p>
            )}
          </div>

          {/* Light Parameters */}
          <div className="border border-gray-300 rounded-md p-3 space-y-3 mb-4">
            {[
              {
                label: "Lux Level",
                value: illumination,
                set: setIllumination,
                unit: "Lux",
              },
              { label: "Utilization Factor (UF)", value: uf, set: setUf },
              { label: "Maintenance Factor (MF)", value: mf, set: setMf },
              {
                label: "Mounting Height",
                value: mountingHeight,
                set: setMountingHeight,
                unit: "m",
              },
              { label: "Lumens", value: lumens, set: setLumens },
            ].map(({ label, value, set, unit }) => (
              <div key={label}>
                <p className="text-[11px] text-black mb-1">{label}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(parseFloat(e.target.value))}
                    className="w-full rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200"
                  />
                  {unit && (
                    <span className="text-[12px] text-gray-500 flex items-center">
                      {unit}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Calculate */}
            <button
              onClick={handleCalculate}
              className="w-full bg-[#0083EE] text-white px-4 py-2 rounded-md hover:bg-[#1C78DC] transition text-[13px] font-medium"
            >
              Calculate
            </button>

            {showResult && calculationResult && (
              <div className="border border-green-400 bg-green-50 text-green-800 rounded-md p-3 text-[13px] mt-3">
                <p>Number of Lights: {calculationResult.totalLuminaires}</p>
              </div>
            )}
          </div>

          {/* Drawing Options */}
          <p className="text-[11px] text-black mb-2">Distribution Pattern</p>
          <div className="space-y-2 text-[13px]">
            <button className="w-full text-left px-3 py-2 flex items-center gap-2 border border-none text-black rounded-md font-medium">
              <div className="w-[24px] h-[24px] bg-[#0083EE] rounded-md flex items-center justify-center">
                <ReactangleIcon className="w-[14px] h-[14px]" />
              </div>
              Draw rectangular arrangement
            </button>

            {["line", "grid"].map((mode) => (
              <button
                key={mode}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setDrawingMode(mode)}
              >
                {mode === "line"
                  ? "── Draw line arrangement"
                  : "⊞ Draw grid arrangement"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 h-full">
        <FloorPreview
          drawingMode={drawingMode}
          exitDrawingMode={() => setDrawingMode(null)}
          roomId={roomType}
          numberOfLights={calculationResult?.totalLuminaires}
        />
      </div>
    </div>
  );
};

export default DialuxForm;
