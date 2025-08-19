import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Group, Image, Line, Circle, Rect, Text } from "react-konva";
import { setFloorDxf } from "../../redux/features/app/floorSlice";

export default function SvgRenderer() {
  const dxfData = useSelector((state) => state.floor.floor_dxf);
  const dispatch = useDispatch();
  const [svgImage, setSvgImage] = useState(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    // Check if we have SVG data from PDF conversion
    if (dxfData?.source === "pdf" && dxfData?.svg) {
      const svgString = dxfData.svg;
      
      // Create a blob URL from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create an image element to get dimensions
      const img = new window.Image();
      img.onload = () => {
        const dimensions = {
          width: img.width,
          height: img.height
        };
        setSvgDimensions(dimensions);
        setSvgImage(img);
        
        // Update the Redux state with SVG dimensions for better fitting
        dispatch(setFloorDxf({
          ...dxfData,
          svgDimensions: dimensions
        }));
      };
      img.src = url;
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setSvgImage(null);
      setSvgDimensions({ width: 0, height: 0 });
    }
  }, [dxfData]);

  // Don't render if no SVG data
  if (!svgImage || dxfData?.source !== "pdf") {
    return null;
  }

  // Calculate scaling to fit the SVG appropriately on the canvas
  const canvasWidth = 10000;
  const canvasHeight = 6000;
  const padding = 400; // Increased padding for better centering
  
  const maxWidth = canvasWidth - (padding * 2);
  const maxHeight = canvasHeight - (padding * 2);
  
  const scaleX = maxWidth / svgDimensions.width;
  const scaleY = maxHeight / svgDimensions.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
  
  const scaledWidth = svgDimensions.width * scale;
  const scaledHeight = svgDimensions.height * scale;
  
  // Center the SVG on the canvas with better positioning
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;

  console.log("SVG Renderer:", {
    originalDimensions: svgDimensions,
    scale,
    scaledDimensions: { width: scaledWidth, height: scaledHeight },
    position: { x, y }
  });

  return (
    <Group>
      {/* Canvas center indicator (for debugging) */}
      <Group>
        {/* Center crosshair */}
        <Line
          points={[canvasWidth/2 - 50, canvasHeight/2, canvasWidth/2 + 50, canvasHeight/2]}
          stroke="rgba(0, 255, 0, 0.3)"
          strokeWidth={2}
          dash={[5, 5]}
        />
        <Line
          points={[canvasWidth/2, canvasHeight/2 - 50, canvasWidth/2, canvasHeight/2 + 50]}
          stroke="rgba(0, 255, 0, 0.3)"
          strokeWidth={2}
          dash={[5, 5]}
        />
        {/* Center circle */}
        <Circle
          x={canvasWidth/2}
          y={canvasHeight/2}
          radius={10}
          fill="rgba(0, 255, 0, 0.2)"
          stroke="rgba(0, 255, 0, 0.5)"
          strokeWidth={2}
        />
      </Group>

      {/* SVG bounds indicator */}
      <Group>
        <Rect
          x={x - 5}
          y={y - 5}
          width={scaledWidth + 10}
          height={scaledHeight + 10}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(0, 0, 255, 0.3)"
          strokeWidth={2}
          cornerRadius={3}
        />
      </Group>
      
      {/* Render the SVG image */}
      <Image
        ref={imageRef}
        image={svgImage}
        x={x}
        y={y}
        width={scaledWidth}
        height={scaledHeight}
        listening={false} // Make it non-interactive for now
      />
      
      {/* SVG center indicator */}
      <Group>
        <Circle
          x={x + scaledWidth/2}
          y={y + scaledHeight/2}
          radius={8}
          fill="rgba(255, 0, 0, 0.3)"
          stroke="rgba(255, 0, 0, 0.7)"
          strokeWidth={2}
        />
      </Group>
      
      {/* Debug information */}
      <Group>
        <Text
          x={10}
          y={10}
          text={`SVG: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)} at (${x.toFixed(0)}, ${y.toFixed(0)})`}
          fontSize={12}
          fill="black"
          stroke="white"
          strokeWidth={1}
        />
        <Text
          x={10}
          y={30}
          text={`Canvas Center: (${(canvasWidth/2).toFixed(0)}, ${(canvasHeight/2).toFixed(0)})`}
          fontSize={12}
          fill="black"
          stroke="white"
          strokeWidth={1}
        />
        <Text
          x={10}
          y={50}
          text={`SVG Center: (${(x + scaledWidth/2).toFixed(0)}, ${(y + scaledHeight/2).toFixed(0)})`}
          fontSize={12}
          fill="black"
          stroke="white"
          strokeWidth={1}
        />
      </Group>
    </Group>
  );
}
