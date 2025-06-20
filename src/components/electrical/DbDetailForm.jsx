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
//   const [selectedRooms, setSelectedRooms] = useState([]);

//   const [showRoomModal, setShowRoomModal] = useState(false);
//   const [modalRoomData, setModalRoomData] = useState({
//     roomId: "",
//     wattagePerLight: "",
//   });

//   // const [confirmedDb, setConfirmedDb] = useState(null);
//   const [confirmedDbs, setConfirmedDbs] = useState([]);

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

//     setSelectedRoom("");
//     setShowRoomModal(false);
//     setModalRoomData({ roomId: "", wattagePerLight: "" });
//   };

//   const handleConfirmFinalDb = () => {
//     const totalWatt = selectedRooms.reduce((sum, r) => sum + r.totalWattage, 0);
//     const finalData = {
//       dbName,
//       totalDbLoad,
//       dbLoadUnit,
//       areaName,
//       rooms: selectedRooms,
//       totalWattage: totalWatt,
//     };

//     setConfirmedDbs((prev) => [...prev, finalData]);

//     // Reset for next DB entry
//     setDbName("");
//     setTotalDbLoad("");
//     setDbLoadUnit("KW");
//     setAreaName("");
//     setDbAdded(false);
//     setAreaAdded(false);
//     setSelectedRooms([]);
//     setSelectedRoom("");
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

//         {/* ✅ Multiple Confirmed DBs Info Display */}
//         {confirmedDbs.length > 0 && (
//           <div className="space-y-4">
//             {confirmedDbs.map((db, idx) => (
//               <div
//                 key={idx}
//                 className="border border-green-400 bg-green-50 p-3 rounded-md"
//               >
//                 <h2 className="text-[14px] font-semibold text-green-700 mb-2">
//                   DB Saved: {db.dbName}
//                 </h2>
//                 <p>
//                   <strong>Name:</strong> {db.dbName}
//                 </p>
//                 <p>
//                   <strong>Total Load:</strong> {db.totalDbLoad} {db.dbLoadUnit}
//                 </p>
//                 <p>
//                   <strong>Total Wattage:</strong> {db.totalWattage} W
//                 </p>
//                 <p>
//                   <strong>Area:</strong> {db.areaName}
//                 </p>
//                 <p>
//                   <strong>Rooms:</strong>
//                 </p>
//                 <ul className="list-disc list-inside ml-2">
//                   {db.rooms.map((room) => (
//                     <li key={room.id}>{room.name}</li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* DB Form */}
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

//             {/* ✅ Confirm Final DB Button */}
//             <button
//               onClick={handleConfirmFinalDb}
//               disabled={!dbName || !totalDbLoad || !areaName}
//               className="mt-3 text-white bg-green-600 hover:bg-green-700 px-3 py-2 text-[13px] rounded-md"
//             >
//               Confirm Final DB
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Canvas Side */}
//       <div className="flex-1 h-full">
//         <FloorPreview />
//       </div>

//       {/* Room Modal */}
//       {showRoomModal && (
//         <div className="fixed inset-0 bg-transparent bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white w-[500px] p-4 rounded-lg shadow-lg">
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
//   const [selectedRooms, setSelectedRooms] = useState([]);

//   const [showRoomModal, setShowRoomModal] = useState(false);
//   const [modalRoomData, setModalRoomData] = useState({
//     roomId: "",
//     wattagePerLight: "",
//   });

//   const [confirmedDbs, setConfirmedDbs] = useState([]);
//   const [errors, setErrors] = useState({});

//   const handleReload = () => {
//     console.log("Reload clicked");
//   };

//   const openRoomModal = () => {
//     if (!selectedRoom) {
//       setErrors((prev) => ({ ...prev, selectedRoom: "Please select a room" }));
//       return;
//     }
//     setModalRoomData({ roomId: selectedRoom, wattagePerLight: "" });
//     setShowRoomModal(true);
//   };

//   const handleModalInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalRoomData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCalculateRoomWattage = () => {
//     if (!modalRoomData.wattagePerLight) {
//       setErrors((prev) => ({
//         ...prev,
//         wattagePerLight: "Wattage per light is required",
//       }));
//       return;
//     }

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

//     setSelectedRoom("");
//     setShowRoomModal(false);
//     setModalRoomData({ roomId: "", wattagePerLight: "" });
//     setErrors((prev) => ({ ...prev, wattagePerLight: "" }));
//   };

//   const handleConfirmFinalDb = () => {
//     const newErrors = {};
//     if (!dbName.trim()) newErrors.dbName = "DB Name is required";
//     if (!totalDbLoad) newErrors.totalDbLoad = "Total DB Load is required";
//     if (!areaName.trim()) newErrors.areaName = "Area Name is required";
//     if (selectedRooms.length === 0)
//       newErrors.rooms = "At least one room must be added";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     const totalWatt = selectedRooms.reduce((sum, r) => sum + r.totalWattage, 0);
//     const finalData = {
//       dbName,
//       totalDbLoad,
//       dbLoadUnit,
//       areaName,
//       rooms: selectedRooms,
//       totalWattage: totalWatt,
//     };

//     setConfirmedDbs((prev) => [...prev, finalData]);

//     // Reset all
//     setDbName("");
//     setTotalDbLoad("");
//     setDbLoadUnit("KW");
//     setAreaName("");
//     setDbAdded(false);
//     setAreaAdded(false);
//     setSelectedRooms([]);
//     setSelectedRoom("");
//     setErrors({});
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
//         {/* Confirmed DBs */}
//         {confirmedDbs.length > 0 && (
//           <div className="space-y-4 mt-4">
//             {confirmedDbs.map((db, idx) => (
//               <div
//                 key={idx}
//                 className="border border-green-400 bg-green-50 p-3 rounded-md"
//               >
//                 <h2 className="text-[14px] font-semibold text-green-700 mb-2">
//                   DB Saved: {db.dbName}
//                 </h2>
//                 <p>
//                   <strong>Name:</strong> {db.dbName}
//                 </p>
//                 <p>
//                   <strong>Total Load:</strong> {db.totalDbLoad} {db.dbLoadUnit}
//                 </p>
//                 <p>
//                   <strong>Total Wattage:</strong> {db.totalWattage} W
//                 </p>
//                 <p>
//                   <strong>Area:</strong> {db.areaName}
//                 </p>
//                 <p>
//                   <strong>Rooms:</strong>
//                 </p>
//                 <ul className="list-disc list-inside ml-2">
//                   {db.rooms.map((room) => (
//                     <li key={room.id}>{room.name}</li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         )}
//         {/* DB Name */} Lighting
//         <p className="text-[11px] text-black mb-1 mt-3">DB Name</p>
//         <input
//           type="text"
//           value={dbName}
//           onChange={(e) => {
//             setDbName(e.target.value);
//             setErrors((prev) => ({ ...prev, dbName: "" }));
//           }}
//           className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
//         />
//         {errors.dbName && (
//           <p className="text-red-500 text-[11px] mb-2">{errors.dbName}</p>
//         )}
//         {/* Total Load */}
//         <p className="text-[11px] text-black mb-1">Total DB Load</p>
//         <div className="flex gap-2 mb-1">
//           <input
//             type="number"
//             value={totalDbLoad}
//             onChange={(e) => {
//               setTotalDbLoad(e.target.value);
//               setErrors((prev) => ({ ...prev, totalDbLoad: "" }));
//             }}
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
//         {errors.totalDbLoad && (
//           <p className="text-red-500 text-[11px] mb-2">{errors.totalDbLoad}</p>
//         )}
//         <button
//           onClick={() => {
//             const errorsObj = {};
//             if (!dbName.trim()) errorsObj.dbName = "DB Name is required";
//             if (!totalDbLoad)
//               errorsObj.totalDbLoad = "Total DB Load is required";
//             if (Object.keys(errorsObj).length > 0) {
//               setErrors((prev) => ({ ...prev, ...errorsObj }));
//               return;
//             }
//             setDbAdded(true);
//           }}
//           className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
//         >
//           Add DB
//         </button>
//         {/* Area Input */}
//         {dbAdded && (
//           <>
//             <p className="text-[11px] text-black mb-1">Area Name</p>
//             <input
//               type="text"
//               value={areaName}
//               onChange={(e) => {
//                 setAreaName(e.target.value);
//                 setErrors((prev) => ({ ...prev, areaName: "" }));
//               }}
//               className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
//             />
//             {errors.areaName && (
//               <p className="text-red-500 text-[11px] mb-2">{errors.areaName}</p>
//             )}
//             <button
//               onClick={() => {
//                 if (!areaName.trim()) {
//                   setErrors((prev) => ({
//                     ...prev,
//                     areaName: "Area Name is required",
//                   }));
//                   return;
//                 }
//                 setAreaAdded(true);
//               }}
//               className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
//             >
//               Add Area
//             </button>
//           </>
//         )}
//         {/* Room Selection */}
//         {areaAdded && (
//           <>
//             <p className="text-[11px] text-black mb-1">Select Room</p>
//             <select
//               value={selectedRoom}
//               onChange={(e) => {
//                 setSelectedRoom(e.target.value);
//                 setErrors((prev) => ({ ...prev, selectedRoom: "" }));
//               }}
//               className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
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
//             {errors.selectedRoom && (
//               <p className="text-red-500 text-[11px] mb-2">
//                 {errors.selectedRoom}
//               </p>
//             )}
//             <button
//               onClick={() => {
//                 if (!selectedRoom) {
//                   setErrors((prev) => ({
//                     ...prev,
//                     selectedRoom: "Please select a room",
//                   }));
//                   return;
//                 }
//                 openRoomModal();
//               }}
//               disabled={!selectedRoom}
//               className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
//             >
//               Add Room
//             </button>
//           </>
//         )}
//         {/* Rooms Display */}
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
//             <div className="mt-3 border-t border-gray-300 pt-2">
//               <p className="text-[13px] font-semibold text-black">
//                 Total Wattage:{" "}
//                 {selectedRooms.reduce(
//                   (sum, room) => sum + room.totalWattage,
//                   0
//                 )}{" "}
//                 W
//               </p>
//               {errors.rooms && (
//                 <p className="text-red-500 text-[11px] mt-1">{errors.rooms}</p>
//               )}
//             </div>
//             <button
//               onClick={handleConfirmFinalDb}
//               className="mt-3 text-white bg-green-600 hover:bg-green-700 px-3 py-2 text-[13px] rounded-md"
//             >
//               Confirm Final DB
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Canvas Side */}
//       <div className="flex-1 h-full">
//         <FloorPreview />
//       </div>

//       {/* Room Modal */}
//       {showRoomModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white w-[500px] p-4 rounded-lg shadow-lg">
//             <h2 className="text-lg font-semibold mb-3 text-black">
//               Enter Room Details
//             </h2>
//             <p className="text-[13px] mb-1">Room ID: {modalRoomData.roomId}</p>
//             <label className="text-[13px]">Wattage per Light</label>
//             <input
//               type="number"
//               name="wattagePerLight"
//               value={modalRoomData.wattagePerLight}
//               onChange={(e) => {
//                 handleModalInputChange(e);
//                 setErrors((prev) => ({ ...prev, wattagePerLight: "" }));
//               }}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] mb-1"
//             />
//             {errors.wattagePerLight && (
//               <p className="text-red-500 text-[12px] mb-2">
//                 {errors.wattagePerLight}
//               </p>
//             )}
//             <div className="flex justify-end gap-2 mt-2">
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
import { useMemo } from "react";

const DbDetailForm = () => {
  const lightsByRoom = useSelector((state) => state.lighting.lightsByRoom);
  const rooms = useSelector((state) => state.rooms);
  const powerByRoom = useSelector((state) => state.power.powerByRoom);

  // ----- Lighting States -----
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

  // const [confirmedDbs, setConfirmedDbs] = useState([]);
  const [confirmedDbs, setConfirmedDbs] = useState(() => {
    try {
      const saved = localStorage.getItem("confirmedLightingDbs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [errors, setErrors] = useState({});

  // ----- Power States -----
  const [powerDbName, setPowerDbName] = useState("");
  const [powerTotalDbLoad, setPowerTotalDbLoad] = useState("");
  const [powerDbLoadUnit, setPowerDbLoadUnit] = useState("KW");
  const [powerDbAdded, setPowerDbAdded] = useState(false);

  const [powerAreaName, setPowerAreaName] = useState("");
  const [powerAreaAdded, setPowerAreaAdded] = useState(false);

  const [powerSelectedRoom, setPowerSelectedRoom] = useState("");
  const [powerSelectedRooms, setPowerSelectedRooms] = useState([]);

  const [powerShowRoomModal, setPowerShowRoomModal] = useState(false);
  const [powerModalRoomData, setPowerModalRoomData] = useState({
    roomId: "",
    wattagePerLight: "",
  });

  // const [confirmedPowerDbs, setConfirmedPowerDbs] = useState([]);
  const [confirmedPowerDbs, setConfirmedPowerDbs] = useState(() => {
    try {
      const saved = localStorage.getItem("confirmedPowerDbs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [powerErrors, setPowerErrors] = useState({});

  const connectedLoad = useMemo(() => {
    const lightingTotal = confirmedDbs.reduce(
      (sum, db) => sum + (db.totalWattage || 0),
      0
    );
    const powerTotal = confirmedPowerDbs.reduce(
      (sum, db) => sum + (db.totalWattage || 0),
      0
    );
    return lightingTotal + powerTotal;
  }, [confirmedDbs, confirmedPowerDbs]);

  const handleReload = () => {
    console.log("Reload clicked");
  };

  // Lighting handlers
  const openRoomModal = () => {
    if (!selectedRoom) {
      setErrors((prev) => ({ ...prev, selectedRoom: "Please select a room" }));
      return;
    }
    setModalRoomData({ roomId: selectedRoom, wattagePerLight: "" });
    setShowRoomModal(true);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculateRoomWattage = () => {
    if (!modalRoomData.wattagePerLight) {
      setErrors((prev) => ({
        ...prev,
        wattagePerLight: "Wattage per light is required",
      }));
      return;
    }

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
    setErrors((prev) => ({ ...prev, wattagePerLight: "" }));
  };

  const handleConfirmFinalDb = () => {
    const newErrors = {};
    if (!dbName.trim()) newErrors.dbName = "DB Name is required";
    if (!totalDbLoad) newErrors.totalDbLoad = "Total DB Load is required";
    if (!areaName.trim()) newErrors.areaName = "Area Name is required";
    if (selectedRooms.length === 0)
      newErrors.rooms = "At least one room must be added";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const totalWatt = selectedRooms.reduce((sum, r) => sum + r.totalWattage, 0);
    const finalData = {
      dbName,
      totalDbLoad,
      dbLoadUnit,
      areaName,
      rooms: selectedRooms,
      totalWattage: totalWatt,
    };

    // setConfirmedDbs((prev) => [...prev, finalData]);

    setConfirmedDbs((prev) => {
      const updated = [...prev, finalData];
      localStorage.setItem("confirmedLightingDbs", JSON.stringify(updated));
      return updated;
    });

    // Reset all
    setDbName("");
    setTotalDbLoad("");
    setDbLoadUnit("KW");
    setAreaName("");
    setDbAdded(false);
    setAreaAdded(false);
    setSelectedRooms([]);
    setSelectedRoom("");
    setErrors({});
  };

  // Power handlers
  // const openPowerRoomModal = () => {
  //   if (!powerSelectedRoom) {
  //     setPowerErrors((prev) => ({
  //       ...prev,
  //       selectedRoom: "Please select a room",
  //     }));
  //     return;
  //   }
  //   setPowerModalRoomData({ roomId: powerSelectedRoom, wattagePerLight: "" });
  //   setPowerShowRoomModal(true);
  // };

  const handlePowerModalInputChange = (e) => {
    const { name, value } = e.target;
    setPowerModalRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculatePowerRoomWattage = () => {
    if (!powerModalRoomData.wattagePerLight) {
      setPowerErrors((prev) => ({
        ...prev,
        wattagePerLight: "Wattage per light is required",
      }));
      return;
    }

    const lights = lightsByRoom[powerModalRoomData.roomId]?.lights || [];
    const watt = parseFloat(powerModalRoomData.wattagePerLight) || 0;
    const totalWatt = watt * lights.length;
    const roomInfo = rooms.find((r) => r.id === powerModalRoomData.roomId);

    setPowerSelectedRooms((prev) => [
      ...prev,
      {
        id: powerModalRoomData.roomId,
        name: roomInfo?.name || powerModalRoomData.roomId,
        wattagePerLight: watt,
        totalWattage: totalWatt,
      },
    ]);

    setPowerSelectedRoom("");
    setPowerShowRoomModal(false);
    setPowerModalRoomData({ roomId: "", wattagePerLight: "" });
    setPowerErrors((prev) => ({ ...prev, wattagePerLight: "" }));
  };

  const handleConfirmFinalPowerDb = () => {
    const newErrors = {};
    if (!powerDbName.trim()) newErrors.dbName = "DB Name is required";
    if (!powerTotalDbLoad) newErrors.totalDbLoad = "Total DB Load is required";
    if (!powerAreaName.trim()) newErrors.areaName = "Area Name is required";
    if (powerSelectedRooms.length === 0)
      newErrors.rooms = "At least one room must be added";

    if (Object.keys(newErrors).length > 0) {
      setPowerErrors(newErrors);
      return;
    }

    const totalWatt = powerSelectedRooms.reduce(
      (sum, r) => sum + r.totalWattage,
      0
    );
    const finalData = {
      dbName: powerDbName,
      totalDbLoad: powerTotalDbLoad,
      dbLoadUnit: powerDbLoadUnit,
      areaName: powerAreaName,
      rooms: powerSelectedRooms,
      totalWattage: totalWatt,
    };

    // setConfirmedPowerDbs((prev) => [...prev, finalData]);

    setConfirmedPowerDbs((prev) => {
      const updated = [...prev, finalData];
      localStorage.setItem("confirmedPowerDbs", JSON.stringify(updated));
      return updated;
    });

    // Reset all
    setPowerDbName("");
    setPowerTotalDbLoad("");
    setPowerDbLoadUnit("KW");
    setPowerAreaName("");
    setPowerDbAdded(false);
    setPowerAreaAdded(false);
    setPowerSelectedRooms([]);
    setPowerSelectedRoom("");
    setPowerErrors({});
  };

  return (
    <div className="flex h-screen">
      {/* Lighting Section */}
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
            type="button"
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>
        {/* Confirmed DBs */}
        {confirmedDbs.length > 0 && (
          <div className="space-y-4 mt-4">
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
        {confirmedPowerDbs.length > 0 && (
          <div className="space-y-4 mt-4">
            {confirmedPowerDbs.map((db, idx) => (
              <div
                key={idx}
                className="border border-green-400 bg-green-50 p-3 rounded-md"
              >
                <h2 className="text-[14px] font-semibold text-green-700 mb-2">
                  Power DB Saved: {db.dbName}
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
        {(confirmedDbs.length > 0 || confirmedPowerDbs.length > 0) && (
          <div className="mt-4 border border-blue-400 bg-blue-50 p-3 rounded-md">
            <h2 className="text-[14px] font-semibold text-blue-700 mb-1">
              Connected Load Summary
            </h2>
            <p className="text-[13px] text-black">
              <strong>Total Connected Load:</strong> {connectedLoad} W
            </p>
          </div>
        )}
        {/* DB Name */} Lighting
        <p className="text-[11px] text-black mb-1 mt-3">DB Name</p>
        <input
          type="text"
          value={dbName}
          onChange={(e) => {
            setDbName(e.target.value);
            setErrors((prev) => ({ ...prev, dbName: "" }));
          }}
          className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
          aria-label="DB Name input"
        />
        {errors.dbName && (
          <p className="text-red-500 text-[11px] mb-2">{errors.dbName}</p>
        )}
        {/* Total Load */}
        <p className="text-[11px] text-black mb-1">Total DB Load</p>
        <div className="flex gap-2 mb-1">
          <input
            type="number"
            value={totalDbLoad}
            onChange={(e) => {
              setTotalDbLoad(e.target.value);
              setErrors((prev) => ({ ...prev, totalDbLoad: "" }));
            }}
            className="w-1/2 border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200"
            aria-label="Total DB Load input"
          />
          <select
            value={dbLoadUnit}
            onChange={(e) => setDbLoadUnit(e.target.value)}
            className="w-1/2 border border-gray-200 rounded-md px-2 py-2 text-[13px] bg-gray-200"
            aria-label="DB Load Unit select"
          >
            <option>W</option>
            <option>KW</option>
          </select>
        </div>
        {errors.totalDbLoad && (
          <p className="text-red-500 text-[11px] mb-2">{errors.totalDbLoad}</p>
        )}
        <button
          onClick={() => {
            const errorsObj = {};
            if (!dbName.trim()) errorsObj.dbName = "DB Name is required";
            if (!totalDbLoad)
              errorsObj.totalDbLoad = "Total DB Load is required";
            if (Object.keys(errorsObj).length > 0) {
              setErrors((prev) => ({ ...prev, ...errorsObj }));
              return;
            }
            setDbAdded(true);
          }}
          className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
          type="button"
        >
          Add DB
        </button>
        {/* Area Input */}
        {dbAdded && (
          <>
            <p className="text-[11px] text-black mb-1">Area Name</p>
            <input
              type="text"
              value={areaName}
              onChange={(e) => {
                setAreaName(e.target.value);
                setErrors((prev) => ({ ...prev, areaName: "" }));
              }}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
              aria-label="Area Name input"
            />
            {errors.areaName && (
              <p className="text-red-500 text-[11px] mb-2">{errors.areaName}</p>
            )}
            <button
              onClick={() => {
                if (!areaName.trim()) {
                  setErrors((prev) => ({
                    ...prev,
                    areaName: "Area Name is required",
                  }));
                  return;
                }
                setAreaAdded(true);
              }}
              className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
              type="button"
            >
              Add Area
            </button>
          </>
        )}
        {/* Room Selection */}
        {areaAdded && (
          <>
            <p className="text-[11px] text-black mb-1">Select Room</p>
            <select
              value={selectedRoom}
              onChange={(e) => {
                setSelectedRoom(e.target.value);
                setErrors((prev) => ({ ...prev, selectedRoom: "" }));
              }}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
              aria-label="Select Room for Lighting"
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
            {errors.selectedRoom && (
              <p className="text-red-500 text-[11px] mb-2">
                {errors.selectedRoom}
              </p>
            )}
            <button
              onClick={() => {
                if (!selectedRoom) {
                  setErrors((prev) => ({
                    ...prev,
                    selectedRoom: "Please select a room",
                  }));
                  return;
                }
                openRoomModal();
              }}
              disabled={!selectedRoom}
              className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
              type="button"
            >
              Add Room
            </button>
          </>
        )}
        {/* Rooms Display */}
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
              {errors.rooms && (
                <p className="text-red-500 text-[11px] mt-1">{errors.rooms}</p>
              )}
            </div>
            <button
              onClick={handleConfirmFinalDb}
              className="mt-3 text-white bg-green-600 hover:bg-green-700 px-3 py-2 text-[13px] rounded-md"
              type="button"
            >
              Confirm Final DB
            </button>
          </div>
        )}
        {/* Power Section */}
        {/* Confirmed Power DBs */}
        <div className=" border-t border-gray-300">
          {" "}
          Power
          {/* Power DB Name */}
          <p className="text-[11px] text-black mb-1 mt-3">Power DB Name</p>
          <input
            type="text"
            value={powerDbName}
            onChange={(e) => {
              setPowerDbName(e.target.value);
              setPowerErrors((prev) => ({ ...prev, dbName: "" }));
            }}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
            aria-label="Power DB Name input"
          />
          {powerErrors.dbName && (
            <p className="text-red-500 text-[11px] mb-2">
              {powerErrors.dbName}
            </p>
          )}
          {/* Power Total Load */}
          <p className="text-[11px] text-black mb-1">Total Power DB Load</p>
          <div className="flex gap-2 mb-1">
            <input
              type="number"
              value={powerTotalDbLoad}
              onChange={(e) => {
                setPowerTotalDbLoad(e.target.value);
                setPowerErrors((prev) => ({ ...prev, totalDbLoad: "" }));
              }}
              className="w-1/2 border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200"
              aria-label="Total Power DB Load input"
            />
            <select
              value={powerDbLoadUnit}
              onChange={(e) => setPowerDbLoadUnit(e.target.value)}
              className="w-1/2 border border-gray-200 rounded-md px-2 py-2 text-[13px] bg-gray-200"
              aria-label="Power DB Load Unit select"
            >
              <option>W</option>
              <option>KW</option>
            </select>
          </div>
          {powerErrors.totalDbLoad && (
            <p className="text-red-500 text-[11px] mb-2">
              {powerErrors.totalDbLoad}
            </p>
          )}
          <button
            onClick={() => {
              const errorsObj = {};
              if (!powerDbName.trim()) errorsObj.dbName = "DB Name is required";
              if (!powerTotalDbLoad)
                errorsObj.totalDbLoad = "Total DB Load is required";
              if (Object.keys(errorsObj).length > 0) {
                setPowerErrors((prev) => ({ ...prev, ...errorsObj }));
                return;
              }
              setPowerDbAdded(true);
            }}
            className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
            type="button"
          >
            Add DB
          </button>
          {/* Power Area Input */}
          {powerDbAdded && (
            <>
              <p className="text-[11px] text-black mb-1">Area Name</p>
              <input
                type="text"
                value={powerAreaName}
                onChange={(e) => {
                  setPowerAreaName(e.target.value);
                  setPowerErrors((prev) => ({ ...prev, areaName: "" }));
                }}
                className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
                aria-label="Power Area Name input"
              />
              {powerErrors.areaName && (
                <p className="text-red-500 text-[11px] mb-2">
                  {powerErrors.areaName}
                </p>
              )}
              <button
                onClick={() => {
                  if (!powerAreaName.trim()) {
                    setPowerErrors((prev) => ({
                      ...prev,
                      areaName: "Area Name is required",
                    }));
                    return;
                  }
                  setPowerAreaAdded(true);
                }}
                className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
                type="button"
              >
                Add Area
              </button>
            </>
          )}
          {/* Power Room Selection */}
          {powerAreaAdded && (
            <>
              <p className="text-[11px] text-black mb-1">Select Room</p>
              <select
                value={powerSelectedRoom}
                onChange={(e) => {
                  setPowerSelectedRoom(e.target.value);
                  setPowerErrors((prev) => ({ ...prev, selectedRoom: "" }));
                }}
                className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] bg-gray-200 mb-1"
                aria-label="Select Room for Power"
              >
                <option value="">Select</option>
                {rooms.map((room) => (
                  <option
                    key={room.id}
                    value={room.id}
                    disabled={powerSelectedRooms.some((r) => r.id === room.id)}
                  >
                    {room.name}
                  </option>
                ))}
              </select>
              {powerErrors.selectedRoom && (
                <p className="text-red-500 text-[11px] mb-2">
                  {powerErrors.selectedRoom}
                </p>
              )}
              <button
                onClick={() => {
                  if (!powerSelectedRoom) {
                    setPowerErrors((prev) => ({
                      ...prev,
                      selectedRoom: "Please select a room",
                    }));
                    return;
                  }

                  const powerData = powerByRoom[powerSelectedRoom];
                  if (!powerData) {
                    alert("Power data not available for the selected room.");
                    return;
                  }

                  const roomInfo = rooms.find(
                    (r) => r.id === powerSelectedRoom
                  );
                  setPowerSelectedRooms((prev) => [
                    ...prev,
                    {
                      id: powerSelectedRoom,
                      name: roomInfo?.name || powerSelectedRoom,
                      wattagePerLight: powerData.powerPerButton,
                      totalWattage: powerData.totalPower,
                    },
                  ]);

                  setPowerSelectedRoom("");
                }}
                disabled={!powerSelectedRoom}
                className="text-white bg-[#0083EE] hover:bg-[#1C78DC] px-3 py-2 text-[13px] rounded-md mb-4"
                type="button"
              >
                Add Room
              </button>
            </>
          )}
          {/* Power Rooms Display */}
          {powerSelectedRooms.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold mb-2 text-black">
                Rooms Added
              </p>
              {powerSelectedRooms.map((room) => (
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
                  {powerSelectedRooms.reduce(
                    (sum, room) => sum + room.totalWattage,
                    0
                  )}{" "}
                  W
                </p>
                {powerErrors.rooms && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {powerErrors.rooms}
                  </p>
                )}
              </div>
              <button
                onClick={handleConfirmFinalPowerDb}
                className="mt-3 text-white bg-green-600 hover:bg-green-700 px-3 py-2 text-[13px] rounded-md"
                type="button"
              >
                Confirm Final DB
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Canvas Side */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
      {/* Lighting Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-black">
              Enter Room Details
            </h2>
            <p className="text-[13px] mb-1">Room ID: {modalRoomData.roomId}</p>
            <label className="text-[13px]">Wattage per Light</label>
            <input
              type="number"
              name="wattagePerLight"
              value={modalRoomData.wattagePerLight}
              onChange={(e) => {
                handleModalInputChange(e);
                setErrors((prev) => ({ ...prev, wattagePerLight: "" }));
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] mb-1"
              aria-label="Wattage per Light Input"
            />
            {errors.wattagePerLight && (
              <p className="text-red-500 text-[12px] mb-2">
                {errors.wattagePerLight}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCalculateRoomWattage}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                type="button"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Power Room Modal */}
      {powerShowRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-black">
              Enter Room Details
            </h2>
            <p className="text-[13px] mb-1">
              Room ID: {powerModalRoomData.roomId}
            </p>
            <label className="text-[13px]">Wattage per Light</label>
            <input
              type="number"
              name="wattagePerLight"
              value={powerModalRoomData.wattagePerLight}
              onChange={(e) => {
                handlePowerModalInputChange(e);
                setPowerErrors((prev) => ({ ...prev, wattagePerLight: "" }));
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] mb-1"
              aria-label="Power Wattage per Light Input"
            />
            {powerErrors.wattagePerLight && (
              <p className="text-red-500 text-[12px] mb-2">
                {powerErrors.wattagePerLight}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setPowerShowRoomModal(false)}
                className="px-3 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCalculatePowerRoomWattage}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                type="button"
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
