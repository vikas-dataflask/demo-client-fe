import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "../../redux/features/app/userSLice";
import { FaUserCircle, FaCreditCard, FaLock, FaPen } from "react-icons/fa"; // Removed FaTrashAlt, FaUpload as they move to ProfilePictureSection

// Import the new components
import AccountTab from "./AccountTab";
import SecurityTab from "./SecurityTab";
import SubscriptionTab from "./SubscriptionTab"; // For consistency, even if simple

const UserProfile = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("account");

  // State for user details (managed in AccountTab now, but initialized here for clarity)
  // We'll pass the setter down to AccountTab
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    contactNumber: user?.contactNumber || "",
    email: user?.email || "",
    username: user?.username || "",
  });

  // State for password fields (managed in SecurityTab now)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for profile picture (managed in ProfilePictureSection now)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // isEditing state is now primarily for AccountTab
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset all form data and states when modal opens
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        contactNumber: user?.contactNumber || "",
        email: user?.email || "",
        username: user?.username || "",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSelectedFile(null);
      setPreviewImage(null);
      setIsEditingAccount(false); // Reset editing state for account tab
      setActiveTab("account"); // Always open to account tab
    }
  }, [user, isOpen]);

  // Handlers that are still relevant at this level (e.g., dispatching user updates, though the mutations are now in child components)
  // The actual mutation calls and toast messages will happen in the child components,
  // but this parent can still hold the user state logic if needed by multiple children.
  // However, for strict separation, the mutation hooks should move.

  // The 'setUser' dispatch will be called from the child components after successful mutations.

  if (!isOpen) return null;

  const tabButtonStyle = (tabName) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      activeTab === tabName
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header and Toggle Button */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
          {activeTab === "account" &&
            (!isEditingAccount ? (
              <button
                onClick={() => setIsEditingAccount(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaPen /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditingAccount(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("account")}
            className={tabButtonStyle("account")}
          >
            <FaUserCircle /> Account
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={tabButtonStyle("subscription")}
          >
            <FaCreditCard /> Subscription
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={tabButtonStyle("security")}
          >
            <FaLock /> Security
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "account" && (
          <AccountTab
            user={user}
            formData={formData}
            setFormData={setFormData}
            isEditingAccount={isEditingAccount}
            setIsEditingAccount={setIsEditingAccount}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            previewImage={previewImage}
            setPreviewImage={setPreviewImage}
          />
        )}

        {activeTab === "subscription" && <SubscriptionTab />}

        {activeTab === "security" && (
          <SecurityTab
            passwordData={passwordData}
            setPasswordData={setPasswordData}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
