import DraftSideBar from "../shared/DraftSideBar";
import UserAvatar from "../shared/UserAvatar";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectListQuery } from "../../redux/features/api/api";
import {
  useGetLocationsQuery,
  useGetBuildingTypesQuery,
} from "../../redux/features/api/latestAdminApi";
// import CalculationIcon from "../icons/CalculationIcon";
// import HeatLoadIcon from "../icons/HeatLoadIcon";
// import CadToRevitIcon from "../icons/CadToRevitIcon";
// import ExtractIcon from "../icons/ExtractIcon";
// import ShopIcon from "../icons/ShopIcon";
// import HomeIcon from "../icons/HomeIcon";
// import BuildingIcon from "../icons/ReactangleIcon";
// import ProjectIcon from "../icons/FileSetup";

function Home({ onOpenSettings }) {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Fetch real projects from the database
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useGetProjectListQuery(undefined, {
    refetchOnFocus: true,
  });

  // Fetch location and building type data from new admin API
  const { data: locationData } = useGetLocationsQuery();
  const { data: buildingData } = useGetBuildingTypesQuery();

  const username = user?.username || user?.firstName || "User";

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get location name by ID - updated for new admin API structure
  const getLocationName = (locationId) => {
    if (!locationData?.data || !locationId) return "N/A";
    const location = locationData.data.find((loc) => loc._id === locationId);
    return location ? (location.city || location.state || location.country || location.name || location.title) : "N/A";
  };

  // Get building type name by ID - updated for new admin API structure
  const getBuildingTypeName = (buildingTypeId) => {
    if (!buildingData?.data || !buildingTypeId) return "N/A";
    const building = buildingData.data.find(
      (build) => build._id === buildingTypeId
    );
    return building ? (building.type || building.name || building.title || building.description) : "N/A";
  };

  const quickActions = [
    {
      title: "Design Calculation",
      description: "Perform engineering calculations",
      icon: "🧮",
      color: "bg-blue-100",
      iconColor: "bg-blue-500",
      path: "/design-calculation",
    },
    {
      title: "Heat Load",
      description: "Calculate thermal loads",
      icon: "🔥",
      color: "bg-green-100",
      iconColor: "bg-green-500",
      path: "/heat-load",
    },
    {
      title: "CAD to Revit",
      description: "Convert CAD files to Revit",
      icon: "📐",
      color: "bg-purple-100",
      iconColor: "bg-purple-500",
      path: "/cad-to-revit",
    },
    {
      title: "Extract Quantity",
      description: "Extract material quantities",
      icon: "📊",
      color: "bg-orange-100",
      iconColor: "bg-orange-500",
      path: "/extract-quantity",
    },
    {
      title: "Product Comparison",
      description: "Compare product specifications",
      icon: "🛒",
      color: "bg-indigo-100",
      iconColor: "bg-indigo-500",
      path: "/product-comparison",
    },
  ];

  const handleQuickActionClick = (path) => {
    navigate(path);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}/file-setup`);
  };

  return (
    <div style={{ display: "flex" }}>
      <DraftSideBar />
      <div className="absolute top-4 right-4">
        <UserAvatar onOpenSettings={onOpenSettings} />
      </div>
      <div
        style={{
          padding: "40px",
          marginLeft: "250px",
          flex: 1,
          backgroundColor: "#f8fafc",
        }}
      >
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-lg mr-4">
              <span className="text-white text-2xl">🏠</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {username}!
              </h1>
              <p className="text-blue-100 text-lg">
                Ready to make today productive?
              </p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-gray-100 p-2 rounded-full mr-3">
              <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Your Projects
            </h2>
          </div>

          {projectsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading projects...</p>
            </div>
          ) : projectsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">
                Failed to load projects. Please try again.
              </p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                >
                  {/* Project Name */}
                  <div className="mb-4">
                    <h3
                      className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300"
                      title={project.name}
                    >
                      {project.name}
                    </h3>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center group-hover:transform group-hover:translate-x-1 transition-transform duration-300">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                        <span className="text-blue-600 text-sm">📍</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          Location
                        </p>
                        <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                          {getLocationName(project.location)}
                        </p>
                      </div>
                    </div>

                    {/* Building Type */}
                    <div className="flex items-center group-hover:transform group-hover:translate-x-1 transition-transform duration-300">
                      <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-200 transition-colors duration-300">
                        <span className="text-green-600 text-sm">🏢</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          Building Type
                        </p>
                        <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                          {getBuildingTypeName(project.building_type)}
                        </p>
                      </div>
                    </div>

                    {/* Last Saved */}
                    <div className="flex items-center group-hover:transform group-hover:translate-x-1 transition-transform duration-300">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors duration-300">
                        <span className="text-purple-600 text-sm">💾</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          Last Saved
                        </p>
                        <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                          {formatDate(project.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-gray-600 text-2xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600">
                Create your first project to get started!
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-gray-100 p-2 rounded-full mr-3">
              <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Frequently used features at your fingertips
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={() => handleQuickActionClick(action.path)}
                className={`${action.color} rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border border-transparent hover:border-gray-200`}
              >
                <div
                  className={`${action.iconColor} p-3 rounded-lg w-fit mb-4`}
                >
                  <div className="text-white text-2xl">{action.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Items Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
            <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No active engagement items
          </h3>
          <p className="text-gray-600">
            Check back later for announcements, updates, and new features!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
