// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Stage, Layer, Rect } from "react-konva";
// import { v4 as uuidv4 } from "uuid";
// import EntityRenderer from "../../drawing/EntityRender";
// import { useParams } from "react-router-dom";
// import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
// import CentralModal from "./CentralModal";

// import {
//   addRoom,
//   updateRoomPosition,
//   updateRoomArea,
// } from "../../redux/features/app/roomSlice";

// const RoomEditor = () => {
//   // const [floorPlan, setFloorPlan] = useState(null);
//   const [newRoom, setNewRoom] = useState(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRoomId, setSelectedRoomId] = useState(null);

//   const floorPlan = useSelector((state) => state.floorPlan.rect); //⬅️ Redux-based rect
//   const rooms = useSelector((state) => state.rooms);
//   const selectedScale = useSelector((state) => state.project.scale);

//   const dispatch = useDispatch();

//   const draggingRoomId = useRef(null);
//   const initialRoomPosition = useRef(null);

//   const { projectId } = useParams();
//   const { data } = useGetProjectListByIdQuery(projectId);

//   const entities = data?.dxf_entities || [];
//   const blocks = data?.dxf_blocks || {};
//   const layers = data?.dxf_layers || {};

//   // useEffect(() => {
//   //   const data = JSON.parse(localStorage.getItem("floorPlan"));
//   //   if (data) setFloorPlan(data);
//   // }, []);

//   useEffect(() => {
//     rooms.forEach((room) => {
//       const scaledArea = convertArea(room.width * room.height);
//       dispatch(updateRoomArea({ id: room.id, area: scaledArea }));
//     });
//   }, [selectedScale, dispatch]);

//   const convertArea = (pixelArea) => {
//     const areaInMeters = pixelArea / 10000;

//     switch (selectedScale) {
//       case "Inches":
//         return areaInMeters * 1550.0031;
//       case "Feet":
//         return areaInMeters * 10.7639;
//       case "Square Yards":
//         return areaInMeters * 1.19599;
//       default:
//         return areaInMeters; // Meters
//     }
//   };

//   const isInsideFloor = (x, y) => {
//     if (!floorPlan) return false;
//     return (
//       x >= floorPlan.x &&
//       x <= floorPlan.x + floorPlan.width &&
//       y >= floorPlan.y &&
//       y <= floorPlan.y + floorPlan.height
//     );
//   };

//   const isOverlapping = (rectA, rectB) => {
//     return (
//       rectA.x < rectB.x + rectB.width &&
//       rectA.x + rectA.width > rectB.x &&
//       rectA.y < rectB.y + rectB.height &&
//       rectA.y + rectA.height > rectB.y
//     );
//   };

//   const handleMouseDown = (e) => {
//     if (!floorPlan || isDrawing) return;
//     const pos = e.target.getStage().getPointerPosition();
//     if (!isInsideFloor(pos.x, pos.y)) return;
//     setNewRoom({ x: pos.x, y: pos.y, width: 0, height: 0 });
//     setIsDrawing(true);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing || !newRoom) return;
//     const pos = e.target.getStage().getPointerPosition();
//     const x = Math.min(
//       Math.max(pos.x, floorPlan.x),
//       floorPlan.x + floorPlan.width
//     );
//     const y = Math.min(
//       Math.max(pos.y, floorPlan.y),
//       floorPlan.y + floorPlan.height
//     );
//     const width = x - newRoom.x;
//     const height = y - newRoom.y;
//     setNewRoom({ ...newRoom, width, height });
//   };

//   const handleMouseUp = () => {
//     if (!newRoom) return;

//     const width = Math.abs(newRoom.width);
//     const height = Math.abs(newRoom.height);

//     if (width === 0 || height === 0) {
//       setNewRoom(null);
//       setIsDrawing(false);
//       return;
//     }

//     const finalRoom = {
//       id: uuidv4(),
//       x: newRoom.width < 0 ? newRoom.x + newRoom.width : newRoom.x,
//       y: newRoom.height < 0 ? newRoom.y + newRoom.height : newRoom.y,
//       width,
//       height,
//       area: convertArea(width * height), // scaled area
//     };

//     const overlaps = rooms.some((room) => isOverlapping(finalRoom, room));
//     if (overlaps) {
//       setNewRoom(null);
//       setIsDrawing(false);
//       return;
//     }

//     dispatch(addRoom(finalRoom));
//     setNewRoom(null);
//     setIsDrawing(false);
//     setSelectedRoomId(finalRoom.id);
//     setIsModalOpen(true);
//   };

//   const handleDragStart = (id, e) => {
//     draggingRoomId.current = id;
//     const shape = e.target;
//     initialRoomPosition.current = { x: shape.x(), y: shape.y() };
//   };

//   const handleDragEnd = (id, e) => {
//     const shape = e.target;
//     const newX = shape.x();
//     const newY = shape.y();

//     const draggedRoom = rooms.find((r) => r.id === id);
//     if (!draggedRoom) return;

//     const updatedRoom = {
//       ...draggedRoom,
//       x: newX,
//       y: newY,
//     };

//     const withinFloor =
//       updatedRoom.x >= floorPlan.x &&
//       updatedRoom.y >= floorPlan.y &&
//       updatedRoom.x + updatedRoom.width <= floorPlan.x + floorPlan.width &&
//       updatedRoom.y + updatedRoom.height <= floorPlan.y + floorPlan.height;

//     if (!withinFloor) {
//       shape.position(initialRoomPosition.current);
//       return;
//     }

//     const overlapping = rooms.some(
//       (room) => room.id !== id && isOverlapping(updatedRoom, room)
//     );

//     if (overlapping) {
//       shape.position(initialRoomPosition.current);
//       return;
//     }

//     dispatch(updateRoomPosition({ id, x: newX, y: newY }));
//     dispatch(updateRoomPosition({ id, x: newX, y: newY }));
//   };

//   if (!floorPlan) return <div>Loading floor plan...</div>;

//   return (
//     <>
//       <Stage
//         width={window.innerWidth - 440}
//         height={window.innerHeight - 80}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       >
//         <Layer>
//           <Rect
//             {...floorPlan}
//             fill="rgba(200,200,200,0.3)"
//             stroke="black"
//             strokeWidth={2}
//             listening={false}
//           />

//           {rooms.map((room) => (
//             <Rect
//               key={room.id}
//               {...room}
//               draggable
//               fill="rgba(100, 200, 100, 0.5)"
//               stroke="black"
//               onDragStart={(e) => handleDragStart(room.id, e)}
//               onDragEnd={(e) => handleDragEnd(room.id, e)}
//             />
//           ))}

//           {newRoom && (
//             <Rect
//               {...newRoom}
//               fill="rgba(100, 200, 100, 0.2)"
//               stroke="black"
//               dash={[4, 4]}
//             />
//           )}
//         </Layer>
//       </Stage>

//       {isModalOpen && selectedRoomId && (
//         <CentralModal
//           room={rooms.find((r) => r.id === selectedRoomId)}
//           onClose={() => setIsModalOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// export default RoomEditor;

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stage, Layer, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import EntityRenderer from "../../drawing/EntityRender";
import { useParams } from "react-router-dom";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import CentralModal from "./CentralModal";

import {
  addRoom,
  updateRoomPosition,
  updateRoomArea,
} from "../../redux/features/app/roomSlice";

const RoomEditor = () => {
  const [newRoom, setNewRoom] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const floorPlan = useSelector((state) => state.floorPlan.rect);
  const rooms = useSelector((state) => state.rooms);
  const selectedScale = useSelector((state) => state.project.scale);

  const dispatch = useDispatch();
  const draggingRoomId = useRef(null);
  const initialRoomPosition = useRef(null);

  const { projectId } = useParams();
  const { data } = useGetProjectListByIdQuery(projectId);

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  useEffect(() => {
    rooms.forEach((room) => {
      const scaledArea = convertArea(room.width * room.height);
      dispatch(updateRoomArea({ id: room.id, area: scaledArea }));
    });
  }, [selectedScale, dispatch]);

  const convertArea = (pixelArea) => {
    const areaInMeters = pixelArea / 10000;

    switch (selectedScale) {
      case "Inches":
        return areaInMeters * 1550.0031;
      case "Feet":
        return areaInMeters * 10.7639;
      case "Square Yards":
        return areaInMeters * 1.19599;
      default:
        return areaInMeters;
    }
  };

  const isInsideFloor = (x, y) => {
    if (!floorPlan) return false;
    return (
      x >= floorPlan.x &&
      x <= floorPlan.x + floorPlan.width &&
      y >= floorPlan.y &&
      y <= floorPlan.y + floorPlan.height
    );
  };

  const isOverlapping = (rectA, rectB) => {
    return (
      rectA.x < rectB.x + rectB.width &&
      rectA.x + rectA.width > rectB.x &&
      rectA.y < rectB.y + rectB.height &&
      rectA.y + rectA.height > rectB.y
    );
  };

  const handleMouseDown = (e) => {
    if (!floorPlan || isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!isInsideFloor(pos.x, pos.y)) return;
    setNewRoom({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newRoom) return;
    const pos = e.target.getStage().getPointerPosition();
    const x = Math.min(
      Math.max(pos.x, floorPlan.x),
      floorPlan.x + floorPlan.width
    );
    const y = Math.min(
      Math.max(pos.y, floorPlan.y),
      floorPlan.y + floorPlan.height
    );
    const width = x - newRoom.x;
    const height = y - newRoom.y;
    setNewRoom({ ...newRoom, width, height });
  };

  const handleMouseUp = () => {
    if (!newRoom) return;

    const width = Math.abs(newRoom.width);
    const height = Math.abs(newRoom.height);

    if (width === 0 || height === 0) {
      setNewRoom(null);
      setIsDrawing(false);
      return;
    }

    const finalRoom = {
      id: uuidv4(),
      x: newRoom.width < 0 ? newRoom.x + newRoom.width : newRoom.x,
      y: newRoom.height < 0 ? newRoom.y + newRoom.height : newRoom.y,
      width,
      height,
      area: convertArea(width * height),
    };

    const overlaps = rooms.some((room) => isOverlapping(finalRoom, room));
    if (overlaps) {
      setNewRoom(null);
      setIsDrawing(false);
      return;
    }

    dispatch(addRoom(finalRoom));
    setNewRoom(null);
    setIsDrawing(false);
    setSelectedRoomId(finalRoom.id);
    setIsModalOpen(true);
  };

  const handleDragStart = (id, e) => {
    draggingRoomId.current = id;
    const shape = e.target;
    initialRoomPosition.current = { x: shape.x(), y: shape.y() };
  };

  const handleDragEnd = (id, e) => {
    const shape = e.target;
    const newX = shape.x();
    const newY = shape.y();

    const draggedRoom = rooms.find((r) => r.id === id);
    if (!draggedRoom) return;

    const updatedRoom = {
      ...draggedRoom,
      x: newX,
      y: newY,
    };

    const withinFloor =
      updatedRoom.x >= floorPlan.x &&
      updatedRoom.y >= floorPlan.y &&
      updatedRoom.x + updatedRoom.width <= floorPlan.x + floorPlan.width &&
      updatedRoom.y + updatedRoom.height <= floorPlan.y + floorPlan.height;

    if (!withinFloor) {
      shape.position(initialRoomPosition.current);
      return;
    }

    const overlapping = rooms.some(
      (room) => room.id !== id && isOverlapping(updatedRoom, room)
    );

    if (overlapping) {
      shape.position(initialRoomPosition.current);
      return;
    }

    dispatch(updateRoomPosition({ id, x: newX, y: newY }));
  };

  if (!floorPlan) return <div>Loading floor plan...</div>;

  return (
    <>
      <Stage
        width={window.innerWidth - 440}
        height={window.innerHeight - 80}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* DXF Entities Layer */}
        <Layer>
          <EntityRenderer entities={entities} blocks={blocks} layers={layers} />
        </Layer>

        {/* Floor Plan + Rooms Layer */}
        <Layer>
          <Rect
            {...floorPlan}
            fill="rgba(200,200,200,0.3)"
            stroke="black"
            strokeWidth={2}
            listening={false}
          />

          {rooms.map((room) => (
            <Rect
              key={room.id}
              {...room}
              draggable
              fill="rgba(100, 200, 100, 0.5)"
              stroke="black"
              onDragStart={(e) => handleDragStart(room.id, e)}
              onDragEnd={(e) => handleDragEnd(room.id, e)}
            />
          ))}

          {newRoom && (
            <Rect
              {...newRoom}
              fill="rgba(100, 200, 100, 0.2)"
              stroke="black"
              dash={[4, 4]}
            />
          )}
        </Layer>
      </Stage>

      {isModalOpen && selectedRoomId && (
        <CentralModal
          room={rooms.find((r) => r.id === selectedRoomId)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default RoomEditor;
