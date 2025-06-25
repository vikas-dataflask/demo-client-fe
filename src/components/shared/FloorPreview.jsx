// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { Stage, Layer, Rect, Line, Circle } from "react-konva";
// import { useSelector, useDispatch } from "react-redux";
// import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
// import EntityRender from "../../drawing/EntityRenderer";
// import { setRoomLights } from "../../redux/features/app/lightingSlice";

// const FloorPreview = ({
//   drawingMode,
//   exitDrawingMode,
//   roomId,
//   numberOfLights,
// }) => {
//   const dispatch = useDispatch();
//   const rooms = useSelector((s) => s.rooms);
//   const floor = useSelector((s) => s.floorPlan.rect);
//   const lightsByRoom = useSelector((s) => s.lighting.lightsByRoom);

//   const [numLightsInput, setNumLightsInput] = useState(numberOfLights);
//   const [points, setPoints] = useState([]);
//   const [drawing, setDrawing] = useState(false);
//   const [editing, setEditing] = useState(false);

//   const room = rooms.find((r) => r.id === roomId);

//   const { projectId } = useParams();
//   const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);
//   const entities = data?.dxf_entities || [];
//   const blocks = data?.dxf_blocks || {};
//   const layers = data?.dxf_layers || {};

//   const clamp = (p) => ({
//     x: Math.max(room.x, Math.min(p.x, room.x + room.width)),
//     y: Math.max(room.y, Math.min(p.y, room.y + room.height)),
//   });

//   const updateLights = (pts, skipDispatch = false) => {
//     const [x1, y1, x2, y2] = pts;
//     const n = numLightsInput || 0;
//     if (n < 1) return;

//     const totalLen = Math.hypot(x2 - x1, y2 - y1);
//     const step = n === 1 ? 0 : totalLen / (n - 1);
//     const dirX = (x2 - x1) / totalLen;
//     const dirY = (y2 - y1) / totalLen;

//     const margin = Math.min(20, step / 2);
//     const effLen = totalLen - 2 * margin;
//     const effStep = n === 1 ? 0 : effLen / (n - 1);

//     const lights = Array.from({ length: n }, (_, i) => {
//       const dist = margin + effStep * i;
//       return clamp({ x: x1 + dirX * dist, y: y1 + dirY * dist });
//     });

//     if (!skipDispatch && roomId) {
//       dispatch(setRoomLights({ roomId, lights, points: pts, count: n }));
//     }
//   };

//   const handleMouseDown = (e) => {
//     if (drawingMode !== "line" || drawing || !room) return;
//     const pos = e.target.getStage().getPointerPosition();
//     const p0 = clamp(pos);
//     setPoints([p0.x, p0.y, p0.x, p0.y]);
//     setDrawing(true);
//   };

//   const handleMouseMove = (e) => {
//     if (!drawing || editing) return;
//     const pos = e.target.getStage().getPointerPosition();
//     const p2 = clamp(pos);
//     setPoints(([x1, y1]) => [x1, y1, p2.x, p2.y]);
//   };

//   const handleMouseUp = () => {
//     if (!drawing) return;
//     updateLights(points);
//     setDrawing(false);
//     exitDrawingMode();
//   };

//   const handleAnchorDrag = (idx, e) => {
//     const p = clamp(e.target.position());
//     setPoints((prevPts) => {
//       const newPts = [...prevPts];
//       newPts[idx * 2] = p.x;
//       newPts[idx * 2 + 1] = p.y;
//       return newPts;
//     });
//   };

//   useEffect(() => {
//     if (roomId) {
//       const roomData = lightsByRoom[roomId];
//       if (roomData?.count) {
//         setNumLightsInput(roomData.count);
//       } else {
//         setNumLightsInput(numberOfLights); // fallback
//       }
//     }
//   }, [roomId, lightsByRoom, numberOfLights]);

//   useEffect(() => {
//     if (!roomId) return;
//     const roomData = lightsByRoom[roomId];

//     if (roomData?.points?.length === 4) {
//       setPoints(roomData.points);
//       setEditing(true);
//     } else {
//       setPoints([]);
//       setEditing(false);
//     }
//   }, [roomId, lightsByRoom]);

//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Error loading project.</div>;

//   return (
//     <Stage
//       width={window.innerWidth - 410}
//       height={window.innerHeight}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//     >
//       <Layer>
//         {/* Render DXF Entities or Fallback Floor */}
//         {entities.length ? (
//           <EntityRender entities={entities} blocks={blocks} layers={layers} />
//         ) : (
//           floor && (
//             <Rect
//               {...floor}
//               fill="rgba(200,200,200,0.5)"
//               stroke="black"
//               strokeWidth={2}
//             />
//           )
//         )}

//         {/* Render Rooms */}
//         {rooms.map((r) => (
//           <Rect
//             key={r.id}
//             {...r}
//             fill="rgba(100,200,100,0.5)"
//             stroke="black"
//             strokeWidth={1}
//           />
//         ))}

//         {/* Render Lights for All Rooms */}
//         {Object.entries(lightsByRoom).map(([rid, data]) => {
//           const lights = data?.lights;
//           const pts = data?.points;

//           if (!lights?.length || !pts) return null;

//           return (
//             <React.Fragment key={rid}>
//               <Line
//                 points={pts}
//                 stroke="gray"
//                 strokeWidth={2}
//                 strokeScaleEnabled={false}
//                 lineCap="round"
//               />
//               {lights.map((l, i) => (
//                 <Circle
//                   key={`${rid}-${i}`}
//                   x={l.x}
//                   y={l.y}
//                   radius={5}
//                   fill="#FFD700"
//                   stroke="black"
//                 />
//               ))}
//             </React.Fragment>
//           );
//         })}

//         {/* Active Room Editable Line */}
//         {points.length === 4 && (
//           <>
//             <Line
//               points={points}
//               stroke="blue"
//               strokeWidth={2}
//               strokeScaleEnabled={false}
//               lineCap="round"
//               dash={[6, 2]}
//               onClick={() => setEditing((e) => !e)}
//             />
//             {editing &&
//               [0, 1].map((i) => (
//                 <Circle
//                   key={i}
//                   x={points[i * 2]}
//                   y={points[i * 2 + 1]}
//                   radius={8}
//                   fill="#fff"
//                   stroke="black"
//                   draggable
//                   onDragMove={(e) => handleAnchorDrag(i, e)}
//                   onDragEnd={() => updateLights(points)}
//                 />
//               ))}
//           </>
//         )}
//       </Layer>
//     </Stage>
//   );
// };

// export default FloorPreview;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Stage, Layer, Rect, Line, Circle } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import EntityRender from "../../drawing/EntityRenderer";
import { setRoomLights } from "../../redux/features/app/lightingSlice";

const FloorPreview = ({
  drawingMode,
  exitDrawingMode,
  roomId,
  numberOfLights,
}) => {
  const dispatch = useDispatch();
  const rooms = useSelector((s) => s.rooms);
  const floor = useSelector((s) => s.floorPlan.rect);
  const lightsByRoom = useSelector((s) => s.lighting.lightsByRoom);

  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);

  const room = rooms.find((r) => r.id === roomId);
  const roomLightData = roomId ? lightsByRoom[roomId] : null;

  const { projectId } = useParams();
  const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);
  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  const clamp = (p) => ({
    x: Math.max(room.x, Math.min(p.x, room.x + room.width)),
    y: Math.max(room.y, Math.min(p.y, room.y + room.height)),
  });

  const getGridDimensions = (count) => {
    const isPrime = (n) => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
      return true;
    };
    if (isPrime(count)) count++;
    let bestRows = 1;
    let bestCols = count;
    let minDiff = count;
    for (let i = 1; i <= Math.sqrt(count); i++) {
      if (count % i === 0) {
        const rows = i;
        const cols = count / i;
        if (Math.abs(rows - cols) < minDiff) {
          bestRows = rows;
          bestCols = cols;
          minDiff = Math.abs(rows - cols);
        }
      }
    }
    return { rows: bestRows, cols: bestCols };
  };

  const updateLights = (pts) => {
    const [x1, y1, x2, y2] = pts;
    const n = numberOfLights || 0;
    if (n < 1 || !room) return;

    if (currentMode === "line" || drawingMode === "line") {
      const totalLen = Math.hypot(x2 - x1, y2 - y1);
      if (totalLen === 0) return;
      const step = n === 1 ? 0 : totalLen / (n - 1);
      const dirX = (x2 - x1) / totalLen;
      const dirY = (y2 - y1) / totalLen;
      const margin = Math.min(20, step / 2);
      const effLen = totalLen - 2 * margin;
      const effStep = n === 1 ? 0 : effLen / (n - 1);

      const lights = Array.from({ length: n }, (_, i) => {
        const dist = margin + effStep * i;
        return clamp({ x: x1 + dirX * dist, y: y1 + dirY * dist });
      });
      dispatch(
        setRoomLights({
          roomId,
          lights,
          points: pts,
          count: n,
          mode: "line",
        })
      );
    }

    if (currentMode === "grid" || drawingMode === "grid") {
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const top = Math.min(y1, y2);
      const bottom = Math.max(y1, y2);
      const width = right - left;
      const height = bottom - top;

      const { rows, cols } = getGridDimensions(n);
      const dx = cols > 1 ? width / (cols - 1) : 0;
      const dy = rows > 1 ? height / (rows - 1) : 0;

      const lights = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (lights.length >= n) break;
          const x = left + j * dx;
          const y = top + i * dy;
          lights.push(clamp({ x, y }));
        }
      }
      dispatch(
        setRoomLights({
          roomId,
          lights,
          points: [left, top, right, bottom],
          count: n,
          mode: "grid",
          gridConfig: { rows, cols },
        })
      );
    }
  };

  const handleMouseDown = (e) => {
    if (!drawingMode || drawing || !room) return;
    const pos = clamp(e.target.getStage().getPointerPosition());
    setPoints([pos.x, pos.y, pos.x, pos.y]);
    setDrawing(true);
    setCurrentMode(drawingMode);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = clamp(e.target.getStage().getPointerPosition());
    setPoints(([x1, y1]) => [x1, y1, pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    updateLights(points);
    setDrawing(false);
    setEditing(true);
    exitDrawingMode();
  };

  const getRectangleCorners = (pts) => {
    const [x1, y1, x2, y2] = pts;
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);
    return [
      { x: left, y: top }, // top-left
      { x: right, y: top }, // top-right
      { x: left, y: bottom }, // bottom-left
      { x: right, y: bottom }, // bottom-right
    ];
  };

  const updatePointsFromCornerDrag = (draggedIndex, newPos, currentPoints) => {
    const corners = getRectangleCorners(currentPoints);
    let oppositeIndex;
    if (draggedIndex === 0) oppositeIndex = 3;
    else if (draggedIndex === 1) oppositeIndex = 2;
    else if (draggedIndex === 2) oppositeIndex = 1;
    else oppositeIndex = 0;

    const fixedCorner = corners[oppositeIndex];

    const x1 = Math.min(newPos.x, fixedCorner.x);
    const y1 = Math.min(newPos.y, fixedCorner.y);
    const x2 = Math.max(newPos.x, fixedCorner.x);
    const y2 = Math.max(newPos.y, fixedCorner.y);

    return [x1, y1, x2, y2];
  };

  const updatePointsFromEndpointDrag = (
    draggedIndex,
    newPos,
    currentPoints
  ) => {
    const newPoints = [...currentPoints];
    newPoints[draggedIndex * 2] = newPos.x;
    newPoints[draggedIndex * 2 + 1] = newPos.y;
    return newPoints;
  };

  useEffect(() => {
    if (!roomId) return;
    const roomData = lightsByRoom[roomId];
    if (roomData?.points?.length === 4) {
      setPoints(roomData.points);
      setCurrentMode(roomData.mode);
      setEditing(true);
    } else {
      setPoints([]);
      setEditing(false);
      setCurrentMode(null);
    }
  }, [roomId, lightsByRoom]);

  // useEffect(() => {
  //   if (editing && points.length === 4) {
  //     updateLights(points);
  //   }
  // }, [points, editing]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading project.</div>;

  return (
    <Stage
      width={window.innerWidth - 410}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {entities.length ? (
          <EntityRender entities={entities} blocks={blocks} layers={layers} />
        ) : (
          floor && (
            <Rect
              {...floor}
              fill="rgba(200,200,200,0.5)"
              stroke="black"
              strokeWidth={2}
            />
          )
        )}

        {rooms.map((r) => (
          <Rect
            key={r.id}
            {...r}
            fill="rgba(100,200,100,0.5)"
            stroke="black"
            strokeWidth={1}
          />
        ))}

        {Object.entries(lightsByRoom).map(([rid, data]) => {
          const lights = data?.lights;
          const pts = data?.points;
          if (!lights?.length || !pts) return null;
          return (
            <React.Fragment key={rid}>
              {data.mode === "grid" && rid !== roomId && (
                <Rect
                  x={Math.min(pts[0], pts[2])}
                  y={Math.min(pts[1], pts[3])}
                  width={Math.abs(pts[2] - pts[0])}
                  height={Math.abs(pts[3] - pts[1])}
                  stroke="gray"
                  strokeWidth={2}
                />
              )}
              {data.mode === "line" && rid !== roomId && (
                <Line points={pts} stroke="gray" strokeWidth={2} />
              )}
              {lights.map((l, i) => (
                <Circle
                  key={`${rid}-${i}`}
                  x={l.x}
                  y={l.y}
                  radius={5}
                  fill="#FFD700"
                  stroke="black"
                />
              ))}
            </React.Fragment>
          );
        })}

        {drawing && points.length === 4 && (
          <>
            {drawingMode === "line" && (
              <Line
                points={points}
                stroke="blue"
                strokeWidth={2}
                dash={[6, 2]}
              />
            )}
            {drawingMode === "grid" && (
              <Rect
                x={Math.min(points[0], points[2])}
                y={Math.min(points[1], points[3])}
                width={Math.abs(points[2] - points[0])}
                height={Math.abs(points[3] - points[1])}
                stroke="blue"
                strokeWidth={2}
                dash={[4, 2]}
              />
            )}
          </>
        )}

        {!drawing && editing && points.length === 4 && (
          <>
            {currentMode === "line" && (
              <>
                <Line
                  points={points}
                  stroke="blue"
                  strokeWidth={2}
                  dash={[4, 2]}
                />
                {[0, 1].map((endpointIndex) => {
                  const pointIndex = endpointIndex * 2;
                  return (
                    <Circle
                      key={`endpoint-${endpointIndex}`}
                      x={points[pointIndex]}
                      y={points[pointIndex + 1]}
                      radius={8}
                      fill="#fff"
                      stroke="black"
                      draggable
                      onDragMove={(e) => {
                        const pos = clamp(e.target.position());
                        const newPoints = updatePointsFromEndpointDrag(
                          endpointIndex,
                          pos,
                          points
                        );
                        setPoints(newPoints);
                      }}
                    />
                  );
                })}
              </>
            )}

            {currentMode === "grid" && (
              <>
                <Rect
                  x={Math.min(points[0], points[2])}
                  y={Math.min(points[1], points[3])}
                  width={Math.abs(points[2] - points[0])}
                  height={Math.abs(points[3] - points[1])}
                  stroke="blue"
                  strokeWidth={2}
                  dash={[4, 2]}
                />
                {getRectangleCorners(points).map((corner, i) => (
                  <Circle
                    key={`corner-${i}`}
                    x={corner.x}
                    y={corner.y}
                    radius={8}
                    fill="#fff"
                    stroke="black"
                    draggable
                    onDragMove={(e) => {
                      const pos = clamp(e.target.position());
                      setPoints((prev) =>
                        updatePointsFromCornerDrag(i, pos, prev)
                      );
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </Layer>
    </Stage>
  );
};

export default FloorPreview;
