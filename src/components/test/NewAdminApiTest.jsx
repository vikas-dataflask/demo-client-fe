import React, { useState } from "react";
import {
  useGetAdminDataQuery,
  useCreateAdminResourceMutation,
} from "../../redux/features/api/newAdminApi";

const NewAdminApiTest = () => {
  const [resourceData, setResourceData] = useState({
    name: "",
    description: "",
    type: "test",
  });

  const {
    data: adminData,
    isLoading: isLoadingData,
    error: dataError,
  } = useGetAdminDataQuery();
  const [createResource, { isLoading: isCreating, error: createError }] =
    useCreateAdminResourceMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createResource(resourceData).unwrap();
      setResourceData({ name: "", description: "", type: "test" });
      alert("Resource created successfully!");
    } catch (error) {
      console.error("Failed to create resource:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResourceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          New Admin API Test
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Data Display */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Admin Data
            </h2>

            {isLoadingData && (
              <div className="text-gray-600">Loading admin data...</div>
            )}

            {dataError && (
              <div className="text-red-600 bg-red-50 p-3 rounded">
                Error loading data: {dataError.message || "Unknown error"}
              </div>
            )}

            {adminData && (
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm text-gray-800 overflow-auto">
                  {JSON.stringify(adminData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Resource Creation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create Admin Resource
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Resource Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={resourceData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={resourceData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={resourceData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="test">Test</option>
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Resource"}
              </button>
            </form>

            {createError && (
              <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">
                Error creating resource:{" "}
                {createError.message || "Unknown error"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdminApiTest;
