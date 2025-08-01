import { useState } from "react";
import PencilIcon from "../../icons/PencilIcon";
import PositionActiveApertureIcon from "../../icons/PositionActiveApertureIcon";
import ReplaceSelectedIcon from "../../icons/ReplaceSelectedIcon";
import ReplaceSimilarIcon from "../../icons/ReplaceSimilarIcon";
import { ReloadIcon } from "../../icons/ReloadIcon";
import WallEditor from "./WallEditor";

const DoorMarkup = () => {
  const [activeTool, setActiveTool] = useState("draw");

  const tools = [
    {
      id: "draw",
      label: "Draw new aperture",
      Icon: PencilIcon,
    },
    {
      id: "position",
      label: "Position active aperture",
      Icon: PositionActiveApertureIcon,
    },
    {
      id: "replaceSelected",
      label: "Replace selected aperture",
      Icon: ReplaceSelectedIcon,
    },
    {
      id: "replaceSimilar",
      label: "Replace similar aperture",
      Icon: ReplaceSimilarIcon,
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-[340px] h-[90vh] border-r border-gray-300 bg-white p-4 text-sm font-medium">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-gray-800 font-semibold">
              Door and window markup
            </h2>
            <p className="text-[12px] text-gray-400 mt-[2px]">
              Updated: Just now
            </p>
          </div>
          <button className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition">
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        <hr className="my-4" />

        {/* Tools */}
        <div className="space-y-2 mb-6">
          {tools.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className="w-full flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition"
            >
              <div
                className={`w-[32px] h-[32px] flex items-center justify-center rounded-md ${
                  activeTool === id ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    activeTool === id ? "stroke-white" : "stroke-gray-700"
                  }`}
                />
              </div>
              <span className="text-gray-800">{label}</span>
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="mb-4">
          <p className="text-gray-700 mb-1">Active Door</p>
          <select className="w-full rounded-lg px-3 py-2 bg-gray-200 text-gray-800 appearance-none">
            <option>Select</option>
          </select>
        </div>

        <div>
          <p className="text-gray-700 mb-1">Active Window</p>
          <select className="w-full rounded-lg px-3 py-2 bg-gray-200 text-gray-800 appearance-none">
            <option>Select</option>
          </select>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-[90vh]">
        <WallEditor />
      </div>
    </div>
  );
};

export default DoorMarkup;
