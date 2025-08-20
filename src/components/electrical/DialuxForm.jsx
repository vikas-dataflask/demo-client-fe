import React, { useState } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import FloorPreview from "../shared/FloorPreview";
import { useSelector, useDispatch } from "react-redux";
import { setDialuxResult } from "../../redux/features/app/dialuxSlice";
import FrontendIESParser from "../../utils/iesParser.js";
import AutoFixtureArrangement from "./AutoFixtureArrangement";
import { convertAIDimensionsToMeters } from "../../utils/aiRoomExtractor";

const GRID_SIZE = 100; // 100px = 1m for proper unit conversion

const convertPixelsToMeters = (pixels) => {
  return pixels / GRID_SIZE;
};

// IES Data Display Component
const IESDataDisplay = ({ iesData }) => {
  if (!iesData) return null;

  const formatValue = (value, unit = "") => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      return value.toFixed(1) + unit;
    }
    return value + unit;
  };

  const getPhotometricTypeLabel = (type) => {
    const types = {
      1: "Type C - 0° to 180°",
      2: "Type B - 0° to 90°",
      3: "Type A - 0° to 360°",
    };
    return types[type] || `Type ${type}`;
  };

  return (
    <div className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-semibold text-blue-800">
          📊 Photometric Data
        </h3>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Basic Information */}
        <div className="col-span-2 bg-white p-2 rounded border border-blue-100">
          <h4 className="text-[10px] font-medium text-gray-700 mb-2">
            Fixture Information
          </h4>
          <div className="space-y-1">
            {iesData.manufacturer && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium text-gray-800">
                  {iesData.manufacturer}
                </span>
              </div>
            )}
            {iesData.catalogNumber && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-800">
                  {iesData.catalogNumber}
                </span>
              </div>
            )}
            {iesData.lampType && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Lamp Type:</span>
                <span className="font-medium text-gray-800">
                  {iesData.lampType}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Key Photometric Parameters */}
        <div className="bg-white p-2 rounded border border-blue-100">
          <h4 className="text-[10px] font-medium text-gray-700 mb-2">
            Light Output
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Lumens:</span>
              <span className="font-semibold text-blue-600">
                {formatValue(iesData.lumens, " lm")}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Wattage:</span>
              <span className="font-semibold text-orange-600">
                {formatValue(iesData.wattage, " W")}
              </span>
            </div>
            {iesData.maxCandela && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Max Candela:</span>
                <span className="font-semibold text-purple-600">
                  {formatValue(iesData.maxCandela, " cd")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-2 rounded border border-blue-100">
          <h4 className="text-[10px] font-medium text-gray-700 mb-2">
            Beam Angles
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Horizontal:</span>
              <span className="font-semibold text-green-600">
                {formatValue(iesData.beamAngleH, "°")}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Vertical:</span>
              <span className="font-semibold text-green-600">
                {formatValue(iesData.beamAngleV, "°")}
              </span>
            </div>
            {iesData.photometricType && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-800 text-[9px]">
                  {getPhotometricTypeLabel(iesData.photometricType)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Data */}
        {(iesData.luminaireDimensions?.width ||
          iesData.luminaireDimensions?.length ||
          iesData.luminaireDimensions?.height) && (
          <div className="col-span-2 bg-white p-2 rounded border border-blue-100">
            <h4 className="text-[10px] font-medium text-gray-700 mb-2">
              Dimensions
            </h4>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              {iesData.luminaireDimensions.width && (
                <div className="text-center">
                  <div className="text-gray-600">Width</div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(iesData.luminaireDimensions.width, " mm")}
                  </div>
                </div>
              )}
              {iesData.luminaireDimensions.length && (
                <div className="text-center">
                  <div className="text-gray-600">Length</div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(iesData.luminaireDimensions.length, " mm")}
                  </div>
                </div>
              )}
              {iesData.luminaireDimensions.height && (
                <div className="text-center">
                  <div className="text-gray-600">Height</div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(iesData.luminaireDimensions.height, " mm")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candela Distribution Info */}
        {iesData.candelaValues && iesData.candelaValues.length > 0 && (
          <div className="col-span-2 bg-white p-2 rounded border border-blue-100">
            <h4 className="text-[10px] font-medium text-gray-700 mb-2">
              Candela Distribution
            </h4>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Data Points:</span>
              <span className="font-semibold text-blue-600">
                {iesData.candelaValues.length}
              </span>
            </div>
            <div className="mt-1 text-[9px] text-gray-500">
              Full 3D photometric data available for calculations
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DialuxForm = () => {
  const [roomType, setRoomType] = useState("");
  const [iesFile, setIesFile] = useState(null);
  const [lumens, setLumens] = useState("");
  const [illumination, setIllumination] = useState(4);
  const [uf, setUf] = useState(0.6);
  const [mf, setMf] = useState(0.8);
  const [mountingHeight, setMountingHeight] = useState(1000);
  const [drawingMode, setDrawingMode] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [gridRows, setGridRows] = useState(1);
  const [gridCols, setGridCols] = useState(1);
  const [iesData, setIesData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [showAutoArrangement, setShowAutoArrangement] = useState(false);

  // Use the current project's room selection logic
  const rooms = useSelector((state) => state.newRooms?.rooms || []);
  
  // Get AI rooms from Redux state
  const aiRooms = useSelector((state) => state.aiRoomData?.rooms || []);

  // Remove duplicates based on room ID to prevent double rendering
  const uniqueRooms = rooms.filter(
    (room, index, self) =>
      index === self.findIndex((r) => (r.id || r._id) === (room.id || room._id))
  );

  // Combine existing rooms with AI rooms
  const allRooms = [
    ...uniqueRooms,
    ...aiRooms.map(room => ({
      ...room,
      // Convert AI room dimensions to meters for consistency
      ...convertAIDimensionsToMeters(room)
    }))
  ];

  const selectedRoom = allRooms.find((room) => room.id === roomType);

  // Calculate area in square meters from room dimensions
  const roomArea = selectedRoom
    ? selectedRoom.source === 'ai'
      ? selectedRoom.areaInSquareMeters || 0
      : convertPixelsToMeters(selectedRoom.width) *
        convertPixelsToMeters(selectedRoom.height)
    : "";

  // Convert room height to meters if available
  const roomHeight = selectedRoom
    ? selectedRoom.source === 'ai'
      ? selectedRoom.heightInMeters || 0
      : convertPixelsToMeters(selectedRoom.height)
    : "";

  const dispatch = useDispatch();

  const parseIesFile = async (file) => {
    setIsParsing(true);
    setParseError("");
    setIesData(null);

    console.log("Starting IES file parsing for:", file.name);
    console.log("File size:", file.size, "bytes");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      console.log(
        "File content preview (first 500 chars):",
        fileContent.substring(0, 500)
      );

      setDebugInfo({
        fileName: file.name,
        fileSize: file.size,
        contentPreview: fileContent.substring(0, 200),
        firstLine: fileContent.split("\n")[0],
        lineCount: fileContent.split("\n").length,
      });

      try {
        const parser = new FrontendIESParser();
        console.log("Attempting to parse with backend...");
        const result = await parser.parseWithBackend(file);

        console.log("Parser result:", result);

        if (result && result.data && result.data.isValid) {
          console.log("Valid IES data received:", result.data);
          setIesData(result.data);
          setLumens(result.data.lumens || "");

          console.log("IES File Parsed Successfully:", {
            manufacturer: result.data.manufacturer,
            catalogNumber: result.data.catalogNumber,
            lumens: result.data.lumens,
            wattage: result.data.wattage,
            beamAngleH: result.data.beamAngleH,
            beamAngleV: result.data.beamAngleV,
            maxCandela: result.data.maxCandela,
            photometricType: result.data.photometricType,
            candelaValuesCount: result.data.candelaValues?.length || 0,
          });
        } else if (
          result &&
          result.isLocalFallback &&
          result.data &&
          result.data.isValid
        ) {
          console.log("Using local fallback data:", result.data);
          setIesData(result.data);
          setLumens(result.data.lumens || "");
        } else {
          console.warn("Invalid IES data received:", result);
          setParseError("Invalid IES file format or missing required data");
          if (result && result.data && result.data.errors) {
            console.warn("IES parsing errors:", result.data.errors);
          }
        }
      } catch (error) {
        console.error("IES parsing error:", error);
        setParseError("Failed to parse IES file: " + error.message);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      console.error("Failed to read file");
      setParseError("Failed to read uploaded file");
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  const handleReload = () => {
    console.log("Reload clicked");
  };

  const handleCalculate = () => {
    if (!roomType || !lumens || !illumination || !uf || !mf) {
      alert("Please fill in all required fields");
      return;
    }

    const area = parseFloat(roomArea);
    const lumenValue = parseFloat(lumens);
    const illuminationValue = parseFloat(illumination);
    const ufValue = parseFloat(uf);
    const mfValue = parseFloat(mf);

    if (
      isNaN(area) ||
      isNaN(lumenValue) ||
      isNaN(illuminationValue) ||
      isNaN(ufValue) ||
      isNaN(mfValue)
    ) {
      alert("Please enter valid numeric values");
      return;
    }

    const totalLumens = area * illuminationValue;
    const totalLuminaires = Math.ceil(
      totalLumens / (lumenValue * ufValue * mfValue)
    );

    setCalculationResult({
      totalLumens,
      totalLuminaires,
      area,
      lumenValue,
      illuminationValue,
      ufValue,
      mfValue,
    });
    setShowResult(true);
    setShowAutoArrangement(true);
  };

  const handleArrangementComplete = (fixtures) => {
    console.log("Auto arrangement completed:", fixtures);
  };

  return (
    <div className="flex h-[85vh]">
      <div className=" bg-white p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Lighting Design
          </h2>
          <p className="text-sm text-gray-600">
            Calculate lighting requirements and arrange fixtures
          </p>
        </div>

        <div className="space-y-6">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a room</option>
              {allRooms.map((room) => {
                let displayText = '';
                let areaDisplay = '';
                
                if (room.source === 'ai') {
                  // AI room - use extracted dimensions
                  displayText = room.name;
                  if (room.category && room.category !== room.name) {
                    displayText = `${room.category} - ${room.name}`;
                  }
                  areaDisplay = room.areaInSquareMeters ? ` (${room.areaInSquareMeters.toFixed(2)} m²)` : '';
                } else {
                  // Existing room - calculate from pixels
                  const widthInMeters = convertPixelsToMeters(room.width);
                  const heightInMeters = convertPixelsToMeters(room.height);
                  const areaInMeters = widthInMeters * heightInMeters;
                  displayText = room.name || `Room ${room.id}`;
                  areaDisplay = ` (${areaInMeters.toFixed(2)} m²)`;
                }

                return (
                  <option key={room.id} value={room.id}>
                    {displayText}{areaDisplay}
                    {room.source === 'ai' && ' [AI]'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Room Information Display */}
          {selectedRoom && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Room Information
                {selectedRoom.source === 'ai' && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    AI Generated
                  </span>
                )}
                {selectedRoom.source === 'ai' && selectedRoom.category && selectedRoom.category !== selectedRoom.name && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {selectedRoom.category}
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedRoom.source === 'ai' ? (
                  // AI Room Display
                  <>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <div className="font-medium">
                        {selectedRoom.widthInMeters > 0 && selectedRoom.heightInMeters > 0
                          ? `${selectedRoom.widthInMeters.toFixed(2)} × ${selectedRoom.heightInMeters.toFixed(2)} m`
                          : selectedRoom.specialDimensions || 'Special dimensions'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Original Data:</span>
                      <div className="font-medium text-xs text-gray-600">
                        {selectedRoom.dimensions}
                      </div>
                    </div>
                  </>
                ) : (
                  // Existing Room Display
                  <>
                    <div>
                      <span className="text-gray-600">Dimensions (pixels):</span>
                      <div className="font-medium">
                        {selectedRoom.width} × {selectedRoom.height} px
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Dimensions (meters):</span>
                      <div className="font-medium">
                        {convertPixelsToMeters(selectedRoom.width).toFixed(2)} ×{" "}
                        {convertPixelsToMeters(selectedRoom.height).toFixed(2)} m
                      </div>
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <span className="text-gray-600">Area:</span>
                  <div className="font-medium text-blue-600">
                    {roomArea.toFixed(2)} m²
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IES File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IES Photometric File
            </label>
            <input
              type="file"
              accept=".ies"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setIesFile(file);
                  parseIesFile(file);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isParsing && (
              <p className="text-sm text-blue-600 mt-1">Parsing IES file...</p>
            )}
            {parseError && (
              <p className="text-sm text-red-600 mt-1">{parseError}</p>
            )}
          </div>

          {/* IES Data Display */}
          {iesData && <IESDataDisplay iesData={iesData} />}

          {/* Lumen Method Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lumens per Fixture
              </label>
              <input
                type="number"
                value={lumens}
                onChange={(e) => setLumens(e.target.value)}
                placeholder="Enter lumens"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Illumination (lux)
              </label>
              <input
                type="number"
                value={illumination}
                onChange={(e) => setIllumination(e.target.value)}
                placeholder="Enter illumination"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilization Factor (UF)
              </label>
              <input
                type="number"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                step="0.01"
                min="0"
                max="1"
                placeholder="Enter UF"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Factor (MF)
              </label>
              <input
                type="number"
                value={mf}
                onChange={(e) => setMf(e.target.value)}
                step="0.01"
                min="0"
                max="1"
                placeholder="Enter MF"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mounting Height (mm)
              </label>
              <input
                type="number"
                value={mountingHeight}
                onChange={(e) => setMountingHeight(e.target.value)}
                placeholder="Enter mounting height"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={!roomType || !lumens || !illumination || !uf || !mf}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              roomType && lumens && illumination && uf && mf
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Calculate Lighting Requirements
          </button>

          {/* Calculation Result */}
          {showResult && calculationResult && (
            <div className="border border-green-400 bg-green-50 text-green-800 rounded-md p-3 text-[13px] mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <p className="font-medium">Calculation Complete</p>
              </div>
              <div className="mt-2 space-y-1">
                <p>
                  Room Area:{" "}
                  <span className="font-bold">
                    {calculationResult.area.toFixed(2)} m²
                  </span>
                </p>
                <p>
                  Required Illumination:{" "}
                  <span className="font-bold">
                    {calculationResult.illuminationValue} lux
                  </span>
                </p>
                <p>
                  Total Lumens Required:{" "}
                  <span className="font-bold">
                    {calculationResult.totalLumens.toFixed(0)} lm
                  </span>
                </p>
                <p>
                  Number of Fixtures:{" "}
                  <span className="font-bold text-green-700">
                    {calculationResult.totalLuminaires}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Auto Fixture Arrangement */}
          {showAutoArrangement && calculationResult && selectedRoom && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-medium text-blue-800 mb-3">
                Automatic Fixture Arrangement
              </h3>
              <AutoFixtureArrangement
                roomId={selectedRoom.id}
                fixtureCount={calculationResult.totalLuminaires}
                onArrangementComplete={handleArrangementComplete}
              />
            </div>
          )}

          {/* Manual Drawing Options */}
          {showResult && calculationResult && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Manual Fixture Placement
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Or manually place {calculationResult.totalLuminaires} fixtures
                using drawing tools:
              </p>

              <div className="space-y-2 text-[13px]">
                <button className="w-full text-left px-3 py-2 flex items-center gap-2 border border-none text-black rounded-md font-medium">
                  <div className="w-[24px] h-[24px] bg-[#0083EE] rounded-md flex items-center justify-center">
                    <ReactangleIcon className="w-[14px] h-[14px]" />
                  </div>
                  Draw rectangular arrangement
                </button>

                {["line", "grid"].map((mode) => (
                  <button
                    key={mode}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setDrawingMode(mode)}
                  >
                    {mode === "line"
                      ? "── Draw line arrangement"
                      : "⊞ Draw grid arrangement"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-100">
        <FloorPreview
          drawingMode={drawingMode}
          exitDrawingMode={() => setDrawingMode(null)}
          roomId={roomType}
          numberOfLights={calculationResult?.totalLuminaires || 0}
        />
      </div>
    </div>
  );
};

export default DialuxForm;
