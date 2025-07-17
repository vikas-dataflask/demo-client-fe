import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  selectRoomHeatLoadCapacity,
  selectHeatLoadByRoom,
} from "../../redux/features/app/heatLoadSlice";
import {
  useCalculateDuctSizeMutation,
  useCalculateGrilleSizeMutation,
  useSaveDuctSizingDataMutation,
  useGetDuctSizingDataQuery,
  useUpdateDuctSizingDataMutation,
} from "../../redux/features/api/api";

import FloorPreview from "../shared/FloorPreview";

const DuctSizing = () => {
  const { projectId } = useParams();
  const rooms = useSelector((state) => state.rooms);
  const heatLoadByRoom = useSelector(selectRoomHeatLoadCapacity);

  const [formData, setFormData] = useState({
    airflowCFM: "",
    maxVelocity: "",
    shape: "round",
    aspectRatio: "2",
    room: "",
    heatLoadCapacity: "",
  });

  // API hooks
  const [calculateDuctSize, { isLoading: isCalculating }] =
    useCalculateDuctSizeMutation();
  const [calculateGrilleSize, { isLoading: isGrilleCalculating }] =
    useCalculateGrilleSizeMutation();
  const [saveDuctSizingData, { isLoading: isSaving }] =
    useSaveDuctSizingDataMutation();
  const [updateDuctSizingData, { isLoading: isUpdating }] =
    useUpdateDuctSizingDataMutation();

  // Get autofill data when room is selected
  const { data: autofillData, isLoading: isLoadingAutofill } =
    useGetDuctSizingDataQuery(
      { project_id: projectId, room: formData.room },
      { skip: !projectId || !formData.room }
    );

  const [grilleData, setGrilleData] = useState({
    faceVelocity: "500",
    freeAreaPercent: "70",
  });

  const [result, setResult] = useState(null);
  const [grilleResult, setGrilleResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrilleLoading, setIsGrilleLoading] = useState(false);

  // Autofill form data when data is retrieved
  useEffect(() => {
    console.log("Duct sizing autofill data received:", autofillData);
    if (autofillData?.data?.inputSummary) {
      console.log(
        "Setting form data with autofill:",
        autofillData.data.inputSummary
      );

      const inputSummary = autofillData.data.inputSummary;

      setFormData((prev) => ({
        ...prev,
        airflowCFM: inputSummary.airflowCFM?.toString() || "",
        maxVelocity: inputSummary.velocity?.toString() || "",
        shape: inputSummary.shape || "round",
        aspectRatio: inputSummary.aspectRatio?.toString() || "2",
        room: inputSummary.room || "",
        heatLoadCapacity: inputSummary.heatLoadCapacity?.toString() || "",
      }));

      // Set result if available
      if (autofillData.data) {
        setResult(autofillData.data);
      }
    }
  }, [autofillData]);

  // Helper function to determine if we should save or update
  const shouldUpdate = () => {
    return autofillData?.data?.inputSummary;
  };

  // Helper function to handle save/update logic
  const handleSaveOrUpdate = async (inputData, resultData) => {
    const payload = {
      project_id: projectId,
      room: formData.room,
      input_data: inputData,
    };

    try {
      if (shouldUpdate()) {
        // Update existing data
        const response = await updateDuctSizingData({
          project_id: projectId,
          room: formData.room,
          input_data: inputData,
        }).unwrap();
        console.log("Duct sizing data updated:", response);
        return response;
      } else {
        // Save new data
        const response = await saveDuctSizingData(payload).unwrap();
        console.log("Duct sizing data saved:", response);
        return response;
      }
    } catch (error) {
      console.error("Error saving/updating duct sizing data:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle room selection with auto-fill
    if (name === "room") {
      const selectedRoom = rooms.find(
        (room) => room.name === value || room.id === value
      );
      if (selectedRoom) {
        // Check if heat load data exists for this room
        const roomHeatLoad = heatLoadByRoom[value];
        let heatLoadCapacity = "";

        if (roomHeatLoad && roomHeatLoad.tonnage) {
          // Convert tonnage to kW (1 TR = 3.517 kW)
          heatLoadCapacity = (roomHeatLoad.tonnage * 3.517).toFixed(2);
        }

        setFormData((prev) => ({
          ...prev,
          room: value,
          heatLoadCapacity: heatLoadCapacity,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGrilleChange = (e) => {
    const { name, value } = e.target;
    setGrilleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.airflowCFM || parseFloat(formData.airflowCFM) <= 0) {
      return "Airflow (CFM) must be a positive number";
    }
    if (!formData.maxVelocity || parseFloat(formData.maxVelocity) <= 0) {
      return "Maximum Velocity must be a positive number";
    }
    if (
      formData.shape === "rectangular" &&
      (!formData.aspectRatio || parseFloat(formData.aspectRatio) <= 0)
    ) {
      return "Aspect Ratio must be a positive number for rectangular ducts";
    }
    if (!formData.room) {
      return "Please select a room";
    }
    if (
      !formData.heatLoadCapacity ||
      parseFloat(formData.heatLoadCapacity) <= 0
    ) {
      return "Heat Load Capacity must be a positive number";
    }
    return null;
  };

  const validateGrilleForm = () => {
    if (!grilleData.faceVelocity || parseFloat(grilleData.faceVelocity) <= 0) {
      return "Face Velocity must be a positive number";
    }
    if (
      !grilleData.freeAreaPercent ||
      parseFloat(grilleData.freeAreaPercent) <= 0 ||
      parseFloat(grilleData.freeAreaPercent) > 100
    ) {
      return "Free Area Percentage must be between 0 and 100";
    }
    if (!result || !result.airflowCFM) {
      return "Please calculate duct size first";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setGrilleResult(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if project ID and room are available
    if (!projectId || !formData.room) {
      setError("Project ID and room are required for saving data.");
      return;
    }

    setIsLoading(true);

    try {
      // First calculate the duct sizing
      const calculationPayload = {
        airflowCFM: parseFloat(formData.airflowCFM),
        maxVelocity: parseFloat(formData.maxVelocity),
        shape: formData.shape,
        aspectRatio:
          formData.shape === "rectangular"
            ? parseFloat(formData.aspectRatio)
            : undefined,
        room: formData.room,
        heatLoadCapacity: parseFloat(formData.heatLoadCapacity),
      };

      const calculationResponse = await calculateDuctSize(
        calculationPayload
      ).unwrap();
      setResult(calculationResponse.data);

      // Prepare input data for saving
      const inputData = {
        airflowCFM: parseFloat(formData.airflowCFM),
        maxVelocity: parseFloat(formData.maxVelocity),
        shape: formData.shape,
        aspectRatio:
          formData.shape === "rectangular"
            ? parseFloat(formData.aspectRatio)
            : undefined,
        room: formData.room,
        heatLoadCapacity: parseFloat(formData.heatLoadCapacity),
      };

      // Save or update the data
      await handleSaveOrUpdate(inputData, calculationResponse.data);

      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(
        err?.data?.message ||
          err?.error ||
          "Failed to calculate and save duct sizing data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Manual update function
  const handleManualUpdate = async () => {
    if (!projectId || !formData.room) {
      setError("Project ID and room are required for updating data.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const inputData = {
        airflowCFM: parseFloat(formData.airflowCFM),
        maxVelocity: parseFloat(formData.maxVelocity),
        shape: formData.shape,
        aspectRatio:
          formData.shape === "rectangular"
            ? parseFloat(formData.aspectRatio)
            : undefined,
        room: formData.room,
        heatLoadCapacity: parseFloat(formData.heatLoadCapacity),
      };

      await handleSaveOrUpdate(inputData, result);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error in handleManualUpdate:", err);
      setError(
        err?.data?.message ||
          err?.error ||
          "Failed to update duct sizing data. Please try again."
      );
    }
  };

  const handleGrilleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGrilleResult(null);

    const validationError = validateGrilleForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGrilleLoading(true);

    try {
      const payload = {
        cfm: result.airflowCFM,
        faceVelocity: parseFloat(grilleData.faceVelocity),
        freeAreaPercent: parseFloat(grilleData.freeAreaPercent),
      };

      const res = await calculateGrilleSize(payload).unwrap();
      setGrilleResult(res.data);
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.error ||
          "An error occurred while calculating grille size"
      );
    } finally {
      setIsGrilleLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      airflowCFM: "",
      maxVelocity: "",
      shape: "round",
      aspectRatio: "2",
      room: "",
      heatLoadCapacity: "",
    });
    setGrilleData({
      faceVelocity: "500",
      freeAreaPercent: "70",
    });
    setResult(null);
    setGrilleResult(null);
    setError(null);
  };

  return (
    <div className="flex h-screen">
      <div className="w-[340px] h-[92vh] bg-white border-r border-gray-300 text-sm font-medium relative flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Duct Sizer</h2>
            <p className="text-xs text-gray-400">Velocity Method</p>
          </div>
          <button
            type="button"
            className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
            onClick={handleReset}
          >
            <ReloadIcon className="w-[16px] h-[16px] stroke-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room */}
            <div className="space-y-1">
              <label className="text-gray-700 mb-1 block">Room</label>
              <select
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
              >
                <option value="">Select a room</option>
                {rooms.map((option, index) => (
                  <option key={index} value={option.name || option.id}>
                    {option.name || option.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Heat Load Capacity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 mb-1 block">
                  Heat Load Capacity (kW)
                </label>
                {formData.room && heatLoadByRoom[formData.room] && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Auto-filled from Heat Load
                  </span>
                )}
              </div>
              <input
                type="number"
                name="heatLoadCapacity"
                value={formData.heatLoadCapacity}
                onChange={handleChange}
                placeholder="Enter heat load capacity"
                className={`w-full p-2 border border-gray-300 rounded-md text-gray-900 ${
                  formData.room && heatLoadByRoom[formData.room]
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-200"
                }`}
                required
              />
              {formData.room && heatLoadByRoom[formData.room] && (
                <div className="text-xs text-gray-600 mt-1">
                  <span>
                    Source: {heatLoadByRoom[formData.room].tonnage} TR
                    calculated on{" "}
                    {new Date(
                      heatLoadByRoom[formData.room].timestamp
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Airflow */}
            <div className="space-y-1">
              <label className="text-gray-700 mb-1 block">Airflow (CFM)</label>
              <input
                type="number"
                name="airflowCFM"
                value={formData.airflowCFM}
                onChange={handleChange}
                placeholder="Enter airflow in CFM"
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                required
              />
            </div>

            {/* Maximum Velocity */}
            <div className="space-y-1">
              <label className="text-gray-700 mb-1 block">
                Maximum Velocity (m/s)
              </label>
              <input
                type="number"
                name="maxVelocity"
                value={formData.maxVelocity}
                onChange={handleChange}
                placeholder="Enter maximum velocity"
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                required
              />
            </div>

            {/* Duct Shape */}
            <div className="space-y-1">
              <label className="text-gray-700 mb-1 block">Duct Shape</label>
              <select
                name="shape"
                value={formData.shape}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
              >
                <option value="round">Round</option>
                <option value="rectangular">Rectangular</option>
              </select>
            </div>

            {/* Aspect Ratio (only for rectangular) */}
            {formData.shape === "rectangular" && (
              <div className="space-y-1">
                <label className="text-gray-700 mb-1 block">
                  Aspect Ratio (W:H)
                </label>
                <input
                  type="number"
                  name="aspectRatio"
                  value={formData.aspectRatio}
                  onChange={handleChange}
                  placeholder="Enter aspect ratio"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCalculating || isSaving || isUpdating}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isCalculating
                ? "Calculating..."
                : isSaving
                ? "Saving..."
                : isUpdating
                ? "Updating..."
                : "Calculate & Save"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Available Heat Load Data */}
          {Object.keys(heatLoadByRoom).length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3">
                Available Heat Load Data
              </h3>
              <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                {Object.entries(heatLoadByRoom).map(([roomName, data]) => (
                  <div
                    key={roomName}
                    className="flex justify-between items-center py-1 px-2 bg-white rounded border"
                  >
                    <span className="text-gray-700 font-medium">
                      {roomName}
                    </span>
                    <div className="text-right">
                      <div className="text-amber-700 font-medium">
                        {(data.tonnage * 3.517).toFixed(2)} kW
                      </div>
                      <div className="text-xs text-gray-500">
                        ({data.tonnage} TR)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-amber-700">
                💡 Select a room above to auto-fill heat load capacity
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">
                Duct Sizing Results
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cross-sectional Area:</span>
                  <span className="font-medium">{result.area_m2} m²</span>
                </div>

                {result.roundDiameter_mm && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Round Duct Diameter:</span>
                    <span className="font-medium">
                      {result.roundDiameter_mm} mm
                    </span>
                  </div>
                )}

                {result.rectangular && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rectangular Width:</span>
                      <span className="font-medium">
                        {result.rectangular.width_mm} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rectangular Height:</span>
                      <span className="font-medium">
                        {result.rectangular.height_mm} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aspect Ratio:</span>
                      <span className="font-medium">
                        {result.rectangular.aspectRatio}:1
                      </span>
                    </div>
                  </>
                )}

                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Input Airflow:</span>
                    <span className="font-medium">{result.airflowCFM} CFM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Input Velocity:</span>
                    <span className="font-medium">{result.velocity} m/s</span>
                  </div>
                  {result.room && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{result.room}</span>
                    </div>
                  )}
                  {result.heatLoadCapacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heat Load Capacity:</span>
                      <span className="font-medium">
                        {result.heatLoadCapacity} kW
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Grille Sizing Section */}
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">
                Grille Sizing
              </h3>

              <form onSubmit={handleGrilleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-gray-700 mb-1 block text-xs">
                    Face Velocity (FPM)
                  </label>
                  <input
                    type="number"
                    name="faceVelocity"
                    value={grilleData.faceVelocity}
                    onChange={handleGrilleChange}
                    placeholder="Enter face velocity"
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-700 mb-1 block text-xs">
                    Free Area (%)
                  </label>
                  <input
                    type="number"
                    name="freeAreaPercent"
                    value={grilleData.freeAreaPercent}
                    onChange={handleGrilleChange}
                    placeholder="Enter free area percentage"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-200 text-gray-900 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGrilleLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  {isGrilleLoading ? "Calculating..." : "Suggest Grille Sizes"}
                </button>
              </form>
            </div>
          )}

          {/* Grille Results Section */}
          {grilleResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">
                Grille Sizing Results
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Required Area:</span>
                  <span className="font-medium">
                    {grilleResult.requiredAreaIn2} in²
                  </span>
                </div>

                <div className="pt-2 border-t border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Suggested Grilles:
                  </h4>
                  <div className="space-y-1">
                    {grilleResult.suggestedGrilles.map((grille, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-xs bg-white p-2 rounded border"
                      >
                        <span>
                          {grille.width}" × {grille.height}"
                        </span>
                        <span className="text-green-600">
                          {grille.efficiency}% efficient
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-green-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Input CFM:</span>
                    <span className="font-medium">{grilleResult.cfm} CFM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Face Velocity:</span>
                    <span className="font-medium">
                      {grilleResult.faceVelocity} FPM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Free Area:</span>
                    <span className="font-medium">
                      {grilleResult.freeAreaPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Floor Preview */}
      <div className="flex-1 h-full">
        <FloorPreview />
      </div>
    </div>
  );
};

export default DuctSizing;
