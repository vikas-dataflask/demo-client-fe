import React from "react";
import { NavLink } from "react-router-dom";
import AiIcon from "../../icons/AiIcon";
import DCIcon from "../../icons/DCIcon";
import DialuxIcon from "../../icons/DialuxIcon";
// REMOVED: useNavigate, useDispatch, setUser, clearUser, useSelector - no longer needed for profile/logout in sidebar

import CadToRevitIcon from "../../icons/CadToRevitIcon";
import ExtractIcon from "../../icons/ExtractIcon";
import PCIcon from "../../icons/PCIcon";
import ShopIcon from "../../icons/ShopIcon";
import SettingIcon from "../../icons/SettingIcon";
import ResourceIcon from "../../icons/ResourceIcon";
// REMOVED: ArrowDown - no longer needed as profile section is gone
import HeatIcon from "../../icons/HeatIcon";
import HomeIcon from "../../icons/HomeIcon";

// All menu items
const aiTools = [
  { label: "Design Calculation", to: "/design-calculation", icon: DCIcon },
  { label: "Dialux", to: "/dialux", icon: DialuxIcon },
  { label: "Heat Load", to: "/heat-load", icon: HeatIcon },
  { label: "Cad to Revit", to: "/cad-to-revit", icon: CadToRevitIcon },
  { label: "Extract Quantity", to: "/extract-quantity", icon: ExtractIcon },
  { label: "Product Comparison", to: "/product-comparison", icon: PCIcon },
];

const advancedTools = [
  { label: "Cad to Revit", to: "/advanced-cad-to-revit", icon: CadToRevitIcon },
  { label: "Shop", to: "/shop", icon: ShopIcon },
];

const bottomItems = [
  { label: "Settings", to: "/settings", icon: SettingIcon },
  { label: "Resources", to: "/resources", icon: ResourceIcon },
  // REMOVED: Logout from here, as it's now in UserAvatar dropdown
  // { label: "Logout", to: "/login", icon: ResourceIcon, logout: true },
];

export default function DraftSideBar() {
  // REMOVED: user, storedUser, displayName - no longer needed in sidebar
  // const user = useSelector((state) => state.user);
  // const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  // const displayName =
  //   user?.username || storedUser?.username || user?.email || storedUser?.email;

  // REMOVED: navigate, dispatch - no longer needed in sidebar
  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  // REMOVED: handleLogout function - now in UserAvatar
  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   dispatch(clearUser());
  //   navigate("/login");
  // };

  return (
    <div className="w-[280px] h-screen fixed top-0 left-0 flex flex-col justify-between bg-white border-r border-[#E5E7EB] font-sans text-[14px]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-[14px] border-b border-[#E5E7EB]">
        <div
          className="w-8 h-8 rounded-md bg-cover bg-center"
          style={{ backgroundImage: "url('/src/images/dd.svg')" }}
        ></div>
        <div className="text-[16px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Design Drafter
        </div>
      </div>

      {/* Menu */}
      <ul className="flex-1 overflow-y-auto px-[10px] mt-3 scrollbar-hide">
        {/* Home */}
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-[10px] rounded-md no-underline ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-800 hover:bg-gray-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <HomeIcon
                className={`w-5 h-5 ${isActive ? "invert brightness-0" : ""}`}
              />
              <span>Home</span>
            </>
          )}
        </NavLink>

        {/* AI Tools Header */}
        <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium uppercase px-2 mt-6 mb-2">
          <AiIcon className="w-4 h-4 text-gray-400" />
          AI Tools
        </div>

        {/* AI Tools Items */}
        {aiTools.map(({ label, to, icon: Icon }, idx) => (
          <NavLink
            key={idx}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-[10px] rounded-md no-underline ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {/* Advanced Header */}
        <div className="text-[12px] text-gray-400 uppercase font-medium mt-6 mb-2 px-2">
          Advanced
        </div>

        {/* Advanced Tools */}
        {advancedTools.map(({ label, to, icon: Icon }, idx) => (
          <NavLink
            key={idx}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-[10px] rounded-md no-underline ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="h-[1px] bg-[#E5E7EB] my-3" />

        {/* Bottom Items */}
        {bottomItems.map(({ label, to, icon: Icon, logout }, idx) => (
          // The logout button logic is now handled in UserAvatar, so we only render NavLinks here
          <NavLink
            key={idx}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-[10px] rounded-md no-underline ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-800 hover:bg-gray-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </ul>

      {/* REMOVED: The Profile Section (NavLink) from here as it's moved to UserAvatar component */}
    </div>
  );
}
