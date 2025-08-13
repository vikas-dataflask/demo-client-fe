import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCircuits, setCircuitMapping, setLoading, setError } from '../../redux/features/app/circuitingSlice';

const RoomSelectionPanel = ({ onCircuitsGenerated, maxLoad, phaseMethod, forceRegenerate, onSettingsChange }) => {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.newRooms?.rooms || []);
  const lightsByRoom = useSelector((state) => state.lighting.lightsByRoom);
  const selectedZone = useSelector((state) => state.circuiting.selectedZone);
  
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [localMaxLoad, setLocalMaxLoad] = useState(maxLoad || 1500);
  const [localPhaseMethod, setLocalPhaseMethod] = useState(phaseMethod || 'balanced');
  const [localForceRegenerate, setLocalForceRegenerate] = useState(forceRegenerate || false);

  // Update parent settings when local settings change
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        maxLoad: localMaxLoad,
        phaseMethod: localPhaseMethod,
        forceRegenerate: localForceRegenerate
      });
    }
  }, [localMaxLoad, localPhaseMethod, localForceRegenerate, onSettingsChange]);

  // Get rooms for selected zone
  const zoneRooms = selectedZone 
    ? rooms.filter(room => room.id === selectedZone.id)
    : rooms;

  const handleRoomToggle = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRooms(zoneRooms.map(room => room.id));
  };

  const handleSelectNone = () => {
    setSelectedRooms([]);
  };

  const handleGenerateCircuits = async () => {
    if (selectedRooms.length === 0) {
      dispatch(setError('Please select at least one room'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Simulate circuit generation (replace with actual API call)
      const circuits = [];
      let circuitId = 1;

      selectedRooms.forEach(roomId => {
        const roomLights = lightsByRoom[roomId]?.lights || [];
        if (roomLights.length === 0) return;

        // Group fixtures into circuits based on max load
        let currentLoad = 0;
        let currentCircuit = {
          circuitId: `CIRC-${String(circuitId).padStart(3, '0')}`,
          fixtures: [],
          load: 0,
          zone: selectedZone?.name || 'Unknown',
          isEmergency: false
        };

        roomLights.forEach(light => {
          const fixtureLoad = light.wattage || 18; // Default 18W per fixture
          
          if (currentLoad + fixtureLoad > localMaxLoad) {
            // Start new circuit
            if (currentCircuit.fixtures.length > 0) {
              circuits.push(currentCircuit);
              circuitId++;
            }
            
            currentLoad = fixtureLoad;
            currentCircuit = {
              circuitId: `CIRC-${String(circuitId).padStart(3, '0')}`,
              fixtures: [light.fixtureId || light.id],
              load: fixtureLoad,
              zone: selectedZone?.name || 'Unknown',
              isEmergency: false
            };
          } else {
            // Add to current circuit
            currentLoad += fixtureLoad;
            currentCircuit.fixtures.push(light.fixtureId || light.id);
            currentCircuit.load = currentLoad;
          }
        });

        // Add the last circuit if it has fixtures
        if (currentCircuit.fixtures.length > 0) {
          circuits.push(currentCircuit);
          circuitId++;
        }
      });

      // Create circuit mapping
      const circuitMapping = {};
      circuits.forEach(circuit => {
        circuit.fixtures.forEach(fixtureId => {
          circuitMapping[fixtureId] = circuit.circuitId;
        });
      });

      // Update Redux state
      const circuitMap = {};
      circuits.forEach(circuit => {
        circuitMap[circuit.circuitId] = circuit;
      });

      dispatch(setCircuits(circuitMap));
      dispatch(setCircuitMapping(circuitMapping));

      if (onCircuitsGenerated) {
        onCircuitsGenerated(circuits);
      }

      console.log('✅ Circuits generated:', circuits);
    } catch (error) {
      console.error('❌ Circuit generation failed:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getRoomFixtureCount = (roomId) => {
    return lightsByRoom[roomId]?.lights?.length || 0;
  };

  const getTotalSelectedFixtures = () => {
    return selectedRooms.reduce((total, roomId) => {
      return total + getRoomFixtureCount(roomId);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Room Selection</h4>
        <span className="text-xs text-gray-500">
          {selectedRooms.length} of {zoneRooms.length} rooms selected
        </span>
      </div>

      {/* Settings */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h5 className="text-xs font-medium text-gray-700">Circuit Settings</h5>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Max Load per Circuit (W)
          </label>
          <input
            type="number"
            value={localMaxLoad}
            onChange={(e) => setLocalMaxLoad(parseInt(e.target.value) || 1500)}
            min="500"
            max="3000"
            step="100"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Phase Assignment Method
          </label>
          <select
            value={localPhaseMethod}
            onChange={(e) => setLocalPhaseMethod(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="balanced">Balanced (Load-aware)</option>
            <option value="roundRobin">Round Robin (Sequential)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="localForceRegenerate"
            checked={localForceRegenerate}
            onChange={(e) => setLocalForceRegenerate(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="localForceRegenerate" className="text-xs text-gray-600">
            Force Regenerate (Overwrite existing circuits)
          </label>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleSelectAll}
          className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Select All
        </button>
        <button
          onClick={handleSelectNone}
          className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Select None
        </button>
      </div>

      {/* Rooms List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {zoneRooms.map((room) => {
          const fixtureCount = getRoomFixtureCount(room.id);
          const isSelected = selectedRooms.includes(room.id);
          
          return (
            <div
              key={room.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleRoomToggle(room.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRoomToggle(room.id)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {room.name || `Room ${room.id}`}
                    </span>
                  </div>
                  <div className="ml-6 mt-1">
                    <span className="text-xs text-gray-500">
                      {fixtureCount} fixtures
                    </span>
                    {fixtureCount > 0 && (
                      <span className="text-xs text-gray-400 ml-2">
                        ~{fixtureCount * 18}W estimated load
                      </span>
                    )}
                  </div>
                </div>
                
                {fixtureCount === 0 && (
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                    No fixtures
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedRooms.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">Selection Summary</div>
          <div className="space-y-1 text-xs text-blue-700">
            <div>Selected Rooms: {selectedRooms.length}</div>
            <div>Total Fixtures: {getTotalSelectedFixtures()}</div>
            <div>Estimated Load: ~{getTotalSelectedFixtures() * 18}W</div>
            <div>Estimated Circuits: ~{Math.ceil(getTotalSelectedFixtures() * 18 / localMaxLoad)}</div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerateCircuits}
        disabled={selectedRooms.length === 0}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Generate Circuits
      </button>
    </div>
  );
};

export default RoomSelectionPanel;
