import React, { useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useSelector } from 'react-redux';
import { useCanvasViewport } from '../../hooks/useCanvasViewport';
import GridLayer from './GridLayer';
import ZoomControls from './ZoomControls';
import MeasurementLine from './MeasurementLine';

const CanvasWrapper = ({
  children,
  width = window.innerWidth - 440,
  height = window.innerHeight - 80,
  showGrid = true,
  showZoomControls = true,
  showMeasurementTools = true,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onDblClick,
  onContextMenu,
  className = "",
  style = {},
  ...props
}) => {
  const stageRef = useRef(null);
  const grid = useSelector((state) => state.editor.grid);

  // Use the canvas viewport hook
  const viewport = useCanvasViewport({
    containerWidth: width,
    containerHeight: height,
    autoFitOnMount: true,
    fitTarget: 'canvas'
  });

  const {
    scale,
    position,
    baseScale,
    isMeasuring,
    measurements,
    currentMeasurement,
    handleWheel,
    getZoomPercentage,
    zoomIn,
    zoomOut,
    resetZoom,
    fitCanvas,
    fitContent,
    toggleMeasurementMode,
    clearMeasurements,
    handleMeasurementClick,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_SIZE
  } = viewport;

  // Handle mouse events
  const handleMouseDown = (e) => {
    if (isMeasuring) {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      
      // Get canvas position and scale directly from stage
      const stageScale = stage.scaleX(); // assume uniform scaling
      const stagePos = stage.position(); // returns { x, y }
      
      // Convert pointer to canvas coordinate
      const canvasX = (pointer.x - stagePos.x) / stageScale;
      const canvasY = (pointer.y - stagePos.y) / stageScale;
      
      const transformedPoint = {
        x: canvasX,
        y: canvasY,
      };
      handleMeasurementClick(transformedPoint);
      return;
    }
    
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleMouseMove = (e) => {
    if (onMouseMove) {
      onMouseMove(e);
    }
  };

  const handleMouseUp = (e) => {
    if (onMouseUp) {
      onMouseUp(e);
    }
  };

  const handleWheelEvent = (e) => {
    const pointer = {
      x: e.evt.offsetX,
      y: e.evt.offsetY,
    };
    handleWheel(e, pointer);
    
    if (onWheel) {
      onWheel(e);
    }
  };

  // Apply scale and position to stage
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.scale({ x: scale, y: scale });
      stageRef.current.position(position);
    }
  }, [scale, position]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMeasuring) {
        toggleMeasurementMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMeasuring, toggleMeasurementMode]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Zoom Controls */}
      {showZoomControls && (
        <ZoomControls
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          fitCanvas={fitCanvas}
          fitContent={fitContent}
          toggleMeasurementMode={toggleMeasurementMode}
          clearMeasurements={clearMeasurements}
          getZoomPercentage={getZoomPercentage}
          isMeasuring={isMeasuring}
          measurements={measurements}
          scale={scale}
          showMeasurementTools={showMeasurementTools}
        />
      )}

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheelEvent}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={onDblClick}
        onContextMenu={onContextMenu}
        {...props}
      >
        {/* Grid Layer */}
        {showGrid && grid && (
          <GridLayer
            width={width}
            height={height}
            scale={scale}
            position={position}
            gridSize={GRID_SIZE}
          />
        )}

        {/* Content Layer */}
        {children}

        {/* Measurement Lines */}
        {isMeasuring && (
          <Layer>
            {measurements.map((measurement, index) => (
              <MeasurementLine
                key={index}
                startPoint={measurement.startPoint}
                endPoint={measurement.endPoint}
                measurement={measurement.measurement}
                scale={scale}
              />
            ))}
            {currentMeasurement && (
              <MeasurementLine
                startPoint={currentMeasurement.startPoint}
                endPoint={currentMeasurement.endPoint}
                measurement={currentMeasurement.measurement}
                scale={scale}
                isPreview={true}
              />
            )}
          </Layer>
        )}
      </Stage>

      {/* Instructions for measurement mode */}
      {isMeasuring && (
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow z-10 text-xs text-gray-600">
          <p>Click two points to measure distance</p>
          <p>Press ESC to exit measurement mode</p>
        </div>
      )}
    </div>
  );
};

export default CanvasWrapper; 