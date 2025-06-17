import React from "react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Arc,
  Text,
  Group,
  Ellipse,
} from "react-konva";
import { useEffect, useRef, useState } from "react";

const colorMap = {
  1: "red",
  2: "yellow",
  3: "green",
  4: "cyan",
  5: "blue",
  6: "magenta",
  7: "black",
  8: "gray",
  9: "darkgray",
  10: "#FF0000",
  11: "#FF7F7F",
  12: "#DC0000",
  13: "#DC7F7F",
};

const isValidNumber = (n) => typeof n === "number" && !isNaN(n);

const EntityRenderer = ({ entities = [], blocks = {}, layers = {} }) => {
  const stageWidth = window.innerWidth - 300; // adjust for sidebar
  const stageHeight = window.innerHeight - 100; // adjust for nav/header

  useEffect(() => {
    localStorage.setItem("entities", JSON.stringify(entities));
    localStorage.setItem("blocks", JSON.stringify(blocks));
    localStorage.setItem("layers", JSON.stringify(layers));
  }, [entities, blocks, layers]);

  console.log(entities);

  const getAllPoints = () => {
    const points = [];

    const addPoint = (x, y) => {
      if (typeof x === "number" && typeof y === "number") {
        points.push([x, y]);
      }
    };

    entities.forEach((entity) => {
      switch (entity.type) {
        case "LINE":
        case "POLYLINE":
        case "LWPOLYLINE":
        case "LEADER":
          (entity.vertices || []).forEach((v) => addPoint(v.x, v.y));
          break;
        case "CIRCLE":
        case "ARC":
        case "ELLIPSE":
        case "POINT":
        case "TEXT":
        case "MTEXT":
          if (entity.center) addPoint(entity.center.x, entity.center.y);
          if (entity.position) addPoint(entity.position.x, entity.position.y);
          break;
        case "DIMENSION":
          if (entity.start) addPoint(entity.start.x, entity.start.y);
          if (entity.end) addPoint(entity.end.x, entity.end.y);
          break;
        case "INSERT":
          if (entity.position) addPoint(entity.position.x, entity.position.y);
          break;
        default:
          break;
      }
    });

    return points;
  };

  const points = getAllPoints();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const drawingWidth = maxX - minX || 1;
  const drawingHeight = maxY - minY || 1;

  const scaleX = stageWidth / drawingWidth;
  const scaleY = stageHeight / drawingHeight;
  const scale = Math.min(scaleX, scaleY) * 2; // Add some padding

  const offsetX = -(minX + drawingWidth / 2);
  const offsetY = -(minY + drawingHeight / 2);

  const getColor = (entity) => {
    let colorNumber = entity.colorNumber;
    if (!isValidNumber(colorNumber) || colorNumber === 0) {
      const layerName = entity.layer;
      colorNumber = layers[layerName]?.color;
    }
    return colorMap[colorNumber] || "#000000";
  };

  const renderBlock = (name, insert, prefix) => {
    const block = blocks[name];
    if (!block) return null;

    const {
      position = { x: 0, y: 0 },
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
    } = insert;

    return (
      <Group
        key={prefix + name}
        x={position.x}
        y={-position.y}
        rotation={-rotation}
        scaleX={scaleX}
        scaleY={scaleY}
      >
        {block.entities.map((entity, i) =>
          renderEntity(entity, `${prefix}_${name}_${i}_`)
        )}
      </Group>
    );
  };

  const renderEntity = (entity, key) => {
    const stroke = getColor(entity);
    switch (entity.type) {
      case "LINE": {
        const [s, e] = entity.vertices ?? [];
        return (
          isValidNumber(s?.x) &&
          isValidNumber(e?.x) && (
            <Line
              key={key}
              points={[s.x, -s.y, e.x, -e.y]}
              stroke={stroke}
              strokeWidth={4}
            />
          )
        );
      }
      case "CIRCLE": {
        const { center, radius } = entity;
        return (
          <Circle
            key={key}
            x={center.x}
            y={-center.y}
            radius={radius}
            stroke={stroke}
            strokeWidth={4}
          />
        );
      }
      case "ARC": {
        const { center, radius, startAngle, endAngle } = entity;
        return (
          <Arc
            key={key}
            x={center.x}
            y={-center.y}
            innerRadius={radius}
            outerRadius={radius}
            angle={endAngle - startAngle}
            rotation={-startAngle}
            stroke={stroke}
            strokeWidth={4}
          />
        );
      }
      case "TEXT":
      case "MTEXT": {
        const { text, position, height = 12, rotation = 0 } = entity;
        if (/^[A-Z]$/i.test(entity.text) || /^[0-9]$/.test(entity.text))
          return null;

        return (
          <Text
            key={key}
            text={text}
            x={position.x}
            y={-position.y}
            fontSize={height}
            fill={stroke}
            rotation={-rotation}
          />
        );
      }
      case "POLYLINE":
      case "LWPOLYLINE": {
        const points = (entity.vertices || []).flatMap((v) => [v.x, -v.y]);
        return (
          <Line
            key={key}
            points={points}
            closed={entity.shape || entity.closed}
            stroke={stroke}
            strokeWidth={4}
          />
        );
      }
      case "ELLIPSE": {
        const { center, majorAxisEndPoint, axisRatio, rotation } = entity;
        const rx = Math.sqrt(
          majorAxisEndPoint.x ** 2 + majorAxisEndPoint.y ** 2
        );
        const ry = rx * axisRatio;
        return (
          <Ellipse
            key={key}
            x={center.x}
            y={-center.y}
            radiusX={rx}
            radiusY={ry}
            rotation={-rotation}
            stroke={stroke}
            strokeWidth={4}
          />
        );
      }
      case "POINT": {
        const { position } = entity;
        return (
          <Circle
            key={key}
            x={position.x}
            y={-position.y}
            radius={1.5}
            fill={stroke}
          />
        );
      }
      case "SOLID":
      case "TRACE": {
        const pts = (entity.points || []).map((p) => [p.x, -p.y]).flat();
        return (
          <Line
            key={key}
            points={pts}
            closed={true}
            fill={stroke}
            stroke={stroke}
          />
        );
      }
      case "SPLINE": {
        const points = (entity.controlPoints || [])
          .map((p) => [p.x, -p.y])
          .flat();
        return (
          <Line
            key={key}
            points={points}
            stroke={stroke}
            strokeWidth={4}
            tension={0.5}
          />
        );
      }
      case "HATCH": {
        if (!entity.paths) return null;
        return entity.paths.map((path, i) => {
          const pts = (path.edges || []).flatMap((edge) => {
            if (edge.vertices)
              return edge.vertices.map((v) => [v.x, -v.y]).flat();
            return [];
          });
          return (
            <Line
              key={`${key}_${i}`}
              points={pts}
              closed
              fill={stroke}
              stroke={stroke}
              opacity={0.6}
            />
          );
        });
      }
      case "DIMENSION": {
        const { textMidpoint, text, start, end } = entity;
        if (!start || !end || !textMidpoint) return null;
        return (
          <Group key={key}>
            <Line
              points={[start.x, -start.y, end.x, -end.y]}
              stroke={stroke}
              strokeWidth={4}
            />
            <Text
              x={textMidpoint.x}
              y={-textMidpoint.y}
              text={text || ""}
              fontSize={10}
              fill={stroke}
            />
          </Group>
        );
      }
      case "LEADER": {
        const pts = (entity.vertices || []).map((p) => [p.x, -p.y]).flat();
        if (pts.length < 4) return null;
        return <Line key={key} points={pts} stroke={stroke} strokeWidth={1} />;
      }
      case "XLINE":
      case "RAY": {
        const start = entity.start;
        const unit = entity.unitVector;
        if (!start || !unit) return null;

        const length = 10000;
        const end = {
          x: start.x + unit.x * length,
          y: start.y + unit.y * length,
        };
        return (
          <Line
            key={key}
            points={[start.x, -start.y, end.x, -end.y]}
            stroke={stroke}
            strokeWidth={4}
            dash={[10, 5]}
          />
        );
      }

      case "INSERT":
        return renderBlock(entity.name, entity, key);

      default:
        return null;
    }
  };

  return (
    <Stage width={1300} height={700}>
      <Layer
        scaleX={scale}
        scaleY={scale} // Flip Y axis
        x={stageWidth / 2 - 400}
        y={stageHeight / 2}
      >
        <Group offsetX={offsetX} offsetY={offsetY}>
          {entities.map((e, i) => renderEntity(e, `ent_${i}`))}
        </Group>
      </Layer>
    </Stage>
  );
};

export default EntityRenderer;
