# Power Circuiting System

## Overview

The Power Circuiting System is a comprehensive solution for automatically generating electrical circuits for power devices in different zones of a building. It follows the same RYB phasing logic as the existing Lighting Circuiting system but is specifically designed for power devices like switches, sockets, dimmers, and USB outlets.

## Features

### 🔌 **Device Management**
- Support for multiple power device types (Switch, Socket, Dimmer, USB Socket, Timer Switch)
- Automatic wattage calculation based on device type and rating
- Quantity-based device grouping per room and zone

### ⚡ **Circuit Generation**
- **RYB Phasing**: Red → Yellow → Blue phase sequence
- **12-Device Limit**: Maximum 4 devices per phase per circuit
- **Automatic Circuiting**: New circuits created when limit is reached
- **Smart Labeling**: Unique circuit labels for easy identification

### 🏗️ **Zone-Based Organization**
- Zone selection for targeted circuit generation
- Room-based device grouping within zones
- Automatic device discovery from existing power device data

### 📊 **Comprehensive Reporting**
- Circuit summary with device counts and wattage totals
- Phase distribution analysis (R, Y, B counts)
- Sortable and filterable device tables
- Global statistics across all zones

## Technical Implementation

### Redux State Structure

```javascript
// powerCircuitingSlice.js
const initialState = {
  powerCircuitingByZone: {}, // { zoneId: { circuits: [], summary: {} } }
  totalCircuits: 0,
  totalDevices: 0,
  lastUpdated: null,
};
```

### Circuit Generation Algorithm

```javascript
// Core circuiting logic
const generatePowerCircuits = (zoneId, devices) => {
  let currentCircuit = 1;
  let currentBatch = 1;
  let devicesInCurrentCircuit = 0;
  const phases = ['R', 'Y', 'B'];
  let currentPhaseIndex = 0;

  // Process each device
  devices.forEach((device, index) => {
    // Check circuit limit (12 devices max)
    if (devicesInCurrentCircuit >= 12) {
      currentCircuit++;
      currentBatch = 1;
      devicesInCurrentCircuit = 0;
      currentPhaseIndex = 0;
    }

    // Generate label: PZ{zoneId}/C{circuitNumber}/{batchNumber}{phase}1
    const label = `PZ${zoneId}/C${currentCircuit}/${currentBatch}${phases[currentPhaseIndex]}1`;
    
    // Assign to circuit and update counters
    // ... implementation details
  });
};
```

### Labeling System

**Format**: `PZ{zoneId}/C{circuitNumber}/{batchNumber}{phase}1`

**Examples**:
- `PZ1/C1/1R1` - Zone 1, Circuit 1, Batch 1, Red Phase, Device 1
- `PZ1/C1/1Y1` - Zone 1, Circuit 1, Batch 1, Yellow Phase, Device 1
- `PZ1/C1/1B1` - Zone 1, Circuit 1, Batch 1, Blue Phase, Device 1
- `PZ1/C1/2R1` - Zone 1, Circuit 1, Batch 2, Red Phase, Device 1

## Components

### 1. PowerCircuitingControlPanel
- Zone selection dropdown
- Device summary display
- Circuit generation controls
- Zone-specific statistics

### 2. PowerCircuitingSummaryDisplay
- Comprehensive device table
- Sortable columns (Label, Name, Room, Wattage, Circuit, Phase, Zone)
- Zone filtering
- Phase distribution statistics

### 3. PowerCircuitingPage
- Main page with tabbed interface
- Control Panel and Summary tabs
- Information panels and quick actions
- Technical specifications

### 4. PowerCircuitingDemo
- Example data demonstration
- One-click circuit generation
- Educational information about the system

## Usage Flow

### Step 1: Access Power Circuiting
Navigate to the Power Circuiting page from the Electrical section.

### Step 2: Select Zone
Choose a zone from the dropdown to generate circuits for.

### Step 3: Review Devices
The system automatically discovers power devices in the selected zone and displays:
- Device types and quantities
- Total wattage calculations
- Room distribution

### Step 4: Generate Circuits
Click "Generate Power Circuits" to create the circuiting plan.

### Step 5: View Results
Switch to the "Circuit Summary" tab to see:
- All generated circuits
- Device assignments
- Phase distribution
- Total statistics

## Circuiting Rules

### Phase Distribution
- **R Phase**: Red phase devices (max 4 per circuit)
- **Y Phase**: Yellow phase devices (max 4 per circuit)
- **B Phase**: Blue phase devices (max 4 per circuit)
- **Sequence**: R → Y → B → R → Y → B...

### Circuit Limits
- **Maximum Devices**: 12 per circuit
- **Phase Balance**: 4 devices per phase
- **Automatic Incrementation**: New circuit when limit reached

### Batch Numbering
- Increments every 3 devices (R, Y, B cycle)
- Resets to 1 for each new circuit
- Provides organizational structure

## Data Persistence

### Redux Persist
- All circuiting data automatically saved to localStorage
- Survives page refreshes and browser sessions
- Separate storage key: `powerCircuitingState`

### State Management
- Automatic state hydration on app startup
- Safe state merging with default values
- Error handling for corrupted localStorage data

## Integration Points

### Power Devices
- Reads from `state.power.devices` Redux store
- Automatically groups devices by room and zone
- Calculates wattage based on device specifications

### Room Management
- Integrates with existing room/zone system
- Supports both `state.rooms.rooms` and `state.newRooms.rooms`
- Automatic zone detection from room data

### Existing Systems
- **Non-intrusive**: Doesn't affect lighting circuiting
- **Separate State**: Independent Redux slice
- **Consistent UI**: Follows existing design patterns

## Example Data

### Input Format
```javascript
const devices = [
  { name: "Switch 6A", quantity: 2, room: "Room1", watt: 60 },
  { name: "Socket 5A", quantity: 3, room: "Room1", watt: 40 },
  { name: "USB Socket", quantity: 1, room: "Room1", watt: 1150 }
];
```

### Output Format
```javascript
const circuitDevice = {
  label: "PZ1/C1/1R1",
  name: "Switch 6A",
  room: "Room1",
  watt: 60,
  circuitNumber: 1,
  batchNumber: 1,
  phase: "R",
  deviceIndex: 1
};
```

## Error Handling

### State Safety
- Defensive programming in all Redux reducers
- Automatic array/object initialization
- Graceful handling of missing data

### User Feedback
- Clear error messages for invalid operations
- Confirmation dialogs for destructive actions
- Success notifications for completed operations

## Performance Considerations

### Optimization
- Memoized calculations for large device sets
- Efficient state updates with Redux Toolkit
- Minimal re-renders with React best practices

### Scalability
- Handles hundreds of devices efficiently
- Automatic circuit generation for large zones
- Responsive UI for complex projects

## Future Enhancements

### Planned Features
- **Circuit Optimization**: Load balancing algorithms
- **Export Functionality**: PDF/Excel circuit reports
- **Visual Circuit Diagrams**: Interactive circuit layouts
- **Load Calculations**: Advanced electrical load analysis

### Integration Opportunities
- **Breaker Sizing**: Automatic circuit breaker recommendations
- **Cable Sizing**: Wire gauge calculations
- **Cost Estimation**: Material and labor estimates

## Troubleshooting

### Common Issues
1. **No devices found**: Ensure power devices exist in the selected zone
2. **Circuits not generating**: Check Redux store and console for errors
3. **Data not persisting**: Verify Redux persist configuration

### Debug Information
- Redux DevTools integration for state inspection
- Console logging for circuit generation process
- Error boundaries for graceful failure handling

## Conclusion

The Power Circuiting System provides a robust, automated solution for electrical circuit planning that follows industry standards and best practices. It seamlessly integrates with existing power device management while maintaining the same high-quality user experience as the lighting circuiting system.

For technical support or feature requests, refer to the development team or create an issue in the project repository.
