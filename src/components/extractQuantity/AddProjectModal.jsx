import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAddQEMutation } from "../../redux/features/api/api";
import {
  useGetBuildingListQuery,
  useGetLevelsListQuery,
  useGetServiceListQuery,
  useGetSubBuildingListQuery,
} from "../../redux/features/api/backofficeApi";

const AddProjectModal = ({ onClose, setProjectAdded }) => {
  const [addProject] = useAddQEMutation();
  const [building, setBuilding] = useState();
  const [subBuilding, setSubBuilding] = useState();

  const {
    data: serviceData,
    isLoading: isServiceLoading,
    isError: isServiceError,
  } = useGetServiceListQuery();

  const {
    data: buildingData,
    isLoading: isBuildingLoading,
    isError: isBuildingError,
  } = useGetBuildingListQuery();
  const {
    data: subBuildingData,
    isLoading: isSubBuildingLoading,
    isError: isSubBuildingError,
  } = useGetSubBuildingListQuery(building, {
    skip: !building,
  });
  const {
    data: leveldata,
    isLoading: isLevelLaoding,
    isError: isLevelError,
  } = useGetLevelsListQuery(subBuilding, {
    skip: !subBuilding,
  });

  const token = localStorage.getItem("token");
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
    service: "",
    building_type: "",
    sub_building_type: "",
    level: "",
  });

  const [dxfFile, setDxfFile] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "building_type") {
      setBuilding(value);
    }
    if (name === "sub_building_type") {
      setSubBuilding(value);
    }
  };

  const handleFileChange = (e) => {
    setDxfFile(e.target.files[0]);
  };

  const handleAddProject = async () => {
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (dxfFile) {
        data.append("dxf_file", dxfFile); // Change key name based on your backend
      }

      const response = await addProject(data).unwrap();
      console.log("Project added:", response);
      setProjectAdded(true);
      onClose();
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

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
              <option value="" disabled selected>
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
                serviceData?.data?.map((loc) => (
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
              <option value="" disabled selected>
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
                buildingData?.data?.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.type}
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
              <option value="" disabled selected>
                Select a Sub Building Type
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
              disabled={!formData.sub_building_type}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-500 focus:outline-none bg-gray-200"
            >
              <option value="" disabled selected>
                Select a Level
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
                leveldata?.data?.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
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
