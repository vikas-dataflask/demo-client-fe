import React, { useState } from "react";
import SidebarStructure from "../components/structure/SidebarStructure";
import SlabDesign from "../components/structure/SlabDesign";
import BeamDesign from "../components/structure/BeamDesign";
import ColumnDesign from "../components/structure/ColumnDesign";
import FootingDesign from "../components/structure/FootingDesign";
import StaircaseDesign from "../components/structure/StaircaseDesign";
import ShearWallDesign from "../components/structure/ShearWallDesign";
import TopBarSecondary from "../components/TopBarSecondary";

export default function StructurePage() {
  const [activeSection, setActiveSection] = useState("slab");
  const [projectName, setProjectName] = useState("Default Project");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "slab":
        return <SlabDesign projectName={projectName} activity={activeSection} />;
      case "beam":
        return <BeamDesign projectName={projectName} activity={activeSection} />;
      case "column":
        return <ColumnDesign projectName={projectName} activity={activeSection} />;
      case "footing":
        return <FootingDesign projectName={projectName} activity={activeSection} />;
      case "staircase":
        return <StaircaseDesign projectName={projectName} activity={activeSection} />;
      case "shearwall":
        return <ShearWallDesign projectName={projectName} activity={activeSection} />;
      default:
        return <SlabDesign projectName={projectName} activity={activeSection} />;
    }
  };

  return (
    <div className="bg-[#f8f9fb] h-screen flex flex-col">
      <TopBarSecondary />
      <div className="flex overflow-hidden">
        <SidebarStructure
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Structure Design
              </h1>
              <p className="text-gray-600">
                Design and analyze structural elements according to IS 456:2000 standards
              </p>
            </div>
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
