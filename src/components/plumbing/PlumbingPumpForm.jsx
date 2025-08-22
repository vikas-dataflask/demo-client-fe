import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useAddPlumbingPumpMutation,
  useGetPlumbingPumpByProjectQuery,
} from "../../redux/features/api/api";
import FirePumpIcon from "../../icons/FirePumpIcon";

const PlumbingPumpPage = ({ setData }) => {
  const { projectId } = useParams();

  const [formData, setFormData] = useState({
    flowrateLpm: 2000, // User input (L/min)
    pipeMaterial: "GI",
    frictionalLossCoefficient: 120,
    pipeDiameter: 150,
    totalHead: 70, // New: Total Head Loss input
    efficiency: 70, // Pump efficiency in %
  });

  const [result, setResult] = useState(null);
  const [addPlumbingPump, { isLoading, error }] = useAddPlumbingPumpMutation();

  // ✅ Add query for autofill functionality
  const { data: savedData, isLoading: autoFillLoading } =
    useGetPlumbingPumpByProjectQuery(projectId, { skip: !projectId });

  // ✅ Autofill data when saved data is loaded
  useEffect(() => {
    if (savedData?.data?.pumps && savedData.data.pumps.length > 0) {
      const pumpData = savedData.data.pumps[0]; // Get first pump data

      setFormData({
        flowrateLpm: pumpData.flowrate_lpm || 2000,
        pipeMaterial: pumpData.pipe_material || "GI",
        frictionalLossCoefficient: pumpData.friction_loss_coefficient || 120,
        pipeDiameter: pumpData.pipe_dia || 150,
        totalHead: pumpData.total_head || 70,
        efficiency: pumpData.efficiency || 70,
      });

      // ✅ Restore calculation results if available
      setResult(savedData.data.pumps);
    }
  }, [savedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      alert("Please select a project before calculating!");
      return;
    }

    try {
      const response = await addPlumbingPump({
        project_id: projectId,
        pumps: [
          {
            flowrate_lpm: formData.flowrateLpm,
            total_head: formData.totalHead,
            pipe_material: formData.pipeMaterial,
            friction_loss_coefficient: formData.frictionalLossCoefficient,
            pipe_dia: formData.pipeDiameter,
            efficiency: formData.efficiency,
          },
        ],
      }).unwrap();

      console.log("API Response:", response); // Debug log
      console.log("Response data:", response.data); // Debug log

      // Handle different response structures
      let resultData;
      if (response.data && Array.isArray(response.data)) {
        resultData = response.data;
      } else if (response.data && response.data.pumps) {
        resultData = response.data.pumps;
      } else if (response.data) {
        resultData = [response.data];
      } else {
        resultData = response;
      }

      console.log("Processed result data:", resultData); // Debug log
      setResult(resultData);
      setData(resultData);
    } catch (err) {
      console.error("Error calculating plumbing pump:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      flowrateLpm: 2000,
      pipeMaterial: "GI",
      frictionalLossCoefficient: 120,
      pipeDiameter: 150,
      totalHead: 70,
      efficiency: 70,
    });
    setResult(null);
  };

  return (
    <div className="flex h-[92vh]">
      {/* Left Form Section */}
      <div className="flex-1 w-[400px] bg-white border-r border-gray-300 text-sm font-medium flex flex-col">
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FirePumpIcon size={32} />
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Plumbing Pump Sizing Calculator
                </h2>
                <p className="text-xs text-gray-400">Updated: Just now</p>
              </div>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={resetForm}
            >
              🔄
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Flow Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Flow Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flow Rate (L/min)
                    </label>
                    <input
                      type="number"
                      name="flowrateLpm"
                      value={formData.flowrateLpm}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pipe Material
                    </label>
                    <select
                      name="pipeMaterial"
                      value={formData.pipeMaterial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GI">Galvanized Iron (GI)</option>
                      <option value="CI">Cast Iron (CI)</option>
                      <option value="PVC">PVC</option>
                      <option value="Steel">Steel</option>
                      <option value="HDPE">HDPE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pipe Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Pipe Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pipe Diameter (mm)
                    </label>
                    <input
                      type="number"
                      name="pipeDiameter"
                      value={formData.pipeDiameter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Friction Loss Coefficient
                    </label>
                    <input
                      type="number"
                      name="frictionalLossCoefficient"
                      value={formData.frictionalLossCoefficient}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Total Head Loss */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Total Head Loss
                </h2>
                <input
                  type="number"
                  name="totalHead"
                  value={formData.totalHead}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  required
                />
              </div>

              {/* Pump Performance */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Pump Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pump Efficiency (%)
                    </label>
                    <input
                      type="number"
                      name="efficiency"
                      value={formData.efficiency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Pump Sizing"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Results Section */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Pump Sizing Results
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
              {/* Pump Sizing Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pump Sizing Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Flow Rate
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {(() => {
                        const flowRate =
                          Array.isArray(result) && result[0]
                            ? result[0].flowrate_lpm
                            : result?.flowrate_lpm;
                        return flowRate ? `${flowRate} L/min` : "N/A";
                      })()}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Total Head
                    </div>
                    <div className="text-lg font-semibold text-green-800">
                      {(() => {
                        const totalHead =
                          Array.isArray(result) && result[0]
                            ? result[0].total_head
                            : result?.total_head;
                        return totalHead ? `${totalHead} m` : "N/A";
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pump Specifications */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pump Specifications
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Efficiency:
                    </span>
                    <span className="text-gray-800">
                      {(() => {
                        const efficiency =
                          Array.isArray(result) && result[0]
                            ? result[0].efficiency
                            : result?.efficiency;
                        return efficiency ? `${efficiency}%` : "N/A";
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Power:</span>
                    <span className="text-gray-800">
                      {(() => {
                        const powerKw =
                          Array.isArray(result) && result[0]
                            ? result[0].pump_capacity_kw
                            : result?.pump_capacity_kw;
                        const powerHp =
                          Array.isArray(result) && result[0]
                            ? result[0].pump_capacity_hp
                            : result?.pump_capacity_hp;
                        return powerKw
                          ? `${powerKw} kW (${powerHp || "N/A"} HP)`
                          : "N/A";
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pipe Configuration */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pipe Configuration
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pipe Material:
                    </span>
                    <span className="text-gray-800">
                      {(() => {
                        const material =
                          Array.isArray(result) && result[0]
                            ? result[0].pipe_material
                            : result?.pipe_material;
                        return material || "N/A";
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pipe Diameter:
                    </span>
                    <span className="text-gray-800">
                      {(() => {
                        const diameter =
                          Array.isArray(result) && result[0]
                            ? result[0].pipe_dia
                            : result?.pipe_dia;
                        return diameter ? `${diameter} mm` : "N/A";
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Friction Coefficient:
                    </span>
                    <span className="text-gray-800">
                      {(() => {
                        const coefficient =
                          Array.isArray(result) && result[0]
                            ? result[0].friction_loss_coefficient
                            : result?.friction_loss_coefficient;
                        return coefficient || "N/A";
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Flow Rate
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      {(() => {
                        const flowRate =
                          Array.isArray(result) && result[0]
                            ? result[0].flowrate_lpm
                            : result?.flowrate_lpm;
                        return flowRate ? `${flowRate} L/min` : "N/A";
                      })()}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Power Required
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      {(() => {
                        const powerKw =
                          Array.isArray(result) && result[0]
                            ? result[0].pump_capacity_kw
                            : result?.pump_capacity_kw;
                        return powerKw ? `${powerKw} kW` : "N/A";
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !isLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🚒</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate Pump Sizing" to see
                results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlumbingPumpPage;
