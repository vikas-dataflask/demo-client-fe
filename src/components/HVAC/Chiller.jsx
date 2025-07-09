import React, { useState, useMemo } from "react";
import {
  useCalculateChillerPressureDropMutation,
  useGetFluidPropertiesQuery,
  useGetFluidTypesQuery,
  useCalculateFittingLossesMutation,
  useGetStandardFittingsQuery,
} from "../../redux/features/api/api";

const Chiller = () => {
  const [formData, setFormData] = useState({
    chillerTonnage: 100,
    flowRateLps: 18.9,
    pipeInnerDiameterMm: 100,
    mode: "data",
    fluidType: "water",
    temperatureC: 25,
    systemType: "primary-pump-outlet-riser",
  });

  const [result, setResult] = useState(null);
  const [calculateChillerPressureDrop, { isLoading, error }] =
    useCalculateChillerPressureDropMutation();
  const { data: fluidTypes } = useGetFluidTypesQuery();
  const { data: fluidProps } = useGetFluidPropertiesQuery({
    fluidType: formData.fluidType,
    temperatureC: parseInt(formData.temperatureC),
  });

  // Fittings-related state and hooks
  const [fittingLosses, setFittingLosses] = useState({});
  const [showFittingSelector, setShowFittingSelector] = useState(false);
  const [selectedFittings, setSelectedFittings] = useState([]);
  const [selectedFittingsQuantities, setSelectedFittingsQuantities] = useState(
    {}
  );
  const [fittingVelocity, setFittingVelocity] = useState("");
  const [airDensity, setAirDensity] = useState("");
  const [sumTotalFittingLoss, setSumTotalFittingLoss] = useState(null);

  const [calculateFittingLosses, { isLoading: fittingLoading }] =
    useCalculateFittingLossesMutation();
  const {
    data: standardFittings,
    isLoading: fittingsLoading,
    error: fittingsError,
  } = useGetStandardFittingsQuery();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "mode" || name === "fluidType" || name === "systemType"
          ? value
          : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      ...(formData.mode === "theoretical" &&
        fluidProps?.data && {
          fluidDensity: fluidProps.data.fluidDensity,
          fluidViscosity: fluidProps.data.fluidViscosity,
        }),
    };

    try {
      const response = await calculateChillerPressureDrop(payload).unwrap();
      setResult(response.data);
    } catch (err) {
      console.error("Pressure drop calculation error:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      chillerTonnage: 100,
      flowRateLps: 18.9,
      pipeInnerDiameterMm: 100,
      mode: "data",
      fluidType: "water",
      temperatureC: 25,
      systemType: "primary-pump-outlet-riser",
    });
    setResult(null);
    setFittingLosses({});
    setSelectedFittings([]);
    setSelectedFittingsQuantities({});
    setFittingVelocity("");
    setAirDensity("");
    setSumTotalFittingLoss(null);
  };

  // Fittings-related functions
  const handleFittingChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedFittings([...selectedFittings, value]);
      setSelectedFittingsQuantities((prev) => ({
        ...prev,
        [value]: prev[value] || 1,
      }));
    } else {
      setSelectedFittings(selectedFittings.filter((f) => f !== value));
      const { [value]: _, ...restQuantities } = selectedFittingsQuantities;
      setSelectedFittingsQuantities(restQuantities);
    }
  };

  const handleFittingQuantityChange = (fittingName, quantity) => {
    setSelectedFittingsQuantities((prev) => ({
      ...prev,
      [fittingName]: Math.max(1, Number(quantity)),
    }));
  };

  const handleCalculateFittingLosses = async () => {
    if (!selectedFittings.length || !fittingVelocity) {
      alert("Please select fittings and enter velocity");
      return;
    }

    try {
      // Build the array of fitting objects with type, quantity, and kValue
      const fittingsArray = selectedFittings.map((fittingName) => {
        const fitting = Object.values(groupedFittings)
          .flat()
          .find((f) => f.name === fittingName);
        return {
          type: fittingName,
          quantity: selectedFittingsQuantities[fittingName] || 1,
          kValue: fitting?.kValue || 0,
        };
      });

      const dataToSend = {
        fittingsArray,
        airVelocity: parseFloat(fittingVelocity),
      };

      if (airDensity) {
        dataToSend.airDensity = parseFloat(airDensity);
      }

      const response = await calculateFittingLosses(dataToSend).unwrap();

      // Store fitting losses for the current system type
      setFittingLosses((prev) => ({
        ...prev,
        [formData.systemType]: response.data,
      }));

      console.log(
        "Fitting losses calculated for system type:",
        formData.systemType,
        response
      );
    } catch (err) {
      console.error("Failed to calculate fitting losses:", err);
      alert("Failed to calculate fitting losses");
    }
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
      const fittingsData = standardFittings?.data?.standardFittings;

      if (!fittingsData || typeof fittingsData !== "object") {
        return {};
      }

      // Convert the object to an array and group by category
      const fittingsArray = Object.entries(fittingsData).map(
        ([key, fitting]) => {
          return {
            name: key,
            kValue: fitting.kValue || 0,
            description: fitting.description || key,
            category: getFittingCategory(key),
          };
        }
      );

      const result = fittingsArray.reduce((acc, fitting) => {
        if (!acc[fitting.category]) {
          acc[fitting.category] = [];
        }
        acc[fitting.category].push(fitting);
        return acc;
      }, {});

      return result;
    } catch (err) {
      console.error("Error in groupedFittings calculation:", err);
      return {};
    }
  }, [standardFittings]);

  return (
    <div className="flex h-[90vh]">
      {/* Left Sidebar */}
      <div className="flex-1 bg-white border-r border-gray-300 text-sm font-medium flex flex-col h-full">
        {/* Header */}
        <div className="p-4 pb-0 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-800">
                Chiller Pressure Drop
              </h2>
              <p className="text-xs text-gray-400">Updated: Just now</p>
            </div>
            <button
              className="w-[24px] h-[24px] bg-[#0083EE] text-white rounded-md flex items-center justify-center hover:bg-[#1C78DC] transition"
              onClick={resetForm}
            >
              <svg
                className="w-[16px] h-[16px] stroke-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Chiller Pressure Drop Calculator
              </h1>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Calculation Mode Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Calculation Mode
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode Selection
                    </label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="data">Data Mode (Rule-of-thumb)</option>
                      <option value="theoretical">
                        Theoretical Mode (Darcy-Weisbach)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flow Rate (L/s)
                    </label>
                    <input
                      type="number"
                      name="flowRateLps"
                      value={formData.flowRateLps}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter flow rate"
                      required
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* System Selection Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  System Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Type
                    </label>
                    <select
                      name="systemType"
                      value={formData.systemType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="primary-pump-outlet-riser">
                        Primary Pump Outlet Riser To Main Header
                      </option>
                      <option value="main-header-pump-to-chiller">
                        Main Header (Pump To Chiller)
                      </option>
                      <option value="riser-main-header-to-chiller">
                        Riser From Main Header - To Chiller Inlet Connection
                      </option>
                      <option value="chiller-outlet-riser-to-main">
                        Chiller Out Let- Riser To Main Header
                      </option>
                      <option value="supply-main-header-to-secondary">
                        Supply Main Header To Secondary Pump
                      </option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the specific chilled water system section for
                      calculation
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      System Description
                    </h3>
                    <div className="text-xs text-blue-700">
                      {formData.systemType === "primary-pump-outlet-riser" && (
                        <p>
                          Calculates pressure drop from primary pump discharge
                          through vertical riser to the main distribution
                          header. Includes pipe friction and elevation head.
                        </p>
                      )}
                      {formData.systemType ===
                        "main-header-pump-to-chiller" && (
                        <p>
                          Pressure drop calculation for the main horizontal
                          header from pump discharge to chiller inlet. Includes
                          fittings and pipe friction losses.
                        </p>
                      )}
                      {formData.systemType ===
                        "riser-main-header-to-chiller" && (
                        <p>
                          Vertical and horizontal piping from main header down
                          to individual chiller inlet connection. Includes
                          elevation changes and connection losses.
                        </p>
                      )}
                      {formData.systemType ===
                        "chiller-outlet-riser-to-main" && (
                        <p>
                          Return path from chiller outlet through riser back to
                          main return header. Considers return water temperature
                          and flow characteristics.
                        </p>
                      )}
                      {formData.systemType ===
                        "supply-main-header-to-secondary" && (
                        <p>
                          Distribution from main supply header to secondary pump
                          suction. Critical for secondary pump NPSH and system
                          hydraulics.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Mode Parameters */}
              {formData.mode === "data" && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Data Mode Parameters
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chiller Tonnage (tons)
                      </label>
                      <input
                        type="number"
                        name="chillerTonnage"
                        value={formData.chillerTonnage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter chiller tonnage"
                        required
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Theoretical Mode Parameters */}
              {formData.mode === "theoretical" && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Theoretical Mode Parameters
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pipe Inner Diameter (mm)
                      </label>
                      <input
                        type="number"
                        name="pipeInnerDiameterMm"
                        value={formData.pipeInnerDiameterMm}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter pipe diameter"
                        required
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fluid Type
                      </label>
                      <select
                        name="fluidType"
                        value={formData.fluidType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {fluidTypes?.data?.map((fluid) => (
                          <option key={fluid.type} value={fluid.type}>
                            {fluid.name}
                          </option>
                        )) ||
                          [
                            { type: "water", name: "Water" },
                            { type: "glycol_30", name: "30% Glycol Solution" },
                            { type: "glycol_50", name: "50% Glycol Solution" },
                          ].map((fluid) => (
                            <option key={fluid.type} value={fluid.type}>
                              {fluid.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        name="temperatureC"
                        value={formData.temperatureC}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter temperature"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>

                  {/* Fluid Properties Display */}
                  {fluidProps?.data && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        Fluid Properties
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                        <div>
                          <span className="font-medium">Density:</span>{" "}
                          {fluidProps.data.fluidDensity} kg/m³
                        </div>
                        <div>
                          <span className="font-medium">Viscosity:</span>{" "}
                          {fluidProps.data.fluidViscosity} Pa.s
                        </div>
                        <div>
                          <span className="font-medium">Temperature:</span>{" "}
                          {fluidProps.data.temperatureC}°C
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fitting Selection Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Fitting Losses
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowFittingSelector(!showFittingSelector)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {showFittingSelector ? "Hide" : "Select Fittings"}
                  </button>
                </div>

                {showFittingSelector && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fitting Velocity (m/s)
                      </label>
                      <input
                        type="number"
                        value={fittingVelocity}
                        onChange={(e) => setFittingVelocity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter velocity for fittings"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Air Density (kg/m³){" "}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={airDensity}
                        onChange={(e) => setAirDensity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Default: 1.2"
                        step="any"
                        min="0"
                      />
                    </div>

                    {fittingsLoading ? (
                      <div className="text-center py-4">
                        Loading fittings...
                      </div>
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
                                      checked={selectedFittings.includes(
                                        fitting.name
                                      )}
                                      onChange={handleFittingChange}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                      {fitting.description} (K={fitting.kValue})
                                    </span>
                                    {selectedFittings.includes(
                                      fitting.name
                                    ) && (
                                      <input
                                        type="number"
                                        min="1"
                                        value={
                                          selectedFittingsQuantities[
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
                      type="button"
                      onClick={handleCalculateFittingLosses}
                      disabled={
                        fittingLoading ||
                        !selectedFittings.length ||
                        !fittingVelocity
                      }
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {fittingLoading
                        ? "Calculating..."
                        : "Calculate Fitting Losses"}
                    </button>
                  </div>
                )}

                {Object.keys(fittingLosses).length > 0 && (
                  <div className="mt-4 space-y-3">
                    {Object.entries(fittingLosses).map(
                      ([systemType, losses]) => (
                        <div
                          key={systemType}
                          className="bg-green-50 border border-green-200 rounded-lg p-4"
                        >
                          <h3 className="font-medium text-green-800 mb-2">
                            Fitting Losses Results (
                            {systemType
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            )
                          </h3>
                          <div className="space-y-1 text-sm text-green-700">
                            <p>
                              Total Fitting Loss:{" "}
                              {losses?.totalFittingLoss?.toFixed(2)} Pa
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {Object.keys(fittingLosses).length >= 2 && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const sum = Object.values(fittingLosses).reduce(
                              (total, losses) =>
                                total + (losses?.totalFittingLoss || 0),
                              0
                            );
                            setSumTotalFittingLoss(sum);
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Sum of Total Fitting Loss
                        </button>
                      </div>
                    )}

                    {sumTotalFittingLoss !== null && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">
                          Sum Total Fitting Loss
                        </h3>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p>Total: {sumTotalFittingLoss.toFixed(2)} Pa</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Pressure Drop"}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Right Side - Results */}
      <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Pressure Drop Results
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-800 font-semibold">Error</div>
              <div className="text-red-700">
                {error.data?.message || error.error || "An error occurred"}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Main Result */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Calculation Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-600 font-medium">
                      Estimated Pressure Drop
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {result.estimatedDropKpa} kPa
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-600 font-medium">
                      Calculation Mode
                    </div>
                    <div className="text-lg font-semibold text-green-800 capitalize">
                      {result.mode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Parameters */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Input Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Flow Rate:
                    </span>
                    <span className="ml-2 text-gray-800">
                      {result.flowRateLps} L/s
                    </span>
                  </div>
                  {result.chillerTonnage && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Chiller Tonnage:
                      </span>
                      <span className="ml-2 text-gray-800">
                        {result.chillerTonnage} tons
                      </span>
                    </div>
                  )}
                  {result.pipeInnerDiameterMm && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Pipe Diameter:
                      </span>
                      <span className="ml-2 text-gray-800">
                        {result.pipeInnerDiameterMm} mm
                      </span>
                    </div>
                  )}
                  {result.velocity && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Flow Velocity:
                      </span>
                      <span className="ml-2 text-gray-800">
                        {result.velocity} m/s
                      </span>
                    </div>
                  )}
                  {result.reynoldsNumber && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Reynolds Number:
                      </span>
                      <span className="ml-2 text-gray-800">
                        {result.reynoldsNumber.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">
                      System Type:
                    </span>
                    <span className="ml-2 text-gray-800 capitalize">
                      {formData.systemType.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assumptions */}
              {result.assumptionsUsed && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Assumptions Used
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Method:</span>
                      <span className="ml-2 text-gray-800">
                        {result.assumptionsUsed?.method || "Not available"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Formula:
                      </span>
                      <span className="ml-2 text-gray-800">
                        {result.assumptionsUsed?.formula || "Not available"}
                      </span>
                    </div>
                    {result.assumptionsUsed?.typicalRange && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Typical Range:
                        </span>
                        <span className="ml-2 text-gray-800">
                          {result.assumptionsUsed.typicalRange}
                        </span>
                      </div>
                    )}
                    {result.assumptionsUsed?.chillerLength && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Chiller Length:
                        </span>
                        <span className="ml-2 text-gray-800">
                          {result.assumptionsUsed.chillerLength}
                        </span>
                      </div>
                    )}
                    {result.assumptionsUsed?.frictionFactor && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Friction Factor:
                        </span>
                        <span className="ml-2 text-gray-800">
                          {result.assumptionsUsed.frictionFactor}
                        </span>
                      </div>
                    )}
                    {result.assumptionsUsed?.flowRegime && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Flow Regime:
                        </span>
                        <span className="ml-2 text-gray-800">
                          {result.assumptionsUsed.flowRegime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fitting Losses Results */}
              {fittingLosses && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Fitting Losses
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="text-sm text-green-600 font-medium">
                        Total Pressure Drop
                      </div>
                      <div className="text-xl font-bold text-green-800">
                        {fittingLosses.totalPressureDrop?.toFixed(2)} Pa
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="text-sm text-blue-600 font-medium">
                        Total K Value
                      </div>
                      <div className="text-xl font-bold text-blue-800">
                        {fittingLosses.totalKValue?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Velocity Pressure:</span>
                        <span className="font-medium">
                          {fittingLosses.velocityPressure?.toFixed(2)} Pa
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Selected Fittings:</span>
                        <span className="font-medium">
                          {selectedFittings.length} fittings
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Fitting Velocity:</span>
                        <span className="font-medium">
                          {fittingVelocity} m/s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              {result.warning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="text-yellow-800 font-semibold">
                    ⚠️ Warning
                  </div>
                  <div className="text-yellow-700">{result.warning}</div>
                </div>
              )}
            </div>
          )}

          {!result && !isLoading && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🧮</div>
              <div className="text-xl font-medium">
                No calculation performed yet
              </div>
              <div className="text-sm">
                Fill in the form and click "Calculate Pressure Drop" to see
                results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chiller;
