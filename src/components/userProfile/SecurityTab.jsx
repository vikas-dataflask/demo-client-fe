import React from "react";
import { toast } from "react-toastify";
import { FaLock } from "react-icons/fa";
import { useChangePasswordMutation } from "../../redux/features/api/api";

const SecurityTab = ({ passwordData, setPasswordData }) => {
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password changed successfully!");
      setPasswordData({
        // Reset password fields on success
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(error.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg min-h-[300px] flex flex-col items-center">
      <FaLock className="text-2xl text-gray-400 mb-2" />
      <h3 className="text-1xl font-bold text-gray-800 mb-4">Change Password</h3>
      <form
        onSubmit={handleChangePassword}
        className="w-full max-w-sm space-y-2"
      >
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isChangingPassword}
          className={`w-full px-8 py-2 font-semibold rounded-lg transition-colors ${
            isChangingPassword
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isChangingPassword ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default SecurityTab;
