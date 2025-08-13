import React from 'react';
import { Line, Text, Group } from 'react-konva';
import { useSelector } from 'react-redux';
import { selectAllWalls, selectHighlightedWalls, selectSelectedWall } from '../../redux/features/app/wallSlice';
import { wallUtils } from '../../utils/wallApi';

const WallRenderer = ({ 
  onWallClick, 
  onWallHover, 
  onWallLeave,
  showWallLabels = false,
  showWallThickness = true,
  highlightSelectedRoom = null 
}) => {
  const allWalls = useSelector(selectAllWalls);
  const highlightedWalls = useSelector(selectHighlightedWalls);
  const selectedWall = useSelector(selectSelectedWall);

  const handleWallClick = (wall) => {
    if (onWallClick) {
      onWallClick(wall);
    }
  };

  const handleWallHover = (wall) => {
    if (onWallHover) {
      onWallHover(wall);
    }
  };

  const handleWallLeave = () => {
    if (onWallLeave) {
      onWallLeave();
    }
  };

  const renderWall = (wall) => {
    const wallId = wall.id || wall._id;
    const isHighlighted = highlightedWalls.some(hw => (hw.id || hw._id) === wallId);
    const isSelected = selectedWall && (selectedWall.id || selectedWall._id) === wallId;
    const isShared = wall.connectedRooms.length > 1;
    
    // Determine wall styling
    const baseColor = wallUtils.getWallColor(wall.type);
    const strokeWidth = showWallThickness ? wallUtils.getWallStrokeWidth(wall.thickness) : 3;
    
    let strokeColor = baseColor;
    let opacity = 1.0; // Make walls fully opaque for debugging
    
    if (isSelected) {
      strokeColor = '#FF6B6B'; // Red for selected
      opacity = 1;
    } else if (isHighlighted) {
      strokeColor = '#4ECDC4'; // Teal for highlighted
      opacity = 0.9;
    } else if (isShared) {
      strokeColor = '#45B7D1'; // Blue for shared walls
      opacity = 0.85;
    }

    // Calculate wall center for label
    const centerX = (wall.start.x + wall.end.x) / 2;
    const centerY = (wall.start.y + wall.end.y) / 2;
    const wallLength = wallUtils.getWallLength(wall);
    const wallAngle = wallUtils.getWallAngle(wall);

    return (
      <Group key={wallId}>
        {/* Main wall line */}
        <Line
          points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          lineCap="round"
          lineJoin="round"
          listening={true}
          onClick={() => handleWallClick(wall)}
          onMouseEnter={() => handleWallHover(wall)}
          onMouseLeave={handleWallLeave}
          name="wall-line"
          data-wall-id={wallId}
        />
        
        {/* Wall label (optional) */}
        {showWallLabels && (
          <Text
            x={centerX - 30}
            y={centerY - 10}
            text={`${wall.type}\n${wallLength.toFixed(1)}px`}
            fontSize={10}
            fill={strokeColor}
            align="center"
            opacity={0.7}
            rotation={wallAngle}
            listening={false}
          />
        )}
        
        {/* Wall thickness indicator (for thick walls) */}
        {showWallThickness && wall.thickness > 200 && (
          <Line
            points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 2}
            opacity={0.3}
            lineCap="round"
            lineJoin="round"
            listening={false}
            name="wall-thickness-indicator"
          />
        )}
        
        {/* Shared wall indicator */}
        {isShared && (
          <Line
            points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
            stroke="#FFD700"
            strokeWidth={1}
            opacity={0.6}
            dash={[3, 3]}
            lineCap="round"
            lineJoin="round"
            listening={false}
            name="shared-wall-indicator"
          />
        )}
      </Group>
    );
  };

  // Filter walls based on highlightSelectedRoom
  const wallsToRender = highlightSelectedRoom 
    ? allWalls.filter(wall => wall.connectedRooms.includes(highlightSelectedRoom))
    : allWalls;

  // Debug: Check if walls have valid coordinates
  wallsToRender.forEach((wall, index) => {
    if (!wall.start || !wall.end || 
        typeof wall.start.x !== 'number' || typeof wall.start.y !== 'number' ||
        typeof wall.end.x !== 'number' || typeof wall.end.y !== 'number') {
      console.error(`Wall ${index} has invalid coordinates:`, wall);
    }
  });

  console.log('WallRenderer - Total walls:', allWalls.length, 'Walls to render:', wallsToRender.length, 'Highlight room:', highlightSelectedRoom);
  console.log('WallRenderer - All walls:', allWalls);
  console.log('WallRenderer - Walls to render:', wallsToRender);
  
  // Debug: Log each wall being rendered
  wallsToRender.forEach((wall, index) => {
    console.log(`Wall ${index}:`, {
      id: wall.id || wall._id,
      _id: wall._id,
      start: wall.start,
      end: wall.end,
      connectedRooms: wall.connectedRooms,
      type: wall.type
    });
  });

  return (
    <>
      {/* Debug: Add a test wall to verify rendering works */}
      <Line
        points={[100, 100, 300, 100]}
        stroke="red"
        strokeWidth={5}
        opacity={1}
        listening={false}
      />
      {wallsToRender.map((wall) => renderWall(wall))}
    </>
  );
};

export default WallRenderer; 