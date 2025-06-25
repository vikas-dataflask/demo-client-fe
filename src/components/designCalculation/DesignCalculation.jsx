import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // NEW
import { useDispatch } from "react-redux";
import { resetRooms } from "../../redux/features/app/roomSlice";
import {
  resetFloorPlan,
  resetArea,
} from "../../redux/features/app/FloorPlanSlice";
import { clearRoomLights } from "../../redux/features/app/lightingSlice";

import DraftSideBar from "./DraftSideBar";
import AddProjectModal from "./AddProjectModal";
import {
  useGetProjectListQuery,
  useDeleteProjectMutation,
} from "../../redux/features/api/api";
import { clearPower } from "../../redux/features/app/powerSlice";

const DesignCalculation = () => {
  const location = useLocation(); // NEW
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [projectAdded, setProjectAdded] = useState(false);
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useGetProjectListQuery(undefined, {
    refetchOnFocus: true, // Automatically refetch when tab/window regains focus
  });

  const [deleteProject] = useDeleteProjectMutation();

  const dispatch = useDispatch();
  dispatch(resetRooms()); // this will clear all room data
  dispatch(resetFloorPlan());
  dispatch(resetArea());
  dispatch(clearRoomLights());
  dispatch(clearPower());
  dispatch(clearRoomLights());

  useEffect(() => {
    localStorage.removeItem("floorPlan");
    localStorage.removeItem("blocks");
    localStorage.removeItem("entities");
    localStorage.removeItem("layers");
  }, []);

  useEffect(() => {
    if (projectAdded) {
      refetch(); // manually trigger re-fetch
      setProjectAdded(false); // reset flag
    }
  }, [projectAdded, refetch]);

  const handleDelete = async (id) => {
    try {
      await deleteProject(id).unwrap();
      refetch(); // Refresh the list
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
        {/* Add New Button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#007bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add New
          </button>
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
                    {/* <p className="text-sm text-gray-500">{project.location}</p> */}
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
                        localStorage.removeItem("confirmedLightingDbs");
                        localStorage.removeItem("confirmedPowerDbs");
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
