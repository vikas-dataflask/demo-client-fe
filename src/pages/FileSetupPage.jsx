import { useState } from "react";

import FloorEditor from "../components/FileSetupComponents/FloorEditor/FloorEditor";
import EditorLayout from "../components/SharedComponents/EditorLayout";
import FileSetupSidebar from "../components/FileSetupComponents/FileSetupSidebar";
import RoomEditor from "../components/FileSetupComponents/RoomEditor/roomEditor";
import AreaMarkup from "../components/fileSetup/AreaMarkup";

export default function FileSetupPage() {
  const [activeSection, setActiveSection] = useState("drawing-file");
  const [open, setOpen] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case "drawing-file":
        return <FloorEditor open={open} />;
      case "area-markup":
        return <AreaMarkup />;

      default:
        return <FloorEditor open={open} />;
    }
  };

  return (
    <EditorLayout>
      <div className="flex overflow-hidden">
        <FileSetupSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setOpen={setOpen}
          open={open}
        />
        <div className="flex overflow-y-auto">{renderContent()}</div>
      </div>
    </EditorLayout>
  );
}
