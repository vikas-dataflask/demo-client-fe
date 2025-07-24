import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useCalculateCableSizeMutation,
  useBulkCalculateCableSizeMutation,
  useGetReferenceDataQuery,
  useSaveCableSizingDataMutation,
  useGetCableSizingByProjectQuery,
} from "../../redux/features/api/api";
import {
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw,
} from "lucide-react";

const CableSizingForm = () => {
  const { projectId } = useParams();

  const [formData, setFormData] = useState({
    loadWatts: "",
    cableLengthMeters: "",
    voltage: 230,
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showReference, setShowReference] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkCircuits, setBulkCircuits] = useState([
    {
      circuitName: "Circuit 1",
      loadWatts: "",
      cableLengthMeters: "",
      voltage: 230,
    },
  ]);

  const token = localStorage.getItem("token");

  // ✅ RTK Query hooks
  const { data: referenceData, isLoading: isLoadingReference } =
    useGetReferenceDataQuery(undefined, {
      skip: !token,
    });
  const [calculateCableSize, { isLoading: isCalculating }] =
    useCalculateCableSizeMutation();
  const [bulkCalculateCableSize, { isLoading: isBulkCalculating }] =
    useBulkCalculateCableSizeMutation();
  const [saveCableSizingData] = useSaveCableSizingDataMutation();

  // ✅ Get existing data for autofill
  const { data: existingData, isLoading: isLoadingExisting } =
    useGetCableSizingByProjectQuery(projectId, {
      skip: !projectId || !token,
    });

  // ✅ Autofill form with existing data
  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data;
      console.log("Autofill data received:", data);

      if (data.bulkMode) {
        console.log("Setting bulk mode to true");
        setBulkMode(true);
        // Check for bulkCircuits in both possible locations
        if (data.bulkCircuits && data.bulkCircuits.length > 0) {
          console.log(
            "Setting bulk circuits from data.bulkCircuits:",
            data.bulkCircuits
          );
          setBulkCircuits(data.bulkCircuits);
        } else if (
          data.formData &&
          Array.isArray(data.formData) &&
          data.formData.length > 0
        ) {
          console.log(
            "Setting bulk circuits from data.formData:",
            data.formData
          );
          setBulkCircuits(data.formData);
        } else {
          console.log("No bulkCircuits found in data:", data);
        }
      } else {
        setBulkMode(false);
        if (data.formData) {
          setFormData({
            loadWatts: data.formData.loadWatts || "",
            cableLengthMeters: data.formData.cableLengthMeters || "",
            voltage: data.formData.voltage || 230,
          });
        }
      }

      if (data.result) {
        console.log("Processing result data:", data.result);
        // Handle both single and bulk results
        if (data.bulkMode) {
          // For bulk mode, result should be an array
          if (Array.isArray(data.result)) {
            console.log(
              "Setting bulk results from data.result (array):",
              data.result
            );
            setResult(data.result);
          } else {
            console.log("Unexpected bulk result structure:", data.result);
          }
        } else {
          console.log("Setting single result:", data.result);
          setResult(data.result);
        }
      }
    }
  }, [existingData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBulkInputChange = (index, field, value) => {
    setBulkCircuits((prev) =>
      prev.map((circuit, i) =>
        i === index ? { ...circuit, [field]: value } : circuit
      )
    );
  };

  const addBulkCircuit = () => {
    setBulkCircuits((prev) => [
      ...prev,
      {
        circuitName: `Circuit ${prev.length + 1}`,
        loadWatts: "",
        cableLengthMeters: "",
        voltage: 230,
      },
    ]);
  };

  const removeBulkCircuit = (index) => {
    setBulkCircuits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCalculate = async () => {
    if (!token) {
      setError("Authentication required. Please login first.");
      return;
    }

    if (!bulkMode) {
      if (!formData.loadWatts || !formData.cableLengthMeters) {
        setError("Please fill in all required fields (Load and Cable Length).");
        return;
      }
    } else {
      const hasEmptyFields = bulkCircuits.some(
        (circuit) => !circuit.loadWatts || !circuit.cableLengthMeters
      );
      if (hasEmptyFields) {
        setError("Please fill in all required fields for all circuits.");
        return;
      }
    }

    setError("");
    setResult(null);

    try {
      if (bulkMode) {
        const payload = {
          circuits: bulkCircuits.map((circuit) => ({
            ...circuit,
            loadWatts: parseFloat(circuit.loadWatts) || 0,
            cableLengthMeters: parseFloat(circuit.cableLengthMeters) || 0,
            voltage: parseFloat(circuit.voltage) || 230,
          })),
          projectId,
        };
        const res = await bulkCalculateCableSize(payload).unwrap();
        console.log("Bulk calculation response:", res.data);

        // Ensure we have the correct data structure
        if (res.data && res.data.results && Array.isArray(res.data.results)) {
          setResult(res.data.results);
        } else {
          console.error(
            "Invalid bulk calculation response structure:",
            res.data
          );
          setError("Invalid response structure from bulk calculation");
          return;
        }

        // Save data to project
        await saveCableSizingData({
          projectId,
          formData: bulkCircuits,
          result: res.data.results, // Save only the results array for bulk mode
          bulkMode: true,
          bulkCircuits,
        });
      } else {
        const payload = {
          loadWatts: parseFloat(formData.loadWatts) || 0,
          cableLengthMeters: parseFloat(formData.cableLengthMeters) || 0,
          voltage: parseFloat(formData.voltage) || 230,
          projectId,
        };
        const res = await calculateCableSize(payload).unwrap();
        console.log("Single calculation response:", res.data);

        // Ensure we have the correct data structure
        if (res.data) {
          setResult(res.data);
        } else {
          console.error(
            "Invalid single calculation response structure:",
            res.data
          );
          setError("Invalid response structure from calculation");
          return;
        }

        // Save data to project
        await saveCableSizingData({
          projectId,
          formData,
          result: res.data,
          bulkMode: false,
        });
      }
    } catch (err) {
      setError(err?.data?.message || "Calculation failed. Try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      loadWatts: "",
      cableLengthMeters: "",
      voltage: 230,
    });
    setBulkCircuits([
      {
        circuitName: "Circuit 1",
        loadWatts: "",
        cableLengthMeters: "",
        voltage: 230,
      },
    ]);
    setResult(null);
    setError("");
  };

  const getVoltageDropColor = (percentage) => {
    if (percentage <= 2) return "text-green-600";
    if (percentage <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getVoltageDropIcon = (percentage) => {
    if (percentage <= 2)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage <= 3)
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-700">
            Please login to use the Cable Sizing Calculator.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingExisting) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <RotateCcw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Project Data
          </h2>
          <p className="text-gray-600">
            Please wait while we load your cable sizing data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* --- Header --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cable Sizing Calculator
            </h1>
            <p className="text-gray-600">
              Calculate cable size, current, MCB rating, and voltage drop for
              lighting circuits
            </p>
          </div>
        </div>
      </div>

      {/* --- Mode Toggle --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={!bulkMode}
              onChange={() => setBulkMode(false)}
              className="mr-2"
            />
            Single Circuit
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={bulkMode}
              onChange={() => setBulkMode(true)}
              className="mr-2"
            />
            Multiple Circuits
          </label>
        </div>
      </div>

      {/* --- Input Form --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {!bulkMode ? (
          // ✅ Single Circuit Form
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load (Watts)
              </label>
              <input
                type="number"
                name="loadWatts"
                value={formData.loadWatts}
                onChange={handleInputChange}
                placeholder="e.g., 1800"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cable Length (Meters)
              </label>
              <input
                type="number"
                name="cableLengthMeters"
                value={formData.cableLengthMeters}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voltage (V)
              </label>
              <input
                type="number"
                name="voltage"
                value={formData.voltage}
                onChange={handleInputChange}
                placeholder="230"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          // ✅ Bulk Circuits Form
          <div className="space-y-4">
            {bulkCircuits.map((circuit, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Circuit Name
                  </label>
                  <input
                    type="text"
                    value={circuit.circuitName}
                    onChange={(e) =>
                      handleBulkInputChange(
                        index,
                        "circuitName",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Load (W)
                  </label>
                  <input
                    type="number"
                    value={circuit.loadWatts}
                    onChange={(e) =>
                      handleBulkInputChange(index, "loadWatts", e.target.value)
                    }
                    placeholder="1800"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    value={circuit.cableLengthMeters}
                    onChange={(e) =>
                      handleBulkInputChange(
                        index,
                        "cableLengthMeters",
                        e.target.value
                      )
                    }
                    placeholder="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voltage (V)
                    </label>
                    <input
                      type="number"
                      value={circuit.voltage}
                      onChange={(e) =>
                        handleBulkInputChange(index, "voltage", e.target.value)
                      }
                      placeholder="230"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {bulkCircuits.length > 1 && (
                    <button
                      onClick={() => removeBulkCircuit(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addBulkCircuit}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Circuit
            </button>
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={handleCalculate}
            disabled={isCalculating || isBulkCalculating}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCalculating || isBulkCalculating ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
              <Calculator className="w-5 h-5" />
            )}
            <span>
              {isCalculating || isBulkCalculating
                ? "Calculating..."
                : "Calculate"}
            </span>
          </button>

          <button
            onClick={resetForm}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>

          <button
            onClick={() => setShowReference(!showReference)}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Info className="w-5 h-5" />
            <span>Reference Data</span>
          </button>
        </div>
      </div>

      {/* --- Reference Data --- */}
      {showReference && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reference Data
          </h3>
          {isLoadingReference ? (
            <div className="flex items-center justify-center py-8">
              <RotateCcw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Loading reference data...
              </span>
            </div>
          ) : referenceData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Cable Sizes & Current Limits
                </h4>
                <div className="space-y-2">
                  {Object.entries(referenceData.data.currentLimits).map(
                    ([size, limit]) => (
                      <div key={size} className="flex justify-between text-sm">
                        <span>{size} Sq.mm</span>
                        <span className="font-medium">≤ {limit}A</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Resistance Values (Ω/km)
                </h4>
                <div className="space-y-2">
                  {Object.entries(referenceData.data.resistanceValues).map(
                    ([size, resistance]) => (
                      <div key={size} className="flex justify-between text-sm">
                        <span>{size} Sq.mm</span>
                        <span className="font-medium">{resistance} Ω/km</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Reference data not available</p>
            </div>
          )}
        </div>
      )}

      {/* --- Error Display --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* --- Results Display --- */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Calculation Results
          </h3>

          {!bulkMode ? (
            // ✅ Single Result
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {result.current} A
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Recommended Cable
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {result.recommendedCableSize}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">MCB Rating</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {result.mcb}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">
                  Voltage Drop
                </h4>
                <div className="flex items-center space-x-2">
                  {getVoltageDropIcon(result.voltageDropPercentage)}
                  <p className="text-2xl font-bold text-yellow-600">
                    {result.voltageDrop} V
                  </p>
                </div>
                <p
                  className={`text-sm ${getVoltageDropColor(
                    result.voltageDropPercentage
                  )}`}
                >
                  {result.voltageDropPercentage}% of{" "}
                  {result.calculations.voltage}V
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <div className="flex items-center space-x-2">
                  {result.status === "Pass" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <p
                    className={`text-lg font-bold ${
                      result.status === "Pass"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.status}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // ✅ Bulk Results Table
            <div className="overflow-x-auto">
              {Array.isArray(result) ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Circuit Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current (A)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cable Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MCB Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voltage Drop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.map((circuit, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {circuit.circuitName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {circuit.current}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {circuit.recommendedCableSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {circuit.mcb}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {circuit.voltageDrop} V (
                          <span
                            className={getVoltageDropColor(
                              circuit.voltageDropPercentage
                            )}
                          >
                            {circuit.voltageDropPercentage}%
                          </span>
                          )
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {circuit.status === "Pass" ? (
                            <span className="text-green-600 flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />{" "}
                              <span>Pass</span>
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4" />{" "}
                              <span>Fail</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No bulk calculation results available</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CableSizingForm;
