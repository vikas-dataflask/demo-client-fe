import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layer, Rect, Line, Circle, Text } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import EntityRender from "../../drawing/EntityRenderer";
import CanvasWrapper from "../Canvas/CanvasWrapper";
import { setRoomLights } from "../../redux/features/app/lightingSlice";
import { calculateAreaInMeters } from "../../utils/canvasUtils";

const FloorPreview = ({
  drawingMode,
  exitDrawingMode,
  roomId,
  numberOfLights,
}) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);

  // Room and floor data
  const rooms = useSelector((s) => s.newRooms?.rooms);
  const floors = useSelector((s) => s.floor.floors);
  const currentFloorId = useSelector((s) => s.floor.currentFloorId);
  const currentFloor = floors.find((f) => f.id === currentFloorId);
  const lightsByRoom = useSelector((s) => s.lighting.lightsByRoom);

  // Circuiting state
  const { circuits, circuitMapping, phaseColors, selectedZone } = useSelector(
    (s) => s.circuiting
  );

  // Lighting state
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);

  // DXF data
  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  // Calculate floor and entity states
  const hasEntities = entities.length > 0;
  const hasFloor =
    currentFloor && currentFloor.shapes && currentFloor.shapes.length > 0;

  // Find the specific room for lighting
  const room = rooms?.find((r) => r.id === roomId);
  const roomLightData = roomId ? lightsByRoom[roomId] : null;

  // Utility function to generate all fixture labels for a zone
  const generateZoneFixtureLabels = (zoneId, fixturesCount) => {
    // Extract zone number from zone ID (e.g., "zone1" -> "Z1", "zone2" -> "Z2")
    const zoneMatch = zoneId.match(/zone(\d+)/i);
    const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;
    const zoneIdentifier = `Z${zoneNumber}`;

    const labels = [];

    for (let i = 0; i < fixturesCount; i++) {
      // Calculate which circuit this fixture belongs to based on global index
      // Each circuit can hold 12 fixtures (4 batches of R, Y, B)
      const circuitNumber = Math.floor(i / 12) + 1;

      // Calculate the position within the current circuit (0-11)
      const positionInCircuit = i % 12;

      // Calculate batch number and phase based on RYB sequence within the circuit
      const batchNumber = Math.floor(positionInCircuit / 3) + 1;
      const phaseIndex = positionInCircuit % 3; // 0=R, 1=Y, 2=B
      const phases = ["R", "Y", "B"];
      const phase = phases[phaseIndex];
      const phaseNum = 1;

      const label = `${zoneIdentifier}/C${circuitNumber}/${batchNumber}${phase}${phaseNum}`;
      labels.push(label);
    }

    return labels;
  };

  // Test function to demonstrate label generation
  const testLabelGeneration = () => {
    if (!selectedZone) {
      alert("Please select a zone first");
      return;
    }

    const totalFixtures = Object.entries(lightsByRoom).reduce(
      (sum, [rid, data]) => {
        if (selectedZone.rooms.includes(rid)) {
          return sum + (data?.lights?.length || 0);
        }
        return sum;
      },
      0
    );

    const labels = generateZoneFixtureLabels(selectedZone.id, totalFixtures);
    console.log(
      `Generated ${labels.length} labels for ${selectedZone.name}:`,
      labels
    );

    // Show a more detailed breakdown
    let breakdown = `Zone: ${selectedZone.name}\nTotal Fixtures: ${totalFixtures}\n\n`;

    labels.forEach((label, index) => {
      const parts = label.split("/");
      const circuit = parts[1];
      const batchPhase = parts[2];
      breakdown += `${index + 1}. ${label} (${circuit}, ${batchPhase})\n`;

      // Add circuit separator
      if ((index + 1) % 12 === 0 && index < labels.length - 1) {
        breakdown += `--- End of ${circuit} ---\n`;
      }
    });

    alert(breakdown);
  };

  // Generate fixture label according to RYB circuiting rules
  const generateFixtureLabel = (
    fixture,
    circuitId,
    circuitParam,
    fixtureIndex,
    roomId
  ) => {
    // No zone selected, don't show labels
    if (!selectedZone) return null;

    // Check if this room belongs to the selected zone
    if (!selectedZone.rooms.includes(roomId)) {
      return null; // This room is not in the selected zone, don't show label
    }

    // Check if this fixture has been assigned to a circuit for the CURRENT selected zone
    // Only show labels if circuits exist for the current zone
    const hasCircuitsForCurrentZone = Object.keys(circuits).length > 0;
    if (!hasCircuitsForCurrentZone) {
      return null; // No circuits generated for current zone yet
    }

    // Verify this fixture belongs to a circuit in the current zone
    const fixtureCircuitId = circuitMapping[fixture.fixtureId || fixture.id];
    if (!fixtureCircuitId) {
      return null; // This fixture is not assigned to any circuit
    }

    // Check if the circuit belongs to the current selected zone
    // We need to verify that this circuit was generated for the current zone
    const circuit = circuits[fixtureCircuitId];
    if (!circuit) {
      return null; // Circuit not found
    }

    // Calculate the global sequential index for this fixture within the selected zone
    let globalSequentialIndex = 0;
    let foundCurrentFixture = false;

    // First pass: count fixtures that come before our current fixture in this zone
    Object.entries(lightsByRoom).forEach(([rid, data]) => {
      // Only count fixtures in rooms that belong to the selected zone
      if (selectedZone.rooms.includes(rid)) {
        const lights = data?.lights || [];
        lights.forEach((light, localIndex) => {
          if (rid === roomId && localIndex === fixtureIndex) {
            // This is our current fixture, stop counting
            foundCurrentFixture = true;
          } else if (!foundCurrentFixture) {
            // Count fixtures that come before our current fixture in this zone
            globalSequentialIndex++;
          }
        });
      }
    });

    // Now calculate which circuit this fixture belongs to based on global index
    // Each circuit can hold 12 fixtures (4 batches of R, Y, B)
    const circuitNumber = Math.floor(globalSequentialIndex / 12) + 1;

    // Calculate the position within the current circuit (0-11)
    const positionInCircuit = globalSequentialIndex % 12;

    // Calculate batch number and phase based on RYB sequence within the circuit
    const batchNumber = Math.floor(positionInCircuit / 3) + 1;
    const phaseIndex = positionInCircuit % 3; // 0=R, 1=Y, 2=B
    const phases = ["R", "Y", "B"];
    const phase = phases[phaseIndex];
    const phaseNum = 1; // For now, always 1 as requested

    // Zone identifier - use actual zone ID instead of hardcoded Z1
    // Extract zone number from zone ID (e.g., "zone1" -> "Z1", "zone2" -> "Z2")
    const zoneMatch = selectedZone.id.match(/zone(\d+)/i);
    const zoneNumber = zoneMatch ? parseInt(zoneMatch[1]) : 1;
    const zoneIdentifier = `Z${zoneNumber}`;

    // Circuit number (C1, C2, C3...)
    const circuitNumFormatted = `C${circuitNumber}`;

    return `${zoneIdentifier}/${circuitNumFormatted}/${batchNumber}${phase}${phaseNum}`;
  };

  // Get circuit color for fixture
  const getFixtureColor = (circuitId, circuit) => {
    if (!circuitId || !circuit) return "#FF00FF"; // Default magenta

    if (circuit.phase && phaseColors[circuit.phase]) {
      return phaseColors[circuit.phase];
    }

    return "#4CAF50"; // Default green for circuits
  };

  // Debug room selection and lighting data
  console.log("🔍 FloorPreview: Room selection debug:", {
    roomId,
    totalRooms: rooms?.length,
    allRoomIds: rooms?.map((r) => r.id),
    foundRoom: room ? { id: room.id, name: room.name } : null,
    hasLightData: !!roomLightData,
    lightsByRoomKeys: Object.keys(lightsByRoom),
    lightsByRoomData: Object.entries(lightsByRoom).map(([rid, data]) => ({
      roomId: rid,
      lightsCount: data?.lights?.length || 0,
      mode: data?.mode,
      arrangementType: data?.arrangementType,
      firstFixture: data?.lights?.[0] || null,
    })),
  });

  // Clamp function for lighting positioning - keeps points inside room with margin
  const clamp = (p) => {
    if (!room) return p;

    // Add margin to keep drawing inside room boundaries (not on edges)
    const margin = 10; // 10px margin from room edges
    const minX = room.x + margin;
    const maxX = room.x + room.width - margin;
    const minY = room.y + margin;
    const maxY = room.y + room.height - margin;

    return {
      x: Math.max(minX, Math.min(p.x, maxX)),
      y: Math.max(minY, Math.min(p.y, maxY)),
    };
  };

  // Grid dimensions calculation for lighting
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

  // Update lights function
  const updateLights = (pts) => {
    const [x1, y1, x2, y2] = pts;
    const n = numberOfLights || 0;
    console.log("🔍 FloorPreview: updateLights called:", {
      points: pts,
      numberOfLights: n,
      roomId,
      currentMode,
      drawingMode,
    });
    if (n < 1 || !room) {
      console.warn(
        "⚠️ FloorPreview: Cannot place lights - numberOfLights:",
        n,
        "room:",
        room
      );
      return;
    }

    if (currentMode === "line" || drawingMode === "line") {
      const totalLen = Math.hypot(x2 - x1, y2 - y1);
      if (totalLen === 0) return;

      const dirX = (x2 - x1) / totalLen;
      const dirY = (y2 - y1) / totalLen;

      // Create lights between start and end points (excluding start/end)
      // For n lights, we need n+1 segments to place them equidistant
      const lights = [];

      if (n > 0) {
        for (let i = 1; i <= n; i++) {
          const t = i / (n + 1); // This creates n evenly spaced points between 0 and 1
          const lightX = x1 + dirX * totalLen * t;
          const lightY = y1 + dirY * totalLen * t;
          lights.push(clamp({ x: lightX, y: lightY }));
        }
      }

      console.log("🔍 FloorPreview: Placing line lights:", {
        roomId,
        lightCount: lights.length,
        requestedLights: n,
        lineLength: totalLen.toFixed(2),
        startPoint: { x: x1, y: y1 },
        endPoint: { x: x2, y: y2 },
        lights: lights.slice(0, 3), // Show first 3 lights
        points: pts,
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

      console.log("🔍 FloorPreview: Placing grid lights:", {
        roomId,
        lightCount: lights.length,
        gridConfig: { rows, cols },
        lights: lights.slice(0, 3), // Show first 3 lights
        points: [left, top, right, bottom],
      });

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

  // Mouse event handlers for lighting
  const handleMouseDown = (e) => {
    console.log("🔍 FloorPreview: Mouse down event:", {
      drawingMode,
      drawing,
      room: room ? { id: room.id, name: room.name } : null,
      numberOfLights,
      target: e.target.constructor.name,
    });

    if (!drawingMode) {
      console.warn("⚠️ No drawing mode selected");
      return;
    }

    if (drawing) {
      console.warn("⚠️ Already drawing");
      return;
    }

    if (!room) {
      console.warn("⚠️ No room selected or found");
      return;
    }

    if (!numberOfLights || numberOfLights < 1) {
      console.warn(
        "⚠️ No lights calculated or invalid number:",
        numberOfLights
      );
      return;
    }

    console.log("✅ FloorPreview: Starting lighting placement:", {
      drawingMode,
      roomId,
      numberOfLights,
      room: {
        id: room.id,
        name: room.name,
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
      },
    });

    const stage = e.target.getStage();
    const rawPos = stage.getPointerPosition();

    // Get stage transformations
    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    // Transform pointer position to account for stage scaling and position
    const pos = {
      x: (rawPos.x - stagePos.x) / stageScale,
      y: (rawPos.y - stagePos.y) / stageScale,
    };

    console.log("🔍 FloorPreview: Coordinate debugging:", {
      rawPointer: rawPos,
      stageScale,
      stagePosition: stagePos,
      transformedPos: pos,
      roomBounds: {
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
        right: room.x + room.width,
        bottom: room.y + room.height,
      },
    });

    // Check if click is inside the selected room
    const isInsideRoom =
      pos.x >= room.x &&
      pos.x <= room.x + room.width &&
      pos.y >= room.y &&
      pos.y <= room.y + room.height;

    console.log("🔍 FloorPreview: Boundary check:", {
      clickX: pos.x,
      clickY: pos.y,
      roomLeft: room.x,
      roomRight: room.x + room.width,
      roomTop: room.y,
      roomBottom: room.y + room.height,
      isInsideX: pos.x >= room.x && pos.x <= room.x + room.width,
      isInsideY: pos.y >= room.y && pos.y <= room.y + room.height,
      isInsideRoom,
    });

    if (!isInsideRoom) {
      console.warn("⚠️ Click outside selected room boundaries:", {
        clickPos: pos,
        roomBounds: {
          x: room.x,
          y: room.y,
          width: room.width,
          height: room.height,
        },
      });
      // Temporarily remove the alert to allow testing
      // alert("Please click inside the selected room to place lights.");
      console.warn("⚠️ Proceeding anyway for debugging...");
      // return;
    }

    const clampedPos = clamp(pos);

    console.log("📍 FloorPreview: Initial position:", {
      original: pos,
      clamped: clampedPos,
      roomBounds: {
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
      },
    });

    setPoints([clampedPos.x, clampedPos.y, clampedPos.x, clampedPos.y]);
    setDrawing(true);
    setCurrentMode(drawingMode);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const stage = e.target.getStage();
    const rawPos = stage.getPointerPosition();

    // Get stage transformations
    const stageScale = stage.scaleX();
    const stagePos = stage.position();

    // Transform pointer position to account for stage scaling and position
    const pos = {
      x: (rawPos.x - stagePos.x) / stageScale,
      y: (rawPos.y - stagePos.y) / stageScale,
    };

    const clampedPos = clamp(pos);
    setPoints(([x1, y1]) => [x1, y1, clampedPos.x, clampedPos.y]);
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    console.log("🔍 FloorPreview: Mouse up - finalizing placement:", points);
    updateLights(points);
    setDrawing(false);
    setEditing(true);
    exitDrawingMode();
  };

  // Helper functions for lighting editing
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

  // Effect to load existing lighting data
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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading project.</div>;

  return (
    <div className="relative w-full h-full">
      <CanvasWrapper
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {/* Render DXF entities if available */}
          {hasEntities && (
            <EntityRender entities={entities} blocks={blocks} layers={layers} />
          )}

          {/* Render current floor shapes */}
          {currentFloor &&
            currentFloor.shapes &&
            currentFloor.shapes.map((shape, index) => {
              if (shape.shape === "rectangle") {
                return (
                  <Rect
                    key={shape.id || index}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="rgba(200,200,200,0.3)"
                    stroke="black"
                    strokeWidth={2}
                    listening={false}
                  />
                );
              } else if (shape.shape === "polygon" && shape.points) {
                return (
                  <Line
                    key={shape.id || index}
                    points={shape.points.flatMap((point) => [point.x, point.y])}
                    stroke="black"
                    strokeWidth={2}
                    fill="rgba(200,200,200,0.3)"
                    closed={true}
                    listening={false}
                  />
                );
              }
              return null;
            })}

          {/* Render rooms */}
          {rooms?.map((room, index) => {
            const centerX = room.x + room.width / 2;
            const centerY = room.y + room.height / 2;
            const areaInMeters = calculateAreaInMeters(room.width, room.height);

            // Determine fill color based on false ceiling status
            const hasFalseCeiling =
              room.falseCeiling && room.falseCeiling.trim() !== "";
            const fillColor = hasFalseCeiling
              ? "rgba(255, 0, 255, 0.5)"
              : "rgba(100, 200, 100, 0.5)"; // Magenta for false ceiling, green for normal

            // Check if this is the selected room for lighting
            const isSelectedForLighting = room.id === roomId && drawingMode;

            return (
              <React.Fragment key={room.id || room._id || `room-${index}`}>
                <Rect
                  {...room}
                  fill={fillColor}
                  stroke={isSelectedForLighting ? "#0083EE" : "black"}
                  strokeWidth={isSelectedForLighting ? 3 : 1}
                  listening={false}
                />
                {isSelectedForLighting && (
                  <Rect
                    x={room.x + 5}
                    y={room.y + 5}
                    width={room.width - 10}
                    height={room.height - 10}
                    fill="transparent"
                    stroke="#0083EE"
                    strokeWidth={1}
                    dash={[5, 5]}
                    listening={false}
                  />
                )}
                <Text
                  x={centerX}
                  y={centerY}
                  text={`${room.name || "Unnamed Room"}\n${areaInMeters.toFixed(
                    1
                  )} m²${isSelectedForLighting ? "\n📍 Draw here" : ""}`}
                  fontSize={21}
                  fill={isSelectedForLighting ? "#0083EE" : "#333"}
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                  fontFamily="Arial, sans-serif"
                  fontStyle="normal"
                  fontWeight="700"
                />
              </React.Fragment>
            );
          })}

          {/* Render existing lights for other rooms */}
          {Object.entries(lightsByRoom).map(([rid, data]) => {
            const lights = data?.lights;
            const pts = data?.points;
            console.log("🔍 FloorPreview: Rendering lights for room:", {
              roomId: rid,
              lightsCount: lights?.length || 0,
              hasPoints: !!pts,
              mode: data?.mode,
              arrangementType: data?.arrangementType,
              lights: lights?.slice(0, 2), // Show first 2 for debugging
            });
            if (!lights?.length) return null;
            return (
              <React.Fragment key={rid}>
                {/* Show the drawn line/area */}
                {data.mode === "grid" && pts && pts.length === 4 && (
                  <Rect
                    x={Math.min(pts[0], pts[2])}
                    y={Math.min(pts[1], pts[3])}
                    width={Math.abs(pts[2] - pts[0])}
                    height={Math.abs(pts[3] - pts[1])}
                    stroke={rid === roomId ? "blue" : "gray"}
                    strokeWidth={2}
                    fill="transparent"
                  />
                )}
                {data.mode === "line" && pts && pts.length === 4 && (
                  <>
                    <Line
                      points={pts}
                      stroke={rid === roomId ? "blue" : "gray"}
                      strokeWidth={2}
                    />
                    {/* Start point (different color) */}
                    <Circle
                      x={pts[0]}
                      y={pts[1]}
                      radius={6}
                      fill="#FF4444"
                      stroke="darkred"
                      strokeWidth={2}
                    />
                    {/* End point (different color) */}
                    <Circle
                      x={pts[2]}
                      y={pts[3]}
                      radius={6}
                      fill="#44FF44"
                      stroke="darkgreen"
                      strokeWidth={2}
                    />
                  </>
                )}
                {/* Render the actual lights */}
                {console.log("🔍 FloorPreview: About to render fixtures:", {
                  roomId: rid,
                  fixturesCount: lights.length,
                  firstFixture: lights[0],
                  allFixtures: lights.slice(0, 3), // Show first 3 fixtures
                })}
                {lights.map((l, i) => {
                  console.log("🔍 FloorPreview: Rendering fixture:", {
                    fixtureIndex: i,
                    fixture: l,
                    hasPosition: !!l.position,
                    x: l.position?.x || l.x,
                    y: l.position?.y || l.y,
                  });

                  // Get circuit information for this fixture
                  const circuitId = circuitMapping[l.fixtureId || l.id];
                  const circuit = circuits[circuitId];

                  // Generate fixture label if circuit exists
                  const fixtureLabel = generateFixtureLabel(
                    l,
                    circuitId,
                    circuit,
                    i,
                    rid
                  );

                  // Get fixture color based on circuit
                  const fixtureColor = getFixtureColor(circuitId, circuit);

                  return (
                    <React.Fragment key={`${rid}-${i}`}>
                      {/* Fixture circle */}
                      <Circle
                        x={l.position?.x || l.x}
                        y={l.position?.y || l.y}
                        radius={8}
                        fill={fixtureColor}
                        stroke={fixtureColor}
                        strokeWidth={1}
                      />

                      {/* Circuit label - only show when circuits exist */}
                      {fixtureLabel && (
                        <>
                          {/* Label background for better readability */}
                          <Text
                            x={(l.position?.x || l.x) - 30}
                            y={(l.position?.y || l.y) - 35}
                            text={fixtureLabel}
                            fontSize={10}
                            fill="#333"
                            align="center"
                            fontFamily="Arial"
                            fontStyle="bold"
                            stroke="white"
                            strokeWidth={3}
                          />
                          {/* Label text */}
                          <Text
                            x={(l.position?.x || l.x) - 30}
                            y={(l.position?.y || l.y) - 35}
                            text={fixtureLabel}
                            fontSize={10}
                            fill="#333"
                            align="center"
                            fontFamily="Arial"
                            fontStyle="bold"
                          />
                        </>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Test fixture to verify rendering works */}
                {rid === roomId && (
                  <Circle
                    key="test-fixture"
                    x={room?.x + 50 || 100}
                    y={room?.y + 50 || 100}
                    radius={12}
                    fill="#FF0000"
                    stroke="#FF0000"
                    strokeWidth={2}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Lighting drawing preview */}
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

          {/* Lighting editing mode */}
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
      </CanvasWrapper>

      {/* Lighting Instructions */}
      {drawingMode && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Click and drag to place {drawingMode} lighting</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {numberOfLights || 0} light(s) will be placed
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorPreview;
