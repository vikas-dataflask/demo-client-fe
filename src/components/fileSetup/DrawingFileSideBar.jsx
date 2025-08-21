// import React from "react";
// import { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { setScale } from "../../redux/features/app/projectSlice";

// import { ReloadIcon } from "../../icons/ReloadIcon";
// import UploadIcon from "../../icons/UploadIcon";
// import RotationIcon from "../../icons/RotationIcon";

// const DrawingFileSideBar = () => {
//   const dispatch = useDispatch();
//   const [coordinateSystem, setCoordinateSystem] = useState("User defined");
//   const x = useSelector((state) => state.project.floor.x);
//   const y = useSelector((state) => state.project.floor.y);
//   const area = useSelector((state) => state.floorPlan.area);

//   // const selectedScale = useSelector((state) => state.project.scale);

//   const pixelArea = useSelector((state) => state.floorPlan.area); // area in pixel²
//   // const scaleFactor = useSelector((state) => state.project.scaleFactor || 100); // Example: 100 pixels = 1 meter
//   const selectedScale = useSelector((state) => state.project.scale);

//   // Convert pixel² to meter²
//   const areaInMeters = pixelArea ? pixelArea / 10000 : 0;

//   // Convert meter² → selected scale
//   let convertedArea = areaInMeters;
//   let unitLabel = "m²";

//   switch (selectedScale) {
//     case "Inches":
//       convertedArea = areaInMeters * 1550.0031;
//       unitLabel = "in²";
//       break;
//     case "Feet":
//       convertedArea = areaInMeters * 10.7639;
//       unitLabel = "ft²";
//       break;
//     case "Square Yards":
//       convertedArea = areaInMeters * 1.19599;
//       unitLabel = "yd²";
//       break;
//     default:
//       convertedArea = areaInMeters;
//       unitLabel = "m²";
//       break;
//   }

//   const handleScaleChange = (e) => {
//     dispatch(setScale(e.target.value));
//   };

//   return (
//     <div className="w-[340px] h-[90vh] border-r border-gray-300 overflow-y-auto bg-white p-4 text-sm font-medium text-gray-800">
//       {/* Header */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h2 className="text-[14px] font-semibold text-gray-800">
//             Drawing file
//           </h2>
//           <p className="text-[12px] text-gray-400 mt-[2px]">
//             Updated: Just now
//           </p>
//         </div>
//         <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
//           <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
//         </button>
//       </div>

//       {/* Divider */}
//       <hr className="my-4 border-t border-gray-200" />

//       {/* Uploaded File */}
//       <div>
//         <p className="mb-2 text-[13px]">Uploaded file</p>
//         <div className="flex justify-between items-center">
//           <div className="flex items-center bg-gray-200 rounded-lg px-3 py-2 gap-2 w-full mr-2">
//             <img src="src/assets/pdf.png" alt="pdf" className="w-5 h-5" />
//             <span className="text-[13px] text-gray-700">Drawing file 1</span>
//             <ReloadIcon className="w-4 h-4 stroke-gray-500 ml-auto" />
//           </div>
//           <button className="w-[36px] h-[36px] bg-gray-100 rounded-lg flex items-center justify-center">
//             <UploadIcon className="w-4 h-4 stroke-gray-600" />
//           </button>
//         </div>
//       </div>

//       {/* Set Scale */}
//       <div className="mt-6">
//         <p className="mb-2 text-[13px]">Set Scale</p>
//         <select
//           className="w-full bg-gray-200 rounded-lg px-3 py-2 text-gray-700 text-[13px] outline-none"
//           value={selectedScale}
//           onChange={handleScaleChange}
//         >
//           <option value="Meter">Meter</option>
//           <option value="Inches">Inches</option>
//           <option value="Feet">Feet</option>
//           <option value="Square Yards">Square Yards</option>
//         </select>
//       </div>

//       {/* Positioning Section */}
//       <div className="mt-6">
//         <p className="mb-2 text-[13px]">Positioning</p>
//         <div className="border border-gray-200 rounded-lg p-3 space-y-3">
//           {/* Coordinate system */}
//           <div>
//             <p className="mb-1 text-[13px]">Coordinate system</p>
//             <select className="w-full bg-gray-200 rounded-md px-3 py-2 text-gray-700 text-[13px] outline-none">
//               <option>{coordinateSystem}</option>
//             </select>
//           </div>

//           {/* Position */}
//           <div>
//             <p className="mb-1 text-[13px]">Position</p>
//             <div className="flex gap-2">
//               {/* X */}
//               <div className="relative w-1/2">
//                 <img
//                   src="src/assets/X.svg"
//                   alt="X"
//                   className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
//                 />
//                 <input
//                   type="text"
//                   value={x.toFixed(2)}
//                   className="w-full bg-gray-200 rounded-md pl-7 pr-2 py-2 text-[13px] text-gray-500"
//                 />
//               </div>
//               {/* Y */}
//               <div className="relative w-1/2">
//                 <img
//                   src="src/assets/Y.svg"
//                   alt="Y"
//                   className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
//                 />
//                 <input
//                   type="text"
//                   value={y.toFixed(2)}
//                   className="w-full bg-gray-200 rounded-md pl-7 pr-2 py-2 text-[13px] text-gray-500"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Area */}
//           <div>
//             <p className="mb-1 text-[13px]">Area</p>
//             <div className="flex items-center gap-2 bg-gray-200 rounded-md px-3 py-2 text-gray-500">
//               {/* <RotationIcon className="w-4 h-4" /> */}
//               <span className="text-[13px]">
//                 <span className="text-[13px]">
//                   {convertedArea.toFixed(2)} {unitLabel}
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Layer Checkboxes */}
//       <div className="mt-6 space-y-2 text-[13px]">
//         <p className="mb-1">Layer</p>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked readOnly className="accent-blue-600" />
//           <span>Window</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked readOnly className="accent-blue-600" />
//           <span>Door</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked readOnly className="accent-blue-600" />
//           <span>Wall</span>
//         </label>
//       </div>
//     </div>
//   );
// };

// export default DrawingFileSideBar;
