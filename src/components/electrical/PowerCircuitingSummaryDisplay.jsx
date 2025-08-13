import React, { useState } from "react";
import { useSelector } from "react-redux";

const PowerCircuitingSummaryDisplay = () => {
  const [selectedZone, setSelectedZone] = useState("");
  const [sortBy, setSortBy] = useState("label");
  const [sortOrder, setSortOrder] = useState("asc");

  const powerCircuiting = useSelector((state) => state.powerCircuiting?.powerCircuitingByZone || {});
  const zones = Object.keys(powerCircuiting);

  // Get all devices from all zones
  const getAllDevices = () => {
    const allDevices = [];
    Object.entries(powerCircuiting).forEach(([zoneId, zoneData]) => {
      zoneData.circuits.forEach(circuit => {
        circuit.devices.forEach(device => {
          allDevices.push({
            ...device,
            zoneId,
            circuitNumber: circuit.circuitNumber
          });
        });
      });
    });
    return allDevices;
  };

  // Filter devices by selected zone
  const getFilteredDevices = () => {
    const allDevices = getAllDevices();
    if (!selectedZone) return allDevices;
    
    return allDevices.filter(device => device.zoneId === selectedZone);
  };

  // Sort devices
  const getSortedDevices = () => {
    const devices = getFilteredDevices();
    
    return devices.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "watt" || sortBy === "circuitNumber" || sortBy === "batchNumber") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (column) => {
    if (sortBy !== column) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // Get phase color
  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'R': return 'text-red-600 bg-red-100';
      case 'Y': return 'text-yellow-600 bg-yellow-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate totals
  const getTotals = () => {
    const devices = getFilteredDevices();
    return {
      totalDevices: devices.length,
      totalCircuits: [...new Set(devices.map(d => `${d.zoneId}-${d.circuitNumber}`))].length,
      totalWattage: devices.reduce((sum, device) => sum + device.watt, 0),
      phases: {
        R: devices.filter(d => d.phase === 'R').length,
        Y: devices.filter(d => d.phase === 'Y').length,
        B: devices.filter(d => d.phase === 'B').length
      }
    };
  };

  const sortedDevices = getSortedDevices();
  const totals = getTotals();

  if (zones.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">⚡</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Power Circuits Generated
        </h3>
        <p className="text-gray-600">
          Use the Power Circuiting Control Panel to generate circuits for your power devices.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Power Circuiting Summary</h2>
            <p className="text-sm text-gray-600">
              {totals.totalDevices} devices across {totals.totalCircuits} circuits
            </p>
          </div>
          
          {/* Zone Filter */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Zone:</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Zones</option>
              {zones.map((zone, index) => (
                <option key={index} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totals.totalDevices}</div>
            <div className="text-xs text-blue-600">Total Devices</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totals.totalCircuits}</div>
            <div className="text-xs text-green-600">Total Circuits</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{totals.totalWattage}</div>
            <div className="text-xs text-orange-600">Total Watts</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{totals.phases.R}</div>
            <div className="text-xs text-red-600">R Phase</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totals.phases.Y}</div>
            <div className="text-xs text-yellow-600">Y Phase</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("label")}
              >
                <div className="flex items-center space-x-1">
                  <span>Circuit Label</span>
                  <span className="text-gray-400">{getSortIcon("label")}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Device Name</span>
                  <span className="text-gray-400">{getSortIcon("name")}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("room")}
              >
                <div className="flex items-center space-x-1">
                  <span>Room</span>
                  <span className="text-gray-400">{getSortIcon("room")}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("watt")}
              >
                <div className="flex items-center space-x-1">
                  <span>Wattage</span>
                  <span className="text-gray-400">{getSortIcon("watt")}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("circuitNumber")}
              >
                <div className="flex items-center space-x-1">
                  <span>Circuit</span>
                  <span className="text-gray-400">{getSortIcon("circuitNumber")}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("phase")}
              >
                <div className="flex items-center space-x-1">
                  <span>Phase</span>
                  <span className="text-gray-400">{getSortIcon("phase")}</span>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort("zoneId")}
              >
                <div className="flex items-center space-x-1">
                  <span>Zone</span>
                  <span className="text-gray-400">{getSortIcon("zoneId")}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device, index) => (
              <tr 
                key={`${device.zoneId}-${device.circuitNumber}-${device.label}`}
                className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm font-mono text-gray-900">
                  {device.label}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {device.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {device.room}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {device.watt} W
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  C{device.circuitNumber}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(device.phase)}`}>
                    {device.phase}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {device.zoneId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {sortedDevices.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No devices found
          </h3>
          <p className="text-gray-600">
            {selectedZone ? `No power devices found in zone: ${selectedZone}` : 'No power circuits have been generated yet.'}
          </p>
        </div>
      )}

      {/* Footer Stats */}
      {sortedDevices.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Showing {sortedDevices.length} devices</span>
            <span>Total Power: {totals.totalWattage} W</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerCircuitingSummaryDisplay;
