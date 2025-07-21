import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "../../redux/features/app/userSLice";
import { useUpdateUserProfileMutation } from "../../redux/features/api/api";

// Import ProfilePictureSection to be used within AccountTab
import ProfilePictureSection from "./ProfilePictureSection";

const AccountTab = ({
  user,
  formData,
  setFormData,
  isEditingAccount,
  setIsEditingAccount,
  selectedFile,
  setSelectedFile,
  previewImage,
  setPreviewImage,
}) => {
  const dispatch = useDispatch();

  const [updateUserProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfile(formData).unwrap();
      dispatch(setUser(response.data));
      toast.success("Profile updated successfully!");
      setIsEditingAccount(false); // Exit editing mode after successful update
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      {/* Profile Picture Section */}
      <ProfilePictureSection
        user={user}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />

      {/* User Details Section */}
      <div className="md:col-span-2">
        {!isEditingAccount ? (
          // View Mode
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500">Full Name</p>
              <p className="text-lg text-gray-800 font-semibold">
                {`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  "N/A"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500">Username</p>
              <p className="text-lg text-gray-800 font-semibold">
                {user.username || "N/A"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-800 font-semibold">
                {user.email || "N/A"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500">
                Contact Number
              </p>
              <p className="text-lg text-gray-800 font-semibold">
                {user.contactNumber || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="text"
                value={formData.contactNumber}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className={`px-8 py-2 font-semibold rounded-lg transition-colors ${
                  isUpdating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountTab;
