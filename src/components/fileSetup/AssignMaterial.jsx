import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import PlusIcon from "../../icons/PlusIcon";

const AssignMaterial = () => {
  const [formData, setFormData] = useState({
    wall: "",
    partition: "",
    ceiling: "",
    room1: "30",
    room2: "15",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
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
  );
};

export default AssignMaterial;
