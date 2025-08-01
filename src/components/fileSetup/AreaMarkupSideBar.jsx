import React, { useState } from "react";
import { useSelector } from "react-redux";

import { ReloadIcon } from "../../icons/ReloadIcon";
import PlusIcon from "../../icons/PlusIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import CircleIcon from "../../icons/CircleIcon";
import PolygonalIcon from "../../icons/PolygonalIcon";
import RightModal from "./RightModal";

const GRID_SIZE = 30; // Match the scale system from RoomEditorWithZoom.jsx

const AreaMarkupSidebar = () => {
  const [selectedShape, setSelectedShape] = useState("square");
  // const [buildingName, setBuildingName] = useState("Building 1");
  const [storeys, setStoreys] = useState("10");
  const [height, setHeight] = useState("30");
  const [unit, setUnit] = useState("Unit");
  const [selectedFloorId, setSelectedFloorId] = useState("");

  const rooms = useSelector((state) => state.rooms);
  const floors = useSelector((state) => state.floor.floors);
  const selectedScale = useSelector((state) => state.project.scale);

  // Convert pixels to logical units (meters)
  const convertToLogicalUnits = (pixels) => {
    return pixels / GRID_SIZE;
  };

  // Convert area to the selected scale
  const convertArea = (pixelArea) => {
    const areaInLogicalUnits = pixelArea / (GRID_SIZE * GRID_SIZE);
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

  // Get the appropriate unit label based on selected scale
  const getUnitLabel = () => {
    switch (selectedScale) {
      case "Inches":
        return "in";
      case "Feet":
        return "ft";
      case "Square Yards":
        return "yd";
      default:
        return "m";
    }
  };

  // State for modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="w-[340px] bg-white p-[16px] border-r border-gray-300 text-sm font-medium s relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[#222222] font-semibold text-[14px] leading-[18px]">
            Area markup
          </h2>
          <p className="text-[11px] text-[#A0A0A0] mt-[2px]">
            Updated: Just now
          </p>
        </div>
        <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
          <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
        </button>
      </div>

      <hr className="my-[16px] border-gray-200" />

      {/* Add building */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Floor
        </label>
        <select
          className="mt-1 block w-full h-[35px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={selectedFloorId}
          onChange={(e) => setSelectedFloorId(e.target.value)}
        >
          <option value="">-- Select Floor --</option>
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.name}
            </option>
          ))}
        </select>
      </div>

      {/* Draw Building Rooms */}
      <p className="text-[#333333] text-[13px] mb-[6px]">Draw Building rooms</p>
      <div className="flex gap-[6px] mb-[16px]">
        <button
          className={`flex-1 h-[36px] border rounded-[8px] flex items-center justify-center transition ${
            selectedShape === "square"
              ? "bg-[#0083EE] text-white border-[#0083EE]"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
          onClick={() => setSelectedShape("square")}
        >
          <ReactangleIcon className="w-[16px] h-[16px]" />
        </button>
        <button
          className={`flex-1 h-[36px] border rounded-[8px] flex items-center justify-center transition ${
            selectedShape === "circle"
              ? "bg-[#0083EE] text-white border-[#0083EE]"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
          onClick={() => setSelectedShape("circle")}
        >
          <CircleIcon className="w-[16px] h-[16px]" />
        </button>
        <button
          className={`flex-1 h-[36px] border rounded-[8px] flex items-center justify-center transition ${
            selectedShape === "hex"
              ? "bg-[#0083EE] text-white border-[#0083EE]"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }`}
          onClick={() => setSelectedShape("hex")}
        >
          <PolygonalIcon className="w-[16px] h-[16px]" />
        </button>
      </div>

      <hr className="my-[16px] border-gray-200" />

      {/* Height */}
      <p className="text-[#333333] text-[13px] mb-[6px]">Building height</p>
      <div className="flex gap-[8px] mb-[16px]">
        <input
          className="flex-1 border border-gray-300 rounded-[8px] px-[10px] py-[6px] bg-gray-200 text-[13px] text-gray-500"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <select
          className="w-[80px] border border-gray-300 rounded-[8px] px-[6px] py-[6px] bg-gray-200 text-[13px] text-gray-500"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option>Unit</option>
          <option>m</option>
          <option>ft</option>
        </select>
      </div>

      {/* Rooms */}
      <p className="text-[#333333] text-[13px] mb-[6px]">Rooms created</p>
      <div className="space-y-[8px]">
        {rooms.map((room, index) => {
          const widthInMeters = convertToLogicalUnits(room.width);
          const heightInMeters = convertToLogicalUnits(room.height);
          const areaInUnits = convertArea(room.width * room.height);
          const unitLabel = getUnitLabel();

          return (
            <div
              key={index}
              onClick={() => handleRoomClick(room)}
              className="cursor-pointer flex items-center border border-gray-300 rounded-[8px] px-[10px] py-[6px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              <div className="text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {room.name || "Unnamed Room"}
                </p>
                <p>
                  <span className="font-medium">Area:</span>{" "}
                  {areaInUnits.toFixed(2)}{" "}
                  {selectedScale === "Inches"
                    ? "in²"
                    : selectedScale === "Feet"
                    ? "ft²"
                    : selectedScale === "Square Yards"
                    ? "yd²"
                    : "m²"}
                </p>
                <p>
                  <span className="font-medium">Width:</span>{" "}
                  {widthInMeters.toFixed(2)} {unitLabel}
                </p>
                <p>
                  <span className="font-medium">Length:</span>{" "}
                  {heightInMeters.toFixed(2)} {unitLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* RightModal component */}
      <RightModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        room={selectedRoom}
      />
    </div>
  );
};

export default AreaMarkupSidebar;
