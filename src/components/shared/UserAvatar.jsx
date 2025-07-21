import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../redux/features/app/userSLice";

// Import icons from Heroicons
import {
  Cog6ToothIcon, // For Settings
  RocketLaunchIcon, // For Upgrade Plan
  ArrowRightOnRectangleIcon, // For Log out
} from "@heroicons/react/24/outline"; // Using outline icons for a modern, light feel

export default function UserAvatar({ onOpenSettings }) {
  const user = useSelector((state) => state.user);
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    dispatch(clearUser());
    setIsOpen(false); // Close dropdown on logout
    navigate("/login");
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    setIsOpen(false);
  };

  const nameToDisplay = user?.username || storedUser?.username || "User";
  const initials = nameToDisplay ? nameToDisplay.charAt(0).toUpperCase() : "U";
  const profilePicUrl = user?.profilePicUrl || storedUser?.profilePicUrl;
  const userEmail = user?.email || storedUser?.email || "user@example.com";

  const finalImageUrl = profilePicUrl
    ? `http://localhost:8000${profilePicUrl}`
    : null;

  // Set this to true to disable the upgrade button
  const isUpgradeDisabled = true; // <-- NEW: Control flag for the button

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        id="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {finalImageUrl ? (
          <img
            src={finalImageUrl}
            alt={`${nameToDisplay}'s avatar`}
            className="w-12 h-12 rounded-full object-cover shadow-sm hover:shadow-md transition-shadow duration-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold tracking-tight shadow-sm hover:shadow-md transition-shadow duration-200">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-3 w-64 origin-top-right rounded-xl bg-white shadow-xl focus:outline-none
            transform opacity-0 scale-95 transition-all duration-200 ease-out
            ${isOpen ? "opacity-100 scale-100" : ""}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {/* User Info Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {nameToDisplay}
            </p>
            <p className="text-sm text-gray-600 truncate">{userEmail}</p>
          </div>

          {/* Menu Items Group 1 */}
          <div className="px-2 py-2">
            <button
              onClick={handleSettingsClick}
              className="group flex w-full items-center rounded-lg px-3 py-2.5 text-base font-medium text-gray-800 transition-all duration-200 ease-in-out hover:bg-indigo-50 hover:text-indigo-700"
              role="menuitem"
            >
              <Cog6ToothIcon
                className="h-5 w-5 mr-3 text-gray-500 group-hover:text-indigo-600"
                aria-hidden="true"
              />
              Settings
            </button>

            {/* UPGRADE PLAN BUTTON - MODIFIED */}
            <button
              onClick={() => {
                // This will only run if the button is NOT disabled.
                // The `disabled` attribute prevents the click event from firing.
                if (!isUpgradeDisabled) {
                  navigate("/upgrade-plan");
                  setIsOpen(false);
                }
              }}
              className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-200 ease-in-out
                ${
                  isUpgradeDisabled
                    ? "text-gray-600 cursor-not-allowed " // Disabled styles
                    : "text-gray-800 hover:bg-indigo-50 hover:text-indigo-700" // Enabled styles
                }`}
              role="menuitem"
              disabled={isUpgradeDisabled} // <-- NEW: The disabled attribute
            >
              <RocketLaunchIcon
                className={`h-5 w-5 mr-3 ${
                  isUpgradeDisabled
                    ? "text-gray-400"
                    : "text-gray-500 group-hover:text-indigo-600"
                }`}
                aria-hidden="true"
              />
              Upgrade Plan
            </button>
          </div>

          {/* Menu Items Group 2 (e.g., Logout) */}
          <div className="px-2 py-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-lg px-3 py-2.5 text-base font-medium text-gray-800 transition-all duration-200 ease-in-out hover:bg-red-50 hover:text-red-700"
              role="menuitem"
            >
              <ArrowRightOnRectangleIcon
                className="h-5 w-5 mr-3 text-gray-500 group-hover:text-red-600"
                aria-hidden="true"
              />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
