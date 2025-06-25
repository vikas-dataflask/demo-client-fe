import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddVentilationMutation } from "../../redux/features/api/api"; // <-- update path as needed
import FloorPreview from "../shared/FloorPreview";

const VentilationForm = () => {
  const [formData, setFormData] = useState({
    room: "",
    area1: "",
    area2: "",
    height: "",
    heightUnit: "m",
    volume: "",
    volumeUnit: "m³",
    airChange: "",
    airChangeUnit: "AC/hour",
    flowRate: "",
    flowRateUnit: "m³/s",
    fans: "",
    fanUnit: "Nos",
    model: "",
  });

  const rooms = useSelector((state) => state.rooms);
  console.log(rooms);

  const [addVentilation, { isLoading, isSuccess, isError, error }] =
    useAddVentilationMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the payload (convert to numbers where applicable)
    const payload = {
      ...formData,
      area1: parseFloat(formData.area1),
      area2: parseFloat(formData.area2),
      height: parseFloat(formData.height),
      volume: parseFloat(formData.volume),
      airChange: parseFloat(formData.airChange),
      flowRate: parseFloat(formData.flowRate),
      fans: parseInt(formData.fans),
    };

    try {
      await addVentilation(payload).unwrap();
      alert("Ventilation data submitted successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit ventilation data.");
    }
  };

  return (
    <div className="flex h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-[340px] h-[92vh] bg-white border-r border-gray-300 text-sm font-medium relative flex flex-col overflow-hidden"
      >
        {/* Fixed Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Ventilation</h2>
            <p className="text-xs text-gray-400">Updated: Just now</p>
          </div>
          <button
            type="button"
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {/* Room Details */}
          <div>
            <p className="text-sm text-gray-900 mb-1">Room Details</p>
            <div className="border border-gray-300 rounded-xl p-4 bg-white space-y-3">
              <div className="space-y-1">
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                >
                  <option value="">Select Room</option>
                  <option value="room1">Room 1</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">Area</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="area1"
                    value={formData.area1}
                    onChange={handleChange}
                    className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                  />
                  {/* <input
                  type="text"
                  name="area2"
                  value={formData.area2}
                  onChange={handleChange}
                  className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                /> */}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">Height</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                  />
                  <select
                    name="heightUnit"
                    value={formData.heightUnit}
                    onChange={handleChange}
                    className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                  >
                    <option value="m">m</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">Volume</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                  />
                  <select
                    name="volumeUnit"
                    value={formData.volumeUnit}
                    onChange={handleChange}
                    className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
                  >
                    <option value="m³">m³</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Air Changes */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">
              Air Changes (AC/Hr.)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="airChange"
                value={formData.airChange}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              />
              <select
                name="airChangeUnit"
                value={formData.airChangeUnit}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              >
                <option value="AC/hour">AC/hour</option>
              </select>
            </div>
          </div>

          {/* Flowrate Capacity */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">
              Flowrate Capacity Q (m³/s)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="flowRate"
                value={formData.flowRate}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              />
              <select
                name="flowRateUnit"
                value={formData.flowRateUnit}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              >
                <option value="m³/s">m³/s</option>
              </select>
            </div>
          </div>

          {/* Number of Fans */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">Number of Fans</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="fans"
                value={formData.fans}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              />
              <select
                name="fanUnit"
                value={formData.fanUnit}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              >
                <option value="Nos">Nos</option>
              </select>
            </div>
          </div>

          {/* Select Model */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">Select Model</label>
            <select
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
            >
              <option value="">Select Model</option>
              <option value="model1">Model 1</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 pb-8.5 border-t border-gray-200 bg-white">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-md"
          >
            {isLoading ? "Submitting..." : "Calculate"}
          </button>
        </div>
      </form>
      {/* Right: Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default VentilationForm;
