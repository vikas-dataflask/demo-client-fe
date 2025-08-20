import BackArrowIcon from "../../icons/BackArrowIcon";

export default function TopBarPrimary() {
  return (
    <div className="h-[56px] w-full bg-white border-b border-gray-300 flex items-center justify-between px-[24px]">
      {/* Left: ← Project Name with Border */}
      <div className="flex items-center">
        <div className="flex items-center gap-1 border border-[#D0D5DD] px-3 py-[6px] rounded-md text-[#344054] text-[14px] font-medium cursor-pointer hover:bg-[#F9FAFB] transition">
          <span className="text-lg">
            <BackArrowIcon />
          </span>
          <span>Project Name</span>
        </div>
      </div>

      {/* Right: Save Project Button */}
      <button className="bg-[#2E90FA] hover:bg-[#1C78DC] text-white text-sm font-medium px-5 py-[6px] rounded-md transition">
        Save Project
      </button>
    </div>
  );
}
