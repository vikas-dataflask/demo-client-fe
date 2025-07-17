import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  useCalculateFittingLossesMutation,
  useCalculateTotalAHUPressureDropMutation,
  useGetStandardFittingsQuery,
  useSaveAhuPressureDropDataMutation,
  useGetAhuPressureDropDataQuery,
  useUpdateAhuPressureDropDataMutation,
} from "../../redux/features/api/api";

const AHU = ({ projectName, activity }) => {
  const { projectId } = useParams();
  const room = "main"; // Default room name for AHU calculations

  const [formData, setFormData] = useState({
    // Basic AHU parameters
    airflow: "",
    velocity: "",
    ductDiameter: "",
    ductWidth: "",
    ductHeight: "",

    // Coil and filter parameters
    coilPressureDrop: "",
    filterPressureDrop: "",
    additionalLosses: "",

    // Fitting parameters
    selectedFittings: [],
    selectedFittingsQuantities: {},
    fittingVelocity: "",
    airDensity: "",
  });

  const [fittingLosses, setFittingLosses] = useState(null);
  const [totalPressureDrop, setTotalPressureDrop] = useState(null);
  const [showFittingSelector, setShowFittingSelector] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // API hooks
  const [calculateFittingLosses, { isLoading: fittingLoading }] =
    useCalculateFittingLossesMutation();
  const [calculateTotalPressureDrop, { isLoading: totalLoading }] =
    useCalculateTotalAHUPressureDropMutation();
  const {
    data: standardFittings,
    isLoading: fittingsLoading,
    error: fittingsError,
  } = useGetStandardFittingsQuery();

  // Data management API hooks
  const [saveAhuPressureDropData, { isLoading: saveLoading }] =
    useSaveAhuPressureDropDataMutation();
  const [updateAhuPressureDropData, { isLoading: updateLoading }] =
    useUpdateAhuPressureDropDataMutation();
  const {
    data: savedData,
    isLoading: loadLoading,
    error: loadError,
  } = useGetAhuPressureDropDataQuery(
    { project_id: projectId, room },
    { skip: !projectId }
  );

  // Debug logging
  useEffect(() => {
    console.log("Standard Fittings Response:", standardFittings);
    console.log("Fittings Loading:", fittingsLoading);
    console.log("Fittings Error:", fittingsError);
  }, [standardFittings, fittingsLoading, fittingsError]);

  // Autofill data when saved data is loaded
  useEffect(() => {
    if (savedData?.data) {
      const data = savedData.data;

      setFormData({
        airflow: data.airflow || "",
        velocity: data.velocity || "",
        ductDiameter: data.ductDiameter || "",
        ductWidth: data.ductWidth || "",
        ductHeight: data.ductHeight || "",
        coilPressureDrop: data.coilPressureDrop || "",
        filterPressureDrop: data.filterPressureDrop || "",
        additionalLosses: data.additionalLosses || "",
        selectedFittings: data.selectedFittings || [],
        selectedFittingsQuantities: data.selectedFittingsQuantities || {},
        fittingVelocity: data.fittingVelocity || "",
        airDensity: data.airDensity || "",
      });

      // ✅ Restore calculation results if available
      if (data.fittingLosses) {
        setFittingLosses({
          totalFittingLoss: data.fittingLosses, // ✅ Wrap in same format used by UI
        });
      }
      if (data.totalPressureDrop) {
        setTotalPressureDrop({
          data: {
            totalPressureDrop: data.totalPressureDrop,
            breakdown: data.breakdown,
            fittingBreakdown: data.fittingBreakdown,
            calculationSummary: data.calculationSummary,
          },
        });
      }
    }
  }, [savedData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFittingChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        selectedFittings: [...prev.selectedFittings, value],
        selectedFittingsQuantities: {
          ...prev.selectedFittingsQuantities,
          [value]: prev.selectedFittingsQuantities[value] || 1,
        },
      }));
    } else {
      const { [value]: _, ...restQuantities } =
        formData.selectedFittingsQuantities;
      setFormData((prev) => ({
        ...prev,
        selectedFittings: prev.selectedFittings.filter((f) => f !== value),
        selectedFittingsQuantities: restQuantities,
      }));
    }
  };

  const handleFittingQuantityChange = (fittingName, quantity) => {
    setFormData((prev) => ({
      ...prev,
      selectedFittingsQuantities: {
        ...prev.selectedFittingsQuantities,
        [fittingName]: Math.max(1, Number(quantity)),
      },
    }));
  };

  const handleCalculateFittingLosses = async () => {
    if (!formData.selectedFittings.length || !formData.fittingVelocity) {
      alert("Please select fittings and enter velocity");
      return;
    }
    try {
      // Build the array of fitting objects with type, quantity, and kValue
      const fittingsArray = formData.selectedFittings.map((fittingName) => {
        const fitting = Object.values(groupedFittings)
          .flat()
          .find((f) => f.name === fittingName);
        return {
          type: fittingName,
          quantity: formData.selectedFittingsQuantities[fittingName] || 1,
          kValue: fitting?.kValue || 0,
        };
      });
      const dataToSend = {
        fittingsArray,
        airVelocity: parseFloat(formData.fittingVelocity),
      };
      if (formData.airDensity) {
        dataToSend.airDensity = parseFloat(formData.airDensity);
      }
      const response = await calculateFittingLosses(dataToSend).unwrap();
      setFittingLosses(response.data);
      console.log("Fitting losses calculated:", response);
    } catch (err) {
      console.error("Failed to calculate fitting losses:", err);
      alert("Failed to calculate fitting losses");
    }
  };

  const handleCalculateTotalPressureDrop = async () => {
    if (
      !formData.airflow ||
      !formData.coilPressureDrop ||
      !formData.filterPressureDrop
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const dataToSend = {
        airflow: parseFloat(formData.airflow),
        velocity: parseFloat(formData.velocity) || 0,
        ductDiameter: parseFloat(formData.ductDiameter) || 0,
        ductWidth: parseFloat(formData.ductWidth) || 0,
        ductHeight: parseFloat(formData.ductHeight) || 0,
        coilPressureDrop: parseFloat(formData.coilPressureDrop),
        filterPressureDrop: parseFloat(formData.filterPressureDrop),
        additionalLosses: parseFloat(formData.additionalLosses) || 0,
        fittingLosses: fittingLosses?.totalFittingLoss || 0,
      };

      const response = await calculateTotalPressureDrop(dataToSend).unwrap();
      setTotalPressureDrop(response);

      // ✅ Make sure fittingLosses is not cleared
      if (!fittingLosses && dataToSend.fittingLosses) {
        setFittingLosses({ totalFittingLoss: dataToSend.fittingLosses });
      }

      // ✅ Save to DB
      const inputData = {
        ...formData,
        fittingLosses:
          fittingLosses?.totalFittingLoss || dataToSend.fittingLosses,
        totalPressureDrop: response.data?.totalPressureDrop,
        breakdown: response.data?.breakdown,
        fittingBreakdown: response.data?.fittingBreakdown,
        calculationSummary: response.data?.calculationSummary,
      };
      await handleSaveOrUpdate(inputData);
    } catch (err) {
      console.error("Failed to calculate total pressure drop:", err);
      alert("Failed to calculate total pressure drop");
    }
  };

  // Helper function to save or update data
  const handleSaveOrUpdate = async (inputData) => {
    try {
      if (savedData?.data) {
        // Update existing data
        await updateAhuPressureDropData({
          project_id: projectId,
          room,
          input_data: inputData,
        }).unwrap();
        console.log("AHU pressure drop data updated successfully");
      } else {
        // Save new data
        await saveAhuPressureDropData({
          project_id: projectId,
          room,
          input_data: inputData,
        }).unwrap();
        console.log("AHU pressure drop data saved successfully");
      }
    } catch (error) {
      console.error("Error saving/updating AHU pressure drop data:", error);
      alert("Failed to save/update data");
    }
  };

  const handleReload = () => {
    setFormData({
      airflow: "",
      velocity: "",
      ductDiameter: "",
      ductWidth: "",
      ductHeight: "",
      coilPressureDrop: "",
      filterPressureDrop: "",
      additionalLosses: "",
      selectedFittings: [],
      selectedFittingsQuantities: {},
      fittingVelocity: "",
      airDensity: "",
    });
    setFittingLosses(null);
    setTotalPressureDrop(null);
  };

  // Helper function to categorize fittings
  const getFittingCategory = (fittingKey) => {
    if (fittingKey.includes("elbow")) return "Elbows";
    if (
      fittingKey.includes("transition") ||
      fittingKey.includes("expansion") ||
      fittingKey.includes("contraction")
    )
      return "Transitions";
    if (fittingKey.includes("tee")) return "Tees";
    if (fittingKey.includes("entry") || fittingKey.includes("exit"))
      return "Entries/Exits";
    if (fittingKey.includes("damper")) return "Dampers";
    return "Others";
  };

  const groupedFittings = useMemo(() => {
    try {
      console.log("Calculating groupedFittings with:", standardFittings);
      const fittingsData = standardFittings?.data?.standardFittings;
      console.log("Fittings data:", fittingsData);

      if (!fittingsData || typeof fittingsData !== "object") {
        console.log("No valid fittings data, returning empty object");
        return {};
      }

      // Convert the object to an array and group by category
      const fittingsArray = Object.entries(fittingsData).map(
        ([key, fitting]) => {
          console.log("Processing fitting:", key, fitting);
          return {
            name: key,
            kValue: fitting.kValue || 0,
            description: fitting.description || key,
            category: getFittingCategory(key),
          };
        }
      );

      console.log("Fittings array:", fittingsArray);

      const result = fittingsArray.reduce((acc, fitting) => {
        if (!acc[fitting.category]) {
          acc[fitting.category] = [];
        }
        acc[fitting.category].push(fitting);
        return acc;
      }, {});

      console.log("Final groupedFittings result:", result);
      return result;
    } catch (err) {
      console.error("Error in groupedFittings calculation:", err);
      return {};
    }
  }, [standardFittings]);

  const breakdownTotal =
    parseFloat(formData.coilPressureDrop || 0) +
    parseFloat(formData.filterPressureDrop || 0) +
    parseFloat(fittingLosses?.totalFittingLoss || 0) +
    parseFloat(formData.additionalLosses || 0);

  return (
    <div className="flex h-[90vh] bg-white">
      {/* Left Panel - Input Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              AHU Pressure Drop Calculator
            </h1>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ReloadIcon />
              Reset
            </button>
          </div>

          {/* Basic Parameters Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Airflow (CFM)
                </label>
                <input
                  type="number"
                  name="airflow"
                  value={formData.airflow}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter airflow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velocity (m/s)
                </label>
                <input
                  type="number"
                  name="velocity"
                  value={formData.velocity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter velocity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duct Diameter (m)
                </label>
                <input
                  type="number"
                  name="ductDiameter"
                  value={formData.ductDiameter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For round ducts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duct Width (m)
                </label>
                <input
                  type="number"
                  name="ductWidth"
                  value={formData.ductWidth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For rectangular ducts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duct Height (m)
                </label>
                <input
                  type="number"
                  name="ductHeight"
                  value={formData.ductHeight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For rectangular ducts"
                />
              </div>
            </div>
          </div>

          {/* Coil and Filter Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Coil & Filter Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coil Pressure Drop (Pa)
                </label>
                <input
                  type="number"
                  name="coilPressureDrop"
                  value={formData.coilPressureDrop}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter coil pressure drop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Pressure Drop (Pa)
                </label>
                <input
                  type="number"
                  name="filterPressureDrop"
                  value={formData.filterPressureDrop}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter filter pressure drop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Losses (Pa)
                </label>
                <input
                  type="number"
                  name="additionalLosses"
                  value={formData.additionalLosses}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter additional losses"
                />
              </div>
            </div>
          </div>

          {/* Fitting Selection Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Fitting Losses
              </h2>
              <button
                onClick={() => setShowFittingSelector(!showFittingSelector)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {showFittingSelector ? "Hide" : "Select Fittings"}
              </button>
            </div>

            {showFittingSelector && (
              <div className="mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitting Velocity (m/s)
                  </label>
                  <input
                    type="number"
                    name="fittingVelocity"
                    value={formData.fittingVelocity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter velocity for fittings"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Air Density (kg/m³){" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="airDensity"
                    value={formData.airDensity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Default: 1.2"
                    step="any"
                    min="0"
                  />
                </div>

                {fittingsLoading ? (
                  <div className="text-center py-4">Loading fittings...</div>
                ) : fittingsError ? (
                  <div className="text-center py-4 text-red-600">
                    Error loading fittings:{" "}
                    {fittingsError.message || "Unknown error"}
                  </div>
                ) : Object.keys(groupedFittings).length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No fittings available. Please check the API connection.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedFittings).map(
                      ([category, fittings]) => (
                        <div
                          key={category}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h3 className="font-medium text-gray-800 mb-3">
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fittings.map((fitting) => (
                              <div
                                key={fitting.name}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  value={fitting.name}
                                  checked={formData.selectedFittings.includes(
                                    fitting.name
                                  )}
                                  onChange={handleFittingChange}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {fitting.description} (K={fitting.kValue})
                                </span>
                                {formData.selectedFittings.includes(
                                  fitting.name
                                ) && (
                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      formData.selectedFittingsQuantities[
                                        fitting.name
                                      ] || 1
                                    }
                                    onChange={(e) =>
                                      handleFittingQuantityChange(
                                        fitting.name,
                                        e.target.value
                                      )
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
                                    style={{ marginLeft: 8 }}
                                    title="Quantity"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                <button
                  onClick={handleCalculateFittingLosses}
                  disabled={
                    fittingLoading ||
                    !formData.selectedFittings.length ||
                    !formData.fittingVelocity
                  }
                  className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {fittingLoading
                    ? "Calculating..."
                    : "Calculate Fitting Losses"}
                </button>
              </div>
            )}

            {fittingLosses && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">
                  Fitting Losses Results
                </h3>
                <div className="space-y-1 text-sm text-green-700">
                  <p>
                    Total Fitting Loss:{" "}
                    {fittingLosses?.totalFittingLoss?.toFixed(2)} Pa
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Calculate Total Pressure Drop Button */}
          <button
            onClick={handleCalculateTotalPressureDrop}
            disabled={totalLoading}
            className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {totalLoading ? "Calculating..." : "Calculate Total Pressure Drop"}
          </button>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Results</h2>

        {totalPressureDrop && (
          <div className="space-y-6">
            {/* Total Pressure Drop Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Total Pressure Drop
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pressure Drop:</span>
                  <span className="font-semibold text-blue-600">
                    {breakdownTotal.toFixed(2)} Pa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pressure Drop:</span>
                  <span className="font-semibold text-blue-600">
                    {(breakdownTotal * 0.00001).toFixed(2)} Bar
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coil Pressure Drop:</span>
                  <span className="font-medium text-gray-800">
                    {formData.coilPressureDrop} Pa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Filter Pressure Drop:</span>
                  <span className="font-medium text-gray-800">
                    {formData.filterPressureDrop} Pa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fitting Losses:</span>
                  <span className="font-medium text-gray-800">
                    {(fittingLosses?.totalFittingLoss || 0).toFixed(2)} Pa
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Losses:</span>
                  <span className="font-medium text-gray-800">
                    {formData.additionalLosses || 0} Pa
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-blue-600">
                    {breakdownTotal.toFixed(2)} Pa
                  </span>
                </div>
              </div>
            </div>

            {/* Input Parameters */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Input Parameters
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Airflow:</span>
                  <span>{formData.airflow} CFM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Velocity:</span>
                  <span>{formData.velocity} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Fittings:</span>
                  <span>{formData.selectedFittings.length} fittings</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!totalPressureDrop && (
          <div className="text-center text-gray-500 py-8">
            <p>Calculate pressure drop to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AHU;
