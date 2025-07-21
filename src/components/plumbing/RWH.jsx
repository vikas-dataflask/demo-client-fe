import React, { useState, useEffect } from "react";
import FloorPreview from "../shared/FloorPreview";
import { 
  useAddRwhSizingMutation,
  useSaveRwhDataMutation,
  useGetRwhDataByProjectQuery
} from "../../redux/features/api/api";
import { useParams } from "react-router-dom";

const DEFAULTS = {
  annualRainfallMm: 800,
  pitVolumeM3: 10,
  areas: [
    { type: "paved", area: 100, label: "Paved/Concrete" },
    { type: "roof", area: 50, label: "Roof" },
    { type: "lawn", area: 30, label: "Lawns" },
    { type: "road", area: 20, label: "Road" },
  ],
};

const AREA_TYPES = [
  {
    type: "paved",
    label: "Paved/Concrete",
    coefficient: 0.8,
    color: "#3B82F6",
  },
  { type: "roof", label: "Roof", coefficient: 0.7, color: "#EF4444" },
  { type: "lawn", label: "Lawns", coefficient: 0.5, color: "#10B981" },
  { type: "road", label: "Road", coefficient: 0.9, color: "#6B7280" },
  { type: "garden", label: "Garden", coefficient: 0.3, color: "#059669" },
  { type: "parking", label: "Parking", coefficient: 0.85, color: "#7C3AED" },
];

// CSV Export function
const exportToCSV = (result) => {
  const csvContent = [
    ["Parameter", "Value", "Unit"],
    ["Total Catchment Area", result.totalCatchmentAreaM2, "m²"],
    ["Annual Rainfall", result.annualRainfallMm, "mm"],
    ["Weighted Runoff Coefficient", result.weightedRunoffCoefficient, ""],
    ["Pit Volume", result.recommendedPitSizeM3, "m³"],
    ["Total Annual Harvest", result.totalAnnualHarvestL, "L/year"],
    ["Number of Pits Required", result.pitCount, ""],
    ["", "", ""],
    ["Area Breakdown:", "", ""],
    ...result.areas.map((area) => [area.label, area.area, "m²"]),
    ["", "", ""],
    ["Calculation Date", new Date().toLocaleDateString(), ""],
    ["Calculation Time", new Date().toLocaleTimeString(), ""],
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rwh_calculation_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const RWH = ({ setData }) => {
  const { projectId } = useParams();
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addRwhSizing, { isLoading: calculationLoading }] = useAddRwhSizingMutation();
  const [saveRwhData, { isLoading: saveLoading, error: saveError }] = useSaveRwhDataMutation();
  const { data: savedData, isLoading: autoFillLoading } = useGetRwhDataByProjectQuery(projectId, { skip: !projectId });

  const [error, setError] = useState("");

  // Autofill data when saved data is loaded
  useEffect(() => {
    if (savedData?.data?.input_data) {
      const inputData = savedData.data.input_data;
      setForm({
        annualRainfallMm: inputData.annualRainfallMm || 800,
        pitVolumeM3: inputData.pitVolumeM3 || 10,
        areas: inputData.areas || DEFAULTS.areas,
      });
      // Set the result data from the saved result_data field
      if (savedData.data.result_data) {
        setResult(savedData.data.result_data);
      }
    }
  }, [savedData]);

  // Calculate weighted runoff coefficient
  const calculateWeightedRunoffCoefficient = (areas) => {
    const totalArea = areas.reduce((sum, area) => sum + area.area, 0);
    if (totalArea === 0) return 0;

    const weightedSum = areas.reduce((sum, area) => {
      const areaType = AREA_TYPES.find((type) => type.type === area.type);
      return sum + area.area * (areaType?.coefficient || 0);
    }, 0);

    return weightedSum / totalArea;
  };

  // Calculate total catchment area
  const totalCatchmentArea = form.areas.reduce(
    (sum, area) => sum + area.area,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "pitVolumeM3" || name === "annualRainfallMm"
          ? Number(value)
          : value,
    }));
  };

  const handleAreaChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      areas: prev.areas.map((area, i) =>
        i === index
          ? { ...area, [field]: field === "area" ? Number(value) : value }
          : area
      ),
    }));
  };

  const addArea = () => {
    setForm((prev) => ({
      ...prev,
      areas: [...prev.areas, { type: "paved", area: 0, label: "New Area" }],
    }));
  };

  const removeArea = (index) => {
    if (form.areas.length > 1) {
      setForm((prev) => ({
        ...prev,
        areas: prev.areas.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      alert("Please select a project before calculating!");
      return;
    }

    if (totalCatchmentArea === 0) {
      setError("Please add at least one area with a value greater than 0");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const weightedRunoffCoefficient = calculateWeightedRunoffCoefficient(
        form.areas
      );

      const requestData = {
        catchmentAreaM2: totalCatchmentArea,
        annualRainfallMm: form.annualRainfallMm,
        runoffCoefficient: weightedRunoffCoefficient,
        pitVolumeM3: form.pitVolumeM3,
        areas: form.areas.map((area) => ({
          ...area,
          coefficient:
            AREA_TYPES.find((type) => type.type === area.type)?.coefficient ||
            0,
        })),
      };

      const response = await addRwhSizing(requestData).unwrap();

      if (!response.success) {
        setError(response.message || "Calculation failed");
      } else {
        const enhancedResult = {
          ...response.data,
          totalCatchmentAreaM2: totalCatchmentArea,
          weightedRunoffCoefficient,
          areas: form.areas.map((area) => ({
            ...area,
            coefficient:
              AREA_TYPES.find((type) => type.type === area.type)?.coefficient ||
              0,
          })),
        };

        setResult(enhancedResult);
        setData(enhancedResult);

        // Save the data to the database
        try {
          await saveRwhData({
            project_id: projectId,
            input_data: requestData,
            result_data: enhancedResult,
          }).unwrap();
          console.log("RWH data saved successfully");
        } catch (saveErr) {
          console.error("Error saving RWH data:", saveErr);
        }
      }
    } catch (err) {
      console.error("RWH API Error:", err);
      setError("Network or server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const weightedRunoffCoefficient = calculateWeightedRunoffCoefficient(
    form.areas
  );

  return (
    <div className="flex h-[92vh]">
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col ">
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-800">
                Rainwater Harvesting Pit Sizing Calculator
              </h2>
              <p className="text-xs text-gray-400">Multi-Area Support</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Area Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Catchment Areas
                  </h2>
                  <button
                    type="button"
                    onClick={addArea}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    + Add Area
                  </button>
                </div>

                <div className="space-y-4">
                  {form.areas.map((area, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-end p-4 bg-white rounded-lg border"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area Type
                        </label>
                        <select
                          value={area.type}
                          onChange={(e) => {
                            const selectedType = AREA_TYPES.find(
                              (type) => type.type === e.target.value
                            );
                            handleAreaChange(index, "type", e.target.value);
                            handleAreaChange(
                              index,
                              "label",
                              selectedType?.label || "New Area"
                            );
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {AREA_TYPES.map((type) => (
                            <option key={type.type} value={type.type}>
                              {type.label} (Coeff: {type.coefficient})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area (m²)
                        </label>
                        <input
                          type="number"
                          value={area.area}
                          onChange={(e) =>
                            handleAreaChange(index, "area", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter area"
                          step="0.1"
                          min="0"
                          max="10000"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Runoff Coeff.
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                          {AREA_TYPES.find((type) => type.type === area.type)
                            ?.coefficient || 0}
                        </div>
                      </div>
                      {form.areas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArea(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Total Catchment Area:
                      </span>
                      <span className="ml-2 font-semibold text-blue-800">
                        {totalCatchmentArea} m²
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Weighted Runoff Coefficient:
                      </span>
                      <span className="ml-2 font-semibold text-blue-800">
                        {weightedRunoffCoefficient.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      name="annualRainfallMm"
                      value={form.annualRainfallMm}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter annual rainfall"
                      step="0.1"
                      min="1"
                      max="5000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: 1 - 5,000 mm
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pit Volume (m³)
                    </label>
                    <input
                      type="number"
                      name="pitVolumeM3"
                      value={form.pitVolumeM3}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter pit volume"
                      step="0.1"
                      min="1"
                      max="1000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: 1 - 1,000 m³
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={loading || calculationLoading || saveLoading || totalCatchmentArea === 0}
              >
                {loading || calculationLoading || saveLoading ? "Calculating..." : "Calculate RWH Pit Sizing"}
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
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800 font-semibold">Error</div>
              <div className="text-red-700">
                {saveError.data?.message ||
                  saveError.error ||
                  "An error occurred while saving"}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Calculation Summary
                  </h3>
                  <button
                    onClick={() => exportToCSV(result)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                  >
                    📊 Export CSV
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Total Annual Harvest
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {result.totalAnnualHarvestL.toLocaleString()} L/year
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Number of Pits
                    </div>
                    <div className="text-lg font-semibold text-green-800">
                      {result.pitCount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Area Breakdown
                </h3>
                <div className="space-y-3">
                  {result.areas.map((area, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: AREA_TYPES.find(
                              (type) => type.type === area.type
                            )?.color,
                          }}
                        ></div>
                        <span className="text-sm font-medium">
                          {area.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {area.area} m² (Coeff: {area.coefficient})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detailed Results
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Total Catchment Area:
                    </span>
                    <span className="text-gray-800">
                      {result.totalCatchmentAreaM2} m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Annual Rainfall:
                    </span>
                    <span className="text-gray-800">
                      {result.annualRainfallMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Weighted Runoff Coefficient:
                    </span>
                    <span className="text-gray-800">
                      {result.weightedRunoffCoefficient.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pit Volume:
                    </span>
                    <span className="text-gray-800">
                      {result.recommendedPitSizeM3} m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Total Harvest:
                    </span>
                    <span className="text-gray-800">
                      {result.totalAnnualHarvestL.toLocaleString()} L/year
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Pits Required:
                    </span>
                    <span className="text-gray-800">{result.pitCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Interpretation
                </h3>
                <div className="text-sm text-gray-700">
                  For a total catchment area of{" "}
                  <b>{result.totalCatchmentAreaM2} m²</b> with a weighted runoff
                  coefficient of{" "}
                  <b>{result.weightedRunoffCoefficient.toFixed(3)}</b> and
                  annual rainfall of <b>{result.annualRainfallMm} mm</b>, you
                  can harvest approximately{" "}
                  <b>{result.totalAnnualHarvestL.toLocaleString()} liters</b> of
                  rainwater per year. With a pit size of{" "}
                  <b>{result.recommendedPitSizeM3} m³</b>, you will need{" "}
                  <b>{result.pitCount}</b> pit(s) to store the annual harvest.
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !calculationLoading && !autoFillLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🌧️</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Add areas and click "Calculate RWH Pit Sizing" to see results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RWH;
