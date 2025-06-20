import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddWaterDemandMutation } from "../../redux/features/api/api"; // <- Update this path
import FloorPreview from "../shared/FloorPreview";

// Reusable InputRow
const InputRow = ({ label, unit, value, onChange }) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
    <div className="flex gap-[8px]">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`${
          unit ? "w-1/2" : "w-full"
        } h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-gray-200 focus:ring-0 hover:border-gray-400`}
      />
    </div>
  </div>
);

const WaterDemandForm = ({ setData }) => {
  const [staff, setStaff] = useState();
  const [passenger, setPassenger] = useState();
  const [pdArea, setPdArea] = useState();
  const [pdOccupancy, setPdOccupancy] = useState();
  const [stationCleaningArea, setStationCleaningArea] = useState();
  const [gardeningArea, setGardeningArea] = useState();
  const [totalWaterRequirement, setTotalWaterRequirement] = useState();
  const [ugWaterTankRequirementFullDay, setUgWaterTankRequirementFullDay] =
    useState();
  const [ugWaterTankRequirementHalfDay, setUgWaterTankRequirementHalfDay] =
    useState();

  const [addWaterDemand, { isLoading }] = useAddWaterDemandMutation();

  const handleCalculate = async () => {
    try {
      const response = await addWaterDemand({
        water_demand: [
          {
            num_staff: staff || 0,
            num_passenger: passenger || 0,
            pd_area: pdArea || 0,
            pd_occupancy: pdOccupancy || 0,
            station_area_cleaning: stationCleaningArea || 0,
            gardening_area: gardeningArea || 0,
            total_water_requirement: totalWaterRequirement || 0,
            ug_water_tank_full_day: ugWaterTankRequirementFullDay || 0,
            ug_water_tank_half_day: ugWaterTankRequirementHalfDay || 0,
          },
        ],
      }).unwrap();

      if (response && response.data) {
        setData(response.data);
        console.log("Water demand saved:", response.data);
      }
    } catch (error) {
      console.error("Failed to add water demand:", error);
    }
  };

  const handleReload = () => {
    console.log("Reload clicked");
  };

  return (
    <div className="flex ">
      <div className="w-[340px] h-[90vh] flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] leading-none">
              Water Demand
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-[4px]">No update yet</p>
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
          <InputRow label="Number of Staff" value={staff} onChange={setStaff} />
          <InputRow
            label="Number of Passengers"
            value={passenger}
            onChange={setPassenger}
          />
          <InputRow label="PD Area" value={pdArea} onChange={setPdArea} />
          <InputRow
            label="PD Occupancy"
            value={pdOccupancy}
            onChange={setPdOccupancy}
          />
          <InputRow
            label="Station Area for Cleaning"
            value={stationCleaningArea}
            onChange={setStationCleaningArea}
          />
          <InputRow
            label="Area for Gardening"
            value={gardeningArea}
            onChange={setGardeningArea}
          />
          <InputRow
            label="Total Water Requirement"
            value={totalWaterRequirement}
            onChange={setTotalWaterRequirement}
          />
          <InputRow
            label="UG Water Tank Requirement For Full Day"
            value={ugWaterTankRequirementFullDay}
            onChange={setUgWaterTankRequirementFullDay}
          />
          <InputRow
            label="UG Water Tank Requirement For Half Day"
            value={ugWaterTankRequirementHalfDay}
            onChange={setUgWaterTankRequirementHalfDay}
          />
        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-4">
          <button
            className="w-full h-[40px] bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-[14px] font-semibold rounded-md transition"
            onClick={handleCalculate}
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate"}
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
