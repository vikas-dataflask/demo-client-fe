import React, { useState, useEffect, useCallback, useMemo } from "react";

import { ReloadIcon } from "../../icons/ReloadIcon";
import EyeIcon from "../../icons/EyeIcon";
import EyeCloseIcon from "../../icons/EyeCloseIcon";
import SearchIcon from "../../icons/SearchIcon";
import attributeMapping from "./attributeMapping";

// Service → bases mapping (duplicated for helper functions' scope within this file for self-containment)
const serviceLayers = {
  HVAC: ["CEILING SUSPENDED UNIT", "SPLIT UNIT", "CASSETTE UNIT", "OUTDOOR"],
  ELECTRICAL: ["DISTRIBUTION BOARDS", "LED BATTEN", "LED BULKHEAD"],
  "FIRE FIGHTING": [
    "HYDRANT MAIN FIRE PUMP",
    "JOCKEY PUMP",
    "PORTABLE FIRE EXTINGUISHERS",
    "Sprinkler Main Fire Pumps", // Included for completeness based on groupLayers.js
  ],
  PLUMBING: ["BUTTERFLY VALVE", "NON RETURN VALVE"],
};

// “All” flattens every base once (duplicated for helper functions' scope within this file for self-containment)
const allBases = Array.from(new Set(Object.values(serviceLayers).flat()));

// Helper to get base name from full layer name
const getBaseNameFromLayer = (fullLayerName, currentService) => {
  if (!fullLayerName) return null;

  const basesToCheck =
    currentService === "All" ? allBases : serviceLayers[currentService] || [];

  for (const base of basesToCheck) {
    if (fullLayerName.toUpperCase().includes(base.toUpperCase())) {
      return base;
    }
  }
  return null;
};

// Helper to get attribute definition (updated to return the entire attribute object including label and unit)
const getAttributesForLayerDefinition = (serviceType, heading) => {
  if (!heading) return null;

  if (serviceType === "All") {
    for (const svcKey in attributeMapping) {
      const serviceCategory = attributeMapping[svcKey];
      if (serviceCategory) {
        const match = serviceCategory.find((item) => item.heading === heading);
        if (match) {
          return match.attributes;
        }
      }
    }
    return null;
  } else {
    const service = attributeMapping[serviceType];
    if (!service) return null;
    const match = service.find((item) => item.heading === heading);
    return match?.attributes || null;
  }
};

export default function SidebarEQ({
  entities = [],
  onLayerSelect,
  selectedBase = [],
  selectedService,
  onServiceChange,
  activeLayer,
  setActiveLayer,
  onUpdateLayerAttributes,
  activeLayerData,
}) {
  const [activeTab, setActiveTab] = useState("property");
  const [search, setSearch] = useState("");

  const [localActiveLayerData, setLocalActiveLayerData] = useState(null);

  // Sync local state with props when activeLayerData changes (item selected/deselected)
  useEffect(() => {
    // --- ADD THIS LOG HERE ---
    console.log(
      "SidebarEQ useEffect triggered. activeLayerData prop received:",
      activeLayerData
    );

    if (activeLayerData) {
      setLocalActiveLayerData({
        ...activeLayerData,
        // Ensure attributes object is deeply copied. We store flat key:value here.
        attributes: activeLayerData.attributes
          ? { ...activeLayerData.attributes }
          : {},
      });
      // --- ADD THIS LOG HERE ---
      console.log("SidebarEQ localActiveLayerData SET to:", activeLayerData);
    } else {
      setLocalActiveLayerData(null);
      // --- ADD THIS LOG HERE ---
      console.log("SidebarEQ localActiveLayerData SET to NULL");
    }
  }, [activeLayerData]);

  // Handler for all input changes (description, remark, and attributes)
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setLocalActiveLayerData((prevData) => {
      if (!prevData) return prevData;

      const newData = { ...prevData };

      if (name === "description" || name === "remark") {
        newData[name] = value;
      } else {
        // Assume it's an attribute and store it as a direct key-value pair
        newData.attributes = {
          ...newData.attributes,
          [name]: value, // Store directly as value
        };
      }
      return newData;
    });
  }, []);

  // Handler for the "Save" button in the sidebar
  const handleSaveAttributes = useCallback(() => {
    if (onUpdateLayerAttributes && localActiveLayerData) {
      console.log("SB: Save button clicked. Dispatching changes to parent.");
      // Pass the original layerName to identify the item, and the updated data
      onUpdateLayerAttributes(activeLayerData.id, {
        // Use layerName or layer
        description: localActiveLayerData.description,
        remark: localActiveLayerData.remark,
        attributes: localActiveLayerData.attributes, // These are already flat key:value
      });
    } else {
      console.log(
        "SB: Cannot save, no active layer data or onUpdateLayerAttributes not available."
      );
    }
  }, [onUpdateLayerAttributes, localActiveLayerData]);

  // Memoized lists of layers and bases for efficient rendering
  const { basesForService, filteredBases } = useMemo(() => {
    const basesForCurrentService =
      selectedService === "All"
        ? allBases
        : serviceLayers[selectedService] || [];

    const foundBasesSet = new Set();
    const relevantEntities = entities.filter((entity) => {
      // Ensure we use entity.layer or entity.layerName from the item
      const layerId = entity.layer || entity.layerName;
      const baseName = getBaseNameFromLayer(layerId, selectedService);
      return baseName && basesForCurrentService.includes(baseName);
    });

    relevantEntities.forEach((entity) => {
      // Use the resolved base name
      const baseName = getBaseNameFromLayer(
        entity.layer || entity.layerName,
        selectedService
      );
      if (baseName) {
        foundBasesSet.add(baseName);
      }
    });

    const newLayerList = Array.from(foundBasesSet).sort();
    const newLayers = newLayerList.map((name) => ({ name, color: "#FFA500" })); // Default color orange

    // Filtered bases for display in the sidebar list based on search input
    const filtered = newLayers.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase())
    );

    return { basesForService: newLayers, filteredBases: filtered };
  }, [entities, selectedService, search]);

  const [layers, setLayers] = useState([]); // Filtered layers for display in sidebar list
  const [visibility, setVisibility] = useState({}); // Local state for eye icons

  useEffect(() => {
    if (JSON.stringify(basesForService) !== JSON.stringify(layers)) {
      setLayers(basesForService);
    }

    const newVisibility = {};
    basesForService.forEach((base) => {
      newVisibility[base.name] = visibility[base.name] ?? true;
    });

    if (JSON.stringify(newVisibility) !== JSON.stringify(visibility)) {
      setVisibility(newVisibility);
    }
  }, [basesForService, layers, visibility]);

  const toggleVisibility = useCallback((name) => {
    console.log("SB: Toggling visibility for:", name);
    setVisibility((v) => ({ ...v, [name]: !v[name] }));
  }, []);

  const handleClickLayer = useCallback(
    (baseName) => {
      console.log("SB: handleClickLayer called for baseName:", baseName);
      if (onLayerSelect) {
        onLayerSelect(baseName);
      }
    },
    [onLayerSelect]
  );

  return (
    <div className="w-[320px] h-full bg-white shadow-md border border-[#E5E7EB] flex flex-col rounded-[12px]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[16px] font-semibold">Extract Quantities</p>
            <p className="text-[12px] text-[#6B7280]">Updated: Just now</p>
          </div>
          <button
            className="w-[24px] h-[24px] bg-[#0083EE] text-white hover:bg-sky-600 rounded-md flex items-center justify-center transition"
            onClick={() => console.log("Reload clicked")}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>
      </div>

      {/* Main scrollable area of the sidebar */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 space-y-4 pb-4 bg-white">
          {/* Service Type Dropdown */}
          <div>
            <p className="text-[12px] font-medium text-[#6B7280] mb-1">
              Service Type:
            </p>
            <select
              className="text-[14px] px-3 py-2 border border-[#D1D5DB] rounded-[8px] w-full"
              value={selectedService}
              onChange={(e) => {
                console.log("SB: Service dropdown changed to:", e.target.value);
                onServiceChange(e.target.value);
              }}
            >
              <option value="All">All</option>
              {Object.keys(serviceLayers).map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Layers List */}
          <div>
            <p className="text-[14px] font-medium mb-2">Layers</p>
            <div className="flex items-center px-3 py-1.5 mb-2 border border-[#D1D5DB] rounded-[6px] bg-white">
              <SearchIcon className="w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 ml-2 text-[13px] placeholder-[#6B7280] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              {filteredBases.map((base) => (
                <div key={base.name}>
                  <div
                    className={`flex items-center justify-between px-2 py-2 rounded-[6px] cursor-pointer ${
                      selectedBase.includes(base.name)
                        ? "bg-[#E8EDF9]"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleClickLayer(base.name)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBase.includes(base.name)}
                        onChange={() => handleClickLayer(base.name)} // <--- ADD THIS LINE
                        className="accent-[#007AFF]"
                      />
                      <span className="text-[13px] font-semibold">
                        {base.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* {visibility[base.name] ? (
                        <EyeIcon
                          className="w-4 h-4 text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(base.name);
                          }}
                        />
                      ) : (
                        <EyeCloseIcon
                          className="w-4 h-4 text-gray-400 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(base.name);
                          }}
                        />
                      )} */}
                      <div
                        className="w-[10px] h-[10px] rounded-sm"
                        style={{ backgroundColor: base.color }}
                      />
                    </div>
                  </div>
                  {/* Removed the nested <ul> that listed individual entities */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel (Property Details / Other Details) */}
      <div className="flex flex-col h-[320px] shrink-0 border-t border-[#E5E7EB] bg-white">
        {/* Tabs for Property / Other Details */}
        <div className="flex h-[40px]">
          <button
            className={`flex-1 text-[14px] font-medium ${
              activeTab === "property"
                ? "bg-[#007AFF] text-white"
                : "bg-white text-[#6B7280]"
            }`}
            onClick={() => setActiveTab("property")}
          >
            Property Details
          </button>
          <button
            className={`flex-1 text-[14px] font-medium ${
              activeTab === "other"
                ? "bg-[#007AFF] text-white"
                : "bg-white text-[#6B7280]"
            }`}
            onClick={() => setActiveTab("other")}
          >
            Other Details
          </button>
        </div>

        {/* Scrollable Content Area for Property/Other Details */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-4">
          {localActiveLayerData ? (
            <>
              {/* Description Section */}
              <div className="border border-[#D1D5DB] rounded-[8px] overflow-hidden">
                <div className="bg-white px-3 py-2 border-b border-[#E5E7EB] text-[13px] font-medium">
                  Description
                </div>
                <textarea
                  rows={4}
                  name="description"
                  value={localActiveLayerData.description || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-[13px] text-[#374151] placeholder-[#6B7280] focus:outline-none resize-none"
                />
              </div>

              {/* Attributes Section */}
              <div className="border border-[#D1D5DB] rounded-[8px] overflow-hidden">
                <div className="bg-white px-3 py-2 border-b border-[#E5E7EB] text-[13px] font-medium">
                  Attributes
                </div>
                <div className="px-3 py-3 space-y-4 text-[13px]">
                  {getAttributesForLayerDefinition(
                    selectedService,
                    localActiveLayerData.base
                  ) ? (
                    Object.entries(
                      getAttributesForLayerDefinition(
                        selectedService,
                        localActiveLayerData.base
                      )
                    ).map(([key, attrDef]) => {
                      const currentValue =
                        localActiveLayerData.attributes?.[key] || "";
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-[#040c1a]">
                            {attrDef.label}
                          </span>
                          <div className="flex-1 flex items-center border border-[#D1D5DB] rounded-[6px] bg-white">
                            <input
                              type="text"
                              name={key}
                              value={currentValue}
                              onChange={handleInputChange}
                              placeholder="Value"
                              className="flex-1 px-2 py-1 text-[13px] focus:outline-none rounded-l-[6px]"
                            />
                            {attrDef.unit && (
                              <span className="px-2 py-1 text-[13px] bg-gray-50 border-l border-[#D1D5DB] rounded-r-[6px] text-gray-700">
                                {attrDef.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[13px] text-gray-500">
                      No specific attributes defined for this layer type.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-[14px] text-gray-500 p-4">
              Select an item from the list to view and edit its details.
            </p>
          )}
        </div>
        {/* Save Button at the bottom of the attribute section */}
        {localActiveLayerData && (
          <div className="sticky bottom-0 w-full bg-white border-t border-gray-300 p-3 flex justify-end shadow">
            <button
              onClick={handleSaveAttributes}
              className="bg-[#007AFF] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
