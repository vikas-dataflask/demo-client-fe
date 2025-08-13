import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  resetRooms,
  clearProjectData as clearRoomProjectData,
} from "../../redux/features/app/roomSlice";
import {
  // resetFloorPlan,
  resetArea,
} from "../../redux/features/app/FloorPlanSlice";
import { clearRoomLights } from "../../redux/features/app/lightingSlice";
import { clearPower } from "../../redux/features/app/powerSlice";
import {
  clearAllFloors,
  clearProjectData as clearFloorProjectData,
} from "../../redux/features/app/floorSlice";
import {
  clearWalls,
  clearHighlightedWalls,
} from "../../redux/features/app/wallSlice";
import { clearDoors } from "../../redux/features/app/doorSlice";
import { clearWindows } from "../../redux/features/app/windowSlice";
import { clearHeatLoadData } from "../../redux/features/app/heatLoadSlice";
import { clearDxfFloorPlan } from "../../redux/features/app/dxfSlice";
import { resetDialuxResult } from "../../redux/features/app/dialuxSlice";
import { resetAreas } from "../../redux/features/app/areaMarkupSlice";

import AddProjectModal from "./AddProjectModal";
import {
  useGetProjectListQuery,
  useDeleteProjectMutation,
} from "../../redux/features/api/api";
import DraftSideBar from "../shared/DraftSideBar";
import UserAvatar from "../shared/UserAvatar";

const DesignCalculation = ({ onOpenSettings }) => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [projectAdded, setProjectAdded] = useState(false);
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useGetProjectListQuery(undefined, {
    refetchOnFocus: true,
  });

  const [deleteProject] = useDeleteProjectMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    // Only clear Redux stores when component mounts if there's no active project
    // This prevents clearing rooms when just navigating to this page
    const hasActiveProject = localStorage.getItem("currentProjectId");

    if (!hasActiveProject) {
      console.log(
        "🧹 DesignCalculation: No active project, clearing all stores"
      );
      dispatch(resetRooms());
      // dispatch(resetFloorPlan());
      dispatch(resetArea());
      dispatch(clearRoomLights());
      dispatch(clearPower());
      dispatch(clearAllFloors());
      dispatch(clearWalls());
      dispatch(clearHighlightedWalls());
      dispatch(clearDoors());
      dispatch(clearWindows());
      dispatch(clearHeatLoadData());
      dispatch(clearDxfFloorPlan());
      dispatch(resetDialuxResult());
      dispatch(resetAreas());
      dispatch(clearRoomProjectData());
      dispatch(clearFloorProjectData());
    } else {
      console.log(
        "🔒 DesignCalculation: Active project found, preserving room data"
      );
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.removeItem("floorPlan");
    localStorage.removeItem("blocks");
    localStorage.removeItem("entities");
    localStorage.removeItem("layers");
  }, []);

  useEffect(() => {
    if (projectAdded) {
      refetch();
      setProjectAdded(false);
    }
  }, [projectAdded, refetch]);

  const handleDelete = async (id) => {
    try {
      await deleteProject(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[280px] border-r border-gray-200 bg-white">
        <DraftSideBar />
      </div>

      {/* Right Main Content */}
      <div className="flex-1 bg-[#f7f7f7] relative overflow-y-auto">
        {/* TOP RIGHT ICONS & BUTTONS */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#007bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add New
          </button>
          <UserAvatar onOpenSettings={onOpenSettings} />
        </div>

        {/* Main Content */}
        <div className="px-8 pt-20 pb-8">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading projects...</p>
          ) : isError ? (
            <p className="text-center text-red-500">Failed to load projects.</p>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.name}
                  className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-300"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {project.name}
                    </h3>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-sm font-semibold text-red-600 bg-red-100 px-4 py-1 rounded border border-red-600 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        // Clear all data when opening a new project
                        console.log(
                          "🧹 DesignCalculation: Opening new project, clearing all stores"
                        );
                        dispatch(resetRooms());
                        // dispatch(resetFloorPlan());
                        dispatch(resetArea());
                        dispatch(clearRoomLights());
                        dispatch(clearPower());
                        dispatch(clearAllFloors());
                        dispatch(clearWalls());
                        dispatch(clearHighlightedWalls());
                        dispatch(clearDoors());
                        dispatch(clearWindows());
                        dispatch(clearHeatLoadData());
                        dispatch(clearDxfFloorPlan());
                        dispatch(resetDialuxResult());
                        dispatch(resetAreas());
                        dispatch(clearRoomProjectData());
                        dispatch(clearFloorProjectData());

                        // Clear localStorage
                        localStorage.removeItem("confirmedLightingDbs");
                        localStorage.removeItem("confirmedPowerDbs");

                        // Clear all Redux stores before opening project
                        dispatch(resetRooms());
                        // dispatch(resetFloorPlan());
                        dispatch(resetArea());
                        dispatch(clearRoomLights());
                        dispatch(clearPower());
                        dispatch(clearAllFloors());
                        dispatch(clearWalls());
                        dispatch(clearHighlightedWalls());
                        dispatch(clearDoors());
                        dispatch(clearWindows());
                        dispatch(clearHeatLoadData());
                        dispatch(clearDxfFloorPlan());
                        dispatch(resetDialuxResult());
                        dispatch(resetAreas());
                        dispatch(clearRoomProjectData());
                        dispatch(clearFloorProjectData());

                        // Navigate to project
                        navigate(`/project/${project._id}/file-setup`);
                      }}
                      className="text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-1 rounded border border-blue-600 hover:bg-blue-200 transition"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-20">
              <img
                src="/src/images/DC.svg"
                alt="No Project"
                className="w-[320px] mix-blend-multiply object-contain mb-6 mx-auto"
              />
              <p className="text-sm text-gray-500">
                No project to show in Design Calculation
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <AddProjectModal
            onClose={() => setShowModal(false)}
            setProjectAdded={setProjectAdded}
          />
        )}
      </div>
    </div>
  );
};

export default DesignCalculation;
