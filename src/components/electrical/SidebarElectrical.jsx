import React from "react";
import DialuxIcon from "../../icons/DialuxIcon";
import { DbDetailsIcon } from "../../icons/DbDetailsIcon";
import BreakerSizingIcon from "../../icons/BreakerSizingIcon";
import CableSizeIcon from "../../icons/CableSizeIcon";

function SidebarElectrical({ activeSection, setActiveSection }) {
  const sidebarItems = [
    { icon: <DialuxIcon />, id: "dialux" },
    { icon: <DialuxIcon />, id: "power" },
    { icon: <DbDetailsIcon />, id: "db-details" },
    { icon: <BreakerSizingIcon />, id: "breaker-sizing" },
    { icon: <CableSizeIcon />, id: "cable-size" },
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

export default SidebarElectrical;
