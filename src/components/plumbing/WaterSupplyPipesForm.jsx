import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import WaterSupplyIcon from "../../icons/WaterSupplyIcon";
import {
  useSaveWaterSupplyPipeMutation,
  useGetWaterSupplyPipeQuery,
} from "../../redux/features/api/api";

const initialState = {
  numWb: 0,
  numHealthFaucet: 0,
  numBibTap: 0,
  numServiceSink: 0,
  numKitchenSink: 0,
  numWaterFountain: 0,
  numWc: 0,
  numUrinal: 0,
  velocity: "", // ✅ Added velocity
};

// Fixture unit configuration (matching backend)
const fixtureUnitConfig = {
  washBasin: { cold: 1.0, hot: 1.0 },
  healthFaucet: { cold: 1.0, hot: 1.0 },
  bibTap: { cold: 2.5, hot: 0 },
  serviceSink: { cold: 3.0, hot: 3.0 },
  kitchenSink: { cold: 1.5, hot: 1.5 },
  waterFountain: { cold: 0.5, hot: 0 },
  wcTank: { cold: 2.5, hot: 0 },
  urinal: { cold: 1.0, hot: 0 },
};

// FU to Flow Rate conversion table (simplified)
const FU_TO_FLOW_LPM = [
  { fu: 1, lpm: 8 },
  { fu: 2, lpm: 12 },
  { fu: 3, lpm: 15 },
  { fu: 4, lpm: 18 },
  { fu: 5, lpm: 20 },
  { fu: 6, lpm: 22 },
  { fu: 7, lpm: 24 },
  { fu: 8, lpm: 26 },
  { fu: 9, lpm: 28 },
  { fu: 10, lpm: 30 },
  { fu: 12, lpm: 33 },
  { fu: 14, lpm: 36 },
  { fu: 16, lpm: 39 },
  { fu: 18, lpm: 42 },
  { fu: 20, lpm: 45 },
  { fu: 25, lpm: 50 },
  { fu: 30, lpm: 55 },
  { fu: 35, lpm: 60 },
  { fu: 40, lpm: 65 },
  { fu: 50, lpm: 75 },
  { fu: 60, lpm: 85 },
  { fu: 70, lpm: 95 },
  { fu: 80, lpm: 105 },
  { fu: 90, lpm: 115 },
  { fu: 100, lpm: 125 },
];

const WaterSupplyPipesForm = ({ setData }) => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState(initialState);
  const [saveWaterSupplyPipe, { isLoading, error }] =
    useSaveWaterSupplyPipeMutation();
  const { data, isFetching } = useGetWaterSupplyPipeQuery(projectId, {
    skip: !projectId,
  });

  const [result, setResult] = useState(null);

  // Calculate fixture units and flow rate in real-time
  const previewCalculations = useMemo(() => {
    const fixtures = {
      washBasin: formData.numWb,
      healthFaucet: formData.numHealthFaucet,
      bibTap: formData.numBibTap,
      serviceSink: formData.numServiceSink,
      kitchenSink: formData.numKitchenSink,
      waterFountain: formData.numWaterFountain,
      wcTank: formData.numWc,
      urinal: formData.numUrinal,
    };

    let coldWaterFU = 0;
    let hotWaterFU = 0;
    const fixtureBreakdown = {};

    // Calculate fixture units for each fixture type
    for (const [fixtureType, count] of Object.entries(fixtures)) {
      if (count > 0 && fixtureUnitConfig[fixtureType]) {
        const coldFU = fixtureUnitConfig[fixtureType].cold * count;
        const hotFU = fixtureUnitConfig[fixtureType].hot * count;

        fixtureBreakdown[fixtureType] = {
          count: count,
          coldFU: coldFU,
          hotFU: hotFU,
          totalFU: coldFU + hotFU,
        };

        coldWaterFU += coldFU;
        hotWaterFU += hotFU;
      }
    }

    // Convert FU to flow rate
    const totalFU = coldWaterFU + hotWaterFU;
    let estimatedFlowRateLPM = 0;

    if (totalFU > 0) {
      // Find exact match or interpolate
      const exactMatch = FU_TO_FLOW_LPM.find((entry) => entry.fu === totalFU);
      if (exactMatch) {
        estimatedFlowRateLPM = exactMatch.lpm;
      } else {
        for (let i = 0; i < FU_TO_FLOW_LPM.length; i++) {
          if (totalFU <= FU_TO_FLOW_LPM[i].fu) {
            if (i === 0) {
              estimatedFlowRateLPM = FU_TO_FLOW_LPM[i].lpm;
            } else {
              const prev = FU_TO_FLOW_LPM[i - 1];
              const curr = FU_TO_FLOW_LPM[i];
              const ratio = (totalFU - prev.fu) / (curr.fu - prev.fu);
              estimatedFlowRateLPM = Math.round(
                prev.lpm + ratio * (curr.lpm - prev.lpm)
              );
            }
            break;
          }
        }
        // If above max, extrapolate
        if (estimatedFlowRateLPM === 0) {
          const last = FU_TO_FLOW_LPM[FU_TO_FLOW_LPM.length - 1];
          const secondLast = FU_TO_FLOW_LPM[FU_TO_FLOW_LPM.length - 2];
          const ratio = (totalFU - secondLast.fu) / (last.fu - secondLast.fu);
          estimatedFlowRateLPM = Math.round(
            secondLast.lpm + ratio * (last.lpm - secondLast.lpm)
          );
        }
      }
    }

    return {
      coldWaterFU: Math.round(coldWaterFU * 100) / 100,
      hotWaterFU: Math.round(hotWaterFU * 100) / 100,
      totalFU: Math.round(totalFU * 100) / 100,
      estimatedFlowRateLPM,
      flowRateM3s:
        Math.round((estimatedFlowRateLPM / 1000 / 60) * 1000000) / 1000000,
      fixtureBreakdown,
    };
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "velocity" ? parseFloat(value) || "" : parseInt(value) || 0,
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

    const payload = {
      project_id: projectId,
      input_data: {
        num_wb: formData.numWb,
        num_health_faucet: formData.numHealthFaucet,
        num_bib_tap: formData.numBibTap,
        num_service_sink: formData.numServiceSink,
        num_kitchen_sink: formData.numKitchenSink,
        num_water_fountain: formData.numWaterFountain,
        num_wc: formData.numWc,
        num_urinal: formData.numUrinal,
        velocity: formData.velocity,
      },
    };

    try {
      const response = await saveWaterSupplyPipe(payload).unwrap();
      console.log("Saved successfully:", response);
      setResult([response.data]); // ✅ should store the full data, not just result_data
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving data: " + (error.data?.message || error.error));
    }
  };

  const handleReset = () => {
    setFormData(initialState);
    setResult(null);
  };

  useEffect(() => {
    if (data?.data?.length > 0) {
      const lastEntry = data.data[0]; // latest saved record
      setFormData({
        numWb: lastEntry.input_data.num_wb,
        numHealthFaucet: lastEntry.input_data.num_health_faucet,
        numBibTap: lastEntry.input_data.num_bib_tap,
        numServiceSink: lastEntry.input_data.num_service_sink,
        numKitchenSink: lastEntry.input_data.num_kitchen_sink,
        numWaterFountain: lastEntry.input_data.num_water_fountain,
        numWc: lastEntry.input_data.num_wc,
        numUrinal: lastEntry.input_data.num_urinal,
        velocity: lastEntry.input_data.velocity,
      });
      setResult([lastEntry]);
    }
  }, [data]);

  return (
    <div className="flex h-screen">
      {/* Left: Form */}
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col h-full">
        {/* Header */}
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <WaterSupplyIcon size={32} />
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Water Supply Pipe Sizing
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
                Water Supply Pipe Sizing Calculator
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
                      name="numWb"
                      value={formData.numWb}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Faucets
                    </label>
                    <input
                      type="number"
                      name="numHealthFaucet"
                      value={formData.numHealthFaucet}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bib Taps
                    </label>
                    <input
                      type="number"
                      name="numBibTap"
                      value={formData.numBibTap}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Sinks
                    </label>
                    <input
                      type="number"
                      name="numServiceSink"
                      value={formData.numServiceSink}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kitchen Sinks
                    </label>
                    <input
                      type="number"
                      name="numKitchenSink"
                      value={formData.numKitchenSink}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Fountains
                    </label>
                    <input
                      type="number"
                      name="numWaterFountain"
                      value={formData.numWaterFountain}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WCs
                    </label>
                    <input
                      type="number"
                      name="numWc"
                      value={formData.numWc}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urinals
                    </label>
                    <input
                      type="number"
                      name="numUrinal"
                      value={formData.numUrinal}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Preview Section */}
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-4">
                  📊 Real-time Preview: Total Fixture Unit & Flow Rate
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fixture Units Summary */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-700 mb-3">
                      Fixture Units (FU)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Cold Water FU:
                        </span>
                        <span className="font-semibold text-blue-800">
                          {previewCalculations.coldWaterFU} FU
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Hot Water FU:
                        </span>
                        <span className="font-semibold text-blue-800">
                          {previewCalculations.hotWaterFU} FU
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-700">
                          Total FU:
                        </span>
                        <span className="font-bold text-lg text-blue-900">
                          {previewCalculations.totalFU} FU
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Flow Rate Summary */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-700 mb-3">
                      Flow Rate Estimation
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Estimated Flow Rate:
                        </span>
                        <span className="font-semibold text-blue-800">
                          {previewCalculations.estimatedFlowRateLPM} LPM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Flow Rate (m³/s):
                        </span>
                        <span className="font-semibold text-blue-800">
                          {previewCalculations.flowRateM3s} m³/s
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-700">
                          Status:
                        </span>
                        <span
                          className={`font-medium ${
                            previewCalculations.totalFU > 0
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {previewCalculations.totalFU > 0
                            ? "✅ Ready for calculation"
                            : "⏳ Enter fixture counts"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixture Breakdown */}
                {previewCalculations.totalFU > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h3 className="font-semibold text-blue-700 mb-3">
                      Fixture Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {Object.entries(previewCalculations.fixtureBreakdown).map(
                        ([fixture, data]) => (
                          <div
                            key={fixture}
                            className="bg-white p-2 rounded border border-blue-100"
                          >
                            <div className="font-medium text-gray-700 capitalize">
                              {fixture.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Count: {data.count} | Cold: {data.coldFU} FU |
                              Hot: {data.hotFU} FU
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ NEW: Velocity Input */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading || previewCalculations.totalFU === 0}
              >
                {isLoading
                  ? "Calculating..."
                  : previewCalculations.totalFU === 0
                  ? "Enter fixture counts to calculate"
                  : "Calculate Pipe Sizing"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right: Results */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Pipe Sizing Results
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800 font-semibold">Error</div>
              <div className="text-red-700">
                {error.data?.message || error.error || "An error occurred"}
              </div>
            </div>
          )}
          {result && result.length > 0 && (
            <div className="space-y-6">
              {result.map((calculation, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Calculation{" "}
                    {result.length > 1 ? `#${index + 1}` : "Summary"}
                  </h3>

                  {/* Fixture Units */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Fixture Units
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="text-sm text-blue-600 font-medium">
                          Cold Water FU
                        </div>
                        <div className="text-lg font-bold text-blue-800">
                          {calculation.result_data?.fixture_units_cold || 0}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="text-sm text-green-600 font-medium">
                          Hot Water FU
                        </div>
                        <div className="text-lg font-bold text-green-800">
                          {calculation.result_data?.fixture_units_hot || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flow Rates */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Flow Rates
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-3 rounded-md">
                        <div className="text-sm text-purple-600 font-medium">
                          Estimated Flow Rate
                        </div>
                        <div className="text-lg font-bold text-purple-800">
                          {calculation.result_data?.estimated_flow_rate_lpm ||
                            0}{" "}
                          LPM
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-md">
                        <div className="text-sm text-orange-600 font-medium">
                          Flow Rate (m³/s)
                        </div>
                        <div className="text-lg font-bold text-orange-800">
                          {calculation.result_data?.flow_m3s_domestic || 0} m³/s
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pipe Sizing */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Pipe Sizing
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-3 rounded-md">
                        <div className="text-sm text-indigo-600 font-medium">
                          Recommended Pipe diameter
                        </div>
                        <div className="text-lg font-bold text-indigo-800">
                          {calculation.result_data?.recommended_pipe_size_mm ||
                            0}{" "}
                          mm
                        </div>
                      </div>
                      <div className="bg-teal-50 p-3 rounded-md">
                        <div className="text-sm text-teal-600 font-medium">
                          Velocity
                        </div>
                        <div className="text-lg font-bold text-teal-800">
                          {calculation.result_data?.calculated_velocity_ms ||
                            formData?.velocity ||
                            0}{" "}
                          m/s
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Summary */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Input Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Wash Basins:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_wb || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Health Faucets:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_health_faucet || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bib Taps:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_bib_tap || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Service Sinks:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_service_sink || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Water Fountains:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_water_fountain || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">WCs:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_wc || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kitchen Sinks:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_kitchen_sink || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Urinals:</span>
                        <span className="ml-2 font-medium">
                          {calculation.input_data?.num_urinal || 0}
                        </span>
                      </div>
                      {calculation.pipe_length && (
                        <div>
                          <span className="text-gray-600">Pipe Length:</span>
                          <span className="ml-2 font-medium">
                            {calculation.pipe_length} m
                          </span>
                        </div>
                      )}
                      {calculation.pipe_material && (
                        <div>
                          <span className="text-gray-600">Pipe Material:</span>
                          <span className="ml-2 font-medium">
                            {calculation.pipe_material}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!result && !isLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🚰</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate Pipe Sizing" to see
                results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterSupplyPipesForm;
