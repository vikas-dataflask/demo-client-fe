import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddRainwaterDropSizingMutation } from "../../redux/features/api/api"; // adjust import path as needed
import FloorPreview from "../shared/FloorPreview";

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

const RainWaterDropping = ({ setData }) => {
  const [area, setArea] = useState("250");
  const [pipes, setPipes] = useState("2");
  const [intensity, setIntensity] = useState("109");
  const [discharge, setDischarge] = useState("0.9");
  const [pipeDiameterMM, setPipeDiameterMM] = useState("5");

  const [addRainwaterDropSizing, { isLoading }] =
    useAddRainwaterDropSizingMutation();

  const handleCalculate = async () => {
    try {
      const payload = {
        roof_area_m2: parseFloat(area),
        num_pipes: parseFloat(pipes),
        intensity_rainfall_mm_h: parseFloat(intensity),
        coefficient_discharge_c: parseFloat(discharge),
      };
      const response = await addRainwaterDropSizing(payload).unwrap();
      console.log(response.data?.catchment_area_per_pipe_m2);
      setData(response.data);
    } catch (error) {
      console.error("Calculation failed:", error);
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
              Rainwater Dropping
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
          <InputRow label="Roof Area" value={area} onChange={setArea} />
          <InputRow
            label="Number of Pipes Provided"
            value={pipes}
            onChange={setPipes}
          />
          <InputRow
            label="Intensity of Rainfall"
            value={intensity}
            onChange={setIntensity}
          />
          <InputRow
            label="Coefficient of Discharge"
            value={discharge}
            onChange={setDischarge}
          />
          <InputRow
            label="Pipe Diameter in MM"
            value={pipeDiameterMM}
            onChange={setPipeDiameterMM}
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

export default RainWaterDropping;
