import React from 'react';
import { Line, Text, Group } from 'react-konva';

const MeasurementLine = ({ 
  startPoint, 
  endPoint, 
  measurement, 
  unit,
  isActive = false 
}) => {
  if (!startPoint || !endPoint) return null;

  const centerX = (startPoint.x + endPoint.x) / 2;
  const centerY = (startPoint.y + endPoint.y) / 2;
  
  // Calculate angle for text rotation
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
  const degrees = (angle * 180) / Math.PI;

  return (
    <Group>
      {/* Measurement Line */}
      <Line
        points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
        stroke={isActive ? "#3b82f6" : "#6b7280"}
        strokeWidth={isActive ? 40 : 20}
        dash={[5, 5]}
        opacity={0.8}
      />
      
      {/* Start Point */}
      <Line
        points={[startPoint.x - 3, startPoint.y - 3, startPoint.x + 3, startPoint.y + 3]}
        stroke={isActive ? "#3b82f6" : "#6b7280"}
        strokeWidth={40}
      />
      <Line
        points={[startPoint.x - 3, startPoint.y + 3, startPoint.x + 3, startPoint.y - 3]}
        stroke={isActive ? "#3b82f6" : "#6b7280"}
        strokeWidth={40}
      />
      
      {/* End Point */}
      <Line
        points={[endPoint.x - 3, endPoint.y - 3, endPoint.x + 3, endPoint.y + 3]}
        stroke={isActive ? "#3b82f6" : "#6b7280"}
        strokeWidth={40}
      />
      <Line
        points={[endPoint.x - 3, endPoint.y + 3, endPoint.x + 3, endPoint.y - 3]}
        stroke={isActive ? "#3b82f6" : "#6b7280"}
        strokeWidth={40}
      />
      
      {/* Measurement Text */}
      <Text
        x={centerX}
        y={centerY - 10}
        text={measurement}
        fontSize={150}
        fontFamily="monospace"
        fill={isActive ? "#3b82f6" : "#6b7280"}
        backgroundColor={isActive ? "rgba(59, 130, 246, 0.1)" : "rgba(107, 114, 128, 0.1)"}
        padding={4}
        borderRadius={4}
        rotation={degrees}
        offsetX={measurement.length * 3}
        offsetY={6}
        align="center"
      />
    </Group>
  );
};

export default MeasurementLine; 