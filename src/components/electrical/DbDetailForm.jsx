// import React, { useState } from "react";
// import { ReloadIcon } from "../../icons/ReloadIcon";
// import FloorPreview from "../shared/FloorPreview";

// const DbDetailForm = () => {
//   const [formData, setFormData] = useState({
//     building: "",
//     level: "",
//     area: "",
//     wattage: "",
//     wattageUnit: "Watts",
//     connectedLoad: "",
//     loadUnit: "KW",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleReload = () => {
//     console.log("Reload clicked");
//   };

//   return (
//     <div className="flex h-screen">
//       <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
//         {/* Header */}
//         <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
//           <div>
//             <h1 className="text-[14px] font-semibold text-black leading-none">
//               DB Detail
//             </h1>
//             <p className="text-[11px] text-gray-400 mt-[2px]">No update yet</p>
//           </div>
//           <button
//             className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
//             onClick={handleReload}
//           >
//             <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
//           </button>
//         </div>

//         {/* Building Info */}
//         {/* <p className="text-[11px] text-black mb-1 mt-3">Select Building</p>
//         <select
//           name="building"
//           value={formData.building}
//           onChange={handleChange}
//           className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE] focus:ring-0 mb-3"
//         >
//           <option value="">Select</option>
//           <option value="Metro Station">Metro Station</option>
//         </select> */}

//         {/* <p className="text-[11px] text-black mb-1">Select Level</p>
//         <select
//           name="level"
//           value={formData.level}
//           onChange={handleChange}
//           className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE] focus:ring-0 mb-3"
//         >
//           <option value="">Select</option>
//           <option value="Ground Level">Ground Level</option>
//         </select> */}

//         <p className="text-[11px] text-black mb-1">Select Area</p>
//         <select
//           name="area"
//           value={formData.area}
//           onChange={handleChange}
//           className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE] focus:ring-0 mb-4"
//         >
//           <option value="">Select</option>
//           <option value="BOH">BOH</option>
//         </select>

//         {/* Electrical Details */}
//         <p className="text-[11px] text-black mb-1">Wattage</p>
//         <div className="flex gap-2 mb-3">
//           <input
//             type="number"
//             name="wattage"
//             value={formData.wattage}
//             onChange={handleChange}
//             className="w-1/2 rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
//           />
//           <select
//             name="wattageUnit"
//             value={formData.wattageUnit}
//             onChange={handleChange}
//             className="w-1/2 rounded-md px-2 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
//           >
//             <option>Watts</option>
//             <option>kW</option>
//           </select>
//         </div>

//         <p className="text-[11px] text-black mb-1">Connected Load</p>
//         <div className="flex gap-2">
//           <input
//             type="number"
//             name="connectedLoad"
//             value={formData.connectedLoad}
//             onChange={handleChange}
//             className="w-1/2 rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
//           />
//           <select
//             name="loadUnit"
//             value={formData.loadUnit}
//             onChange={handleChange}
//             className="w-1/2 rounded-md px-2 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
//           >
//             <option>KW</option>
//             <option>MW</option>
//           </select>
//         </div>
//       </div>
//       {/* Right: Floor Preview */}
//       <div className="flex-1 h-full">
//         <FloorPreview />
//       </div>
//     </div>
//   );
// };

// export default DbDetailForm;

// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { ReloadIcon } from "../../icons/ReloadIcon";
// import FloorPreview from "../shared/FloorPreview";

// const DbDetailForm = () => {
//   const lightsByRoom = useSelector((state) => state.lighting.lightsByRoom);
//   const rooms = useSelector((state) => state.rooms);

//   const [dbName, setDbName] = useState("");
//   const [totalDbLoad, setTotalDbLoad] = useState("");
//   const [dbLoadUnit, setDbLoadUnit] = useState("KW");
//   const [dbAdded, setDbAdded] = useState(false);

//   const [areaName, setAreaName] = useState("");
//   const [areaAdded, setAreaAdded] = useState(false);

//   const [selectedRoom, setSelectedRoom] = useState("");
//   const [selectedRooms, setSelectedRooms] = useState([]); // List of added rooms

//   const [showRoomModal, setShowRoomModal] = useState(false);
//   const [modalRoomData, setModalRoomData] = useState({
//     roomId: "",
//     wattagePerLight: "",
//   });

//   const handleReload = () => {
//     console.log("Reload clicked");
//   };

//   const openRoomModal = () => {
//     if (!selectedRoom) return;
//     setModalRoomData({ roomId: selectedRoom, wattagePerLight: "" });
//     setShowRoomModal(true);
//   };

//   const handleModalInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalRoomData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCalculateRoomWattage = () => {
//     const lights = lightsByRoom[modalRoomData.roomId]?.lights || [];
//     const watt = parseFloat(modalRoomData.wattagePerLight) || 0;
//     const totalWatt = watt * lights.length;

//     const roomInfo = rooms.find((r) => r.id === modalRoomData.roomId);

//     setSelectedRooms((prev) => [
//       ...prev,
//       {
//         id: modalRoomData.roomId,
//         name: roomInfo?.name || modalRoomData.roomId,
//         wattagePerLight: watt,
//         totalWattage: totalWatt,
//       },
//     ]);

//     // Clear and close modal
//     setSelectedRoom("");
//     setShowRoomModal(false);
//     setModalRoomData({ roomId: "", wattagePerLight: "" });
//   };

//   return (
//     <div className="flex h-screen">
//       <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
//         {/* Header */}
//         <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
//           <div>
//             <h1 className="text-[14px] font-semibold text-black leading-none">
//               DB Detail
//             </h1>
//             <p className="text-[11px] text-gray-400 mt-[2px]">
//               Multi-room wattage calculator
//             </p>
//           </div>
//           <button
//             className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
//             onClick={handleReload}
//           >
//             <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
//           </button>
//         </div>

//         {/* DB Name & Load */}
//         <p className="text-[11px] text-black mb-1 mt-3">DB Name</p>
//         <input
//           type="text"
//           value={dbName}
//           onChange={(e) => setDbName(e.target.value)}
//           className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-3"
//         />
//         <p className="text-[11px] text-black mb-1">Total DB Load</p>
//         <div className="flex gap-2 mb-3">
//           <input
//             type="number"
//             value={totalDbLoad}
//             onChange={(e) => setTotalDbLoad(e.target.value)}
//             className="w-1/2 border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200"
//           />
//           <select
//             value={dbLoadUnit}
//             onChange={(e) => setDbLoadUnit(e.target.value)}
//             className="w-1/2 border border-gray-200 rounded-md px-2 py-2 text-[13px] bg-gray-200"
//           >
//             <option>W</option>
//             <option>KW</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setDbAdded(true)}
//           className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
//         >
//           Add DB
//         </button>

//         {dbAdded && (
//           <>
//             <p className="text-[11px] text-black mb-1">Area Name</p>
//             <input
//               type="text"
//               value={areaName}
//               onChange={(e) => setAreaName(e.target.value)}
//               className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-3"
//             />
//             <button
//               onClick={() => setAreaAdded(true)}
//               className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
//             >
//               Add Area
//             </button>
//           </>
//         )}

//         {areaAdded && (
//           <>
//             <p className="text-[11px] text-black mb-1">Select Room</p>
//             <select
//               value={selectedRoom}
//               onChange={(e) => setSelectedRoom(e.target.value)}
//               className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-3"
//             >
//               <option value="">Select</option>
//               {rooms.map((room) => (
//                 <option
//                   key={room.id}
//                   value={room.id}
//                   disabled={selectedRooms.some((r) => r.id === room.id)}
//                 >
//                   {room.name}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={openRoomModal}
//               disabled={!selectedRoom}
//               className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
//             >
//               Add Room
//             </button>
//           </>
//         )}

//         {/* List of Added Rooms */}
//         {selectedRooms.length > 0 && (
//           <div>
//             <p className="text-[12px] font-semibold mb-2 text-black">
//               Rooms Added
//             </p>
//             {selectedRooms.map((room) => (
//               <div
//                 key={room.id}
//                 className="border border-gray-300 rounded-md px-3 py-2 mb-2 bg-gray-100"
//               >
//                 <p className="text-[13px] text-black font-semibold">
//                   {room.name}
//                 </p>
//                 <p className="text-[12px]">
//                   Watt/Light: {room.wattagePerLight} W
//                 </p>
//                 <p className="text-[12px]">Total: {room.totalWattage} W</p>
//               </div>
//             ))}

//             {/* Total wattage display */}
//             <div className="mt-3 border-t border-gray-300 pt-2">
//               <p className="text-[13px] font-semibold text-black">
//                 Total Wattage:{" "}
//                 {selectedRooms.reduce(
//                   (sum, room) => sum + room.totalWattage,
//                   0
//                 )}{" "}
//                 W
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Right Side Preview */}
//       <div className="flex-1 h-full">
//         <FloorPreview />
//       </div>

//       {/* Modal */}
//       {showRoomModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white w-[300px] p-4 rounded-lg shadow-lg">
//             <h2 className="text-lg font-semibold mb-3 text-black">
//               Enter Room Details
//             </h2>
//             <p className="text-[13px] mb-1">Room ID: {modalRoomData.roomId}</p>
//             <label className="text-[13px]">Wattage per Light</label>
//             <input
//               type="number"
//               name="wattagePerLight"
//               value={modalRoomData.wattagePerLight}
//               onChange={handleModalInputChange}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] mb-3"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setShowRoomModal(false)}
//                 className="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCalculateRoomWattage}
//                 className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
//               >
//                 Calculate
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DbDetailForm;

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";

const DbDetailForm = () => {
  const lightsByRoom = useSelector((state) => state.lighting.lightsByRoom);
  const rooms = useSelector((state) => state.rooms);

  const [dbName, setDbName] = useState("");
  const [totalDbLoad, setTotalDbLoad] = useState("");
  const [dbLoadUnit, setDbLoadUnit] = useState("KW");
  const [dbAdded, setDbAdded] = useState(false);

  const [areaName, setAreaName] = useState("");
  const [areaAdded, setAreaAdded] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [modalRoomData, setModalRoomData] = useState({
    roomId: "",
    wattagePerLight: "",
  });

  // const [confirmedDb, setConfirmedDb] = useState(null);
  const [confirmedDbs, setConfirmedDbs] = useState([]);

  const handleReload = () => {
    console.log("Reload clicked");
  };

  const openRoomModal = () => {
    if (!selectedRoom) return;
    setModalRoomData({ roomId: selectedRoom, wattagePerLight: "" });
    setShowRoomModal(true);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculateRoomWattage = () => {
    const lights = lightsByRoom[modalRoomData.roomId]?.lights || [];
    const watt = parseFloat(modalRoomData.wattagePerLight) || 0;
    const totalWatt = watt * lights.length;
    const roomInfo = rooms.find((r) => r.id === modalRoomData.roomId);

    setSelectedRooms((prev) => [
      ...prev,
      {
        id: modalRoomData.roomId,
        name: roomInfo?.name || modalRoomData.roomId,
        wattagePerLight: watt,
        totalWattage: totalWatt,
      },
    ]);

    setSelectedRoom("");
    setShowRoomModal(false);
    setModalRoomData({ roomId: "", wattagePerLight: "" });
  };

  // const handleConfirmFinalDb = () => {
  //   const totalWatt = selectedRooms.reduce((sum, r) => sum + r.totalWattage, 0);
  //   const finalData = {
  //     dbName,
  //     totalDbLoad,
  //     dbLoadUnit,
  //     areaName,
  //     rooms: selectedRooms,
  //     totalWattage: totalWatt,
  //   };

  //   setConfirmedDb(finalData);

  //   // Reset for next DB entry
  //   setDbName("");
  //   setTotalDbLoad("");
  //   setDbLoadUnit("KW");
  //   setAreaName("");
  //   setDbAdded(false);
  //   setAreaAdded(false);
  //   setSelectedRooms([]);
  //   setSelectedRoom("");
  // };

  const handleConfirmFinalDb = () => {
    const totalWatt = selectedRooms.reduce((sum, r) => sum + r.totalWattage, 0);
    const finalData = {
      dbName,
      totalDbLoad,
      dbLoadUnit,
      areaName,
      rooms: selectedRooms,
      totalWattage: totalWatt,
    };

    setConfirmedDbs((prev) => [...prev, finalData]);

    // Reset for next DB entry
    setDbName("");
    setTotalDbLoad("");
    setDbLoadUnit("KW");
    setAreaName("");
    setDbAdded(false);
    setAreaAdded(false);
    setSelectedRooms([]);
    setSelectedRoom("");
  };

  return (
    <div className="flex h-screen">
      <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[14px] font-semibold text-black leading-none">
              DB Detail
            </h1>
            <p className="text-[11px] text-gray-400 mt-[2px]">
              Multi-room wattage calculator
            </p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={handleReload}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* ✅ Final Confirmed DB Info Display */}
        {/* {confirmedDb && (
          <div className="mb-4 border border-green-400 bg-green-50 p-3 rounded-md">
            <h2 className="text-[14px] font-semibold text-green-700 mb-2">
              DB Saved
            </h2>
            <p>
              <strong>Name:</strong> {confirmedDb.dbName}
            </p>
            <p>
              <strong>Total Load:</strong> {confirmedDb.totalDbLoad}{" "}
              {confirmedDb.dbLoadUnit}
            </p>
            <p>
              <strong>Total Wattage:</strong> {confirmedDb.totalWattage} W
            </p>
            <p>
              <strong>Area:</strong> {confirmedDb.areaName}
            </p>
            <p>
              <strong>Rooms:</strong>
            </p>
            <ul className="list-disc list-inside ml-2">
              {confirmedDb.rooms.map((room) => (
                <li key={room.id}>{room.name}</li>
              ))}
            </ul>
          </div>
        )} */}

        {/* ✅ Multiple Confirmed DBs Info Display */}
        {confirmedDbs.length > 0 && (
          <div className="space-y-4">
            {confirmedDbs.map((db, idx) => (
              <div
                key={idx}
                className="border border-green-400 bg-green-50 p-3 rounded-md"
              >
                <h2 className="text-[14px] font-semibold text-green-700 mb-2">
                  DB Saved: {db.dbName}
                </h2>
                <p>
                  <strong>Name:</strong> {db.dbName}
                </p>
                <p>
                  <strong>Total Load:</strong> {db.totalDbLoad} {db.dbLoadUnit}
                </p>
                <p>
                  <strong>Total Wattage:</strong> {db.totalWattage} W
                </p>
                <p>
                  <strong>Area:</strong> {db.areaName}
                </p>
                <p>
                  <strong>Rooms:</strong>
                </p>
                <ul className="list-disc list-inside ml-2">
                  {db.rooms.map((room) => (
                    <li key={room.id}>{room.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* DB Form */}
        <p className="text-[11px] text-black mb-1 mt-3">DB Name</p>
        <input
          type="text"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
          className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-3"
        />
        <p className="text-[11px] text-black mb-1">Total DB Load</p>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={totalDbLoad}
            onChange={(e) => setTotalDbLoad(e.target.value)}
            className="w-1/2 border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200"
          />
          <select
            value={dbLoadUnit}
            onChange={(e) => setDbLoadUnit(e.target.value)}
            className="w-1/2 border border-gray-200 rounded-md px-2 py-2 text-[13px] bg-gray-200"
          >
            <option>W</option>
            <option>KW</option>
          </select>
        </div>

        <button
          onClick={() => setDbAdded(true)}
          className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
        >
          Add DB
        </button>

        {dbAdded && (
          <>
            <p className="text-[11px] text-black mb-1">Area Name</p>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-3"
            />
            <button
              onClick={() => setAreaAdded(true)}
              className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
            >
              Add Area
            </button>
          </>
        )}

        {areaAdded && (
          <>
            <p className="text-[11px] text-black mb-1">Select Room</p>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-3"
            >
              <option value="">Select</option>
              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                  disabled={selectedRooms.some((r) => r.id === room.id)}
                >
                  {room.name}
                </option>
              ))}
            </select>
            <button
              onClick={openRoomModal}
              disabled={!selectedRoom}
              className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
            >
              Add Room
            </button>
          </>
        )}

        {selectedRooms.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold mb-2 text-black">
              Rooms Added
            </p>
            {selectedRooms.map((room) => (
              <div
                key={room.id}
                className="border border-gray-300 rounded-md px-3 py-2 mb-2 bg-gray-100"
              >
                <p className="text-[13px] text-black font-semibold">
                  {room.name}
                </p>
                <p className="text-[12px]">
                  Watt/Light: {room.wattagePerLight} W
                </p>
                <p className="text-[12px]">Total: {room.totalWattage} W</p>
              </div>
            ))}
            <div className="mt-3 border-t border-gray-300 pt-2">
              <p className="text-[13px] font-semibold text-black">
                Total Wattage:{" "}
                {selectedRooms.reduce(
                  (sum, room) => sum + room.totalWattage,
                  0
                )}{" "}
                W
              </p>
            </div>

            {/* ✅ Confirm Final DB Button */}
            <button
              onClick={handleConfirmFinalDb}
              disabled={!dbName || !totalDbLoad || !areaName}
              className="mt-3 text-white bg-green-600 hover:bg-green-700 px-3 py-2 text-[13px] rounded-md"
            >
              Confirm Final DB
            </button>
          </div>
        )}
      </div>

      {/* Canvas Side */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[300px] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-black">
              Enter Room Details
            </h2>
            <p className="text-[13px] mb-1">Room ID: {modalRoomData.roomId}</p>
            <label className="text-[13px]">Wattage per Light</label>
            <input
              type="number"
              name="wattagePerLight"
              value={modalRoomData.wattagePerLight}
              onChange={handleModalInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCalculateRoomWattage}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DbDetailForm;
