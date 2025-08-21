import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pixelsPerMeter: 100, // Default: 100px = 1m (existing scale)
  isCalibrated: false, // Whether user has calibrated the canvas
  calibrationPoints: [], // Array of two points for calibration
  isCalibrating: false, // Whether currently in calibration mode
  calibrationDistance: null, // Real-world distance entered by user
  lastCalibratedAt: null, // Timestamp of last calibration
};

const calibrationSlice = createSlice({
  name: "calibration",
  initialState,
  reducers: {
    // Start calibration mode
    startCalibration: (state) => {
      state.isCalibrating = true;
      state.calibrationPoints = [];
      state.calibrationDistance = null;
    },
    
    // Exit calibration mode
    exitCalibration: (state) => {
      state.isCalibrating = false;
      state.calibrationPoints = [];
      state.calibrationDistance = null;
    },
    
    // Add calibration point
    addCalibrationPoint: (state, action) => {
      const { x, y } = action.payload;
      if (state.calibrationPoints.length < 2) {
        state.calibrationPoints.push({ x, y });
      }
    },
    
    // Clear calibration points
    clearCalibrationPoints: (state) => {
      state.calibrationPoints = [];
    },
    
    // Set calibration distance and calculate ratio
    setCalibrationDistance: (state, action) => {
      const realWorldDistance = action.payload; // in meters
      state.calibrationDistance = realWorldDistance;
      
      if (state.calibrationPoints.length === 2) {
        // Calculate pixel distance between points
        const [point1, point2] = state.calibrationPoints;
        const pixelDistance = Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
        );
        
        // Calculate new pixels per meter ratio
        state.pixelsPerMeter = pixelDistance / realWorldDistance;
        state.isCalibrated = true;
        state.lastCalibratedAt = new Date().toISOString();
        state.isCalibrating = false;
      }
    },
    
    // Reset calibration to default
    resetCalibration: (state) => {
      state.pixelsPerMeter = 100; // Default: 100px = 1m
      state.isCalibrated = false;
      state.calibrationPoints = [];
      state.isCalibrating = false;
      state.calibrationDistance = null;
      state.lastCalibratedAt = null;
    },
    
    // Set pixels per meter directly (for testing or manual override)
    setPixelsPerMeter: (state, action) => {
      state.pixelsPerMeter = action.payload;
      state.isCalibrated = true;
      state.lastCalibratedAt = new Date().toISOString();
    },
  },
});

export const {
  startCalibration,
  exitCalibration,
  addCalibrationPoint,
  clearCalibrationPoints,
  setCalibrationDistance,
  resetCalibration,
  setPixelsPerMeter,
} = calibrationSlice.actions;

// Selectors
export const selectPixelsPerMeter = (state) => state.calibration.pixelsPerMeter;
export const selectIsCalibrated = (state) => state.calibration.isCalibrated;
export const selectIsCalibrating = (state) => state.calibration.isCalibrating;
export const selectCalibrationPoints = (state) => state.calibration.calibrationPoints;
export const selectCalibrationDistance = (state) => state.calibration.calibrationDistance;
export const selectLastCalibratedAt = (state) => state.calibration.lastCalibratedAt;

export default calibrationSlice.reducer;
