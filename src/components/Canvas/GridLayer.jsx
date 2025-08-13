import React from 'react';
import { Layer, Line } from 'react-konva';

const GridLayer = ({ 
  width, 
  height, 
  scale, 
  position, 
  gridSize = 100, 
  color = "#ccc", 
  opacity = 0.5,
  strokeWidth = 1 
}) => {
  const lines = [];
  
  // Calculate grid bounds based on current view
  const startX = Math.floor(-position.x / scale / gridSize) * gridSize;
  const endX = Math.ceil((width - position.x) / scale / gridSize) * gridSize;
  const startY = Math.floor(-position.y / scale / gridSize) * gridSize;
  const endY = Math.ceil((height - position.y) / scale / gridSize) * gridSize;

  // Vertical lines
  for (let i = startX; i <= endX; i += gridSize) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, startY, i, endY]}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    );
  }

  // Horizontal lines
  for (let j = startY; j <= endY; j += gridSize) {
    lines.push(
      <Line
        key={`h-${j}`}
        points={[startX, j, endX, j]}
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    );
  }

  return <Layer>{lines}</Layer>;
};

export default GridLayer; 