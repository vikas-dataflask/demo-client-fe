import { useLocation, useNavigate, useParams } from "react-router-dom";
import ElectricalIcon from "../../icons/ElectricalIcon";
import FileSetup from "../../icons/FileSetup";
import FireFightIcon from "../../icons/FireFightIcon";
import HvacIcon from "../../icons/HvacIcon";
import PlumbingIcon from "../../icons/PlumbingIcon";
import { useGetProjectListQuery } from "../../redux/features/api/api";
import { ArrowLeft } from "lucide-react";

export default function TopBar() {
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
    <div className="h-[74px] w-full bg-white border-b border-gray-300 flex items-center justify-between px-[24px] ">
      {/* Back To Projects */}
      <div className="flex gap-2 items-center border px-2 py-1 rounded border-gray-500 text-gray-500 hover:border-gray-900 hover:text-gray-900 cursor-pointer">
        <ArrowLeft className="h-6 w-6" />
        <div className="text-lg font-semibold">{project?.name}</div>
      </div>

      {/* Editor Navigation */}
      <div className="flex gap-10">
        {tabs.map((tab, i) => {
          const isActive = location.pathname.includes(`/${tab.path}`);
          return (
            <div
              key={i}
              onClick={() => navigate(`/project/${projectId}/${tab.path}`)}
              className={`flex flex-col items-center gap-1
                  ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  } font-semibold text-xs`}
            >
              <div
                className={`${
                  isActive
                    ? "text-white bg-blue-500"
                    : "text-gray-500 hover:text-gray-900"
                } p-2 rounded`}
              >
                {tab.icon}
              </div>
              <div>{tab.label}</div>
            </div>
          );
        })}
      </div>

      {/* User Profile Settings */}
      <div className="bg-emerald-500 px-4 py-2 text-center rounded-4xl text-xl font-bold text-white">
        R
      </div>
    </div>
  );
}
