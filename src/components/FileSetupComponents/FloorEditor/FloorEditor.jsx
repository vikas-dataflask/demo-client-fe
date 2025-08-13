import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import FloorEditorSidebar from "./FloorEditorSidebar";
import FloorPropertiesPanel from "./FloorPropertiesPanel";
import Editor from "../../Canvas/Editor";

const FloorEditor = ({ open, projectId }) => {
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);

  // Get current floor and loading state from Redux
  const floors = useSelector((state) => state.floor.floors) || [];
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentFloor = floors.find((f) => f.id === currentFloorId);
  const isLoading = useSelector((state) => state.floor.isLoading);

  // Auto-open properties panel when floor is created
  useEffect(() => {
    console.log("FloorEditor: currentFloor changed", currentFloor);
    console.log("FloorEditor: selectedFloor", selectedFloor);
    console.log("FloorEditor: showPropertiesPanel", showPropertiesPanel);

    if (
      currentFloor &&
      (!selectedFloor || selectedFloor.id !== currentFloor.id)
    ) {
      console.log(
        "FloorEditor: Opening properties panel for floor",
        currentFloor
      );
      setSelectedFloor(currentFloor);
      setShowPropertiesPanel(true);
    }
  }, [currentFloor]);

  const handleClosePropertiesPanel = () => {
    setShowPropertiesPanel(false);
    setSelectedFloor(null);
  };

  const handleOpenPropertiesPanel = (floorData) => {
    console.log("FloorEditor: Manually opening properties panel", floorData);
    setSelectedFloor(floorData);
    setShowPropertiesPanel(true);
  };

  const handleFloorCreated = (floorData) => {
    console.log(
      "FloorEditor: Floor created, opening properties panel",
      floorData
    );
    setSelectedFloor(floorData);
    setShowPropertiesPanel(true);
  };

  return (
    <div className="flex h-screen">
      <FloorEditorSidebar
        showCoordinates={showCoordinates}
        setShowCoordinates={setShowCoordinates}
        onOpenPropertiesPanel={handleOpenPropertiesPanel}
        onFloorCreated={handleFloorCreated}
      />

      <div className="flex-1 relative">
        <Editor
          showCoordinates={showCoordinates}
          onFloorCreated={handleFloorCreated}
          projectId={projectId}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default FloorEditor;
