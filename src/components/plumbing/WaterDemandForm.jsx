import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";
import {
  useGetStandardBuildingTypesQuery,
  useSaveOrUpdateWaterDemandMutation,
  useGetWaterDemandByProjectQuery,
} from "../../redux/features/api/api";

// === Water Demand Types Mapping ===
const buildingDemandFields = {
  "Metro Elevated Stations": ["passengers", "staff", "floorArea", "greenArea"],
  "Metro Underground Stations": [
    "passengers",
    "staff",
    "floorArea",
    "greenArea",
    "acArea",
  ],
  "Residential Buildings": ["occupants", "floorArea", "greenArea"],
  "Office Buildings": [
    "staff",
    "visitors",
    "floorArea",
    "greenArea",
    "acArea",
    "kitchenPeople",
  ],
  Hotels: [
    "visitors",
    "staff",
    "floorArea",
    "greenArea",
    "acArea",
    "kitchenPeople",
    "spaBeds",
    "poolArea",
  ],
  "Data Centers": [
    "occupants",
    "floorArea",
    "greenArea",
    "acArea",
    "kitchenPeople",
  ],
  "Shopping Malls": [
    "visitors",
    "staff",
    "floorArea",
    "greenArea",
    "acArea",
    "kitchenPeople",
    "cars",
  ],
  Gym: ["occupants", "floorArea", "greenArea"],
  Salon: ["visitors", "staff", "floorArea", "greenArea", "spaBeds"],
  "Car Showroom": ["staff", "visitors", "floorArea", "greenArea", "cars"],
};

// === Labels for User Inputs ===
const labelMap = {
  passengers: "Passengers (No.)",
  staff: "Staff (No.)",
  occupants: "Occupants (No.)",
  visitors: "Visitors (No.)",
  floorArea: "Cleanable Floor Area (m²)",
  greenArea: "Gardening/Green Area (m²)",
  acArea: "Air-conditioned Area (m²)",
  kitchenPeople: "People Using Kitchen/Food Court",
  spaBeds: "Spa Beds / Spa Area (m²)",
  poolArea: "Swimming Pool Surface Area (m²)",
  cars: "Cars Washed Daily (No.)",
};

// === Reusable InputRow Component ===
const InputRow = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const WaterDemandForm = ({ setData }) => {
  const { projectId } = useParams();
  const { data: buildingStandards, refetch } =
    useGetStandardBuildingTypesQuery();
  const [saveOrUpdateWaterDemand, { isLoading: saving }] =
    useSaveOrUpdateWaterDemandMutation();

  const [selectedBuilding, setSelectedBuilding] = useState(
    "Metro Elevated Stations"
  );
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Autofill Query (fetch previously saved)
  const {
    data: autofillData,
    isFetching: autofilling,
    refetch: refetchAutofill,
  } = useGetWaterDemandByProjectQuery(
    { projectId, buildingType: selectedBuilding },
    { skip: !projectId || !selectedBuilding }
  );

  // Autofill form and results when data is fetched
  useEffect(() => {
    if (autofillData?.success && autofillData.data) {
      setFormData(autofillData.data.inputs || {});
      setResult(autofillData.data.result || null);
    }
  }, [autofillData]);

  // Reset when building changes
  useEffect(() => {
    if (!autofilling && !autofillData?.success) {
      setFormData({});
      setResult(null);
    }
  }, [selectedBuilding]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    if (!selectedBuilding) {
      setError("Please select a building type");
      return;
    }
    if (!projectId) {
      setError("Project ID is required");
      return;
    }
    setError("");
    setResult(null);

    try {
      const payload = {
        projectId,
        buildingType: selectedBuilding,
        inputs: formData,
      };

      const res = await saveOrUpdateWaterDemand(payload).unwrap();
      if (res.success) {
        setResult(res.data.result);
        setData([res.data.result]);
      } else {
        setError("Calculation failed. Please check inputs.");
      }
    } catch {
      setError("Failed to calculate or save water demand.");
    }
  };

  const resetForm = () => {
    setFormData({});
    setResult(null);
    setError("");
  };

  return (
    <div className="flex h-[92vh]">
      {/* Left Form Section */}
      <div className="flex-1 w-[440px] bg-white border-r border-gray-300 text-sm font-medium flex flex-col">
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-md flex items-center justify-center">
                💧
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-800">
                  Water Demand Calculator
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
            <form className="space-y-6">
              {/* Building Selection */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Building Configuration
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Type
                  </label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(buildingStandards?.data || []).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Input Fields */}
              {selectedBuilding && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Building Parameters
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buildingDemandFields[selectedBuilding]?.map((field) => (
                      <InputRow
                        key={field}
                        label={labelMap[field]}
                        value={formData[field]}
                        onChange={(v) => handleInputChange(field, v)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCalculate}
                disabled={saving || autofilling}
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Calculate & Save"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Results Section */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Water Demand Results
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800 font-semibold">Error</div>
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Water Demand Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Water Demand Summary
                </h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="text-gray-800">
                        {value.toLocaleString()} L/day
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-800">Total Demand:</span>
                      <span className="text-blue-600">
                        {result.totalDemand.toLocaleString()} L/day
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !saving && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">💧</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate & Save" to see results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterDemandForm;
