import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // ✅ Add useParams import
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
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
    <input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-white"
    />
  </div>
);

const WaterDemandForm = ({ setData }) => {
  // ✅ Remove projectId prop
  const { projectId } = useParams(); // ✅ Get projectId from URL parameters
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

  // ✅ Autofill Query (fetch previously saved)
  const {
    data: autofillData,
    isFetching: autofilling,
    refetch: refetchAutofill,
  } = useGetWaterDemandByProjectQuery(
    { projectId, buildingType: selectedBuilding },
    { skip: !projectId || !selectedBuilding }
  );

  // ✅ Autofill form and results when data is fetched
  useEffect(() => {
    if (autofillData?.success && autofillData.data) {
      setFormData(autofillData.data.inputs || {});
      setResult(autofillData.data.result || null);
    }
  }, [autofillData]);

  // ✅ Reset when building changes
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
        projectId, // ✅ Include projectId from useParams
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

  return (
    <div className="flex">
      <div className="w-[340px] h-[90vh] bg-white border-r border-gray-200 relative">
        <div className="p-4 border-b border-gray-200 flex justify-between">
          <div>
            <h2 className="text-sm font-semibold">Water Demand Calculator</h2>
            <p className="text-xs text-gray-500">
              Select building and enter details
            </p>
          </div>
          <button
            onClick={() => {
              refetch();
              refetchAutofill();
            }}
            className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center"
          >
            <ReloadIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(90vh-100px)]">
          {/* Building Selection */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-1">
              Building Type
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-md text-sm px-2"
            >
              {(buildingStandards?.data || []).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Input Fields */}
          {selectedBuilding &&
            buildingDemandFields[selectedBuilding]?.map((field) => (
              <InputRow
                key={field}
                label={labelMap[field]}
                value={formData[field]}
                onChange={(v) => handleInputChange(field, v)}
              />
            ))}

          {/* Results */}
          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-800">
              <div className="font-semibold mb-1">Results</div>
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key}>{`${key}: ${value.toLocaleString()} L/day`}</div>
              ))}
              <div className="mt-2 font-semibold">
                Total Demand: {result.totalDemand.toLocaleString()} L/day
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleCalculate}
            disabled={saving || autofilling}
            className="w-full h-10 bg-blue-500 text-white rounded-md"
          >
            {saving ? "Saving..." : "Calculate & Save"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <FloorPreview />
      </div>
    </div>
  );
};

export default WaterDemandForm;
