// import React, { useState } from "react";
// import { ReloadIcon } from "../../icons/ReloadIcon";
// import FloorPreview from "../shared/FloorPreview";
// import { useSelector, useDispatch } from "react-redux";
// import { setRoomPower } from "../../redux/features/app/powerSlice";

// const PowerForm = () => {
//   const [roomType, setRoomType] = useState("");
//   const [numPoints, setNumPoints] = useState("");
//   const [powerPerPoint, setPowerPerPoint] = useState("");
//   const [totalPower, setTotalPower] = useState(null);
//   const [showResult, setShowResult] = useState(false);
//   const dispatch = useDispatch();

//   const rooms = useSelector((state) => state.rooms);
//   const selectedRoom = rooms.find((room) => room.id === roomType);
//   const roomArea = selectedRoom?.area || "";
//   const roomHeight = selectedRoom?.height || "";

//   const handleReload = () => {
//     setRoomType("");
//     setNumPoints("");
//     setPowerPerPoint("");
//     setTotalPower(null);
//     setShowResult(false);
//   };

//   // const handleCalculate = () => {
//   //   if (!roomType || !numPoints || !powerPerPoint) {
//   //     alert("Please fill all fields.");
//   //     return;
//   //   }

//   //   const total = parseFloat(numPoints) * parseFloat(powerPerPoint);
//   //   setTotalPower(total);
//   //   setShowResult(true);
//   // };

//   const handleCalculate = () => {
//     if (!roomType || !numPoints || !powerPerPoint) {
//       alert("Please fill all fields.");
//       return;
//     }

//     const total = parseFloat(numPoints) * parseFloat(powerPerPoint);
//     setTotalPower(total);
//     setShowResult(true);

//     dispatch(setRoomPower({ roomId: roomType, totalPower: total }));
//   };

//   return (
//     <div className="flex h-screen">
//       <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
//         <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
//           <div>
//             <h1 className="text-[14px] font-semibold text-black leading-none">
//               Power
//             </h1>
//             <p className="text-[11px] text-gray-400 mt-[2px]">
//               Power Load Calculator
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
//             className="w-full mb-3 border border-gray-200 rounded-md px-3 py-2 bg-gray-200"
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

//           {/* Power Inputs */}
//           <div className="border border-gray-300 rounded-md p-3 space-y-3 mb-4">
//             <div>
//               <p className="text-[11px] mb-1">Number of Power Points</p>
//               <input
//                 type="number"
//                 value={numPoints}
//                 onChange={(e) => setNumPoints(e.target.value)}
//                 className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
//               />
//             </div>
//             <div>
//               <p className="text-[11px] mb-1">Power per Point (W)</p>
//               <input
//                 type="number"
//                 value={powerPerPoint}
//                 onChange={(e) => setPowerPerPoint(e.target.value)}
//                 className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
//               />
//             </div>

//             <button
//               onClick={handleCalculate}
//               className="w-full bg-[#0083EE] text-white px-4 py-2 rounded-md hover:bg-[#1C78DC] transition text-[13px] font-medium"
//             >
//               Calculate
//             </button>

//             {showResult && totalPower !== null && (
//               <div className="border border-green-400 bg-green-50 text-green-800 rounded-md p-3 text-[13px] mt-3">
//                 <p>Total Power: {totalPower} W</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Canvas View */}
//       <div className="flex-1 h-full">
//         <FloorPreview
//           drawingMode={null}
//           exitDrawingMode={() => {}}
//           roomId={roomType}
//           numberOfLights={null}
//         />
//       </div>
//     </div>
//   );
// };

// export default PowerForm;

import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";
import { useSelector, useDispatch } from "react-redux";
import { setRoomPower } from "../../redux/features/app/powerSlice";

const PowerForm = () => {
  const [roomType, setRoomType] = useState("");
  const [numPoints, setNumPoints] = useState("");
  const [powerPerPoint, setPowerPerPoint] = useState("");
  const dispatch = useDispatch();

  const rooms = useSelector((state) => state.rooms);
  const powerByRoom = useSelector((state) => state.power.powerByRoom);

  const selectedRoom = rooms.find((room) => room.id === roomType);
  const roomArea = selectedRoom?.area || "";
  const roomHeight = selectedRoom?.height || "";

  const handleReload = () => {
    setRoomType("");
    setNumPoints("");
    setPowerPerPoint("");
  };

  const handleCalculate = () => {
    if (!roomType || !numPoints || !powerPerPoint) {
      alert("Please fill all fields.");
      return;
    }

    const total = parseFloat(numPoints) * parseFloat(powerPerPoint);
    dispatch(setRoomPower({ roomId: roomType, totalPower: total }));
  };

  return (
    <div className="flex h-screen">
      <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[14px] font-semibold text-black leading-none">
              Power
            </h1>
            <p className="text-[11px] text-gray-400 mt-[2px]">
              Power Load Calculator
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

          {/* Power Inputs */}
          <div className="border border-gray-300 rounded-md p-3 space-y-3 mb-4">
            <div>
              <p className="text-[11px] mb-1">Number of Power Points</p>
              <input
                type="number"
                value={numPoints}
                onChange={(e) => setNumPoints(e.target.value)}
                className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
              />
            </div>
            <div>
              <p className="text-[11px] mb-1">Power per Point (W)</p>
              <input
                type="number"
                value={powerPerPoint}
                onChange={(e) => setPowerPerPoint(e.target.value)}
                className="w-full bg-gray-200 rounded-md px-3 py-2 border border-gray-200"
              />
            </div>

            <button
              onClick={handleCalculate}
              className="w-full bg-[#0083EE] text-white px-4 py-2 rounded-md hover:bg-[#1C78DC] transition text-[13px] font-medium"
            >
              Calculate
            </button>
          </div>

          {/* Persistent Power Results */}
          {Object.entries(powerByRoom).length > 0 && (
            <div className="border border-green-400 bg-green-50 text-green-800 rounded-md p-3 text-[13px] space-y-2">
              <h2 className="font-semibold text-[12px] text-green-700 mb-2">
                Power Summary
              </h2>
              {Object.entries(powerByRoom).map(([roomId, { totalPower }]) => {
                const room = rooms.find((r) => r.id === roomId);
                return (
                  <div key={roomId} className="flex justify-between">
                    <span>{room?.name || "Room"}</span>
                    <span>{totalPower} W</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Canvas View */}
      <div className="flex-1 h-full">
        <FloorPreview
          drawingMode={null}
          exitDrawingMode={() => {}}
          roomId={roomType}
          numberOfLights={null}
        />
      </div>
    </div>
  );
};

export default PowerForm;
