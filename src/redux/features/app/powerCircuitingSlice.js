import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Power Zone management (completely separate from lighting zones)
  selectedPowerZone: null,
  powerZoneManagement: [], // Array of power zone objects with id, name, rooms, type: 'power'
  
  // Power Circuit management
  powerCircuitingByZone: {}, // { zoneId: { summary: {}, circuits: [] } }
  
  // Power Distribution Boards
  powerDistributionBoards: {
    'PDB1': { name: 'PDB1', label: 'Power DB Main', circuits: [] },
    'PDB2': { name: 'PDB2', label: 'Power DB Sub', circuits: [] },
    'PDB3': { name: 'PDB3', label: 'Power DB Emergency', circuits: [] }
  },
  
  // UI state
  isLoading: false,
  error: null,
  
  // Power phase colors
  powerPhaseColors: {
    'R': '#FF4444', // Red
    'Y': '#FFAA00', // Yellow/Orange
    'B': '#4444FF'  // Blue
  }
};

const powerCircuitingSlice = createSlice({
  name: "powerCircuiting",
  initialState,
  reducers: {
    // Power Zone management
    setSelectedPowerZone: (state, action) => {
      state.selectedPowerZone = action.payload;
    },
    setPowerZoneManagement: (state, action) => {
      state.powerZoneManagement = action.payload;
    },
    
    // Power Circuit management
    generatePowerCircuits: (state, action) => {
      const { zoneId, devices } = action.payload;
      
      if (!devices || devices.length === 0) {
        return;
      }

      // Calculate circuits based on power devices
      const maxDevicesPerCircuit = 12;
      const circuits = [];
      let currentCircuit = 1;
      let currentBatch = 1;
      let devicesInCurrentCircuit = 0;
      const phases = ['R', 'Y', 'B'];
      let currentPhaseIndex = 0;

      // Extract zone number from zone ID (e.g., "power-zone-1" -> "1" or "power-zone-1755075887128" -> "1")
      const zoneMatch = zoneId.match(/power-zone-(\d+)/i);
      let zoneNumber = 1; // Default to 1
      
      if (zoneMatch) {
        const extractedNumber = parseInt(zoneMatch[1]);
        // If it's a timestamp (very large number), use 1, otherwise use the extracted number
        if (extractedNumber > 1000) {
          zoneNumber = 1; // Use 1 for timestamp-based IDs
        } else {
          zoneNumber = extractedNumber; // Use the actual zone number
        }
      }
      
      const zoneIdentifier = `PZ${zoneNumber}`;

      // Flatten devices by quantity - this is the key fix for quantity handling
      const flattenedDevices = [];
      devices.forEach(device => {
        for (let i = 0; i < device.quantity; i++) {
          flattenedDevices.push({
            name: device.name,
            room: device.room,
            watt: device.watt,
            originalDevice: device
          });
        }
      });

      // Assign devices to circuits
      flattenedDevices.forEach((device, index) => {
        // Check if we need a new circuit (max 12 devices per circuit)
        if (devicesInCurrentCircuit >= 12) {
          currentCircuit++;
          currentBatch = 1;
          devicesInCurrentCircuit = 0;
          currentPhaseIndex = 0;
        }

        // Generate label: PZ{zoneNumber}/C{circuitNumber}/{batchNumber}{phase}{phaseNumber}
        // Following the same logic as lighting circuiting
        const circuitNumber = Math.floor(index / 12) + 1;
        const positionInCircuit = index % 12;
        const batchNumber = Math.floor(positionInCircuit / 3) + 1;
        const phaseIndex = positionInCircuit % 3;
        const phase = phases[phaseIndex];
        const phaseNum = 1;
        
        const label = `${zoneIdentifier}/C${circuitNumber}/${batchNumber}${phase}${phaseNum}`;
        
        const circuitDevice = {
          label,
          name: device.name,
          room: device.room,
          watt: device.watt,
          circuitNumber: currentCircuit,
          batchNumber: currentBatch,
          phase: phases[currentPhaseIndex],
          deviceIndex: index + 1
        };

        // Add to current circuit
        if (!circuits[currentCircuit - 1]) {
          circuits[currentCircuit - 1] = {
            circuitNumber: currentCircuit,
            devices: [],
            totalDevices: 0,
            totalWattage: 0,
            phases: { R: 0, Y: 0, B: 0 }
          };
        }

        circuits[currentCircuit - 1].devices.push(circuitDevice);
        circuits[currentCircuit - 1].totalDevices++;
        circuits[currentCircuit - 1].totalWattage += device.watt;
        circuits[currentCircuit - 1].phases[phases[currentPhaseIndex]]++;

        // Update counters
        devicesInCurrentCircuit++;
        currentPhaseIndex = (currentPhaseIndex + 1) % 3;
        
        // Update batch number every 3 devices (R, Y, B cycle)
        if (currentPhaseIndex === 0) {
          currentBatch++;
        }
      });

      // Calculate summary
      const totalCircuits = circuits.length;
      const totalDevices = flattenedDevices.length;
      const totalWattage = flattenedDevices.reduce((sum, device) => sum + device.watt, 0);

      const summary = {
        zoneId,
        totalCircuits,
        totalDevices,
        totalWattage,
        averageWattagePerCircuit: totalCircuits > 0 ? Math.round(totalWattage / totalCircuits) : 0,
        circuits: circuits,
        generatedAt: new Date().toISOString()
      };

      // Store in state
      state.powerCircuitingByZone[zoneId] = {
        circuits: circuits,
        summary: summary
      };
    },
    
    clearZoneCircuits: (state, action) => {
      const zoneId = action.payload;
      delete state.powerCircuitingByZone[zoneId];
    },
    
    clearAllPowerCircuits: (state) => {
      state.powerCircuitingByZone = {};
    },
    
    // Power Distribution Board management
    setPowerDistributionBoards: (state, action) => {
      state.powerDistributionBoards = action.payload;
    },
    
    updatePowerDistributionBoard: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.powerDistributionBoards[id]) {
        state.powerDistributionBoards[id] = { ...state.powerDistributionBoards[id], ...updates };
      }
    },
    
    // UI state
    setPowerLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setPowerError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear all power circuiting data
    clearPowerCircuiting: (state) => {
      state.selectedPowerZone = null;
      state.powerZoneManagement = [];
      state.powerCircuitingByZone = {};
      state.isLoading = false;
      state.error = null;
    },
    
    // Migrate existing zones to new format
    migratePowerZones: (state) => {
      const updatedZones = state.powerZoneManagement.map((zone, index) => {
        // Check if zone ID is timestamp-based (very large number)
        const zoneMatch = zone.id.match(/power-zone-(\d+)/);
        if (zoneMatch) {
          const extractedNumber = parseInt(zoneMatch[1]);
          if (extractedNumber > 1000) {
            // Convert to new sequential format
            return {
              ...zone,
              id: `power-zone-${index + 1}`
            };
          }
        }
        return zone;
      });
      
      state.powerZoneManagement = updatedZones;
      
      // Also update any existing circuiting data with new zone IDs
      const updatedCircuiting = {};
      Object.entries(state.powerCircuitingByZone).forEach(([oldZoneId, data]) => {
        const zoneMatch = oldZoneId.match(/power-zone-(\d+)/);
        if (zoneMatch) {
          const extractedNumber = parseInt(zoneMatch[1]);
          if (extractedNumber > 1000) {
            // Find the corresponding zone in the updated zones array
            const zoneIndex = state.powerZoneManagement.findIndex(z => z.name === data.summary?.zoneName || '');
            if (zoneIndex !== -1) {
              const newZoneId = `power-zone-${zoneIndex + 1}`;
              updatedCircuiting[newZoneId] = data;
            }
          } else {
            updatedCircuiting[oldZoneId] = data;
          }
        } else {
          updatedCircuiting[oldZoneId] = data;
        }
      });
      
      state.powerCircuitingByZone = updatedCircuiting;
    }
  },
});

export const {
  setSelectedPowerZone,
  setPowerZoneManagement,
  generatePowerCircuits,
  clearZoneCircuits,
  clearAllPowerCircuits,
  setPowerDistributionBoards,
  updatePowerDistributionBoard,
  setPowerLoading,
  setPowerError,
  clearPowerCircuiting,
  migratePowerZones
} = powerCircuitingSlice.actions;

export default powerCircuitingSlice.reducer;
