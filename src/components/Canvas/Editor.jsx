import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Transformer, Text } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import {
  setFloorLength,
  setFloorWidth,
  setFloorHeight,
  setFloorArea,
  setFloorVolume,
  setFloorRect,
  setFloorBounds,
  setFloor,
  setIsDrawingFloor,
  updateFloor,
  addFloor,
  setCurrentFloorId,
} from "../../redux/features/app/floorSlice";
import EntityRender from "../../drawing/EntityRenderer";
import { 
  convertPixelsToMeters, 
  convertMetersToPixels,
  convertUnits,
  displayUnitToGridUnit,
  UNIT_CONVERSION_CONSTANTS 
} from "../../utils/unitConversion";
import CoordinateDisplay from "./CoordinateDisplay";
import { GRID_UNITS } from "../../utils/gridUtils";
import { MeasurementTools } from "../../utils/measurementTools";
import MeasurementLine from "./MeasurementLine";
import { 
  calculatePolygonArea, 
  isPointNear, 
  isCloseToStart, 
  isValidPolygon, 
  closePolygon 
} from "../../utils/polygonUtils";

const GRID_SIZE = 100;

export default function Editor({ showCoordinates = true, onFloorCreated }) {
  const stageRef = useRef(null);
  const rectRef = useRef(null);
  const trRef = useRef(null);
  const data = useSelector((state) => state.floor.floor_dxf) || {};

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  // Debug logging
  console.log("Editor Debug:", {
    hasDxfData: !!data,
    entitiesCount: entities.length,
    layersCount: layers.length,
    blocksCount: Object.keys(blocks).length,
  });

  const [scale, setScaleState] = useState(1); // Start with 100% zoom
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [floorMode, setFloorMode] = useState(true);
  const [floor, setFloor] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Measurement tool state
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [measurementStartPoint, setMeasurementStartPoint] = useState(null);

  const dispatch = useDispatch();
  const heightFromStore = useSelector((state) => state.floor.floor_height) || 3;
  const grid = useSelector((state) => state.editor.grid); // optional toggle
  const displayUnit = useSelector((state) => state.floor.scale) || "m";
  const dxfUnit = useSelector((state) => state.floor.dxf_unit) || "METERS";
  const currentFloorMode = useSelector((state) => state.floor.floorMode) || "rectangle";
  const isDrawingFloor = useSelector((state) => state.floor.isDrawingFloor) || false;
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);
  const [internalShowCoordinates, setInternalShowCoordinates] = useState(showCoordinates);

  // Floor creation state
  const [floorDrawingState, setFloorDrawingState] = useState({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    polygonPoints: [],
    previewRect: null,
    isPolygonMode: false,
    showFinishButton: false,
    finishButtonPosition: null,
  });

  // Notification state
  const [showFloorExistsNotification, setShowFloorExistsNotification] = useState(false);

  // Sync internal state with prop
  useEffect(() => {
    setInternalShowCoordinates(showCoordinates);
  }, [showCoordinates]);

  // Prevent context menu on canvas for right-click functionality
  useEffect(() => {
    const container = stageRef.current?.getStage()?.container();
    if (container) {
      const preventContextMenu = (e) => e.preventDefault();
      container.addEventListener("contextmenu", preventContextMenu);
      return () => container.removeEventListener("contextmenu", preventContextMenu);
    }
  }, []);

  // Create default floor if no floors exist
  useEffect(() => {
    if (floors.length === 0) {
      const defaultFloor = {
        id: `floor-${Date.now()}`,
        name: 'Ground Floor',
        level: 0,
        height: 3200,
        shapes: [],
        canvasSettings: {
          scale: 1,
          position: { x: 0, y: 0 },
          grid: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch(addFloor(defaultFloor));
      dispatch(setCurrentFloorId(defaultFloor.id));
    }
  }, [floors.length, dispatch]);

  // Keyboard shortcuts for zoom and polygon drawing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const newScale = Math.min(3, scale * 1.2);
        setScaleState(newScale);
      } else if (e.key === '-') {
        e.preventDefault();
        const newScale = Math.max(0.01, scale / 1.2);
        setScaleState(newScale);
      } else if (e.key === '0') {
        e.preventDefault();
        setScaleState(1);
        setPosition({ x: 0, y: 0 });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Cancel polygon drawing if in polygon mode
        if (isDrawingFloor && currentFloorMode === 'polygon') {
          if (floorDrawingState.polygonPoints.length >= 3) {
            finishPolygonDrawing();
          } else {
            cancelPolygonDrawing();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [scale, isDrawingFloor, currentFloorMode, floorDrawingState.polygonPoints.length]);

  // Update measurements when display unit changes
  useEffect(() => {
    if (measurements.length > 0) {
      const updatedMeasurements = measurements.map(measurement => {
        const distance = measurementTools.measureDistance(
          measurement.startPoint, 
          measurement.endPoint, 
          displayUnit
        );
        const formattedDistance = measurementTools.formatMeasurement(distance, displayUnit);
        
        return {
          ...measurement,
          measurement: formattedDistance,
          unit: displayUnit
        };
      });
      
      setMeasurements(updatedMeasurements);
    }
  }, [displayUnit]);

  // Auto-fit the entire 100m x 60m canvas in the viewport at 100% zoom on initial render
  useEffect(() => {
    const fitCanvasToViewport = () => {
      const browserWidth = window.innerWidth - 80; // Account for padding and margins
      const browserHeight = window.innerHeight - 160; // Account for header, padding, and margins
      
      // Calculate scale to fit the entire canvas (10000px x 6000px) in the viewport
      const scaleX = browserWidth / 10000;
      const scaleY = browserHeight / 6000;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

      setScaleState(newScale);
      setPosition({ x: 0, y: 0 });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(fitCanvasToViewport, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize measurement tools
  const measurementTools = new MeasurementTools({
    pixelsToUnits: (pixels, unit) => {
      const meters = convertPixelsToMeters(pixels);
      return convertUnits(meters, 'm', unit);
    },
    pixelAreaToUnits: (pixelArea, unit) => {
      const squareMeters = convertPixelsToMeters(Math.sqrt(pixelArea)) ** 2;
      return convertUnits(squareMeters, 'm', unit === 'sq yd' ? 'sq yd' : unit);
    }
  });

  // Floor creation functions
  const handleFloorMouseDown = (e) => {
    if (!isDrawingFloor) return;
    
    // Prevent creating floor shapes if no floor is selected
    if (!currentFloorId) {
      console.log('Editor: No floor selected, preventing floor shape creation');
      setShowFloorExistsNotification(true);
      setTimeout(() => setShowFloorExistsNotification(false), 3000);
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const transformedPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale,
    };

    if (currentFloorMode === 'rectangle') {
      setFloorDrawingState(prev => ({
        ...prev,
        isDrawing: true,
        startPoint: transformedPoint,
        currentPoint: transformedPoint,
        isPolygonMode: false,
      }));
    } else if (currentFloorMode === 'polygon') {
      const { polygonPoints } = floorDrawingState;
      
      // If this is the first point, start polygon mode
      if (polygonPoints.length === 0) {
        setFloorDrawingState(prev => ({
          ...prev,
          isPolygonMode: true,
          polygonPoints: [transformedPoint],
          startPoint: transformedPoint,
        }));
        return;
      }
      
      // Check if clicking near the first point to close polygon
      if (polygonPoints.length > 2 && isCloseToStart(transformedPoint, polygonPoints[0])) {
        finishPolygonDrawing();
        return;
      }
      
      // Add new point to polygon
      setFloorDrawingState(prev => ({
        ...prev,
        polygonPoints: [...prev.polygonPoints, transformedPoint],
        showFinishButton: prev.polygonPoints.length >= 2, // Show finish button after 3+ points
        finishButtonPosition: transformedPoint,
      }));
    }
  };

  // Handle double-click to finish polygon
  const handleFloorDoubleClick = (e) => {
    if (!isDrawingFloor || currentFloorMode !== 'polygon') return;
    
    const { polygonPoints } = floorDrawingState;
    if (polygonPoints.length >= 3) {
      finishPolygonDrawing();
    }
  };

  // Handle right-click to finish polygon
  const handleFloorRightClick = (e) => {
    e.preventDefault(); // Prevent context menu
    if (!isDrawingFloor || currentFloorMode !== 'polygon') return;
    
    const { polygonPoints } = floorDrawingState;
    if (polygonPoints.length >= 3) {
      console.log('Editor: Right-click detected, finishing polygon with', polygonPoints.length, 'points');
      finishPolygonDrawing();
    } else {
      console.log('Editor: Right-click detected but not enough points (', polygonPoints.length, '). Need at least 3.');
    }
  };

  // Function to finish polygon drawing
  const finishPolygonDrawing = () => {
    const { polygonPoints } = floorDrawingState;
    
    if (!isValidPolygon(polygonPoints)) {
      console.log('Editor: Invalid polygon - not enough points');
      return;
    }
    
    // Prevent creating floor shapes if no floor is selected
    if (!currentFloorId) {
      console.log('Editor: No floor selected, preventing floor shape creation');
      setShowFloorExistsNotification(true);
      setTimeout(() => setShowFloorExistsNotification(false), 3000);
      return;
    }
    
    // Close the polygon by connecting last point to first
    const closedPoints = closePolygon(polygonPoints);
    const areaInPixels = calculatePolygonArea(closedPoints);
    const areaInMeters = convertPixelsToMeters(Math.sqrt(areaInPixels)) ** 2;
    
          const floorShape = {
        id: `shape-${Date.now()}`,
        type: 'floor',
        shape: 'polygon',
        points: closedPoints,
        areaSqM: areaInMeters,
        source: 'polygon',
        floorHeight: 3.2,
        slabThickness: 200,
        material: 'RCC',
        createdAt: new Date().toISOString()
      };
      
      console.log('Editor: Creating polygon floor shape', floorShape);
      
      // Add shape to current floor
      if (currentFloor) {
        const updatedFloor = {
          ...currentFloor,
          shapes: [...(currentFloor.shapes || []), floorShape],
          updatedAt: new Date().toISOString()
        };
        dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
      }
      
      dispatch(setIsDrawingFloor(false));
      
      // Trigger properties panel opening
      if (onFloorCreated) {
        console.log('Editor: Calling onFloorCreated callback for polygon');
        onFloorCreated(floorShape);
      }
    
    // Reset drawing state
    setFloorDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      polygonPoints: [],
      previewRect: null,
      isPolygonMode: false,
      showFinishButton: false,
      finishButtonPosition: null,
    });
  };

  // Function to cancel polygon drawing
  const cancelPolygonDrawing = () => {
    console.log('Editor: Canceling polygon drawing');
    dispatch(setIsDrawingFloor(false));
    
    // Reset drawing state
    setFloorDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      polygonPoints: [],
      previewRect: null,
      isPolygonMode: false,
      showFinishButton: false,
      finishButtonPosition: null,
    });
  };

  const handleFloorMouseMove = (e) => {
    if (!isDrawingFloor) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const transformedPoint = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale,
    };

    if (currentFloorMode === 'rectangle' && floorDrawingState.isDrawing) {
      setFloorDrawingState(prev => ({
        ...prev,
        currentPoint: transformedPoint,
      }));
    } else if (currentFloorMode === 'polygon' && floorDrawingState.isPolygonMode) {
      const { polygonPoints } = floorDrawingState;
      
      // Check if cursor is near the first point for snapping
      let snapPoint = transformedPoint;
      if (polygonPoints.length >= 3 && isCloseToStart(transformedPoint, polygonPoints[0])) {
        snapPoint = polygonPoints[0];
      }
      
      // Update current point for live preview
      setFloorDrawingState(prev => ({
        ...prev,
        currentPoint: snapPoint,
        // Update finish button position
        finishButtonPosition: prev.polygonPoints.length >= 2 ? snapPoint : null,
      }));
    }
  };

  const handleFloorMouseUp = () => {
    if (!isDrawingFloor || !floorDrawingState.isDrawing || currentFloorMode !== 'rectangle') return;

    const { startPoint, currentPoint } = floorDrawingState;
    if (!startPoint || !currentPoint) return;

    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    if (width > 10 && height > 10) {
      // Prevent creating floor shapes if no floor is selected
      if (!currentFloorId) {
        console.log('Editor: No floor selected, preventing floor shape creation');
        setShowFloorExistsNotification(true);
        setTimeout(() => setShowFloorExistsNotification(false), 3000);
        return;
      }
      
      const areaInPixels = width * height;
      const areaInMeters = convertPixelsToMeters(Math.sqrt(areaInPixels)) ** 2;
      
            const floorShape = {
        id: `shape-${Date.now()}`,
        type: 'floor',
        shape: 'rectangle',
        x,
        y,
        width,
        height,
        areaSqM: areaInMeters,
        source: 'rectangle',
        floorHeight: 3.2,
        slabThickness: 200,
        material: 'RCC',
        createdAt: new Date().toISOString()
      };
    
      console.log('Editor: Creating rectangle floor shape', floorShape);
      
      // Add shape to current floor
      if (currentFloor) {
        const updatedFloor = {
          ...currentFloor,
          shapes: [...(currentFloor.shapes || []), floorShape],
          updatedAt: new Date().toISOString()
        };
        dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
      }
      
      dispatch(setIsDrawingFloor(false));
      
      // Trigger properties panel opening
      if (onFloorCreated) {
        console.log('Editor: Calling onFloorCreated callback');
        onFloorCreated(floorShape);
      }
      
      // Force a small delay to ensure Redux state is updated
      setTimeout(() => {
        console.log('Editor: Floor creation completed, checking if panel should open');
      }, 100);
    }

    setFloorDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      polygonPoints: [],
      previewRect: null,
    });
  };

  const drawGrid = (width, height) => {
    const lines = [];
    const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
    const endX =
      Math.ceil((10000 - position.x) / scale / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
    const endY =
      Math.ceil((6000 - position.y) / scale / GRID_SIZE) * GRID_SIZE;

    for (let i = startX; i <= endX; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, startY, i, endY]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }

    for (let j = startY; j <= endY; j += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${j}`}
          points={[startX, j, endX, j]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  // Measurement functions
  const toggleMeasurementMode = () => {
    setIsMeasuring(!isMeasuring);
    if (isMeasuring) {
      // Exit measurement mode
      setMeasurementStartPoint(null);
      setCurrentMeasurement(null);
    }
  };

  const handleMeasurementClick = (point) => {
    if (!isMeasuring) return;

    if (!measurementStartPoint) {
      // First click - set start point
      setMeasurementStartPoint(point);
      setCurrentMeasurement({
        startPoint: point,
        endPoint: point,
        measurement: '0.00'
      });
    } else {
      // Second click - complete measurement
      const distance = measurementTools.measureDistance(measurementStartPoint, point, displayUnit);
      const formattedDistance = measurementTools.formatMeasurement(distance, displayUnit);
      
      const newMeasurement = {
        id: Date.now(),
        startPoint: measurementStartPoint,
        endPoint: point,
        measurement: formattedDistance,
        unit: displayUnit
      };
      
      setMeasurements([...measurements, newMeasurement]);
      setMeasurementStartPoint(null);
      setCurrentMeasurement(null);
    }
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setCurrentMeasurement(null);
    setMeasurementStartPoint(null);
  };

  // Function to get mouse coordinates considering zoom and pan
  const getMouseCoordinates = (x, y) => {
    // Convert screen coordinates to world coordinates considering zoom and pan
    const worldX = (x - position.x) / scale;
    const worldY = (y - position.y) / scale;
    
    // Convert to real-world units
    const realX = convertPixelsToMeters(worldX);
    const realY = convertPixelsToMeters(worldY);
    
    // Convert to display units
    const displayX = convertUnits(realX, 'm', displayUnit);
    const displayY = convertUnits(realY, 'm', displayUnit);
    
    // Format for display
    const formatValue = (value) => {
      if (displayUnit === 'mm') {
        return value.toFixed(0);
      } else if (displayUnit === 'cm') {
        return value.toFixed(1);
      } else {
        return value.toFixed(2);
      }
    };
    
    return {
      formatted: {
        x: formatValue(displayX),
        y: formatValue(displayY)
      },
      real: { x: realX, y: realY },
      pixel: { x: worldX, y: worldY }
    };
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const minScale = 0.01;
    const maxScale = 3;

    const oldScale = scale;
    const pointer = {
      x: e.evt.offsetX,
      y: e.evt.offsetY,
    };

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

    setScaleState(newScale);
    setPosition(newPos);
  };

  const handleMouseDown = (e) => {
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    
    // Handle measurement clicks
    if (isMeasuring) {
      handleMeasurementClick(point);
      return;
    }
    
    // Handle floor creation
    if (isDrawingFloor) {
      handleFloorMouseDown(e);
      return;
    }
    
    // Handle existing floor drawing (legacy)
    if (!floorMode) return;
    setFloor({ x: point.x, y: point.y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseDoubleClick = (e) => {
    // Handle floor creation
    if (isDrawingFloor) {
      handleFloorDoubleClick(e);
      return;
    }
  };

  const handleMouseRightClick = (e) => {
    // Handle floor creation
    if (isDrawingFloor) {
      handleFloorRightClick(e);
      return;
    }
  };

  const handleMouseMove = () => {
    const stage = stageRef.current;
    const point = stage.getPointerPosition();

    // Update current measurement preview
    if (isMeasuring && measurementStartPoint && currentMeasurement) {
      const distance = measurementTools.measureDistance(measurementStartPoint, point, displayUnit);
      const formattedDistance = measurementTools.formatMeasurement(distance, displayUnit);
      
      setCurrentMeasurement({
        ...currentMeasurement,
        endPoint: point,
        measurement: formattedDistance
      });
    }

    // Handle floor creation
    if (isDrawingFloor) {
      handleFloorMouseMove({ target: { getStage: () => stage } });
      return;
    }

    // Handle existing floor drawing (legacy)
    if (!isDrawing || !floorMode) return;
    const newWidth = point.x - floor.x;
    const newHeight = point.y - floor.y;

    setFloor((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }));
  };

  const handleMouseUp = () => {
    // Handle floor creation
    if (isDrawingFloor) {
      handleFloorMouseUp();
      return;
    }

    // Handle existing floor drawing (legacy)
    if (!isDrawing) return;
    setIsDrawing(false);
    setFloorMode(false);

    // Convert pixels to meters first
    const lengthInMeters = convertPixelsToMeters(Math.abs(floor.width));
    const widthInMeters = convertPixelsToMeters(Math.abs(floor.height));
    const height = heightFromStore;
    const areaInMeters = lengthInMeters * widthInMeters;
    const volumeInMeters = areaInMeters * height;

    // Convert to display units
    const lengthInDisplayUnit = convertUnits(lengthInMeters, 'm', displayUnit);
    const widthInDisplayUnit = convertUnits(widthInMeters, 'm', displayUnit);
    const areaInDisplayUnit = convertUnits(areaInMeters, 'm', displayUnit === 'sq yd' ? 'sq yd' : displayUnit);
    const volumeInDisplayUnit = convertUnits(volumeInMeters, 'm', displayUnit);

    // Store the floor rectangle data
    const floorRect = {
      x: floor.width < 0 ? floor.x + floor.width : floor.x,
      y: floor.height < 0 ? floor.y + floor.height : floor.y,
      width: Math.abs(floor.width),
      height: Math.abs(floor.height),
    };

    dispatch(setFloorLength(lengthInDisplayUnit.toFixed(2)));
    dispatch(setFloorWidth(widthInDisplayUnit.toFixed(2)));
    dispatch(setFloorHeight(height));
    dispatch(setFloorArea(areaInDisplayUnit.toFixed(2)));
    dispatch(setFloorVolume(volumeInDisplayUnit.toFixed(2)));
    dispatch(setFloorRect(floorRect));
  };

  useEffect(() => {
    if (rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [floor]);

  return (
    <div className="h-full relative">
      <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-2">
        <div className="zoom-controls flex items-center gap-2">
          {/* Zoom Level Display */}
          <div className="text-sm font-bold text-gray-800 min-w-[50px] text-center">
            {(scale * 100).toFixed(0)}%
          </div>

          {/* Zoom Out Button */}
          <button
            onClick={() => {
              const newScale = Math.max(0.01, scale / 1.2);
              setScaleState(newScale);
            }}
            disabled={scale <= 0.01}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border border-gray-300 transition-colors"
            title="Zoom Out (Mouse wheel down)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Zoom In Button */}
          <button
            onClick={() => {
              const newScale = Math.min(3, scale * 1.2);
              setScaleState(newScale);
            }}
            disabled={scale >= 3}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border border-gray-300 transition-colors"
            title="Zoom In (Mouse wheel up)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

                                    {/* Fit All Button */}
             <button
               onClick={() => {
                 // Zoom to fit the content
                 const stage = stageRef.current;
                 if (stage && floor) {
                   const stageWidth = 10000;
                   const stageHeight = 6000;
                   const floorWidth = Math.abs(floor.width);
                   const floorHeight = Math.abs(floor.height);

                   const scaleX = (stageWidth * 0.8) / floorWidth;
                   const scaleY = (stageHeight * 0.8) / floorHeight;
                   const newScale = Math.min(scaleX, scaleY, 3);

                   setScaleState(newScale);

                   // Center the floor
                   const centerX = (stageWidth - floorWidth * newScale) / 2;
                   const centerY = (stageHeight - floorHeight * newScale) / 2;
                   setPosition({ x: centerX, y: centerY });
                 }
               }}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors text-xs"
              title="Fit all shapes in view"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Fit All</span>
            </button>

             {/* Fit Viewport Button */}
             <button
               onClick={() => {
                 // Zoom to fit the entire canvas in the browser window
                 const browserWidth = window.innerWidth - 40; // Account for padding
                 const browserHeight = window.innerHeight - 140; // Account for header and padding
                 
                 const scaleX = browserWidth / 10000;
                 const scaleY = browserHeight / 6000;
                 const newScale = Math.min(scaleX, scaleY, 1);

                 setScaleState(newScale);
                 setPosition({ x: 0, y: 0 });
               }}
              className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors text-xs"
              title="Fit entire canvas in browser window"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <span>Fit Window</span>
            </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              setScaleState(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 transition-colors text-xs"
            title="Reset zoom to 100%"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>



          {/* Measurement Tool */}
          <button
            onClick={toggleMeasurementMode}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors text-xs ${
              isMeasuring 
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
            }`}
            title={isMeasuring ? "Exit measurement mode" : "Start measuring distances"}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
            <span>{isMeasuring ? 'Exit' : 'Measure'}</span>
          </button>

          {/* Clear Measurements */}
          {measurements.length > 0 && (
            <button
              onClick={clearMeasurements}
              className="flex items-center gap-1 px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors text-xs"
              title="Clear all measurements"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="canvas-wrapper">
        <div className="canvas-viewport">
          <div className="canvas-container">
                        <Stage
          width={10000}
          height={6000}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDblClick={handleMouseDoubleClick}
          onContextMenu={handleMouseRightClick}

          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
        >
        {grid && (
          <Layer>{drawGrid(10000, 6000)}</Layer>
        )}

        <Layer>
                  {/* Floor Creation Preview */}
        {isDrawingFloor && currentFloorMode === 'rectangle' && floorDrawingState.isDrawing && !currentFloor && (
          <Rect
            x={Math.min(floorDrawingState.startPoint?.x || 0, floorDrawingState.currentPoint?.x || 0)}
            y={Math.min(floorDrawingState.startPoint?.y || 0, floorDrawingState.currentPoint?.y || 0)}
            width={Math.abs((floorDrawingState.currentPoint?.x || 0) - (floorDrawingState.startPoint?.x || 0))}
            height={Math.abs((floorDrawingState.currentPoint?.y || 0) - (floorDrawingState.startPoint?.y || 0))}
            fill="rgba(0, 150, 255, 0.1)"
            stroke="#1e40af"
            strokeWidth={2}
            dash={[5, 5]}
          />
        )}

          {/* Polygon Drawing */}
          {isDrawingFloor && currentFloorMode === 'polygon' && floorDrawingState.polygonPoints.length > 0 && !currentFloor && (
            <>
              {/* Polygon lines */}
              {floorDrawingState.polygonPoints.map((point, index) => {
                const nextPoint = floorDrawingState.polygonPoints[index + 1];
                if (!nextPoint) return null;
                
                return (
                  <Line
                    key={`polygon-line-${index}`}
                    points={[point.x, point.y, nextPoint.x, nextPoint.y]}
                    stroke="#1e40af"
                    strokeWidth={2}
                  />
                );
              })}
              
              {/* Live preview line from last point to current mouse position */}
              {floorDrawingState.currentPoint && floorDrawingState.polygonPoints.length > 0 && (
                <Line
                  points={[
                    floorDrawingState.polygonPoints[floorDrawingState.polygonPoints.length - 1].x,
                    floorDrawingState.polygonPoints[floorDrawingState.polygonPoints.length - 1].y,
                    floorDrawingState.currentPoint.x,
                    floorDrawingState.currentPoint.y
                  ]}
                  stroke={floorDrawingState.currentPoint === floorDrawingState.polygonPoints[0] ? "#22c55e" : "#1e40af"}
                  strokeWidth={3}
                  dash={[5, 5]}
                />
              )}
              
              {/* Snap indicator line to first point */}
              {floorDrawingState.polygonPoints.length >= 3 && 
               floorDrawingState.currentPoint && 
               floorDrawingState.currentPoint !== floorDrawingState.polygonPoints[0] &&
               isCloseToStart(floorDrawingState.currentPoint, floorDrawingState.polygonPoints[0]) && (
                <>
                  <Line
                    points={[
                      floorDrawingState.currentPoint.x,
                      floorDrawingState.currentPoint.y,
                      floorDrawingState.polygonPoints[0].x,
                      floorDrawingState.polygonPoints[0].y
                    ]}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dash={[3, 3]}
                  />
                  {/* Snap indicator circle around first point */}
                  <Rect
                    x={floorDrawingState.polygonPoints[0].x - 8}
                    y={floorDrawingState.polygonPoints[0].y - 8}
                    width={16}
                    height={16}
                    fill="rgba(34, 197, 94, 0.2)"
                    stroke="#22c55e"
                    strokeWidth={2}
                    cornerRadius={8}
                  />
                </>
              )}
              
              {/* Polygon points */}
              {floorDrawingState.polygonPoints.map((point, index) => (
                <Rect
                  key={`polygon-point-${index}`}
                  x={point.x - 4}
                  y={point.y - 4}
                  width={8}
                  height={8}
                  fill={index === 0 ? "#ff6b6b" : "#1e40af"} // First point is red
                  stroke="#ffffff"
                  strokeWidth={2}
                  cornerRadius={2}
                />
              ))}
              
              {/* Current point indicator */}
              {floorDrawingState.currentPoint && 
               floorDrawingState.currentPoint !== floorDrawingState.polygonPoints[floorDrawingState.polygonPoints.length - 1] && (
                <Rect
                  x={floorDrawingState.currentPoint.x - 3}
                  y={floorDrawingState.currentPoint.y - 3}
                  width={6}
                  height={6}
                  fill={floorDrawingState.currentPoint === floorDrawingState.polygonPoints[0] ? "#22c55e" : "#f59e0b"}
                  stroke="#ffffff"
                  strokeWidth={1}
                  cornerRadius={1}
                />
              )}
              
              {/* Right-click hint */}
              {floorDrawingState.polygonPoints.length >= 3 && (
                <>
                  <Rect
                    x={floorDrawingState.currentPoint?.x - 40 || 0}
                    y={(floorDrawingState.currentPoint?.y || 0) - 50}
                    width={80}
                    height={20}
                    fill="rgba(0, 0, 0, 0.8)"
                    stroke="#ffffff"
                    strokeWidth={1}
                    cornerRadius={3}
                  />
                  <Text
                    x={floorDrawingState.currentPoint?.x - 35 || 0}
                    y={(floorDrawingState.currentPoint?.y || 0) - 45}
                    text="Right-click to finish"
                    fontSize={10}
                    fill="#ffffff"
                    fontFamily="Arial"
                  />
                </>
              )}
              
              {/* Finish button */}
              {floorDrawingState.showFinishButton && floorDrawingState.finishButtonPosition && (
                <Rect
                  x={floorDrawingState.finishButtonPosition.x - 25}
                  y={floorDrawingState.finishButtonPosition.y - 15}
                  width={50}
                  height={30}
                  fill="rgba(34, 197, 94, 0.9)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  cornerRadius={5}
                  onClick={finishPolygonDrawing}
                />
              )}
            </>
          )}

          {/* Current Floor Shapes Display */}
          {currentFloor && currentFloor.shapes && currentFloor.shapes.map((shape, index) => {
            if (shape.shape === 'rectangle') {
              return (
                <Rect
                  key={shape.id || index}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill="rgba(0, 150, 255, 0.1)"
                  stroke="#1e40af"
                  strokeWidth={3}
                />
              );
            } else if (shape.shape === 'polygon' && shape.points) {
              return (
                <Line
                  key={shape.id || index}
                  points={shape.points.flatMap(point => [point.x, point.y])}
                  stroke="#1e40af"
                  strokeWidth={3}
                  fill="rgba(0, 150, 255, 0.1)"
                  closed={true}
                />
              );
            }
            return null;
          })}

          {/* Legacy Floor (existing floor drawing) */}
          {floor && (
            <>
              <Rect
                ref={rectRef}
                x={floor.x}
                y={floor.y}
                width={floor.width}
                height={floor.height}
                fill="rgba(0, 150, 255, 0.1)"
                stroke="#1e40af"
                strokeWidth={3}
                draggable
                onTransformEnd={() => {
                  const node = rectRef.current;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  node.scaleX(1);
                  node.scaleY(1);

                  const newWidth = node.width() * scaleX;
                  const newHeight = node.height() * scaleY;

                  // Convert pixels to meters first
                  const newLengthInMeters = convertPixelsToMeters(newWidth);
                  const newWidthInMeters = convertPixelsToMeters(newHeight);
                  const height = heightFromStore;
                  const areaInMeters = newLengthInMeters * newWidthInMeters;
                  const volumeInMeters = areaInMeters * height;

                  // Convert to display units
                  const newLengthInDisplayUnit = convertUnits(newLengthInMeters, 'm', displayUnit);
                  const newWidthInDisplayUnit = convertUnits(newWidthInMeters, 'm', displayUnit);
                  const areaInDisplayUnit = convertUnits(areaInMeters, 'm', displayUnit === 'sq yd' ? 'sq yd' : displayUnit);
                  const volumeInDisplayUnit = convertUnits(volumeInMeters, 'm', displayUnit);

                  setFloor({
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                  });

                  dispatch(setFloorLength(newLengthInDisplayUnit.toFixed(2)));
                  dispatch(setFloorWidth(newWidthInDisplayUnit.toFixed(2)));
                  dispatch(setFloorArea(areaInDisplayUnit.toFixed(2)));
                  dispatch(setFloorVolume(volumeInDisplayUnit.toFixed(2)));

                  dispatch(
                    setFloorBounds({
                      x: node.x(),
                      y: node.y(),
                      width: newWidth,
                      height: newHeight,
                    })
                  );

                  // Update floor rectangle data
                  const updatedFloorRect = {
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                  };
                  dispatch(setFloorRect(updatedFloorRect));
                }}
                onDragEnd={(e) => {
                  setFloor((prev) => ({
                    ...prev,
                    x: e.target.x(),
                    y: e.target.y(),
                  }));

                  dispatch(
                    setFloorBounds({
                      x: e.target.x(),
                      y: e.target.y(),
                      width: floor.width,
                      height: floor.height,
                    })
                  );

                  // Update floor rectangle data on drag
                  const updatedFloorRect = {
                    x: e.target.x(),
                    y: e.target.y(),
                    width: floor.width,
                    height: floor.height,
                  };
                  dispatch(setFloorRect(updatedFloorRect));
                }}
              />
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
              />
            </>
          )}
        </Layer>

        <Layer>
          <EntityRender />
          
          {/* Render completed measurements */}
          {measurements.map((measurement) => (
            <MeasurementLine
              key={measurement.id}
              startPoint={measurement.startPoint}
              endPoint={measurement.endPoint}
              measurement={measurement.measurement}
              unit={measurement.unit}
              isActive={false}
            />
          ))}
          
          {/* Render current measurement preview */}
          {currentMeasurement && (
            <MeasurementLine
              startPoint={currentMeasurement.startPoint}
              endPoint={currentMeasurement.endPoint}
              measurement={currentMeasurement.measurement}
              unit={displayUnit}
              isActive={true}
            />
          )}
                  </Layer>
        </Stage>
        
        {/* Floating Finish Button for Polygon Drawing */}
        {isDrawingFloor && currentFloorMode === 'polygon' && floorDrawingState.polygonPoints.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${(floorDrawingState.finishButtonPosition?.x || 0) * scale + position.x + 15}px`,
              top: `${(floorDrawingState.finishButtonPosition?.y || 0) * scale + position.y - 20}px`,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {floorDrawingState.polygonPoints.length >= 3 && (
              <button
                onClick={finishPolygonDrawing}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded shadow-lg hover:bg-green-700 transition-colors"
                style={{ pointerEvents: 'auto' }}
                title="Finish drawing polygon"
              >
                Finish ({floorDrawingState.polygonPoints.length} points)
              </button>
            )}
            <button
              onClick={cancelPolygonDrawing}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded shadow-lg hover:bg-red-700 transition-colors"
              style={{ pointerEvents: 'auto' }}
              title="Cancel polygon drawing"
            >
              Cancel
            </button>
            <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
              Right-click to finish
            </div>
          </div>
        )}

        {/* Floor Exists Notification */}
        {showFloorExistsNotification && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <div className="bg-orange-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">
                Please select a floor first before creating floor shapes.
              </span>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
      
      {/* Coordinate Display */}
      <CoordinateDisplay
        getMouseCoordinates={getMouseCoordinates}
        unit={displayUnitToGridUnit(displayUnit)}
        isVisible={internalShowCoordinates}
        position="bottom-right"
        scale={scale}
        stageRef={stageRef}
      />
    </div>
  );
}
