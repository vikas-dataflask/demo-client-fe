# 3D Rendering Module Documentation

## Overview

The 3D rendering module provides a comprehensive Three.js-based visualization system that renders floors, rooms, walls, doors, and windows in 3D space. It syncs with the 2D Konva canvas and stores structured data to enable extrusion and manipulation in 3D.

## Architecture

### Core Components

1. **ThreeRenderer** (`src/components/3d/ThreeRenderer.jsx`)
   - Main Three.js renderer component
   - Handles scene setup, lighting, camera controls
   - Renders floors, rooms, walls, doors, and windows
   - Manages object selection and interaction

2. **ThreeViewer** (`src/components/3d/ThreeViewer.jsx`)
   - High-level viewer component with controls
   - Manages view modes (3D, 2D, split)
   - Provides camera position presets
   - Handles data loading and state management

3. **ThreeDPage** (`src/pages/ThreeDPage.jsx`)
   - Complete 3D viewing page
   - Includes sidebar with object properties
   - Provides scene statistics and camera controls
   - Offers export and screenshot functionality

4. **ViewToggle** (`src/components/3d/ViewToggle.jsx`)
   - Toggle component for switching between 2D and 3D views
   - Can be integrated into existing pages
   - Provides navigation between views

### Utility Modules

1. **Geometry Utilities** (`src/utils/geometry.js`)
   - Unit conversion functions (pixels ↔ mm ↔ meters)
   - Coordinate transformation (canvas ↔ 3D world)
   - Wall generation from room geometry
   - Door/window positioning calculations

2. **API Utilities** (`src/api/fetchRoomData.js`)
   - Fetches room data from backend
   - Transforms data for 3D rendering
   - Provides sample data for testing
   - Validates data structure

## Data Structure

### 3D Room Data Format

```javascript
{
  floor: {
    width: 40000,      // mm
    height: 25000,     // mm
    thickness: 200,    // mm
    elevation: 0       // mm
  },
  rooms: [
    {
      id: "room-1",
      name: "Living Room",
      x: 1000,         // mm
      y: 1000,         // mm
      width: 4000,     // mm
      height: 5000,    // mm
      wallHeight: 3000, // mm
      wallThickness: 200, // mm
      doors: [
        {
          id: "door-1",
          x: 1200,
          y: 1000,
          width: 900,
          height: 2100,
          sillHeight: 0,
          type: "Single",
          material: "Wood"
        }
      ],
      windows: [
        {
          id: "window-1",
          x: 2500,
          y: 1000,
          width: 1200,
          height: 1500,
          sillHeight: 900,
          type: "Double",
          material: "Aluminum"
        }
      ]
    }
  ]
}
```

## Features

### 1. Floor Rendering
- **Floor Slab**: Rendered as a 3D box with configurable dimensions
- **Material**: Standard concrete material with realistic properties
- **Shadows**: Receives shadows from walls and other objects

### 2. Room Rendering
- **Auto-Generated Walls**: Four walls automatically generated from room geometry
- **Wall Properties**: Configurable height, thickness, material, and type
- **Shared Walls**: Support for walls shared between adjacent rooms

### 3. Door Rendering
- **3D Geometry**: Doors rendered as 3D boxes with realistic dimensions
- **Material**: Wood material with appropriate texture and properties
- **Positioning**: Doors positioned along walls with proper alignment
- **Types**: Support for different door types (Single, Double, Sliding, etc.)

### 4. Window Rendering
- **Transparent Material**: Glass-like material with transparency
- **Sill Height**: Configurable window sill height
- **Types**: Support for different window types and glazing options
- **Positioning**: Windows positioned along walls with proper alignment

### 5. Interactive Features
- **Object Selection**: Click to select walls, doors, and windows
- **Camera Controls**: Orbit, pan, and zoom controls
- **Highlighting**: Selected objects highlighted with emissive material
- **Property Panel**: Object properties displayed in sidebar

### 6. View Modes
- **3D View**: Full 3D perspective rendering
- **2D View**: Top-down orthographic view
- **Split View**: Side-by-side 2D and 3D views

### 7. Camera Presets
- **Isometric**: Standard 3D view
- **Top**: Bird's eye view
- **Front**: Front elevation
- **Side**: Side elevation

## Installation and Setup

### Dependencies

```bash
npm install three @types/three --legacy-peer-deps
```

### Usage

#### Basic 3D Viewer

```jsx
import ThreeViewer from './components/3d/ThreeViewer';

function App() {
  return (
    <ThreeViewer
      onObjectClick={(objectData) => console.log('Clicked:', objectData)}
      selectedObjectId={null}
    />
  );
}
```

#### Complete 3D Page

```jsx
import ThreeDPage from './pages/ThreeDPage';

// Add to your routing
<Route path="/3d" element={<ThreeDPage />} />
```

#### View Toggle Integration

```jsx
import ViewToggle from './components/3d/ViewToggle';

function SomePage() {
  return (
    <div>
      <ViewToggle currentView="2d" />
      {/* Your existing 2D content */}
    </div>
  );
}
```

## API Reference

### ThreeRenderer Props

| Prop | Type | Description |
|------|------|-------------|
| `roomData` | Object | Room data structure for rendering |
| `onObjectClick` | Function | Callback when object is clicked |
| `selectedObjectId` | String | ID of currently selected object |

### ThreeViewer Props

| Prop | Type | Description |
|------|------|-------------|
| `onObjectClick` | Function | Callback when object is clicked |
| `selectedObjectId` | String | ID of currently selected object |
| `showSampleData` | Boolean | Whether to show sample data |

### Geometry Utilities

#### Unit Conversion

```javascript
import { pixelsToMm, mmToPixels, pixelsToMeters, metersToPixels } from './utils/geometry';

// Convert canvas pixels to real-world units
const wallThicknessMm = pixelsToMm(20); // 200mm
const roomWidthM = pixelsToMeters(5000); // 50m
```

#### Coordinate Transformation

```javascript
import { canvasToWorldCoords, worldToCanvasCoords } from './utils/geometry';

// Convert canvas coordinates to 3D world coordinates
const worldPos = canvasToWorldCoords(1000, 2000, 0);
// Returns: { x: 10, y: 0, z: 20 } (in meters)

// Convert 3D world coordinates to canvas coordinates
const canvasPos = worldToCanvasCoords(10, 0, 20);
// Returns: { x: 1000, y: 2000, z: 0 } (in pixels)
```

#### Wall Generation

```javascript
import { generateRoomWalls } from './utils/geometry';

const walls = generateRoomWalls({
  id: 'room-1',
  x: 1000,
  y: 1000,
  width: 4000,
  height: 5000,
  wallHeight: 3000,
  wallThickness: 200
});
```

## Integration with 2D Canvas

### Data Synchronization

The 3D module automatically syncs with the 2D Konva canvas through Redux state:

1. **Room Creation**: When rooms are created in 2D, they're automatically available in 3D
2. **Real-time Updates**: Changes in 2D are reflected in 3D view
3. **Object Selection**: Selection in 3D can be synchronized with 2D

### Coordinate System

- **2D Canvas**: Uses pixels (100px = 1m)
- **3D World**: Uses meters (1m = 1m)
- **Backend**: Uses millimeters (1000mm = 1m)

### Unit Conversion

```javascript
// Canvas to 3D conversion
const canvasX = 5000; // 50m in canvas
const worldX = pixelsToMeters(canvasX); // 50m in 3D

// 3D to canvas conversion
const worldZ = 30; // 30m in 3D
const canvasY = metersToPixels(worldZ); // 3000px in canvas
```

## Performance Optimization

### Rendering Optimization

1. **Object Pooling**: Reuse geometry and material objects
2. **Level of Detail**: Adjust detail based on camera distance
3. **Frustum Culling**: Only render visible objects
4. **Instanced Rendering**: Use instanced meshes for repeated objects

### Memory Management

1. **Dispose Resources**: Properly dispose of geometries and materials
2. **Texture Management**: Use texture atlases and compression
3. **Geometry Merging**: Merge static geometries where possible

## Troubleshooting

### Common Issues

1. **Objects Not Visible**
   - Check camera position and orientation
   - Verify object coordinates are in correct range
   - Ensure lighting is properly configured

2. **Performance Issues**
   - Reduce polygon count for complex objects
   - Use lower resolution textures
   - Implement level of detail system

3. **Coordinate Mismatches**
   - Verify unit conversion functions
   - Check coordinate system alignment
   - Ensure proper scaling factors

### Debug Tools

```javascript
// Enable Three.js debug helpers
import { AxesHelper, GridHelper } from 'three';

// Add to scene for debugging
scene.add(new AxesHelper(10));
scene.add(new GridHelper(100, 100));
```

## Future Enhancements

### Planned Features

1. **Advanced Materials**
   - PBR materials for realistic rendering
   - Texture mapping for walls and floors
   - Normal maps for surface detail

2. **Animation System**
   - Door opening/closing animations
   - Camera transitions
   - Object highlighting animations

3. **Export Functionality**
   - Screenshot capture
   - 3D model export (GLTF, OBJ)
   - Video recording

4. **Advanced Interactions**
   - Object dragging in 3D
   - Real-time editing
   - Measurement tools

5. **VR/AR Support**
   - WebXR integration
   - Mobile AR viewing
   - VR walkthrough mode

## Contributing

### Development Guidelines

1. **Code Style**: Follow existing React and Three.js patterns
2. **Performance**: Always consider rendering performance
3. **Testing**: Test with various room configurations
4. **Documentation**: Update documentation for new features

### Testing

```bash
# Run tests
npm test

# Test 3D rendering
npm run test:3d

# Performance testing
npm run test:performance
```

## License

This 3D module is part of the main project and follows the same licensing terms. 