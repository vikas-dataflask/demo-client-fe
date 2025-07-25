import React from "react";
import HeadLossIcon from "../../icons/HeadLossIcon";
import FirePumpIcon from "../../icons/FirePumpIcon";
// import SprinklerIcon from "../../icons/SprinklerIcon";
import DropletIcon from "../../icons/DropletIcon";

function SidebarFireFight({ activeSection, setActiveSection }) {
  const sidebarItems = [
    { icon: <HeadLossIcon />, id: "head-loss" },
    { icon: <FirePumpIcon />, id: "fire-pump" },
    { icon: <FirePumpIcon />, id: "sprinkler-layout" },
  ];

  return (
    <div className="w-[64px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between py-4">
      <div className="flex flex-col items-center gap-6 mt-2">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveSection(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition
            ${
              activeSection === item.id
                ? "bg-[#2E90FA] text-white"
                : "text-[#6B7280] hover:bg-gray-200"
            }`}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SidebarFireFight;
