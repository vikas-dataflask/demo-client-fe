# Canvas Layout and Tool System

This directory contains the reusable canvas components that provide consistent zoom, pan, and measurement functionality across all architectural editor pages.

## Components

### `CanvasWrapper`
The main canvas component that provides:
- Konva Stage with consistent sizing (100m x 60m = 10000px x 6000px)
- Grid rendering with 1m spacing (100px)
- Zoom controls with baseScale calculation
- Measurement tools
- Mouse wheel zoom with cursor focus
- Keyboard shortcuts (ESC to exit measurement mode)

### `ZoomControls`
Reusable toolbar component with:
- Zoom In/Out buttons
- Fit All (fit entire canvas)
- Fit Window (fit content)
- Reset zoom
- Measurement tool toggle
- Clear measurements

### `GridLayer`
Renders grid lines based on current scale and position:
- 100px spacing (1m intervals)
- Responsive to zoom level
- Configurable color and opacity

### `useCanvasViewport`
Custom hook that manages:
- Scale and position state
- baseScale calculation for zoom percentage
- Zoom in/out functions
- Fit-to-screen logic
- Measurement tool state
- Mouse wheel handling

## Usage

### Basic Usage
```jsx
import CanvasWrapper from '../Canvas/CanvasWrapper';
import { Layer, Rect } from 'react-konva';

function MyPage() {
  return (
    <CanvasWrapper>
      <Layer>
        <Rect x={100} y={100} width={200} height={150} fill="red" />
      </Layer>
    </CanvasWrapper>
  );
}
```

### With Custom Options
```jsx
<CanvasWrapper
  width={1200}
  height={800}
  showGrid={true}
  showZoomControls={true}
  showMeasurementTools={true}
  onMouseDown={handleMouseDown}
>
  <Layer>
    {/* Your canvas content */}
  </Layer>
</CanvasWrapper>
```

### Using the Hook Directly
```jsx
import { useCanvasViewport } from '../../hooks/useCanvasViewport';

function CustomCanvas() {
  const viewport = useCanvasViewport({
    containerWidth: 1000,
    containerHeight: 600,
    autoFitOnMount: true
  });

  const { scale, position, zoomIn, zoomOut, getZoomPercentage } = viewport;

  return (
    <Stage scaleX={scale} scaleY={scale} x={position.x} y={position.y}>
      {/* Your content */}
    </Stage>
  );
}
```

## Specifications

- **Canvas Size**: 100m x 60m (10000px x 6000px)
- **Grid Spacing**: 100px (1m)
- **Zoom Range**: 0.01x to 3x
- **Zoom Percentage**: Based on `currentScale / baseScale * 100`
- **Coordinate System**: Top-left origin (0,0)
- **Units**: 100px = 1m

## Features

### Zoom Controls
- **Zoom In/Out**: Mouse wheel or buttons
- **Fit All**: Shows entire canvas
- **Fit Window**: Fits content to viewport
- **Reset**: Returns to 100% zoom
- **Percentage Display**: Shows relative zoom level

### Measurement Tool
- Click two points to measure distance
- ESC key to exit measurement mode
- Clear all measurements button
- Real-time preview while measuring

### Grid System
- Automatic grid rendering
- Responsive to zoom level
- Configurable appearance
- Toggle on/off via Redux state

## Integration

The canvas system is now integrated into:
- Area Markup page
- Door and Window Markup page  
- Assign Material page

All pages now have consistent zoom behavior and measurement tools. 