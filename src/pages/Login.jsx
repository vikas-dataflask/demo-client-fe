import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EyeIcon from "../icons/EyeIcon";
import EyeCloseIcon from "../icons/EyeCloseIcon";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { setUser } from "../redux/features/app/userSLice";
import { useLoginMutation } from "../redux/features/api/api";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use .unwrap() to directly get the fulfilled value or throw the error
      const responseData = await login({ identifier, password }).unwrap();

      // Dispatch the entire responseData object to setUser.
      // This ensures all fields (email, username, _id, token, profilePicUrl,
      // firstName, lastName, contactNumber) are correctly saved to Redux and localStorage.
      dispatch(setUser(responseData));

      toast.success("Login successful!");
      // Navigate after a short delay to allow toast to show
      setTimeout(() => navigate("/home"), 500);
    } catch (err) {
      console.error("Login error:", err);
      // Access error message from RTK Query error object
      toast.error(err.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-lg">
        {" "}
        {/* Adjusted max-w and padding */}
        {/* Logo and Brand */}
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
          <p className="text-white text-sm mt-1">Login to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or Username"
            required
            className="w-full px-3 py-2 text-sm rounded-md bg-white/90 placeholder-gray-400 focus:outline-none"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••••••"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-md text-white font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-white text-center mt-2">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="underline text-blue-300 hover:text-white"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
