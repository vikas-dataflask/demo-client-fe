import React from 'react';
import { Rect, Text, Group } from 'react-konva';
import { mmToPixels } from '../../utils/wallSnapping';

const DoorWindowRenderer = ({ 
  doors, 
  windows, 
  onDoorClick, 
  onWindowClick, 
  selectedDoor, 
  selectedWindow,
  showLabels = true 
}) => {
  
  // Render a door
  const renderDoor = (door) => {
    const doorId = door.id || door._id;
    const isSelected = selectedDoor && (selectedDoor.id || selectedDoor._id) === doorId;
    
    // Convert mm to pixels
    const width = mmToPixels(door.width);
    const height = mmToPixels(door.height);
    
    // Calculate door position and rotation
    const wallAngle = door.wallAngle || 0;
    const rotation = wallAngle;
    
    // Door styling based on type
    const getDoorStyle = () => {
      switch (door.doorType) {
        case 'Single':
          return { fill: '#8B4513', stroke: '#654321', strokeWidth: 1 };
        case 'Double':
          return { fill: '#A0522D', stroke: '#654321', strokeWidth: 1 };
        case 'Sliding':
          return { fill: '#CD853F', stroke: '#654321', strokeWidth: 1 };
        case 'Folding':
          return { fill: '#DEB887', stroke: '#654321', strokeWidth: 1 };
        case 'Revolving':
          return { fill: '#F4A460', stroke: '#654321', strokeWidth: 1 };
        default:
          return { fill: '#8B4513', stroke: '#654321', strokeWidth: 1 };
      }
    };
    
    const style = getDoorStyle();
    
    return (
      <Group
        key={doorId}
        x={door.position.x}
        y={door.position.y}
        rotation={rotation}
        onClick={() => onDoorClick && onDoorClick(door)}
        onTap={() => onDoorClick && onDoorClick(door)}
      >
        {/* Door rectangle */}
        <Rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          fill={isSelected ? '#FFD700' : style.fill}
          stroke={isSelected ? '#FF8C00' : style.stroke}
          strokeWidth={isSelected ? 2 : style.strokeWidth}
          cornerRadius={2}
        />
        
        {/* Door swing arc (for non-sliding doors) */}
        {door.doorType !== 'Sliding' && (
          <Rect
            x={-width / 2 - 5}
            y={-height / 2}
            width={10}
            height={height}
            fill="rgba(255, 255, 255, 0.3)"
            stroke="rgba(0, 0, 0, 0.5)"
            strokeWidth={1}
            cornerRadius={2}
          />
        )}
        
        {/* Door label */}
        {showLabels && (
          <Text
            x={-width / 2}
            y={-height / 2 - 20}
            width={width}
            text={`D${door.doorType?.charAt(0) || 'S'}`}
            fontSize={10}
            fill="#333"
            align="center"
            listening={false}
          />
        )}
        
        {/* Door dimensions */}
        {showLabels && (
          <Text
            x={-width / 2}
            y={-height / 2 + height + 5}
            width={width}
            text={`${(door.width / 1000).toFixed(1)}m`}
            fontSize={8}
            fill="#666"
            align="center"
            listening={false}
          />
        )}
      </Group>
    );
  };
  
  // Render a window
  const renderWindow = (window) => {
    const windowId = window.id || window._id;
    const isSelected = selectedWindow && (selectedWindow.id || selectedWindow._id) === windowId;
    
    // Convert mm to pixels
    const width = mmToPixels(window.width);
    const height = mmToPixels(window.height);
    
    // Calculate window position and rotation
    const wallAngle = window.wallAngle || 0;
    const rotation = wallAngle;
    
    // Window styling based on type
    const getWindowStyle = () => {
      switch (window.windowType) {
        case 'Single':
          return { fill: '#87CEEB', stroke: '#4682B4', strokeWidth: 1 };
        case 'Double':
          return { fill: '#B0E0E6', stroke: '#4682B4', strokeWidth: 1 };
        case 'D-glass':
          return { fill: '#E0F6FF', stroke: '#4682B4', strokeWidth: 1 };
        case 'Ventilation':
          return { fill: '#F0F8FF', stroke: '#4682B4', strokeWidth: 1 };
        case 'Fixed':
          return { fill: '#E6F3FF', stroke: '#4682B4', strokeWidth: 1 };
        case 'Sliding':
          return { fill: '#CCE5FF', stroke: '#4682B4', strokeWidth: 1 };
        default:
          return { fill: '#87CEEB', stroke: '#4682B4', strokeWidth: 1 };
      }
    };
    
    const style = getWindowStyle();
    
    return (
      <Group
        key={windowId}
        x={window.position.x}
        y={window.position.y}
        rotation={rotation}
        onClick={() => onWindowClick && onWindowClick(window)}
        onTap={() => onWindowClick && onWindowClick(window)}
      >
        {/* Window rectangle */}
        <Rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          fill={isSelected ? '#FFD700' : style.fill}
          stroke={isSelected ? '#FF8C00' : style.stroke}
          strokeWidth={isSelected ? 2 : style.strokeWidth}
          cornerRadius={2}
        />
        
        {/* Window mullions (dividers) */}
        <Rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={2}
          fill="rgba(255, 255, 255, 0.8)"
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth={1}
        />
        
        <Rect
          x={-width / 2}
          y={height / 2 - 2}
          width={width}
          height={2}
          fill="rgba(255, 255, 255, 0.8)"
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth={1}
        />
        
        {/* Window label */}
        {showLabels && (
          <Text
            x={-width / 2}
            y={-height / 2 - 20}
            width={width}
            text={`W${window.windowType?.charAt(0) || 'S'}`}
            fontSize={10}
            fill="#333"
            align="center"
            listening={false}
          />
        )}
        
        {/* Window dimensions */}
        {showLabels && (
          <Text
            x={-width / 2}
            y={-height / 2 + height + 5}
            width={width}
            text={`${(window.width / 1000).toFixed(1)}m`}
            fontSize={8}
            fill="#666"
            align="center"
            listening={false}
          />
        )}
      </Group>
    );
  };
  
  return (
    <>
      {/* Render doors */}
      {doors.map(renderDoor)}
      
      {/* Render windows */}
      {windows.map(renderWindow)}
    </>
  );
};

export default DoorWindowRenderer; 