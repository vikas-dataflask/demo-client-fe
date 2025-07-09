import React, { useState } from "react";
import TopBarSecondary from "../components/TopBarSecondary";

// Content Components
import FireHeadLossForm from "../components/fireFight/FireHeadLossForm";
import FirePumpPage from "../components/fireFight/FirePumpPage";

import SidebarFireFight from "../components/fireFight/SidebarFireFight";
import RightModal from "../components/shared/RightModal";
import FireHLFormModal from "../components/fireFight/FireHLFormModal";
import FirePumpPageModal from "../components/fireFight/FirePumpPageModal";

export default function FireFightPage() {
  const [activeSection, setActiveSection] = useState("head-loss");
  const [data, setData] = useState();

  const renderContent = () => {
    switch (activeSection) {
      case "head-loss":
        return <FireHeadLossForm setData={setData} />;
      case "fire-pump":
        return <FirePumpPage setData={setData} />;
      default:
        return <FireHeadLossForm />;
    }
  };

  return (
    <div className=" bg-[#f8f9fb] h-screen flex flex-col">
      {/* <TopBarPrimary /> */}
      <TopBarSecondary />
      <div className="flex overflow-hidden">
        <SidebarFireFight
          activeSection={activeSection}
          setActiveSection={(section) => {
            setActiveSection(section);
            setData(undefined); // Clear modal data on section change
          }}
        />
        <div className="flex h-screen overflow-y-auto">{renderContent()}</div>
        {/* {data && (
          <RightModal>
            {activeSection === "head-loss" && <FireHLFormModal data={data} />}
            {activeSection === "fire-pump" && <FirePumpPageModal data={data} />}
          </RightModal>
        )} */}
      </div>
    </div>
  );
}
