import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Layer, Rect, Line } from "react-konva";
import { ReloadIcon } from "../../icons/ReloadIcon";
import PlusIcon from "../../icons/PlusIcon";
import CanvasWrapper from "../Canvas/CanvasWrapper";
import WallPropertiesPanel from "./WallPropertiesPanel";

const AssignMaterial = () => {
  const [formData, setFormData] = useState({
    wall: "",
    partition: "",
    ceiling: "",
    room1: "30",
    room2: "15",
  });
  const [selectedWallId, setSelectedWallId] = useState(null);
  const [showWallProperties, setShowWallProperties] = useState(false);

  // Get data from Redux
  const rooms = useSelector((state) => state.rooms?.rooms || []);
  const walls = useSelector((state) => state.walls.walls);
  const floorRect = useSelector((state) => state.floor.floor_rect);
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWallSelect = (wallId) => {
    setSelectedWallId(wallId);
    setShowWallProperties(true);
  };

  const handleCloseWallProperties = () => {
    setShowWallProperties(false);
    setSelectedWallId(null);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-[340px] h-[90vh] border-r border-gray-300 p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-normal text-black">Assign Material</h2>
            <p className="text-xs text-gray-400">Updated: Just now</p>
          </div>
          <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>
        <hr className="border-gray-200" />

        <button
          type="button"
          className="mb-4 mt-2 flex gap-40  text-black text-sm font-normal"
        >
          <p className="">Add new Wall</p>
          <span className=" p-1 h-6 bg-gray-200 rounded-md flex items-center justify-center text-black text-xl font-semibold ml-3.5 select-none ">
            <PlusIcon />
          </span>
        </button>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="wall"
              className="block mb-1 text-xs font-semibold text-black"
            >
              Wall
            </label>
            <select
              id="wall"
              name="wall"
              value={formData.wall}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-200 text-black text-sm py-2 px-3 appearance-none border border-transparent focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="partition"
              className="block mb-1 text-xs font-semibold text-black"
            >
              Partition
            </label>
            <select
              id="partition"
              name="partition"
              value={formData.partition}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-200 text-black text-sm py-2 px-3 appearance-none border border-transparent focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ceiling"
              className="block mb-1 text-xs font-semibold text-black"
            >
              Ceiling
            </label>
            <select
              id="ceiling"
              name="ceiling"
              value={formData.ceiling}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-200 text-black text-sm py-2 px-3 appearance-none border border-transparent focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold text-black">
              Work Plan
            </label>
            <div className="border border-gray-200 rounded-md p-3 space-y-3 bg-white">
              <div className="flex flex-col gap-1">
                <label htmlFor="room1" className="text-xs font-normal text-black">
                  Room 1
                </label>
                <div className="flex gap-2">
                  <input
                    id="room1"
                    name="room1"
                    type="text"
                    value={formData.room1}
                    onChange={handleChange}
                    className="flex-1 rounded-md bg-gray-200 text-black text-sm py-2 px-3 border border-transparent focus:border-blue-600 focus:outline-none"
                  />
                  <select
                    name="room1-unit"
                    className="w-20 rounded-md bg-gray-200 text-black text-sm py-2 px-3 appearance-none border border-transparent focus:border-blue-600 focus:outline-none"
                  >
                    <option>m</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="room2" className="text-xs font-normal text-black">
                  Room 2
                </label>
                <div className="flex gap-2">
                  <input
                    id="room2"
                    name="room2"
                    type="text"
                    value={formData.room2}
                    onChange={handleChange}
                    className="flex-1 rounded-md bg-gray-200 text-black text-sm py-2 px-3 border border-transparent focus:border-blue-600 focus:outline-none"
                  />
                  <select
                    name="room2-unit"
                    className="w-20 rounded-md bg-gray-200 text-black text-sm py-2 px-3 appearance-none border border-transparent focus:border-blue-600 focus:outline-none"
                  >
                    <option>m</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-[90vh] relative">
        <CanvasWrapper>
          <Layer>
            {/* Render floor from Editor.jsx */}
            {floorRect && (
              <Rect
                {...floorRect}
                fill="rgba(200,200,200,0.3)"
                stroke="black"
                strokeWidth={2}
                listening={false}
              />
            )}

            {/* Render floor shapes from Editor.jsx */}
            {currentFloor && currentFloor.shapes && Array.isArray(currentFloor.shapes) && currentFloor.shapes.map((shape, index) => {
              if (shape.shape === 'rectangle') {
                return (
                  <Rect
                    key={shape.id || index}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="rgba(0, 150, 255, 0.1)"
                    stroke="#1e40af"
                    strokeWidth={3}
                    listening={false}
                  />
                );
              } else if (shape.shape === 'polygon' && shape.points) {
                return (
                  <Line
                    key={shape.id || index}
                    points={shape.points.flatMap(point => [point.x, point.y])}
                    stroke="#1e40af"
                    strokeWidth={3}
                    fill="rgba(0, 150, 255, 0.1)"
                    closed={true}
                    listening={false}
                  />
                );
              }
              return null;
            })}

            {/* Render rooms */}
            {rooms && Array.isArray(rooms) && rooms.map((room) => (
              <Rect
                key={room.id || room._id}
                {...room}
                fill="rgba(100, 200, 100, 0.5)"
                stroke="black"
                strokeWidth={1}
                listening={false}
              />
            ))}

            {/* Render walls */}
            {walls && Array.isArray(walls) && walls.map((wall) => (
              <Line
                key={wall.id || wall._id}
                points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
                stroke={selectedWallId === (wall.id || wall._id) ? "#3b82f6" : "#666"}
                strokeWidth={selectedWallId === (wall.id || wall._id) ? 3 : 2}
                listening={false}
              />
            ))}
          </Layer>
        </CanvasWrapper>
        
        {/* Wall Properties Panel */}
        {showWallProperties && selectedWallId && (
          <div className="absolute top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-[80vh] overflow-y-auto">
            <WallPropertiesPanel
              selectedWallId={selectedWallId}
              onClose={handleCloseWallProperties}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignMaterial;
