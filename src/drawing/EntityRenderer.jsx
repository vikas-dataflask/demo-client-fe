import { Line, Text, Circle, Group, Arc, Ellipse, Rect } from "react-konva";
import { useSelector } from "react-redux";

const safeNum = (value, fallback = 0) =>
  typeof value === "number" && !isNaN(value) ? value : fallback;

export default function EntityRender({ entities = [], layers = [] }) {
  const floorBounds = useSelector((state) => state.floor.floor_bounds);
  const dxfData = useSelector((state) => state.floor.floor_dxf);

  // Debug: Log the entire floor state
  const entireFloorState = useSelector((state) => state.floor);
  console.log("Entire floor state:", entireFloorState);

  // Get entities from Redux store if not provided as props
  // The DXF data structure from dxf-parser includes: entities, layers, blocks, etc.
  const entitiesToRender =
    entities.length > 0 ? entities : dxfData?.entities || [];
  const layersToUse = layers.length > 0 ? layers : dxfData?.layers || [];

  // Debug logging
  console.log("EntityRenderer Debug:", {
    floorBounds,
    dxfData: dxfData ? "exists" : "null",
    dxfDataKeys: dxfData ? Object.keys(dxfData) : [],
    dxfEntitiesDirect: dxfData?.entities,
    dxfEntitiesLength: dxfData?.entities?.length,
    dxfLayersDirect: dxfData?.layers,
    dxfLayersLength: dxfData?.layers?.length,
    entitiesFromProps: entities.length,
    entitiesFromStore: dxfData?.entities?.length || 0,
    entitiesToRender: entitiesToRender.length,
    layersToUse: layersToUse.length,
  });

  // Don't render if no entities
  if (!entitiesToRender.length) {
    console.log("No entities to render");
    return null;
  }

  const getLayerColor = (layerName) => {
    const layer = layersToUse?.find((l) => l.name === layerName);
    // Use darker colors for better visibility, fallback to dark blue
    return layer?.color || "#1e40af"; // Dark blue as default
  };

  // If no floor bounds yet, render entities at their original scale and position
  if (!floorBounds) {
    console.log("No floor bounds, rendering entities at original scale");
    return (
      <Group>
        {/* Test rectangle to verify rendering */}
        <Rect
          x={100}
          y={100}
          width={200}
          height={100}
          fill="rgba(255, 0, 0, 0.3)"
          stroke="red"
          strokeWidth={2}
        />
        
        {entitiesToRender.map((entity) => {
          const layerColor = getLayerColor(entity.layer);

          switch (entity.type) {
            case "LINE":
              return (
                <Line
                  key={entity.handle}
                  points={[
                    safeNum(entity.vertices?.[0]?.x),
                    safeNum(entity.vertices?.[0]?.y),
                    safeNum(entity.vertices?.[1]?.x),
                    safeNum(entity.vertices?.[1]?.y),
                  ]}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "CIRCLE":
              return (
                <Circle
                  key={entity.handle}
                  x={safeNum(entity.center?.x)}
                  y={safeNum(entity.center?.y)}
                  radius={safeNum(entity.radius)}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "ARC":
              return (
                <Arc
                  key={entity.handle}
                  x={safeNum(entity.center?.x)}
                  y={safeNum(entity.center?.y)}
                  innerRadius={safeNum(entity.radius)}
                  outerRadius={safeNum(entity.radius)}
                  angle={safeNum(entity.endAngle) - safeNum(entity.startAngle)}
                  rotation={safeNum(entity.startAngle)}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "TEXT":
            case "MTEXT":
              return (
                <Text
                  key={entity.handle}
                  x={safeNum(entity.position?.x)}
                  y={safeNum(entity.position?.y)}
                  text={entity.text ?? ""}
                  fontSize={safeNum(entity.height, 12)}
                  fill={layerColor}
                  rotation={safeNum(entity.rotation)}
                  offsetY={safeNum(entity.height, 12) / 2}
                />
              );

            case "ELLIPSE":
              return (
                <Ellipse
                  key={entity.handle}
                  x={safeNum(entity.center?.x)}
                  y={safeNum(entity.center?.y)}
                  radiusX={safeNum(entity.majorAxis?.x)}
                  radiusY={safeNum(entity.majorAxis?.y)}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "POINT":
              return (
                <Circle
                  key={entity.handle}
                  x={safeNum(entity.position?.x)}
                  y={safeNum(entity.position?.y)}
                  radius={5}
                  fill={layerColor}
                />
              );

            case "POLYLINE":
            case "LWPOLYLINE":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.vertices?.flatMap((v) => [
                      safeNum(v.x),
                      safeNum(v.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                  closed={!!entity.closed}
                />
              );

            case "SOLID":
            case "TRACE":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.points?.flatMap((p) => [
                      safeNum(p.x),
                      safeNum(p.y),
                    ]) || []
                  }
                  fill={layerColor}
                  closed
                />
              );

            case "SPLINE":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.controlPoints?.flatMap((p) => [
                      safeNum(p.x),
                      safeNum(p.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                  tension={0.5}
                />
              );

            case "XLINE":
            case "RAY":
            case "DIMENSION":
            case "LEADER":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.vertices?.flatMap((v) => [
                      safeNum(v.x),
                      safeNum(v.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "HATCH":
              return entity.polylines?.map((poly, index) => (
                <Line
                  key={`${entity.handle}-${index}`}
                  points={
                    poly?.vertices?.flatMap((v) => [
                      safeNum(v.x),
                      safeNum(v.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                  closed={poly.closed}
                />
              ));

            default:
              return null;
          }
        })}
      </Group>
    );
  }

  // If floor bounds exist, scale and position entities to fit within the floor
  console.log("Floor bounds exist, scaling entities to fit");
  const getEntityBounds = () => {
    const allPoints = [];

    entitiesToRender.forEach((entity) => {
      if (entity.vertices) {
        entity.vertices.forEach((v) =>
          allPoints.push([safeNum(v.x), safeNum(v.y)])
        );
      } else if (entity.center) {
        allPoints.push([safeNum(entity.center.x), safeNum(entity.center.y)]);
      } else if (entity.position) {
        allPoints.push([
          safeNum(entity.position.x),
          safeNum(entity.position.y),
        ]);
      }
    });

    if (allPoints.length === 0) {
      return { minX: 0, minY: 0, width: 1, height: 1 };
    }

    const xs = allPoints.map(([x]) => x);
    const ys = allPoints.map(([, y]) => y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      minY,
      width: maxX - minX || 1,
      height: maxY - minY || 1,
    };
  };

  const bounds = getEntityBounds();
  console.log("Entity bounds:", bounds);
  console.log("Floor bounds:", floorBounds);

  // Calculate scale to fit entities within floor bounds with padding
  const padding = 0; // No padding
  const availableWidth = floorBounds.width - padding * 2;
  const availableHeight = floorBounds.height - padding * 2;
  
  const scaleX = availableWidth / bounds.width;
  const scaleY = availableHeight / bounds.height;
  const scale = Math.min(scaleX, scaleY);

  // Calculate the scaled dimensions of the entities
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;

  // Calculate position to center the entities within the floor
  const centerX = floorBounds.x + (floorBounds.width - scaledWidth) / 2;
  const centerY = floorBounds.y + (floorBounds.height - scaledHeight) / 2;

  console.log("Scaling:", { 
    scaleX, 
    scaleY, 
    scale, 
    availableWidth, 
    availableHeight,
    scaledWidth,
    scaledHeight,
    centerX,
    centerY
  });

  return (
    <Group>
      {/* Visual indicator of the safe area within floor bounds */}
      <Rect
        x={floorBounds.x + 40}
        y={floorBounds.y + 40}
        width={floorBounds.width - 80}
        height={floorBounds.height - 80}
        fill="rgba(255, 255, 0, 0.05)"
        stroke="rgba(255, 255, 0, 0.3)"
        strokeWidth={1}
        dash={[5, 5]}
      />
      
      <Group
        x={centerX}
        y={centerY}
        scaleX={scale}
        scaleY={scale}
        offsetX={bounds.minX}
        offsetY={bounds.minY}
      >
        {entitiesToRender.map((entity) => {
          const layerColor = getLayerColor(entity.layer);

          switch (entity.type) {
            case "LINE":
              return (
                <Line
                  key={entity.handle}
                  points={[
                    safeNum(entity.vertices?.[0]?.x),
                    safeNum(entity.vertices?.[0]?.y),
                    safeNum(entity.vertices?.[1]?.x),
                    safeNum(entity.vertices?.[1]?.y),
                  ]}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "CIRCLE":
              return (
                <Circle
                  key={entity.handle}
                  x={safeNum(entity.center?.x)}
                  y={safeNum(entity.center?.y)}
                  radius={safeNum(entity.radius)}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "ARC":
              return (
                <Arc
                  key={entity.handle}
                  x={safeNum(entity.center?.x)}
                  y={safeNum(entity.center?.y)}
                  innerRadius={safeNum(entity.radius)}
                  outerRadius={safeNum(entity.radius)}
                  angle={safeNum(entity.endAngle) - safeNum(entity.startAngle)}
                  rotation={safeNum(entity.startAngle)}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "TEXT":
            case "MTEXT":
              return (
                <Text
                  key={entity.handle}
                  x={safeNum(entity.position?.x)}
                  y={safeNum(entity.position?.y)}
                  text={entity.text ?? ""}
                  fontSize={safeNum(entity.height, 12)}
                  fill={layerColor}
                  rotation={safeNum(entity.rotation)}
                  offsetY={safeNum(entity.height, 12) / 2}
                />
              );

            case "ELLIPSE":
              return (
                <Ellipse
                  key={entity.handle}
                  x={safeNum(entity.center?.x)}
                  y={safeNum(entity.center?.y)}
                  radiusX={safeNum(entity.majorAxis?.x)}
                  radiusY={safeNum(entity.majorAxis?.y)}
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "POINT":
              return (
                <Circle
                  key={entity.handle}
                  x={safeNum(entity.position?.x)}
                  y={safeNum(entity.position?.y)}
                  radius={5}
                  fill={layerColor}
                />
              );

            case "POLYLINE":
            case "LWPOLYLINE":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.vertices?.flatMap((v) => [
                      safeNum(v.x),
                      safeNum(v.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                  closed={!!entity.closed}
                />
              );

            case "SOLID":
            case "TRACE":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.points?.flatMap((p) => [
                      safeNum(p.x),
                      safeNum(p.y),
                    ]) || []
                  }
                  fill={layerColor}
                  closed
                />
              );

            case "SPLINE":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.controlPoints?.flatMap((p) => [
                      safeNum(p.x),
                      safeNum(p.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                  tension={0.5}
                />
              );

            case "XLINE":
            case "RAY":
            case "DIMENSION":
            case "LEADER":
              return (
                <Line
                  key={entity.handle}
                  points={
                    entity.vertices?.flatMap((v) => [
                      safeNum(v.x),
                      safeNum(v.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                />
              );

            case "HATCH":
              return entity.polylines?.map((poly, index) => (
                <Line
                  key={`${entity.handle}-${index}`}
                  points={
                    poly?.vertices?.flatMap((v) => [
                      safeNum(v.x),
                      safeNum(v.y),
                    ]) || []
                  }
                  stroke={layerColor}
                  strokeWidth={6}
                  closed={poly.closed}
                />
              ));

            default:
              return null;
          }
        })}
      </Group>
    </Group>
  );
}
