import React, { useState, useEffect } from "react"; // Added useEffect
import { ReloadIcon } from "../../icons/ReloadIcon";
import { useCalculateCondenserMutation } from "../../redux/features/api/api";
// import { useCalculateCondenserMutation } from "../../api/apiSlice"; // Import the Condenser mutation hook

const Condenser = () => {
  const [formData, setFormData] = useState({
    // Initializing new fields
    totalHeatLoadTonnage: "0.0",
    totalHeatLoadKW: "0.0",
    numberOfChillers: "0",
    totalLoadLPS: "0.0",
    totalPumpCapacity: "0.0",
    selectSystem: "Air Separator", // Set initial value to one of the new options
    pipeSize: "0",
    straight: "0.0",
    bend: "0",
    tee: "0",
    butterflyValve: "0",
    checkValve: "0",
    balancingValve: "0", // New: Balancing Valve (Nos)
    suddenEnlargementChillerInlet: "254", // Renamed for clarity in Condenser, but keep value for now
    suddenContractionChillerOutlet: "254", // Renamed for clarity in Condenser, but keep value for now
    totalEquivalentLength: "0.0",
    headLoss: "0.0",
  });

  const [calculateCondenser, { data, isLoading, isSuccess, isError, error }] =
    useCalculateCondenserMutation(); // Initialize the mutation

  useEffect(() => {
    if (isSuccess && data) {
      // Update form data with calculated results received from the API
      setFormData((prev) => ({
        ...prev,
        totalEquivalentLength: data.data.totalEquivalentLength,
        headLoss: data.data.headLoss,
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
  }, [data, isSuccess, isError, error]); // Dependencies for useEffect

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    console.log("Calculate button clicked!");
    console.log("Current form data:", formData);

    try {
      // Call the RTK Query mutation instead of local calculation
      await calculateCondenser(formData);
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
                Condenser
              </h2>
              <p className="text-xs text-gray-400">Updated: Just now</p>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={() => {
                setFormData({
                  totalHeatLoadTonnage: "0.0",
                  totalHeatLoadKW: "0.0",
                  numberOfChillers: "0",
                  totalLoadLPS: "0.0",
                  totalPumpCapacity: "0.0",
                  selectSystem: "Air Separator",
                  pipeSize: "0",
                  straight: "0.0",
                  bend: "0",
                  tee: "0",
                  butterflyValve: "0",
                  checkValve: "0",
                  balancingValve: "0",
                  suddenEnlargementChillerInlet: "254",
                  suddenContractionChillerOutlet: "254",
                  totalEquivalentLength: "0.0", // Reset calculated fields
                  headLoss: "0.0", // Reset calculated fields
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
          {/* Dropdown - Moved to Top */}
          <div className="space-y-1">
            <label className="text-gray-800 block">SYSTEM TYPE</label>
            <select
              name="selectSystem"
              value={formData.selectSystem}
              onChange={handleChange}
              className="w-full bg-gray-200 p-2 rounded-md text-gray-500"
            >
              {[
                "Air Separator",
                "Chiller Bypass",
                "Cooling Tower",
                "Heat Exchanger",
                "Pumps",
                "Valves",
                "Expansion Tank",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* First set of Input Fields (now below the dropdown) */}
          {[
            ["Total Heat Load", "totalHeatLoadTonnage", "Tonnage"],
            ["Total Heat Load", "totalHeatLoadKW", "KW"],
            ["Number of Chillers", "numberOfChillers", "Nos"],
            ["Total Load", "totalLoadLPS", "lps"],
            ["Total Pump Capacity", "totalPumpCapacity", "LPS/GPM"],
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

          {/* Second set of Input Fields including new ones (remain below the first set) */}
          {[
            ["Pipe size", "pipeSize", "mm"],
            ["Straight", "straight", "m"],
            ["Bend", "bend", "Nos"],
            ["Tee", "tee", "Nos"],
            ["Butterfly Valve", "butterflyValve", "Nos"],
            ["Check Valve", "checkValve", "Nos"],
            ["Balancing Valve", "balancingValve", "Nos"],
            [
              "Sudden Enlargement - Inlet size", // Changed label for Condenser context
              "suddenEnlargementChillerInlet",
              "mm",
            ],
            [
              "Sudden Contraction - Outlet size", // Changed label for Condenser context
              "suddenContractionChillerOutlet",
              "mm",
            ],
            // Calculated fields
            ["Total Equivalent length", "totalEquivalentLength", "m", true],
            ["Head Loss", "headLoss", "m", true],
          ].map(([label, name, unit, readOnly = false]) => (
            <div key={name} className="space-y-1">
              <label className="text-gray-800 block">{label}</label>
              <div className="flex space-x-2 items-center">
                <input
                  type="number"
                  name={name}
                  value={isLoading ? "" : formData[name]} // Set value to empty string when loading
                  onChange={handleChange}
                  readOnly={readOnly || isLoading} // Disable while loading
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
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Condenser;
