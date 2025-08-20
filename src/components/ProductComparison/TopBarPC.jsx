import { useLocation, useNavigate, useParams } from "react-router-dom";
import React from "react";

import BackArrowIcon from "../../icons/BackArrowIcon";
import PCIcon from "../../icons/PCIcon";

export default function TopBarPC({ onSaveProject, project }) {
  // Prop for project added
  const navigate = useNavigate();
  const location = useLocation();

  const iconTab = {
    label: "Product Comparison",
    icon: <PCIcon />,
    path: "/product-comparison",
  };

  return (
    <div className="h-[72px] w-full bg-white border-b border-gray-300 flex items-center justify-between px-[24px]">
      {/* Left Section: Back and Project Name */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 border border-[#D0D5DD] px-3 py-[6px] rounded-md text-[#344054] font-medium cursor-pointer hover:bg-[#F9FAFB] transition"
          onClick={() => navigate(-1)}
        >
          <span className="text-lg mr-2 text-black">
            <BackArrowIcon />
          </span>
          <span>{project?.name || "Product Comparison"}</span>
        </div>
      </div>

      {/* Center Tab: Only File Setup */}
      <div className="flex items-center gap-[32px]">
        <div className="flex flex-col items-center gap-[2px] cursor-default">
          <div className="text-[12px] text-[#667085]">{iconTab.label}</div>
          <div className="w-[32px] h-[32px] rounded flex items-center justify-center bg-[#1570EF]">
            {React.cloneElement(iconTab.icon, {
              className: "text-white",
            })}
          </div>
        </div>
      </div>

      {/* Right Section: Save Button */}
      <button
        className="bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-sm font-medium px-5 py-[6px] rounded-md transition"
        onClick={onSaveProject}
      >
        Save Project
      </button>
    </div>
  );
}
