import React, { useState } from "react";
import { useAddFirePumpMutation } from "../../redux/features/api/api";
import FirePumpIcon from "../../icons/FirePumpIcon";

const FirePumpPage = ({ setData }) => {
  const [formData, setFormData] = useState({
    stationArea: 3000,
    totalPdArea: 250,
    stationHeight: 15,
    flowrateMeter: 0.038,
    pipeMaterial: "GI",
    frictionalLossCoefficient: 120,
    pipeDiameter: 150,
    residualHead: 50,
    totalPressureLoss: 70,
    totalHead: 70,
    efficiency: 70,
    pumpCapacity: 70,
  });

  const [result, setResult] = useState(null);
  const [addFirePump, { isLoading, error }] = useAddFirePumpMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await addFirePump({
        stations: [
          {
            station_area: formData.stationArea,
            total_pd_area: formData.totalPdArea,
            station_height: formData.stationHeight,
            flowrate_lpm: formData.flowrateMeter * 1000,
            pipe_material: formData.pipeMaterial,
            friction_loss_coefficient: formData.frictionalLossCoefficient,
            pipe_dia: formData.pipeDiameter,
            residual_head: formData.residualHead,
            total_pressure_loss: formData.totalPressureLoss,
            efficiency: formData.efficiency.toString(),
          },
        ],
      }).unwrap();

      setResult(response.data);
      setData(response.data);
    } catch (err) {
      console.error("Error calculating fire pump:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      stationArea: 3000,
      totalPdArea: 250,
      stationHeight: 15,
      flowrateMeter: 0.038,
      pipeMaterial: "GI",
      frictionalLossCoefficient: 120,
      pipeDiameter: 150,
      residualHead: 50,
      totalPressureLoss: 70,
      totalHead: 70,
      efficiency: 70,
      pumpCapacity: 70,
    });
    setResult(null);
  };

  const getFlowRateLpm = () => {
    return (formData.flowrateMeter * 1000).toFixed(2);
  };

  const getPumpPower = () => {
    const flowRateLps = formData.flowrateMeter;
    const totalHeadM = formData.totalHead;
    const efficiency = formData.efficiency / 100;
    const density = 1000;
    const gravity = 9.81;

    return (
      (flowRateLps * density * gravity * totalHeadM) /
      (efficiency * 1000)
    ).toFixed(2);
  };

  return (
    <div className="flex h-[92vh]">
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col ">
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FirePumpIcon size={32} />
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Fire Pump Sizing Calculator
                </h2>
                <p className="text-xs text-gray-400">Updated: Just now</p>
              </div>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={resetForm}
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Fire Pump Sizing Calculator
              </h1>
              <button
                onClick={resetForm}
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
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Station Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Station Area (m²)
                    </label>
                    <input
                      type="number"
                      name="stationArea"
                      value={formData.stationArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter station area"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total PD Area (m²)
                    </label>
                    <input
                      type="number"
                      name="totalPdArea"
                      value={formData.totalPdArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter total PD area"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Station Height (m)
                    </label>
                    <input
                      type="number"
                      name="stationHeight"
                      value={formData.stationHeight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter station height"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Flow Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flow Rate (m³/s)
                    </label>
                    <input
                      type="number"
                      name="flowrateMeter"
                      value={formData.flowrateMeter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter flow rate"
                      step="0.001"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Equivalent: {getFlowRateLpm()} L/min
                    </p>
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
                      placeholder="Enter pipe diameter"
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
                      placeholder="Enter coefficient"
                      step="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Head & Pressure Requirements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Residual Head (m)
                    </label>
                    <input
                      type="number"
                      name="residualHead"
                      value={formData.residualHead}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter residual head"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Pressure Loss (m)
                    </label>
                    <input
                      type="number"
                      name="totalPressureLoss"
                      value={formData.totalPressureLoss}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter pressure loss"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Head (m)
                    </label>
                    <input
                      type="number"
                      name="totalHead"
                      value={formData.totalHead}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter total head"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>

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
                      placeholder="Enter efficiency"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pump Capacity (L/min)
                    </label>
                    <input
                      type="number"
                      name="pumpCapacity"
                      value={formData.pumpCapacity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter pump capacity"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Pump Power Estimation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <span className="font-medium">Flow Rate:</span>{" "}
                      {getFlowRateLpm()} L/min
                    </div>
                    <div>
                      <span className="font-medium">Total Head:</span>{" "}
                      {formData.totalHead} m
                    </div>
                    <div>
                      <span className="font-medium">Efficiency:</span>{" "}
                      {formData.efficiency}%
                    </div>
                    <div>
                      <span className="font-medium">Estimated Power:</span>{" "}
                      {getPumpPower()} kW
                    </div>
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pump Sizing Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Required Flow Rate
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {getFlowRateLpm()} L/min
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Total Head
                    </div>
                    <div className="text-lg font-semibold text-green-800">
                      {formData.totalHead} m
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pump Specifications
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Flow Rate:
                    </span>
                    <span className="text-gray-800">
                      {getFlowRateLpm()} L/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Total Head:
                    </span>
                    <span className="text-gray-800">
                      {formData.totalHead} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pump Efficiency:
                    </span>
                    <span className="text-gray-800">
                      {formData.efficiency}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pump Capacity:
                    </span>
                    <span className="text-gray-800">
                      {formData.pumpCapacity} L/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Estimated Power:
                    </span>
                    <span className="text-gray-800">{getPumpPower()} kW</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Station Parameters
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Station Area:
                    </span>
                    <span className="text-gray-800">
                      {formData.stationArea} m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Total PD Area:
                    </span>
                    <span className="text-gray-800">
                      {formData.totalPdArea} m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Station Height:
                    </span>
                    <span className="text-gray-800">
                      {formData.stationHeight} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Residual Head:
                    </span>
                    <span className="text-gray-800">
                      {formData.residualHead} m
                    </span>
                  </div>
                </div>
              </div>

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
                      {formData.pipeMaterial}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pipe Diameter:
                    </span>
                    <span className="text-gray-800">
                      {formData.pipeDiameter} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Friction Coefficient:
                    </span>
                    <span className="text-gray-800">
                      {formData.frictionalLossCoefficient}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Total Pressure Loss:
                    </span>
                    <span className="text-gray-800">
                      {formData.totalPressureLoss} m
                    </span>
                  </div>
                </div>
              </div>

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
                      {getFlowRateLpm()} L/min
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Power Required
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      {getPumpPower()} kW
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className="font-medium">
                        {formData.efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Total Head:</span>
                      <span className="font-medium">
                        {formData.totalHead} m
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Pump Capacity:</span>
                      <span className="font-medium">
                        {formData.pumpCapacity} L/min
                      </span>
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

export default FirePumpPage;
