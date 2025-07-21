import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EyeIcon from "../icons/EyeIcon";
import EyeCloseIcon from "../icons/EyeCloseIcon";
import { useSignupMutation } from "../redux/features/api/api";
import { toast } from "react-toastify";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // New state variables for the additional fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password confirmation check
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return; // Stop the form submission
    }

    try {
      const response = await signup({
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: userName,
        contact_number: contactNumber, // Include contact_number
        password: password,
        confirmPassword: confirmPassword, // <--- Make sure this line is included
      });

      if (response?.data) {
        toast.success("Signup successful!");
        setShowSuccessScreen(true);
        setTimeout(() => navigate("/login"), 3000); // Redirect after 3s
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (showSuccessScreen) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="bg-white/30 backdrop-blur-md p-10 rounded-lg shadow-lg text-center max-w-sm w-full">
          <img
            src="/src/images/dd3.svg"
            alt="Logo"
            className="w-14 h-14 mx-auto mb-4"
          />
          <h2 className="text-xl text-white font-semibold mb-2">
            Welcome to DesignDrafter!
          </h2>
          <p className="text-white text-sm">
            Signup complete. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-lg">
        {" "}
        {/* Adjusted max-w and padding */}
        <div className="flex flex-col items-center mb-4">
          {" "}
          {/* Adjusted margin-bottom */}
          <img
            src="/src/images/dd3.svg"
            alt="Logo"
            className="w-10 h-10 object-contain mb-2" // Adjusted logo size
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DesignDrafter
          </h1>
          <p className="text-white text-sm mt-1">Create your account</p>{" "}
          {/* Adjusted margin-top */}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {" "}
          {/* Adjusted space-y */}
          {/* New Input for First Name */}
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
            className="w-full px-3 py-2 text-sm rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
          />
          {/* New Input for Last Name */}
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
            className="w-full px-3 py-2 text-sm rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 text-sm rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
          />
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            required
            className="w-full px-3 py-2 text-sm rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
          />
          {/* New Input for Contact Number (Optional) */}
          <input
            type="tel" // Use type="tel" for phone numbers
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Contact Number (Optional)"
            className="w-full px-3 py-2 text-sm rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-3 py-2 text-sm pr-10 rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
            </button>
          </div>
          {/* New Input for Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full px-3 py-2 text-sm pr-10 rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
            >
              {showConfirmPassword ? <EyeCloseIcon /> : <EyeIcon />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-md text-white font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
          >
            {isLoading ? "Signing up..." : "Signup"}
          </button>
          <p className="text-sm text-white text-center mt-2">
            {" "}
            {/* Adjusted margin-top */}
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline text-blue-300 hover:text-white font-medium"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
