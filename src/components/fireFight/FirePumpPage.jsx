import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddFirePumpMutation } from "../../redux/features/api/api"; // Update with correct import path
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

const FirePumpPage = ({ setData }) => {
  const [stationArea, setStationArea] = useState(3000);
  const [totalPdArea, setTotalPdArea] = useState(250);
  const [stationHeight, setStationHeight] = useState(15);
  const [flowrateMeter, setFlowrateMeter] = useState(0.038);
  const [pipeMaterial, setPipeMaterial] = useState("GI");
  const [frictionalLossCoefficient, setFrictionalLossCoefficient] =
    useState(120);
  const [pipeDiameter, setPipeDiameter] = useState(150);
  const [residualHead, setResidualHead] = useState(50);
  const [totalPressureLoss, setTotalPressureLoss] = useState(70);
  const [totalHead, setTotalHead] = useState(70);
  const [efficiency, setEfficiency] = useState(70);
  const [pumpCapacity, setPumpCapacity] = useState(70);

  const [addFirePump, { isLoading, isError, error }] = useAddFirePumpMutation();

  const handleCalculate = async () => {
    try {
      const response = await addFirePump({
        stations: [
          {
            station_area: stationArea,
            total_pd_area: totalPdArea,
            station_height: stationHeight,
            flowrate_lpm: flowrateMeter * 1000, // assuming conversion m³/s to lpm
            pipe_material: pipeMaterial,
            friction_loss_coefficient: frictionalLossCoefficient,
            pipe_dia: pipeDiameter,
            residual_head: residualHead,
            total_pressure_loss: totalPressureLoss,
            efficiency: efficiency.toString(),
          },
        ],
      }).unwrap();

      console.log(response.data?.[0]?.flowrate_lpm);
      setData(response.data);
    } catch (err) {
      console.error("Error adding fire pump:", err);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-[340px] h-[92vh] flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] leading-none">
              Fire Pump Sizing
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-[4px]">
              Enter pump details
            </p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={() => console.log("Reload clicked")}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[80px] bg-white overflow-hidden">
          <InputRow
            label="Station Area"
            value={stationArea}
            onChange={setStationArea}
          />
          <InputRow
            label="Total PD Area"
            value={totalPdArea}
            onChange={setTotalPdArea}
          />
          <InputRow
            label="Station Height"
            value={stationHeight}
            onChange={setStationHeight}
          />
          <InputRow
            label="Flow Rate Through Pipe Q (m3/s)"
            value={flowrateMeter}
            onChange={setFlowrateMeter}
          />
          <SelectRow
            label="Pipe Material"
            value={pipeMaterial}
            onChange={setPipeMaterial}
            options={["GI", "CI", "PVC"]}
          />
          <InputRow
            label="Frictional Loss Coefficient"
            value={frictionalLossCoefficient}
            onChange={setFrictionalLossCoefficient}
          />
          <InputRow
            label="Pipe Diameter"
            value={pipeDiameter}
            onChange={setPipeDiameter}
          />
          <InputRow
            label="Residual Head"
            value={residualHead}
            onChange={setResidualHead}
          />
          <InputRow
            label="Total Pressure Loss"
            value={totalPressureLoss}
            onChange={setTotalPressureLoss}
          />
          <InputRow
            label="Total Head"
            value={totalHead}
            onChange={setTotalHead}
          />
          <InputRow
            label="Efficiency"
            value={efficiency}
            onChange={setEfficiency}
          />
          <InputRow
            label="Pump Capacity"
            value={pumpCapacity}
            onChange={setPumpCapacity}
          />
        </div>

        {/* Fixed Bottom Button */}
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

export default FirePumpPage;
