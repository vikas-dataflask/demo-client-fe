import React, { useState } from "react";

// Content Components

import Layout from "../components/ProjectLayout";

import DrawingFile from "../components/fileSetup/DrawingFile";
import AreaMarkup from "../components/fileSetup/AreaMarkup";
import DoorMarkup from "../components/fileSetup/DoorMarkup";
import AssignMaterial from "../components/fileSetup/AssignMaterial";
import SidebarFilesetup from "../components/fileSetup/SidebarFilesetup";
// import FloorPlanEditor from "../drawing/FloorPlanEditor";

export default function FileSetupPage() {
  const [activeSection, setActiveSection] = useState("drawing-file"); // Default

  const renderContent = () => {
    switch (activeSection) {
      case "drawing-file":
        return <DrawingFile />;
      case "area-markup":
        return <AreaMarkup />;
      case "door-markup":
        return <DoorMarkup />;
      case "assign-material":
        return <AssignMaterial />;

      default:
        return <DrawingFile />;
    }
  };

  return (
    <div className="bg-[#f8f9fb]  flex flex-col">
      <Layout>
        <div className="flex overflow-hidden">
          <SidebarFilesetup
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <div className="flex overflow-y-auto">{renderContent()}</div>
        </div>
        <div>{/* <FloorPlanEditor /> */}</div>
      </Layout>
    </div>
  );
}
