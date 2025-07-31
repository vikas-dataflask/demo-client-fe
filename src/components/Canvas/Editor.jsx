import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import {
  setFloorLength,
  setFloorWidth,
  setFloorHeight,
  setFloorArea,
  setFloorVolume,
  setFloorRect,
} from "../../redux/features/app/floorSlice";
import EntityRender from "../../drawing/EntityRenderer";

const GRID_SIZE = 30;

export default function Editor() {
  const stageRef = useRef(null);
  const rectRef = useRef(null);
  const trRef = useRef(null);
  const data = useSelector((state) => state.floor.floor_dxf) || {};

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  const [scale, setScaleState] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [floorMode, setFloorMode] = useState(true);
  const [floor, setFloor] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const dispatch = useDispatch();
  const heightFromStore = useSelector((state) => state.floor.floor_height) || 3;
  const grid = useSelector((state) => state.editor.grid); // optional toggle

  const drawGrid = (width, height) => {
    const lines = [];
    const startX = Math.floor(-position.x / scale / GRID_SIZE) * GRID_SIZE;
    const endX =
      Math.ceil((width - position.x) / scale / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-position.y / scale / GRID_SIZE) * GRID_SIZE;
    const endY =
      Math.ceil((height - position.y) / scale / GRID_SIZE) * GRID_SIZE;

    for (let i = startX; i <= endX; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, startY, i, endY]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }

    for (let j = startY; j <= endY; j += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${j}`}
          points={[startX, j, endX, j]}
          stroke="#ccc"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const minScale = 0.5;
    const maxScale = 3;

    const oldScale = scale;
    const pointer = {
      x: e.evt.offsetX,
      y: e.evt.offsetY,
    };

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScaleState(newScale);
    setPosition(newPos);
  };

  const handleMouseDown = (e) => {
    if (!floorMode) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    setFloor({ x: point.x, y: point.y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = () => {
    if (!isDrawing || !floorMode) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();

    const newWidth = point.x - floor.x;
    const newHeight = point.y - floor.y;

    setFloor((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }));
  };

  // const handleMouseUp = () => {
  //   if (!isDrawing) return;
  //   setIsDrawing(false);
  //   setFloorMode(false);

  //   const length = Math.abs(floor.width / GRID_SIZE);
  //   const width = Math.abs(floor.height / GRID_SIZE);
  //   const height = heightFromStore;
  //   const area = length * width;
  //   const volume = area * height;

  //   dispatch(setFloorLength(length.toFixed(2)));
  //   dispatch(setFloorWidth(width.toFixed(2)));
  //   dispatch(setFloorHeight(height));
  //   dispatch(setFloorArea(area.toFixed(2)));
  //   dispatch(setFloorVolume(volume.toFixed(2)));
  // };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setFloorMode(false);

    const length = Math.abs(floor.width / GRID_SIZE);
    const width = Math.abs(floor.height / GRID_SIZE);
    const height = heightFromStore;
    const area = length * width;
    const volume = area * height;

    // Store the floor rectangle data
    const floorRect = {
      x: floor.width < 0 ? floor.x + floor.width : floor.x,
      y: floor.height < 0 ? floor.y + floor.height : floor.y,
      width: Math.abs(floor.width),
      height: Math.abs(floor.height),
    };

    dispatch(setFloorLength(length.toFixed(2)));
    dispatch(setFloorWidth(width.toFixed(2)));
    dispatch(setFloorHeight(height));
    dispatch(setFloorArea(area.toFixed(2)));
    dispatch(setFloorVolume(volume.toFixed(2)));
    dispatch(setFloorRect(floorRect));
  };
  useEffect(() => {
    if (rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [floor]);

  return (
    <div className="h-full relative">
      <p className="absolute top-2 left-2 bg-white p-2 rounded shadow z-10 text-sm">
        Zoom: {(scale * 100).toFixed(0)}%
      </p>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        {grid && (
          <Layer>{drawGrid(window.innerWidth, window.innerHeight)}</Layer>
        )}

        <Layer>
          {floor && (
            <>
              <Rect
                ref={rectRef}
                x={floor.x}
                y={floor.y}
                width={floor.width}
                height={floor.height}
                fill="rgba(0, 150, 255, 0.3)"
                stroke="blue"
                strokeWidth={2}
                draggable
                onTransformEnd={() => {
                  const node = rectRef.current;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  node.scaleX(1);
                  node.scaleY(1);

                  const newWidth = node.width() * scaleX;
                  const newHeight = node.height() * scaleY;

                  const newLength = newWidth / GRID_SIZE;
                  const newWidthUnits = newHeight / GRID_SIZE;
                  const height = heightFromStore;
                  const area = newLength * newWidthUnits;
                  const volume = area * height;

                  setFloor({
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                  });

                  dispatch(setFloorLength(newLength.toFixed(2)));
                  dispatch(setFloorWidth(newWidthUnits.toFixed(2)));
                  dispatch(setFloorArea(area.toFixed(2)));
                  dispatch(setFloorVolume(volume.toFixed(2)));

                  // Update floor rectangle data
                  const updatedFloorRect = {
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                  };
                  dispatch(setFloorRect(updatedFloorRect));
                }}
                onDragEnd={(e) => {
                  setFloor((prev) => ({
                    ...prev,
                    x: e.target.x(),
                    y: e.target.y(),
                  }));

                  // Update floor rectangle data on drag
                  const updatedFloorRect = {
                    x: e.target.x(),
                    y: e.target.y(),
                    width: floor.width,
                    height: floor.height,
                  };
                  dispatch(setFloorRect(updatedFloorRect));
                }}
              />
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
              />
            </>
          )}
        </Layer>
        <Layer>
          <EntityRender />
        </Layer>
      </Stage>
    </div>
  );
}
