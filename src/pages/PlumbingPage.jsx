import React, { useState } from "react";

import TopBarSecondary from "../components/TopBarSecondary";

// Content Components

import WaterDemandForm from "../components/plumbing/WaterDemandForm";
import SidebarPlumbing from "../components/plumbing/SidebarPlumbing";
import PlumbingHeadLossForm from "../components/plumbing/PlumbingHeadLossForm";
import WaterSupplyPipesForm from "../components/plumbing/WaterSupplyPipesForm";
import DrainagePipesForm from "../components/plumbing/DrainagePipesForm";
import PlumbingPumpForm from "../components/plumbing/PlumbingPumpForm";
import RainWaterDropping from "../components/plumbing/RainWaterDropping";
import RWH from "../components/plumbing/RWH";
import WaterDemandModal from "../components/plumbing/WaterDemandModal";
import RightModal from "../components/shared/RightModal";
import WaterSupplyPipesModal from "../components/plumbing/WaterSupplyPipesModal";
import DrainagePipesModal from "../components/plumbing/DrainagePipesModal";
import PlumbingPumpModal from "../components/plumbing/PlumbingPumpModal";
import RainWaterDroppingModal from "../components/plumbing/RainWaterDroppingModal";
import RwhModal from "../components/plumbing/RwhModal";
import PlumbingHLFormModal from "../components/plumbing/PlumbingHLFormModal";

export default function PlumbingPage() {
  const [activeSection, setActiveSection] = useState("water-demand"); // Default
  const [data, setData] = useState();

  const renderContent = () => {
    switch (activeSection) {
      case "water-demand":
        return <WaterDemandForm setData={setData} />;
      case "water-supply":
        return <WaterSupplyPipesForm setData={setData} />;
      case "drainage-pipe":
        return <DrainagePipesForm setData={setData} />;

      case "head-loss":
        return <PlumbingHeadLossForm setData={setData} />;
      case "plumbing-pump":
        return <PlumbingPumpForm setData={setData} />;
      case "RainWater-Dropping":
        return <RainWaterDropping setData={setData} />;
      case "RWH":
        return <RWH setData={setData} />;

      default:
        return <WaterDemandForm />;
    }
  };

  return (
    <div className=" bg-[#f8f9fb] flex flex-col">
      <TopBarSecondary />
      <div className="flex overflow-hidden">
        <SidebarPlumbing
          activeSection={activeSection}
          setActiveSection={(section) => {
            setActiveSection(section);
            setData(undefined); // Clear modal data on section change
          }}
        />
        <div className="flex ">{renderContent()}</div>
        {data && (
          <RightModal>
            {activeSection === "water-demand" && (
              <WaterDemandModal data={data} />
            )}
            {activeSection === "water-supply" && (
              <WaterSupplyPipesModal data={data} />
            )}
            {activeSection === "drainage-pipe" && (
              <DrainagePipesModal data={data} />
            )}
            {activeSection === "head-loss" && (
              <PlumbingHLFormModal data={data} />
            )}
            {activeSection === "plumbing-pump" && (
              <PlumbingPumpModal data={data} />
            )}
            {activeSection === "RainWater-Dropping" && (
              <RainWaterDroppingModal data={data} />
            )}
            {activeSection === "RWH" && <RwhModal data={data} />}
          </RightModal>
        )}
      </div>
    </div>
  );
}
