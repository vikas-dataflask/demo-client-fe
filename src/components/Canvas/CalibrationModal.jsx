import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectCalibrationPoints, 
  selectIsCalibrating,
  setCalibrationDistance,
  exitCalibration 
} from '../../redux/features/app/calibrationSlice';

const CalibrationModal = () => {
  const dispatch = useDispatch();
  const calibrationPoints = useSelector(selectCalibrationPoints);
  const isCalibrating = useSelector(selectIsCalibrating);
  
  const [distance, setDistance] = useState('');
  const [unit, setUnit] = useState('m'); // meters, cm, mm, ft, in
  
  // Show modal only when we have 2 calibration points
  const shouldShowModal = isCalibrating && calibrationPoints.length === 2;
  
  // Calculate pixel distance for display
  const pixelDistance = calibrationPoints.length === 2 ? 
    Math.sqrt(
      Math.pow(calibrationPoints[1].x - calibrationPoints[0].x, 2) + 
      Math.pow(calibrationPoints[1].y - calibrationPoints[0].y, 2)
    ).toFixed(2) : 0;
  
  // Convert input distance to meters
  const convertToMeters = (value, unit) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;
    
    switch (unit) {
      case 'm': return numValue;
      case 'cm': return numValue / 100;
      case 'mm': return numValue / 1000;
      case 'ft': return numValue * 0.3048;
      case 'in': return numValue * 0.0254;
      default: return numValue;
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (distance && !isNaN(parseFloat(distance))) {
      const distanceInMeters = convertToMeters(distance, unit);
      dispatch(setCalibrationDistance(distanceInMeters));
      setDistance('');
    }
  };
  
  const handleCancel = () => {
    dispatch(exitCalibration());
    setDistance('');
  };
  
  // Auto-focus input when modal appears
  useEffect(() => {
    if (shouldShowModal) {
      const input = document.getElementById('calibration-distance-input');
      if (input) {
        input.focus();
      }
    }
  }, [shouldShowModal]);
  
  if (!shouldShowModal) return null;
  
  const [point1, point2] = calibrationPoints;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Canvas Calibration
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            You've selected two points on the canvas. Please enter the real-world distance between them.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="text-xs text-gray-500 mb-1">Selected Points:</div>
            <div className="text-sm">
              Point 1: ({point1.x.toFixed(1)}, {point1.y.toFixed(1)})
            </div>
            <div className="text-sm">
              Point 2: ({point2.x.toFixed(1)}, {point2.y.toFixed(1)})
            </div>
            <div className="text-sm font-medium text-blue-600 mt-1">
              Pixel Distance: {pixelDistance}px
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="calibration-distance-input" className="block text-sm font-medium text-gray-700 mb-1">
                Real-world Distance
              </label>
              <input
                id="calibration-distance-input"
                type="number"
                step="0.01"
                min="0.01"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter distance..."
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="m">m</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Calibrate Canvas
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-xs text-blue-800">
            <strong>Tip:</strong> Use a known measurement like a wall length, door width, or room dimension for accurate calibration.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationModal;
