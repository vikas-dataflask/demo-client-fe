import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import TopBarEQ from "./TopBarEQ";
import {
  useGetQEListByIdQuery,
  useUpdateQEMutation,
} from "../../redux/features/api/api";
import SidebarEQ from "./SidebarEQ";
import attributeMapping from "./attributeMapping";

// Service → bases mapping
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

// Build list of options: "All" + each service
const serviceKeys = ["All", ...Object.keys(serviceLayers)];
// Flatten for "All"
const allBases = Array.from(new Set(Object.values(serviceLayers).flat()));

// Debug logging for service layers and bases
console.log("=== Service Layers Configuration ===");
console.log("serviceLayers:", serviceLayers);
console.log("serviceKeys:", serviceKeys);
console.log("allBases:", allBases);
console.log("===================================");

// Color map for table headers
const colorMap = {
  "CEILING SUSPENDED UNIT": "bg-[#FCE7CE]",
  "SPLIT UNIT": "bg-[#D9EDF8]",
  "CASSETTE UNIT": "bg-[#D9EDF8]",
  OUTDOOR: "bg-[#F4DAEB]",
  "DISTRIBUTION BOARDS": "bg-[#D9EDF8]", // Adjusted to match your provided old code for consistency
  "LED BATTEN": "bg-[#FCE7CE]", // Adjusted
  "LED BULKHEAD": "bg-[#F4DAEB]", // Adjusted
  "HYDRANT MAIN FIRE PUMP": "bg-[#D9EDF8]", // Adjusted
  "JOCKEY PUMP": "bg-[#FCE7CE]", // Adjusted
  "PORTABLE FIRE EXTINGUISHERS": "bg-[#F4DAEB]", // Adjusted
  "Sprinkler Main Fire Pumps": "bg-[#D1FADF]", // Added for completeness
  "BUTTERFLY VALVE": "bg-[#D9EDF8]",
  "NON RETURN VALVE": "bg-[#FCE7CE]",
};

export default function QuantityExtraction() {
  const { projectId } = useParams();

  const {
    data: qeProjectData,
    error,
    isLoading,
    refetch,
  } = useGetQEListByIdQuery(projectId);

  const [editableRawData, setEditableRawData] = useState([]);
  const [selectedService, setSelectedService] = useState("All"); // Changed default to "All" for broader initial view
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeLayerData, setActiveLayerData] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusMessageType, setStatusMessageType] = useState(null);

  // Define selectedBase state and its setter
  const [selectedBase, setSelectedBase] = useState([]);

  const [
    saveProjectQuantities,
    {
      isLoading: isSaving,
      isSuccess: saveSuccess,
      isError: saveError,
      error: saveErrorData,
    },
  ] = useUpdateQEMutation();

  const layerDataMapRef = useRef(new Map());

  // Function to parse value from layer name (e.g., wattage, length, airflow)
  const parseValueFromLayerName = (layerName, attributeName) => {
    let match;
    switch (attributeName) {
      case "wattage":
        match = layerName.match(/(\d+)\s*W/i);
        return match ? parseFloat(match[1]) : null;
      case "length":
        match = layerName.match(/(\d+(?:\.\d+)?)\s*M/i);
        return match ? parseFloat(match[1]) : null;
      case "airflow":
        match = layerName.match(/(\d+)\s*CFM/i);
        return match ? parseFloat(match[1]) : null;
      case "capacityLPM":
        match = layerName.match(/(\d+)\s*LPM/i);
        return match ? parseFloat(match[1]) : null;
      case "rpm":
        match = layerName.match(/(\d+)\s*RPM/i);
        return match ? parseFloat(match[1]) : null;
      case "headMeters":
        match = layerName.match(/(\d+)\s*M/i);
        return match ? parseFloat(match[1]) : null;
      case "diameterMM":
        match = layerName.match(/(\d+)\s*MM/i);
        return match ? parseFloat(match[1]) : null;
      default:
        return null;
    }
  };

  // Helper to get base name from full layer name
  const getBaseNameFromLayer = useCallback((fullLayerName, currentService) => {
    if (!fullLayerName) return null;
    
    console.log(`getBaseNameFromLayer: "${fullLayerName}" with service "${currentService}"`);
    
    const basesToCheck =
      currentService === "All" ? allBases : serviceLayers[currentService] || [];
    
    console.log("Bases to check:", basesToCheck);
    
    for (const base of basesToCheck) {
      if (fullLayerName.toUpperCase().includes(base.toUpperCase())) {
        console.log(`Found match: "${fullLayerName}" matches base "${base}"`);
        return base;
      }
    }
    
    console.log(`No match found for: "${fullLayerName}"`);
    return null;
  }, []);

  // Helper to get attributes for a layer based on its base from attributeMapping
  const getAttributesForLayer = useCallback((layerName, base) => {
    if (!base) return {};
    let attributes = { layerName: layerName }; // Always include layerName, it's an attribute
    for (const serviceCategoryKey in attributeMapping) {
      if (attributeMapping.hasOwnProperty(serviceCategoryKey)) {
        const category = attributeMapping[serviceCategoryKey];
        for (const item of category) {
          if (item.heading === base) {
            for (const attrKey in item.attributes) {
              if (attrKey !== "layerName") {
                // layerName is already handled as a direct attribute
                const parsedVal = parseValueFromLayerName(layerName, attrKey);
                attributes[attrKey] = parsedVal !== null ? parsedVal : ""; // Store flat value
              }
            }
            return attributes;
          }
        }
      }
    }
    return attributes;
  }, []);

  // Function to map initial raw data from backend to editable format
  const parseAndMapInitialData = useCallback(
    (data) => {
      if (!data) return [];

      console.log("=== parseAndMapInitialData Debug ===");
      console.log("Input data:", data);
      console.log("Data type:", Array.isArray(data) ? "Array" : "Object");

      let processedItems = [];

      // Case 1: Data is `extracted_quantities_data` (array of detailed objects)
      if (Array.isArray(data)) {
        console.log("Processing extracted_quantities_data array");
        processedItems = data.map((item) => {
          const base = item.base || getBaseNameFromLayer(item.layerName || item.layer, "All");
          console.log(`Item: ${item.layerName || item.layer} -> Base: ${base}`);
          
          return {
            id:
              item.id ||
              `${item.layerName || item.layer}-${Math.random()
                .toString(36)
                .substr(2, 9)}`, // Ensure unique ID
            layer: item.layerName || item.layer, // Use layerName for display/logic, fall back to layer
            qty: item.quantity || item.qty, // Prioritize 'quantity' from saved, then 'qty' from DXF parse
            base: base, // Ensure base is set
            description: item.description || "",
            remark: item.remark || "",
            attributes: {
              // Ensure attributes are flat key:value, merge existing or default
              ...getAttributesForLayer(
                item.layerName || item.layer,
                base
              ), // Default attributes
              ...item.attributes, // Override with saved attributes
              quantity:
                item.quantity !== undefined
                  ? item.quantity
                  : item.qty !== undefined
                  ? item.qty
                  : "", // Ensure quantity is explicit in attributes
              layerName: item.layerName || item.layer, // Ensure layerName is explicit in attributes
            },
            entities: item.entities || [], // Keep entities if they exist (from DXF parsing)
          };
        });
      }
      // Case 2: Data is `grouped_layers` (object mapping base names to objects of layer counts)
      else if (
        data &&
        typeof data === "object" &&
        Object.keys(data).length > 0
      ) {
        console.log("Processing grouped_layers object");
        for (const baseName in data) {
          if (data.hasOwnProperty(baseName)) {
            const layersInBase = data[baseName]; // e.g., {"CEILING SUSPENDED UNIT 2.5 TR": 2, "CEILING SUSPENDED UNIT 1.5 TR": 2}
            for (const layerNameInGrouped in layersInBase) {
              if (layersInBase.hasOwnProperty(layerNameInGrouped)) {
                const quantity = layersInBase[layerNameInGrouped];
                const base = getBaseNameFromLayer(layerNameInGrouped, "All"); // Derive base from full layer name
                
                console.log(`Layer: ${layerNameInGrouped} -> Base: ${base}`);

                const attributes = getAttributesForLayer(
                  layerNameInGrouped,
                  base
                );

                processedItems.push({
                  id: `${layerNameInGrouped}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`, // Unique ID
                  layer: layerNameInGrouped, // Full layer name
                  qty: quantity, // Quantity from DXF
                  base: base, // Base name
                  description: "", // Default description
                  remark: "", // Default remark
                  attributes: { ...attributes, quantity: quantity || "" }, // Populate quantity attribute
                  entities: [], // No dxf_entities here for this structure
                });
              }
            }
          }
        }
      }
      
      console.log("Processed items:", processedItems.length);
      console.log("Sample processed item:", processedItems[0]);
      console.log("================================");
      
      return processedItems;
    },
    [getBaseNameFromLayer, getAttributesForLayer]
  );

  useEffect(() => {
    if (qeProjectData) {
      let dataToInitialize = [];
      // Prioritize `extracted_quantities_data` if available
      if (
        qeProjectData.extracted_quantities_data &&
        qeProjectData.extracted_quantities_data.length > 0
      ) {
        dataToInitialize = parseAndMapInitialData(
          qeProjectData.extracted_quantities_data
        );
      }
      // Fallback to `grouped_layers` if `extracted_quantities_data` is empty or not present
      else if (
        qeProjectData.grouped_layers &&
        Object.keys(qeProjectData.grouped_layers).length > 0
      ) {
        dataToInitialize = parseAndMapInitialData(qeProjectData.grouped_layers);
      }
      setEditableRawData(dataToInitialize);

      const initialMap = new Map();
      dataToInitialize.forEach((item) => {
        initialMap.set(item.id, item);
      });
      layerDataMapRef.current = initialMap;
      setActiveLayer(null);
      setActiveLayerData(null);

      // Always start with "All" service to show all data initially
      setSelectedService("All");
      
      // Reset selected base to show all bases initially
      setSelectedBase([]);
      
      console.log("Initialized with data:", dataToInitialize.length, "items");
      console.log("Service set to 'All' initially");
    }
  }, [qeProjectData, parseAndMapInitialData]);

  useEffect(() => {
    if (activeLayer && layerDataMapRef.current.has(activeLayer)) {
      setActiveLayerData(layerDataMapRef.current.get(activeLayer));
    } else {
      setActiveLayerData(null);
    }
  }, [activeLayer]);

  useEffect(() => {
    if (isSaving) {
      setStatusMessage("Saving project...");
      setStatusMessageType("info");
    } else if (saveSuccess) {
      setStatusMessage("Project saved successfully!");
      setStatusMessageType("success");
      const timer = setTimeout(() => {
        setStatusMessage(null);
        setStatusMessageType(null);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (saveError) {
      const errorMessage =
        saveErrorData?.data?.message ||
        saveErrorData?.error ||
        "Unknown error occurred.";
      setStatusMessage(`Failed to save project: ${errorMessage}`);
      setStatusMessageType("error");
      const timer = setTimeout(() => {
        setStatusMessage(null);
        setStatusMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, saveSuccess, saveError, saveErrorData]);

  // const handleUpdateLayerAttributes = useCallback(
  //   (oldLayerName, updatedData) => {
  //     setEditableRawData((prevData) => {
  //       const newData = prevData.map((item) => {
  //         // Use item.layer (the full layer name) as the identifier
  //         if (item.layer === oldLayerName) {
  //           const newLayerName =
  //             updatedData.attributes?.layerName || item.layer;
  //           const updatedItem = {
  //             ...item,
  //             description: updatedData.description,
  //             remark: updatedData.remark,
  //             attributes: {
  //               ...item.attributes,
  //               ...updatedData.attributes,
  //             },
  //             layer: newLayerName, // Update the layer name if it changed
  //             // Ensure qty and quantity attribute are aligned if layerName is edited
  //             qty: updatedData.attributes?.quantity || item.qty, // Keep qty in sync
  //             quantity: updatedData.attributes?.quantity || item.quantity, // Ensure quantity is also updated if it's a top-level field
  //           };

  //           // Update the ref map
  //           if (oldLayerName !== newLayerName) {
  //             layerDataMapRef.current.delete(oldLayerName);
  //             layerDataMapRef.current.set(newLayerName, updatedItem);
  //           } else {
  //             layerDataMapRef.current.set(newLayerName, updatedItem);
  //           }
  //           return updatedItem;
  //         }
  //         return item;
  //       });

  //       // After updating editableRawData, re-set activeLayerData if the active layer was updated
  //       if (activeLayer === oldLayerName) {
  //         const newActiveLayer =
  //           updatedData.attributes?.layerName || oldLayerName;
  //         const updatedActiveItem = newData.find(
  //           (item) => item.layer === newActiveLayer
  //         );
  //         setActiveLayer(newActiveLayer);
  //         setActiveLayerData(updatedActiveItem);
  //       }
  //       return newData;
  //     });
  //   },
  //   [activeLayer]
  // );
  const handleUpdateLayerAttributes = useCallback(
    // Change parameter from oldLayerName to itemId
    (itemId, updatedData) => {
      setEditableRawData((prevData) => {
        // Find the original item by its ID to get its initial layer name (for map key management)
        const originalItem = prevData.find((item) => item.id === itemId);
        if (!originalItem) return prevData; // Should ideally not happen

        const newData = prevData.map((item) => {
          if (item.id === itemId) {
            // Use item.id to uniquely identify the item for update
            const newLayerName =
              updatedData.attributes?.layerName || item.layer;
            const updatedItem = {
              ...item,
              description: updatedData.description,
              remark: updatedData.remark,
              attributes: {
                ...item.attributes,
                ...updatedData.attributes,
              },
              layer: newLayerName, // Update the layer name
              qty: updatedData.attributes?.quantity || item.qty,
              quantity: updatedData.attributes?.quantity || item.quantity,
            };

            // // Update the layerDataMapRef (which uses layer names as keys)
            // // If the layer name has changed for this item, delete the old entry
            // if (originalItem.layer !== newLayerName) {
            //   layerDataMapRef.current.delete(originalItem.layer);
            // }
            // // Always set/update the map with the latest item and its (potentially new) layer name as the key
            // layerDataMapRef.current.set(newLayerName, updatedItem);

            // return updatedItem;
            // Update the layerDataMapRef: now keyed by ID
            // No need to delete old entry by layer name, just update by ID
            layerDataMapRef.current.set(itemId, updatedItem);

            return updatedItem;
          }
          return item;
        });

        // After updating editableRawData, ensure activeLayer and activeLayerData reflect the changes
        const updatedActiveItem = newData.find((item) => item.id === itemId);
        if (updatedActiveItem) {
          // If the updated item was the active one, update activeLayer to its new name
          // and update activeLayerData with the full updated item object.
          setActiveLayer(updatedActiveItem.id);
          setActiveLayerData(updatedActiveItem);
        }

        return newData;
      });
    },
    [] // Dependencies: Removed activeLayer as it's now set internally based on the updated item.
  );
  const handleSaveProject = async () => {
    try {
      if (!projectId) {
        setStatusMessage("Project ID is missing. Cannot save.");
        setStatusMessageType("error");
        return;
      }
      const dataToSave = editableRawData.map(({ entities, id, ...rest }) => ({
        ...rest,
        // When saving, convert 'layer' (full layer name) to 'layerName' for backend consistency
        layerName: rest.layer,
        // Also ensure quantity is stored as a direct field, taken from attributes.quantity
        quantity: rest.attributes?.quantity,
      }));

      await saveProjectQuantities({
        projectId,
        updatedData: { extracted_quantities_data: dataToSave },
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const buildTableSections = useMemo(() => {
    const sections = {};
    const currentBases =
      selectedService === "All"
        ? allBases
        : serviceLayers[selectedService] || [];

    console.log("=== buildTableSections Debug ===");
    console.log("selectedService:", selectedService);
    console.log("currentBases:", currentBases);
    console.log("selectedBase:", selectedBase);
    console.log("editableRawData length:", editableRawData.length);
    console.log("editableRawData sample:", editableRawData.slice(0, 2));

    // Filter and group data for table display
    editableRawData.forEach((item) => {
      const itemBase = item.base || getBaseNameFromLayer(item.layer, "All"); // Ensure base is determined if not explicitly set
      
      // Filter by selected service, available bases, and selected bases from the sidebar
      if (
        itemBase &&
        currentBases.includes(itemBase) &&
        (selectedBase.length === 0 || selectedBase.includes(itemBase)) // <-- NEW CONDITION
      ) {
        if (!sections[itemBase]) {
          sections[itemBase] = [];
        }
        sections[itemBase].push(item);
      }
    });

    console.log("Final sections:", Object.keys(sections));
    console.log("Sections with data:", Object.entries(sections).map(([key, items]) => [key, items.length]));
    console.log("================================");

    // Sort sections by base name
    const sortedSections = {};
    Object.keys(sections)
      .sort()
      .forEach((key) => {
        sortedSections[key] = sections[key];
      });
    return sortedSections;
  }, [editableRawData, selectedService, getBaseNameFromLayer, selectedBase]); // <-- ADD selectedBase TO DEPENDENCIES

  // Loading and Error checks need to be AFTER all hook calls
  if (isLoading) return <div>Loading project data...</div>;
  if (error) return <div>Error loading project: {error.message}</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBarEQ onSaveProject={handleSaveProject} project={qeProjectData} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarEQ
          entities={editableRawData}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          activeLayerData={activeLayerData}
          onUpdateLayerAttributes={handleUpdateLayerAttributes}
          onServiceChange={setSelectedService} // Pass setter for service change from sidebar
          onLayerSelect={(baseName) => {
            setSelectedBase((prevSelected) => {
              if (prevSelected.includes(baseName)) {
                // If the base is already selected, unselect it
                return prevSelected.filter((name) => name !== baseName);
              } else {
                // If the base is not selected, select it
                return [...prevSelected, baseName];
              }
            });
          }}
          selectedBase={selectedBase}
          // selectedBase={
          //   selectedService === "All"
          //     ? allBases
          //     : serviceLayers[selectedService] || []
          // } // Pass all relevant bases for highlighting
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status Message Display */}
          {statusMessage && (
            <div
              className={`p-3 text-center text-sm font-medium ${
                statusMessageType === "success"
                  ? "bg-green-100 text-green-700"
                  : statusMessageType === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB]">
            <div className="bg-white p-6 rounded-lg shadow min-h-full">
              <h2 className="text-xl font-semibold mb-4 text-[#101828]">
                Quantity Details
              </h2>
              <div className="overflow-x-auto">
                {Object.keys(buildTableSections).length === 0 ? (
                  <p className="text-gray-500">
                    No quantity data available for this project. Upload a DXF
                    file or save quantities to see data here.
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300 bg-[#F9FAFB]">
                          Layer
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300 bg-[#F9FAFB]">
                          Quantity
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300 bg-[#F9FAFB]">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300 bg-[#F9FAFB]">
                          Brand
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300 bg-[#F9FAFB]">
                          Rates
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-[#F9FAFB]">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(buildTableSections).map(
                        ([base, items]) => (
                          <React.Fragment key={base}>
                            <tr>
                              <td
                                colSpan="6"
                                className={`p-3 text-sm font-semibold text-gray-900 ${
                                  colorMap[base] || "bg-gray-200"
                                }`}
                              >
                                {base}
                              </td>
                            </tr>
                            {items.map((item) => (
                              <tr
                                key={item.id}
                                className={`cursor-pointer hover:bg-gray-100 ${
                                  activeLayer === item.id ? "bg-blue-100" : ""
                                }`}
                                onClick={(e) => {
                                  // Added 'e' (event object) parameter
                                  console.log(
                                    "Row clicked (single click check):",
                                    item.id
                                  ); // <--- ADD THIS LINE FOR DEBUGGING
                                  // Optional: If console.log still requires double click, try uncommenting the line below
                                  // e.stopPropagation(); // This might help if a parent element is absorbing the click

                                  setActiveLayer(item.id);
                                  setActiveLayerData({ ...item });
                                }}
                              >
                                <td
                                  className="p-3 border border-gray-300 text-xs text-gray-800"
                                  style={{ wordBreak: "break-all" }}
                                >
                                  {item.layer}
                                </td>
                                <td className="p-3 border border-gray-300 text-xs text-gray-800">
                                  {item.attributes?.quantity || item.qty}
                                </td>
                                <td
                                  className="p-3 border border-gray-300 text-xs text-gray-800"
                                  style={{ wordBreak: "break-all" }}
                                >
                                  {item.description}
                                </td>
                                <td className="p-3 border border-gray-300 text-xs text-gray-800 break-words">
                                  {item.attributes?.brand || ""}
                                </td>
                                <td className="p-3 border border-gray-300 text-xs text-gray-800 break-words">
                                  {item.attributes?.rates || ""}
                                </td>
                                <td className="p-3 border border-gray-300 text-xs text-gray-800 break-words">
                                  {item.attributes?.amount || ""}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Sticky to the bottom of its immediate flex parent, filling its width */}
          <div className="sticky bottom-0 w-full bg-white border-t border-gray-300 text-base font-semibold text-black px-6 py-4 flex justify-end shadow z-50">
            Total Amount &nbsp;&nbsp;&nbsp; ₹0
          </div>
        </div>
      </div>
    </div>
  );
}
