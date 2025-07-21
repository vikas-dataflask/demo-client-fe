import React, { useState, useMemo, useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  useSaveDrainagePipeMutation,
  useGetDrainagePipeByProjectQuery,
} from "../../redux/features/api/api";
import FloorPreview from "../shared/FloorPreview";
import { useParams } from "react-router-dom";

// Drainage fixture unit configuration (NBC standards)
const drainageFixtureUnitConfig = {
  // Waste fixtures
  washBasin: { fixtureUnits: 1.0, type: "waste" },
  healthFaucet: { fixtureUnits: 2.0, type: "waste" },
  floorDrain: { fixtureUnits: 2.0, type: "waste" },
  serviceSink: { fixtureUnits: 3.0, type: "waste" },
  kitchenSink: { fixtureUnits: 2.0, type: "waste" },
  shower: { fixtureUnits: 2.0, type: "waste" },

  // Soil fixtures
  waterCloset: { fixtureUnits: 6.0, type: "soil" },
  urinal: { fixtureUnits: 3.0, type: "soil" },
  urinalTrap: { fixtureUnits: 3.0, type: "soil" },
};

const DrainagePipesForm = ({ setData }) => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    num_wb: 0,
    num_health_faucet: 0,
    num_floor_drain: 0,
    num_service_sink: 0,
    num_kitchen_sink: 0,
    num_shower: 0,
    num_wc: 0,
    num_urinal: 0,
    num_urinal_trap: 0,
    velocity: "",
  });
  const [result, setResult] = useState(null);
  const [saveDrainagePipe, { isLoading, error }] = useSaveDrainagePipeMutation();
  const { data: savedData, isLoading: autoFillLoading } = useGetDrainagePipeByProjectQuery(projectId, { skip: !projectId });

  // Calculate fixture units and flow rate in real-time
  const previewCalculations = useMemo(() => {
    const fixtures = {
      washBasin: formData.num_wb,
      healthFaucet: formData.num_health_faucet,
      floorDrain: formData.num_floor_drain,
      serviceSink: formData.num_service_sink,
      kitchenSink: formData.num_kitchen_sink,
      shower: formData.num_shower,
      waterCloset: formData.num_wc,
      urinal: formData.num_urinal,
      urinalTrap: formData.num_urinal_trap,
    };

    let totalWasteFU = 0;
    let totalSoilFU = 0;
    const wasteFixtureBreakdown = {};
    const soilFixtureBreakdown = {};

    // Calculate fixture units for each fixture type
    if (drainageFixtureUnitConfig) {
      for (const [fixtureType, count] of Object.entries(fixtures)) {
        if (count > 0 && drainageFixtureUnitConfig[fixtureType]) {
          const fixtureUnits =
            drainageFixtureUnitConfig[fixtureType].fixtureUnits * count;
          const type = drainageFixtureUnitConfig[fixtureType].type;

          if (type === "waste") {
            totalWasteFU += fixtureUnits;
            wasteFixtureBreakdown[fixtureType] = {
              count: count,
              fixtureUnits: fixtureUnits,
            };
          } else if (type === "soil") {
            totalSoilFU += fixtureUnits;
            soilFixtureBreakdown[fixtureType] = {
              count: count,
              fixtureUnits: fixtureUnits,
            };
          }
        }
      }
    }

    const totalFixtureUnits = totalWasteFU + totalSoilFU;

    // Flow rate estimation (simplified for drainage)
    const estimatedWasteFlowRate = Math.round(totalWasteFU * 0.5); // LPM approximation
    const estimatedSoilFlowRate = Math.round(totalSoilFU * 0.8); // LPM approximation

    return {
      totalWasteFU: Math.round(totalWasteFU * 100) / 100,
      totalSoilFU: Math.round(totalSoilFU * 100) / 100,
      totalFixtureUnits: Math.round(totalFixtureUnits * 100) / 100,
      estimatedWasteFlowRate,
      estimatedSoilFlowRate,
      wasteFixtureBreakdown,
      soilFixtureBreakdown,
    };
  }, [formData]);

  // Autofill data when saved data is loaded
  useEffect(() => {
    if (savedData?.data?.input_data) {
      const inputData = savedData.data.input_data;
      setFormData({
        num_wb: inputData.num_wb || 0,
        num_health_faucet: inputData.num_health_faucet || 0,
        num_floor_drain: inputData.num_floor_drain || 0,
        num_service_sink: inputData.num_service_sink || 0,
        num_kitchen_sink: inputData.num_kitchen_sink || 0,
        num_shower: inputData.num_shower || 0,
        num_wc: inputData.num_wc || 0,
        num_urinal: inputData.num_urinal || 0,
        num_urinal_trap: inputData.num_urinal_trap || 0,
        velocity: inputData.velocity || "",
      });
      setResult(savedData.data);
    }
  }, [savedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "velocity" ? parseFloat(value) || "" : parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert("Please select a project before calculating!");
      return;
    }
    if (!formData.velocity || formData.velocity <= 0) {
      alert("Please enter a valid velocity before calculating!");
      return;
    }
    try {
      const response = await saveDrainagePipe({
        project_id: projectId,
        ...formData,
      }).unwrap();
      setResult(response.data);
      if (setData) setData(response.data);
    } catch (err) {
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      num_wb: 0,
      num_health_faucet: 0,
      num_floor_drain: 0,
      num_service_sink: 0,
      num_kitchen_sink: 0,
      num_shower: 0,
      num_wc: 0,
      num_urinal: 0,
      num_urinal_trap: 0,
      velocity: "",
    });
    setResult(null);
  };

  return (
    <div className="flex h-screen">
      {/* Left: Form */}
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col h-full">
        {/* Header */}
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Drainage Pipes
                </h2>
                <p className="text-xs text-gray-400">Updated: Just now</p>
              </div>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={handleReset}
            >
              <svg
                className="w-[16px] h-[16px] stroke-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Drainage Pipes Calculator
              </h1>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fixture Counts Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Fixture Counts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wash Basins
                    </label>
                    <input
                      type="number"
                      name="num_wb"
                      value={formData.num_wb}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Faucets
                    </label>
                    <input
                      type="number"
                      name="num_health_faucet"
                      value={formData.num_health_faucet}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor Drains
                    </label>
                    <input
                      type="number"
                      name="num_floor_drain"
                      value={formData.num_floor_drain}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Sinks
                    </label>
                    <input
                      type="number"
                      name="num_service_sink"
                      value={formData.num_service_sink}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kitchen Sinks
                    </label>
                    <input
                      type="number"
                      name="num_kitchen_sink"
                      value={formData.num_kitchen_sink}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Showers
                    </label>
                    <input
                      type="number"
                      name="num_shower"
                      value={formData.num_shower}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Closets
                    </label>
                    <input
                      type="number"
                      name="num_wc"
                      value={formData.num_wc}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urinals
                    </label>
                    <input
                      type="number"
                      name="num_urinal"
                      value={formData.num_urinal}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urinal Traps
                    </label>
                    <input
                      type="number"
                      name="num_urinal_trap"
                      value={formData.num_urinal_trap}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Velocity Input Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Velocity Input
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Velocity (m/s)
                    </label>
                    <input
                      type="number"
                      name="velocity"
                      value={formData.velocity}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="Enter velocity for pipe sizing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Preview Section */}
              <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-800 mb-4">
                  📊 Real-time Preview: Total Fixture Unit & Flow Rate
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fixture Units Summary */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-700 mb-3">
                      Fixture Units (FU)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Waste System FU:
                        </span>
                        <span className="font-semibold text-green-800">
                          {previewCalculations.totalWasteFU} FU
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Soil System FU:
                        </span>
                        <span className="font-semibold text-green-800">
                          {previewCalculations.totalSoilFU} FU
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-700">
                          Total System FU:
                        </span>
                        <span className="font-bold text-lg text-green-900">
                          {previewCalculations.totalFixtureUnits} FU
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Flow Rate Summary */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-700 mb-3">
                      Flow Rate Estimation
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Waste Flow Rate:
                        </span>
                        <span className="font-semibold text-green-800">
                          {previewCalculations.estimatedWasteFlowRate} LPM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Soil Flow Rate:
                        </span>
                        <span className="font-semibold text-green-800">
                          {previewCalculations.estimatedSoilFlowRate} LPM
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-700">
                          Status:
                        </span>
                        <span
                          className={`font-medium ${
                            previewCalculations.totalFixtureUnits > 0
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {previewCalculations.totalFixtureUnits > 0
                            ? "✅ Ready for calculation"
                            : "⏳ Enter fixture counts"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixture Breakdown */}
                {previewCalculations.totalFixtureUnits > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="font-semibold text-green-700 mb-3">
                      Fixture Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Waste Fixtures */}
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">
                          Waste System:
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(
                            previewCalculations.wasteFixtureBreakdown
                          ).map(([fixture, data]) => (
                            <div
                              key={fixture}
                              className="bg-white p-2 rounded border border-green-100"
                            >
                              <div className="font-medium text-gray-700 capitalize">
                                {fixture.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Count: {data.count} | FU: {data.fixtureUnits}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Soil Fixtures */}
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">
                          Soil System:
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(
                            previewCalculations.soilFixtureBreakdown
                          ).map(([fixture, data]) => (
                            <div
                              key={fixture}
                              className="bg-white p-2 rounded border border-green-100"
                            >
                              <div className="font-medium text-gray-700 capitalize">
                                {fixture.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Count: {data.count} | FU: {data.fixtureUnits}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={
                  isLoading || previewCalculations.totalFixtureUnits === 0
                }
              >
                {isLoading
                  ? "Calculating..."
                  : previewCalculations.totalFixtureUnits === 0
                  ? "Enter fixture counts to calculate"
                  : "Calculate Drainage Pipes"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right: Results */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Drainage Results
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800 font-semibold">Error</div>
              <div className="text-red-700">
                {error.data?.message || error.error || "An error occurred"}
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-6">
              {/* Main Result */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Calculation Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Waste Fixture Units
                    </div>
                    <div className="text-lg font-bold text-green-800">
                      {result.result_data?.total_fixture_unit_waste || 0}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Soil Fixture Units
                    </div>
                    <div className="text-lg font-bold text-blue-800">
                      {result.result_data?.total_fixture_unit_soil || 0}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md">
                    <div className="text-sm text-purple-600 font-medium">
                      Flow Rate
                    </div>
                    <div className="text-lg font-bold text-purple-800">
                      {result.result_data?.estimated_flow_rate_lpm || 0} LPM
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-md">
                    <div className="text-sm text-orange-600 font-medium">
                      Recommended Pipe Size
                    </div>
                    <div className="text-lg font-bold text-orange-800">
                      {result.result_data?.recommended_pipe_size_mm || 0} mm
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <div className="text-sm text-indigo-600 font-medium">
                      Calculated Diameter
                    </div>
                    <div className="text-lg font-bold text-indigo-800">
                      {result.result_data?.calculated_diameter_mm || 0} mm
                    </div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-md">
                    <div className="text-sm text-teal-600 font-medium">
                      Velocity
                    </div>
                    <div className="text-lg font-bold text-teal-800">
                      {result.result_data?.calculated_velocity_ms || 0} m/s
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Input Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Wash Basins:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_wb || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Health Faucets:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_health_faucet || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Floor Drains:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_floor_drain || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service Sinks:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_service_sink || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Kitchen Sinks:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_kitchen_sink || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Showers:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_shower || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Water Closets:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_wc || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Urinals:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_urinal || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Urinal Traps:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.num_urinal_trap || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Velocity:</span>
                    <span className="ml-2 font-medium">
                      {result.input_data?.velocity || 0} m/s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!result && !isLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🚰</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate Drainage Pipes" to see
                results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrainagePipesForm;
