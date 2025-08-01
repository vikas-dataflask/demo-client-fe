import {
  CloudUpload,
  Info,
  LaptopMinimal,
  LaptopMinimalCheck,
  Plus,
  FileText,
  Square,
  Hexagon,
  Ruler,
  X,
} from "lucide-react";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  setScale,
  setDxfUnit,
  setDrawingScale,
  setFloorLength,
  setFloorWidth,
  setFloorHeight,
  setFloorArea,
  setFloorVolume,
  setFloorDxf,
  setFloorMode,
  setIsDrawingFloor,
  setFloor,
  clearFloor,
  updateFloor,
} from "../../../redux/features/app/floorSlice";
import { Eye, EyeOff } from "lucide-react";
import { useGetDxfEntitiesMutation } from "../../../redux/features/api/api";
import {
  convertUnits,
  formatMeasurement,
  convertPixelsToMeters,
} from "../../../utils/unitConversion";
import CreateFloorModal from "./CreateFloorModal";
import FloorManagement from "./FloorManagement";

const FloorEditorSidebar = ({
  showCoordinates,
  setShowCoordinates,
  onOpenPropertiesPanel,
  onFloorCreated,
}) => {
  const [parseDxf] = useGetDxfEntitiesMutation();
  const [updated, setUpdated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateFloorModal, setShowCreateFloorModal] = useState(false);
  const floorDxf = useSelector((state) => state.floor.floor_dxf);
  const displayUnit = useSelector((state) => state.floor.scale);
  const dxfUnit = useSelector((state) => state.floor.dxf_unit);
  const drawingScale = useSelector((state) => state.floor.drawing_scale);
  const floorMode = useSelector((state) => state.floor.floorMode);
  const isDrawingFloor = useSelector((state) => state.floor.isDrawingFloor);
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();

  // Debug logging
  console.log("FloorEditorSidebar: currentFloor", currentFloor);

  // Function to handle display unit changes and recalculate measurements
  const handleDisplayUnitChange = (newUnit) => {
    dispatch(setScale(newUnit));

    // Note: This function is kept for backward compatibility
    // In the new multi-floor system, measurements are calculated per shape
    // and stored within each floor's shapes array
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".dxf")) {
      setSelectedFile(file);
      setIsUploading(true);
      setIsUploading(true);
    }
    const form = new FormData();
    form.append("dxf_file", file);
    try {
      const response = await parseDxf(form).unwrap();
      console.log("DXF Entities:", response);
      console.log("DXF Response structure:", {
        hasResponse: !!response,
        keys: response ? Object.keys(response) : [],
        dxfEntities: response?.dxf_entities,
        dxfEntitiesLength: response?.dxf_entities?.length,
        dxfLayers: response?.dxf_layers,
        dxfBlocks: response?.dxf_blocks,
      });

      // Extract the actual DXF data from the response
      const dxfData = response?.dxf || response;
      console.log("Extracted DXF data:", dxfData);
      console.log("Extracted DXF data structure:", {
        hasDxfData: !!dxfData,
        keys: dxfData ? Object.keys(dxfData) : [],
        dxfEntities: dxfData?.dxf_entities,
        dxfEntitiesLength: dxfData?.dxf_entities?.length,
        dxfLayers: dxfData?.dxf_layers,
        dxfLayersLength: dxfData?.dxf_layers?.length,
        dxfBlocks: dxfData?.dxf_blocks,
        dxfBlocksKeys: dxfData?.dxf_blocks
          ? Object.keys(dxfData.dxf_blocks)
          : [],
        fullDxfData: JSON.stringify(dxfData, null, 2),
      });

      dispatch(setFloorDxf(dxfData));
      console.log("Dispatched setFloorDxf with:", dxfData);

      setIsUploading(false);
      setUpdated(true);
    } catch (error) {
      console.error("Error parsing DXF file:", error);
      setIsUploading(false);
      setIsUploading(false);
    }
  };

  const hasDxfEntities =
    floorDxf && floorDxf.entities && floorDxf.entities.length > 0;

  // Floor creation functions
  const handleDrawFloor = () => {
    if (!currentFloorId) {
      alert("Please select a floor first before creating floor shapes.");
      return;
    }
    dispatch(setFloorMode("rectangle"));
    dispatch(setIsDrawingFloor(true));
  };

  const handlePolygonMode = () => {
    if (!currentFloorId) {
      alert("Please select a floor first before creating floor shapes.");
      return;
    }
    dispatch(setFloorMode("polygon"));
    dispatch(setIsDrawingFloor(true));
  };

  const handleManualEntry = () => {
    if (!currentFloorId) {
      alert("Please select a floor first before creating floor shapes.");
      return;
    }
    setShowCreateFloorModal(true);
  };

  const handleCreateFloor = (floorData) => {
    console.log("FloorEditorSidebar: Creating floor shape from modal", floorData);
    
    // Add shape to current floor
    if (currentFloor) {
      const floorShape = {
        ...floorData,
        id: `shape-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      const updatedFloor = {
        ...currentFloor,
        shapes: [...(currentFloor.shapes || []), floorShape],
        updatedAt: new Date().toISOString()
      };
      dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
    }
    
    dispatch(setIsDrawingFloor(false));

    // Trigger properties panel opening
    if (onFloorCreated) {
      console.log("FloorEditorSidebar: Calling onFloorCreated callback");
      onFloorCreated(floorData);
    }
  };

  const handleClearFloor = () => {
    // Clear all shapes from the current floor
    if (currentFloor) {
      dispatch(updateFloor({
        id: currentFloor.id,
        updates: {
          shapes: [],
          updatedAt: new Date().toISOString()
        }
      }));
    }
    dispatch(setIsDrawingFloor(false));
  };

  return (
    <div className="bg-white w-[350px] h-full border-r border-gray-300 overflow-y-auto">
      <div className="mt-6 mx-4 flex flex-col gap-4">
        <div className="border-b border-gray-300 pb-4 flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">Floor Editor</div>
            {updated ? (
              <div className="flex items-center gap-2">
                <LaptopMinimalCheck className="text-green-500 h-4 w-4" />
                <div className="text-xs font-semibold text-green-500">
                  Updated Now
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LaptopMinimal className="text-red-500 h-4 w-4" />
                <div className="text-xs font-semibold text-red-500">
                  Waiting for Input
                </div>
              </div>
            )}
          </div>
          <div>
            <Info />
          </div>
        </div>
        {/* DXF Upload Section */}
        <div className="border-b border-gray-300 pb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            DXF Drawing
          </div>
          <div
            className={`flex gap-2 justify-center items-center bg-gray-200 p-2 text-gray-500 font-semibold rounded ${
              !selectedFile &&
              !isUploading &&
              "hover:bg-blue-500 hover:text-white"
            } cursor-pointer relative`}
          >
            {isUploading ? (
              <>
                <div>Uploading...</div>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </>
            ) : selectedFile ? (
              <>
                <div>{selectedFile.name}</div>
                <FileText className="h-4 w-4" />
              </>
            ) : (
              <>
                <div>Upload DXF file</div>
                <CloudUpload className="h-4 w-4" />
              </>
            )}

            {!isUploading && (
              <input
                type="file"
                accept=".dxf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </div>

          {hasDxfEntities && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
              <FileText className="h-3 w-3" />
              <span>{floorDxf.entities.length} entities loaded</span>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 font-semibold">Select Unit</div>
          <div>
            <select
              className="w-full bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-0"
              value={displayUnit}
              onChange={(e) => handleDisplayUnitChange(e.target.value)}
            >
              <option value="m">Meters (m)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="ft">Feet (ft)</option>
              <option value="inch">Inches (inch)</option>
              <option value="sq yd">Square Yards (sq yd)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floor Management */}
      <FloorManagement />

      {/* Floor Creation Tools */}
      <div className="flex flex-col gap-4 border p-4 rounded border-gray-300 mx-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-500 font-semibold">
            Floor Creation Tools
          </div>
          {currentFloor && (
            <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Floor Selected
            </div>
          )}
        </div>

        {/* Draw Floor Button */}
        <button
          onClick={handleDrawFloor}
          disabled={!currentFloorId}
          className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors text-sm ${
            !currentFloorId
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : isDrawingFloor && floorMode === "rectangle"
              ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          <Square className="h-4 w-4" />
          <span>Draw Floor</span>
        </button>

        {/* Polygon Mode Dropdown */}
        <div className="relative">
          <button
            onClick={handlePolygonMode}
            disabled={!currentFloorId}
            className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors text-sm w-full ${
              !currentFloorId
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : isDrawingFloor && floorMode === "polygon"
                ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            <Hexagon className="h-4 w-4" />
            <span>Polygon Mode</span>
          </button>
        </div>

        {/* Manual Entry Button */}
        <button
          onClick={handleManualEntry}
          disabled={!currentFloorId}
          className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors text-sm ${
            !currentFloorId
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          <Ruler className="h-4 w-4" />
          <span>Enter Floor Dimensions</span>
        </button>

        {/* Test Floor Button */}
        <button
          onClick={() => {
            if (!currentFloorId) {
              alert("Please select a floor first before creating floor shapes.");
              return;
            }
            const testFloorShape = {
              id: `shape-${Date.now()}`,
              name: "Test Floor",
              type: "floor",
              shape: "rectangle",
              x: 100,
              y: 150,
              width: 800,
              height: 600,
              areaSqM: 48,
              floorHeight: 3.2,
              slabThickness: 200,
              material: "RCC",
              source: "test",
              createdAt: new Date().toISOString()
            };
            console.log("FloorEditorSidebar: Creating test floor shape", testFloorShape);
            
            // Add shape to current floor
            if (currentFloor) {
              const updatedFloor = {
                ...currentFloor,
                shapes: [...(currentFloor.shapes || []), testFloorShape],
                updatedAt: new Date().toISOString()
              };
              dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
            }

            // Trigger properties panel opening
            if (onFloorCreated) {
              console.log(
                "FloorEditorSidebar: Calling onFloorCreated callback for test floor"
              );
              onFloorCreated(testFloorShape);
            }
          }}
          disabled={!currentFloorId}
          className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors text-sm ${
            !currentFloorId
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
          }`}
        >
          <Square className="h-4 w-4" />
          <span>Create Test Floor</span>
        </button>

        {/* Check Redux State Button */}
        <button
          onClick={() => {
            console.log(
              "FloorEditorSidebar: Current Redux state - currentFloor:",
              currentFloor
            );
            console.log(
              "FloorEditorSidebar: Should show properties panel:",
              !!currentFloor
            );
          }}
          className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded transition-colors text-sm"
        >
          <Square className="h-4 w-4" />
          <span>Check Redux State</span>
        </button>

        {/* Clear Floor Button */}
        {currentFloor && (
          <button
            onClick={handleClearFloor}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded transition-colors text-sm"
          >
            <X className="h-4 w-4" />
            <span>Clear Floor</span>
          </button>
        )}

        {/* Current Floor Info */}
        {currentFloor && currentFloor.id && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-xs font-semibold text-blue-700 mb-2">
              Current Floor
            </div>
            <div className="text-xs text-blue-600 space-y-1">
              <div>Name: {currentFloor.name}</div>
              <div>Level: {currentFloor.level}</div>
              <div>Height: {currentFloor.height}mm</div>
              <div>Shapes: {currentFloor.shapes ? currentFloor.shapes.length : 0}</div>
              {currentFloor.shapes && currentFloor.shapes.length > 0 && (
                <div>
                  Total Area: {currentFloor.shapes.reduce((total, shape) => total + (shape.areaSqM || 0), 0).toFixed(2)} m²
                </div>
              )}
            </div>
            <button
              onClick={() =>
                onOpenPropertiesPanel && onOpenPropertiesPanel(currentFloor)
              }
              className="mt-2 w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Open Properties Panel
            </button>
          </div>
        )}

        {/* Floor Properties Section */}
        {console.log(
          "FloorEditorSidebar: Rendering floor properties section",
          !!currentFloor
        )}
        {currentFloor && currentFloor.id && (
          <div className="flex flex-col gap-4 border p-4 rounded border-gray-300 mx-4 mt-4">
            <div className="text-xs text-gray-500 font-semibold mb-2">
              Floor Properties
            </div>

            {/* Floor Name */}
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Floor Name
              </div>
              <input
                type="text"
                value={currentFloor.name || "Ground Floor"}
                onChange={(e) => {
                  dispatch(updateFloor({
                    id: currentFloor.id,
                    updates: {
                      name: e.target.value,
                      updatedAt: new Date().toISOString()
                    }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter floor name"
              />
            </div>

            {/* Auto-Calculated Area */}
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Area (Auto-Calculated)
              </div>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
                {currentFloor.shapes && currentFloor.shapes.length > 0 
                  ? currentFloor.shapes.reduce((total, shape) => total + (shape.areaSqM || 0), 0).toFixed(2)
                  : '0.00'} m²
              </div>
            </div>

            {/* Floor Height */}
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Floor Height
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={currentFloor.height ? currentFloor.height / 1000 : 3.2}
                  onChange={(e) => {
                    const heightInMm = (parseFloat(e.target.value) || 3.2) * 1000;
                    dispatch(updateFloor({
                      id: currentFloor.id,
                      updates: {
                        height: heightInMm,
                        updatedAt: new Date().toISOString()
                      }
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="3.2"
                />
                <span className="text-sm text-gray-500">m</span>
              </div>
            </div>

            {/* Slab Thickness */}
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Slab Thickness
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={currentFloor.slabThickness || 200}
                  onChange={(e) => {
                    dispatch(updateFloor({
                      id: currentFloor.id,
                      updates: {
                        slabThickness: parseInt(e.target.value) || 200,
                        updatedAt: new Date().toISOString()
                      }
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="200"
                />
                <span className="text-sm text-gray-500">mm</span>
              </div>
            </div>

            {/* Material Type */}
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Material Type
              </div>
              <select
                value={currentFloor.material || "RCC"}
                onChange={(e) => {
                  dispatch(updateFloor({
                    id: currentFloor.id,
                    updates: {
                      material: e.target.value,
                      updatedAt: new Date().toISOString()
                    }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="RCC">RCC</option>
                <option value="Tile">Tile</option>
                <option value="Concrete">Concrete</option>
                <option value="Raised">Raised</option>
                <option value="Steel">Steel</option>
              </select>
            </div>

            {/* Volume Display */}
            <div>
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Volume
              </div>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
                {(() => {
                  const totalArea = currentFloor.shapes && currentFloor.shapes.length > 0 
                    ? currentFloor.shapes.reduce((total, shape) => total + (shape.areaSqM || 0), 0)
                    : 0;
                  const heightInM = currentFloor.height ? currentFloor.height / 1000 : 3.2;
                  return (totalArea * heightInM).toFixed(2);
                })()} m³
              </div>
            </div>
          </div>
        )}

        {/* Drawing Instructions */}
        {isDrawingFloor && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="text-xs font-semibold text-yellow-700 mb-2">
              Drawing Mode Active
            </div>
            <div className="text-xs text-yellow-600 space-y-1">
              {floorMode === "rectangle" && (
                <div>Click and drag to draw a rectangle</div>
              )}
              {floorMode === "polygon" && (
                <div>
                  Click to add points. Click near first point to finish.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Coordinate Display Toggle */}
      <div className="flex flex-col gap-4 border p-4 rounded border-gray-300 mx-4 mt-4">
        <div className="text-xs text-gray-500 font-semibold mb-2">
          Display Controls
        </div>
        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors text-sm ${
            showCoordinates
              ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {showCoordinates ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          <span>{showCoordinates ? "Hide" : "Show"} Coordinates</span>
        </button>
      </div>

      {/* Create Floor Modal */}
      <CreateFloorModal
        isOpen={showCreateFloorModal}
        onClose={() => setShowCreateFloorModal(false)}
        onCreateFloor={handleCreateFloor}
      />
    </div>
  );
};

export default FloorEditorSidebar;
