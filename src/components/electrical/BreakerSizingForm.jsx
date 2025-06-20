// import React, { useState } from "react";
// import { ReloadIcon } from "../../icons/ReloadIcon";
// import FloorPreview from "../shared/FloorPreview";

// const BreakerSizingForm = () => {
//   const [formData, setFormData] = useState({
//     building: "",
//     panel: "",
//     equipment: "",
//     connectedLoad: "",
//     systemVoltage: "",
//     powerFactor: "",
//     loadFactor: "",
//     demandFactor: "",
//     mdLoad: "",
//     kvar: "",
//     fullLoadCurrent: "",
//     spareDesign: "",
//     switchGearCurrent: "",
//     breakerSelection: "",
//   });

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const renderInput = (label, field, unit = null) => (
//     <div className="mb-3">
//       <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
//         {label}
//       </label>
//       <div className="flex items-center gap-2">
//         <input
//           type="text"
//           value={formData[field]}
//           onChange={(e) => handleChange(field, e.target.value)}
//           className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE] hover:border-gray-400"
//           placeholder="Enter value"
//         />
//         {unit && (
//           <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7]  bg-gray-200 text-sm text-gray-600">
//             {unit}
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderDropdown = (label, field, options = ["1"]) => (
//     <div className="mb-3">
//       <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
//         {label}
//       </label>
//       <select
//         value={formData[field]}
//         onChange={(e) => handleChange(field, e.target.value)}
//         className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE] focus:ring-0 mb-3"
//       >
//         <option value="" disabled>
//           Select
//         </option>
//         {options.map((opt) => (
//           <option key={opt} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>
//     </div>
//   );

//   return (
//     <div className="flex h-screen">
//       <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 rounded-md pt-0 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
//         {/* Header */}
//         <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
//           <div>
//             <h1 className="text-[14px] font-semibold text-black leading-none">
//               Breaker Sizing
//             </h1>
//             <p className="text-[11px] text-gray-400 mt-[2px]">No update yet</p>
//           </div>
//           <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
//             <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
//           </button>
//         </div>
//         <div className="border-b border-gray-200 mb-3"></div>

//         {/* Scrollable content */}
//         <div className="overflow-y-auto pr-1 h-[calc(100%-70px)]">
//           {/* {renderDropdown("Select Building", "building", ["Metro Station"])} */}
//           {renderDropdown("Select Panel", "panel", ["MDB"])}
//           {renderDropdown("Select Connected Equipments", "equipment", ["ACDB"])}
//           {renderInput("Connected Load", "connectedLoad", "KW")}
//           {renderInput("System Voltage", "systemVoltage", "V")}
//           {renderDropdown("Power Factor", "powerFactor", ["1"])}
//           {renderDropdown("Load Factor", "loadFactor", ["1"])}
//           {renderDropdown("Demand Factor", "demandFactor", ["1"])}
//           {renderInput("MD Load", "mdLoad", "KW")}
//           {renderInput("KVAR", "kvar")}
//           {renderInput("Full Load Current", "fullLoadCurrent", "KW")}
//           {renderInput("Spare Design", "spareDesign", "KW")}
//           {renderInput("Switch Gear Current", "switchGearCurrent", "KW")}
//           {renderInput("Breaker Selection", "breakerSelection", "KW")}
//         </div>
//       </div>
//       {/* Right: Floor Preview */}
//       <div className="flex-1 h-full">
//         <FloorPreview />
//       </div>
//     </div>
//   );
// };

// export default BreakerSizingForm;

import React, { useState } from "react";
import { useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import FloorPreview from "../shared/FloorPreview";

const BreakerSizingForm = () => {
  const [building, setBuilding] = useState("");
  const [panel, setPanel] = useState("");
  const [equipment, setEquipment] = useState("");
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [addedClusters, setAddedClusters] = useState([]);

  const [connectedLoad, setConnectedLoad] = useState();
  const [systemVoltage, setSystemVoltage] = useState();
  const [powerFactor, setPowerFactor] = useState();
  const [loadFactor, setLoadFactor] = useState();
  const [demandFactor, setDemandFactor] = useState();
  const [mdLoad, setMdLoad] = useState();
  const [mdFactor, setMdFactor] = useState();
  const [kvar, setKvar] = useState();
  const [fullLoadCurrent, setFullLoadCurrent] = useState();
  const [spareDesign, setSpareDesign] = useState();
  const [switchGearCurrent, setSwitchGearCurrent] = useState();
  const [breakerSelection, setBreakerSelection] = useState();

  // const calculateMdLoad = () => {
  //   const mdF = parseFloat(mdFactor);
  //   const cl = parseFloat(connectedLoad);
  //   const pf = parseFloat(powerFactor);

  //   if (!isNaN(mdF) && !isNaN(cl) && !isNaN(pf) && pf !== 0) {
  //     const mdL = (mdF * cl) / pf;
  //     setMdLoad(mdL.toFixed(2));
  //     return mdL;
  //   }

  //   return null;
  // };

  // const calculateKvar = () => {
  //   // const pf = parseFloat(powerFactor);
  //   const pf = 0.4;
  //   const mdL = 3;
  //   if (!isNaN(pf) && !isNaN(mdL)) {
  //     console.log("-------------------", pf, mdL);
  //     const kvarVal = Math.sqrt(1 - pf * pf) * mdL;
  //     console.log(kvarVal);
  //     setKvar(kvarVal.toFixed(2));
  //     // console.log(kvarVal);
  //   }
  // };

  const handleCal = () => {
    const mdF = parseFloat(mdFactor);
    const cl = parseFloat(connectedLoad);
    const pf = parseFloat(powerFactor);
    // const pf = 0.4;
    let mdL;

    if (!isNaN(mdF) && !isNaN(cl) && !isNaN(pf) && pf !== 0) {
      mdL = (mdF * cl) / pf;
      setMdLoad(mdL.toFixed(2));
      // return mdL;
    }
    if (!isNaN(pf) && !isNaN(mdL)) {
      const kvarVal = Math.sqrt(1 - pf * pf) * mdL;
      setKvar(kvarVal.toFixed(2));
      // console.log(kvarVal);
    }
  };

  useEffect(() => {
    const lightingDbs = JSON.parse(
      localStorage.getItem("confirmedLightingDbs") || "[]"
    );
    const powerDbs = JSON.parse(
      localStorage.getItem("confirmedPowerDbs") || "[]"
    );

    const lightingOptions = lightingDbs.map((db) => ({
      label: `Lighting - ${db.dbName}`,
      value: `lighting-${db.dbName}`,
    }));

    const powerOptions = powerDbs.map((db) => ({
      label: `Power - ${db.dbName}`,
      value: `power-${db.dbName}`,
    }));

    setEquipmentOptions([...lightingOptions, ...powerOptions]);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar Form */}
      <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 rounded-md pt-0 p-4 font-sans text-[13px] text-[#4B5563] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[14px] font-semibold text-black leading-none">
              Breaker Sizing
            </h1>
            <p className="text-[11px] text-gray-400 mt-[2px]">No update yet</p>
          </div>
          <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>
        <div className="border-b border-gray-200 mb-3"></div>

        {/* Form Fields */}
        <div className="overflow-y-auto pr-1 h-[calc(100%-70px)]">
          {/* Panel */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Select Panel
            </label>
            <select
              value={panel}
              onChange={(e) => setPanel(e.target.value)}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="MDB">MDB</option>
              <option value="LDB">LDB</option>
              <option value="PDB">PDB</option>
            </select>
          </div>

          {/* Equipment */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Select Connected Equipments
            </label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-[95%] border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-gray-200 focus:outline-none focus:border-[#0083EE]"
            >
              <option value="" disabled>
                Select
              </option>
              {equipmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                if (!equipment) return;

                const [type, dbName] = equipment.split("-");
                const storageKey =
                  type === "lighting"
                    ? "confirmedLightingDbs"
                    : "confirmedPowerDbs";
                const dbList = JSON.parse(
                  localStorage.getItem(storageKey) || "[]"
                );

                const selectedDb = dbList.find((db) => db.dbName === dbName);
                if (selectedDb) {
                  const exists = addedClusters.some(
                    (db) => db.dbName === dbName && db.type === type
                  );
                  if (!exists) {
                    const newCluster = {
                      type,
                      dbName: selectedDb.dbName,
                      totalWattage: selectedDb.totalWattage,
                    };
                    const updatedClusters = [...addedClusters, newCluster];
                    setAddedClusters(updatedClusters);

                    // 🔢 Sum wattage from all clusters and update connectedLoad
                    const total = updatedClusters.reduce(
                      (sum, db) => sum + Number(db.totalWattage || 0),
                      0
                    );
                    setConnectedLoad(total.toString());
                  }
                }
              }}
              className="bg-[#0083EE] hover:bg-[#1C78DC] text-white px-3 py-2 rounded-md text-sm"
            >
              Add
            </button>
          </div>

          {/* List of Added Clusters */}
          <div className="space-y-2">
            {addedClusters.map((cluster, index) => (
              <div
                key={`${cluster.type}-${cluster.dbName}-${index}`}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md border text-sm text-gray-700"
              >
                <div>
                  <div className="font-semibold">
                    {cluster.type === "lighting" ? "Lighting" : "Power"} -{" "}
                    {cluster.dbName}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Wattage: {cluster.totalWattage} W
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connected Load */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Connected Load
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
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
                min="0"
                step="any"
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

          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              MD Factor
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={mdFactor}
                onChange={(e) => setMdFactor(e.target.value)}
                onBlur={handleCal}
                className="w-[95%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
                placeholder="Enter value"
                step="any"
                min="0"
              />
            </div>
          </div>

          {/* MD Load */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              MD Load
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={mdLoad}
                onChange={(e) => setMdLoad(e.target.value)}
                className="w-[74%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
                placeholder="Enter value"
                step="any"
                min="0"
              />
              <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
                KVA
              </div>
            </div>
          </div>

          {/* KVAR */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              KVAR
            </label>
            <input
              type="number"
              value={kvar}
              onChange={(e) => setKvar(e.target.value)}
              className="w-[95%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
              placeholder=""
              step="any"
              min="0"
            />
          </div>

          {/* Full Load Current */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Full Load Current
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fullLoadCurrent}
                onChange={(e) => setFullLoadCurrent(e.target.value)}
                className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
                placeholder="Enter value"
              />
              <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
                KW
              </div>
            </div>
          </div>

          {/* Spare Design */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Spare Design
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={spareDesign}
                onChange={(e) => setSpareDesign(e.target.value)}
                className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
                placeholder="Enter value"
              />
              <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
                KW
              </div>
            </div>
          </div>

          {/* Switch Gear Current */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Switch Gear Current
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={switchGearCurrent}
                onChange={(e) => setSwitchGearCurrent(e.target.value)}
                className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
                placeholder="Enter value"
              />
              <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
                KW
              </div>
            </div>
          </div>

          {/* Breaker Selection */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-[#5B5B5B] mb-1">
              Breaker Selection
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={breakerSelection}
                onChange={(e) => setBreakerSelection(e.target.value)}
                className="w-[75%] rounded-md px-3 py-2 text-[13px] bg-gray-200 border border-gray-200 focus:outline-none focus:border-[#0083EE]"
                placeholder="Enter value"
              />
              <div className="w-14 h-8 flex items-center justify-center rounded-md border border-[#E4E4E7] bg-gray-200 text-sm text-gray-600">
                KW
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default BreakerSizingForm;
