import React, { useState } from "react";

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

const AddProjectModal = ({ onClose, setProjectAdded }) => {
  const [addProject] = useAddProjectMutation();
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
  } = useGetSubBuildingListQuery();
  const {
    data: leveldata,
    isLoading: isLevelLaoding,
    isError: isLevelError,
  } = useGetLevelsListQuery();
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");
  // const userId = token ? jwtDecode(token)?.user?.id : null;
  let userId = "";
  try {
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded?.id || decoded?._id || decoded?.user?.id || "";
    }
  } catch (err) {
    console.error("Invalid token:", err);
  }

  const [formData, setFormData] = useState({
    user: userId,
    name: "",
    location: "",
    building_type: "",
    sub_building_type: "",
    level: "",
    dxf_file: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".dxf")) {
      setSelectedFile(file);
    }
  };

  const handleAddProject = async () => {
    const form = new FormData();
    form.append("user", formData.user);
    form.append("name", formData.name);
    form.append("location", formData.location);
    form.append("building_type", formData.building_type);
    form.append("sub_building_type", formData.sub_building_type);
    form.append("level", formData.level);
    form.append("dxf_file", selectedFile); // ✅ name must match `upload.single("dxf_file")` on backend

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
              <label className="block text-sm text-gray-700 mb-1">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full overflow-y-auto px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
              >
                {/* Loading State */}
                {isLocationLoading && (
                  <option value="" disabled>
                    Loading locations...
                  </option>
                )}

                {/* Error State */}
                {isLocationError && (
                  <option value="" disabled>
                    Error loading locations
                  </option>
                )}
                {!isLocationLoading &&
                  !isLocationError &&
                  locationData?.data?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
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
                  buildingData?.data?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.type}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Sub building type
              </label>
              <select
                name="sub_building_type"
                value={formData.sub_building_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
              >
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
                  subBuildingData?.data?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.type}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
              >
                {isLevelLaoding && (
                  <option value="" disabled>
                    Loading Sub-building...
                  </option>
                )}

                {/* Error State */}
                {isLevelError && (
                  <option value="" disabled>
                    Error loading Sub-building
                  </option>
                )}
                {!isLevelLaoding &&
                  !isLevelError &&
                  leveldata?.data?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
              </select>
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
