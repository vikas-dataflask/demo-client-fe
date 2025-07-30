import BackArrowIcon from "../icons/BackArrowIcon";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import React from "react";
import ElectricalIcon from "../icons/ElectricalIcon";
import FileSetup from "../icons/FileSetup";
import FireFightIcon from "../icons/FireFightIcon";
import PlumbingIcon from "../icons/PlumbingIcon";
import { useGetProjectListQuery } from "../redux/features/api/api";
import HvacIcon from "../icons/HvacIcon";

export default function TopBarSecondary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { data: projects } = useGetProjectListQuery();
  const project = projects?.find((p) => p._id === projectId);

  const tabs = [
    { label: "File Setup", icon: <FileSetup />, path: "file-setup" },
    { label: "Electrical", icon: <ElectricalIcon />, path: "electrical" },
    { label: "HVAC", icon: <HvacIcon />, path: "hvac" },
    { label: "Fire Fight", icon: <FireFightIcon />, path: "fire-fight" },
    { label: "Plumbing", icon: <PlumbingIcon />, path: "plumbing" },
  ];

  return (
    <div className="h-[72px] w-full bg-white border-b border-gray-300 flex items-center justify-between px-[24px] ">
      {/* Left Section: Back and Project Name */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 border border-[#D0D5DD] px-3 py-[6px] rounded-md text-[#344054] text- font-medium cursor-pointer hover:bg-[#F9FAFB] transition"
          onClick={() => navigate("/design-calculation")}
        >
          <span className="text-lg mr-2 text-black">
            <BackArrowIcon />
          </span>
          <span>{project?.name || "Project Name"}</span>
        </div>
      </div>

      {/* Center Tabs */}
      <div className="flex items-center gap-[32px]">
        {tabs.map((tab, i) => {
          const isActive = location.pathname.includes(`/${tab.path}`);

          return (
            <div
              key={i}
              onClick={() => navigate(`/project/${projectId}/${tab.path}`)}
              className="flex flex-col items-center gap-[2px] cursor-pointer"
            >
              <div className="text-[12px] text-[#667085]">{tab.label}</div>
              <div
                className={`w-[32px] h-[32px] rounded flex items-center justify-center transition ${
                  isActive
                    ? "bg-[#1570EF]"
                    : "hover:bg-gray-200 hover:text-[#93dad6] border border-transparent"
                }`}
              >
                {React.cloneElement(tab.icon, {
                  className: isActive ? "text-white" : "text-[#344054]",
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Section: Save Button */}
      <button className="bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-sm font-medium px-5 py-[6px] rounded-md transition">
        Save Project
      </button>
    </div>
  );
}
