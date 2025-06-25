import React, { useState } from "react";
import { useSelector } from "react-redux";

import { ReloadIcon } from "../../icons/ReloadIcon";
import PlusIcon from "../../icons/PlusIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import CircleIcon from "../../icons/CircleIcon";
import PolygonalIcon from "../../icons/PolygonalIcon";
import RightModal from "./RightModal";

const AreaMarkupSidebar = () => {
  const [selectedShape, setSelectedShape] = useState("square");
  const [buildingName, setBuildingName] = useState("Building 1");
  const [storeys, setStoreys] = useState("10");
  const [height, setHeight] = useState("30");
  const [unit, setUnit] = useState("Unit");

  const rooms = useSelector((state) => state.rooms);

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
      <div className="flex justify-between items-center mb-[8px]">
        <p className="text-[#333333] text-[13px]">Add new building</p>
        <button className="p-[6px] bg-gray-200 rounded-md hover:bg-gray-200">
          <PlusIcon className="w-[14px] h-[14px] text-gray-700" />
        </button>
      </div>
      <input
        className="w-full border border-gray-300 rounded-[8px] px-[10px] py-[6px] bg-gray-200 text-gray-500 mb-[16px] text-[13px]"
        value={buildingName}
        onChange={(e) => setBuildingName(e.target.value)}
      />

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

      {/* Storeys */}
      <p className="text-[#333333] text-[13px] mb-[6px]">No. of storeys</p>
      <input
        className="w-full border border-gray-300 rounded-[8px] px-[10px] py-[6px] bg-gray-200 mb-[16px] text-[13px] text-gray-500"
        value={storeys}
        onChange={(e) => setStoreys(e.target.value)}
      />

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
        {rooms.map((room, index) => (
          <div
            key={index}
            onClick={() => handleRoomClick(room)}
            className="cursor-pointer flex items-center border border-gray-300 rounded-[8px] px-[10px] py-[6px] bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            <span className="text-[13px] font-medium">{room.name}</span>
          </div>
        ))}
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
