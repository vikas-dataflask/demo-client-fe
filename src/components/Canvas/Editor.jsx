import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Stage, Layer, Rect, Line, Transformer, Text, Group, Image, Circle } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import ManualFloorEntryModal from "./ManualFloorEntryModal";
// import FloorPropertiesPanel from "./FloorPropertiesPanel";
import FloorPopupModal from "./FloorPopupModal";
import FloorFormModal from "./FloorFormModal";
import FreehandFloorModal from "./FreehandFloorModal";
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
  setFloors,
  setCurrentFloorId,
  setSelectedObject,
  setIsDrawing,
  setFirstFloorCoordinates,
  setHasDrawn,
  selectUserProjectFloors,
  selectCurrentUserId,
  selectCurrentProjectId,
} from "../../redux/features/app/floorSlice";
import { setRect } from "../../redux/features/app/FloorPlanSlice";
import EntityRender from "../../drawing/EntityRenderer";
import { 
  convertPixelsToMeters, 
  convertMetersToPixels,
  convertUnits,
  displayUnitToGridUnit,
  UNIT_CONVERSION_CONSTANTS 
} from "../../utils/unitConversion";
// import CoordinateDisplay from "./CoordinateDisplay";
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
import { 
  useGetFloorsByProjectQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation
} from "../../redux/features/api/floorRoomApi";
import { convertFloorToBackendFormat, convertFloorFromBackendFormat, createFloorInBackend } from "../../utils/floorRoomApi";
import { testApiConnection, testFloorApi } from "../../utils/testApiConnection";

const GRID_SIZE = 100;

// Utility function to convert meters to pixels (100px = 1m)


export default function Editor({ showCoordinates = true, onFloorCreated, projectId: propProjectId, isLoading = false }) {
  const stageRef = useRef(null);
  const rectRef = useRef(null);
  const trRef = useRef(null);
  const floorShapeRefs = useRef({});
  const data = useSelector((state) => state.floor.floor_dxf) || {};

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};
  
  // PNG image state for PDF conversions
  const [pngImage, setPngImage] = useState(null);
  const [pngDimensions, setPngDimensions] = useState({ width: 0, height: 0 });



  const [scale, setScaleState] = useState(1); // Start with 100% zoom
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1); // Store the initial fit-to-screen scale

  const [localFloorMode, setLocalFloorMode] = useState(true);
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
  
  // Get filtered floors and user/project info
  const userProjectFloors = useSelector(selectUserProjectFloors) || [];

  // Handle PNG image from PDF conversion
  useEffect(() => {
    if (data?.source === "pdf" && data?.png) {
      // Convert base64 or buffer to image
      const img = new window.Image();
      img.onload = () => {
        setPngDimensions({
          width: img.width,
          height: img.height
        });
        setPngImage(img);
      };
      
      // Handle different PNG data formats
      if (typeof data.png === 'string') {
        // If it's a base64 string
        img.src = data.png;
      } else if (data.png instanceof ArrayBuffer) {
        // If it's a buffer, convert to blob URL
        const blob = new Blob([data.png], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        img.src = url;
        
        // Cleanup function
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setPngImage(null);
      setPngDimensions({ width: 0, height: 0 });
    }
  }, [data]);
  const currentUserId = useSelector(selectCurrentUserId) || null;
  const currentProjectId = useSelector(selectCurrentProjectId) || null;
  const currentFloorMode = useSelector((state) => state.floor.floorMode) || "rectangle";
  const isDrawingFloor = useSelector((state) => state.floor.isDrawingFloor) || false;
  const floors = useSelector((state) => state.floor.floors) || [];
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find(f => f.id === currentFloorId);
  
  // Debug: Check if currentFloor is found correctly
  console.log('🎯 Editor: Floor selection debug:', {
    totalFloors: floors.length,
    currentFloorId,
    currentFloorFound: !!currentFloor,
    currentFloor: currentFloor ? {
      id: currentFloor.id,
      name: currentFloor.name,
      shapesCount: currentFloor.shapes?.length || 0,
      hasShapes: !!currentFloor.shapes && currentFloor.shapes.length > 0
    } : null,
    allFloorIds: floors.map(f => f.id)
  });
  
  // Debug logging for currentFloor selection
  console.log('🎯 Editor: Current floor selection debug:', {
    floorsCount: floors.length,
    currentFloorId,
    currentFloor: currentFloor ? { 
      id: currentFloor.id, 
      name: currentFloor.name, 
      shapesCount: currentFloor.shapes?.length || 0
    } : null
  });
  
  // Get projectId from props or URL params
  const urlProjectId = useParams().projectId;
  const projectId = propProjectId || urlProjectId;
  
  // Debug logging - moved after all variables are declared
  console.log("Editor Debug:", {
    hasDxfData: !!data,
    entitiesCount: entities.length,
    layersCount: layers.length,
    blocksCount: Object.keys(blocks).length,
    currentUserId: currentUserId || 'not-set',
    currentProjectId: currentProjectId || 'not-set',
    userProjectFloorsCount: userProjectFloors.length,
  });
  
  console.log('🎯 Editor: projectId from props:', propProjectId);
  console.log('🎯 Editor: projectId from URL params:', urlProjectId);
  console.log('🎯 Editor: final projectId:', projectId);

  // API query for fetching floor data
  const { 
    data: floorsData, 
    isLoading: floorsLoading, 
    error: floorsError,
    refetch: refetchFloors 
  } = useGetFloorsByProjectQuery(projectId, {
    skip: !projectId || projectId === 'undefined' || projectId === 'null'
  });
  console.log("floorsData______________________", floorsData);
  console.log("projectId______________________", projectId);

  
  

  // Handle API data and dispatch to Redux
  useEffect(() => {
    if (floorsData && projectId) {
      // Get current user ID for logging
      const storedUser = localStorage.getItem("user");
      let currentUserId = null;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          currentUserId = user.user_id || user._id;
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
      
      console.log('🎯 Editor: Floor data received from API for user:', currentUserId);
      console.log('🎯 Editor: Floor data received from API:', floorsData);
      
      // Handle different possible response structures
      let apiFloors = [];
      if (floorsData.data && Array.isArray(floorsData.data)) {
        apiFloors = floorsData.data;
      } else if (Array.isArray(floorsData)) {
        apiFloors = floorsData;
      } else if (floorsData.floors && Array.isArray(floorsData.floors)) {
        apiFloors = floorsData.floors;
      }
      
      console.log('🎯 Editor: Processed API floors (after frontend filtering):', apiFloors);
      console.log('🎯 Editor: Total floors available for user:', currentUserId, ':', apiFloors.length);
      
      if (apiFloors.length > 0) {
        console.log('🎯 Editor: Raw API floors before conversion:', apiFloors);
        // Convert backend format to frontend format
        const convertedFloors = apiFloors.map(floor => {
          // Convert backend shape to frontend shape format
          let shapes = [];
          if (floor.shape) {
            console.log('🎯 Editor: Converting floor shape:', floor.shape);
            console.log('🎯 Editor: Floor shape type:', floor.shape.type);
            console.log('🎯 Editor: Floor shape coordinates:', floor.shape.coordinates);
            console.log('🎯 Editor: Floor shape width/height:', { width: floor.shape.width, height: floor.shape.height });
            
            const shapeData = {
              id: `shape-${floor._id || floor.id}`,
              type: 'floor',
              shape: floor.shape.type === 'rect' ? 'rectangle' : 'polygon',
              x: (floor.shape.coordinates?.[0]?.x || 0) * 100, // Convert meters to pixels
              y: (floor.shape.coordinates?.[0]?.y || 0) * 100, // Convert meters to pixels
              width: Math.max((floor.shape.width || 0) * 100, 100), // Convert meters to pixels (100px = 1m), minimum 100px
              height: Math.max((floor.shape.height || 0) * 100, 100), // Convert meters to pixels (100px = 1m), minimum 100px
              widthInMeters: floor.shape.width || 0,
              heightInMeters: floor.shape.height || 0,
              areaSqM: (floor.shape.width || 0) * (floor.shape.height || 0),
              points: (floor.shape.coordinates || []).map(point => ({
                x: (point.x || 0) * 100, // Convert meters to pixels
                y: (point.y || 0) * 100  // Convert meters to pixels
              })),
              source: floor.source || 'api',
              floorHeight: (floor.height || 3.2) * 1000, // Convert meters to millimeters
              slabThickness: (floor.slabThickness || 0.2) * 1000, // Convert meters to millimeters
              material: floor.material || 'RCC',
              layer: floor.layer || 'A-FLOR',
              createdAt: floor.createdAt || new Date().toISOString()
            };
            console.log('🎯 Editor: Final shape data:', shapeData);
            console.log('🎯 Editor: Shape data validation:', {
              hasValidX: typeof shapeData.x === 'number' && !isNaN(shapeData.x),
              hasValidY: typeof shapeData.y === 'number' && !isNaN(shapeData.y),
              hasValidWidth: typeof shapeData.width === 'number' && !isNaN(shapeData.width) && shapeData.width > 0,
              hasValidHeight: typeof shapeData.height === 'number' && !isNaN(shapeData.height) && shapeData.height > 0,
              x: shapeData.x,
              y: shapeData.y,
              width: shapeData.width,
              height: shapeData.height
            });
            shapes.push(shapeData);
          } else {
            // Fallback: Create a default shape if no shape data is available
            console.log('🎯 Editor: No shape data found, creating fallback shape for floor:', floor.name);
            // const fallbackShapeData = {
            //   id: `shape-fallback-${floor._id || floor.id}`,
            //   type: 'floor',
            //   shape: 'rectangle',
            //   x: 100, // Default position
            //   y: 100,
            //   width: 1000, // Default size (10m x 10m)
            //   height: 1000,
            //   widthInMeters: 10,
            //   heightInMeters: 10,
            //   areaSqM: 100,
            //   points: [],
            //   source: 'fallback',
            //   floorHeight: 3200,
            //   slabThickness: 200,
            //   material: 'RCC',
            //   layer: 'A-FLOR',
            //   createdAt: floor.createdAt || new Date().toISOString()
            // };
            // console.log('🎯 Editor: Created fallback shape:', fallbackShapeData);
            // shapes.push(fallbackShapeData);
          }
          
          // Use the real MongoDB ObjectId as the floor ID
          const floorId = floor._id || floor.id;
          if (!floorId) {
            console.error('🎯 Editor: Floor missing _id:', floor);
            return null; // Skip this floor if no ID
          }
          
          return {
            id: floorId, // Use the real MongoDB ObjectId
            name: floor.name,
            level: floor.level || 0,
            height: (floor.height || 3.2) * 1000, // Convert meters to millimeters
            createdBy: floor.createdBy || null,
            projectId: floor.projectId,
            shapes: shapes,
            canvasSettings: {
              scale: 1,
              position: { x: 0, y: 0 },
              grid: true
            },
            createdAt: floor.createdAt || new Date().toISOString(),
            updatedAt: floor.updatedAt || new Date().toISOString()
          };
          console.log('🎯 Editor: Final floor data:', {
            id: floor._id || floor.id || `floor-${Date.now()}`,
            name: floor.name,
            shapesCount: shapes.length,
            shapes: shapes
          });
        });
        
        console.log('🎯 Editor: Dispatching converted floors to Redux:', convertedFloors);
        console.log('🎯 Editor: Each floor shape count:', convertedFloors.map(f => ({ 
          id: f.id, 
          name: f.name, 
          shapesCount: f.shapes?.length || 0,
          isMongoDBObjectId: /^[0-9a-fA-F]{24}$/.test(f.id)
        })));
        console.log('🎯 Editor: Floor IDs being dispatched:', convertedFloors.map(f => f.id));
        dispatch(setFloors(convertedFloors));
        
        // Debug: Check Redux state after dispatch
        setTimeout(() => {
          console.log('🎯 Editor: Redux state after dispatch - floors:', floors);
          console.log('🎯 Editor: Redux state after dispatch - currentFloorId:', currentFloorId);
          console.log('🎯 Editor: Redux state after dispatch - currentFloor:', currentFloor);
        }, 100);
        
        // Set the first floor as current if no current floor is selected or if current floor doesn't exist
        const currentFloorExists = convertedFloors.find(f => f.id === currentFloorId);
        if (!currentFloorId && convertedFloors.length > 0) {
          const firstFloor = convertedFloors[0];
          console.log('🎯 Editor: Setting first floor as current:', firstFloor.id);
          console.log('🎯 Editor: First floor MongoDB ObjectId:', firstFloor.id);
          dispatch(setCurrentFloorId(firstFloor.id)); // This will be the real MongoDB ObjectId
        } else if (currentFloorId && !currentFloorExists && convertedFloors.length > 0) {
          // If current floor doesn't exist in the loaded floors, set the first one
          const firstFloor = convertedFloors[0];
          console.log('🎯 Editor: Current floor not found, setting first floor as current:', firstFloor.id);
          console.log('🎯 Editor: New floor MongoDB ObjectId:', firstFloor.id);
          dispatch(setCurrentFloorId(firstFloor.id)); // This will be the real MongoDB ObjectId
        } else {
          console.log('🎯 Editor: Current floor ID already set:', currentFloorId);
          console.log('🎯 Editor: Current floor ID type:', typeof currentFloorId);
          console.log('🎯 Editor: Current floor ID is MongoDB ObjectId:', /^[0-9a-fA-F]{24}$/.test(currentFloorId));
        }
        
        // Fit canvas to viewport to show the floors
        setTimeout(() => {
          fitCanvasToViewport();
        }, 100);
      } else {
        console.log('🎯 Editor: No floors found in API response');
        // Clear floors if no data received
        dispatch(setFloors([]));
      }
    }
  }, [floorsData, projectId, dispatch, currentFloorId]);

  // Handle API errors
  useEffect(() => {
    if (floorsError) {
      console.error('❌ Editor: Floor API error:', floorsError);
      console.error('❌ Editor: Error details:', {
        status: floorsError.status,
        data: floorsError.data,
        message: floorsError.message
      });
    }
  }, [floorsError]);

  // Debug logging for floors data
  useEffect(() => {
    console.log('🎯 Editor: Floors data updated:', {
      floorsCount: floors?.length || 0,
      floors: floors?.map(f => ({
        id: f.id,
        name: f.name,
        isMongoDBObjectId: /^[0-9a-fA-F]{24}$/.test(f.id),
        shapesCount: f.shapes?.length || 0
      })),
      currentFloorId,
      currentFloorIdIsMongoDBObjectId: currentFloorId ? /^[0-9a-fA-F]{24}$/.test(currentFloorId) : false,
      currentFloor: currentFloor ? { 
        id: currentFloor.id, 
        name: currentFloor.name, 
        isMongoDBObjectId: /^[0-9a-fA-F]{24}$/.test(currentFloor.id),
        shapesCount: currentFloor.shapes?.length || 0,
        shapes: currentFloor.shapes
      } : null,
      projectId,
      isLoading: floorsLoading,
      apiError: floorsError
    });
  }, [floors, currentFloorId, currentFloor, projectId, floorsLoading, floorsError]);
  const selectedObject = useSelector((state) => state.floor.selectedObject);
  const isDrawingFromRedux = useSelector((state) => state.floor.isDrawing) || false;
  const firstFloorCoordinates = useSelector((state) => state.floor.firstFloorCoordinates);
  const hasDrawn = useSelector((state) => state.floor.hasDrawn) || false;
    const [internalShowCoordinates, setInternalShowCoordinates] = useState(showCoordinates);

  // API hooks for floor operations
  const [createFloor] = useCreateFloorMutation();
  const [updateFloor] = useUpdateFloorMutation();

  // Floor creation state (simplified like room creation)
  const [isDrawingFloorLocal, setIsDrawingFloorLocal] = useState(false);
  const [floorStartPoint, setFloorStartPoint] = useState(null);
  const [floorCurrentPoint, setFloorCurrentPoint] = useState(null);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [newlyCreatedFloor, setNewlyCreatedFloor] = useState(null);
  const [showFreehandFloorModal, setShowFreehandFloorModal] = useState(false);
  const [freehandFloorData, setFreehandFloorData] = useState(null);
  
  // Legacy floor drawing state (for polygon mode)
  const [floorDrawingState, setFloorDrawingState] = useState({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    polygonPoints: [],
    previewRect: null,
    isPolygonMode: false,
    showFinishButton: false,
    finishButtonPosition: null,
    drawingMode: 'rectangle', // 'rectangle', 'polygon', 'manual'
  });

  // Notification state
  const [showFloorExistsNotification, setShowFloorExistsNotification] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [showFloorPopupModal, setShowFloorPopupModal] = useState(false);
  const [newlyCreatedFloorData, setNewlyCreatedFloorData] = useState(null);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [liveDimensions, setLiveDimensions] = useState({ width: 0, height: 0 });
  const [isDraggingFloor, setIsDraggingFloor] = useState(false);

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

  // Create default floor if no floors exist and we're not loading from API
  useEffect(() => {
    if (floors.length === 0 && !floorsLoading && !projectId && !floorsData) {
      console.log('🏗️ Editor: Creating default floor since no floors exist and no project ID');
      const defaultFloor = {
        id: `floor-${Date.now()}`, // Only use dummy ID when no project context
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
    } else if (floors.length === 0 && !floorsLoading && projectId && !floorsData) {
      console.log('🏗️ Editor: No floors found for project, waiting for API response');
      // Don't create dummy floors when we have a project - wait for API
    }
  }, [floors.length, floorsLoading, projectId, floorsData, dispatch]);

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

      setBaseScale(newScale); // Store the base scale for zoom percentage calculation
      setScaleState(newScale);
      setPosition({ x: 0, y: 0 });
      
      // Apply zoom and position to stage
      if (stageRef.current) {
        stageRef.current.scale({ x: newScale, y: newScale });
        stageRef.current.position({ x: 0, y: 0 });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(fitCanvasToViewport, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle manual mode activation
  useEffect(() => {
    if (currentFloorMode === 'manual') {
      setShowManualEntryModal(true);
    }
  }, [currentFloorMode]);

  // Reset hasDrawn when switching to a floor with no shapes
  useEffect(() => {
    if (currentFloor && (!currentFloor.shapes || currentFloor.shapes.length === 0)) {
      console.log('Editor: Resetting hasDrawn for floor with no shapes:', currentFloor.id);
      dispatch(setHasDrawn(false));
    }
  }, [currentFloorId, currentFloor, dispatch]);

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

  // Floor creation functions (simplified like room creation)
  const handleFloorMouseDown = (e) => {
    console.log('handleFloorMouseDown called');
    
    // Check if current floor has shapes
    const currentFloorHasShapes = currentFloor && currentFloor.shapes && currentFloor.shapes.length > 0;
    
    // Prevent duplicate floor creation - but allow if floor has no shapes
    if (isDrawingFloorLocal || isDrawingFromRedux || (hasDrawn && currentFloorHasShapes)) {
      console.log('Already drawing or floor has shapes, preventing duplicate creation', { 
        isDrawingFloorLocal, 
        isDrawingFromRedux, 
        hasDrawn, 
        currentFloorHasShapes 
      });
      return;
    }
    
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    // Get canvas position and scale directly from stage
    const stageScale = stage.scaleX();
    const stagePos = stage.position();
    
    // Convert pointer to canvas coordinate
    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;
    
    console.log("Floor Start Point:", canvasX, canvasY);
    
    // Start floor drawing (like room creation)
    setIsDrawingFloorLocal(true);
    setFloorStartPoint({ x: canvasX, y: canvasY });
    setFloorCurrentPoint({ x: canvasX, y: canvasY });
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
    
    // Check if current floor has shapes
    const currentFloorHasShapes = currentFloor && currentFloor.shapes && currentFloor.shapes.length > 0;
    
    // Prevent duplicate creation - but allow if floor has no shapes
    if (hasDrawn && currentFloorHasShapes) {
      console.log('Floor already created and has shapes, preventing duplicate');
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
    
    // Use the exact drawn position - don't force to firstFloorCoordinates
    const firstPoint = closedPoints[0];
    const finalX = firstPoint.x;
    const finalY = firstPoint.y;
    
    // Keep the original points as drawn
    const adjustedPoints = closedPoints.map(point => ({
      x: point.x,
      y: point.y
    }));
    
    // Create the floor data for the modal
    const floorData = {
      id: `shape-${Date.now()}`,
      type: 'floor',
      name: `Floor ${Date.now()}`, // Default name
      shape: 'polygon',
      points: adjustedPoints,
      areaSqM: areaInMeters,
      source: 'polygon',
      floorHeight: 3200, // in mm
      slabThickness: 200, // in mm
      material: 'RCC',
      layer: 'A-FLOR',
      createdAt: new Date().toISOString(),
      currentFloor: currentFloor,
      firstFloorCoordinates: firstFloorCoordinates
    };
      
    console.log('Editor: Polygon drawn, showing FreehandFloorModal for finalization', floorData);
    
    // Set the floor data and show modal for finalization
    setFreehandFloorData(floorData);
    setShowFreehandFloorModal(true);
    
    console.log('Editor: Modal state set - showFreehandFloorModal:', true, 'freehandFloorData:', floorData);
    
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
    
    // Reset global drawing state
    dispatch(setIsDrawing(false));
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
      drawingMode: 'rectangle', // Reset to default mode
    });
  };

  // Set drawing mode
  const setDrawingMode = (mode) => {
    setFloorDrawingState(prev => ({
      ...prev,
      drawingMode: mode,
    }));
    
    if (mode === 'polygon') {
      dispatch(setFloorMode('polygon'));
      dispatch(setIsDrawingFloor(true));
    } else if (mode === 'manual') {
      setShowManualEntryModal(true);
      dispatch(setIsDrawingFloor(false));
    } else {
      // rectangle mode - auto-activate on mouse down
      dispatch(setFloorMode('rectangle'));
      dispatch(setIsDrawingFloor(false));
    }
  };

  // Handle manual floor entry
  const handleManualFloorEntry = (floorData) => {
    if (!currentFloorId) {
      console.log('Editor: No floor selected, preventing floor shape creation');
      setShowFloorExistsNotification(true);
      setTimeout(() => setShowFloorExistsNotification(false), 3000);
      return;
    }

    // Check if current floor has shapes
    const currentFloorHasShapes = currentFloor && currentFloor.shapes && currentFloor.shapes.length > 0;
    if (hasDrawn && currentFloorHasShapes) {
      console.log('Editor: Floor already has shapes, preventing duplicate creation');
      return;
    }

    const { length, width, x = 5000, y = 3000 } = floorData; // Default center position
    
    // Convert meters to pixels (1m = 100px)
    const widthPx = length * 100;
    const heightPx = width * 100;
    
    // Use first floor coordinates if available, otherwise use provided coordinates
    const finalX = firstFloorCoordinates ? firstFloorCoordinates.x : (x - widthPx / 2);
    const finalY = firstFloorCoordinates ? firstFloorCoordinates.y : (y - heightPx / 2);
    
    const floorShape = {
      id: `shape-${Date.now()}`,
      type: 'floor',
      name: `Floor ${Date.now()}`, // Default name
      shape: 'rectangle',
      x: finalX,
      y: finalY,
      width: widthPx,
      height: heightPx,
      widthInMeters: length,
      heightInMeters: width,
      areaSqM: length * width,
      source: 'manual',
      floorHeight: 3200, // in mm
      slabThickness: 200, // in mm
      material: 'RCC',
      layer: 'A-FLOR',
      createdAt: new Date().toISOString()
    };
    
    console.log('Editor: Creating manual floor shape', floorShape);
    
    // Store first floor coordinates for consistency
    if (!firstFloorCoordinates) {
      dispatch(setFirstFloorCoordinates({ x: finalX, y: finalY }));
      console.log('Editor: Stored first floor coordinates from manual entry:', { x: finalX, y: finalY });
    }
    
    // Add shape to current floor
    if (currentFloor) {
      const updatedFloor = {
        ...currentFloor,
        shapes: [...(currentFloor.shapes || []), floorShape],
        updatedAt: new Date().toISOString()
      };
      dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
    }
    
    setShowManualEntryModal(false);
    
    // Set the floor plan rect for RoomEditor.jsx compatibility (like FloorPlanEditor)
    const finalRect = {
      x: finalX,
      y: finalY,
      width: widthPx,
      height: heightPx,
      draggable: true,
    };
    dispatch(setRect(finalRect));
    localStorage.setItem("floorPlan", JSON.stringify(finalRect));
    console.log('Editor: Set floor plan rect for RoomEditor compatibility from manual entry:', finalRect);
    
    // Set the created floor as selected object
    dispatch(setSelectedObject(floorShape));
    
    // Trigger properties panel opening
    if (onFloorCreated) {
      onFloorCreated(floorShape);
    }
    
    console.log('Editor: Manual floor created and selected:', floorShape);
  };

  // Floor modal handlers (like room creation)
  const handleFloorModalClose = () => {
    console.log('Editor: Floor modal closed');
    setShowFloorModal(false);
    setNewlyCreatedFloor(null);
    
    // Reset drawing state if modal is closed without saving
    setIsDrawingFloorLocal(false);
    setFloorStartPoint(null);
    setFloorCurrentPoint(null);
  };

  const handleFreehandFloorModalClose = () => {
    console.log('Editor: Freehand floor modal closed');
    setShowFreehandFloorModal(false);
    setFreehandFloorData(null);
    
    // Reset drawing state if modal is closed without saving
    setIsDrawingFloorLocal(false);
    setFloorStartPoint(null);
    setFloorCurrentPoint(null);
    
    // Reset hasDrawn if the floor has no shapes (allows drawing again)
    if (currentFloor && (!currentFloor.shapes || currentFloor.shapes.length === 0)) {
      dispatch(setHasDrawn(false));
    }
  };

  const handleFreehandFloorModalSave = async (floorData) => {
    console.log('🎯 Editor: Freehand floor modal save triggered', floorData);
    console.log('🎯 Editor: projectId available:', projectId);
    
    // Validate floorData
    if (!floorData) {
      console.error('❌ Editor: floorData is undefined or null');
      alert('Error: Floor data is missing. Please try again.');
      return;
    }
    
    if (!projectId) {
      console.error('❌ Editor: No projectId provided for floor creation');
      alert('Error: No project ID available. Please select a project first.');
      return;
    }
    
    // Ensure required fields are present
    if (!floorData.name) {
      console.error('❌ Editor: Floor name is missing');
      alert('Error: Floor name is required. Please provide a name.');
      return;
    }
    
    try {
      console.log('🔄 Editor: Converting floor data to backend format...');
      console.log('🔄 Editor: Original floorData:', floorData);
      console.log('🔄 Editor: floorData with projectId:', { ...floorData, projectId });
      
      // Convert floor data to backend format
      const backendFloorData = convertFloorToBackendFormat({
        ...floorData,
        projectId
      });
      console.log('✅ Editor: Backend floor data prepared:', backendFloorData);
      
      console.log('🚀 Editor: Calling createFloor API...');
      // Create floor in backend
      const result = await createFloor(backendFloorData).unwrap();
      console.log('✅ Editor: Floor created in backend:', result);
      
      // Convert backend response to frontend format
      const frontendFloorData = convertFloorFromBackendFormat(result.data);
      
      // Add the created floor as a shape to the current floor
      if (currentFloor) {
        const updatedFloor = {
          ...currentFloor,
          shapes: [...(currentFloor.shapes || []), frontendFloorData],
          updatedAt: new Date().toISOString()
        };
        dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
      } else {
        // If no current floor exists, use the backend response to create the floor
        // The backend response already contains the real MongoDB ObjectId
        const newFloor = {
          id: frontendFloorData.id, // Use the real MongoDB ObjectId from backend
          name: frontendFloorData.name || 'Ground Floor',
          level: frontendFloorData.level || 0,
          height: frontendFloorData.height || 3200,
          shapes: [frontendFloorData],
          canvasSettings: {
            scale: 1,
            position: { x: 0, y: 0 },
            grid: true
          },
          createdAt: frontendFloorData.createdAt || new Date().toISOString(),
          updatedAt: frontendFloorData.updatedAt || new Date().toISOString()
        };
        console.log('🎯 Editor: Creating new floor with MongoDB ObjectId:', newFloor.id);
        dispatch(addFloor(newFloor));
        dispatch(setCurrentFloorId(newFloor.id));
      }
      
      // Set as selected object
      dispatch(setSelectedObject(frontendFloorData));
      
      // Mark as drawn
      dispatch(setHasDrawn(true));
      
      // Trigger properties panel opening
      if (onFloorCreated) {
        console.log('Editor: Calling onFloorCreated callback for freehand floor');
        onFloorCreated(frontendFloorData);
      }
      
      console.log('Editor: Freehand floor finalized:', frontendFloorData);
    } catch (error) {
      console.error('❌ Editor: Error creating floor:', error);
      console.error('❌ Editor: Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      
      // Show more detailed error message
      let errorMessage = 'Unknown error occurred';
      if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 400) {
        errorMessage = 'Bad request - please check the floor data';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed - please log in again';
      } else if (error.status === 404) {
        errorMessage = 'Project not found';
      } else if (error.status === 500) {
        errorMessage = 'Server error - please try again later';
      }
      
      alert(`Failed to create floor: ${errorMessage}`);
    }
  };

  const handleFloorModalSave = async (floorData) => {
    console.log('Editor: Floor modal save', floorData);
    
    try {
      // Create a new floor object for the backend
      const newFloorData = {
        projectId: projectId,
        name: floorData.name || 'New Floor',
        shape: {
          type: 'rect',
          coordinates: [
            { x: floorData.x / 100, y: floorData.y / 100 }, // Convert pixels to meters
            { x: (floorData.x + floorData.width) / 100, y: floorData.y / 100 },
            { x: (floorData.x + floorData.width) / 100, y: (floorData.y + floorData.height) / 100 },
            { x: floorData.x / 100, y: (floorData.y + floorData.height) / 100 }
          ],
          width: floorData.width / 100, // Convert pixels to meters
          height: floorData.height / 100
        },
        height: (floorData.floorHeight || 3200) / 1000, // Convert mm to meters
        material: floorData.material || 'RCC',
        slabThickness: (floorData.slabThickness || 200) / 1000, // Convert mm to meters
        unit: 'm',
        level: floorData.level || 0,
        source: 'manual',
        layer: 'A-FLOR'
      };
      
      console.log('Editor: Creating new floor in backend:', newFloorData);
      
      // Save to backend
      const response = await createFloorInBackend(newFloorData);
      console.log('Editor: Backend response:', response);
      
      if (response && response.data) {
        // Add the new floor to Redux state
        const newFloor = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          level: response.data.level || 0,
          height: (response.data.height || 3.2) * 1000, // Convert meters to millimeters
          createdBy: response.data.createdBy,
          projectId: response.data.projectId,
          shapes: [], // Initialize with empty shapes array
          canvasSettings: {
            scale: 1,
            position: { x: 0, y: 0 },
            grid: true
          },
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };
        
        dispatch(addFloor(newFloor));
        dispatch(setCurrentFloorId(newFloor.id));
        
        console.log('Editor: New floor added to Redux:', newFloor);
        
        // Trigger properties panel opening
        if (onFloorCreated) {
          console.log('Editor: Calling onFloorCreated callback');
          onFloorCreated(newFloor);
        }
      }
      
    } catch (error) {
      console.error('Editor: Error creating floor:', error);
    }
  };

  // Legacy floor popup modal handlers (for backward compatibility)
  const handleFloorPopupClose = () => {
    setShowFloorPopupModal(false);
    setNewlyCreatedFloorData(null);
    dispatch(setIsDrawingFloor(false));
    dispatch(setIsDrawing(false));
    dispatch(setHasDrawn(false));
  };

  const handleFloorPopupSave = async (completeFloorData) => {
    console.log('Editor: Floor popup save', completeFloorData);
    
    try {
      // Create a new floor object for the backend
      const newFloorData = {
        projectId: projectId,
        name: completeFloorData.name || 'New Floor',
        shape: {
          type: 'rect',
          coordinates: [
            { x: completeFloorData.x / 100, y: completeFloorData.y / 100 }, // Convert pixels to meters
            { x: (completeFloorData.x + completeFloorData.width) / 100, y: completeFloorData.y / 100 },
            { x: (completeFloorData.x + completeFloorData.width) / 100, y: (completeFloorData.y + completeFloorData.height) / 100 },
            { x: completeFloorData.x / 100, y: (completeFloorData.y + completeFloorData.height) / 100 }
          ],
          width: completeFloorData.width / 100, // Convert pixels to meters
          height: completeFloorData.height / 100
        },
        height: (completeFloorData.floorHeight || 3200) / 1000, // Convert mm to meters
        material: completeFloorData.material || 'RCC',
        slabThickness: (completeFloorData.slabThickness || 200) / 1000, // Convert mm to meters
        unit: 'm',
        level: completeFloorData.level || 0,
        source: 'manual',
        layer: 'A-FLOR'
      };
      
      console.log('Editor: Creating new floor in backend (popup):', newFloorData);
      
      // Save to backend
      const response = await createFloorInBackend(newFloorData);
      console.log('Editor: Backend response (popup):', response);
      
      if (response && response.data) {
        // Add the new floor to Redux state
        const newFloor = {
          id: response.data._id || response.data.id,
          name: response.data.name,
          level: response.data.level || 0,
          height: (response.data.height || 3.2) * 1000, // Convert meters to millimeters
          createdBy: response.data.createdBy,
          projectId: response.data.projectId,
          shapes: [], // Initialize with empty shapes array
          canvasSettings: {
            scale: 1,
            position: { x: 0, y: 0 },
            grid: true
          },
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };
        
        dispatch(addFloor(newFloor));
        dispatch(setCurrentFloorId(newFloor.id));
        
        console.log('Editor: New floor added to Redux (popup):', newFloor);
        
        // Trigger properties panel opening
        if (onFloorCreated) {
          console.log('Editor: Calling onFloorCreated callback');
          onFloorCreated(newFloor);
        }
      }
      
    } catch (error) {
      console.error('Editor: Error creating floor (popup):', error);
    }
  };

  // Floor drag and resize handlers
  const handleFloorDragEnd = (shapeId, x, y) => {
    console.log('Floor drag end:', { shapeId, x, y });
    
    if (currentFloor) {
      const updatedShapes = currentFloor.shapes.map(shape => 
        shape.id === shapeId 
          ? { ...shape, x, y, updatedAt: new Date().toISOString() }
          : shape
      );
      
      const updatedFloor = {
        ...currentFloor,
        shapes: updatedShapes,
        updatedAt: new Date().toISOString()
      };
      
      dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
      
      // Update selected object if this is the selected floor
      if (selectedObject && selectedObject.id === shapeId) {
        const updatedShape = updatedShapes.find(s => s.id === shapeId);
        dispatch(setSelectedObject(updatedShape));
      }
      
      // Update in backend
      const updatedShape = updatedShapes.find(s => s.id === shapeId);
      if (updatedShape) {
        updateFloorInBackend(shapeId, updatedShape, currentFloor.id)
          .catch(error => {
            console.error('Failed to update floor in backend:', error);
            // Optionally show user notification about sync failure
          });
      }
    }
  };

  const handleFloorTransformEnd = (shapeId, node) => {
    console.log('Floor transform end:', { shapeId, node });
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);
    
    const updatedWidth = node.width() * scaleX;
    const updatedHeight = node.height() * scaleY;
    
    // Calculate new dimensions in meters
    const widthInMeters = convertPixelsToMeters(updatedWidth);
    const heightInMeters = convertPixelsToMeters(updatedHeight);
    const areaInMeters = widthInMeters * heightInMeters;
    
    let updatedShape = null;
    
    if (currentFloor) {
      const updatedShapes = currentFloor.shapes.map(shape => 
        shape.id === shapeId 
          ? { 
              ...shape, 
              x: node.x(),
              y: node.y(),
              width: updatedWidth,
              height: updatedHeight,
              widthInMeters,
              heightInMeters,
              areaSqM: areaInMeters,
              updatedAt: new Date().toISOString()
            }
          : shape
      );
      
      const updatedFloor = {
        ...currentFloor,
        shapes: updatedShapes,
        updatedAt: new Date().toISOString()
      };
      
      dispatch(updateFloor({ id: currentFloor.id, updates: updatedFloor }));
      
      // Update selected object if this is the selected floor
      if (selectedObject && selectedObject.id === shapeId) {
        updatedShape = updatedShapes.find(s => s.id === shapeId);
        dispatch(setSelectedObject(updatedShape));
      }
      
      // Get the updated shape for backend update
      updatedShape = updatedShapes.find(s => s.id === shapeId);
    }
    
    // Clear live dimensions
    setLiveDimensions({ width: 0, height: 0 });
    
    // Update in backend
    if (updatedShape && currentFloor) {
      updateFloorInBackend(shapeId, updatedShape, currentFloor.id)
        .catch(error => {
          console.error('Failed to update floor in backend:', error);
          // Optionally show user notification about sync failure
        });
    }
  };

  const handleFloorTransform = (shapeId, node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    const currentWidth = node.width() * scaleX;
    const currentHeight = node.height() * scaleY;
    
    const widthInMeters = convertPixelsToMeters(currentWidth);
    const heightInMeters = convertPixelsToMeters(currentHeight);
    
    setLiveDimensions({ width: widthInMeters, height: heightInMeters });
  };

  const handleFloorClick = (shape) => {
    console.log('Floor clicked:', shape);
    setSelectedFloorId(shape.id);
    dispatch(setSelectedObject(shape));
  };

  const handleFloorMouseMove = (e) => {
    if (!isDrawingFloorLocal) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    
    // Get canvas position and scale directly from stage
    const stageScale = stage.scaleX();
    const stagePos = stage.position();
    
    // Convert pointer to canvas coordinate
    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;
    
    console.log("Floor Current Point:", canvasX, canvasY);
    
    // Update current point for preview (like room creation)
    setFloorCurrentPoint({ x: canvasX, y: canvasY });
  };

  const handleFloorMouseUp = () => {
    console.log('handleFloorMouseUp called', { 
      isDrawingFloorLocal,
      floorStartPoint,
      floorCurrentPoint
    });
    
    if (!isDrawingFloorLocal || !floorStartPoint || !floorCurrentPoint) return;
    
    const x = Math.min(floorStartPoint.x, floorCurrentPoint.x);
    const y = Math.min(floorStartPoint.y, floorCurrentPoint.y);
    const width = Math.abs(floorCurrentPoint.x - floorStartPoint.x);
    const height = Math.abs(floorCurrentPoint.y - floorStartPoint.y);
    
    if (width > 10 && height > 10) {
      // Calculate dimensions in meters (100px = 1m)
      const widthInMeters = convertPixelsToMeters(width);
      const heightInMeters = convertPixelsToMeters(height);
      const areaInMeters = widthInMeters * heightInMeters;
      
      // Use the exact drawn position - don't force to firstFloorCoordinates
      const finalX = x;
      const finalY = y;
      
      // Create the floor data for the modal
      const floorData = {
        id: `shape-${Date.now()}`,
        type: 'floor',
        name: `Floor ${Date.now()}`, // Default name
        shape: 'rectangle',
        x: finalX,
        y: finalY,
        width: width,
        height: height,
        widthInMeters: widthInMeters,
        heightInMeters: heightInMeters,
        areaSqM: areaInMeters,
        source: 'rectangle',
        floorHeight: 3200, // in mm
        slabThickness: 200, // in mm
        material: 'RCC',
        layer: 'A-FLOR',
        createdAt: new Date().toISOString(),
        currentFloor: currentFloor,
        firstFloorCoordinates: firstFloorCoordinates
      };
    
      console.log('Editor: Floor drawn, showing FreehandFloorModal for finalization', floorData);
      
      // Set the floor data and show modal for finalization
      setFreehandFloorData(floorData);
      setShowFreehandFloorModal(true);
      
      console.log('Editor: Modal state set - showFreehandFloorModal:', true, 'freehandFloorData:', floorData);
      
      // Test if modal state is set correctly
      setTimeout(() => {
        console.log('Editor: Modal state check - showFreehandFloorModal:', showFreehandFloorModal, 'freehandFloorData:', !!freehandFloorData);
      }, 100);
    }
    
    // Reset drawing state
    setIsDrawingFloorLocal(false);
    setFloorStartPoint(null);
    setFloorCurrentPoint(null);
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
    
    // Apply zoom to stage
    if (stageRef.current) {
      stageRef.current.scale({ x: newScale, y: newScale });
      stageRef.current.position(newPos);
    }
  };

  const handleMouseDown = (e) => {
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    
    // Get canvas position and scale directly from stage
    const stageScale = stage.scaleX();
    const stagePos = stage.position();
    
    // Convert pointer to canvas coordinate
    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;
    
    const transformedPoint = { x: canvasX, y: canvasY };
    
    // Handle measurement clicks
    if (isMeasuring) {
      handleMeasurementClick(transformedPoint);
      return;
    }
    
    // Handle floor creation (auto-active) - allow drawing on floors with no shapes
    const currentFloorHasShapes = currentFloor && currentFloor.shapes && currentFloor.shapes.length > 0;
    if (!isDrawingFloorLocal && !isDrawingFromRedux && (!hasDrawn || !currentFloorHasShapes)) {
      console.log('Editor: Starting floor creation', { hasDrawn, currentFloorHasShapes, currentFloor });
      handleFloorMouseDown(e);
      return; // Return early to prevent other handlers from running
    }
    
    // If floor drawing was activated, return early
    if (isDrawingFloorLocal) {
      console.log('Editor: Floor drawing in progress, ignoring other mouse events');
      return;
    }
    
    // Clear selection if clicking on empty space (not on a shape)
    if (selectedObject && !e.target.hasName('floor-shape')) {
      dispatch(setSelectedObject(null));
      setSelectedFloorId(null);
      setLiveDimensions({ width: 0, height: 0 });
    }
    
    // Handle existing floor drawing (legacy)
    if (!localFloorMode) return;
    setFloor({ x: canvasX, y: canvasY, width: 0, height: 0 });
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
    const pointer = stage.getPointerPosition();
    
    // Get canvas position and scale directly from stage
    const stageScale = stage.scaleX();
    const stagePos = stage.position();
    
    // Convert pointer to canvas coordinate
    const canvasX = (pointer.x - stagePos.x) / stageScale;
    const canvasY = (pointer.y - stagePos.y) / stageScale;
    
    const transformedPoint = { x: canvasX, y: canvasY };

    // Update current measurement preview
    if (isMeasuring && measurementStartPoint && currentMeasurement) {
      const distance = measurementTools.measureDistance(measurementStartPoint, transformedPoint, displayUnit);
      const formattedDistance = measurementTools.formatMeasurement(distance, displayUnit);
      
      setCurrentMeasurement({
        ...currentMeasurement,
        endPoint: transformedPoint,
        measurement: formattedDistance
      });
    }

    // Handle floor creation (like room creation) - prioritize this
    if (isDrawingFloorLocal) {
      console.log('Editor: Floor drawing mouse move');
      handleFloorMouseMove({ target: { getStage: () => stage } });
      return;
    }

    // Handle existing floor drawing (legacy)
    if (!isDrawing || !localFloorMode) return;
    const newWidth = canvasX - floor.x;
    const newHeight = canvasY - floor.y;

    setFloor((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }));
  };

  const handleMouseUp = (e) => {
    // Check if we're currently dragging a floor
    if (isDraggingFloor) {
      console.log('Editor: Currently dragging floor, skipping global mouse up handler');
      return;
    }

    // Check if we're interacting with a Konva node (like dragging a floor)
    if (e && e.target && e.target.getStage) {
      const stage = e.target.getStage();
      if (stage) {
        const pointer = stage.getPointerPosition();
        const node = stage.getIntersection(pointer);
        
        // If we're interacting with a floor shape or any draggable node, don't handle global mouse up
        if (node && (node.hasName('floor-shape') || node.draggable())) {
          console.log('Editor: Mouse up on draggable node, skipping global handler');
          return;
        }
      }
    }

    // Handle floor creation (like room creation) - prioritize this
    if (isDrawingFloorLocal) {
      console.log('Editor: Floor drawing mouse up - finalizing floor');
      handleFloorMouseUp();
      return;
    }

    // Handle existing floor drawing (legacy)
    if (!isDrawing) return;
    setIsDrawing(false);
    setLocalFloorMode(false);

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
            {((scale / baseScale) * 100).toFixed(0)}%
          </div>

          {/* Zoom Out Button */}
          <button
            onClick={() => {
              const newScale = Math.max(0.01, scale / 1.2);
              setScaleState(newScale);
              
              // Apply zoom to stage
              if (stageRef.current) {
                stageRef.current.scale({ x: newScale, y: newScale });
              }
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
              
              // Apply zoom to stage
              if (stageRef.current) {
                stageRef.current.scale({ x: newScale, y: newScale });
              }
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
                   const newPos = { x: centerX, y: centerY };
                   setPosition(newPos);
                   
                   // Apply zoom and position to stage
                   if (stageRef.current) {
                     stageRef.current.scale({ x: newScale, y: newScale });
                     stageRef.current.position(newPos);
                   }
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

                 setBaseScale(newScale); // Update base scale when fitting to viewport
                 setScaleState(newScale);
                 setPosition({ x: 0, y: 0 });
                 
                 // Apply zoom and position to stage
                 if (stageRef.current) {
                   stageRef.current.scale({ x: newScale, y: newScale });
                   stageRef.current.position({ x: 0, y: 0 });
                 }
               }}
              className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors text-xs"
              title="Fit entire canvas in browser window"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <span>Fit Window</span>
            </button>

             {/* Fit PDF/PNG Content Button - Only show when PDF is loaded */}
             {data?.source === "pdf" && (
               <button
                 onClick={() => {
                   // Zoom to fit the PNG content specifically
                   const browserWidth = window.innerWidth - 40;
                   const browserHeight = window.innerHeight - 140;
                   
                   // Use actual PNG dimensions if available, otherwise use estimates
                   const pngWidth = pngDimensions.width || 800;
                   const pngHeight = pngDimensions.height || 600;
                   
                   const scaleX = browserWidth / pngWidth;
                   const scaleY = browserHeight / pngHeight;
                   const newScale = Math.min(scaleX, scaleY, 2); // Allow some zoom in
                   
                   setBaseScale(newScale);
                   setScaleState(newScale);
                   
                   // Center the PNG content
                   const centerX = (browserWidth - pngWidth * newScale) / 2;
                   const centerY = (browserHeight - pngHeight * newScale) / 2;
                   const newPos = { x: -centerX / newScale, y: -centerY / newScale };
                   setPosition(newPos);
                   
                   // Apply zoom and position to stage
                   if (stageRef.current) {
                     stageRef.current.scale({ x: newScale, y: newScale });
                     stageRef.current.position(newPos);
                   }
                 }}
                 className="flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 transition-colors text-xs"
                 title="Fit PDF content to viewport"
               >
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <span>Fit PDF</span>
               </button>
             )}

          {/* Reset Button */}
          <button
            onClick={() => {
              setBaseScale(1); // Reset base scale to 1 (100% zoom)
              setScaleState(1);
              setPosition({ x: 0, y: 0 });
              
              // Apply zoom and position to stage
              if (stageRef.current) {
                stageRef.current.scale({ x: 1, y: 1 });
                stageRef.current.position({ x: 0, y: 0 });
              }
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

      {/* Loading Overlay */}
      {(isLoading || floorsLoading) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {floorsLoading ? 'Loading floor data from database...' : 'Loading project data...'}
            </p>
          </div>
        </div>
      )}

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
          {/* Floor Creation Preview - using new simplified state like RoomEditor */}
          {/* {isDrawingFloorLocal && floorStartPoint && floorCurrentPoint && (
            <Rect
              x={Math.min(floorStartPoint.x, floorCurrentPoint.x)}
              y={Math.min(floorStartPoint.y, floorCurrentPoint.y)}
              width={Math.abs(floorCurrentPoint.x - floorStartPoint.x)}
              height={Math.abs(floorCurrentPoint.y - floorStartPoint.y)}
              fill="rgba(0, 150, 255, 0.1)"
              stroke="#1e40af"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )} */}

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

          {/* Debug Information Display */}
          {/* <Text
            x={10}
            y={10}
            text={`Floors: ${floors.length} | Current: ${currentFloorId || 'None'} | Shapes: ${currentFloor?.shapes?.length || 0}`}
            fontSize={12}
            fill="black"
            stroke="white"
            strokeWidth={1}
          /> */}
          

          
          {/* Current Floor Shapes Display */}
          {/* {console.log('🎯 Editor: About to render floors. currentFloor:', currentFloor)}
          {console.log('🎯 Editor: currentFloor.shapes:', currentFloor?.shapes)}
          {console.log('🎯 Editor: All floors in Redux:', floors)}
          {console.log('🎯 Editor: Current floor ID:', currentFloorId)}
          {console.log('🎯 Editor: User project floors:', userProjectFloors)} */}
          
          {/* Fallback: If no currentFloor, try to use the first available floor */}
          {/* {!currentFloor && floors.length > 0 && (
            <Rect
              x={200}
              y={200}
              width={currentFloor.shapes[0].width}
              height={currentFloor.shapes[0].height}
              fill="rgba(0, 255, 0, 0.2)"
              stroke="green"
              strokeWidth={2}
              listening={false}
            />
          )} */}
          

          


                      {/* Floor drawing preview (like room creation) */}
            {isDrawingFloorLocal && floorStartPoint && floorCurrentPoint && (
              <Rect
                x={Math.min(floorStartPoint.x, floorCurrentPoint.x)}
                y={Math.min(floorStartPoint.y, floorCurrentPoint.y)}
                width={Math.abs(floorCurrentPoint.x - floorStartPoint.x)}
                height={Math.abs(floorCurrentPoint.y - floorStartPoint.y)}
                fill="rgba(0, 150, 255, 0.3)"
                stroke="blue"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}

          {/* Live Dimensions Display */}
          {/* {selectedFloorId && liveDimensions.width > 0 && liveDimensions.height > 0 && (
            <>
              <Text
                x={selectedObject?.x + (selectedObject?.width || 0) / 2}
                y={selectedObject?.y - 30}
                text={`Width: ${liveDimensions.width.toFixed(2)} m`}
                fontSize={14}
                fill="black"
                stroke="white"
                strokeWidth={2}
                align="center"
              />
              <Text
                x={selectedObject?.x + (selectedObject?.width || 0) + 10}
                y={selectedObject?.y + (selectedObject?.height || 0) / 2}
                text={`Height: ${liveDimensions.height.toFixed(2)} m`}
                fontSize={14}
                fill="black"
                stroke="white"
                strokeWidth={2}
                align="center"
              />
            </>
          )} */}

          {/* Legacy Floor (existing floor drawing) */}
          {/* {floor && (
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
          )} */}
        </Layer>

        <Layer>
          <EntityRender />
          
          {/* Direct PNG Image Rendering for PDF conversions */}
          {pngImage && data?.source === "pdf" && (
            <Group>
              {/* Canvas center indicator */}
              <Group>
                <Line
                  points={[5000 - 50, 3000, 5000 + 50, 3000]}
                  stroke="rgba(0, 255, 0, 0.3)"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
                <Line
                  points={[5000, 3000 - 50, 5000, 3000 + 50]}
                  stroke="rgba(0, 255, 0, 0.3)"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
                <Circle
                  x={5000}
                  y={3000}
                  radius={10}
                  fill="rgba(0, 255, 0, 0.2)"
                  stroke="rgba(0, 255, 0, 0.5)"
                  strokeWidth={2}
                />
              </Group>

              {/* PNG Image */}
              <Image
                image={pngImage}
                x={(10000 - pngDimensions.width) / 2}
                y={(6000 - pngDimensions.height) / 2}
                width={pngDimensions.width}
                height={pngDimensions.height}
                listening={false}
              />
              
              {/* PNG bounds indicator */}
              <Rect
                x={(10000 - pngDimensions.width) / 2 - 5}
                y={(6000 - pngDimensions.height) / 2 - 5}
                width={pngDimensions.width + 10}
                height={pngDimensions.height + 10}
                fill="rgba(255, 255, 255, 0.05)"
                stroke="rgba(0, 0, 255, 0.3)"
                strokeWidth={2}
                cornerRadius={3}
              />
              
              {/* PNG center indicator */}
              <Circle
                x={5000}
                y={3000}
                radius={8}
                fill="rgba(255, 0, 0, 0.3)"
                stroke="rgba(255, 0, 0, 0.7)"
                strokeWidth={2}
              />
            </Group>
          )}
          
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
            
          {/* Render floors from currentFloor - positioned on top of PNG */}
          {console.log('🎯 Editor: Rendering floors on top of PNG. currentFloor:', currentFloor)}
          {(currentFloor?.shapes || []).map((shape, index) => {
            const isSelected = selectedObject && selectedObject.id === shape.id;
            
            if (shape.shape === 'rectangle') {
              // Use the already converted pixel values
              const x = typeof shape.x === 'number' ? shape.x : 0;
              const y = typeof shape.y === 'number' ? shape.y : 0;
              const width = typeof shape.width === 'number' ? shape.width : 100;
              const height = typeof shape.height === 'number' ? shape.height : 100;
              
              console.log('🎯 Editor: Rendering rectangle shape on top of PNG:', {
                id: shape.id,
                x, y, width, height,
                isVisible: width > 0 && height > 0,
                shapeType: shape.shape,
                source: shape.source
              });
              
              return (
                <Group
                  key={shape.id || index}
                  x={x}
                  y={y}
                  draggable
                  onDragStart={(e) => {
                    console.log('Floor drag start:', shape.id);
                    setIsDraggingFloor(true);
                    e.target.moveToTop();
                  }}
                  onDragMove={(e) => {
                    // Optional: Add any drag move logic here
                  }}
                  onDragEnd={(e) => {
                    console.log('Floor drag end:', shape.id, e.target.x(), e.target.y());
                    setIsDraggingFloor(false);
                    const node = e.target;
                    handleFloorDragEnd(shape.id, node.x(), node.y());
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    handleFloorTransformEnd(shape.id, node);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    handleFloorTransform(shape.id, node);
                  }}
                  ref={(node) => {
                    if (node) {
                      floorShapeRefs.current[shape.id] = node;
                    }
                  }}
                >
                  <Rect
                    name="floor-shape"
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="rgba(0, 150, 255, 0.1)"
                    stroke={isSelected ? "#3b82f6" : "#1e40af"}
                    strokeWidth={isSelected ? 5 : 3}
                    onClick={(e) => {
                      // Only handle click if not dragging
                      if (!e.target.isDragging()) {
                        handleFloorClick(shape);
                      }
                    }}
                    onTap={(e) => {
                      // Only handle tap if not dragging
                      if (!e.target.isDragging()) {
                        handleFloorClick(shape);
                      }
                    }}
                  />
                  {isSelected && (
                    <Transformer
                      boundBoxFunc={(oldBox, newBox) => {
                        // Restrict minimum size to 50px (0.5m)
                        return newBox.width < 50 || newBox.height < 50 ? oldBox : newBox;
                      }}
                      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                      rotateEnabled={false}
                      keepRatio={false}
                    />
                  )}
                </Group>
              );
            } else if (shape.shape === 'polygon' && shape.points) {
              console.log('🎯 Editor: Rendering polygon shape on top of PNG:', {
                id: shape.id,
                pointsLength: shape.points?.length,
                source: shape.source
              });
              
              // Use the already converted pixel values
              const points = shape.points.map(point => {
                const x = typeof point.x === 'number' ? point.x : 0;
                const y = typeof point.y === 'number' ? point.y : 0;
                return [x, y];
              }).flat();
              
              return (
                <Group
                  key={shape.id || index}
                  draggable
                  onDragStart={(e) => {
                    console.log('Floor drag start (polygon):', shape.id);
                    setIsDraggingFloor(true);
                    e.target.moveToTop();
                  }}
                  onDragMove={(e) => {
                    // Optional: Add any drag move logic here
                  }}
                  onDragEnd={(e) => {
                    console.log('Floor drag end (polygon):', shape.id, e.target.x(), e.target.y());
                    setIsDraggingFloor(false);
                    const node = e.target;
                    handleFloorDragEnd(shape.id, node.x(), node.y());
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    handleFloorTransformEnd(shape.id, node);
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    handleFloorTransform(shape.id, node);
                  }}
                  ref={(node) => {
                    if (node) {
                      floorShapeRefs.current[shape.id] = node;
                    }
                  }}
                >
                  <Line
                    name="floor-shape"
                    points={points}
                    stroke={isSelected ? "#3b82f6" : "#1e40af"}
                    strokeWidth={isSelected ? 5 : 3}
                    fill="rgba(0, 150, 255, 0.1)"
                    closed={true}
                    onClick={(e) => {
                      // Only handle click if not dragging
                      if (!e.target.isDragging()) {
                        handleFloorClick(shape);
                      }
                    }}
                    onTap={(e) => {
                      // Only handle tap if not dragging
                      if (!e.target.isDragging()) {
                        handleFloorClick(shape);
                      }
                    }}
                  />
                  {isSelected && (
                    <Transformer
                      boundBoxFunc={(oldBox, newBox) => {
                        return newBox.width < 50 || newBox.height < 50 ? oldBox : newBox;
                      }}
                      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                      rotateEnabled={false}
                      keepRatio={false}
                    />
                  )}
                </Group>
              );
            }
            return null;
          })}
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

        {/* API Error Notification */}
        {floorsError && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <div className="bg-red-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">
                Error loading floor data: {floorsError.message || floorsError.data?.message || 'Unknown error'}
              </span>
              <button 
                onClick={() => refetchFloors()}
                className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Floor Drawing Instructions */}
        {isDrawingFloor && currentFloorMode === 'rectangle' && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 1000,
            }}
          >
            <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
              <p className="text-sm font-medium">Rectangle Mode</p>
              <p className="text-xs">Drag to draw floor rectangle</p>
            </div>
          </div>
        )}

        {isDrawingFloor && currentFloorMode === 'polygon' && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 1000,
            }}
          >
            <div className="bg-purple-500 text-white px-4 py-2 rounded shadow-lg">
              <p className="text-sm font-medium">Polygon Mode</p>
              <p className="text-xs">Click to add points, right-click to finish</p>
            </div>
          </div>
        )}

        {!isDrawingFloor && currentFloorMode === 'rectangle' && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 1000,
            }}
          >
            <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
              <p className="text-sm font-medium">Auto-Active Floor Drawing</p>
              <p className="text-xs">Click and drag anywhere to create a new floor</p>
            </div>
          </div>
        )}

        {/* API Test Button */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={async () => {
              console.log('🧪 Testing API connections...');
              await testApiConnection();
              await testFloorApi();
            }}
            className="bg-red-500 text-white px-3 py-2 rounded shadow-lg text-sm hover:bg-red-600"
          >
            Test API
          </button>
          <button
            onClick={() => {
              console.log('🔄 Manual floor data refetch triggered');
              refetchFloors();
            }}
            className="bg-blue-500 text-white px-3 py-2 rounded shadow-lg text-sm hover:bg-blue-600 ml-2"
          >
            Refetch Floors
          </button>
          <button
            onClick={() => {
              console.log('🧪 Testing floor creation...');
              const testShape = {
                id: `shape-${Date.now()}`,
                type: 'floor',
                name: 'Test Floor',
                shape: 'rectangle',
                x: 1000,
                y: 1000,
                width: 200,
                height: 150,
                widthInMeters: 2,
                heightInMeters: 1.5,
                areaSqM: 3,
                source: 'test',
                floorHeight: 3200,
                slabThickness: 200,
                material: 'RCC',
                layer: 'A-FLOR',
                createdAt: new Date().toISOString()
              };
              dispatch(setSelectedObject(testShape));
              if (onFloorCreated) {
                onFloorCreated(testShape);
              }
            }}
            className="bg-green-500 text-white px-3 py-2 rounded shadow-lg text-sm hover:bg-green-600 ml-2"
          >
            Test Floor Creation
          </button>
        </div>
          </div>
        </div>
      </div>
      
      {/* Coordinate Display */}
      {/* <CoordinateDisplay
        getMouseCoordinates={getMouseCoordinates}
        unit={displayUnitToGridUnit(displayUnit)}
        isVisible={internalShowCoordinates}
        position="bottom-right"
        scale={scale}
        stageRef={stageRef}
      /> */}

      {/* Manual Floor Entry Modal */}
      <ManualFloorEntryModal
        isOpen={showManualEntryModal}
        onClose={() => setShowManualEntryModal(false)}
        onSubmit={handleManualFloorEntry}
      />

      {/* Floor Form Modal (like room creation) */}
      {showFloorModal && newlyCreatedFloor && (
        <FloorFormModal
          floor={newlyCreatedFloor}
          onClose={handleFloorModalClose}
          onSave={handleFloorModalSave}
          isNewFloor={!newlyCreatedFloor.name} // If floor has no name, it's a new floor
        />
      )}

      {/* Freehand Floor Modal */}
      {console.log('🎯 Editor: Rendering FreehandFloorModal check - showFreehandFloorModal:', showFreehandFloorModal, 'freehandFloorData:', !!freehandFloorData)}
      {showFreehandFloorModal && freehandFloorData && (
        <FreehandFloorModal
          floor={freehandFloorData}
          onClose={handleFreehandFloorModalClose}
          onSave={handleFreehandFloorModalSave}
          isNewFloor={true}
        />
      )}
      


      {/* Floor Popup Modal */}
      <FloorPopupModal
        isOpen={showFloorPopupModal}
        onClose={handleFloorPopupClose}
        floorData={newlyCreatedFloorData}
        onSave={handleFloorPopupSave}
        isNewFloor={true}
      />

      {console.log('🎯 Editor: Rendering FloorPropertiesPanel check - selectedObject:', selectedObject, 'onFloorCreated:', !!onFloorCreated)}
    </div>
  );
}
