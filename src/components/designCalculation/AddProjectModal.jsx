import React, { useState } from "react";
import { useEffect } from "react";

import { jwtDecode } from "jwt-decode";
import UploadIcon from "../../icons/UploadIcon";
import DWG_upload from "../../images/DWG_upload.svg";

import { useAddProjectMutation } from "../../redux/features/api/api";
import {
  useGetBuildingListQuery,
  useGetLevelsListQuery,
  useGetLocationListQuery,
  useGetSubBuildingListQuery,
} from "../../redux/features/api/backofficeApi";

// Import new admin API hooks
import {
  useGetLocationsQuery,
  useGetBuildingTypesQuery,
  useGetBuildingCategoriesQuery,
  useGetFloorsQuery,
} from "../../redux/features/api/latestAdminApi";

const AddProjectModal = ({ onClose, setProjectAdded }) => {
  const [building, setBuilding] = useState();
  const [subBuilding, setSubBuilding] = useState();
  const [addProject] = useAddProjectMutation();

  // New state variables for dynamic new admin fields
  const [selectedNewBuildingCategory, setSelectedNewBuildingCategory] =
    useState();
  const [selectedNewBuildingType, setSelectedNewBuildingType] = useState();

  // Existing API hooks (old admin panel)
  const {
    data: locationData,
    isLoading: isLocationLoading,
    isError: isLocationError,
  } = useGetLocationListQuery();
  const {
    data: buildingData,
    isLoading: isBuildingLoading,
    isError: isBuildingError,
  } = useGetBuildingListQuery();
  const {
    data: subBuildingData,
    isLoading: isSubBuildingLoading,
    isError: isSubBuildingError,
  } = useGetSubBuildingListQuery(building);
  const {
    data: leveldata,
    isLoading: isLevelLaoding,
    isError: isLevelError,
  } = useGetLevelsListQuery(subBuilding);

  // New admin API hooks
  const {
    data: newLocations,
    isLoading: isNewLocationLoading,
    isError: isNewLocationError,
  } = useGetLocationsQuery();
  const {
    data: newBuildingTypes,
    isLoading: isNewBuildingTypeLoading,
    isError: isNewBuildingTypeError,
  } = useGetBuildingTypesQuery();
  const {
    data: newBuildingCategories,
    isLoading: isNewBuildingCategoryLoading,
    isError: isNewBuildingCategoryError,
  } = useGetBuildingCategoriesQuery();
  const {
    data: newFloors,
    isLoading: isNewFloorLoading,
    isError: isNewFloorError,
  } = useGetFloorsQuery();

  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");

  // Simplified user ID extraction - directly from localStorage
  let userId = "";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      userId = userObj?.user_id || "";
      console.log("User ID extracted from localStorage:", userId);
    }
  } catch (err) {
    console.error("Failed to get user ID from localStorage:", err);
  }

  // Log the final userId value
  console.log("Final userId value:", userId);
  console.log("userId type:", typeof userId);
  console.log("userId length:", userId.length);

  const [formData, setFormData] = useState({
    user: userId,
    name: "",
    location: "",
    building_type: "",
    sub_building_type: "",
    level: "",
    dxf_file: "",
    // New fields for new admin API
    new_location: "",
    new_building_type: "",
    new_building_category: "",
    new_floor: "",
  });

  // Keep state variables in sync with form data - moved after formData declaration
  useEffect(() => {
    setSelectedNewBuildingCategory(formData.new_building_category);
  }, [formData.new_building_category]);

  useEffect(() => {
    setSelectedNewBuildingType(formData.new_building_type);
  }, [formData.new_building_type]);

  // Helper function to extract data from new admin API response
  const extractNewApiData = (response) => {
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
    response.data.forEach((item, index) => {
      if (item.building_types && Array.isArray(item.building_types)) {
        // If a building category is selected, only show types from that category
        if (selectedNewBuildingCategory) {
          // Check if the category ID matches (it's nested in item.category._id)
          if (item.category?._id === selectedNewBuildingCategory) {
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
    response.data.forEach((item, index) => {
      if (item.floors && Array.isArray(item.floors)) {
        // If a building type is selected, only show floors from that type
        if (selectedNewBuildingType) {
          // Check if the building type ID matches (it's nested in item.building_type._id)
          if (item.building_type?._id === selectedNewBuildingType) {
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

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      return newFormData;
    });

    // Handle existing admin panel dependencies
    if (name === "building_type") {
      setBuilding(value);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        sub_building_type: "",
        level: "",
      }));
      setSubBuilding(undefined);
    }
    if (name === "sub_building_type") {
      setSubBuilding(value);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        level: "",
      }));
    }

    // Handle new admin panel dependencies - reset dependent fields
    if (name === "new_building_category") {
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        new_building_type: "",
        new_floor: "",
      }));
    }
    if (name === "new_building_type") {
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        new_floor: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".dxf")) {
      setSelectedFile(file);
    }
  };

  const handleAddProject = async () => {
    // Debug: Log userId at the start of the function
    console.log("handleAddProject - userId at start:", userId);
    console.log("handleAddProject - userId type:", typeof userId);
    console.log("handleAddProject - userId length:", userId.length);
    console.log("handleAddProject - userId truthy check:", !!userId);

    // Validate user ID before proceeding
    if (!userId) {
      alert("User ID not found. Please log in again.");
      console.error("Cannot add project: No valid user ID");
      console.error("userId value:", userId);
      console.error("userId type:", typeof userId);
      return;
    }

    const form = new FormData();
    form.append("user", userId);
    form.append("name", formData.name);
    form.append("location", formData.new_location);
    form.append("building_type", formData.new_building_type);
    form.append("sub_building_type", formData.new_building_category);
    form.append("level", formData.new_floor);
    form.append("dxf_file", selectedFile); // ✅ name must match `upload.single("dxf_file")` on backend

    // Debug: Log what's being sent
    console.log("Sending payload:", {
      user: userId,
      name: formData.name,
      location: formData.new_location,
      building_type: formData.new_building_type,
      sub_building_type: formData.new_building_category,
      level: formData.new_floor,
      dxf_file: selectedFile?.name || "No file",
    });

    try {
      const response = await addProject(form).unwrap();
      console.log("Project added:", response);
      setProjectAdded(true);
      onClose();
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project. Please try again.");
    }
  };

  return (
    <div className="bg-black/50 fixed inset-0 z-40">
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/4 z-50">
        <div className="bg-white w-[650px] p-6 rounded-2xl shadow-lg max-h-[80vh] overflow-y-auto">
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

          {/* New Fields Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">
              🚀 New Admin Panel Fields
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Location (New)
                </label>
                <select
                  name="new_location"
                  value={formData.new_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-green-300 text-gray-700 focus:outline-none bg-green-50"
                >
                  <option value="" disabled selected>
                    Select a Location
                  </option>

                  {/* Loading State */}
                  {isNewLocationLoading && (
                    <option value="" disabled>
                      Loading locations...
                    </option>
                  )}

                  {/* Error State */}
                  {isNewLocationError && (
                    <option value="" disabled>
                      Error loading locations
                    </option>
                  )}

                  {/* Data Options */}
                  {!isNewLocationLoading &&
                    !isNewLocationError &&
                    extractNewApiData(newLocations).map((loc) => (
                      <option key={loc._id || loc.id} value={loc._id || loc.id}>
                        {loc.city ||
                          loc.state ||
                          loc.country ||
                          loc.name ||
                          loc.title}
                      </option>
                    ))}

                  {/* Fallback: Direct data access if extraction fails */}
                  {!isNewLocationLoading &&
                    !isNewLocationError &&
                    extractNewApiData(newLocations).length === 0 &&
                    newLocations?.data?.map((loc) => (
                      <option key={loc._id || loc.id} value={loc._id || loc.id}>
                        {loc.city ||
                          loc.state ||
                          loc.country ||
                          loc.name ||
                          loc.title ||
                          loc.type}
                      </option>
                    ))}

                  {/* No Data State */}
                  {!isNewLocationLoading &&
                    !isNewLocationError &&
                    extractNewApiData(newLocations).length === 0 &&
                    (!newLocations?.data || newLocations.data.length === 0) && (
                      <option value="" disabled>
                        No locations available
                      </option>
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Building Category (New){" "}
                  <span className="text-xs text-gray-500">→ Step 1</span>
                </label>
                <select
                  name="new_building_category"
                  value={formData.new_building_category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-green-300 text-gray-700 focus:outline-none bg-green-50"
                >
                  <option value="" disabled selected>
                    Select a Building Category
                  </option>
                  {/* Loading State */}
                  {isNewBuildingCategoryLoading && (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  )}

                  {/* Error State */}
                  {isNewBuildingCategoryError && (
                    <option value="" disabled>
                      Error loading categories
                    </option>
                  )}

                  {/* Data Options */}
                  {!isNewBuildingCategoryLoading &&
                    !isNewBuildingCategoryError &&
                    extractNewApiData(newBuildingCategories).map((category) => (
                      <option
                        key={category._id || category.id}
                        value={category._id || category.id}
                      >
                        {category.type ||
                          category.name ||
                          category.title ||
                          category.description}
                      </option>
                    ))}

                  {/* Fallback: Direct data access if extraction fails */}
                  {!isNewBuildingCategoryLoading &&
                    !isNewBuildingCategoryError &&
                    extractNewApiData(newBuildingCategories).length === 0 &&
                    newBuildingCategories?.data?.map((category) => (
                      <option
                        key={category._id || category.id}
                        value={category._id || category.id}
                      >
                        {category.type ||
                          category.name ||
                          category.title ||
                          category.description}
                      </option>
                    ))}

                  {/* No Data State */}
                  {!isNewBuildingCategoryLoading &&
                    !isNewBuildingCategoryError &&
                    extractNewApiData(newBuildingCategories).length === 0 &&
                    (!newBuildingCategories?.data ||
                      newBuildingCategories.data.length === 0) && (
                      <option value="" disabled>
                        No categories available
                      </option>
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Building Type (New){" "}
                  <span className="text-xs text-gray-500">→ Step 2</span>
                </label>
                <select
                  name="new_building_type"
                  value={formData.new_building_type}
                  disabled={!formData.new_building_category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-green-300 text-gray-700 focus:outline-none bg-green-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled selected>
                    {formData.new_building_category
                      ? "Select a Building Type"
                      : "Select Building Category First"}
                  </option>
                  {/* Loading State */}
                  {isNewBuildingTypeLoading && (
                    <option value="" disabled>
                      Loading building types...
                    </option>
                  )}

                  {/* Error State */}
                  {isNewBuildingTypeError && (
                    <option value="" disabled>
                      Error loading building types
                    </option>
                  )}

                  {/* Data Options */}
                  {!isNewBuildingTypeLoading &&
                    !isNewBuildingTypeError &&
                    extractBuildingTypes(newBuildingTypes).map((type) => (
                      <option
                        key={type._id || type.id}
                        value={type._id || type.id}
                      >
                        {type.type ||
                          type.name ||
                          type.title ||
                          type.description}
                      </option>
                    ))}

                  {/* Fallback: Direct data access if extraction fails */}
                  {!isNewBuildingTypeLoading &&
                    !isNewBuildingTypeError &&
                    extractBuildingTypes(newBuildingTypes).length === 0 &&
                    newBuildingTypes?.data?.map((type) => (
                      <option
                        key={type._id || type.id}
                        value={type._id || type.id}
                      >
                        {type.type ||
                          type.name ||
                          type.title ||
                          type.description}
                      </option>
                    ))}

                  {/* No Data State */}
                  {!isNewBuildingTypeLoading &&
                    !isNewBuildingTypeError &&
                    extractBuildingTypes(newBuildingTypes).length === 0 &&
                    (!newBuildingTypes?.data ||
                      newBuildingTypes.data.length === 0) && (
                      <option value="" disabled>
                        No building types available
                      </option>
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Floor (New){" "}
                  <span className="text-xs text-gray-500">→ Step 3</span>
                </label>
                <select
                  name="new_floor"
                  value={formData.new_floor}
                  disabled={!formData.new_building_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-green-300 text-gray-700 focus:outline-none bg-green-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="" disabled selected>
                    {formData.new_building_type
                      ? "Select a Floor"
                      : "Select Building Type First"}
                  </option>
                  {isNewFloorLoading && (
                    <option value="" disabled>
                      Loading floors...
                    </option>
                  )}

                  {/* Error State */}
                  {isNewFloorError && (
                    <option value="" disabled>
                      Error loading floors
                    </option>
                  )}

                  {/* Data Options */}
                  {!isNewFloorLoading &&
                    !isNewFloorError &&
                    extractFloors(newFloors).map((floor) => (
                      <option
                        key={floor._id || floor.id}
                        value={floor._id || floor.id}
                      >
                        {floor.name ||
                          floor.floor_name ||
                          floor.floor_number ||
                          floor.level ||
                          floor.floor_level}
                      </option>
                    ))}

                  {/* Fallback: Direct data access if extraction fails */}
                  {!isNewFloorLoading &&
                    !isNewFloorError &&
                    extractFloors(newFloors).length === 0 &&
                    newFloors?.data?.map((floor) => (
                      <option
                        key={floor._id || floor.id}
                        value={floor._id || floor.id}
                      >
                        {floor.name ||
                          floor.floor_name ||
                          floor.floor_number ||
                          floor.level ||
                          floor.floor_level}
                      </option>
                    ))}

                  {/* No Data State */}
                  {!isNewFloorLoading &&
                    !isNewFloorError &&
                    extractFloors(newFloors).length === 0 &&
                    (!newFloors?.data || newFloors.data.length === 0) && (
                      <option value="" disabled>
                        No floors available
                      </option>
                    )}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className=" text-gray-700 mb-1">
              <div className=" ">Project Files</div>
              <div className="relative cursor-pointer">
                <div className="flex justify-between mt-6 mb-6 border border-gray-300 p-2 text-l bg-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <img
                      src={DWG_upload}
                      alt="Upload Icon"
                      className="h-5 w-5"
                    />
                    <span>
                      {selectedFile ? selectedFile.name : "Upload Plan (.dxf)"}
                    </span>
                  </div>
                  <div className="text-white p-2 rounded">
                    <UploadIcon />
                  </div>
                </div>
                <input
                  type="file"
                  accept=".dxf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
