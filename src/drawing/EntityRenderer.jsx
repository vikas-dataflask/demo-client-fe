import { Line, Text, Circle, Group, Arc, Ellipse } from "react-konva";
import { useSelector } from "react-redux";

const safeNum = (value, fallback = 0) =>
  typeof value === "number" && !isNaN(value) ? value : fallback;

export default function EntityRender({ entities = [], layers = [] }) {
  const floorBounds = useSelector((state) => state.floor.floor_bounds);
  if (!floorBounds || !entities.length) return null;

  const getLayerColor = (layerName) => {
    const layer = layers?.find((l) => l.name === layerName);
    return layer?.color || "black";
  };

  const getEntityBounds = () => {
    const allPoints = [];

    entities.forEach((entity) => {
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

  const scaleX = floorBounds.width / bounds.width;
  const scaleY = floorBounds.height / bounds.height;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = bounds.minX;
  const offsetY = bounds.minY;

  return (
    <Group
      x={floorBounds.x}
      y={floorBounds.y}
      scaleX={scale}
      scaleY={scale}
      offsetX={offsetX}
      offsetY={offsetY}
    >
      {entities.map((entity) => {
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
                strokeWidth={1}
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
                strokeWidth={1}
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
                strokeWidth={1}
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
              />
            );

          case "POINT":
            return (
              <Circle
                key={entity.handle}
                x={safeNum(entity.position?.x)}
                y={safeNum(entity.position?.y)}
                radius={1.5}
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
                strokeWidth={1}
                closed={!!entity.closed}
              />
            );

          case "SOLID":
          case "TRACE":
            return (
              <Line
                key={entity.handle}
                points={
                  entity.points?.flatMap((p) => [safeNum(p.x), safeNum(p.y)]) ||
                  []
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
                strokeWidth={1}
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
                strokeWidth={1}
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
                strokeWidth={1}
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
