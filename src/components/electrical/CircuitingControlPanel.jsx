import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

/**
 * CircuitingControlPanel - Manages electrical circuit generation and zone management
 *
 * Key Features:
 * - Zone-based circuit generation with RYB phase sequencing
 * - 12 fixtures per circuit limit with automatic circuit numbering
 * - Circuit display names (C1, C2, C3...) for UI consistency
 * - Multi-zone circuiting persistence and summary storage
 *
 * Circuit Structure:
 * - circuitId: Unique identifier (e.g., "C11", "C12" for Zone 1)
 * - circuitNumber: Sequential number (1, 2, 3...)
 * - displayName: UI display name (C1, C2, C3...)
 * - fixtures: Array of fixtures in the circuit
 * - load: Total load in watts
 */
import {
  setSelectedZone,
  setZoneManagement,
  setCircuits,
  setCircuitMapping,
  setShowPhaseOverlay,
  setLoading,
  setError,
  balanceLoads,
  assignCircuitToDB,
  saveZoneCircuiting,
  saveZoneCircuitingSummary,
} from "../../redux/features/app/circuitingSlice";
import {
  saveZoneSummary,
  clearAllSummaries,
} from "../../redux/features/app/circuitingSummarySlice";
import CircuitSummaryTable from "./CircuitSummaryTable";
import CircuitingSummaryDisplay from "./CircuitingSummaryDisplay";
import ZoneManagement from "./ZoneManagement";

// Icons for the buttons
const ZoneIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const CircuitIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-9l1-8z"
    />
  </svg>
);

const BalanceIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
  </svg>
);

const DBIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

const PhaseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
    />
  </svg>
);

const CircuitingControlPanel = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();

  // Redux state
  const {
    selectedZone,
    zoneManagement,
    circuits,
    circuitMapping,
    showPhaseOverlay,
    isLoading,
    error,
    distributionBoards,
    phaseColors,
  } = useSelector((state) => state.circuiting);

  const rooms = useSelector((state) => state.newRooms?.rooms || []);
  const lightsByRoom = useSelector((state) => state.lighting.lightsByRoom);

  // Local state
  const [showDBModal, setShowDBModal] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [selectedDB, setSelectedDB] = useState("");
  const [phaseMethod, setPhaseMethod] = useState("balanced");
  const [maxLoad, setMaxLoad] = useState(1500);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [activeTab, setActiveTab] = useState("zones");
  const [generatedCircuits, setGeneratedCircuits] = useState([]);

  // Don't auto-create zones from rooms - zones should be created manually
  // This ensures zones are proper organizational units, not individual rooms

  // Clear circuits when switching zones
  useEffect(() => {
    if (selectedZone) {
      // Clear any existing circuits when a new zone is selected
      // This ensures we start fresh for each zone
      if (Object.keys(circuits).length > 0) {
        // Don't clear here - let ZoneManagement handle saving the summary
        // Just reset the local state
        setGeneratedCircuits([]);
      }
    }
  }, [selectedZone?.id]); // Only trigger when zone ID changes

  // Get selected zone rooms
  const selectedZoneRooms = selectedZone
    ? rooms.filter((room) => selectedZone.rooms.includes(room.id))
    : [];

  // Handle load balancing
  const handleLoadBalance = async () => {
    if (Object.keys(circuits).length === 0) {
      dispatch(setError("No circuits to balance"));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Simulate phase balancing
      const circuitPhases = {};
      const phases = ["R", "Y", "B"];
      let phaseIndex = 0;

      Object.keys(circuits).forEach((circuitId) => {
        circuitPhases[circuitId] = phases[phaseIndex % 3];
        phaseIndex++;
      });

      dispatch(balanceLoads({ circuitPhases }));

      console.log("✅ Phase balancing completed");
    } catch (err) {
      console.error("❌ Phase balancing failed:", err);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle DB assignment
  const handleAssignDB = () => {
    if (Object.keys(circuits).length === 0) {
      dispatch(setError("No circuits to assign"));
      return;
    }
    setShowDBModal(true);
  };

  // Handle DB assignment submission
  const handleDBAssignment = async () => {
    if (selectedCircuit && selectedDB) {
      try {
        dispatch(
          assignCircuitToDB({ circuitId: selectedCircuit, dbId: selectedDB })
        );
        setSelectedCircuit(null);
        setSelectedDB("");
        setShowDBModal(false);
        console.log("✅ DB assignment completed");
      } catch (err) {
        console.error("❌ DB assignment failed:", err);
        dispatch(setError(err.message));
      }
    }
  };

  // Toggle phase overlay
  const togglePhaseOverlay = () => {
    dispatch(setShowPhaseOverlay(!showPhaseOverlay));
  };

  // Generate circuits for selected zone
  const handleGenerateCircuits = () => {
    if (!selectedZone) {
      dispatch(setError("Please select a zone first"));
      return;
    }

    if (selectedZone.rooms.length === 0) {
      dispatch(
        setError("Selected zone has no rooms. Add rooms to the zone first.")
      );
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Collect all fixtures from rooms in the selected zone
      const zoneFixtures = [];
      selectedZone.rooms.forEach((roomId) => {
        const roomFixtures = lightsByRoom[roomId]?.lights || [];
        zoneFixtures.push(
          ...roomFixtures.map((fixture) => ({
            ...fixture,
            roomId,
            zoneId: selectedZone.id,
          }))
        );
      });

      if (zoneFixtures.length === 0) {
        dispatch(
          setError(
            "No fixtures found in the selected zone. Add fixtures to rooms first."
          )
        );
        dispatch(setLoading(false));
        return;
      }

      // Generate circuits based on RYB circuiting rules
      const newCircuits = [];
      const circuitMapping = {};

      // Extract zone number from zone ID (e.g., "zone1" -> 1, "zone2" -> 2)
      const zoneMatch = selectedZone.id.match(/zone(\d+)/i);
      const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;

      let circuitCounter = 1; // Initialize circuit counter
      let fixtureCountInCircuit = 0;

      let currentCircuit = {
        circuitId: `C${zoneNumber}${circuitCounter}`, // e.g., C11, C12, C13 for Zone 1
        circuitNumber: circuitCounter, // Store the actual circuit number (1, 2, 3...)
        displayName: `C${circuitCounter}`, // Display name for UI (C1, C2, C3...)
        fixtures: [],
        load: 0,
        isEmergency: false,
        phase: null,
        db: null,
      };

      zoneFixtures.forEach((fixture, index) => {
        const fixtureLoad = fixture.wattage || 18; // Default 18W if not specified

        // Check if we need to start a new circuit (12 fixtures max per circuit)
        if (fixtureCountInCircuit >= 12) {
          // Save current circuit and start a new one
          newCircuits.push(currentCircuit);
          circuitCounter++;
          currentCircuit = {
            circuitId: `C${zoneNumber}${circuitCounter}`, // e.g., C11, C12, C13 for Zone 1
            circuitNumber: circuitCounter, // Store the actual circuit number (1, 2, 3...)
            displayName: `C${circuitCounter}`, // Display name for UI (C1, C2, C3...)
            fixtures: [],
            load: 0,
            isEmergency: false,
            phase: null,
            db: null,
          };
          fixtureCountInCircuit = 0;
        }

        // Check if adding this fixture would exceed max load
        if (
          currentCircuit.load + fixtureLoad > maxLoad &&
          currentCircuit.fixtures.length > 0
        ) {
          // Save current circuit and start a new one
          newCircuits.push(currentCircuit);
          circuitCounter++;
          currentCircuit = {
            circuitId: `C${zoneNumber}${circuitCounter}`, // e.g., C11, C12, C13 for Zone 1
            circuitNumber: circuitCounter, // Store the actual circuit number (1, 2, 3...)
            displayName: `C${circuitCounter}`, // Display name for UI (C1, C2, C3...)
            fixtures: [],
            load: 0,
            isEmergency: false,
            phase: null,
            db: null,
          };
          fixtureCountInCircuit = 0;
        }

        // Add fixture to current circuit
        currentCircuit.fixtures.push(fixture);
        currentCircuit.load += fixtureLoad;
        circuitMapping[fixture.fixtureId || fixture.id] =
          currentCircuit.circuitId;
        fixtureCountInCircuit++;
      });

      // Add the last circuit if it has fixtures
      if (currentCircuit.fixtures.length > 0) {
        newCircuits.push(currentCircuit);
      }

      // Assign phases based on RYB sequence for each fixture
      // Each circuit will have fixtures with R, Y, B phases in sequence
      newCircuits.forEach((circuit) => {
        // The phase will be determined by the fixture position in the circuit
        // This is handled in the FloorPreview component when generating labels
        circuit.phase = "RYB"; // Indicates this circuit uses RYB sequence
      });

      // Update Redux state
      const circuitMap = {};
      newCircuits.forEach((circuit) => {
        circuitMap[circuit.circuitId] = circuit;
      });

      dispatch(setCircuits(circuitMap));
      dispatch(setCircuitMapping(circuitMapping));

      // Generate fixture labels for summary
      const fixtureLabels = [];

      // Calculate total fixtures in the zone
      const totalFixtures = zoneFixtures.length;

      for (let i = 0; i < totalFixtures; i++) {
        const zoneMatch = selectedZone.id.match(/zone(\d+)/i);
        const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;
        const zoneIdentifier = `Z${zoneNumber}`;

        // Calculate which circuit this fixture belongs to based on global index
        // Each circuit can hold 12 fixtures (4 batches of R, Y, B)
        const circuitNumber = Math.floor(i / 12) + 1;

        // Calculate the position within the current circuit (0-11)
        const positionInCircuit = i % 12;

        // Calculate batch number and phase based on RYB sequence within the circuit
        const batchNumber = Math.floor(positionInCircuit / 3) + 1;
        const phaseIndex = positionInCircuit % 3; // 0=R, 1=Y, 2=B
        const phases = ["R", "Y", "B"];
        const phase = phases[phaseIndex];
        const phaseNum = 1;

        const label = `${zoneIdentifier}/C${circuitNumber}/${batchNumber}${phase}${phaseNum}`;
        fixtureLabels.push(label);
      }

      // Save circuiting data to new zones structure
      dispatch(
        saveZoneCircuiting({
          zoneId: selectedZone.id,
          fixtures: zoneFixtures,
          circuits: newCircuits,
          labels: fixtureLabels,
        })
      );

      // Also save to legacy summary structure for backward compatibility
      dispatch(
        saveZoneCircuitingSummary({
          zoneId: selectedZone.id,
          zoneName: selectedZone.name,
          fixturesCount: zoneFixtures.length,
          circuits: newCircuits,
          labels: fixtureLabels,
        })
      );

      // Save to permanent circuiting summary slice
      // Extract zone number for the summary key (e.g., "zone1" -> "Z1")
      const summaryZoneMatch = selectedZone.id.match(/zone(\d+)/i);
      const summaryZoneNumber = summaryZoneMatch
        ? parseInt(summaryZoneMatch[1])
        : 1;
      const summaryZoneId = `Z${summaryZoneNumber}`;

      dispatch(
        saveZoneSummary({
          zoneId: summaryZoneId,
          fixtures: fixtureLabels,
        })
      );

      setGeneratedCircuits(newCircuits);
      setActiveTab("summary");

      console.log(
        "✅ Circuits generated for zone:",
        selectedZone.name,
        newCircuits
      );
      console.log(
        "✅ Circuit structure:",
        newCircuits.map((c) => ({
          circuitId: c.circuitId,
          circuitNumber: c.circuitNumber,
          displayName: c.displayName,
          fixtures: c.fixtures.length,
        }))
      );
      console.log("✅ Fixture labels generated:", fixtureLabels);
    } catch (err) {
      console.error("❌ Circuit generation failed:", err);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Get circuit statistics
  const getCircuitStats = () => {
    const totalCircuits = Object.keys(circuits).length;
    const totalFixtures = Object.keys(circuitMapping).length;
    const totalLoad = Object.values(circuits).reduce(
      (sum, c) => sum + (c.load || 0),
      0
    );
    const averageLoad = totalCircuits > 0 ? totalLoad / totalCircuits : 0;
    const normalCircuits = Object.values(circuits).filter(
      (c) => !c.isEmergency
    ).length;
    const emergencyCircuits = Object.values(circuits).filter(
      (c) => c.isEmergency
    ).length;
    const phaseDistribution = Object.values(circuits).reduce((acc, circuit) => {
      if (circuit.phase) {
        acc[circuit.phase] = (acc[circuit.phase] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalCircuits,
      totalFixtures,
      totalLoad,
      averageLoad,
      normalCircuits,
      emergencyCircuits,
      phaseDistribution,
    };
  };

  // Ensure circuits have proper display names for UI
  const getCircuitsWithDisplayNames = () => {
    return Object.values(circuits).map((circuit, index) => {
      // If circuit doesn't have a displayName, generate one based on its position
      if (!circuit.displayName) {
        // Extract zone number from circuitId if possible
        const zoneMatch = selectedZone?.id?.match(/zone(\d+)/i);
        const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;

        // Try to extract circuit number from circuitId, or use index + 1
        let circuitNumber = index + 1;
        if (circuit.circuitId) {
          const circuitMatch = circuit.circuitId.match(/C\d+(\d+)/);
          if (circuitMatch) {
            circuitNumber = parseInt(circuitMatch[1]);
          }
        }

        return {
          ...circuit,
          displayName: `C${circuitNumber}`,
        };
      }
      return circuit;
    });
  };

  const stats = getCircuitStats();

  // Handle circuit click in summary table
  const handleCircuitClick = (circuit) => {
    console.log("Circuit clicked:", circuit);
  };

  // Clear circuits for current zone
  const handleClearCircuits = () => {
    if (selectedZone && Object.keys(circuits).length > 0) {
      // Save current zone's circuiting summary before clearing
      const currentZoneFixtures = Object.entries(lightsByRoom).reduce(
        (sum, [rid, data]) => {
          if (selectedZone.rooms.includes(rid)) {
            return sum + (data?.lights?.length || 0);
          }
          return sum;
        },
        0
      );

      const currentZoneLabels = [];
      for (let i = 0; i < currentZoneFixtures; i++) {
        const zoneMatch = selectedZone.id.match(/zone(\d+)/i);
        const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;
        const zoneIdentifier = `Z${zoneNumber}`;

        const circuitNumber = Math.floor(i / 12) + 1;
        const positionInCircuit = i % 12;
        const batchNumber = Math.floor(positionInCircuit / 3) + 1;
        const phaseIndex = positionInCircuit % 3;
        const phases = ["R", "Y", "B"];
        const phase = phases[phaseIndex];
        const phaseNum = 1;

        const label = `${zoneIdentifier}/C${circuitNumber}/${batchNumber}${phase}${phaseNum}`;
        currentZoneLabels.push(label);
      }

      // Save the current zone's circuiting summary
      dispatch(
        saveZoneCircuitingSummary({
          zoneId: selectedZone.id,
          zoneName: selectedZone.name,
          fixturesCount: currentZoneFixtures,
          circuits: Object.values(circuits),
          labels: currentZoneLabels,
        })
      );

      // Clear circuits
      dispatch(setCircuits({}));
      dispatch(setCircuitMapping({}));
      setGeneratedCircuits([]);
    }
  };

  // Clear all permanent circuiting summaries
  const handleClearAllSummaries = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all permanent circuiting summaries? This action cannot be undone."
      )
    ) {
      dispatch(clearAllSummaries());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-[440px] h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Circuiting Tools
        </h3>
        {selectedZone && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div>
                Selected Zone:{" "}
                <span className="font-medium">{selectedZone.name}</span>
                <span className="ml-2 text-xs">
                  ({selectedZone.rooms.length} rooms)
                </span>
              </div>
              {Object.keys(circuits).length > 0 && (
                <button
                  onClick={handleClearCircuits}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded border border-red-300 transition-colors"
                  title="Clear circuits and save to summary"
                >
                  Clear Circuits
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("zones")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "zones"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Zone Management
          </button>
          <button
            onClick={() => setActiveTab("circuits")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "circuits"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Circuit Settings
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "summary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Circuit Summary
          </button>
          <button
            onClick={() => setActiveTab("circuitingSummary")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "circuitingSummary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Circuiting Summary
          </button>
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-800">Processing...</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {/* Zone Management Tab */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          <ZoneManagement />
        </div>
      )}

      {/* Circuit Settings Tab */}
      {activeTab === "circuits" && (
        <div className="space-y-4">
          {/* Zone Selection Info */}
          {!selectedZone ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please select a zone from the Zone Management tab to configure
                circuit settings.
              </p>
            </div>
          ) : (
            <>
              {/* Selected Zone Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Circuit Settings for: {selectedZone.name}
                </h4>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>Rooms in zone: {selectedZone.rooms.length}</div>
                  <div>
                    Total fixtures:{" "}
                    {selectedZone.rooms.reduce(
                      (sum, roomId) =>
                        sum + (lightsByRoom[roomId]?.lights?.length || 0),
                      0
                    )}
                  </div>
                </div>
              </div>

              {/* Circuit Generation Configuration */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Circuit Generation Settings
                </h4>

                {/* Max Load Setting */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Max Load per Circuit (W)
                  </label>
                  <input
                    type="number"
                    value={maxLoad}
                    onChange={(e) =>
                      setMaxLoad(parseInt(e.target.value) || 1500)
                    }
                    min="500"
                    max="3000"
                    step="100"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>

                {/* Phase Method Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phase Assignment Method
                  </label>
                  <select
                    value={phaseMethod}
                    onChange={(e) => setPhaseMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  >
                    <option value="balanced">Balanced (Load-aware)</option>
                    <option value="roundRobin">Round Robin (Sequential)</option>
                  </select>
                </div>

                {/* Force Regenerate Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="forceRegenerate"
                    checked={forceRegenerate}
                    onChange={(e) => setForceRegenerate(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="forceRegenerate"
                    className="text-xs text-gray-600"
                  >
                    Force Regenerate (Overwrite existing circuits)
                  </label>
                </div>

                {/* Generate Circuits Button */}
                <button
                  onClick={handleGenerateCircuits}
                  disabled={
                    !selectedZone ||
                    selectedZone.rooms.length === 0 ||
                    isLoading
                  }
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <CircuitIcon />
                  <span className="ml-3 text-sm font-medium">
                    Generate Circuits for {selectedZone?.name}
                  </span>
                </button>
              </div>

              {/* Circuit Management Buttons */}
              {Object.keys(circuits).length > 0 && (
                <div className="space-y-2">
                  {/* Phase Balancing Button */}
                  <button
                    onClick={handleLoadBalance}
                    disabled={isLoading}
                    className="w-full flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <BalanceIcon />
                    <span className="ml-3 text-sm font-medium">
                      Phase Balancing
                    </span>
                  </button>

                  {/* Assign DB Button */}
                  <button
                    onClick={handleAssignDB}
                    disabled={isLoading}
                    className="w-full flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <DBIcon />
                    <span className="ml-3 text-sm font-medium">Assign DB</span>
                  </button>

                  {/* Show Phase Distribution Button */}
                  <button
                    onClick={togglePhaseOverlay}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      showPhaseOverlay
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    <PhaseIcon />
                    <span className="ml-3 text-sm font-medium">
                      {showPhaseOverlay ? "Hide" : "Show"} Phase Distribution
                    </span>
                  </button>
                </div>
              )}

              {/* Circuit Information Display */}
              {Object.keys(circuits).length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-xs font-medium text-blue-800 mb-2">
                    Generated Circuits:
                  </h5>
                  <div className="space-y-1 text-xs text-blue-700">
                    {Object.values(circuits).map((circuit, index) => (
                      <div
                        key={circuit.circuitId}
                        className="flex justify-between"
                      >
                        <span>
                          {circuit.displayName || circuit.circuitId}:{" "}
                          {circuit.fixtures?.length || 0} fixtures
                        </span>
                        <span>{circuit.load || 0}W</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Circuit Summary Tab */}
      {activeTab === "summary" && (
        <CircuitSummaryTable
          circuits={
            generatedCircuits.length > 0
              ? generatedCircuits
              : getCircuitsWithDisplayNames()
          }
          onCircuitClick={handleCircuitClick}
        />
      )}

      {/* Circuiting Summary Tab */}
      {activeTab === "circuitingSummary" && (
        <div className="space-y-4">
          {/* Header with clear button */}
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-700">
              Permanent Circuiting Summaries
            </h4>
            <button
              onClick={handleClearAllSummaries}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded border border-red-300 transition-colors"
              title="Clear all permanent summaries"
            >
              Clear All Summaries
            </button>
          </div>

          <CircuitingSummaryDisplay />
        </div>
      )}

      {/* Statistics - Show in circuits tab */}
      {activeTab === "circuits" && stats.totalCircuits > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Circuit Statistics
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Total Circuits:</span>
              <span className="font-medium">{stats.totalCircuits}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Fixtures:</span>
              <span className="font-medium">{stats.totalFixtures}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Load:</span>
              <span className="font-medium">{stats.totalLoad}W</span>
            </div>
            <div className="flex justify-between">
              <span>Average Load:</span>
              <span className="font-medium">
                {stats.averageLoad.toFixed(0)}W
              </span>
            </div>
            {Object.keys(stats.phaseDistribution).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-600">Phase Distribution:</span>
                <div className="flex gap-2 mt-1">
                  {Object.entries(stats.phaseDistribution).map(
                    ([phase, count]) => (
                      <div key={phase} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: phaseColors[phase] }}
                        ></div>
                        <span className="text-xs">
                          {phase}: {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DB Assignment Modal */}
      {showDBModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Assign Circuit to DB</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Circuit
                </label>
                <select
                  value={selectedCircuit || ""}
                  onChange={(e) => setSelectedCircuit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Choose a circuit...</option>
                  {Object.keys(circuits).map((circuitId) => (
                    <option key={circuitId} value={circuitId}>
                      {circuitId} ({circuits[circuitId].fixtures?.length || 0}{" "}
                      fixtures)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Distribution Board
                </label>
                <select
                  value={selectedDB}
                  onChange={(e) => setSelectedDB(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Choose a DB...</option>
                  {Object.keys(distributionBoards).map((dbId) => (
                    <option key={dbId} value={dbId}>
                      {distributionBoards[dbId].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDBAssignment}
                disabled={!selectedCircuit || !selectedDB}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Assign
              </button>
              <button
                onClick={() => setShowDBModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitingControlPanel;
