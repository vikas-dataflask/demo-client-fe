import React, { useState, useRef } from "react"; // Import useRef
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useAddPlumbingPumpMutation } from "../../redux/features/api/api"; // adjust path as needed
import FloorPreview from "../shared/FloorPreview";
import PlumbingPumpModal from "./PlumbingPumpModal"; // Import the modal (now acting as the report view)
import html2canvas from "html2canvas"; // Import html2canvas

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

const InputRow1 = ({ label, unit, value, onChange, disabled = false }) => (
  <div className="mb-[14px]">
    <label className="block text-[11px] text-[#6B7280] mb-[6px]">{label}</label>
    <div className="flex gap-[8px]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 h-[36px] px-3 text-[13px] rounded-[6px] text-[#374151] border border-gray-200 bg-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
        placeholder={label}
      />
      {unit && (
        <select
          className="w-1/2 h-[36px] text-[13px] px-2 rounded-[6px] text-[#374151] border border-gray-200 bg-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
          disabled
        >
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
      className="w-full h-[36px] text-[13px] px-3 rounded-[6px] text-[#374151] border border-gray-200 bg-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const PlumbingPumpForm = ({
  projectName = "Default Project",
  activity = "Plumbing Pump",
}) => {
  const [totalWaterToPump, setTotalWaterToPump] = useState("");
  const [fillingTime, setFillingTime] = useState("");
  const [statonHeight, setStatonHeight] = useState("");
  const [flowrateMeter, setFlowRateMeter] = useState("");
  const [pipeMaterial, setPipeMaterial] = useState("Select");
  const [frictionLoss, setFrictionLoss] = useState("");
  const [pipeDiameter, setPipeDiameter] = useState("Select");
  const [residualHead, setResidualHead] = useState("");
  const [pressureLoss, setPressureLoss] = useState("");
  const [totalHead, setTotalHead] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [pumpCapacity, setPumpCapacity] = useState("");

  const [addPump, { isLoading, error }] = useAddPlumbingPumpMutation();
  const [calculationResult, setCalculationResult] = useState(null);
  const [floorImageBase64, setFloorImageBase64] = useState(null); // State to store Base64 image
  const floorPreviewRef = useRef(null); // Ref to target FloorPreview component

  const formData = {
    totalWaterToPump,
    fillingTime,
    statonHeight,
    flowrateMeter,
    pipeMaterial,
    frictionLoss,
    pipeDiameter,
    residualHead,
    pressureLoss,
    efficiency,
    pumpCapacity,
  };

  const captureFloorPreview = async () => {
    if (floorPreviewRef.current) {
      try {
        const canvas = await html2canvas(floorPreviewRef.current, {
          // You might need to adjust these options based on your FloorPreview implementation
          useCORS: true, // If FloorPreview loads images from other domains
          scale: 2, // Increase scale for better quality in PDF
          logging: true, // Enable logging for debugging
        });
        const imgData = canvas.toDataURL("image/png");
        setFloorImageBase64(imgData);
      } catch (err) {
        console.error("Error capturing floor preview:", err);
        setFloorImageBase64(null); // Clear image on error
      }
    }
  };

  const handleCalculate = async () => {
    // Capture the floor preview before making the API call and showing the report
    await captureFloorPreview();

    try {
      const payload = {
        totalWater: parseFloat(totalWaterToPump),
        fillingTime: parseFloat(fillingTime),
        stationHeight: parseFloat(statonHeight),
        pipeMaterial,
        frictionalLossCoefficient: parseFloat(frictionLoss),
        pipeDia: parseInt(pipeDiameter),
        residualHead: parseFloat(residualHead),
        totalPressureLoss: parseFloat(pressureLoss),
        efficiency: parseFloat(efficiency),
      };

      const response = await addPump(payload).unwrap();
      console.log(response);
      setCalculationResult(response.data);
    } catch (err) {
      console.error("Error calculating pump:", err);
      setCalculationResult(null);
      setFloorImageBase64(null); // Clear image if calculation fails
    }
  };

  const handleReload = () => {
    setTotalWaterToPump("");
    setFillingTime("");
    setStatonHeight("");
    setFlowRateMeter("");
    setPipeMaterial("Select");
    setFrictionLoss("");
    setPipeDiameter("Select");
    setResidualHead("");
    setPressureLoss("");
    setTotalHead("");
    setEfficiency("");
    setPumpCapacity("");
    setCalculationResult(null);
    setFloorImageBase64(null); // Clear image on reload
    console.log("Form reloaded");
  };

  const handleCloseReport = () => {
    setCalculationResult(null);
    setFloorImageBase64(null); // Clear image when report is closed
  };

  return (
    <div className="flex">
      <div className="w-[340px] h-[90vh] flex flex-col bg-white border-r border-[#E5E7EB] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] leading-none">
              Plumbing Pump
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-[4px]">No update yet</p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#2E90FA] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={handleReload}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[80px] bg-white">
          <InputRow
            label="Total Water To Pump"
            value={totalWaterToPump}
            onChange={setTotalWaterToPump}
          />
          <InputRow
            label="Filling Time"
            value={fillingTime}
            onChange={setFillingTime}
          />
          <InputRow
            label="Station Height"
            value={statonHeight}
            onChange={setStatonHeight}
          />
          <InputRow
            label="Flow Rate Q in m3/s"
            value={flowrateMeter}
            onChange={setFlowRateMeter}
          />
          <SelectRow
            label="Pipe Material"
            value={pipeMaterial}
            onChange={setPipeMaterial}
            options={["Select", "GI", "CI", "PVC"]}
          />
          <InputRow
            label="Friction Loss Coefficient"
            value={frictionLoss}
            onChange={setFrictionLoss}
          />
          <SelectRow
            label="Pipe Diameter"
            value={pipeDiameter}
            onChange={setPipeDiameter}
            options={["Select", "100", "150", "200"]}
          />
          <InputRow
            label="Residual Head"
            value={residualHead}
            onChange={setResidualHead}
          />
          <InputRow
            label="Total Pressure Loss"
            value={pressureLoss}
            onChange={setPressureLoss}
          />
          <InputRow
            label="Efficiency"
            value={efficiency}
            onChange={setEfficiency}
          />
          <InputRow
            label="Pump Capacity {Watts}"
            value={pumpCapacity}
            onChange={setPumpCapacity}
          />
        </div>

        {/* Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-4">
          <button
            className="w-full h-[40px] bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-[14px] font-semibold rounded-md transition disabled:opacity-50"
            onClick={handleCalculate}
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
          {error && (
            <p className="mt-2 text-[12px] text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
      {/* Right: Report Display or Floor Preview */}
      <div className="flex-1 h-[90vh] overflow-y-auto" ref={floorPreviewRef}>
        {" "}
        {/* Assign ref here */}
        {calculationResult ? (
          <PlumbingPumpModal
            data={calculationResult}
            formData={formData}
            projectName={projectName}
            activity={activity}
            onClose={handleCloseReport}
            floorDrawingImageBase64={floorImageBase64}
          />
        ) : (
          <FloorPreview />
        )}
      </div>
    </div>
  );
};

export default PlumbingPumpForm;
