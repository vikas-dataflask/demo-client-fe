import { Routes, Route, Navigate } from "react-router-dom";
import FireFightPage from "./pages/FireFightPage";
import ElectricalPage from "./pages/ElectricalPage";
import PlumbingPage from "./pages/PlumbingPage";
import FileSetupPage from "./pages/FileSetupPage";
import HVACPage from "./pages/HVACPage";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
// Assuming DraftSideBar is used within individual page components, not globally here
// import DraftSideBar from "./components/designCalculation/DraftSideBar";
import Home from "./components/designCalculation/Home";
import DesignCalculation from "./components/designCalculation/DesignCalculation";
import QuantityExtraction from "./components/extractQuantity/QuantityExtraction";
import ExtractQuantity from "./components/extractQuantity/ExtractQuantity";
// import ProductComparisonPage from "./pages/ProductComparisonPage";
import { ToastContainer } from "react-toastify";

import React, { useState } from "react"; // Import useState
import UserProfile from "./components/userProfile/UserProfile"; // Import UserProfile component

function PrivateRoute({ children }) {
  // --- START OF FIX: Correctly retrieve token from 'user' object in localStorage ---
  const storedUser = localStorage.getItem("user");
  let token = null;
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      token = user.token; // Extract the token from the parsed user object
    } catch (e) {
      console.error(
        "Failed to parse user from localStorage in PrivateRoute:",
        e
      );
      // Optionally, clear invalid item from localStorage if it's corrupted
      localStorage.removeItem("user");
    }
  }
  // --- END OF FIX ---

  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  // State to control the visibility of the UserProfile modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes - pass onOpenSettings to pages that will use UserAvatar */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              {/* Home component will receive onOpenSettings prop */}
              <Home onOpenSettings={() => setIsSettingsModalOpen(true)} />
            </PrivateRoute>
          }
        />
        <Route
          path="/design-calculation"
          element={
            <PrivateRoute>
              <DesignCalculation
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/extract-quantity"
          element={
            <PrivateRoute>
              <ExtractQuantity
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/quantity-extraction"
          element={
            <PrivateRoute>
              <QuantityExtraction
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/quantity-extraction/:projectId"
          element={
            <PrivateRoute>
              <QuantityExtraction
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/product-comparison"
          element={
            <PrivateRoute>
              <ProductComparisonPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        /> */}
        {/* <Route
          path="/product-comparison/:projectId"
          element={
            <PrivateRoute>
              <ProductComparisonPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/file-setup"
          element={
            <PrivateRoute>
              <FileSetupPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/hvac"
          element={
            <PrivateRoute>
              <HVACPage onOpenSettings={() => setIsSettingsModalOpen(true)} />
            </PrivateRoute>
          }
        />
        <Route
          path="/fire-fight"
          element={
            <PrivateRoute>
              <FireFightPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/electrical"
          element={
            <PrivateRoute>
              <ElectricalPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/plumbing"
          element={
            <PrivateRoute>
              <PlumbingPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/file-setup/:projectId"
          element={
            <PrivateRoute>
              <FileSetupPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/electrical/:projectId"
          element={
            <PrivateRoute>
              <ElectricalPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/:projectId/file-setup"
          element={
            <PrivateRoute>
              <FileSetupPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="project/:projectId/electrical"
          element={
            <PrivateRoute>
              <ElectricalPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/:projectId/hvac"
          element={
            <PrivateRoute>
              <HVACPage onOpenSettings={() => setIsSettingsModalOpen(true)} />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/:projectId/fire-fight"
          element={
            <PrivateRoute>
              <FireFightPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/:projectId/plumbing"
          element={
            <PrivateRoute>
              <PlumbingPage
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </PrivateRoute>
          }
        />
      </Routes>

      {/* UserProfile modal rendered at the App level to overlay everything */}
      <UserProfile
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <ToastContainer />
    </>
  );
}

export default App;
