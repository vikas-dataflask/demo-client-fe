import React from "react";

import DrawingFileIcon from "../../icons/DrawingFileIcon";
import AreaMarkupIcon from "../../icons/AreaMarkupIcon";

import DoorMarkupIcon from "../../icons/DoorMarkupIcon";
import AssignMaterialIcon from "../../icons/AssignMaterialIcon";

function SidebarFilesetup({ activeSection, setActiveSection }) {
  const sidebarItems = [
    { icon: <DrawingFileIcon />, id: "drawing-file" },
    { icon: <AreaMarkupIcon />, id: "area-markup" },
    { icon: <DoorMarkupIcon />, id: "door-markup" },
    { icon: <AssignMaterialIcon />, id: "assign-material" },
  ];

  return (
    <div className="w-[64px] h-[90vh] bg-white border-r border-[#E5E7EB] flex flex-col justify-between ">
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

export default SidebarFilesetup;
