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
  addFloor,
  setCurrentFloorId,
} from "../../../redux/features/app/floorSlice";
import { Eye, EyeOff } from "lucide-react";
import {
  useGetDxfEntitiesMutation,
  useConvertFileMutation,
} from "../../../redux/features/api/api";
import {
  convertUnits,
  formatMeasurement,
  convertPixelsToMeters,
} from "../../../utils/unitConversion";
import { selectPixelsPerMeter } from "../../../redux/features/app/calibrationSlice";
import CreateFloorModal from "./CreateFloorModal";
import FloorManagement from "./FloorManagement";

const FloorEditorSidebar = ({
  showCoordinates,
  setShowCoordinates,
  onOpenPropertiesPanel,
  onFloorCreated,
}) => {
  const [parseDxf] = useGetDxfEntitiesMutation();
  const [convertFile] = useConvertFileMutation();
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
  const currentFloor = floors.find((f) => f.id === currentFloorId);
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const pixelsPerMeter = useSelector(selectPixelsPerMeter);

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
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isDxf = fileName.endsWith(".dxf");
    const isDwg = fileName.endsWith(".dwg");
    const isPdf = fileName.endsWith(".pdf");

    if (!isDxf && !isDwg && !isPdf) {
      alert("Please select a DXF, DWG, or PDF file.");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    const form = new FormData();
    form.append("dxf_file", file);

    try {
      let response;

      if (isDxf) {
        // Use the existing DXF parser for DXF files
        const dxfForm = new FormData();
        dxfForm.append("dxf_file", file);
        response = await parseDxf(dxfForm).unwrap();
        console.log("DXF Entities:", response);

        // Extract the actual DXF data from the response
        const dxfData = response?.dxf || response;
        console.log("Extracted DXF data:", dxfData);

        dispatch(setFloorDxf(dxfData));
        console.log("Dispatched setFloorDxf with:", dxfData);
      } else {
        // Use the new convert API for DWG and PDF files
        try {
          if (isPdf) {
            // For PDF files, we need to handle binary PNG response
            const pngResponse = await fetch("/api/convert", {
              method: "POST",
              body: form,
              headers: {
                Authorization: `Bearer ${
                  JSON.parse(localStorage.getItem("user"))?.token || ""
                }`,
              },
            });

            if (!pngResponse.ok) {
              throw new Error(`HTTP error! status: ${pngResponse.status}`);
            }

            // Get PNG as blob
            const pngBlob = await pngResponse.blob();
            console.log("PDF converted to PNG blob:", pngBlob);

            // Convert blob to base64 for storage
            const reader = new FileReader();
            reader.onload = () => {
              const base64Data = reader.result;
              console.log("PNG base64 data length:", base64Data.length);

              // Store PNG data in the DXF state
              dispatch(
                setFloorDxf({
                  entities: [],
                  source: "pdf",
                  png: base64Data,
                })
              );
            };
            reader.readAsDataURL(pngBlob);
          } else {
            // For DWG files, use the normal API call
            response = await convertFile(form).unwrap();
            console.log("DWG conversion response:", response);

            const dwgData = response?.json || response;
            console.log("DWG conversion data:", dwgData);
            dispatch(setFloorDxf(dwgData));
          }
        } catch (convertError) {
          console.error("Convert API error:", convertError);
          throw new Error(
            `File conversion failed: ${
              convertError.message || "Unknown conversion error"
            }`
          );
        }
      }

      setIsUploading(false);
      setUpdated(true);
    } catch (error) {
      console.error("Error processing file:", error);
      setIsUploading(false);
      alert(`Error processing file: ${error.message || "Unknown error"}`);
    }
  };

  const hasDxfEntities =
    floorDxf && floorDxf.entities && floorDxf.entities.length > 0;

  // Floor creation functions
  const handleDrawFloor = () => {
    // Remove the currentFloorId check - allow floor creation from the start
    // Default mode: rectangle drawing is auto-active, no need to set drawing mode
    dispatch(setFloorMode("rectangle"));
    dispatch(setIsDrawingFloor(false)); // Let it auto-activate on mouse down
  };

  const handlePolygonMode = () => {
    // Remove the currentFloorId check - allow floor creation from the start
    dispatch(setFloorMode("polygon"));
    dispatch(setIsDrawingFloor(true));
  };

  const handleManualEntry = () => {
    // Remove the currentFloorId check - allow floor creation from the start
    // This will trigger the modal in the Editor component
    dispatch(setFloorMode("manual"));
    dispatch(setIsDrawingFloor(false));
  };

  const handleCreateFloor = (floorData) => {
    console.log(
      "FloorEditorSidebar: Creating floor shape from modal",
      floorData
    );

    // Add shape to current floor
    if (currentFloor) {
      const floorShape = {
        ...floorData,
        id: `shape-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const updatedFloor = {
        ...currentFloor,
        shapes: [...(currentFloor.shapes || []), floorShape],
        updatedAt: new Date().toISOString(),
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
      dispatch(
        updateFloor({
          id: currentFloor.id,
          updates: {
            shapes: [],
            updatedAt: new Date().toISOString(),
          },
        })
      );
    }
    dispatch(setIsDrawingFloor(false));
  };

  return (
    <div className="bg-white w-[350px] h-[90vh] border-r border-gray-300 overflow-y-auto">
      <div className="mt-6 mx-4 flex flex-col gap-6">
        {/* Header Section */}
        <div className="border-b border-gray-300 pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-bold text-xl text-gray-800">Floor Editor</div>
              <div className="text-sm text-gray-500 mt-1">Create and manage floor plans</div>
            </div>
            <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <Info className="h-5 w-5" />
            </div>
          </div>
          
          {/* Status Indicator */}
          {updated ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <LaptopMinimalCheck className="text-green-500 h-4 w-4" />
              <div className="text-sm font-medium text-green-700">
                Floor Plan Updated
              </div>
            </div>
          ) : currentFloorId ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <LaptopMinimal className="text-amber-500 h-4 w-4" />
              <div className="text-sm font-medium text-amber-700">
                Floor Selected - Ready for Editing
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <Plus className="text-blue-500 h-4 w-4" />
              <div className="text-sm font-medium text-blue-700">
                No Floor Selected - Use Creation Tools
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CloudUpload className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-semibold text-gray-700">
              Upload Floor Plan
            </div>
          </div>
          <div className="text-xs text-gray-600 mb-3">
            Support for DXF, DWG, and PDF files
          </div>
          
          <div className="relative">
            <div
              className={`flex gap-2 justify-center items-center p-4 text-gray-500 font-medium rounded-lg border-2 border-dashed transition-all duration-200 ${
                !selectedFile && !isUploading
                  ? "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-blue-600">Processing...</span>
                </>
              ) : selectedFile ? (
                <>
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4" />
                  <span>Click to upload file</span>
                </>
              )}
            </div>

            {/* File input positioned over the upload area but only when not uploading and no file selected */}
            {!isUploading && !selectedFile && (
              <input
                type="file"
                accept=".dxf,.dwg,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: 10 }}
              />
            )}
          </div>

          {hasDxfEntities && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <FileText className="h-3 w-3" />
              <span className="font-medium">
                {floorDxf.source === "pdf"
                  ? "PDF converted to PNG successfully"
                  : `${floorDxf.entities.length} entities loaded`}
              </span>
            </div>
          )}
        </div>

        {/* Unit Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="h-4 w-4 text-gray-600" />
            <div className="text-sm font-semibold text-gray-700">
              Display Units
            </div>
          </div>
          <select
            className="w-full bg-gray-50 border border-gray-300 text-sm text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Floor Management */}
      <FloorManagement />

      {/* Floor Creation Tools */}
      <div className="mx-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Square className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-semibold text-gray-700">
              Floor Creation Tools
            </div>
            {currentFloor && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Floor Selected
              </div>
            )}
          </div>

          {/* Auto-Active Floor Drawing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Square className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Floor Creation Tools Active
              </span>
            </div>
            <p className="text-xs text-blue-700">
              All floor creation tools are now active from the start. You can create floors even when none exist.
            </p>
          </div>

          {/* Tool Buttons */}
          <div className="space-y-3">
            {/* Polygon Mode */}
            <button
              onClick={handlePolygonMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm w-full ${
                isDrawingFloor && floorMode === "polygon"
                  ? "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:shadow-sm"
              }`}
            >
              <Hexagon className="h-4 w-4" />
              <span>Polygon Mode</span>
            </button>
            
            {/* Polygon Mode Instructions */}
            {isDrawingFloor && floorMode === "polygon" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700">
                <div className="font-medium mb-1">Polygon Drawing Instructions:</div>
                <ul className="space-y-1">
                  <li>• Click anywhere on the canvas to add points</li>
                  <li>• Live preview lines will show as you move the mouse</li>
                  <li>• Double-click when you have 3+ points to finish</li>
                  <li>• Last point will merge with closest existing point if nearby</li>
                  <li>• Use the Cancel button to start over</li>
                </ul>
              </div>
            )}

            {/* Manual Entry */}
            <button
              onClick={handleManualEntry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:shadow-sm"
            >
              <Ruler className="h-4 w-4" />
              <span>Enter Floor Dimensions</span>
            </button>

            {/* Test Floor */}
            <button
              onClick={() => {
                const testFloorShape = {
                  id: `shape-${Date.now()}`,
                  name: "Test Floor",
                  type: "floor",
                  shape: "rectangle",
                  x: 100,
                  y: 150,
                  width: 800,
                  height: 600,
                  widthInMeters: 8.0,
                  heightInMeters: 6.0,
                  areaSqM: 48,
                  floorHeight: 3200,
                  slabThickness: 200,
                  material: "RCC",
                  source: "test",
                  createdAt: new Date().toISOString(),
                };
                console.log("FloorEditorSidebar: Creating test floor shape", testFloorShape);

                // Add shape to current floor if it exists, otherwise create a new floor
                if (currentFloor) {
                  const updatedFloor = {
                    ...currentFloor,
                    shapes: [...(currentFloor.shapes || []), testFloorShape],
                    updatedAt: new Date().toISOString(),
                  };
                  dispatch(
                    updateFloor({ id: currentFloor.id, updates: updatedFloor })
                  );
                } else {
                  // Create a new floor if none exists
                  const newFloor = {
                    id: `floor-${Date.now()}`,
                    name: "Ground Floor",
                    level: 0,
                    height: 3200,
                    shapes: [testFloorShape],
                    canvasSettings: {
                      scale: 1,
                      position: { x: 0, y: 0 },
                      grid: true
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  dispatch(addFloor(newFloor));
                  dispatch(setCurrentFloorId(newFloor.id));
                }

                // Trigger properties panel opening
                if (onFloorCreated) {
                  console.log("FloorEditorSidebar: Calling onFloorCreated callback for test floor");
                  onFloorCreated(testFloorShape);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 hover:shadow-sm"
            >
              <Square className="h-4 w-4" />
              <span>Create Test Floor</span>
            </button>

            {/* Clear Floor */}
            {currentFloor && (
              <button
                onClick={handleClearFloor}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-all duration-200 text-sm w-full hover:shadow-sm"
              >
                <X className="h-4 w-4" />
                <span>Clear Floor Shapes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current Floor Info */}
      {currentFloor && currentFloor.id && (
        <div className="mx-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="text-sm font-semibold text-blue-800">
                Current Floor: {currentFloor.name}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded p-2 border border-blue-100">
                <div className="text-blue-600 font-medium">Level</div>
                <div className="text-gray-800">{currentFloor.level || 0}</div>
              </div>
              <div className="bg-white rounded p-2 border border-blue-100">
                <div className="text-blue-600 font-medium">Height</div>
                <div className="text-gray-800">{(currentFloor.height || 3200) / 1000}m</div>
              </div>
              <div className="bg-white rounded p-2 border border-blue-100">
                <div className="text-blue-600 font-medium">Shapes</div>
                <div className="text-gray-800">{currentFloor.shapes ? currentFloor.shapes.length : 0}</div>
              </div>
              <div className="bg-white rounded p-2 border border-blue-100">
                <div className="text-blue-600 font-medium">Total Area</div>
                <div className="text-gray-800">
                  {currentFloor.shapes && currentFloor.shapes.length > 0
                    ? currentFloor.shapes
                        .reduce((total, shape) => total + (shape.areaSqM || 0), 0)
                        .toFixed(2)
                    : "0.00"} m²
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                onOpenPropertiesPanel && onOpenPropertiesPanel(currentFloor)
              }
              className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open Properties Panel
            </button>
          </div>
        </div>
      )}

      {/* Floor Properties Section */}
      {currentFloor && currentFloor.id && currentFloor.shapes && currentFloor.shapes.length > 0 && (
        <div className="mx-4 mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-4 w-4 text-gray-600" />
              <div className="text-sm font-semibold text-gray-700">
                Floor Shape Properties
              </div>
            </div>

            {/* Floor Name */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 font-medium mb-2">
                Floor Name
              </div>
              <input
                type="text"
                value={currentFloor.name || ""}
                onChange={(e) => {
                  dispatch(
                    updateFloor({
                      id: currentFloor.id,
                      updates: {
                        name: e.target.value,
                        updatedAt: new Date().toISOString(),
                      },
                    })
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                placeholder="Enter floor name"
              />
            </div>

            {/* Floor Dimensions - Fixed calculations */}
            {currentFloor.shapes && currentFloor.shapes.length > 0 && (
              <div className="space-y-4 mb-4">
                {/* Floor Width - Use the first shape's width */}
                <div>
                  <div className="text-xs text-gray-600 font-medium mb-2">
                    Floor Width
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={
                        currentFloor.shapes[0]?.widthInMeters || 
                        (currentFloor.shapes[0]?.width ? (currentFloor.shapes[0].width / pixelsPerMeter).toFixed(2) : "0.00")
                      }
                      onChange={(e) => {
                        const widthInMeters = parseFloat(e.target.value) || 0;
                        const widthInPixels = widthInMeters * pixelsPerMeter; // Convert to pixels using calibrated scale
                        
                        // Update the first shape's dimensions
                        const updatedShapes = currentFloor.shapes.map((shape, index) => 
                          index === 0 ? {
                            ...shape,
                            width: widthInPixels,
                            widthInMeters: widthInMeters,
                            areaSqM: widthInMeters * (shape.heightInMeters || shape.height / pixelsPerMeter)
                          } : shape
                        );
                        
                        dispatch(
                          updateFloor({
                            id: currentFloor.id,
                            updates: {
                              shapes: updatedShapes,
                              updatedAt: new Date().toISOString(),
                            },
                          })
                        );
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      placeholder="0.00"
                    />
                    <span className="text-sm text-gray-500 font-medium">m</span>
                  </div>
                </div>

                {/* Floor Length - Use the first shape's height */}
                <div>
                  <div className="text-xs text-gray-600 font-medium mb-2">
                    Floor Length
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={
                        currentFloor.shapes[0]?.heightInMeters || 
                        (currentFloor.shapes[0]?.height ? (currentFloor.shapes[0].height / pixelsPerMeter).toFixed(2) : "0.00")
                      }
                      onChange={(e) => {
                        const heightInMeters = parseFloat(e.target.value) || 0;
                        const heightInPixels = heightInMeters * pixelsPerMeter; // Convert to pixels using calibrated scale
                        
                        // Update the first shape's dimensions
                        const updatedShapes = currentFloor.shapes.map((shape, index) => 
                          index === 0 ? {
                            ...shape,
                            height: heightInPixels,
                            heightInMeters: heightInMeters,
                            areaSqM: (shape.widthInMeters || shape.width / pixelsPerMeter) * heightInMeters
                          } : shape
                        );
                        
                        dispatch(
                          updateFloor({
                            id: currentFloor.id,
                            updates: {
                              shapes: updatedShapes,
                              updatedAt: new Date().toISOString(),
                            },
                          })
                        );
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                      placeholder="0.00"
                    />
                    <span className="text-sm text-gray-500 font-medium">m</span>
                  </div>
                </div>

                {/* Auto-Calculated Area - Fixed calculation */}
                <div>
                  <div className="text-xs text-gray-600 font-medium mb-2">
                    Area (Auto-Calculated)
                  </div>
                  <div className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 font-medium">
                    {(() => {
                      if (!currentFloor.shapes || currentFloor.shapes.length === 0) return "0.00 m²";
                      
                      const totalArea = currentFloor.shapes.reduce((total, shape) => {
                        if (shape.shape === 'rectangle') {
                          const widthInM = shape.widthInMeters || (shape.width / pixelsPerMeter);
                          const heightInM = shape.heightInMeters || (shape.height / pixelsPerMeter);
                          return total + (widthInM * heightInM);
                        } else if (shape.shape === 'polygon') {
                          return total + (shape.areaSqM || 0);
                        }
                        return total;
                      }, 0);
                      
                      return `${totalArea.toFixed(2)} m²`;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Floor Properties Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Floor Height */}
              <div>
                <div className="text-xs text-gray-600 font-medium mb-2">
                  Floor Height
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={currentFloor.height ? (currentFloor.height / 1000).toFixed(1) : "3.2"}
                    onChange={(e) => {
                      const heightInMm = (parseFloat(e.target.value) || 3.2) * 1000;
                      dispatch(
                        updateFloor({
                          id: currentFloor.id,
                          updates: {
                            height: heightInMm,
                            updatedAt: new Date().toISOString(),
                          },
                        })
                      );
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                    placeholder="3.2"
                  />
                  <span className="text-sm text-gray-500 font-medium">m</span>
                </div>
              </div>

              {/* Slab Thickness */}
              <div>
                <div className="text-xs text-gray-600 font-medium mb-2">
                  Slab Thickness
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentFloor.slabThickness || 200}
                    onChange={(e) => {
                      dispatch(
                        updateFloor({
                          id: currentFloor.id,
                          updates: {
                            slabThickness: parseInt(e.target.value) || 200,
                            updatedAt: new Date().toISOString(),
                          },
                        })
                      );
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                    placeholder="200"
                  />
                  <span className="text-sm text-gray-500 font-medium">mm</span>
                </div>
              </div>
            </div>

            {/* Material Type */}
            <div className="mt-4">
              <div className="text-xs text-gray-600 font-medium mb-2">
                Material Type
              </div>
              <select
                value={currentFloor.material || "RCC"}
                onChange={(e) => {
                  dispatch(
                    updateFloor({
                      id: currentFloor.id,
                      updates: {
                        material: e.target.value,
                        updatedAt: new Date().toISOString(),
                      },
                    })
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              >
                <option value="RCC">RCC</option>
                <option value="Tile">Tile</option>
                <option value="Concrete">Concrete</option>
                <option value="Raised">Raised</option>
                <option value="Steel">Steel</option>
              </select>
            </div>

            {/* Volume Display - Fixed calculation */}
            <div className="mt-4">
              <div className="text-xs text-gray-600 font-medium mb-2">
                Volume
              </div>
              <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 font-medium">
                {(() => {
                  if (!currentFloor.shapes || currentFloor.shapes.length === 0) return "0.00 m³";
                  
                  const totalArea = currentFloor.shapes.reduce((total, shape) => {
                    if (shape.shape === 'rectangle') {
                      const widthInM = shape.widthInMeters || (shape.width / pixelsPerMeter);
                      const heightInM = shape.heightInMeters || (shape.height / pixelsPerMeter);
                      return total + (widthInM * heightInM);
                    } else if (shape.shape === 'polygon') {
                      return total + (shape.areaSqM || 0);
                    }
                    return total;
                  }, 0);
                  
                  const heightInM = currentFloor.height ? currentFloor.height / 1000 : 3.2;
                  return `${(totalArea * heightInM).toFixed(2)} m³`;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Instructions */}
      {isDrawingFloor && (
        <div className="mx-4 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="text-sm font-semibold text-yellow-700">
                Drawing Mode Active
              </div>
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
        </div>
      )}

      {/* Coordinate Display Toggle */}
      <div className="mx-4 mt-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-gray-600" />
            <div className="text-sm font-semibold text-gray-700">
              Display Controls
            </div>
          </div>
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm w-full ${
              showCoordinates
                ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:shadow-sm"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:shadow-sm"
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
      </div>

      {/* Create Floor Modal */}
              <CreateFloorModal
          isOpen={showCreateFloorModal}
          onClose={() => setShowCreateFloorModal(false)}
          onCreateFloor={handleCreateFloor}
          pixelsPerMeter={pixelsPerMeter}
        />
    </div>
  );
};

export default FloorEditorSidebar;
