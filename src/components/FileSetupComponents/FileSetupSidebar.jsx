import DrawingFileIcon from "../../icons/DrawingFileIcon";
import AreaMarkupIcon from "../../icons/AreaMarkupIcon";
import DoorMarkupIcon from "../../icons/DoorMarkupIcon";
import AssignMaterialIcon from "../../icons/AssignMaterialIcon";
import AIFileProcessorIcon from "../../icons/AIFileProcessorIcon";
import { SquareChevronLeft, SquareChevronRight } from "lucide-react";

function FileSetupSidebar({ activeSection, setActiveSection, setOpen, open }) {
  const sidebarItems = [
    { icon: <DrawingFileIcon />, id: "drawing-file" },
    { icon: <AreaMarkupIcon />, id: "area-markup" },
    { icon: <DoorMarkupIcon />, id: "door-markup" },
    { icon: <AssignMaterialIcon />, id: "assign-material" },
    { icon: <AIFileProcessorIcon />, id: "ai-file-processor" },
  ];

  return (
    <div className="w-[60px] h-[88.5vh] bg-white border-r border-gray-300 flex flex-col justify-between ">
      <div className="flex flex-col items-center gap-4 mt-6">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveSection(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition
              ${
                activeSection === item.id
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              }`}
          >
            {item.icon}
          </div>
        ))}
      </div>
      <div
        className="px-4 py-6 text-gray-400 hover:text-gray-600"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <SquareChevronLeft />
        ) : (
          <SquareChevronRight className="text-blue-500" />
        )}
      </div>
    </div>
  );
}

export default FileSetupSidebar;
