import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  generatePowerCircuits,
  clearZoneCircuits,
  clearAllPowerCircuits,
  setSelectedPowerZone,
  setPowerZoneManagement,
} from "../../redux/features/app/powerCircuitingSlice";
import PowerZoneManagement from "./PowerZoneManagement";

const PowerCircuitingControlPanel = () => {
  const dispatch = useDispatch();

  // Redux state from power-specific slice
  const powerDevices = useSelector((state) => state.power?.devices || []);
  const powerCircuiting = useSelector(
    (state) => state.powerCircuiting?.powerCircuitingByZone || {}
  );
  const rooms = useSelector(
    (state) => state.rooms?.rooms || state.newRooms?.rooms || []
  );

  // Get power zones from power-specific slice (completely separate from lighting zones)
  const powerZoneManagementData = useSelector(
    (state) => state.powerCircuiting?.powerZoneManagement || []
  );
  const selectedZone = useSelector(
    (state) => state.powerCircuiting?.selectedPowerZone
  );

  // Local state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("zones");

  // Get selected zone rooms
  const selectedZoneRooms =
    selectedZone && selectedZone.type === "power"
      ? rooms.filter((room) => selectedZone.rooms.includes(room.id))
      : [];

  // Handle zone selection
  const handleZoneSelect = (zone) => {
    if (zone && zone.type === "power") {
      dispatch(setSelectedPowerZone(zone));
    } else {
      dispatch(setSelectedPowerZone(null));
    }
  };

  // Generate circuits for selected zone
  const handleGenerateCircuits = () => {
    if (!selectedZone || selectedZone.type !== "power") {
      alert("Please select a power zone first");
      return;
    }

    if (selectedZone.rooms.length === 0) {
      alert("Selected zone has no rooms. Add rooms to the zone first.");
      return;
    }

    setIsGenerating(true);

    try {
      // Collect all power devices from rooms in the selected zone
      const zoneDevices = [];
      selectedZone.rooms.forEach((roomId) => {
        const roomDevices = powerDevices.filter(
          (device) => device.roomId === roomId
        );
        zoneDevices.push(
          ...roomDevices.map((device) => ({
            ...device,
            roomId,
            zoneId: selectedZone.id,
          }))
        );
      });

      if (zoneDevices.length === 0) {
        alert(
          "No power devices found in the selected zone. Add power devices to rooms first."
        );
        setIsGenerating(false);
        return;
      }

      // Transform devices to match the expected format
      const transformedDevices = zoneDevices.map((device) => ({
        name: `${device.type.charAt(0).toUpperCase() + device.type.slice(1)} ${
          device.rating
        }`,
        quantity: device.quantity,
        room: device.room,
        watt: getWattageForDevice(device.type, device.rating),
      }));

      dispatch(
        generatePowerCircuits({
          zoneId: selectedZone.id,
          devices: transformedDevices,
        })
      );

      alert(
        `Power circuits generated successfully for zone: ${selectedZone.name}`
      );
      setActiveTab("summary");
    } catch (error) {
      console.error("Error generating circuits:", error);
      alert("Error generating circuits. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate wattage based on device type and rating
  // Use the same calculation method as SwitchSocketSummaryTable for consistency
  const getWattageForDevice = (type, rating) => {
    // Use the same loadPerUnitMap as SwitchSocketSummaryTable
    const loadPerUnitMap = {
      "6A": 60,
      "10A": 100,
      "16A": 1000,
      "20A": 1500,
      "25A": 1800,
      "32A": 2200
    };

    switch (type) {
      case "switch":
        return loadPerUnitMap[rating] || 0; // Switches now use the same rating-based load
      case "socket":
        return loadPerUnitMap[rating] || 0;
      case "dimmer":
        return loadPerUnitMap[rating] || 0;
      case "usb-socket":
        return loadPerUnitMap[rating] || 0;
      case "timer-switch":
        return loadPerUnitMap[rating] || 0;
      default:
        return 0;
    }
  };

  const handleClearZone = () => {
    if (
      selectedZone &&
      selectedZone.type === "power" &&
      powerCircuiting[selectedZone.id] &&
      window.confirm(
        `Are you sure you want to clear all circuits for zone: ${selectedZone.name}?`
      )
    ) {
      dispatch(clearZoneCircuits(selectedZone.id));
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL power circuits? This action cannot be undone."
      )
    ) {
      dispatch(clearAllPowerCircuits());
    }
  };

  const getZoneStats = (zone) => {
    const zoneData = powerCircuiting[zone.id];
    if (!zoneData) return null;

    const { summary } = zoneData;
    return {
      totalCircuits: summary.totalCircuits,
      totalDevices: summary.totalDevices,
      totalWattage: summary.totalWattage,
      averageWattage: summary.averageWattagePerCircuit,
    };
  };

  return (
    <div className="bg-white w-[380px] rounded-lg shadow-lg border border-gray-200 p-4 h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Power Circuiting Tools
        </h3>
        {selectedZone && selectedZone.type === "power" && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div>
                Selected Zone:{" "}
                <span className="font-medium">{selectedZone.name}</span>
                <span className="ml-2 text-xs">
                  ({selectedZone.rooms.length} rooms)
                </span>
              </div>
              {powerCircuiting[selectedZone.id] && (
                <button
                  onClick={handleClearZone}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded border border-red-300 transition-colors"
                  title="Clear circuits for this zone"
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
        </nav>
      </div>

      {/* Tab Content */}
      {/* Zone Management Tab */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          {/* Help Message */}

          <PowerZoneManagement
            onZoneSelect={handleZoneSelect}
            selectedZone={selectedZone}
            zoneType="power"
          />
        </div>
      )}

      {/* Circuit Settings Tab */}
      {activeTab === "circuits" && (
        <div className="space-y-4">
          {/* Zone Selection Info */}
          {!selectedZone || selectedZone.type !== "power" ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please select a power zone from the Zone Management tab to
                configure power circuit settings.
              </p>
            </div>
          ) : (
            <>
              {/* Selected Zone Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Power Circuit Settings for: {selectedZone.name}
                </h4>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>Rooms in zone: {selectedZone.rooms.length}</div>
                  <div>
                    Total power devices:{" "}
                    {selectedZone.rooms.reduce(
                      (sum, roomId) =>
                        sum +
                        (powerDevices.filter(
                          (device) => device.roomId === roomId
                        ).length || 0),
                      0
                    )}
                  </div>
                </div>
              </div>

              {/* Power Device Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Power Devices in Zone
                </h4>

                {(() => {
                  const zoneDevices = [];
                  selectedZone.rooms.forEach((roomId) => {
                    const roomDevices = powerDevices.filter(
                      (device) => device.roomId === roomId
                    );
                    zoneDevices.push(...roomDevices);
                  });

                  if (zoneDevices.length === 0) {
                    return (
                      <div className="text-sm text-gray-600">
                        <p>No power devices found in this zone.</p>
                        <p className="mt-1 text-xs">
                          Go to Power Devices to add switches, sockets, etc. to
                          the rooms in this zone.
                        </p>
                      </div>
                    );
                  }

                  // Group devices by type and rating
                  const deviceGroups = {};
                  zoneDevices.forEach((device) => {
                    const key = `${device.type}-${device.rating}`;
                    if (!deviceGroups[key]) {
                      deviceGroups[key] = {
                        name: `${
                          device.type.charAt(0).toUpperCase() +
                          device.type.slice(1)
                        } ${device.rating}`,
                        quantity: 0,
                        totalWatt: 0,
                      };
                    }
                    deviceGroups[key].quantity += device.quantity;
                    deviceGroups[key].totalWatt +=
                      getWattageForDevice(device.type, device.rating) *
                      device.quantity;
                  });

                  return (
                    <div className="space-y-2">
                      {Object.values(deviceGroups).map((device, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm text-gray-700"
                        >
                          <span>
                            {device.name} ({device.quantity} units)
                          </span>
                          <span>{device.totalWatt}W</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Generate Circuits Button */}
              <button
                onClick={handleGenerateCircuits}
                disabled={
                  !selectedZone ||
                  selectedZone.type !== "power" ||
                  selectedZone.rooms.length === 0 ||
                  isGenerating
                }
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm font-medium">
                  {isGenerating
                    ? "Generating Circuits..."
                    : `Generate Power Circuits for ${selectedZone?.name}`}
                </span>
              </button>

              {/* Circuit Information Display */}
              {powerCircuiting[selectedZone.id] && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-xs font-medium text-blue-800 mb-2">
                    Generated Circuits:
                  </h5>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex justify-between">
                      <span>Total Circuits:</span>
                      <span>
                        {powerCircuiting[selectedZone.id].summary.totalCircuits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Devices:</span>
                      <span>
                        {powerCircuiting[selectedZone.id].summary.totalDevices}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Power:</span>
                      <span>
                        {powerCircuiting[selectedZone.id].summary.totalWattage}W
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Circuit Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          {selectedZone &&
          selectedZone.type === "power" &&
          powerCircuiting[selectedZone.id] ? (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-700">
                Power Circuit Summary for {selectedZone.name}
              </h4>

              {/* Circuit Details */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700">
                    Circuit Details
                  </h5>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Total Circuits:
                      </span>{" "}
                      {powerCircuiting[selectedZone.id].summary.totalCircuits}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Total Devices:
                      </span>{" "}
                      {powerCircuiting[selectedZone.id].summary.totalDevices}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Total Power:
                      </span>{" "}
                      {powerCircuiting[selectedZone.id].summary.totalWattage}W
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Avg/Circuit:
                      </span>{" "}
                      {
                        powerCircuiting[selectedZone.id].summary
                          .averageWattagePerCircuit
                      }
                      W
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Labels */}
              {powerCircuiting[selectedZone.id].summary.circuits && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700">
                      Device Labels
                    </h5>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 text-sm">
                      {powerCircuiting[selectedZone.id].summary.circuits.map(
                        (circuit, circuitIndex) => (
                          <div
                            key={circuitIndex}
                            className="border-b border-gray-100 pb-2 last:border-b-0"
                          >
                            <div className="font-medium text-gray-700 mb-1">
                              Circuit {circuit.circuitNumber}
                            </div>
                            <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                              {circuit.devices.map((device, deviceIndex) => (
                                <div
                                  key={deviceIndex}
                                  className="flex justify-between"
                                >
                                  <span>{device.label}</span>
                                  <span>
                                    {device.name} - {device.watt}W
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No power circuits generated yet. Select a power zone and
                generate circuits first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Global Stats */}
      {Object.keys(powerCircuiting).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            Global Power Circuiting Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Zones:</span>{" "}
              {Object.keys(powerCircuiting).length}
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Circuits:</span>{" "}
              {Object.values(powerCircuiting).reduce(
                (sum, zone) => sum + (zone.summary?.totalCircuits || 0),
                0
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Devices:</span>{" "}
              {Object.values(powerCircuiting).reduce(
                (sum, zone) => sum + (zone.summary?.totalDevices || 0),
                0
              )}
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>{" "}
              {(() => {
                const timestamps = Object.values(powerCircuiting).map(
                  (zone) => zone.summary?.generatedAt || zone.timestamp
                );
                const latestTimestamp =
                  timestamps.length > 0
                    ? Math.max(
                        ...timestamps.map((ts) => new Date(ts).getTime())
                      )
                    : null;
                return latestTimestamp
                  ? new Date(latestTimestamp).toLocaleString()
                  : "Never";
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Help Information */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">
          How to Use Power Circuiting
        </h3>
        <div className="text-sm text-green-700 space-y-2">
          <p>
            1. <strong>Create Zones:</strong> Use Zone Management to create
            power-specific zones
          </p>
          <p>
            2. <strong>Add Rooms:</strong> Select rooms from your floor plan and
            add them to zones
          </p>
          <p>
            3. <strong>Select Zone:</strong> Choose a zone to work with for
            power circuiting
          </p>
          <p>
            4. <strong>Add Devices:</strong> Go to Power Devices to add
            switches, sockets, etc. to rooms
          </p>
          <p>
            5. <strong>Generate Circuits:</strong> Use Circuit Settings to
            create circuits for the selected zone
          </p>
          <p>
            6. <strong>View Results:</strong> Switch to Circuit Summary to see
            generated circuits
          </p>
          <p className="mt-2 text-xs text-green-600">
            <strong>Note:</strong> Power zones are now completely independent
            from lighting zones. Each system has its own zone management and
            circuiting logic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PowerCircuitingControlPanel;
