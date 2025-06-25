import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddWaterSupplyPipesMutation } from "../../redux/features/api/api"; // adjust import path as needed
import FloorPreview from "../shared/FloorPreview";

const InputRow = ({ label, value, onChange }) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
    <div className="flex gap-[8px]">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-gray-200 focus:ring-0 hover:border-gray-400"
      />
    </div>
  </div>
);

const WaterSupplyPipesForm = ({ setData }) => {
  const [addWaterSupplyPipes, { isLoading }] = useAddWaterSupplyPipesMutation();

  const [numWb, setNumWb] = useState(0);
  const [numHealthFaucet, setNumHealthFaucet] = useState(0);
  const [numBibTap, setNumBibTap] = useState(0);
  const [numServiceSink, setNumServiceSink] = useState(0);
  const [numKitchenSink, setNumKitchenSink] = useState(0);
  const [numWaterFountain, setNumWaterFountain] = useState(0);
  const [numWc, setNumWc] = useState(0);
  const [numUrinal, setNumUrinal] = useState(0);
  const [velocityDomestic, setVelocityDomestic] = useState(0);
  const [velocityFlushing, setVelocityFlushing] = useState(0);

  const handleCalculate = async () => {
    try {
      const payload = {
        water_supply: [
          {
            num_wb: numWb,
            num_health_faucet: numHealthFaucet,
            num_bib_tap: numBibTap,
            num_service_sink: numServiceSink,
            num_kitchen_sink: numKitchenSink,
            num_water_fountain: numWaterFountain,
            num_wc: numWc,
            num_urinal: numUrinal,
            velocity_domestic: velocityDomestic,
            velocity_flushing: velocityFlushing,
          },
        ],
      };

      const response = await addWaterSupplyPipes(payload).unwrap();
      console.log("API Response:", response);
      setData(response.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="flex ">
      <div className="w-[340px] h-[90vh] flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] leading-none">
              Water Supply Pipes
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-[4px]">
              Submit pipe inputs
            </p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={() => window.location.reload()}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4  bg-white">
          <InputRow label="Number of WB" value={numWb} onChange={setNumWb} />
          <InputRow
            label="Number of Health Faucet"
            value={numHealthFaucet}
            onChange={setNumHealthFaucet}
          />
          <InputRow
            label="Number of Bib Tap"
            value={numBibTap}
            onChange={setNumBibTap}
          />
          <InputRow
            label="Number of Service Sink"
            value={numServiceSink}
            onChange={setNumServiceSink}
          />
          <InputRow
            label="Number of Kitchen Sink"
            value={numKitchenSink}
            onChange={setNumKitchenSink}
          />
          <InputRow
            label="Number of Water Fountain"
            value={numWaterFountain}
            onChange={setNumWaterFountain}
          />
          <InputRow label="Number of WC" value={numWc} onChange={setNumWc} />
          <InputRow
            label="Number of Urinal"
            value={numUrinal}
            onChange={setNumUrinal}
          />
          <InputRow
            label="Velocity Domestic (m/s)"
            value={velocityDomestic}
            onChange={setVelocityDomestic}
          />
          <InputRow
            label="Velocity Flushing (m/s)"
            value={velocityFlushing}
            onChange={setVelocityFlushing}
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

export default WaterSupplyPipesForm;
