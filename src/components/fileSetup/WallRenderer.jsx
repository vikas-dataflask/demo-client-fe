import React, { useState } from 'react';
import { Line, Rect, Text, Group } from 'react-konva';
import { useSelector } from 'react-redux';
import { selectPixelsPerMeter } from '../../redux/features/app/calibrationSlice';

const WallRenderer = ({ 
  walls, 
  scale, 
  selectedWallId, 
  onWallClick, 
  onWallHover,
  showWallLabels = true,
  showWallThickness = true 
}) => {
  const [hoveredWallId, setHoveredWallId] = useState(null);
  const pixelsPerMeter = useSelector(selectPixelsPerMeter); // Get calibrated scale from Redux

  const handleWallMouseEnter = (wallId) => {
    setHoveredWallId(wallId);
    if (onWallHover) {
      onWallHover(wallId, true);
    }
  };

  const handleWallMouseLeave = (wallId) => {
    setHoveredWallId(null);
    if (onWallHover) {
      onWallHover(wallId, false);
    }
  };

  const getWallColor = (wall, isSelected, isHovered) => {
    if (isSelected) return '#3B82F6'; // Blue for selected
    if (isHovered) return '#10B981'; // Green for hovered
    
    // Color based on wall type
    switch (wall.type) {
      case 'RCC':
        return '#6B7280'; // Gray
      case 'Brick':
        return '#DC2626'; // Red
      case 'Glass':
        return '#0EA5E9'; // Blue
      case 'Wood':
        return '#92400E'; // Brown
      case 'Steel':
        return '#374151'; // Dark gray
      default:
        return '#6B7280'; // Default gray
    }
  };

  const getWallThickness = (wall) => {
    // Convert mm to pixels using calibrated scale
    return (wall.thickness / 1000) * pixelsPerMeter; // Convert mm to meters, then to pixels using calibrated scale
  };

  const renderWall = (wall) => {
    const isSelected = selectedWallId === wall.id;
    const isHovered = hoveredWallId === wall.id;
    const wallColor = getWallColor(wall, isSelected, isHovered);
    const thickness = getWallThickness(wall);
    
    // Calculate wall direction
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return null;

    // Calculate perpendicular vector for thickness
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Calculate offset points for thick wall
    const offset = thickness / 2;
    const p1 = {
      x: wall.start.x + perpX * offset,
      y: wall.start.y + perpY * offset
    };
    const p2 = {
      x: wall.start.x - perpX * offset,
      y: wall.start.y - perpY * offset
    };
    const p3 = {
      x: wall.end.x - perpX * offset,
      y: wall.end.y - perpY * offset
    };
    const p4 = {
      x: wall.end.x + perpX * offset,
      y: wall.end.y + perpY * offset
    };

    const wallPoints = [p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y];

    return (
             <Group
         key={wall.id}
         name="wall"
         onClick={() => onWallClick && onWallClick(wall.id)}
         onMouseEnter={() => handleWallMouseEnter(wall.id)}
         onMouseLeave={() => handleWallMouseLeave(wall.id)}
       >
                 {/* Main wall body */}
         <Rect
           name="wall"
           points={wallPoints}
           fill={wallColor}
           stroke={isSelected ? '#1D4ED8' : isHovered ? '#059669' : '#374151'}
           strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
           opacity={0.8}
           closed={true}
         />
        
        {/* Wall center line */}
        <Line
          points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
          stroke={isSelected ? '#FFFFFF' : '#000000'}
          strokeWidth={1}
          opacity={0.6}
        />
        
        {/* Wall type label */}
        {showWallLabels && (
          <Text
            x={(wall.start.x + wall.end.x) / 2 - 20}
            y={(wall.start.y + wall.end.y) / 2 - 10}
            text={wall.type}
            fontSize={10}
            fill="#FFFFFF"
            fontFamily="Arial"
            fontStyle="bold"
            opacity={0.9}
            align="center"
            width={40}
          />
        )}
        
        {/* Wall thickness label on hover */}
        {isHovered && showWallThickness && (
          <Text
            x={(wall.start.x + wall.end.x) / 2 - 30}
            y={(wall.start.y + wall.end.y) / 2 + 15}
            text={`${wall.thickness}mm`}
            fontSize={8}
            fill="#000000"
            fontFamily="Arial"
            opacity={0.8}
            align="center"
            width={60}
            backgroundColor="#FFFFFF"
            padding={2}
          />
        )}
        
        {/* Room count indicator for shared walls */}
        {wall.roomIds.length > 1 && (
          <Rect
            x={(wall.start.x + wall.end.x) / 2 - 8}
            y={(wall.start.y + wall.end.y) / 2 - 8}
            width={16}
            height={16}
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth={1}
            cornerRadius={8}
          />
        )}
        
        {wall.roomIds.length > 1 && (
          <Text
            x={(wall.start.x + wall.end.x) / 2 - 4}
            y={(wall.start.y + wall.end.y) / 2 - 6}
            text={wall.roomIds.length.toString()}
            fontSize={10}
            fill="#FFFFFF"
            fontFamily="Arial"
            fontStyle="bold"
            align="center"
            width={8}
          />
        )}
      </Group>
    );
  };

  return (
    <>
      {walls.map(renderWall)}
    </>
  );
};

export default WallRenderer; 