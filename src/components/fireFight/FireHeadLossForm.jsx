import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddFireHLMutation } from "../../redux/features/api/api"; // Adjust the path as per your project structure
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

const InputRow1 = ({ label, unit, value, onChange }) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
    <div className="flex gap-[8px]">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-gray-200 focus:ring-0 hover:border-gray-400"
      />
      {unit && (
        <select className="w-1/2 h-[36px] text-[13px] px-2 rounded-[6px] text-[#374151] border border-gray-200 focus:outline-none focus:border-[#0083EE] bg-gray-200 focus:ring-0 hover:border-gray-400">
          <option>{unit}</option>
        </select>
      )}
    </div>
  </div>
);

const SelectRow = ({ label, value, onChange, options }) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
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

const FireHeadLossForm = ({ setData }) => {
  const [pipeDiameter, setPipeDiameter] = useState("");
  const [pipeMaterial, setPipeMaterial] = useState("");

  const [lengthHorizontal, setLengthHorizontal] = useState("");
  const [lengthVertical, setLengthVertical] = useState("");
  const [se90, setSe90] = useState(0);
  const [se45, setSe45] = useState(0);
  const [we90, setWe90] = useState(0);
  const [gv, setGv] = useState(0);
  const [nrv, setNrv] = useState(0);
  const [bfv, setBfv] = useState(0);
  const [glv, setGlv] = useState(0);
  const [other, setOther] = useState(0);
  const [equivalentLength, setEquivalentLength] = useState(0);
  const [frictionCoeff, setFrictionCoeff] = useState(0);
  const [flowRate, setFlowRate] = useState(0);
  const [staticLoss, setStaticLoss] = useState(0);
  const [staticGain, setStaticGain] = useState(0);

  const [addFireHL, { isLoading }] = useAddFireHLMutation();

  const handleCalculate = async () => {
    const requestData = {
      pipeDia: parseInt(pipeDiameter),
      pipeMaterial,
      pipeLengthHorizontal: parseFloat(lengthHorizontal),
      pipeLengthVertical: parseFloat(lengthVertical),
      fittings: {
        SE90: parseInt(se90),
        SE45: parseInt(se45),
        WE90: parseInt(we90),
        GV: parseInt(gv),
        NRV: parseInt(nrv),
        BFV: parseInt(bfv),
        GLV: parseInt(glv),
        OTHER: parseInt(other),
      },
      frictionalLossCoefficient: parseFloat(frictionCoeff),
      flowrateLpm: parseFloat(flowRate),
      staticLossMeter: parseFloat(staticLoss),
      staticGainMeter: parseFloat(staticGain),
    };

    try {
      const response = await addFireHL(requestData).unwrap();
      console.log("Mutation Result:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Mutation Error:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-[340px] h-[92vh] flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] leading-none">
              Head Loss Calculation
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-[4px]">No update yet</p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={() => console.log("Reload clicked")}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[80px] bg-white">
          <SelectRow
            label="Select Pipe Diameter"
            value={pipeDiameter}
            onChange={setPipeDiameter}
            options={["100mm", "150mm", "200mm"]}
          />
          <SelectRow
            label="Select Pipe Material"
            value={pipeMaterial}
            onChange={setPipeMaterial}
            options={["GI", "CI", "PVC"]}
          />
          <InputRow
            label="Pipe Horizontal Length"
            value={lengthHorizontal}
            onChange={setLengthHorizontal}
          />
          <InputRow
            label="Pipe Vertical Length"
            value={lengthVertical}
            onChange={setLengthVertical}
          />
          <InputRow label="SE 90°" value={se90} onChange={setSe90} />
          <InputRow label="SE 45°" value={se45} onChange={setSe45} />
          <InputRow label="WE 90°" value={we90} onChange={setWe90} />
          <InputRow label="GV" value={gv} onChange={setGv} />
          <InputRow label="NRV" value={nrv} onChange={setNrv} />
          <InputRow label="BFV" value={bfv} onChange={setBfv} />
          <InputRow label="GLV" value={glv} onChange={setGlv} />
          <InputRow label="OTHER" value={other} onChange={setOther} />
          <InputRow
            label="Equivalent Length of Pipes & Fittings"
            value={equivalentLength}
            onChange={setEquivalentLength}
          />
          <InputRow1
            label="Frictional Loss Coefficient C"
            value={frictionCoeff}
            onChange={setFrictionCoeff}
          />
          <InputRow
            label="Flow rate Q"
            value={flowRate}
            onChange={setFlowRate}
          />
          <InputRow
            label="Static Loss"
            value={staticLoss}
            onChange={setStaticLoss}
          />
          <InputRow
            label="Static Gain"
            value={staticGain}
            onChange={setStaticGain}
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
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default FireHeadLossForm;
