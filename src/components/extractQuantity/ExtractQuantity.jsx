import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AddProjectModal from "./AddProjectModal";
import {
  useGetQEListQuery,
  useDeleteQEMutation,
} from "../../redux/features/api/api";
import DraftSideBar from "../shared/DraftSideBar";

const ExtractQuantity = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [projectAdded, setProjectAdded] = useState(false);
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useGetQEListQuery(undefined, {
    refetchOnFocus: true,
  });

  const [deleteProject] = useDeleteQEMutation();

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

      {/* Main */}
      <div className="flex-1 bg-[#f7f7f7] relative overflow-y-auto">
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#007bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Add New
          </button>
        </div>
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
                      onClick={() =>
                        navigate(`/quantity-extraction/${project._id}`)
                      }
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
                No project to show in Extract Quantity
              </p>
            </div>
          )}
        </div>
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

export default ExtractQuantity;
