import React, { useEffect, useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";
import {
  useSaveBreakerMutation,
  useGetBreakerQuery,
} from "../../redux/features/api/api";
import { useParams } from "react-router-dom";

const BreakerSizingForm = () => {
  const { projectId } = useParams();
  const [panel, setPanel] = useState("");
  const [equipment, setEquipment] = useState("");
  const [connectedLoad, setConnectedLoad] = useState("");
  const [systemVoltage, setSystemVoltage] = useState("");
  const [powerFactor, setPowerFactor] = useState("");
  const [loadFactor, setLoadFactor] = useState("");
  const [demandFactor, setDemandFactor] = useState("");
  const [spareCapacity, setSpareCapacity] = useState("");

  const [equipmentResults, setEquipmentResults] = useState([]);
  const [totalDesignCurrent, setTotalDesignCurrent] = useState(0);
  const [calculatedEquipments, setCalculatedEquipments] = useState([]);

  const { data: existingData } = useGetBreakerQuery(projectId, {
    skip: !projectId,
  });
  const [saveBreaker, { isLoading }] = useSaveBreakerMutation();

  const breakerOptions = [200, 150, 650, 300];

  const panelOptions = [
    { value: "MDB", label: "MDB" },
    { value: "LDB", label: "LDB" },
    { value: "PDB", label: "PDB" },
  ];

  const equipmentOptions = [
    { value: "Es.PP", label: "Essential Power Panel (Es.PP)" },
    { value: "MLP", label: "Main Lighting Panel (MLP)" },
    { value: "EVPA", label: "Escalator, VAC, Passenger Amenities Panel" },
    { value: "STUPS", label: "S&T UPS" },
    { value: "Spare", label: "Spare" },
  ];

  // Calculate design current for a single equipment
  const calculateDesignCurrent = (
    equipmentType,
    connectedLoad,
    systemVoltage,
    powerFactor,
    loadFactor,
    demandFactor,
    spareCapacity
  ) => {
    const cl = parseFloat(connectedLoad);
    const sv = parseFloat(systemVoltage);
    const pf = parseFloat(powerFactor);
    const lf = parseFloat(loadFactor);
    const df = parseFloat(demandFactor);
    const sc = parseFloat(spareCapacity);

    if (
      isNaN(cl) ||
      isNaN(sv) ||
      isNaN(pf) ||
      isNaN(lf) ||
      isNaN(df) ||
      isNaN(sc)
    ) {
      return null;
    }

    const mdFactor = lf * df;
    const mdLoadKw = cl * mdFactor;
    const mdLoadKva = mdLoadKw / pf;
    const kvar = Math.sqrt(1 - pf * pf) * mdLoadKva;

    let fullLoadCurrent;
    if (sv === 415) {
      fullLoadCurrent = (mdLoadKva * 1000) / (415 * Math.sqrt(3));
    } else {
      fullLoadCurrent = (mdLoadKva * 1000) / 240;
    }

    const designCurrent = sc === 1 ? 1.2 * fullLoadCurrent : fullLoadCurrent;

    return {
      equipmentType,
      equipmentLabel:
        equipmentOptions.find((opt) => opt.value === equipmentType)?.label ||
        equipmentType,
      mdFactor: +mdFactor.toFixed(2),
      mdLoadKw: +mdLoadKw.toFixed(2),
      mdLoadKva: +mdLoadKva.toFixed(2),
      kvar: +kvar.toFixed(2),
      fullLoadCurrent: +fullLoadCurrent.toFixed(2),
      designCurrent: +designCurrent.toFixed(2),
      breakerSelection: "",
    };
  };

  useEffect(() => {
    if (existingData) {
      setPanel(existingData.panel || "");
      setEquipment(existingData.equipment || ""); // ✅ Set equipment directly
      setConnectedLoad(existingData.connectedLoad || "");
      setSystemVoltage(existingData.systemVoltage || "");
      setPowerFactor(existingData.powerFactor || "");
      setLoadFactor(existingData.loadFactor || "");
      setDemandFactor(existingData.demandFactor || "");
      setSpareCapacity(existingData.spareCapacity || "");

      if (existingData.equipmentResults) {
        setCalculatedEquipments(existingData.equipmentResults);
        setTotalDesignCurrent(existingData.totalDesignCurrent || 0);
      }
    }
  }, [existingData]);

  const handleCalculate = () => {
    if (!projectId) {
      alert("Please select a project before calculating!");
      return;
    }

    if (!equipment) {
      alert("Please select an equipment first!");
      return;
    }

    if (!panel) {
      alert("Please select a panel first!");
      return;
    }

    const result = calculateDesignCurrent(
      equipment,
      connectedLoad,
      systemVoltage,
      powerFactor,
      loadFactor,
      demandFactor,
      spareCapacity
    );

    if (result) {
      // Check if this equipment is already calculated
      const existingIndex = calculatedEquipments.findIndex(
        (item) => item.equipmentType === equipment
      );

      if (existingIndex >= 0) {
        // Update existing calculation
        const updatedEquipments = [...calculatedEquipments];
        updatedEquipments[existingIndex] = result;
        setCalculatedEquipments(updatedEquipments);
      } else {
        // Add new calculation
        setCalculatedEquipments([...calculatedEquipments, result]);
      }
    }
  };

  const handleBreakerSelectionChange = (equipmentType, breakerSelection) => {
    const updatedEquipments = calculatedEquipments.map((item) =>
      item.equipmentType === equipmentType
        ? { ...item, breakerSelection }
        : item
    );
    setCalculatedEquipments(updatedEquipments);
  };

  const handleTotalDesignCurrent = async () => {
    if (calculatedEquipments.length === 0) {
      alert("Please calculate at least one equipment first!");
      return;
    }

    // Calculate total design current
    const total = calculatedEquipments.reduce(
      (sum, result) => sum + result.designCurrent,
      0
    );
    setTotalDesignCurrent(total);

    const payload = {
      projectId,
      panel,
      equipment,
      connectedLoad,
      systemVoltage,
      powerFactor,
      loadFactor,
      demandFactor,
      spareCapacity,
      equipmentResults: calculatedEquipments,
      totalDesignCurrent: total,
    };

    try {
      await saveBreaker(payload).unwrap();
      alert("Breaker sizing data saved successfully!");
    } catch (error) {
      alert("Failed to save data.");
    }
  };

  // Get panel label
  const getPanelLabel = (panelValue) => {
    return (
      panelOptions.find((opt) => opt.value === panelValue)?.label || panelValue
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Form */}
      <div className="w-[440px] h-[92vh] bg-white border-r border-gray-300 rounded-md pt-0 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[14px] font-semibold text-black leading-none">
              Breaker Sizing
            </h1>
            <p className="text-[11px] text-gray-400 mt-[2px]">
              Autofill & Save Enabled
            </p>
          </div>
          <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        <div className="border-b border-gray-200 mb-3"></div>

        {/* Panel Selection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Select Panel
          </label>
          <select
            value={panel}
            onChange={(e) => setPanel(e.target.value)}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
          >
            <option value="">Select</option>
            {panelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Selection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Select Connected Equipments
          </label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
          >
            <option value="">Select</option>
            {equipmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Connected Load */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Connected Load
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={connectedLoad}
              onChange={(e) => setConnectedLoad(e.target.value)}
              className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
              placeholder="Enter value"
            />
            <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
              KW
            </div>
          </div>
        </div>

        {/* System Voltage */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            System Voltage
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={systemVoltage}
              onChange={(e) => setSystemVoltage(e.target.value)}
              className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
              placeholder="Enter value"
            />
            <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
              V
            </div>
          </div>
        </div>

        {/* Power Factor */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Power Factor
          </label>
          <input
            type="number"
            value={powerFactor}
            onChange={(e) => setPowerFactor(e.target.value)}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
            placeholder="Enter value"
            step="any"
            min="0"
            max="1"
          />
        </div>

        {/* Load Factor */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Load Factor
          </label>
          <input
            type="number"
            value={loadFactor}
            onChange={(e) => setLoadFactor(e.target.value)}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
            placeholder="Enter value"
            step="any"
            min="0"
            max="1"
          />
        </div>

        {/* Demand Factor */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Demand Factor
          </label>
          <input
            type="number"
            value={demandFactor}
            onChange={(e) => setDemandFactor(e.target.value)}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
            placeholder="Enter value"
            step="any"
            min="0"
            max="1"
          />
        </div>

        {/* Spare Capacity */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
            Spare Capacity (0 or 1)
          </label>
          <input
            type="number"
            value={spareCapacity}
            onChange={(e) => setSpareCapacity(e.target.value)}
            className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
            placeholder="Enter value"
          />
        </div>

        {/* Calculate Button */}
        <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleCalculate}
            disabled={!projectId || !equipment || !panel}
            className={`w-full py-3 rounded-[10px] font-medium text-[14px] flex items-center justify-center ${
              !projectId || !equipment || !panel
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0083EE] text-white hover:bg-[#1C78DC] transition"
            }`}
          >
            {!projectId
              ? "Select Project First"
              : !panel
              ? "Select Panel First"
              : !equipment
              ? "Select Equipment First"
              : "Calculate"}
          </button>
        </div>

        {/* Individual Equipment Results */}
        {calculatedEquipments.map((result, index) => (
          <div
            key={index}
            className="mt-4 bg-blue-50 p-3 rounded-md border text-sm"
          >
            <h3 className="font-semibold mb-2 text-blue-800">
              {getPanelLabel(panel)} → {result.equipmentLabel}
            </h3>
            <div className="space-y-1 text-xs">
              <p>
                Full Load Current:{" "}
                <span className="font-semibold">
                  {result.fullLoadCurrent} A
                </span>
              </p>
              <p>
                Design Current:{" "}
                <span className="font-semibold">{result.designCurrent} A</span>
              </p>
            </div>

            {/* Breaker Selection */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
                Breaker Selection
              </label>
              <select
                value={result.breakerSelection}
                onChange={(e) =>
                  handleBreakerSelectionChange(
                    result.equipmentType,
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#0083EE]"
              >
                <option value="">Select</option>
                {breakerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} A
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* Total Design Current Button */}
        {calculatedEquipments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleTotalDesignCurrent}
              disabled={isLoading}
              className={`w-full py-3 rounded-[10px] font-medium text-[14px] flex items-center justify-center ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 transition"
              }`}
            >
              {isLoading ? (
                <>
                  <ReloadIcon className="w-[16px] h-[16px] stroke-white animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Total Design Current"
              )}
            </button>
          </div>
        )}

        {/* Total Design Current Display */}
        {totalDesignCurrent > 0 && (
          <div className="mt-4 bg-green-50 p-3 rounded-md border text-sm">
            <h3 className="font-semibold mb-2 text-green-800">
              Total Design Current
            </h3>
            <div className="text-lg font-bold text-green-600">
              {totalDesignCurrent.toFixed(2)} A
            </div>
          </div>
        )}
      </div>

      {/* Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default BreakerSizingForm;
