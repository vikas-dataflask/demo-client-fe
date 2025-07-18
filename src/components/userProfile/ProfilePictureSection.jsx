import React, { useState } from "react"; // Import useState
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "../../redux/features/app/userSLice";
import { FaTrashAlt, FaUpload } from "react-icons/fa";
import {
  useUploadProfilePicMutation,
  useDeleteProfilePicMutation,
} from "../../redux/features/api/api";

import ConfirmationDialog from "./ConfirmationDialog"; // Import the new component

const ProfilePictureSection = ({
  user,
  selectedFile,
  setSelectedFile,
  previewImage,
  setPreviewImage,
}) => {
  const dispatch = useDispatch();

  const [uploadProfilePic, { isLoading: isUploading }] =
    useUploadProfilePicMutation();
  const [deleteProfilePic, { isLoading: isDeleting }] =
    useDeleteProfilePicMutation();

  // New state for controlling the confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePicUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      const formPicData = new FormData();
      formPicData.append("profilePic", selectedFile);
      const response = await uploadProfilePic(formPicData).unwrap();
      dispatch(setUser(response.data));
      toast.success("Profile picture updated successfully!");
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error("Failed to upload picture:", error);
      toast.error("Failed to upload profile picture.");
    }
  };

  // This function will be called when "Confirm" is clicked in the dialog
  const handleDeletePicConfirmed = async () => {
    setShowDeleteConfirm(false); // Close the dialog immediately
    try {
      await deleteProfilePic().unwrap();
      dispatch(setUser({ ...user, profilePicUrl: null }));
      toast.success("Profile picture removed successfully!");
    } catch (error) {
      console.error("Failed to delete picture (full error object):", error);

      let errorMessage = "Failed to delete profile picture.";

      if (error.data && typeof error.data === "object" && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  // This function will open the confirmation dialog
  const handleDeletePicClick = () => {
    setShowDeleteConfirm(true);
  };

  const finalImageUrl =
    user?.profilePicUrl && `http://localhost:8000${user.profilePicUrl}`;

  return (
    <>
      <div className="flex flex-col items-center col-span-1">
        <div className="relative w-40 h-40 rounded-full overflow-hidden mb-2 shadow-lg ring-4 ring-indigo-300">
          <img
            src={previewImage || finalImageUrl || "/src/images/profileIcon.png"}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label
            htmlFor="profilePicInput"
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-full font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors"
          >
            <FaUpload /> Change
          </label>
          <input
            id="profilePicInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {finalImageUrl && (
            <button
              onClick={handleDeletePicClick} // Use the new handler to open dialog
              disabled={isDeleting}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-full font-semibold text-red-600 bg-red-100 hover:bg-red-200 transition-colors"
            >
              <FaTrashAlt /> Remove
            </button>
          )}
        </div>
        {(selectedFile || previewImage) && (
          <button
            onClick={handlePicUpload}
            disabled={isUploading}
            className={`mt-2 px-6 py-2 text-sm rounded-full font-semibold transition-colors ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isUploading ? "Uploading..." : "Save Picture"}
          </button>
        )}
      </div>

      {/* Confirmation Dialog Rendered Here */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Confirm Profile Picture Removal"
        message="Are you sure you want to remove your profile picture? This action cannot be undone easily."
        onConfirm={handleDeletePicConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default ProfilePictureSection;
