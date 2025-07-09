import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddVentilationMutation } from "../../redux/features/api/api";
import FloorPreview from "../shared/FloorPreview";

const VentilationForm = () => {
  const rooms = useSelector((state) => state.rooms);
  const [formData, setFormData] = useState({
    room: "",
    area1: "",
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
    flowRatePerFan: "",
    flowRatePerFanUnit: "l/s",
    fanDiameter: "",
    model: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const [addVentilation, { isLoading }] = useAddVentilationMutation();

  // Handle changes, including room selection logic
  const handleChange = (e) => {
    const { name, value } = e.target;
    // If room is selected, auto-fill area and height
    if (name === "room") {
      const selectedRoom = rooms.find(
        (room) => room.name === value || room.id === value
      );
      if (selectedRoom) {
        setFormData((prev) => {
          const updated = {
            ...prev,
            room: value,
            area1: selectedRoom.area || "",
            height: selectedRoom.roomHeight || "",
          };
          // Auto-calculate volume if both area and height are present
          if (updated.area1 && updated.height) {
            const area = parseFloat(updated.area1);
            const height = parseFloat(updated.height);
            if (!isNaN(area) && !isNaN(height)) {
              updated.volume = (area * height).toString();
              // Auto-calculate flow rate if air changes are present
              if (updated.airChange) {
                const airChange = parseFloat(updated.airChange);
                if (!isNaN(airChange)) {
                  updated.flowRate = (
                    (area * height * airChange) /
                    (3.6 * 1000)
                  ).toString();
                  // Auto-calculate flow rate per fan if number of fans is present
                  if (updated.fans) {
                    const fans = parseFloat(updated.fans);
                    if (!isNaN(fans) && fans > 0) {
                      const flowRate = parseFloat(updated.flowRate);
                      if (!isNaN(flowRate)) {
                        updated.flowRatePerFan = (
                          (flowRate * 60 * 60) /
                          fans /
                          3.6
                        ).toString();
                      }
                    }
                  }
                }
              }
            } else {
              updated.volume = "";
              updated.flowRate = "";
              updated.flowRatePerFan = "";
            }
          }
          return updated;
        });
        return;
      }
    }
    // For area/height changes, auto-calculate volume and flow rate
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (
        (name === "area1" || name === "height") &&
        updated.area1 &&
        updated.height
      ) {
        const area = parseFloat(updated.area1);
        const height = parseFloat(updated.height);
        if (!isNaN(area) && !isNaN(height)) {
          updated.volume = (area * height).toString();
          // Auto-calculate flow rate if air changes are present
          if (updated.airChange) {
            const airChange = parseFloat(updated.airChange);
            if (!isNaN(airChange)) {
              updated.flowRate = (
                (area * height * airChange) /
                (3.6 * 1000)
              ).toString();
              // Auto-calculate flow rate per fan if number of fans is present
              if (updated.fans) {
                const fans = parseFloat(updated.fans);
                if (!isNaN(fans) && fans > 0) {
                  const flowRate = parseFloat(updated.flowRate);
                  if (!isNaN(flowRate)) {
                    updated.flowRatePerFan = (
                      (flowRate * 60 * 60) /
                      fans /
                      3.6
                    ).toString();
                  }
                }
              }
            }
          }
        } else {
          updated.volume = "";
          updated.flowRate = "";
          updated.flowRatePerFan = "";
        }
      }
      // For air changes, recalculate flow rate if volume is present
      if (name === "airChange" && updated.volume && updated.airChange) {
        const volume = parseFloat(updated.volume);
        const airChange = parseFloat(updated.airChange);
        if (!isNaN(volume) && !isNaN(airChange)) {
          updated.flowRate = ((volume * airChange) / (3.6 * 1000)).toString();
          // Auto-calculate flow rate per fan if number of fans is present
          if (updated.fans) {
            const fans = parseFloat(updated.fans);
            if (!isNaN(fans) && fans > 0) {
              const flowRate = parseFloat(updated.flowRate);
              if (!isNaN(flowRate)) {
                updated.flowRatePerFan = (
                  (flowRate * 60 * 60) /
                  fans /
                  3.6
                ).toString();
              }
            }
          }
        }
      }
      // For number of fans, recalculate flow rate per fan if flow rate is present
      if (name === "fans" && updated.flowRate && updated.fans) {
        const flowRate = parseFloat(updated.flowRate);
        const fans = parseFloat(updated.fans);
        if (!isNaN(flowRate) && !isNaN(fans) && fans > 0) {
          updated.flowRatePerFan = (
            (flowRate * 60 * 60) /
            fans /
            3.6
          ).toString();
        } else {
          updated.flowRatePerFan = "";
        }
      }
      return updated;
    });
  };

  // Validate required fields
  const validate = () => {
    if (!formData.area1 || isNaN(parseFloat(formData.area1)))
      return "Area is required and must be a number.";
    if (!formData.height || isNaN(parseFloat(formData.height)))
      return "Height is required and must be a number.";
    if (!formData.airChange || isNaN(parseFloat(formData.airChange)))
      return "Air Changes per hour is required and must be a number.";
    if (!formData.fans || isNaN(parseFloat(formData.fans)))
      return "Number of Fans is required and must be a number.";
    if (!formData.fanDiameter || isNaN(parseFloat(formData.fanDiameter)))
      return "Fan Diameter is required and must be a number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    // Prepare the payload for backend
    const payload = {
      rooms: [
        {
          area: parseFloat(formData.area1),
          height: parseFloat(formData.height),
          acph: parseFloat(formData.airChange),
          fan_capacity: parseFloat(formData.flowRate) * 3600, // Convert m³/s to m³/h for backend
          fan_diameter: parseFloat(formData.fanDiameter),
          number_of_fans: parseInt(formData.fans),
        },
      ],
    };
    try {
      const response = await addVentilation(payload).unwrap();
      setResult(response.data);
    } catch (err) {
      setErrorMsg("Failed to calculate ventilation. Please try again.");
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
            onClick={() => window.location.reload()}
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
                  {rooms && rooms.length > 0 ? (
                    rooms.map((room, idx) => (
                      <option key={room.id || idx} value={room.name}>
                        {room.name}
                      </option>
                    ))
                  ) : (
                    <option value="room1">Room 1</option>
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">Area (m²)</label>
                <input
                  type="number"
                  name="area1"
                  value={formData.area1}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">Height (m)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">Volume (m³)</label>
                <input
                  type="number"
                  name="volume"
                  value={formData.volume}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </div>
          {/* Air Changes */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">
              Air Changes (AC/Hr.)
            </label>
            <input
              type="number"
              name="airChange"
              value={formData.airChange}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
            />
          </div>
          {/* Flow Rate */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">Flow Rate (m³/s)</label>
            <input
              type="number"
              name="flowRate"
              value={formData.flowRate}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            />
          </div>
          {/* Number of Fans */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">Number of Fans</label>
            <input
              type="number"
              name="fans"
              value={formData.fans}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
            />
          </div>
          {/* Flow Rate Capacity Q (l/s) of Each Fan */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">
              Flow Rate Capacity Q (l/s) of Each Fan
            </label>
            <input
              type="number"
              name="flowRatePerFan"
              value={formData.flowRatePerFan}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            />
          </div>
          {/* Fan Diameter */}
          <div className="space-y-1">
            <label className="text-gray-700 mb-1 block">
              Fan Diameter (mm)
            </label>
            <input
              type="number"
              name="fanDiameter"
              value={formData.fanDiameter}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
            />
          </div>
          {/* Results Section */}
          {result && (
            <div className="max-w-xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow text-blue-900">
              <h3 className="font-semibold mb-2 text-lg">
                Ventilation Calculation Result
              </h3>
              {result.map((r, idx) => (
                <div key={idx} className="mb-4">
                  <div>
                    <b>Volume:</b> {r.volume} m³
                  </div>
                  <div>
                    <b>Flowrate:</b> {r.flowrate_m3h} m³/h ({r.flowrate_m3s}{" "}
                    m³/s)
                  </div>
                  <div>
                    <b>Fans Required:</b> {r.fans}
                  </div>
                  <div>
                    <b>Flowrate per Fan:</b> {r.flowrate_per_fan} m³/h
                  </div>
                  <div>
                    <b>Fan Diameter:</b> {r.selected_fan_diameter} mm
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Error Message */}
        {errorMsg && (
          <div className="p-2 bg-red-100 text-red-700 text-xs text-center">
            {errorMsg}
          </div>
        )}
        {/* Submit Button */}
        <div className="p-4 pb-8.5 border-t border-gray-200 bg-white">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-md"
          >
            {isLoading ? "Calculating..." : "Calculate"}
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
