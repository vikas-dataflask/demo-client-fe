import React, { useState } from "react";
import { useAddFireHLMutation } from "../../redux/features/api/api";
// import FireHeadLossIcon from "../../icons/FireHeadLossIcon";

const FireHeadLossForm = ({ setData }) => {
  const [formData, setFormData] = useState({
    pipeDiameter: "150",
    pipeMaterial: "Steel",
    pipeLengthHorizontal: "",
    pipeLengthVertical: "",
    fittings: {
      SE90: 0,
      SE45: 0,
      WE90: 0,
      GV: 0,
      NRV: 0,
      BFV: 0,
      GLV: 0,
      OTHER: 0,
    },
    frictionalLossCoefficient: 120,
    flowrateLpm: "",
    staticLossMeter: 0,
    staticGainMeter: 0,
  });

  const [result, setResult] = useState(null);
  const [addFireHL, { isLoading, error }] = useAddFireHLMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFittingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      fittings: {
        ...prev.fittings,
        [name]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      pipeDia: parseInt(formData.pipeDiameter),
      pipeMaterial: formData.pipeMaterial,
      pipeLengthHorizontal: parseFloat(formData.pipeLengthHorizontal),
      pipeLengthVertical: parseFloat(formData.pipeLengthVertical),
      fittings: formData.fittings,
      frictionalLossCoefficient: parseFloat(formData.frictionalLossCoefficient),
      flowrateLpm: parseFloat(formData.flowrateLpm),
      staticLossMeter: parseFloat(formData.staticLossMeter),
      staticGainMeter: parseFloat(formData.staticGainMeter),
    };

    try {
      const response = await addFireHL(requestData).unwrap();
      setResult(response.data);
      setData(response.data);
    } catch (err) {
      console.error("Fire head loss calculation error:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      pipeDiameter: "150",
      pipeMaterial: "Steel",
      pipeLengthHorizontal: "",
      pipeLengthVertical: "",
      fittings: {
        SE90: 0,
        SE45: 0,
        WE90: 0,
        GV: 0,
        NRV: 0,
        BFV: 0,
        GLV: 0,
        OTHER: 0,
      },
      frictionalLossCoefficient: 120,
      flowrateLpm: "",
      staticLossMeter: 0,
      staticGainMeter: 0,
    });
    setResult(null);
  };

  const getTotalFittings = () => {
    return Object.values(formData.fittings).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const getEquivalentLength = () => {
    const diameter = parseInt(formData.pipeDiameter);
    let totalEquivalent = 0;

    Object.entries(formData.fittings).forEach(([fitting, count]) => {
      const equivalentFactors = {
        SE90: 30,
        SE45: 16,
        WE90: 30,
        GV: 8,
        NRV: 100,
        BFV: 0,
        GLV: 0,
        OTHER: 0,
      };
      totalEquivalent +=
        (equivalentFactors[fitting] || 0) * count * (diameter / 1000);
    });

    return totalEquivalent;
  };

  return (
    <div className="flex h-[92vh]">
      {/* Left Sidebar - Form */}
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col ">
        {/* Header */}
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {/* <FireHeadLossIcon size={32} /> */}
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Fire Head Loss Calculator
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

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Fire Fighting Head Loss Calculator
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
              {/* Pipe Configuration Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Pipe Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pipe Diameter
                    </label>
                    <select
                      name="pipeDiameter"
                      value={formData.pipeDiameter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="100">100 mm</option>
                      <option value="150">150 mm</option>
                      <option value="200">200 mm</option>
                      <option value="250">250 mm</option>
                      <option value="300">300 mm</option>
                    </select>
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
                      <option value="Steel">Steel (C=120)</option>
                      <option value="Cast Iron">Cast Iron (C=100)</option>
                      <option value="PVC">PVC (C=150)</option>
                      <option value="HDPE">HDPE (C=150)</option>
                      <option value="Copper">Copper (C=130)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hazen-Williams Coefficient
                    </label>
                    <input
                      type="number"
                      name="frictionalLossCoefficient"
                      value={formData.frictionalLossCoefficient}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter coefficient"
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {/* Pipe Lengths Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Pipe Lengths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horizontal Length (m)
                    </label>
                    <input
                      type="number"
                      name="pipeLengthHorizontal"
                      value={formData.pipeLengthHorizontal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter horizontal length"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vertical Length (m)
                    </label>
                    <input
                      type="number"
                      name="pipeLengthVertical"
                      value={formData.pipeLengthVertical}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter vertical length"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Fittings Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Fittings & Valves
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SE 90° Elbows
                    </label>
                    <input
                      type="number"
                      name="SE90"
                      value={formData.fittings.SE90}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SE 45° Elbows
                    </label>
                    <input
                      type="number"
                      name="SE45"
                      value={formData.fittings.SE45}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WE 90° Elbows
                    </label>
                    <input
                      type="number"
                      name="WE90"
                      value={formData.fittings.WE90}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gate Valves
                    </label>
                    <input
                      type="number"
                      name="GV"
                      value={formData.fittings.GV}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check Valves
                    </label>
                    <input
                      type="number"
                      name="NRV"
                      value={formData.fittings.NRV}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Butterfly Valves
                    </label>
                    <input
                      type="number"
                      name="BFV"
                      value={formData.fittings.BFV}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Globe Valves
                    </label>
                    <input
                      type="number"
                      name="GLV"
                      value={formData.fittings.GLV}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Fittings
                    </label>
                    <input
                      type="number"
                      name="OTHER"
                      value={formData.fittings.OTHER}
                      onChange={handleFittingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Fittings Summary */}
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Fittings Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                    <div>
                      <span className="font-medium">Total Fittings:</span>{" "}
                      {getTotalFittings()}
                    </div>
                    <div>
                      <span className="font-medium">Equivalent Length:</span>{" "}
                      {getEquivalentLength().toFixed(2)} m
                    </div>
                    <div>
                      <span className="font-medium">Pipe Diameter:</span>{" "}
                      {formData.pipeDiameter} mm
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow & Static Conditions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Flow & Static Conditions
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
                      placeholder="Enter flow rate"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Static Loss (m)
                    </label>
                    <input
                      type="number"
                      name="staticLossMeter"
                      value={formData.staticLossMeter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter static loss"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Static Gain (m)
                    </label>
                    <input
                      type="number"
                      name="staticGainMeter"
                      value={formData.staticGainMeter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter static gain"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Head Loss"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Results */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Head Loss Results
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
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Total Head Loss
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {result.totalPressureLossBar} bar
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Friction Loss
                    </div>
                    <div className="text-lg font-semibold text-green-800">
                      {result.pressureLossTotalBar} bar
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detailed Results
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Friction Loss:
                    </span>
                    <span className="text-gray-800">
                      {result.pressureLossTotalBar} bar
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Static Loss:
                    </span>
                    <span className="text-gray-800">
                      {result.staticLossMeter} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Static Gain:
                    </span>
                    <span className="text-gray-800">
                      {result.staticGainMeter} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Total Head:
                    </span>
                    <span className="text-gray-800">
                      {result.totalPressureLossBar} bar
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pressure Loss/m:
                    </span>
                    <span className="text-gray-800">
                      {result.pressureLossPerMeterBar} bar/m
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Parameters */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Input Parameters
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pipe Diameter:
                    </span>
                    <span className="text-gray-800">{result.pipeDia} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pipe Material:
                    </span>
                    <span className="text-gray-800">{result.pipeMaterial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Horizontal Length:
                    </span>
                    <span className="text-gray-800">
                      {result.pipeLengthHorizontal} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Vertical Length:
                    </span>
                    <span className="text-gray-800">
                      {result.pipeLengthVertical} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Flow Rate:
                    </span>
                    <span className="text-gray-800">
                      {result.flowrateLpm} L/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Friction Coefficient:
                    </span>
                    <span className="text-gray-800">
                      {result.frictionalLossCoefficient}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fittings Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Fittings Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(result.fittings).map(
                    ([fitting, count]) =>
                      count > 0 && (
                        <div key={fitting} className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            {fitting}:
                          </span>
                          <span className="text-gray-800">{count}</span>
                        </div>
                      )
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600">Total Fittings:</span>
                      <span className="text-gray-800">
                        {Object.values(result.fittings).reduce(
                          (sum, count) => sum + count,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !isLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🔥</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate Head Loss" to see results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FireHeadLossForm;
