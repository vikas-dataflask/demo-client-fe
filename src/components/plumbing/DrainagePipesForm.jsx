import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddDrainagePipesMutation } from "../../redux/features/api/api"; // Adjust the path as needed
import FloorPreview from "../shared/FloorPreview";

// Reusable Components
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

const SelectRow = ({ label, value, onChange, options }) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-gray-600 mb-[6px]">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[36px] text-[13px] px-3 rounded-[6px] text-[#374151] border border-gray-200 bg-gray-200 focus:outline-none focus:border-[#0083EE] focus:ring-0 hover:border-gray-400"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const DrainagePipesForm = ({ setData }) => {
  const [addDrainagePipes] = useAddDrainagePipesMutation();

  const [wb, setWb] = useState(10);
  const [healthFaucet, setHealthFaucet] = useState(10);
  const [floorDrain, setFloorDrain] = useState(10);
  const [serviceSink, setServiceSink] = useState(10);
  const [kitchenSink, setKitchenSink] = useState(10);
  const [shower, setShower] = useState(10);
  const [wc, setWc] = useState(10);
  const [urinal, setUrinal] = useState(10);
  const [urinalTrap, setUrinalTrap] = useState(10);
  const [fixtureUnit, setFixtureUnit] = useState(646);
  const [SoilWastePipeSize, setSoilWastePipeSize] = useState(50);
  const [pipeSlope, setPipeSlope] = useState(1.5);
  const [velocity, setVelocity] = useState(1.5);
  const [pipeSize, setPipeSize] = useState("");

  const handleCalculate = async () => {
    try {
      const res = await addDrainagePipes({
        plumbing: [
          {
            num_wb: wb,
            num_health_faucet: healthFaucet,
            num_floor_drain: floorDrain,
            num_service_sink: serviceSink,
            num_kitchen_sink: kitchenSink,
            num_shower: shower,
            num_wc: wc,
            num_urinal: urinal,
            num_urinal_trap: urinalTrap,
          },
        ],
      }).unwrap(); // unwrap to handle errors and get the raw response

      console.log(res?.data?.[0]?.total_raw_water);
      setData(res.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="flex ">
      <div className="w-[340px] h-[90vh] flex flex-col bg-white border-r border-gray-200 overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900 leading-none">
              Drainage Pipes
            </h2>
            <p className="text-[11px] text-gray-400 mt-[4px]">No update yet</p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white hover:bg-sky-600 rounded-md flex items-center justify-center transition"
            onClick={() => console.log("Reload clicked")}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[80px] bg-white">
          <InputRow label="Number of WB" value={wb} onChange={setWb} />
          <InputRow
            label="Number of Health Faucet"
            value={healthFaucet}
            onChange={setHealthFaucet}
          />
          <InputRow
            label="Number of Floor Drain"
            value={floorDrain}
            onChange={setFloorDrain}
          />
          <InputRow
            label="Number of Service Sink"
            value={serviceSink}
            onChange={setServiceSink}
          />
          <InputRow
            label="Number of Kitchen Sink"
            value={kitchenSink}
            onChange={setKitchenSink}
          />
          <InputRow
            label="Number of Shower"
            value={shower}
            onChange={setShower}
          />
          <InputRow label="Number of WC" value={wc} onChange={setWc} />
          <InputRow
            label="Number of Urinal"
            value={urinal}
            onChange={setUrinal}
          />
          <InputRow
            label="Number of Urinal Tap"
            value={urinalTrap}
            onChange={setUrinalTrap}
          />
          <InputRow
            label="Total Fixture Unit"
            value={fixtureUnit}
            onChange={setFixtureUnit}
          />
          <InputRow
            label="Soil & Waste Pipe Size as per NBC"
            value={SoilWastePipeSize}
            onChange={setSoilWastePipeSize}
          />
          <InputRow
            label="Pipe Slope"
            value={pipeSlope}
            onChange={setPipeSlope}
          />
          <InputRow label="Velocity" value={velocity} onChange={setVelocity} />
          <InputRow label="Pipe Size" value={pipeSize} onChange={setPipeSize} />
        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <button
            className="w-full h-[40px] bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-[14px] font-semibold rounded-md transition"
            onClick={handleCalculate}
          >
            Calculate
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

export default DrainagePipesForm;
