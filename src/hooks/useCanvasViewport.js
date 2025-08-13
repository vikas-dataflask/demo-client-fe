import { useState, useEffect, useCallback } from 'react';

const CANVAS_WIDTH = 10000; // 100m * 100px/m
const CANVAS_HEIGHT = 6000; // 60m * 100px/m
const GRID_SIZE = 100; // 1m = 100px

export const useCanvasViewport = (options = {}) => {
  const {
    initialScale = 1,
    minScale = 0.01,
    maxScale = 3,
    scaleBy = 1.05,
    containerWidth = window.innerWidth - 440, // Default sidebar width
    containerHeight = window.innerHeight - 80, // Default header height
    autoFitOnMount = true,
    fitTarget = 'canvas' // 'canvas' or 'content'
  } = options;

  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [measurementStartPoint, setMeasurementStartPoint] = useState(null);

  // Calculate fit-to-screen scale
  const calculateFitScale = useCallback((targetWidth, targetHeight) => {
    const scaleX = containerWidth / targetWidth;
    const scaleY = containerHeight / targetHeight;
    return Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
  }, [containerWidth, containerHeight]);

  // Fit canvas to viewport
  const fitCanvas = useCallback(() => {
    const newScale = calculateFitScale(CANVAS_WIDTH, CANVAS_HEIGHT);
    setBaseScale(newScale);
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
    return newScale;
  }, [calculateFitScale]);

  // Fit content to viewport (for content-based fitting)
  const fitContent = useCallback((contentBounds) => {
    if (!contentBounds) return;
    
    const { minX, minY, maxX, maxY } = contentBounds;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const newScale = calculateFitScale(contentWidth, contentHeight);
    setBaseScale(newScale);
    setScale(newScale);
    
    // Center the content
    const centerX = (containerWidth - contentWidth * newScale) / 2 - minX * newScale;
    const centerY = (containerHeight - contentHeight * newScale) / 2 - minY * newScale;
    setPosition({ x: centerX, y: centerY });
    
    return newScale;
  }, [calculateFitScale, containerWidth, containerHeight]);

  // Zoom in
  const zoomIn = useCallback(() => {
    const newScale = Math.min(maxScale, scale * 1.2);
    setScale(newScale);
  }, [scale, maxScale]);

  // Zoom out
  const zoomOut = useCallback(() => {
    const newScale = Math.max(minScale, scale / 1.2);
    setScale(newScale);
  }, [scale, minScale]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setBaseScale(1);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e, pointer) => {
    e.evt.preventDefault();
    
    const oldScale = scale;
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  }, [scale, position, scaleBy, minScale, maxScale]);

  // Pan canvas
  const panCanvas = useCallback((deltaX, deltaY) => {
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  // Get zoom percentage
  const getZoomPercentage = useCallback(() => {
    return Math.round((scale / baseScale) * 100);
  }, [scale, baseScale]);

  // Measurement tools
  const toggleMeasurementMode = useCallback(() => {
    setIsMeasuring(prev => !prev);
    if (isMeasuring) {
      setCurrentMeasurement(null);
      setMeasurementStartPoint(null);
    }
  }, [isMeasuring]);

  const handleMeasurementClick = useCallback((point) => {
    if (!isMeasuring) return;

    if (!measurementStartPoint) {
      setMeasurementStartPoint(point);
      setCurrentMeasurement({
        startPoint: point,
        endPoint: point,
        measurement: '0'
      });
    } else {
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(point.x - measurementStartPoint.x, 2) + 
        Math.pow(point.y - measurementStartPoint.y, 2)
      );
      
      const newMeasurement = {
        startPoint: measurementStartPoint,
        endPoint: point,
        measurement: distance.toFixed(2)
      };
      
      setMeasurements(prev => [...prev, newMeasurement]);
      setCurrentMeasurement(null);
      setMeasurementStartPoint(null);
    }
  }, [isMeasuring, measurementStartPoint]);

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setCurrentMeasurement(null);
    setMeasurementStartPoint(null);
  }, []);

  // Initialize fit-to-screen on mount
  useEffect(() => {
    if (autoFitOnMount) {
      if (fitTarget === 'canvas') {
        fitCanvas();
      }
    }
  }, [autoFitOnMount, fitTarget, fitCanvas]);

  return {
    // State
    scale,
    position,
    baseScale,
    isMeasuring,
    measurements,
    currentMeasurement,
    measurementStartPoint,
    
    // Actions
    setScale,
    setPosition,
    setBaseScale,
    zoomIn,
    zoomOut,
    resetZoom,
    fitCanvas,
    fitContent,
    handleWheel,
    panCanvas,
    getZoomPercentage,
    
    // Measurement tools
    toggleMeasurementMode,
    handleMeasurementClick,
    clearMeasurements,
    
    // Constants
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_SIZE
  };
}; 