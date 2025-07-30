// import React, { useRef, useState, useEffect } from "react";
// import { Stage, Layer, Rect, Transformer } from "react-konva";
// import { useSelector } from "react-redux";

// export default function RoomEditor() {
//   const stageRef = useRef(null);
//   const [scale, setScale] = useState({ x: 1, y: 1 });
//   const [position, setPosition] = useState({ x: 0, y: 0 });

//   const floorLength = useSelector((state) => state.floor.floor_length);
//   const floorWidth = useSelector((state) => state.floor.floor_width);
//   const gridSize = 30;

//   const [rooms, setRooms] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [startPos, setStartPos] = useState(null);
//   const [newRoom, setNewRoom] = useState(null);
//   const [selectedId, setSelectedId] = useState(null);
//   const transformerRef = useRef();
//   const shapeRefs = useRef({});

//   const handleMouseDown = (e) => {
//     // Only left-click should start drawing
//     if (e.evt.button !== 0) return;

//     const stage = stageRef.current.getStage();
//     const pointer = stage.getPointerPosition();
//     setStartPos(pointer);
//     setIsDrawing(true);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing) return;
//     const stage = stageRef.current.getStage();
//     const pointer = stage.getPointerPosition();

//     const x = Math.min(startPos.x, pointer.x);
//     const y = Math.min(startPos.y, pointer.y);
//     const width = Math.abs(pointer.x - startPos.x);
//     const height = Math.abs(pointer.y - startPos.y);

//     setNewRoom({ x, y, width, height });
//   };

//   const handleMouseUp = () => {
//     if (newRoom && newRoom.width > 2 && newRoom.height > 2) {
//       const isOverlapping = rooms.some((room) => {
//         return !(
//           newRoom.x + newRoom.width <= room.x ||
//           newRoom.x >= room.x + room.width ||
//           newRoom.y + newRoom.height <= room.y ||
//           newRoom.y >= room.y + room.height
//         );
//       });

//       if (!isOverlapping) {
//         setRooms([...rooms, newRoom]);
//       } else {
//         console.log("Overlapping room, not added");
//       }
//     }

//     setIsDrawing(false);
//     setStartPos(null);
//     setNewRoom(null);
//   };

//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight}
//       scale={scale}
//       x={position.x}
//       y={position.y}
//       onWheel={(e) => {
//         e.evt.preventDefault();
//         const scaleBy = 1.05;
//         const stage = stageRef.current;
//         const oldScale = stage.scaleX();
//         const pointer = stage.getPointerPosition();

//         const mousePointTo = {
//           x: (pointer.x - stage.x()) / oldScale,
//           y: (pointer.y - stage.y()) / oldScale,
//         };

//         const newScale =
//           e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
//         setScale({ x: newScale, y: newScale });

//         setPosition({
//           x: pointer.x - mousePointTo.x * newScale,
//           y: pointer.y - mousePointTo.y * newScale,
//         });
//       }}
//       ref={stageRef}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//     >
//       <Layer>
//         {/* Static Floor (Non-Draggable) */}
//         <Rect
//           x={0}
//           y={0}
//           width={floorLength * gridSize}
//           height={floorWidth * gridSize}
//           fill="#F5F5F5"
//           stroke="#333"
//           strokeWidth={2}
//           listening={false} // Prevent pointer events on floor
//         />

//         {/* Render Existing Rooms */}
//         {rooms.map((room, i) => (
//           <Rect
//             key={i}
//             x={room.x}
//             y={room.y}
//             width={room.width}
//             height={room.height}
//             fill="rgba(0,128,255,0.4)"
//             stroke="#0057D9"
//             strokeWidth={2}
//           />
//         ))}

//         {/* Room Drawing Preview */}
//         {isDrawing && newRoom && (
//           <Rect
//             x={newRoom.x}
//             y={newRoom.y}
//             width={newRoom.width}
//             height={newRoom.height}
//             fill="rgba(0,128,255,0.2)"
//             stroke="#0057D9"
//             dash={[4, 4]}
//           />
//         )}
//       </Layer>
//     </Stage>
//   );
// }

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Transformer, Group } from "react-konva";
import { useSelector } from "react-redux";

export default function RoomEditor() {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  const floorLength = useSelector((state) => state.floor.floor_length);
  const floorWidth = useSelector((state) => state.floor.floor_width);
  const gridSize = 30;

  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rooms, setRooms] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [newRoom, setNewRoom] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const handleMouseDown = (e) => {
    // prevent drawing when clicking on a shape
    if (e.target !== e.target.getStage()) return;

    const pointer = stageRef.current.getPointerPosition();
    setStartPos(pointer);
    setIsDrawing(true);
    setSelectedId(null);
  };

  const handleMouseMove = () => {
    if (!isDrawing) return;
    const pointer = stageRef.current.getPointerPosition();

    const x = Math.min(startPos.x, pointer.x);
    const y = Math.min(startPos.y, pointer.y);
    const width = Math.abs(pointer.x - startPos.x);
    const height = Math.abs(pointer.y - startPos.y);

    setNewRoom({ x, y, width, height });
  };

  const doesOverlap = (rect1, rect2) => {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect1.x >= rect2.x + rect2.width ||
      rect1.y + rect1.height <= rect2.y ||
      rect1.y >= rect2.y + rect2.height
    );
  };

  const handleMouseUp = () => {
    if (newRoom && newRoom.width > 2 && newRoom.height > 2) {
      const overlapping = rooms.some((r) => doesOverlap(newRoom, r));
      if (!overlapping) {
        setRooms([...rooms, newRoom]);
      }
    }
    setIsDrawing(false);
    setStartPos(null);
    setNewRoom(null);
  };

  const handleTransformEnd = (index, node) => {
    const updated = [...rooms];
    updated[index] = {
      ...updated[index],
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
    };

    // Reset scale so it's applied to width/height directly
    node.scaleX(1);
    node.scaleY(1);

    setRooms(updated);
  };

  useEffect(() => {
    if (transformerRef.current && selectedId !== null) {
      const selectedNode = stageRef.current.findOne(`#room-${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, rooms]);

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      scale={scale}
      x={position.x}
      y={position.y}
      ref={stageRef}
      onWheel={(e) => {
        e.evt.preventDefault();
        const scaleBy = 1.05;
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale =
          e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setScale({ x: newScale, y: newScale });

        setPosition({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        });
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {/* Static Floor Rectangle */}
        <Rect
          x={0}
          y={0}
          width={floorLength * gridSize}
          height={floorWidth * gridSize}
          fill="#F5F5F5"
          stroke="#333"
          strokeWidth={2}
          listening={false}
        />

        {/* Rooms */}
        {rooms.map((room, i) => (
          <Group
            key={i}
            id={`room-${i}`}
            x={room.x}
            y={room.y}
            draggable
            onClick={() => setSelectedId(i)}
            onTransformEnd={(e) => handleTransformEnd(i, e.target)}
            onDragEnd={(e) => handleTransformEnd(i, e.target)}
          >
            <Rect
              width={room.width}
              height={room.height}
              fill="rgba(0,128,255,0.4)"
              stroke="#0057D9"
              strokeWidth={2}
            />
          </Group>
        ))}

        {/* Preview Room */}
        {isDrawing && newRoom && (
          <Rect
            x={newRoom.x}
            y={newRoom.y}
            width={newRoom.width}
            height={newRoom.height}
            fill="rgba(0,128,255,0.2)"
            stroke="#0057D9"
            dash={[4, 4]}
          />
        )}

        {/* Transformer */}
        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
}
