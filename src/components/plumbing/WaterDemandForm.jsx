import React, { useState, useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";
import {
  useGetBuildingTypeMutation,
  useAddWaterDemandMutation,
} from "../../redux/features/api/api";

// Reusable InputRow
const InputRow = ({
  label,
  unit,
  value,
  onChange,
  readOnly = false,
  type = "number",
  placeholder = "",
}) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
    <div className="flex gap-[8px]">
      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            type === "number" ? parseFloat(e.target.value) : e.target.value
          )
        }
        readOnly={readOnly}
        placeholder={placeholder}
        className={`${
          unit ? "w-1/2" : "w-full"
        } h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-gray-200 focus:ring-0 hover:border-gray-400 ${
          readOnly ? "cursor-not-allowed bg-gray-100" : ""
        }`}
      />
    </div>
  </div>
);

const WaterDemandForm = ({ setData }) => {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState("");
  const [formData, setFormData] = useState({
    unitCount: "",
    areaM2: "",
    landscapeM2: "",
    ufwPercentage: 15,
    kitchenLaundryPercentage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [getBuildingTypes, { isLoading: loadingTypes }] =
    useGetBuildingTypeMutation();
  const [addWaterDemand, { isLoading: calculating }] =
    useAddWaterDemandMutation();

  // Fetch building types on component mount
  useEffect(() => {
    fetchBuildingTypes();
  }, []);

  const fetchBuildingTypes = async () => {
    try {
      const response = await getBuildingTypes().unwrap();
      if (response.success) {
        setBuildingTypes(response.data);
        if (response.data.length > 0) {
          setSelectedBuildingType(response.data[0].type);
        }
      } else {
        setError(response.message || "Failed to fetch building types");
      }
    } catch (error) {
      console.error("Failed to fetch building types:", error);
      setError("Failed to fetch building types");
    }
  };

  const handleBuildingTypeChange = (buildingType) => {
    setSelectedBuildingType(buildingType);
    // Reset form data when building type changes
    setFormData({
      unitCount: "",
      areaM2: "",
      landscapeM2: "",
      ufwPercentage: 15,
      kitchenLaundryPercentage: 10,
    });
    setResult(null);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getSelectedBuildingInfo = () => {
    return buildingTypes.find((type) => type.type === selectedBuildingType);
  };

  const getInputType = () => {
    const buildingInfo = getSelectedBuildingInfo();
    return buildingInfo?.inputType || "units";
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const buildingInfo = getSelectedBuildingInfo();
      if (!buildingInfo) {
        setError("Please select a building type");
        return;
      }

      const inputType = getInputType();
      const inputValue =
        inputType === "units" ? formData.unitCount : formData.areaM2;

      if (!inputValue || inputValue <= 0) {
        setError(
          `${
            inputType === "units" ? "Unit count" : "Area"
          } must be greater than 0`
        );
        return;
      }

      const requestData = {
        buildingType: selectedBuildingType,
        unitCount: inputType === "units" ? inputValue : undefined,
        areaM2: inputType === "area" ? inputValue : undefined,
        landscapeM2: parseFloat(formData.landscapeM2) || 0,
        ufwPercentage: parseFloat(formData.ufwPercentage) || 15,
        kitchenLaundryPercentage:
          parseFloat(formData.kitchenLaundryPercentage) || 10,
      };

      const response = await addWaterDemand(requestData).unwrap();

      if (!response.success) {
        setError(response.message || "Calculation failed");
      } else {
        setResult(response.data);
        setData([response.data]); // Wrap in array for modal compatibility
      }
    } catch (error) {
      console.error("Water demand calculation failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchBuildingTypes();
    setResult(null);
    setError("");
  };

  const buildingInfo = getSelectedBuildingInfo();
  const inputType = getInputType();

  return (
    <div className="flex">
      <div className="w-[340px] h-[90vh] flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] leading-none">
              Water Demand Calculator
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-[4px]">
              {buildingInfo ? buildingInfo.description : "Select building type"}
            </p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={handleReload}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[80px] bg-white">
          {/* Building Type Selection */}
          <div className="mb-6">
            <label className="block text-[11px] text-[#6B7280] mb-[6px]">
              Building Type
            </label>
            <select
              value={selectedBuildingType}
              onChange={(e) => handleBuildingTypeChange(e.target.value)}
              className="w-full h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-white focus:ring-0 hover:border-gray-400"
            >
              {buildingTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.type} ({type.lpcd} LPCD)
                </option>
              ))}
            </select>
          </div>

          {/* Building Info */}
          {buildingInfo && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-800">
                <div className="font-medium mb-1">
                  {buildingInfo.description}
                </div>
                <div>LPCD: {buildingInfo.lpcd} liters per capita per day</div>
                <div>
                  Input Type:{" "}
                  {buildingInfo.inputType === "units"
                    ? "Number of Units"
                    : "Area (m²)"}
                </div>
                {buildingInfo.inputType === "units" && (
                  <div>Avg Occupants per Unit: {buildingInfo.avgOccupants}</div>
                )}
                {buildingInfo.inputType === "area" && (
                  <div>Area per Person: {buildingInfo.areaPerPerson} m²</div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Input Fields */}
          {inputType === "units" ? (
            <InputRow
              label="Number of Units"
              value={formData.unitCount}
              onChange={(value) => handleInputChange("unitCount", value)}
              placeholder="Enter number of units"
            />
          ) : (
            <InputRow
              label="Building Area (m²)"
              value={formData.areaM2}
              onChange={(value) => handleInputChange("areaM2", value)}
              placeholder="Enter building area"
            />
          )}

          <InputRow
            label="Landscape Area (m²)"
            value={formData.landscapeM2}
            onChange={(value) => handleInputChange("landscapeM2", value)}
            placeholder="Optional: Enter landscape area"
          />

          <InputRow
            label="UFW Percentage (%)"
            value={formData.ufwPercentage}
            onChange={(value) => handleInputChange("ufwPercentage", value)}
            placeholder="Default: 15"
          />

          <InputRow
            label="Kitchen/Laundry (%)"
            value={formData.kitchenLaundryPercentage}
            onChange={(value) =>
              handleInputChange("kitchenLaundryPercentage", value)
            }
            placeholder="Default: 10"
          />

          {/* Results Preview */}
          {result && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xs text-green-800">
                <div className="font-medium mb-2">Calculation Results:</div>
                <div>Population: {result.population}</div>
                <div>
                  Base Demand: {result.baseDemandL.toLocaleString()} L/day
                </div>
                <div>
                  Total Demand: {result.totalWaterDemandL.toLocaleString()}{" "}
                  L/day
                </div>
                <div>
                  Storage Required:{" "}
                  {result.storageRequirementL.toLocaleString()} L
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xs text-red-800">{error}</div>
            </div>
          )}
        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-4">
          <button
            className="w-full h-[40px] bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-[14px] font-semibold rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleCalculate}
            disabled={loading || !selectedBuildingType}
          >
            {loading ? "Calculating..." : "Calculate Water Demand"}
          </button>
        </div>
      </div>

      {/* Right: Floor Preview */}
      <div className="flex-1 h-[90vh]">
        <FloorPreview />
      </div>
    </div>
  );
};

export default WaterDemandForm;
