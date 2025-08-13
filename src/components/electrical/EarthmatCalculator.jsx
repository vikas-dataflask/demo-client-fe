import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw,
  Loader2,
  Shield,
} from "lucide-react";

import {
  useAddEarthmatCalculationMutation,
  useGetEarthmatReferenceQuery,
  useGetEarthmatAutofillQuery,
  useUpdateEarthmatCalculationMutation,
} from "../../redux/features/api/api"; // ✅ adjust path if needed

const EarthmatCalculator = ({ calculationId = null }) => {
  const { projectId } = useParams(); // Get projectId from URL parameters
  const [formData, setFormData] = useState({
    faultCurrent: "",
    faultDuration: "",
    soilResistivity: "",
    gridLength: "",
    gridWidth: "",
    burialDepth: "",
    rodDepth: "",
    numberOfRods: "",
    material: "GI",
    gridSpacing: "7.5",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ✅ RTK Query Hooks
  const [addEarthmatCalculation, { isLoading: isAdding }] =
    useAddEarthmatCalculationMutation();
  const [updateEarthmatCalculation, { isLoading: isUpdating }] =
    useUpdateEarthmatCalculationMutation();
  const { data: referenceResponse } = useGetEarthmatReferenceQuery();
  const { data: autofillResponse, isLoading: isAutofilling } =
    useGetEarthmatAutofillQuery(projectId, { skip: !projectId });

  const referenceData = referenceResponse?.data || null;

  // ✅ Autofill if calculationId is provided
  useEffect(() => {
    if (autofillResponse?.success && autofillResponse.data) {
      console.log("Autofill Response:", autofillResponse.data); // Debug: Log autofill structure
      const { input, result: resultData, _id, ...rest } = autofillResponse.data;
      setFormData({
        faultCurrent: input.faultCurrent,
        faultDuration: input.faultDuration,
        soilResistivity: input.soilResistivity,
        gridLength: input.gridArea.length,
        gridWidth: input.gridArea.width,
        burialDepth: input.burialDepth,
        rodDepth: input.rodDepth,
        numberOfRods: input.numberOfRods,
        material: input.material,
        gridSpacing: input.gridSpacing,
      });
      // Set the result data properly - it should be in the result field
      setResult(resultData || rest);
    }
  }, [autofillResponse]);

  const materials = [
    { value: "GI", label: "Galvanized Iron (GI)", k: 80 },
    { value: "Cu", label: "Copper (Cu)", k: 143 },
  ];

  const gridSpacingOptions = [
    { value: "5", label: "5 m" },
    { value: "7.5", label: "7.5 m (Default)" },
    { value: "10", label: "10 m" },
    { value: "15", label: "15 m" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = [
      "faultCurrent",
      "faultDuration",
      "soilResistivity",
      "gridLength",
      "gridWidth",
      "burialDepth",
      "rodDepth",
      "numberOfRods",
    ];

    for (const field of required) {
      if (!formData[field] || parseFloat(formData[field]) <= 0) {
        setError(
          `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} must be greater than 0`
        );
        return false;
      }
    }

    if (parseFloat(formData.faultCurrent) > 100000) {
      setError("Fault current seems too high. Please verify the value.");
      return false;
    }

    if (parseFloat(formData.faultDuration) > 10) {
      setError("Fault duration seems too high. Please verify the value.");
      return false;
    }

    return true;
  };

  const calculateEarthmat = async () => {
    if (!validateForm()) return;

    setError("");
    setResult(null);

    const params = {
      projectId: projectId, // Include project ID in payload
      faultCurrent: parseFloat(formData.faultCurrent),
      faultDuration: parseFloat(formData.faultDuration),
      soilResistivity: parseFloat(formData.soilResistivity),
      gridArea: {
        length: parseFloat(formData.gridLength),
        width: parseFloat(formData.gridWidth),
      },
      burialDepth: parseFloat(formData.burialDepth),
      rodDepth: parseFloat(formData.rodDepth),
      numberOfRods: parseInt(formData.numberOfRods),
      material: formData.material,
      gridSpacing: parseFloat(formData.gridSpacing),
    };

    try {
      let res;
      if (calculationId) {
        // ✅ Update existing calculation
        res = await updateEarthmatCalculation({
          id: calculationId,
          ...params,
        }).unwrap();
      } else {
        // ✅ Add new calculation
        res = await addEarthmatCalculation(params).unwrap();
      }

      if (res.success) {
        console.log("API Response:", res.data); // Debug: Log the response structure
        setResult(res.data);
      } else {
        setError(res.message || "Calculation failed");
      }
    } catch (err) {
      console.error("Calculation error:", err);
      setError(err?.data?.message || "Network error. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      faultCurrent: "",
      faultDuration: "",
      soilResistivity: "",
      gridLength: "",
      gridWidth: "",
      burialDepth: "",
      rodDepth: "",
      numberOfRods: "",
      material: "GI",
      gridSpacing: "7.5",
    });
    setResult(null);
    setError("");
  };

  const getSafetyColor = (isSafe) =>
    isSafe ? "text-green-600" : "text-red-600";
  const getSafetyIcon = (isSafe) =>
    isSafe ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-600" />
    );

  return (
    <div className="w-[450px] h-[90vh] bg-white p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Earthmat/Grid Earthing Calculator
            </h1>
            <p className="text-gray-600">
              Calculate grid resistance, touch voltage, and conductor sizing per
              IEEE 80 & IS 3043
            </p>
          </div>
        </div>
      </div>

      {/* Autofill Loading */}
      {isAutofilling && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin inline-block mr-2" />
          <span className="text-blue-800">Loading saved calculation...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grid Parameters
          </h3>

          {/* Fault Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fault Current (A)
              </label>
              <input
                type="number"
                value={formData.faultCurrent}
                onChange={(e) =>
                  handleInputChange("faultCurrent", e.target.value)
                }
                placeholder="e.g., 25000"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fault Duration (s)
              </label>
              <input
                type="number"
                value={formData.faultDuration}
                onChange={(e) =>
                  handleInputChange("faultDuration", e.target.value)
                }
                placeholder="e.g., 1"
                min="0.1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Soil and Grid Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Resistivity (Ω·m)
              </label>
              <input
                type="number"
                value={formData.soilResistivity}
                onChange={(e) =>
                  handleInputChange("soilResistivity", e.target.value)
                }
                placeholder="e.g., 100"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Length (m)
              </label>
              <input
                type="number"
                value={formData.gridLength}
                onChange={(e) =>
                  handleInputChange("gridLength", e.target.value)
                }
                placeholder="e.g., 30"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Width (m)
              </label>
              <input
                type="number"
                value={formData.gridWidth}
                onChange={(e) => handleInputChange("gridWidth", e.target.value)}
                placeholder="e.g., 30"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Depth Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Burial Depth (m)
              </label>
              <input
                type="number"
                value={formData.burialDepth}
                onChange={(e) =>
                  handleInputChange("burialDepth", e.target.value)
                }
                placeholder="e.g., 0.6"
                min="0.1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rod Depth (m)
              </label>
              <input
                type="number"
                value={formData.rodDepth}
                onChange={(e) => handleInputChange("rodDepth", e.target.value)}
                placeholder="e.g., 3"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rods
              </label>
              <input
                type="number"
                value={formData.numberOfRods}
                onChange={(e) =>
                  handleInputChange("numberOfRods", e.target.value)
                }
                placeholder="e.g., 16"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Material and Spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conductor Material
              </label>
              <select
                value={formData.material}
                onChange={(e) => handleInputChange("material", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {materials.map((material) => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Spacing (m)
              </label>
              <select
                value={formData.gridSpacing}
                onChange={(e) =>
                  handleInputChange("gridSpacing", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {gridSpacingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={calculateEarthmat}
          disabled={isAdding || isUpdating}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding || isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Calculator className="w-5 h-5" />
          )}
          <span>
            {isUpdating
              ? "Updating..."
              : isAdding
              ? "Calculating..."
              : calculationId
              ? "Update Calculation"
              : "Calculate Earthmat"}
          </span>
        </button>

        <button
          onClick={resetForm}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🛡️ Earthmat Calculation Results
          </h3>

          <div className="space-y-6">
            {/* Safety Status */}
            {result.isSafe !== undefined && (
              <div
                className={`bg-${
                  result.isSafe ? "green" : "red"
                }-50 border border-${
                  result.isSafe ? "green" : "red"
                }-200 rounded-lg p-4`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getSafetyIcon(result.isSafe)}
                  <span
                    className={`font-medium ${getSafetyColor(result.isSafe)}`}
                  >
                    {result.isSafe ? "Safe Design" : "Unsafe Design"}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    result.isSafe ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.recommendation || "Safety assessment completed"}
                </p>
                {!result.isSafe && result.safetyMargin && (
                  <div className="mt-2 text-sm text-red-600">
                    Safety Margin: {result.safetyMargin}% below required
                  </div>
                )}
              </div>
            )}

            {/* Key Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">
                  Permissible Touch Voltage
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {result.permissibleTouchVoltage || "N/A"} V
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">
                  Actual Touch Voltage
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {result.actualTouchVoltage || "N/A"} V
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium">
                  Grid Resistance
                </div>
                <div className="text-2xl font-bold text-indigo-900">
                  {result.gridResistance || "N/A"} Ω
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">
                  Conductor Size
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {result.requiredConductorSize || "N/A"}
                </div>
              </div>
            </div>

            {/* Grid Geometry */}
            {result?.gridGeometry && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Grid Geometry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      Total Conductor Length:
                    </span>
                    <span className="font-medium ml-2">
                      {result.gridGeometry.totalLength || "N/A"} m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grid Area:</span>
                    <span className="font-medium ml-2">
                      {result.gridGeometry.area || "N/A"} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grid Spacing:</span>
                    <span className="font-medium ml-2">
                      {result.gridGeometry.gridSpacing || "N/A"} m
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Input Summary */}
            {result?.input && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Input Parameters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Fault Current:</span>
                    <span className="font-medium ml-2">
                      {result.input.faultCurrent || "N/A"} A
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fault Duration:</span>
                    <span className="font-medium ml-2">
                      {result.input.faultDuration || "N/A"} s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Soil Resistivity:</span>
                    <span className="font-medium ml-2">
                      {result.input.soilResistivity || "N/A"} Ω·m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium ml-2">
                      {result.input.material || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reference Information */}
      {referenceData && (
        <div className="bg-white h-[20vh] rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Reference Information
            </h3>
          </div>
          {/* Keep your reference UI same */}
        </div>
      )}
    </div>
  );
};

export default EarthmatCalculator;
