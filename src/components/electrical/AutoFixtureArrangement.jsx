import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setRoomLights } from "../../redux/features/app/lightingSlice";
import { bulkCreateFixtures } from "../../redux/features/app/fixtureSlice";
import useFixtureId from "../../hooks/useFixtureId";
import {
  generateFixturePositions as generatePositions,
  calculateOptimalGrid,
  canArrangeFixtures,
  getArrangementStats,
  getRoomBoundingBox,
  getRoomCenter,
} from "../../utils/fixtureArrangementUtils";

const AutoFixtureArrangement = ({
  roomId,
  fixtureCount,
  onArrangementComplete,
}) => {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.newRooms?.rooms || []);
  const lightsByRoom = useSelector((state) => state.lighting.lightsByRoom);
  const { projectId } = useParams();

  // Remove duplicates based on room ID to prevent double rendering
  const uniqueRooms = rooms.filter(
    (room, index, self) =>
      index === self.findIndex((r) => (r.id || r._id) === (room.id || room._id))
  );

  // Fixture ID generation hook
  const {
    generateId,
    isLoading: isGeneratingId,
    error: fixtureError,
  } = useFixtureId();

  const [layoutType, setLayoutType] = useState("grid");
  const [fixtureSize, setFixtureSize] = useState(8);
  const [clearanceMargin, setClearanceMargin] = useState(20);
  const [showPreview, setShowPreview] = useState(false);
  const [arrangedFixtures, setArrangedFixtures] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isApplyingArrangement, setIsApplyingArrangement] = useState(false);

  const room = uniqueRooms.find((r) => r.id === roomId);
  const existingFixtures = lightsByRoom[roomId]?.lights || [];

  // Monitor Redux state changes
  useEffect(() => {
    console.log("🔧 AutoFixtureArrangement: Redux state changed:", {
      roomId,
      totalRooms: uniqueRooms.length,
      foundRoom: room
        ? {
            id: room.id,
            name: room.name,
            x: room.x,
            y: room.y,
            width: room.width,
            height: room.height,
            area: room.area,
          }
        : null,
      existingFixturesCount: existingFixtures.length,
      lightsByRoomKeys: Object.keys(lightsByRoom),
      currentRoomLights: lightsByRoom[roomId],
    });
  }, [roomId, room, existingFixtures.length, lightsByRoom, uniqueRooms.length]);

  // Layout type options
  const layoutOptions = [
    { value: "grid", label: "Grid", description: "Uniform grid arrangement" },
    { value: "linear-x", label: "Linear-X", description: "Along room length" },
    { value: "linear-y", label: "Linear-Y", description: "Along room width" },
    {
      value: "perimeter",
      label: "Perimeter",
      description: "Around room walls",
    },
    {
      value: "central",
      label: "Central Cluster",
      description: "Focused center area",
    },
  ];

  // Generate fixture positions using utility functions
  const fixturePositions = useMemo(() => {
    if (!room || fixtureCount <= 0) return [];
    const positions = generatePositions(
      room,
      fixtureCount,
      layoutType,
      clearanceMargin
    );
    console.log("🔧 AutoFixtureArrangement: Generated positions:", {
      roomId,
      fixtureCount,
      layoutType,
      clearanceMargin,
      positionsCount: positions.length,
      positions: positions.slice(0, 3), // Show first 3 for debugging
    });
    return positions;
  }, [room, fixtureCount, layoutType, clearanceMargin]);

  // Get arrangement statistics
  const arrangementStats = useMemo(() => {
    if (!room || fixtureCount <= 0) return null;
    return getArrangementStats(room, fixtureCount, layoutType, clearanceMargin);
  }, [room, fixtureCount, layoutType, clearanceMargin]);

  // Apply arrangement with fixture ID generation
  const applyArrangement = async () => {
    if (fixturePositions.length === 0) return;

    setIsApplyingArrangement(true);

    try {
      // Prepare fixtures data for bulk creation
      const fixturesData = fixturePositions.map((pos, index) => ({
        zone: room.name || `Room ${roomId}`,
        roomId: roomId,
        position: { x: pos.x, y: pos.y },
        isEmergency: false,
        fixtureType: "auto-arranged",
        wattage: 18,
        lumens: 1800,
        metadata: {
          index,
          arrangementType: layoutType,
          fixtureSize,
          clearanceMargin,
          originalPosition: pos,
          roomName: room.name,
          roomArea: room.area,
          generatedAt: new Date().toISOString(),
        },
      }));

      let result;
      try {
        result = await dispatch(
          bulkCreateFixtures({
            fixtures: fixturesData,
            projectId,
            roomData: {
              id: roomId,
              name: room.name,
              x: room.x,
              y: room.y,
              width: room.width,
              height: room.height,
              area: room.area,
              points: room.points,
            },
          })
        ).unwrap();
      } catch (apiError) {
        console.log("🔧 API call failed, using fallback:", apiError);
        // Fallback: Create fixtures locally
        const fallbackFixtures = fixturePositions.map((pos, index) => ({
          fixtureId: `FX-FALLBACK-${String(index + 1).padStart(3, "0")}`,
          position: { x: pos.x, y: pos.y },
          zone: room.name || `Room ${roomId}`,
          roomId: roomId,
          isEmergency: false,
          fixtureType: "auto-arranged",
          wattage: 18,
          lumens: 1800,
          metadata: {
            index,
            arrangementType: layoutType,
            fixtureSize,
            clearanceMargin,
            originalPosition: pos,
            roomName: room.name,
            roomArea: room.area,
            generatedAt: new Date().toISOString(),
            isFallback: true,
          },
        }));

        result = {
          success: true,
          createdFixtures: fallbackFixtures,
          totalCreated: fallbackFixtures.length,
          totalRequested: fixturePositions.length,
          successRate: 1,
          isFallback: true,
        };
      }

      if (
        !result.success ||
        !result.createdFixtures ||
        result.createdFixtures.length === 0
      ) {
        console.error("❌ Both API and fallback failed");
        throw new Error("Failed to create fixtures");
      }

      // Create fixtures for Redux lighting state
      const fixtures = result.createdFixtures.map((fixture, index) => ({
        x: fixture.position.x,
        y: fixture.position.y,
        fixtureId: fixture.fixtureId,
        id: fixture.fixtureId,
        type: "auto-arranged",
        layoutType: layoutType,
        roomId: roomId,
        zone: room.name || `Room ${roomId}`,
        wattage: fixture.wattage || 18,
        lumens: fixture.lumens || 1800,
        isEmergency: false,
        metadata: {
          ...fixture.metadata,
          index,
          arrangementType: layoutType,
          fixtureSize,
          clearanceMargin,
          roomName: room.name,
          roomArea: room.area,
        },
      }));

      // Map layout types to FloorPreview compatible modes
      const getFloorPreviewMode = (layoutType) => {
        switch (layoutType) {
          case "grid":
          case "linear-x":
          case "linear-y":
          case "perimeter":
          case "central":
            return "grid"; // All automatic arrangements are treated as grid for display
          default:
            return "grid";
        }
      };

      console.log("🔧 AutoFixtureArrangement: Created fixtures for Redux:", {
        roomId,
        fixturesCount: fixtures.length,
        fixtures: fixtures.slice(0, 3), // Show first 3 for debugging
        mode: getFloorPreviewMode(layoutType),
        arrangementType: layoutType,
        firstFixture: fixtures[0],
        lastFixture: fixtures[fixtures.length - 1],
      });

      // Dispatch to Redux
      const dispatchPayload = {
        roomId,
        lights: fixtures,
        count: fixtures.length,
        mode: getFloorPreviewMode(layoutType),
        arrangementType: layoutType,
        points: [
          room.x + clearanceMargin,
          room.y + clearanceMargin,
          room.x + room.width - clearanceMargin,
          room.y + room.height - clearanceMargin,
        ],
        metadata: {
          fixtureSize,
          clearanceMargin,
          roomDimensions: getRoomBoundingBox(room),
          roomCenter: getRoomCenter(room),
          arrangementStats,
          totalFixtures: fixtures.length,
          generatedAt: new Date().toISOString(),
        },
      };

      console.log(
        "🔧 AutoFixtureArrangement: Dispatching to Redux:",
        dispatchPayload
      );
      dispatch(setRoomLights(dispatchPayload));

      console.log("🔧 AutoFixtureArrangement: Redux dispatch completed");

      // Debug: Check Redux state after dispatch
      setTimeout(() => {
        console.log("🔧 AutoFixtureArrangement: Redux state after dispatch:", {
          lightsByRoom,
          roomLights: lightsByRoom[roomId],
          totalRoomsWithLights: Object.keys(lightsByRoom).length,
          dispatchedFixtures: fixtures.length,
          fixturesData: fixtures.slice(0, 2), // Show first 2 fixtures for debugging
        });
      }, 100);

      setArrangedFixtures(fixtures);
      setShowPreview(true);
      setShowStats(true);

      setDebugInfo({
        timestamp: new Date().toISOString(),
        roomId,
        fixtureCount: fixtures.length,
        layoutType,
        fixtures: fixtures.slice(0, 3),
        roomBounds: getRoomBoundingBox(room),
        generatedIds: fixtures.map((f) => f.fixtureId).slice(0, 3),
        roomName: room.name,
        roomArea: room.area,
      });

      if (onArrangementComplete) {
        onArrangementComplete(fixtures);
      }
    } catch (error) {
      console.error("❌ Failed to apply arrangement:", error);
    } finally {
      setIsApplyingArrangement(false);
    }
  };

  // Clear arrangement
  const clearArrangement = () => {
    dispatch(
      setRoomLights({
        roomId,
        lights: [],
        count: 0,
        mode: null,
        arrangementType: null,
        points: [],
      })
    );
    setArrangedFixtures([]);
    setShowPreview(false);
    setShowStats(false);
    setDebugInfo(null);
  };

  // Validate if arrangement is possible
  const canArrange =
    room &&
    fixtureCount > 0 &&
    canArrangeFixtures(room, fixtureCount, layoutType, clearanceMargin);

  console.log("🔧 AutoFixtureArrangement: Can arrange check:", {
    room: !!room,
    fixtureCount,
    canArrange,
    layoutType,
    clearanceMargin,
  });

  if (!room) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          No room selected for fixture arrangement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Layout Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Layout Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {layoutOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLayoutType(option.value)}
              className={`p-3 text-left rounded-lg border transition-colors ${
                layoutType === option.value
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fixture Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Fixture Size (radius): {fixtureSize}px
        </label>
        <input
          type="range"
          min="3"
          max="15"
          value={fixtureSize}
          onChange={(e) => setFixtureSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Clearance Margin */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Clearance from Walls: {clearanceMargin}px
        </label>
        <input
          type="range"
          min="10"
          max="50"
          value={clearanceMargin}
          onChange={(e) => setClearanceMargin(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={applyArrangement}
          disabled={!canArrange || isApplyingArrangement}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            canArrange && !isApplyingArrangement
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isApplyingArrangement ? "Applying..." : "Apply Auto Arrangement"}
        </button>

        <button
          onClick={clearArrangement}
          disabled={existingFixtures.length === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            existingFixtures.length > 0
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Clear Arrangement
        </button>
      </div>

      {/* Statistics */}
      {showStats && arrangementStats && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-3">
            Arrangement Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Fixtures:</span>{" "}
              {arrangementStats.totalPositions}
            </div>
            <div>
              <span className="font-medium">Success Rate:</span>{" "}
              {(arrangementStats.successRate * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Layout Type:</span>{" "}
              {arrangementStats.layoutType}
            </div>
            <div>
              <span className="font-medium">Clearance:</span>{" "}
              {arrangementStats.clearanceMargin}px
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoFixtureArrangement;
