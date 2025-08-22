// HVACPage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import { useGetProjectListQuery } from "../redux/features/api/api"; // Import useGetProjectListQuery

// Content Components
import Layout from "../components/ProjectLayout";
import HeatLoad from "../components/HVAC/HeatLoad";
import Ventilation from "../components/HVAC/Ventilation";
import DuctSizing from "../components/HVAC/DuctSizing";
import SidebarHVAC from "../components/HVAC/SidebarHVAC";
import HeatLoadRightModal from "../components/HVAC/HeatLoadRightModal";
import AHU from "../components/HVAC/AHU";
import Chiller from "../components/HVAC/Chiller";
import Condenser from "../components/HVAC/Condenser";
import AISidebar from "../components/SharedComponents/AITools/AISidebar";

export default function HVACPage() {
  const [activeSection, setActiveSection] = useState("heat-load"); // Default
  const [data, setData] = useState(); // This state might be for modals/right panels that are not always AHU related.

  const { projectId } = useParams(); // Get projectId from URL
  const { data: projects } = useGetProjectListQuery(); // Fetch projects
  const project = projects?.find((p) => p._id === projectId); // Find the current project
  const projectName = project?.name || ""; // Extract project name

  const renderContent = () => {
    switch (activeSection) {
      case "heat-load":
        return <HeatLoad />;
      case "ventilation":
        return <Ventilation />;
      case "duct-sizing":
        return <DuctSizing />;
      case "ahu":
        // Pass projectName and activeSection (as activity) to AHU
        return <AHU projectName={projectName} activity={activeSection} />;
      case "chiller":
        return <Chiller />;
      case "condenser":
        return <Condenser />;
      default:
        return <HeatLoad />;
    }
  };

  return (
    <div className="bg-[#f8f9fb] h-screen flex flex-col">
      <Layout />
      <div className="flex overflow-hidden">
        <SidebarHVAC
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="flex h-screen overflow-y-auto">{renderContent()}</div>
        {/*
          The following RightModal section seems to be for specific components like HeatLoadRightModal.
          For AHU, the report is now directly on the right side of the AHU component,
          so this section might not be needed for AHU anymore.
        */}
        {data &&
          // This RightModal and its children might need review based on your overall application's right-panel strategy
          // For AHU, the report is handled directly within AHU.jsx's right pane now.
          // <RightModal>
          //   {activeSection === "heat-load" && (
          //     <HeatLoadRightModal data={data} />
          //   )}
          //   {activeSection === "fire-pump" && <FirePumpPageModal data={data} />}
          // </RightModal>
          null}
      </div>
      <AISidebar />
    </div>
  );
}
