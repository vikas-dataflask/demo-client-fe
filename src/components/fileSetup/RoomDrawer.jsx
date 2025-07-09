import React, { useState, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import CentralModal from "./CentralModal";
import {
  addRoom,
  updateRoomPosition,
} from "../../redux/features/app/roomSlice";

const CANVAS_WIDTH = 1300;
const CANVAS_HEIGHT = 700;

const RoomDrawer = () => {
  const [newRoom, setNewRoom] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const dispatch = useDispatch();
  const reduxRooms = useSelector((state) => state.rooms);
  const selectedScale = useSelector((state) => state.project.scale); // ⬅️ Scale from Redux

  const draggingRoomId = useRef(null);
  const initialRoomPosition = useRef(null);

  const isInsideCanvas = (x, y) =>
    x >= 0 && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT;

  const isOverlapping = (a, b) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  const convertArea = (pixelArea) => {
    const areaInMeters = pixelArea / 10000; // pixel^2 to m^2
    switch (selectedScale) {
      case "Inches":
        return areaInMeters * 1550.0031;
      case "Feet":
        return areaInMeters * 10.7639;
      case "Square Yards":
        return areaInMeters * 1.19599;
      default:
        return areaInMeters; // meters
    }
  };

  const handleMouseDown = (e) => {
    if (isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!isInsideCanvas(pos.x, pos.y)) return;
    setNewRoom({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newRoom) return;
    const pos = e.target.getStage().getPointerPosition();
    const x = Math.min(Math.max(pos.x, 0), CANVAS_WIDTH);
    const y = Math.min(Math.max(pos.y, 0), CANVAS_HEIGHT);
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

    const area = convertArea(width * height); // ✅ apply area conversion

    const finalRoom = {
      id: uuidv4(),
      x: newRoom.width < 0 ? newRoom.x + newRoom.width : newRoom.x,
      y: newRoom.height < 0 ? newRoom.y + newRoom.height : newRoom.y,
      width,
      height,
      area, // ✅ scaled area
    };

    const overlaps = reduxRooms.some((r) => isOverlapping(finalRoom, r));
    if (overlaps) {
      setNewRoom(null);
      setIsDrawing(false);
      return;
    }

    dispatch(addRoom(finalRoom));
    setSelectedRoom(finalRoom);
    setIsModalOpen(true);

    setNewRoom(null);
    setIsDrawing(false);
  };

  const handleDragStart = (id, e) => {
    draggingRoomId.current = id;
    initialRoomPosition.current = { x: e.target.x(), y: e.target.y() };
  };

  const handleDragEnd = (id, e) => {
    const shape = e.target;
    const newX = shape.x();
    const newY = shape.y();

    const draggedRoom = reduxRooms.find((r) => r.id === id);
    if (!draggedRoom) return;

    const updatedRoom = { ...draggedRoom, x: newX, y: newY };

    const withinBounds =
      updatedRoom.x >= 0 &&
      updatedRoom.y >= 0 &&
      updatedRoom.x + updatedRoom.width <= CANVAS_WIDTH &&
      updatedRoom.y + updatedRoom.height <= CANVAS_HEIGHT;

    if (!withinBounds) {
      shape.position(initialRoomPosition.current);
      return;
    }

    const overlapping = reduxRooms.some(
      (r) => r.id !== id && isOverlapping(updatedRoom, r)
    );

    if (overlapping) {
      shape.position(initialRoomPosition.current);
      return;
    }

    dispatch(updateRoomPosition({ id, x: newX, y: newY }));
  };

  return (
    <>
      <Stage
        width={window.innerWidth - 440}
        height={window.innerHeight - 80}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: "absolute",
          top: 100,
          left: 600,
          zIndex: 10,
        }}
      >
        <Layer>
          {reduxRooms.map((room) => (
            <Rect
              key={room.id}
              {...room}
              fill="rgba(100, 200, 100, 0.5)"
              stroke="black"
              draggable
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

      {isModalOpen && selectedRoom && (
        <CentralModal
          room={reduxRooms.find((r) => r.id === selectedRoom.id)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default RoomDrawer;
