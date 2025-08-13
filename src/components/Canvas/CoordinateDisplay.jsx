import React, { useState, useEffect } from 'react';
import { GRID_UNITS, pixelToRealWorld, formatCoordinates, getUnitSymbol } from '../../utils/gridUtils';

const CoordinateDisplay = ({ 
  getMouseCoordinates, 
  unit = GRID_UNITS.METERS,
  isVisible = true,
  position = 'bottom-left', // 'bottom-left', 'floating', 'top-right'
  scale = 1,
  stageRef = null
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [coordinates, setCoordinates] = useState({
    formatted: { x: '0.00', y: '0.00' },
    real: { x: 0, y: 0 },
    pixel: { x: 0, y: 0 }
  });
  const [isMouseOver, setIsMouseOver] = useState(true); // Always show when enabled for bottom-right position

  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (e) => {
      let x, y;
      
      if (stageRef && stageRef.current) {
        // Use Konva stage for more accurate coordinates
        const stage = stageRef.current;
        const pointerPos = stage.getPointerPosition();
        if (pointerPos) {
          x = pointerPos.x;
          y = pointerPos.y;
        } else {
          const rect = e.target.getBoundingClientRect();
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        }
      } else {
        const rect = e.target.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      setMousePosition({ x, y });
      
      if (getMouseCoordinates) {
        const coords = getMouseCoordinates(x, y);
        setCoordinates(coords);
      } else {
        // Default coordinate calculation
        const realX = pixelToRealWorld(x, scale, unit);
        const realY = pixelToRealWorld(y, scale, unit);
        const formatted = formatCoordinates(realX, realY, unit);
        
        setCoordinates({
          formatted,
          real: { x: realX, y: realY },
          pixel: { x, y }
        });
      }
      
      setIsMouseOver(true);
    };

    const handleMouseLeave = () => {
      setIsMouseOver(false);
    };

    const canvasContainer = document.querySelector('.konvajs-content');
    if (canvasContainer) {
      canvasContainer.addEventListener('mousemove', handleMouseMove);
      canvasContainer.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        canvasContainer.removeEventListener('mousemove', handleMouseMove);
        canvasContainer.removeEventListener('mouseleave', handleMouseLeave);
      };
    } else {
      // Fallback to document if konvajs-content is not found
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isVisible, getMouseCoordinates, unit, scale]);

  if (!isVisible || !coordinates) {
    return null;
  }

  const { formatted, real, pixel } = coordinates;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed', // Use fixed positioning for better positioning
      zIndex: 1000,
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease'
    };

    switch (position) {
      case 'floating':
        return {
          ...baseStyles,
          position: 'absolute', // Use absolute for floating to follow mouse
          left: `${Math.min(mousePosition.x + 15, window.innerWidth - 200)}px`,
          top: `${Math.max(mousePosition.y - 50, 10)}px`
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: '20px',
          right: '20px'
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '20px',
          right: '20px'
        };
      case 'bottom-left':
      default:
        return {
          ...baseStyles,
          bottom: '20px',
          left: '20px'
        };
    }
  };

  const unitSymbol = getUnitSymbol(unit);

  return (
    <div
      style={{
        ...getPositionStyles(),
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        lineHeight: '1.4',
        minWidth: '120px',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#60a5fa' }}>
        Coordinates ({unitSymbol})
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>X:</span>
        <span>{formatted.x}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Y:</span>
        <span>{formatted.y}</span>
      </div>
      
              {import.meta.env.DEV && (
        <>
          <div style={{ 
            height: '1px', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            margin: '4px 0' 
          }}></div>
          <div style={{ fontSize: '10px', color: '#9ca3af' }}>
            <div>Pixel: {pixel.x.toFixed(0)}, {pixel.y.toFixed(0)}</div>
            <div>Real: {real.x.toFixed(3)}, {real.y.toFixed(3)}</div>
          </div>
        </>
      )}
    </div>
  );
};

// Shape Coordinate Display Component
export const ShapeCoordinateDisplay = ({ 
  shape, 
  unit = GRID_UNITS.METERS,
  pixelToRealWorld,
  isVisible = false 
}) => {
  if (!isVisible || !shape || !pixelToRealWorld) {
    return null;
  }

  const realX = pixelToRealWorld(shape.x);
  const realY = pixelToRealWorld(shape.y);
  const unitSymbol = getUnitSymbol(unit);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${shape.x + 5}px`,
        top: `${shape.y - 35}px`,
        backgroundColor: 'rgba(37, 99, 235, 0.95)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      {realX.toFixed(2)}{unitSymbol}, {realY.toFixed(2)}{unitSymbol}
    </div>
  );
};

export default CoordinateDisplay; 