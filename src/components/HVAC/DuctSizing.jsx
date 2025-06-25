import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";

const DuctSizing = () => {
  const [formData, setFormData] = useState({
    area: "3",
    airFlow: "646",
    airFlowUnit: "CFM",
    velocity: "1000",
    velocityUnit: "FPM",
    staticLoss: "1000",
    staticLossUnit: "InWG",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = () => {
    console.log("Calculate button clicked!", formData);
    // Add your calculation logic here
  };

  return (
    <div className="flex h-screen relative">
      {" "}
      {/* Add 'relative' to the parent for absolute positioning of the button container */}
      <div className="w-[340px] h-[92vh] p-4 bg-white border-r border-gray-300 text-sm font-medium space-y-4 overflow-y-auto pb-20">
        {" "}
        {/* Add pb-20 to create space for the fixed button */}
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-800">
              Duct Sizing
            </h2>
            <p className="text-xs text-gray-400">Updated: Just now</p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={() => console.log("Reload clicked")}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>
        <hr className="border-gray-200" />
        {/* Select Area */}
        <div className="space-y-1">
          <label className="text-gray-800 mb-1 block">Select Area</label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
          >
            <option value="3">3</option>
          </select>
        </div>
        {/* Air Flowrate Capacity */}
        <div className="space-y-1">
          <label className="text-gray-800 mb-1 block">
            Air Flowrate Capacity Q (m³/s)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="airFlow"
              value={formData.airFlow}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
            />
            <select
              name="airFlowUnit"
              value={formData.airFlowUnit}
              onChange={handleChange}
              className="bg-gray-200 p-2 rounded-md text-gray-500"
            >
              <option value="CFM">CFM</option>
            </select>
          </div>
        </div>
        {/* Maximum Air Velocity */}
        <div className="space-y-1">
          <label className="text-gray-800 mb-1 block">
            Maximum Air Velocity
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="velocity"
              value={formData.velocity}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
            />
            <select
              name="velocityUnit"
              value={formData.velocityUnit}
              onChange={handleChange}
              className="bg-gray-200 p-2 rounded-md text-gray-500"
            >
              <option value="FPM">FPM</option>
            </select>
          </div>
        </div>
        {/* Maximum Static Loss */}
        <div className="space-y-1">
          <label className="text-gray-800 mb-1 block">
            Maximum Static Loss/100ft
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="staticLoss"
              value={formData.staticLoss}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
            />
            <select
              name="staticLossUnit"
              value={formData.staticLossUnit}
              onChange={handleChange}
              className="bg-gray-200 p-2 rounded-md text-gray-500"
            >
              <option value="InWG">InWG</option>
            </select>
          </div>
        </div>
      </div>
      {/* Calculate Button Container */}
      <div className="absolute bottom-0 left-0 w-[340px] pb-20 bg-white p-4 border-t border-gray-300">
        <button
          onClick={handleCalculate}
          className="w-full bg-[#0083EE] text-white py-3 rounded-md text-base font-semibold hover:bg-[#1C78DC] transition"
        >
          Calculate
        </button>
      </div>
      {/* Right: Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default DuctSizing;
