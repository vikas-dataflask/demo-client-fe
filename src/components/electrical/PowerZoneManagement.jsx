import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setPowerZoneManagement,
  migratePowerZones,
} from "../../redux/features/app/powerCircuitingSlice";
import { Trash2, Edit, Plus, X, AlertTriangle } from "lucide-react";

const PowerZoneManagement = ({
  onZoneSelect,
  selectedZone,
  zoneType = "power",
}) => {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.newRooms?.rooms || []);

  // Get power zone management data from the power-specific Redux slice
  const powerZoneManagementData = useSelector(
    (state) => state.powerCircuiting?.powerZoneManagement || []
  );

  const [newZoneName, setNewZoneName] = useState("");
  const [editingZone, setEditingZone] = useState(null);
  const [editName, setEditName] = useState("");
  const [showRoomSelector, setShowRoomSelector] = useState(null); // zoneId for which to show room selector
  const [selectedRoomToAdd, setSelectedRoomToAdd] = useState("");

  const handleCreateZone = () => {
    if (newZoneName.trim()) {
      // Find the next available zone number
      const existingZoneNumbers = powerZoneManagementData.map((zone) => {
        const match = zone.id.match(/power-zone-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });

      const nextZoneNumber =
        existingZoneNumbers.length > 0
          ? Math.max(...existingZoneNumbers) + 1
          : 1;

      const newZone = {
        id: `power-zone-${nextZoneNumber}`,
        name: newZoneName.trim(),
        rooms: [],
        type: zoneType,
      };

      // Add to existing power zones in Redux
      const updatedZones = [...powerZoneManagementData, newZone];
      dispatch(setPowerZoneManagement(updatedZones));
      setNewZoneName("");
    }
  };

  const handleMigrateZones = () => {
    if (
      window.confirm(
        "This will convert existing timestamp-based zone IDs to sequential zone IDs. This action cannot be undone. Continue?"
      )
    ) {
      dispatch(migratePowerZones());
    }
  };

  const handleClearAllZones = () => {
    if (
      window.confirm(
        `Are you sure you want to clear all ${zoneType} zones? This will remove all zone configurations and room assignments. This action cannot be undone.`
      )
    ) {
      // Clear all power zones
      dispatch(setPowerZoneManagement([]));

      if (selectedZone && selectedZone.type === zoneType) {
        onZoneSelect(null);
      }
    }
  };

  const handleDeleteZone = (zoneId) => {
    const updatedZones = powerZoneManagementData.filter(
      (zone) => zone.id !== zoneId
    );
    dispatch(setPowerZoneManagement(updatedZones));

    // Clear selection if deleted zone was selected
    if (selectedZone && selectedZone.id === zoneId) {
      onZoneSelect(null);
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setEditName(zone.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editingZone) {
      const updatedZones = powerZoneManagementData.map((zone) =>
        zone.id === editingZone.id ? { ...zone, name: editName.trim() } : zone
      );
      dispatch(setPowerZoneManagement(updatedZones));

      // Update selected zone if it was the one being edited
      if (selectedZone && selectedZone.id === editingZone.id) {
        onZoneSelect({ ...selectedZone, name: editName.trim() });
      }

      setEditingZone(null);
      setEditName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditName("");
  };

  const handleSelectZone = (zone) => {
    onZoneSelect(zone);
  };

  // Room management functions
  const handleAddRoomToZone = (zoneId) => {
    if (selectedRoomToAdd) {
      const updatedZones = powerZoneManagementData.map((zone) => {
        if (zone.id === zoneId && !zone.rooms.includes(selectedRoomToAdd)) {
          return { ...zone, rooms: [...zone.rooms, selectedRoomToAdd] };
        }
        return zone;
      });
      dispatch(setPowerZoneManagement(updatedZones));

      // Update selected zone if it was the one being modified
      if (selectedZone && selectedZone.id === zoneId) {
        const updatedZone = updatedZones.find((z) => z.id === zoneId);
        onZoneSelect(updatedZone);
      }

      setSelectedRoomToAdd("");
      setShowRoomSelector(null);
    }
  };

  const handleRemoveRoomFromZone = (zoneId, roomId) => {
    const updatedZones = powerZoneManagementData.map((zone) => {
      if (zone.id === zoneId) {
        return { ...zone, rooms: zone.rooms.filter((r) => r !== roomId) };
      }
      return zone;
    });
    dispatch(setPowerZoneManagement(updatedZones));

    // Update selected zone if it was the one being modified
    if (selectedZone && selectedZone.id === zoneId) {
      const updatedZone = updatedZones.find((z) => z.id === zoneId);
      onZoneSelect(updatedZone);
    }
  };

  // Get available rooms for a zone (rooms not already in the zone)
  const getAvailableRooms = (zoneId) => {
    const zone = powerZoneManagementData.find((z) => z.id === zoneId);
    if (!zone) return rooms;
    
    // Filter out rooms already in the zone and remove duplicates based on room.id
    const availableRooms = rooms.filter((room) => !zone.rooms.includes(room.id));
    
    // Remove duplicates by keeping only the first occurrence of each room.id
    const uniqueRooms = availableRooms.filter((room, index, self) => 
      index === self.findIndex(r => r.id === room.id)
    );
    
    return uniqueRooms;
  };

  // Get room name by ID
  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name || `Room ${roomId}` : `Room ${roomId}`;
  };

  // Check if there are timestamp-based zones that need migration
  const hasTimestampZones = powerZoneManagementData.some((zone) => {
    const zoneMatch = zone.id.match(/power-zone-(\d+)/);
    if (zoneMatch) {
      const extractedNumber = parseInt(zoneMatch[1]);
      return extractedNumber > 1000; // Timestamp-based ID
    }
    return false;
  });

  return (
    <div className="space-y-4">
      {/* Zone Creation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Create New {zoneType.charAt(0).toUpperCase() + zoneType.slice(1)} Zone
        </h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder={`Enter zone name (e.g., Ground Floor, First Floor)`}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleCreateZone()}
          />
          <button
            onClick={handleCreateZone}
            disabled={!newZoneName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Zone
          </button>
        </div>
      </div>

      {/* Zone List */}
      {powerZoneManagementData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Migration Warning */}
          {hasTimestampZones && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-700">
                  <strong>Migration Required:</strong> Some zones have
                  timestamp-based IDs that need to be converted to sequential
                  IDs for proper labeling. Click "Migrate Zones" to fix this.
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              {zoneType.charAt(0).toUpperCase() + zoneType.slice(1)} Zones
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleClearAllZones}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded border border-red-300 transition-colors"
              >
                Clear All Zones
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {powerZoneManagementData.map((zone) => (
              <div
                key={zone.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectZone(zone)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        selectedZone?.id === zone.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {zone.name}
                    </button>
                    <span className="text-xs text-gray-500">
                      ({zone.rooms.length} rooms)
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setShowRoomSelector(
                          showRoomSelector === zone.id ? null : zone.id
                        )
                      }
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      {showRoomSelector === zone.id
                        ? "Hide Rooms"
                        : "Manage Rooms"}
                    </button>
                    <button
                      onClick={() => handleEditZone(zone)}
                      className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Zone Editing */}
                {editingZone?.id === zone.id && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-yellow-300 rounded"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Room Management */}
                {showRoomSelector === zone.id && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                    <h5 className="text-xs font-medium text-gray-600 mb-2">
                      Room Management for {zone.name}
                    </h5>

                    {/* Add Room Section */}
                    <div className="mb-3">
                      <h6 className="text-xs font-medium text-gray-500 mb-2">
                        Add Room:
                      </h6>
                      <div className="flex gap-2">
                        <select
                          value={selectedRoomToAdd}
                          onChange={(e) => setSelectedRoomToAdd(e.target.value)}
                          className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">Select a room...</option>
                          {getAvailableRooms(zone.id).map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name || `Room ${room.id}`}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddRoomToZone(zone.id)}
                          disabled={!selectedRoomToAdd}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-300"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Assigned Rooms */}
                    <div>
                      <h6 className="text-xs font-medium text-gray-500 mb-1">
                        Assigned Rooms:
                      </h6>
                      {zone.rooms.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          No rooms assigned yet.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {zone.rooms.map((roomId) => (
                            <div
                              key={roomId}
                              className="flex justify-between items-center p-1 bg-green-50 rounded text-xs"
                            >
                              <span className="text-green-700">
                                {getRoomName(roomId)}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveRoomFromZone(zone.id, roomId)
                                }
                                className="px-1 py-0.5 bg-red-400 text-white rounded hover:bg-red-500 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Zones Message */}
      {powerZoneManagementData.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            No {zoneType} zones created yet. Create your first zone above.
          </p>
        </div>
      )}
    </div>
  );
};

export default PowerZoneManagement;
