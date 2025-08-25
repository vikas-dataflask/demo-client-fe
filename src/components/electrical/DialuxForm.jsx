import React, { useState, useEffect } from "react";
import { ReloadIcon } from "../../icons/ReloadIcon";
import ReactangleIcon from "../../icons/ReactangleIcon";
import FloorPreview from "../shared/FloorPreview";
import { useSelector, useDispatch } from "react-redux";
import { setDialuxResult } from "../../redux/features/app/dialuxSlice";
import { selectPixelsPerMeter } from "../../redux/features/app/calibrationSlice";
import FrontendIESParser from "../../utils/iesParser.js";
import AutoFixtureArrangement from "./AutoFixtureArrangement";
import { convertAIDimensionsToMeters } from "../../utils/aiRoomExtractor";
// Remove hardcoded GRID_SIZE constant - will use calibrated pixelsPerMeter from Redux

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

        {/* Beam and Field Angles */}
        <div className="bg-white p-2 rounded border border-blue-100">
          <h4 className="text-[10px] font-medium text-gray-700 mb-2">
            Beam Characteristics
          </h4>
          <div className="space-y-1">
            {iesData.beamAngle && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Beam Angle:</span>
                <span className="font-semibold text-green-600">
                  {formatValue(iesData.beamAngle, "°")}
                </span>
              </div>
            )}
            {iesData.fieldAngle && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Field Angle:</span>
                <span className="font-semibold text-green-600">
                  {formatValue(iesData.fieldAngle, "°")}
                </span>
              </div>
            )}
            {iesData.photometricType && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-800">
                  {getPhotometricTypeLabel(iesData.photometricType)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Parameters */}
        <div className="bg-white p-2 rounded border border-blue-100">
          <h4 className="text-[10px] font-medium text-gray-700 mb-2">
            Additional Data
          </h4>
          <div className="space-y-1">
            {iesData.lampLumens && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Lamp Lumens:</span>
                <span className="font-medium text-gray-800">
                  {formatValue(iesData.lampLumens, " lm")}
                </span>
              </div>
            )}
            {iesData.lampCount && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Lamp Count:</span>
                <span className="font-medium text-gray-800">
                  {iesData.lampCount}
                </span>
              </div>
            )}
            {iesData.ballastFactor && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600">Ballast Factor:</span>
                <span className="font-medium text-gray-800">
                  {formatValue(iesData.ballastFactor)}
                </span>
              </div>
            )}
          </div>
        </div>
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
  const [area, setArea] = useState(0);
  const [lightFixture, setLightFixture] = useState(0);
  const [reflectanceFactor, setReflectanceFactor] = useState(0.5);
  const [wallZone, setWallZone] = useState("A");
  const [workPlane, setWorkPlane] = useState(0.85);
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
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [prefillError, setPrefillError] = useState("");
  const [prefillSuccess, setPrefillSuccess] = useState(false);
  const [prefillData, setPrefillData] = useState(null); // Store prefill data locally
  const [selectedRoom, setSelectedRoom] = useState(""); // Track selected room for prefill

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
    ...aiRooms.map((room) => ({
      ...room,
      // Convert AI room dimensions to meters for consistency
      ...convertAIDimensionsToMeters(room),
    })),
  ];

  // Find the selected room object based on selectedRoom state (now using room names)
  const selectedRoomObj = allRooms.find(
    (room) => (room.name || room.id) === selectedRoom
  );

  const dispatch = useDispatch();
  const pixelsPerMeter = useSelector(selectPixelsPerMeter); // Get calibrated scale from Redux

  const convertPixelsToMeters = (pixels) => {
    return pixels / pixelsPerMeter;
  };

  // Calculate area in square meters from room dimensions
  // <<<<<<< SjCONNECTION
  const roomArea = selectedRoomObj
    ? selectedRoomObj.source === "ai"
      ? selectedRoomObj.areaInSquareMeters || 0
      : convertPixelsToMeters(selectedRoomObj.width) *
        convertPixelsToMeters(selectedRoomObj.height)
    : "";

  // Convert room height to meters if available
  const roomHeight = selectedRoomObj
    ? selectedRoomObj.source === "ai"
      ? selectedRoomObj.heightInMeters || 0
      : convertPixelsToMeters(selectedRoomObj.height)
    : "";

  // const dispatch = useDispatch();

  // Prefill form with data from Admin backend - REMOVED AUTO-PREFILL
  // Now user must manually click button and select room first

  // Function to fetch prefill data (without auto-prefilling)
  const fetchPrefillData = async () => {
    try {
      // Get project data from localStorage
      const projectData = localStorage.getItem("projectData");
      if (!projectData) {
        setPrefillError(
          "No project data found in localStorage. Please set project data first."
        );
        return;
      }

      const { locationId, buildingCategoryId, buildingTypeId } =
        JSON.parse(projectData);

      if (!locationId || !buildingCategoryId || !buildingTypeId) {
        setPrefillError("Missing required project IDs for prefill");
        return;
      }

      console.log("🔍 Fetching prefill data for Dialux form with IDs:", {
        locationId,
        buildingCategoryId,
        buildingTypeId,
      });

      setIsPrefilling(true);
      setPrefillError("");
      setPrefillSuccess(false);

      // Call the client backend prefill endpoint
      const response = await fetch(
        `http://localhost:8000/api/prefill/prefill-designform?locationId=${locationId}&buildingCategoryId=${buildingCategoryId}&buildingTypeId=${buildingTypeId}`
      );

      if (!response.ok) {
        throw new Error(
          `Prefill request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log(
          "✅ Prefill data received and stored locally:",
          result.data
        );

        // Store the data locally (don't prefill form yet)
        setPrefillData(result.data);
        setPrefillSuccess(true);
        setPrefillError("");
      } else {
        setPrefillError(
          "No prefill data available for the specified parameters"
        );
      }
    } catch (error) {
      console.error("❌ Error during prefill:", error);
      setPrefillError(`Failed to fetch prefill data: ${error.message}`);
    } finally {
      setIsPrefilling(false);
    }
  };

  // Function to prefill form based on selected room
  const prefillFormForRoom = (selectedRoom) => {
    if (!prefillData || !selectedRoom) {
      console.log("❌ No prefill data or room selected");
      return;
    }

    console.log(`🔍 Prefilling form for room: ${selectedRoom}`);
    console.log(
      "🔍 Available factorRoomData keys:",
      Object.keys(prefillData.factorRoomData || {})
    );

    // Get room-specific data from factorRoomData
    const roomData = prefillData.factorRoomData;

    if (roomData) {
      // Prefill illumination level
      if (roomData.lux_level && roomData.lux_level[selectedRoom]) {
        const luxValue = parseFloat(roomData.lux_level[selectedRoom]);
        setIllumination(luxValue || 4);
        console.log(
          `✅ Prefilled illumination level for ${selectedRoom}:`,
          luxValue
        );
      } else {
        console.log(`❌ No lux_level data found for room: ${selectedRoom}`);
        console.log(
          "🔍 Available rooms in lux_level:",
          Object.keys(roomData.lux_level || {})
        );
      }

      // Prefill uniformity factor
      if (roomData.uniformity && roomData.uniformity[selectedRoom]) {
        const uniformityValue =
          parseFloat(roomData.uniformity[selectedRoom]) / 100; // Convert percentage to decimal
        setUf(uniformityValue || 0.6);
        console.log(
          `✅ Prefilled uniformity factor for ${selectedRoom}:`,
          uniformityValue
        );
      }

      // Prefill maintenance factor
      if (
        roomData.maintenance_factor &&
        roomData.maintenance_factor[selectedRoom]
      ) {
        const mfValue =
          parseFloat(roomData.maintenance_factor[selectedRoom]) / 100; // Convert percentage to decimal
        setMf(mfValue || 0.8);
        console.log(
          `✅ Prefilled maintenance factor for ${selectedRoom}:`,
          mfValue
        );
      }

      // Prefill mounting height
      if (roomData.mounting_height && roomData.mounting_height[selectedRoom]) {
        const heightValue =
          parseFloat(roomData.mounting_height[selectedRoom]) * 1000; // Convert m to mm
        setMountingHeight(heightValue || 1000);
        console.log(
          `✅ Prefilled mounting height for ${selectedRoom}:`,
          heightValue
        );
      }

      // Prefill area
      if (roomData.area && roomData.area[selectedRoom]) {
        const areaValue = parseFloat(roomData.area[selectedRoom]);
        setArea(areaValue || 0);
        console.log(`✅ Prefilled area for ${selectedRoom}:`, areaValue);
      }

      // Prefill light fixture count
      if (roomData.light_fixture && roomData.light_fixture[selectedRoom]) {
        const fixtureValue = parseFloat(roomData.light_fixture[selectedRoom]);
        setLightFixture(fixtureValue || 0);
        console.log(
          `✅ Prefilled light fixture count for ${selectedRoom}:`,
          fixtureValue
        );
      }

      // Prefill reflectance factor
      if (
        roomData.reflectance_factor &&
        roomData.reflectance_factor[selectedRoom]
      ) {
        const reflectanceValue = parseFloat(
          roomData.reflectance_factor[selectedRoom]
        );
        setReflectanceFactor(reflectanceValue || 0.5);
        console.log(
          `✅ Prefilled reflectance factor for ${selectedRoom}:`,
          reflectanceValue
        );
      }

      // Prefill wall zone
      if (roomData.wall_zone && roomData.wall_zone[selectedRoom]) {
        const wallZoneValue = roomData.wall_zone[selectedRoom];
        setWallZone(wallZoneValue || "A");
        console.log(
          `✅ Prefilled wall zone for ${selectedRoom}:`,
          wallZoneValue
        );
      }

      // Prefill work plane
      if (roomData.work_plane && roomData.work_plane[selectedRoom]) {
        const workPlaneValue = parseFloat(roomData.work_plane[selectedRoom]);
        setWorkPlane(workPlaneValue || 0.85);
        console.log(
          `✅ Prefilled work plane for ${selectedRoom}:`,
          workPlaneValue
        );
      }

      // Prefill room usage type
      if (roomData.room_usage_type && roomData.room_usage_type[selectedRoom]) {
        const roomTypeValue = roomData.room_usage_type[selectedRoom];
        setRoomType(roomTypeValue || "office");
        console.log(
          `✅ Prefilled room usage type for ${selectedRoom}:`,
          roomTypeValue
        );
      }

      console.log(`✅ Form prefilled successfully for room: ${selectedRoom}`);
    } else {
      console.log("❌ No factorRoomData available for room-specific prefill");
    }
  };

  // Function to handle room selection change
  const handleRoomSelectionChange = (event) => {
    const selectedRoomName = event.target.value;
    console.log("🔍 Room selected:", selectedRoomName);
    setSelectedRoom(selectedRoomName);

    // If we have prefill data and a room is selected, prefill the form
    if (prefillData && selectedRoomName) {
      console.log("🔍 Prefilling form for room:", selectedRoomName);
      console.log("🔍 Available prefill data:", prefillData);
      prefillFormForRoom(selectedRoomName);
    } else {
      console.log("❌ Cannot prefill:", {
        hasPrefillData: !!prefillData,
        selectedRoom: selectedRoomName,
      });
    }
  };

  // =======
  //   const roomArea = selectedRoom
  //     ? selectedRoom.source === "ai"
  //       ? selectedRoom.areaInSquareMeters || 0
  //       : convertPixelsToMeters(selectedRoom.width) *
  //         convertPixelsToMeters(selectedRoom.height)
  //     : "";

  //   // Convert room height to meters if available
  //   const roomHeight = selectedRoom
  //     ? selectedRoom.source === "ai"
  //       ? selectedRoom.heightInMeters || 0
  //       : convertPixelsToMeters(selectedRoom.height)
  //     : "";

  // >>>>>>> dev
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
    if (!lumens || !illumination || !uf || !mf) {
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
    <div className="flex  h-[85vh] ">
      <div className=" bg-white w-[400px] p-6 overflow-y-auto">
        <div className="mb-6 ">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Lighting Design
          </h2>
          <p className="text-sm text-gray-600">
            Calculate lighting requirements and arrange fixtures
          </p>

          {/* Prefill Status Indicator */}
          {isPrefilling && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-700">
                  Loading prefill data from Admin backend...
                </span>
              </div>
            </div>
          )}

          {prefillSuccess && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-700">
                  Form prefilled successfully with data from Admin backend!
                </span>
              </div>
            </div>
          )}

          {prefillError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-sm text-red-700">{prefillError}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Manual Prefill Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              DIALUX Calculation Form
            </h3>
            <div className="flex gap-2">
              <button
                onClick={fetchPrefillData}
                disabled={isPrefilling}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isPrefilling ? "⏳ Loading..." : "📥 Prefill Data"}
              </button>

              {prefillData && (
                <button
                  onClick={() => {
                    setPrefillData(null);
                    setPrefillSuccess(false);
                    setPrefillError("");
                    setSelectedRoom("");
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  🗑️ Clear Data
                </button>
              )}
            </div>
          </div>

          {/* Prefill Status Messages */}
          {prefillError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">❌ {prefillError}</p>
            </div>
          )}

          {prefillSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">
                ✅ Prefill data loaded successfully! Now select a room to
                prefill the form.
              </p>
            </div>
          )}

          {/* Prefill Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>How to use prefill (Optional):</strong> 1️⃣ Click "📥 Prefill Data"
              button above 2️⃣ Select a room from dropdown 3️⃣ Form will auto-fill
              with room-specific data
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 <strong>Note:</strong> You can also calculate manually by filling in the form fields below without using prefill data.
            </p>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <select
              value={selectedRoom}
              onChange={handleRoomSelectionChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a room</option>
              {allRooms.map((room) => {
                let displayText = "";
                let areaDisplay = "";

                if (room.source === "ai") {
                  // AI room - use extracted dimensions
                  displayText = room.name;
                  if (room.category && room.category !== room.name) {
                    displayText = `${room.category} - ${room.name}`;
                  }
                  areaDisplay = room.areaInSquareMeters
                    ? ` (${room.areaInSquareMeters.toFixed(2)} m²)`
                    : "";
                } else {
                  // Existing room - calculate from pixels
                  const widthInMeters = convertPixelsToMeters(room.width);
                  const heightInMeters = convertPixelsToMeters(room.height);
                  const areaInMeters = widthInMeters * heightInMeters;
                  displayText = room.name || `Room ${room.id}`;
                  areaDisplay = ` (${areaInMeters.toFixed(2)} m²)`;
                }

                return (
                  // <<<<<<< SjCONNECTION
                  <option key={room.id} value={room.name || room.id}>
                    {displayText}
                    {areaDisplay}
                    {room.source === "ai" && " [AI]"}
                  </option>
                );
              })}
            </select>
            {prefillData && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Prefill data available - select a room to auto-fill form
              </p>
            )}
            {!prefillData && (
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Click "📥 Prefill Data" button above to load data first, or fill form manually below
              </p>
            )}

            {/* Debug: Show available room names from prefill data */}
            {prefillData && prefillData.factorRoomData && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="text-yellow-700 font-medium">
                  🔍 Debug: Available rooms in prefill data:
                </p>
                <p className="text-yellow-600">
                  {Object.keys(prefillData.factorRoomData.lux_level || {}).join(
                    ", "
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Room Information Display */}
          {selectedRoomObj && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Room Information
                {selectedRoomObj.source === "ai" && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    AI Generated
                  </span>
                )}
                {selectedRoomObj.source === "ai" &&
                  selectedRoomObj.category &&
                  selectedRoomObj.category !== selectedRoomObj.name && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {selectedRoomObj.category}
                    </span>
                  )}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedRoomObj.source === "ai" ? (
                  // AI Room Display
                  <>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <div className="font-medium">
                        {selectedRoomObj.widthInMeters > 0 &&
                        selectedRoomObj.heightInMeters > 0
                          ? `${selectedRoomObj.widthInMeters.toFixed(
                              2
                            )} × ${selectedRoomObj.heightInMeters.toFixed(2)} m`
                          : selectedRoomObj.specialDimensions ||
                            "Special dimensions"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Original Data:</span>
                      <div className="font-medium text-xs text-gray-600">
                        {selectedRoomObj.dimensions}
                      </div>
                    </div>
                  </>
                ) : (
                  // Existing Room Display
                  <>
                    <div>
                      <span className="text-gray-600">
                        Dimensions (pixels):
                      </span>
                      <div className="font-medium">
                        {selectedRoomObj.width} × {selectedRoomObj.height} px
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Dimensions (meters):
                      </span>
                      <div className="font-medium">
                        {convertPixelsToMeters(selectedRoomObj.width).toFixed(
                          2
                        )}{" "}
                        ×{" "}
                        {convertPixelsToMeters(selectedRoomObj.height).toFixed(
                          2
                        )}{" "}
                        m
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
            disabled={!lumens || !illumination || !uf || !mf}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              lumens && illumination && uf && mf
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
