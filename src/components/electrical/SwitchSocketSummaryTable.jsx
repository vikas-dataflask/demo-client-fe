import React, { useState, useMemo } from "react";

const SwitchSocketSummaryTable = ({
  data = [],
  onDelete,
  selectedRoom = "",
}) => {
  const [sortBy, setSortBy] = useState("room");
  const [sortOrder, setSortOrder] = useState("asc");
  const [groupByRoom, setGroupByRoom] = useState(true); // Default to true for room-wise grouping

  // Load per unit mapping
  const loadPerUnitMap = {
    "6A": 60,
    "10A": 100,
    "16A": 1000,
    "20A": 1500,
    "25A": 1800,
    "32A": 2200,
  };

  // Device type icons
  const getDeviceIcon = (type) => {
    switch (type) {
      case "switch":
        return "🔌";
      case "socket":
        return "⚡";
      case "dimmer":
        return "💡";
      case "usb-socket":
        return "📱";
      case "timer-switch":
        return "⏰";
      default:
        return "🔌";
    }
  };

  // Calculate load per unit and total load for each item
  const processedData = useMemo(() => {
    const processed = data.map((item, index) => ({
      ...item,
      id: index,
      loadPerUnit: loadPerUnitMap[item.rating] || 0,
      totalLoad: (loadPerUnitMap[item.rating] || 0) * item.quantity,
    }));
    return processed;
  }, [data]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...processedData].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (
        sortBy === "totalLoad" ||
        sortBy === "quantity" ||
        sortBy === "loadPerUnit"
      ) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [processedData, sortBy, sortOrder]);

  // Group data by room if enabled
  const groupedData = useMemo(() => {
    if (!groupByRoom) return { "All Devices": sortedData };

    return sortedData.reduce((groups, item) => {
      const room = item.room;
      if (!groups[room]) {
        groups[room] = [];
      }
      groups[room].push(item);
      return groups;
    }, {});
  }, [sortedData, groupByRoom]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalQuantity: processedData.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      totalLoad: processedData.reduce((sum, item) => sum + item.totalLoad, 0),
    };
  }, [processedData]);

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

  // Render table header
  const renderTableHeader = () => (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th
          className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => handleSort("type")}
        >
          <div className="flex items-center space-x-1">
            <span>Type</span>
            <span className="text-gray-400">{getSortIcon("type")}</span>
          </div>
        </th>
        <th
          className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => handleSort("rating")}
        >
          <div className="flex items-center space-x-1">
            <span>Rating</span>
            <span className="text-gray-400">{getSortIcon("rating")}</span>
          </div>
        </th>
        <th
          className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => handleSort("quantity")}
        >
          <div className="flex items-center space-x-1">
            <span>Quantity</span>
            <span className="text-gray-400">{getSortIcon("quantity")}</span>
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
          onClick={() => handleSort("loadPerUnit")}
        >
          <div className="flex items-center space-x-1">
            <span>Load/Unit (W)</span>
            <span className="text-gray-400">{getSortIcon("loadPerUnit")}</span>
          </div>
        </th>
        <th
          className="px-4 py-3 text-left text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => handleSort("totalLoad")}
        >
          <div className="flex items-center space-x-1">
            <span>Total Load (W)</span>
            <span className="text-gray-400">{getSortIcon("totalLoad")}</span>
          </div>
        </th>
        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
          Actions
        </th>
      </tr>
    </thead>
  );

  // Render table row
  const renderTableRow = (item, index) => (
    <tr
      key={item.id}
      className={`border-b border-gray-100 hover:bg-gray-50 transition ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      <td className="px-4 py-3 text-sm text-gray-900">
        <div className="flex items-center space-x-2">
          <span>{getDeviceIcon(item.type)}</span>
          <span className="capitalize">{item.type}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {item.rating}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.room}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {item.loadPerUnit.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {item.totalLoad.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm">
        <button
          onClick={() => onDelete && onDelete(item.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition"
        >
          Delete
        </button>
      </td>
    </tr>
  );

  // Render group header
  const renderGroupHeader = (groupName, groupData) => {
    const groupTotals = groupData.reduce(
      (sum, item) => ({
        quantity: sum.quantity + item.quantity,
        load: sum.load + item.totalLoad,
      }),
      { quantity: 0, load: 0 }
    );

    return (
      <tr key={groupName} className="bg-blue-50 border-b border-blue-200">
        <td
          colSpan="4"
          className="px-4 py-2 text-sm font-semibold text-blue-800"
        >
          {groupName}
        </td>
        <td className="px-4 py-2 text-sm font-semibold text-blue-800">
          {groupTotals.quantity} devices
        </td>
        <td className="px-4 py-2 text-sm font-semibold text-blue-800">
          {groupTotals.load.toLocaleString()} W
        </td>
        <td className="px-4 py-2"></td>
      </tr>
    );
  };

  // Render summary row
  const renderSummaryRow = () => (
    <tr className="bg-gray-100 border-t-2 border-gray-300">
      <td colSpan="2" className="px-4 py-3 text-sm font-bold text-gray-800">
        TOTAL
      </td>
      <td className="px-4 py-3 text-sm font-bold text-gray-800">
        {totals.totalQuantity}
      </td>
      <td className="px-4 py-3 text-sm font-bold text-gray-800">All Rooms</td>
      <td className="px-4 py-3 text-sm font-bold text-gray-800">-</td>
      <td className="px-4 py-3 text-sm font-bold text-gray-800">
        {totals.totalLoad.toLocaleString()} W
      </td>
      <td className="px-4 py-3"></td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Selected Room Header */}
      {selectedRoom && (
        <div className="px-6 py-3 bg-blue-100 border-b border-blue-200">
          <h2 className="text-lg font-bold text-blue-800 flex items-center">
            <span className="mr-2">🏠</span>
            {selectedRoom}
          </h2>
          <p className="text-sm text-blue-600">Power devices for this room</p>
        </div>
      )}

      {/* Header with controls */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Power Devices Summary
            </h2>
            <p className="text-sm text-gray-600">
              {data.length} device{data.length !== 1 ? "s" : ""} configured
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={groupByRoom}
                onChange={(e) => setGroupByRoom(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Group by Room</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {renderTableHeader()}
          <tbody>
            {Object.entries(groupedData).map(([groupName, groupData]) => (
              <React.Fragment key={groupName}>
                {groupByRoom &&
                  groupName !== "All Devices" &&
                  renderGroupHeader(groupName, groupData)}
                {groupData.map((item, index) => renderTableRow(item, index))}
              </React.Fragment>
            ))}
            {data.length > 0 && renderSummaryRow()}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">⚡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No power devices configured
          </h3>
          <p className="text-gray-600">
            Add switches and sockets using the form above to see them here.
          </p>
        </div>
      )}

      {/* Quick stats */}
      {data.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.length}
              </div>
              <div className="text-gray-600">Device Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totals.totalQuantity}
              </div>
              <div className="text-gray-600">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(totals.totalLoad / 1000).toFixed(1)}k
              </div>
              <div className="text-gray-600">Total Load (kW)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwitchSocketSummaryTable;
