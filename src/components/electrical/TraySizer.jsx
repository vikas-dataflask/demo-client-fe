import React, { useState, useEffect } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  useSaveTrayCalculationMutation,
  useGetTrayCalculationQuery,
  useUpdateTrayCalculationMutation,
  useGetCableTrayReferenceDataQuery,
} from "../../redux/features/api/api";

const TraySizer = () => {
  const { projectId } = useParams();
  const [cableRows, setCableRows] = useState([
    { id: 1, size: "", quantity: "" },
  ]);
  const [fillFactor, setFillFactor] = useState(40);
  const [trayType, setTrayType] = useState("Perforated");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ RTK Query hooks
  const { data: referenceData } = useGetCableTrayReferenceDataQuery(undefined, {
    skip: !token,
  });
  const { data: existingData } = useGetTrayCalculationQuery(projectId, {
    skip: !projectId || !token,
  });
  const [saveTrayCalculation, { isLoading }] = useSaveTrayCalculationMutation();
  const [updateTrayCalculation] = useUpdateTrayCalculationMutation();

  // ✅ Autofill if existing data
  useEffect(() => {
    if (existingData?.data) {
      const d = existingData.data;
      setFillFactor((d.fillFactor || 0.4) * 100);
      setTrayType(d.trayType || "Perforated");
      if (d.cableList) {
        setCableRows(
          d.cableList.map((c, index) => ({
            id: index + 1,
            size: c.size,
            quantity: c.quantity,
          }))
        );
      }
      setResult(d);
    }
  }, [existingData]);

  const addCableRow = () => {
    const newId = Math.max(...cableRows.map((row) => row.id)) + 1;
    setCableRows([...cableRows, { id: newId, size: "", quantity: "" }]);
  };

  const removeCableRow = (id) => {
    if (cableRows.length > 1) {
      setCableRows(cableRows.filter((row) => row.id !== id));
    }
  };

  const updateCableRow = (id, field, value) => {
    setCableRows(
      cableRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const validateForm = () => {
    const hasEmptyFields = cableRows.some((row) => !row.size || !row.quantity);
    if (hasEmptyFields) {
      setError("Please fill in all cable size and quantity fields.");
      return false;
    }
    const hasNegativeQuantity = cableRows.some(
      (row) => parseFloat(row.quantity) <= 0
    );
    if (hasNegativeQuantity) {
      setError("Cable quantities must be greater than 0.");
      return false;
    }
    if (fillFactor < 10 || fillFactor > 100) {
      setError("Fill factor must be between 10% and 100%.");
      return false;
    }
    return true;
  };

  const handleCalculateAndSave = async () => {
    if (!token) {
      setError("Authentication required. Please login first.");
      return;
    }
    if (!validateForm()) return;

    setError("");
    setResult(null);

    const cableList = cableRows.map((row) => ({
      size: row.size,
      quantity: parseInt(row.quantity),
    }));

    try {
      const payload = {
        projectId,
        cableList,
        fillFactor: fillFactor / 100,
        trayType,
      };

      const res = await saveTrayCalculation(payload).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err?.data?.message || "Calculation failed. Try again.");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        projectId,
        cableList: cableRows.map((row) => ({
          size: row.size,
          quantity: parseInt(row.quantity),
        })),
        fillFactor: fillFactor / 100,
        trayType,
      };
      const res = await updateTrayCalculation(payload).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err?.data?.message || "Update failed. Try again.");
    }
  };

  const resetForm = () => {
    setCableRows([{ id: 1, size: "", quantity: "" }]);
    setFillFactor(40);
    setTrayType("Perforated");
    setResult(null);
    setError("");
  };

  const getFillFactorColor = (percentage) => {
    if (percentage <= 30) return "text-green-600";
    if (percentage <= 50) return "text-yellow-600";
    return "text-red-600";
  };
  const getFillFactorIcon = (percentage) => {
    if (percentage <= 30)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage <= 50)
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
            Please login to use the Cable Tray Sizer.
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
              Cable Tray Sizer
            </h1>
            <p className="text-gray-600">
              Calculate the required cable tray size based on cable quantity and
              type
            </p>
          </div>
        </div>
      </div>

      {/* --- Error --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* --- Form --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Cable Rows */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cable Specifications
            </h3>
            <div className="space-y-4">
              {cableRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cable Size (mm²)
                    </label>
                    <input
                      type="text"
                      value={row.size}
                      onChange={(e) =>
                        updateCableRow(row.id, "size", e.target.value)
                      }
                      placeholder="e.g., 16"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {index === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Common sizes: 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        updateCableRow(row.id, "quantity", e.target.value)
                      }
                      placeholder="e.g., 30"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    {cableRows.length > 1 && (
                      <button
                        onClick={() => removeCableRow(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    {index === cableRows.length - 1 && (
                      <button
                        onClick={addCableRow}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fill Factor & Tray Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fill Factor (%)
              </label>
              <input
                type="number"
                value={fillFactor}
                onChange={(e) =>
                  setFillFactor(parseFloat(e.target.value) || 40)
                }
                min="10"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tray Type
              </label>
              <input
                type="text"
                value={trayType}
                onChange={(e) => setTrayType(e.target.value)}
                placeholder="e.g., Perforated"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Common types: Perforated, Ladder, Solid, Wire Mesh
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleCalculateAndSave}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              <span>{isLoading ? "Calculating..." : "Calculate & Save"}</span>
            </button>

            {existingData?.data && (
              <button
                onClick={handleUpdate}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Update Existing
              </button>
            )}

            <button
              onClick={resetForm}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Results --- */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Tray Size
          </h3>
          {result.success ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Total Cable Area</div>
                <div className="text-2xl font-bold">
                  {result.totalCableArea} mm²
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Required Tray Area</div>
                <div className="text-2xl font-bold">
                  {result.requiredTrayArea} mm²
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Recommended Tray</div>
                <div className="text-2xl font-bold">
                  {result.recommendedTraySize}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span>{result.warning}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Reference Data --- */}
      {referenceData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Reference Information
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {referenceData.data.traySizes.length} standard tray sizes available
          </p>
        </div>
      )}
    </div>
  );
};

export default TraySizer;
