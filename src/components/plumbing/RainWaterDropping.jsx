import React, { useState } from "react";
import { useAddRainwaterDropSizingMutation } from "../../redux/features/api/api";
import RainWaterIcon from "../../icons/RainWaterIcon";

const RainWaterDropping = ({ setData }) => {
  const [formData, setFormData] = useState({
    roofAreaM2: 250,
    rainfallIntensityMmHr: 109,
    preferredPipeSize: "",
    coefficientDischarge: 0.9,
  });

  const [result, setResult] = useState(null);
  const [addRainwaterDropSizing, { isLoading, error }] =
    useAddRainwaterDropSizingMutation();

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
      const payload = {
        roofAreaM2: Number(formData.roofAreaM2),
        rainfallIntensityMmHr: Number(formData.rainfallIntensityMmHr),
        coefficientDischarge: Number(formData.coefficientDischarge),
        ...(formData.preferredPipeSize &&
        formData.preferredPipeSize !== "" &&
        !isNaN(Number(formData.preferredPipeSize))
          ? { preferredPipeSize: Number(formData.preferredPipeSize) }
          : {}),
      };

      console.log("Sending payload to backend:", payload);
      const response = await addRainwaterDropSizing(payload).unwrap();
      setResult(response.data);
      setData(response.data);
    } catch (err) {
      console.error("Rainwater sizing calculation error:", err);
      console.error("Error details:", {
        status: err.status,
        message: err.data?.message,
        error: err.error,
        data: err.data,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      roofAreaM2: 250,
      rainfallIntensityMmHr: 109,
      preferredPipeSize: "",
      coefficientDischarge: 0.9,
    });
    setResult(null);
  };

  const getDischargePreview = () => {
    const dischargeLps =
      (formData.roofAreaM2 *
        formData.rainfallIntensityMmHr *
        formData.coefficientDischarge) /
      3600;
    return dischargeLps.toFixed(3);
  };

  const getDischargeM3Hr = () => {
    const dischargeLps = parseFloat(getDischargePreview());
    return (dischargeLps * 3.6).toFixed(2);
  };

  const getDischargeLpm = () => {
    const dischargeLps = parseFloat(getDischargePreview());
    return (dischargeLps * 60).toFixed(1);
  };

  const pipeSizeOptions = [
    { value: "", label: "Select preferred size (optional)" },
    { value: 75, label: "75mm - Standard domestic" },
    { value: 100, label: "100mm - Medium capacity" },
    { value: 125, label: "125mm - High capacity" },
    { value: 150, label: "150mm - Commercial/Industrial" },
    { value: 200, label: "200mm - Large commercial" },
    { value: 250, label: "250mm - Industrial" },
    { value: 300, label: "300mm - Large industrial" },
  ];

  return (
    <div className="flex h-screen">
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col h-full">
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <RainWaterIcon size={32} />
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Rainwater Downpipe Sizing Calculator
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
                Rainwater Downpipe Sizing Calculator
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
                  Roof Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Area (m²)
                    </label>
                    <input
                      type="number"
                      name="roofAreaM2"
                      value={formData.roofAreaM2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter roof area"
                      step="0.1"
                      min="1"
                      max="10000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: 1 - 10,000 m²
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rainfall Intensity (mm/hr)
                    </label>
                    <input
                      type="number"
                      name="rainfallIntensityMmHr"
                      value={formData.rainfallIntensityMmHr}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rainfall intensity"
                      step="0.1"
                      min="1"
                      max="500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: 1 - 500 mm/hr
                    </p>
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
                      Preferred Pipe Size (mm)
                    </label>
                    <select
                      name="preferredPipeSize"
                      value={formData.preferredPipeSize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {pipeSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Optional - will validate against calculated requirements
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coefficient of Discharge
                    </label>
                    <input
                      type="number"
                      name="coefficientDischarge"
                      value={formData.coefficientDischarge}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter coefficient"
                      step="0.01"
                      min="0"
                      max="1"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: 0 - 1 (Default: 0.9 for roof drainage)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-4">
                  Discharge Preview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">Discharge:</span>{" "}
                    {getDischargePreview()} L/s
                  </div>
                  <div>
                    <span className="font-medium">Flow Rate:</span>{" "}
                    {getDischargeM3Hr()} m³/hr
                  </div>
                  <div>
                    <span className="font-medium">Flow Rate:</span>{" "}
                    {getDischargeLpm()} L/min
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Based on: {formData.roofAreaM2} m² ×{" "}
                  {formData.rainfallIntensityMmHr} mm/hr ×{" "}
                  {formData.coefficientDischarge}
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Downpipe Sizing"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Sizing Results
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
                  Sizing Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Required Discharge
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {result.dischargeLps} L/s
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Recommended Pipe
                    </div>
                    <div className="text-lg font-semibold text-green-800">
                      {result.recommendedPipeSize} mm
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pipe Specifications
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Recommended Size:
                    </span>
                    <span className="text-gray-800">
                      {result.recommendedPipeSize} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Number of Pipes:
                    </span>
                    <span className="text-gray-800">
                      {result.numberOfPipes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Theoretical Diameter:
                    </span>
                    <span className="text-gray-800">
                      {result.theoreticalDiameterMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Closest Standard:
                    </span>
                    <span className="text-gray-800">
                      {result.closestStandardPipeSize} mm
                    </span>
                  </div>
                  {result.warning && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-amber-600 font-medium">
                        ⚠️ {result.warning}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Discharge Values
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Discharge (L/s):
                    </span>
                    <span className="text-gray-800">
                      {result.dischargeLps} L/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Flow Rate (m³/hr):
                    </span>
                    <span className="text-gray-800">
                      {result.dischargeM3Hr} m³/hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Flow Rate (L/min):
                    </span>
                    <span className="text-gray-800">
                      {result.dischargeLpm} L/min
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Input Parameters
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Roof Area:
                    </span>
                    <span className="text-gray-800">
                      {result.roofAreaM2} m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Rainfall Intensity:
                    </span>
                    <span className="text-gray-800">
                      {result.rainfallIntensityMmHr} mm/hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Coefficient:
                    </span>
                    <span className="text-gray-800">
                      {result.coefficientDischarge}
                    </span>
                  </div>
                  {result.preferredPipeSize && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Preferred Size:
                      </span>
                      <span className="text-gray-800">
                        {result.preferredPipeSize} mm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {result.preferredPipeValidation && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Preferred Pipe Validation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Valid:</span>
                      <span
                        className={`font-medium ${
                          result.preferredPipeValidation.isValid
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {result.preferredPipeValidation.isValid ? "Yes" : "No"}
                      </span>
                    </div>
                    {result.preferredPipeValidation.warning && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-amber-600 font-medium">
                          ⚠️ {result.preferredPipeValidation.warning}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Calculation Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Method:</span>
                    <span className="text-gray-800">
                      {result.calculationMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Timestamp:
                    </span>
                    <span className="text-gray-800">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !isLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🌧️</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate Downpipe Sizing" to see
                results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RainWaterDropping;
