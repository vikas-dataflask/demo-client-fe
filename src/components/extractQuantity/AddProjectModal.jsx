import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAddQEMutation } from "../../redux/features/api/api";
import {
  useGetEngineeringServicesQuery,
  useGetBuildingCategoriesQuery,
  useGetBuildingTypesQuery,
  useGetFloorsQuery,
} from "../../redux/features/api/latestAdminApi";

const AddProjectModal = ({ onClose, setProjectAdded }) => {
  const [addProject] = useAddQEMutation();
  const [building, setBuilding] = useState();
  const [subBuilding, setSubBuilding] = useState();

  // State variables for dynamic fields
  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState();
  const [selectedBuildingType, setSelectedBuildingType] = useState();

  const {
    data: serviceData,
    isLoading: isServiceLoading,
    isError: isServiceError,
  } = useGetEngineeringServicesQuery();

  const {
    data: buildingData,
    isLoading: isBuildingLoading,
    isError: isBuildingError,
  } = useGetBuildingCategoriesQuery();

  const {
    data: subBuildingData,
    isLoading: isSubBuildingLoading,
    isError: isSubBuildingError,
  } = useGetBuildingTypesQuery();

  const {
    data: leveldata,
    isLoading: isLevelLaoding,
    isError: isLevelError,
  } = useGetFloorsQuery();

  const token = localStorage.getItem("token");
  let userId = "";
  try {
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded?.id || decoded?._id || decoded?.user?.id || "";
    } else {
      // Fallback: try to get user ID from user object in localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userId = userObj?.user_id || userObj?.id || "";
      }
    }
  } catch (err) {
    console.error("Invalid token:", err);
    // Fallback: try to get user ID from user object in localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userId = userObj?.user_id || userObj?.id || "";
      }
    } catch (fallbackErr) {
      console.error("Failed to get user ID from localStorage:", fallbackErr);
    }
  }

  const [formData, setFormData] = useState({
    user: userId,
    name: "",
    service: "",
    service_name: "",
    building_type: "",
    building_type_name: "",
    sub_building_type: "",
    sub_building_type_name: "",
    level: "",
    level_name: "",
  });

  // Debug logging for token and user ID
  console.log("Token from localStorage:", token);
  console.log("User ID extracted:", userId);
  console.log("User object from localStorage:", localStorage.getItem("user"));
  console.log("Current form data:", formData);

  const [dxfFile, setDxfFile] = useState(null);

  // Keep state variables in sync with form data
  useEffect(() => {
    setSelectedBuildingCategory(formData.building_type);
  }, [formData.building_type]);

  useEffect(() => {
    setSelectedBuildingType(formData.sub_building_type);
  }, [formData.sub_building_type]);

  // Update formData.user when userId changes
  useEffect(() => {
    if (userId) {
      setFormData(prev => ({ ...prev, user: userId }));
    }
  }, [userId]);

  // Helper function to extract data from API response
  const extractApiData = (response) => {
    if (!response) return [];

    // Handle different response structures
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (response.data && !Array.isArray(response.data)) {
      // If data is an object, try to find array within it
      const arrayValue = Object.values(response.data).find((val) =>
        Array.isArray(val)
      );
      return arrayValue || [];
    }
    return [];
  };

  // Special extraction for nested building types structure
  const extractBuildingTypes = (response) => {
    if (!response?.data) return [];

    const extractedTypes = [];
    response.data.forEach((item) => {
      if (item.building_types && Array.isArray(item.building_types)) {
        // If a building category is selected, only show types from that category
        if (selectedBuildingCategory) {
          // Check if the category ID matches (it's nested in item.category._id)
          if (item.category?._id === selectedBuildingCategory) {
            extractedTypes.push(...item.building_types);
          }
        } else {
          // If no category selected, show all types
          extractedTypes.push(...item.building_types);
        }
      }
    });

    return extractedTypes;
  };

  // Special extraction for nested floors structure
  const extractFloors = (response) => {
    if (!response?.data) return [];

    const extractedFloors = [];
    response.data.forEach((item) => {
      if (item.floors && Array.isArray(item.floors)) {
        // If a building type is selected, only show floors from that type
        if (selectedBuildingType) {
          // Check if the building type ID matches (it's nested in item.building_type._id)
          if (item.building_type?._id === selectedBuildingType) {
            extractedFloors.push(...item.floors);
          }
        } else {
          // If no building type selected, show all floors
          extractedFloors.push(...item.floors);
        }
      }
    });

    return extractedFloors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Handle dependencies - reset dependent fields
    if (name === "building_type") {
      setSelectedBuildingCategory(value);
      // Find and set the building type name
      const selectedCategory = buildingData?.data?.find(cat => cat._id === value);
      setFormData((prev) => ({
        ...prev,
        building_type_name: selectedCategory?.name || "",
        sub_building_type: "",
        sub_building_type_name: "",
        level: "",
        level_name: "",
      }));
      setSubBuilding(undefined);
    }
    if (name === "sub_building_type") {
      setSelectedBuildingType(value);
      setSubBuilding(value);
      // Find and set the sub building type name
      const selectedType = extractBuildingTypes(subBuildingData).find(type => type._id === value);
      setFormData((prev) => ({
        ...prev,
        sub_building_type_name: selectedType?.name || "",
        level: "",
        level_name: "",
      }));
    }
    if (name === "service") {
      // Find and set the service name
      const selectedService = extractApiData(serviceData).find(service => service._id === value);
      setFormData((prev) => ({
        ...prev,
        service_name: selectedService?.name || "",
      }));
    }
    if (name === "level") {
      // Find and set the level name
      const selectedLevel = extractFloors(leveldata).find(level => level._id === value);
      setFormData((prev) => ({
        ...prev,
        level_name: selectedLevel?.name || selectedLevel?.floor_name || "",
      }));
    }
  };

  const handleFileChange = (e) => {
    setDxfFile(e.target.files[0]);
  };

  const handleAddProject = async () => {
    try {
      // Debug: Log the form data being sent
      console.log("Form data being sent:", formData);
      console.log("DXF file:", dxfFile);
      console.log("User ID:", userId);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
        console.log(`Appending ${key}: ${value}`);
      });
      if (dxfFile) {
        data.append("dxf_file", dxfFile);
        console.log("Appending dxf_file:", dxfFile.name);
      }

      // Debug: Log the FormData contents
      for (let [key, value] of data.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const response = await addProject(data).unwrap();
      console.log("Project added:", response);
      setProjectAdded(true);
      onClose();
    } catch (error) {
      console.error("Error adding project:", error);
      console.error("Error details:", {
        status: error.status,
        error: error.error,
        data: error.data
      });
    }
  };

  // Show loading state if any of the required data is still loading
  const isDataLoading = isServiceLoading || isBuildingLoading || isSubBuildingLoading || isLevelLaoding;

  // Early return if data is not ready
  if (isDataLoading || !buildingData?.data || !subBuildingData?.data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-[650px] p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[650px] p-6 rounded-2xl shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-800">
            Working on a new project?
          </h2>
          <button onClick={onClose} className="text-gray-500 text-xl">
            ×
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Project Name"
            autoComplete="off"
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none bg-gray-200"
          />
          <button
            onClick={handleAddProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Add Project
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Service</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
            >
              <option value="" disabled>
                Select a Service
              </option>

              {/* Loading State */}
              {isServiceLoading && (
                <option value="" disabled>
                  Loading services...
                </option>
              )}

              {/* Error State */}
              {isServiceError && (
                <option value="" disabled>
                  Error loading services
                </option>
              )}
              {!isServiceLoading &&
                !isServiceError &&
                extractApiData(serviceData).map((loc) => (
                  <option key={loc._id || loc.id} value={loc._id || loc.id}>
                    {loc.name || loc.title || loc.description}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Building Type
            </label>
            <select
              name="building_type"
              value={formData.building_type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
            >
              <option value="" disabled>
                Select a Building Type
              </option>

              {/* Loading State */}
              {isBuildingLoading && (
                <option value="" disabled>
                  Loading building...
                </option>
              )}

              {/* Error State */}
              {isBuildingError && (
                <option value="" disabled>
                  Error loading building
                </option>
              )}
              {!isBuildingLoading &&
                !isBuildingError &&
                extractApiData(buildingData).map((loc) => (
                  <option key={loc._id || loc.id} value={loc._id || loc.id}>
                    {loc.name || loc.type || loc.title || loc.description}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Sub Building Type
            </label>
            <select
              name="sub_building_type"
              value={formData.sub_building_type}
              disabled={!formData.building_type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
            >
              <option value="" disabled>
                {formData.building_type ? "Select a Sub Building Type" : "Select Building Type First"}
              </option>
              {/* Loading State */}
              {isSubBuildingLoading && (
                <option value="" disabled>
                  Loading Sub-building...
                </option>
              )}

              {/* Error State */}
              {isSubBuildingError && (
                <option value="" disabled>
                  Error loading Sub-building
                </option>
              )}
              {!isSubBuildingLoading &&
                !isSubBuildingError &&
                extractBuildingTypes(subBuildingData).map((loc) => (
                  <option key={loc._id || loc.id} value={loc._id || loc.id}>
                    {loc.name || loc.type || loc.title || loc.description}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Level</label>
            <select
              name="level"
              value={formData.level}
              disabled={!formData.sub_building_type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
            >
              <option value="" disabled>
                {formData.sub_building_type ? "Select a Level" : "Select Sub Building Type First"}
              </option>
              {isLevelLaoding && (
                <option value="" disabled>
                  Loading Levels...
                </option>
              )}

              {/* Error State */}
              {isLevelError && (
                <option value="" disabled>
                  Error loading Levels
                </option>
              )}
              {!isLevelLaoding &&
                !isLevelError &&
                extractFloors(leveldata).map((loc) => (
                  <option key={loc._id || loc.id} value={loc._id || loc.id}>
                    {loc.name || loc.floor_name || loc.floor_number || loc.level || loc.floor_level}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* DXF File Upload Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            Upload DXF File
          </label>
          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-300 rounded-md bg-gray-100 px-3 py-2">
              <span className="text-blue-600 text-lg">📄</span>
              <span className="text-sm text-gray-700 truncate">
                {dxfFile ? dxfFile.name : "Upload DXF"}
              </span>
            </div>
            <input
              type="file"
              accept=".dxf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
