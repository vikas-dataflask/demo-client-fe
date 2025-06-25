import React, { useState, useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useCalculateChillerMutation } from "../../redux/features/api/api";

const Chiller = () => {
  const [formData, setFormData] = useState({
    selectSystem: "Primary", // Dropdown
    pipeSizeMM: "0", // Pipe size (mm)
    pipeSizeInch: "0", // Pipe size (inch)
    numberOfChillers: "0", // Number of Chillers
    lengthMtr: "0.0", // Length (mtr)
    flowRateLPS: "0.0", // Flowrate (lps)
    lengthFt: "0.0", // Length (ft)
    flowRateGPM: "0.0", // Flowrate (gpm)
    // Other remaining fields
    totalHeatLoadTonnage: "0.0",
    totalHeatLoadKW: "0.0",
    totalLoadLPS: "0.0",
    totalPumpCapacity: "0.0",
    straight: "0.0",
    bend: "0",
    tee: "0",
    butterflyValve: "0",
    checkValve: "0",
    balancingValve: "0",
    suddenEnlargementChillerInlet: "254",
    suddenContractionChillerOutlet: "254",
    // New calculated fields
    equivalentLengthFt: "0.0",
    totalEquivalentLengthFt: "0.0",
    headLossFeet: "0.0",
    headLossMeter: "0.0",
  });

  const [calculateChiller, { data, isLoading, isSuccess, isError, error }] =
    useCalculateChillerMutation();

  useEffect(() => {
    if (isSuccess && data) {
      setFormData((prev) => ({
        ...prev,
        // Assuming the API returns these new calculated fields
        equivalentLengthFt: data.data.equivalentLengthFt,
        totalEquivalentLengthFt: data.data.totalEquivalentLengthFt,
        headLossFeet: data.data.headLossFeet,
        headLossMeter: data.data.headLossMeter,
      }));
    }
    if (isError) {
      console.error("Failed to perform calculation:", error);
      alert(
        `Failed to perform calculation: ${
          error.data?.message || error.error || "Unknown error"
        }`
      );
    }
  }, [data, isSuccess, isError, error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    console.log("Calculate button clicked!");
    console.log("Current form data:", formData);

    try {
      await calculateChiller(formData);
    } catch (err) {
      console.error("Failed to send calculation request:", err);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-[340px] bg-white border-r border-gray-300 text-sm font-medium flex flex-col h-full">
        {/* Header */}
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-800">
                Chiller
              </h2>
              <p className="text-xs text-gray-400">Updated: Just now</p>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={() => {
                setFormData({
                  selectSystem: "Primary",
                  pipeSizeMM: "0",
                  pipeSizeInch: "0",
                  numberOfChillers: "0",
                  lengthMtr: "0.0",
                  flowRateLPS: "0.0",
                  lengthFt: "0.0",
                  flowRateGPM: "0.0",
                  totalHeatLoadTonnage: "0.0",
                  totalHeatLoadKW: "0.0",
                  totalLoadLPS: "0.0",
                  totalPumpCapacity: "0.0",
                  straight: "0.0",
                  bend: "0",
                  tee: "0",
                  butterflyValve: "0",
                  checkValve: "0",
                  balancingValve: "0",
                  suddenEnlargementChillerInlet: "254",
                  suddenContractionChillerOutlet: "254",
                  equivalentLengthFt: "0.0",
                  totalEquivalentLengthFt: "0.0",
                  headLossFeet: "0.0",
                  headLossMeter: "0.0",
                });
                console.log("Form reset!");
              }}
            >
              <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Dropdown - PIPE SECTION */}
          <div className="space-y-1">
            <label className="text-gray-800 block">PIPE SECTION</label>
            <select
              name="selectSystem"
              value={formData.selectSystem}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
            >
              {["Primary", "Main", "Riser", "Chiller"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Fields in the requested order */}
          {[
            // Explicitly requested fields
            ["Pipe size", "pipeSizeMM", "mm"],
            ["Pipe size", "pipeSizeInch", "inch"],
            ["Number of Chillers", "numberOfChillers", "Nos"],
            ["Length", "lengthMtr", "Mtr"],
            ["Flow Rate", "flowRateLPS", "LPS"],
            ["Length", "lengthFt", "ft"],
            ["Flow Rate", "flowRateGPM", "gpm"],
            // Other remaining input fields
            ["Total Heat Load", "totalHeatLoadTonnage", "Tonnage"],
            ["Total Heat Load", "totalHeatLoadKW", "KW"],
            ["Total Load", "totalLoadLPS", "lps"],
            ["Total Pump Capacity", "totalPumpCapacity", "LPS/GPM"],
            ["Straight", "straight", "m"],
            ["Bend", "bend", "Nos"],
            ["Tee", "tee", "Nos"],
            ["Butterfly Valve", "butterflyValve", "Nos"],
            ["Check Valve", "checkValve", "Nos"],
            ["Balancing Valve", "balancingValve", "Nos"],
            [
              "Sudden Enlargement - Chiller inlet size",
              "suddenEnlargementChillerInlet",
              "mm",
            ],
            [
              "Sudden Contraction - Chiller outlet size",
              "suddenContractionChillerOutlet",
              "mm",
            ],
          ].map(([label, name, unit]) => (
            <div key={name} className="space-y-1">
              <label className="text-gray-800 block">{label}</label>
              <div className="flex space-x-2 items-center">
                <input
                  type="number"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-3/4 bg-gray-200 p-2 rounded-md text-gray-500"
                />
                <span className="w-1/4 text-center bg-gray-200 p-2 rounded-md text-gray-500">
                  {unit}
                </span>
              </div>
            </div>
          ))}

          {/* Calculated fields */}
          {[
            ["Equivalent Length", "equivalentLengthFt", "ft", true],
            ["Total Equivalent Length", "totalEquivalentLengthFt", "ft", true],
            ["Head Loss", "headLossFeet", "Feet", true],
            ["Head Loss", "headLossMeter", "Meter", true],
          ].map(([label, name, unit, readOnly = false]) => (
            <div key={name} className="space-y-1">
              <label className="text-gray-800 block">{label}</label>
              <div className="flex space-x-2 items-center">
                <input
                  type="number"
                  name={name}
                  value={isLoading ? "" : formData[name]}
                  onChange={handleChange}
                  readOnly={readOnly || isLoading}
                  className={`w-3/4 p-2 rounded-md ${
                    readOnly || isLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-500"
                  }`}
                />
                <span className="w-1/4 text-center bg-gray-200 p-2 rounded-md text-gray-500">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Button at bottom (not scrollable) */}
        <div className="pb-20 border-t border-gray-200 p-4">
          <button
            onClick={handleCalculate}
            className="w-full bg-[#0083EE] text-white p-3 rounded-md font-semibold hover:bg-[#1C78DC] transition"
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chiller;
