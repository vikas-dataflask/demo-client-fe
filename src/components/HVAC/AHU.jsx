import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReloadIcon } from "../../icons/ReloadIcon";
import {
  useGetAhuPressureDropDataQuery,
  useCalculateTotalSystemPressureDropMutation,
} from "../../redux/features/api/api";

const AHU = ({ projectName, activity }) => {
  const { projectId } = useParams();

  const [equipmentList, setEquipmentList] = useState([
    {
      id: 1,
      flowrate: "",
      width: "",
      height: "",
      diameter: "",
      length: "",
      coefficientOfFitting: "0",
      equipmentName: "",
      calculationResult: null,
    },
  ]);

  const [totalSystemResult, setTotalSystemResult] = useState(null);
  const [showCoefficientField, setShowCoefficientField] = useState({});

  // Data management API hooks
  const [calculateTotalSystem, { isLoading: totalSystemLoading }] =
    useCalculateTotalSystemPressureDropMutation();
  const {
    data: savedData,
    isLoading: loadLoading,
    error: loadError,
  } = useGetAhuPressureDropDataQuery(
    { project_id: projectId },
    { skip: !projectId }
  );

  // Autofill data when saved data is loaded (for backward compatibility)
  useEffect(() => {
    if (savedData?.data) {
      const data = savedData.data;
      
      if (data.equipmentList && data.equipmentList.length > 0) {
        // Load multiple equipment data
        const loadedEquipment = data.equipmentList.map((equipment, index) => ({
          id: index + 1,
          flowrate: equipment.flowrate?.toString() || "",
          width: equipment.width?.toString() || "",
          height: equipment.height?.toString() || "",
          diameter: equipment.diameter?.toString() || "",
          length: equipment.length?.toString() || "",
          coefficientOfFitting: equipment.coefficientOfFitting?.toString() || "0",
          equipmentName: equipment.equipmentName || "",
          calculationResult: equipment.totalPressureLoss
            ? {
                frictionPressureLoss: equipment.frictionPressureLoss,
                fittingPressureLoss: equipment.fittingPressureLoss,
                totalPressureLoss: equipment.totalPressureLoss,
              }
            : null,
        }));
        
        setEquipmentList(loadedEquipment);
        
        // Set total system result if available
        if (data.totalSystemPressureLoss) {
          setTotalSystemResult({
            totalSystemPressureLoss: data.totalSystemPressureLoss,
            equipmentCount: data.equipmentCount,
            successfulCalculations: data.successfulCalculations,
            failedCalculations: data.failedCalculations,
            individualResults: data.equipmentList.map((equipment, index) => ({
              index: index + 1,
              equipmentName: equipment.equipmentName || `Equipment ${index + 1}`,
              frictionPressureLoss: equipment.frictionPressureLoss,
              fittingPressureLoss: equipment.fittingPressureLoss,
              totalPressureLoss: equipment.totalPressureLoss,
            })),
          });
        }
      } else {
        // Fallback for old single equipment format
        setEquipmentList([
          {
            id: 1,
            flowrate: data.flowrate?.toString() || "",
            width: data.width?.toString() || "",
            height: data.height?.toString() || "",
            diameter: data.diameter?.toString() || "",
            length: data.length?.toString() || "",
            coefficientOfFitting: data.coefficientOfFitting?.toString() || "0",
            equipmentName: data.equipmentName || "",
            calculationResult: data.totalPressureLoss
              ? {
                  frictionPressureLoss: data.frictionPressureLoss,
                  fittingPressureLoss: data.fittingPressureLoss,
                  totalPressureLoss: data.totalPressureLoss,
                }
              : null,
          },
        ]);
      }
    }
  }, [savedData]);

  // Update coefficient field visibility based on equipment name
  useEffect(() => {
    const newShowCoefficientField = {};
    equipmentList.forEach((equipment) => {
      const isDuctOrPlenum =
        equipment.equipmentName.toLowerCase().includes("duct") ||
        equipment.equipmentName.toLowerCase().includes("plenum");
      newShowCoefficientField[equipment.id] = !isDuctOrPlenum;
    });
    setShowCoefficientField(newShowCoefficientField);
  }, [equipmentList]);

  const handleEquipmentChange = (id, field, value) => {
    setEquipmentList((prev) =>
      prev.map((equipment) =>
        equipment.id === id ? { ...equipment, [field]: value } : equipment
      )
    );
  };

  const addEquipment = () => {
    const newId = Math.max(...equipmentList.map((e) => e.id)) + 1;
    setEquipmentList((prev) => [
      ...prev,
      {
        id: newId,
        flowrate: "",
        width: "",
        height: "",
        diameter: "",
        length: "",
        coefficientOfFitting: "0",
        equipmentName: "",
        calculationResult: null,
      },
    ]);
  };

  const removeEquipment = (id) => {
    if (equipmentList.length > 1) {
      setEquipmentList((prev) =>
        prev.filter((equipment) => equipment.id !== id)
      );
    }
  };

  const validateEquipment = (equipment) => {
    if (!equipment.flowrate) {
      return "Please enter flowrate";
    }

    const hasWidth = parseFloat(equipment.width) > 0;
    const hasHeight = parseFloat(equipment.height) > 0;
    const hasDiameter = parseFloat(equipment.diameter) > 0;

    if (!hasWidth && !hasHeight && !hasDiameter) {
      return "Please provide either width and height for rectangular ducts, or diameter for round ducts";
    }

    if (hasWidth && hasHeight && !hasDiameter) {
      // Rectangular duct
      if (!hasWidth || !hasHeight) {
        return "Both width and height are required for rectangular ducts";
      }
    } else if (hasDiameter && !hasWidth && !hasHeight) {
      // Round duct
      if (!hasDiameter) {
        return "Diameter is required for round ducts";
      }
    } else {
      return "Please provide either width and height for rectangular ducts, or diameter for round ducts, but not both";
    }

    return null;
  };

  const handleCalculateEquipment = async (equipment) => {
    const error = validateEquipment(equipment);
    if (error) {
      alert(error);
      return;
    }

    try {
      const inputData = {
        flowrate: parseFloat(equipment.flowrate),
        width: parseFloat(equipment.width) || 0,
        height: parseFloat(equipment.height) || 0,
        diameter: parseFloat(equipment.diameter) || 0,
        length: parseFloat(equipment.length) || 0,
        coefficientOfFitting: parseFloat(equipment.coefficientOfFitting) || 0,
        equipmentName: equipment.equipmentName,
      };

      // Calculate locally using the total system endpoint with single equipment
      const response = await calculateTotalSystem({
        equipmentList: [inputData],
      }).unwrap();

      const calculationResult = response.data.individualResults[0];

      // Remove the index and equipmentName from the result to match expected format
      const {
        index,
        equipmentName: resultEquipmentName,
        error: resultError,
        ...cleanResult
      } = calculationResult;

      if (resultError) {
        throw new Error(resultError);
      }

      // Update the equipment with calculation result
      setEquipmentList((prev) =>
        prev.map((eq) =>
          eq.id === equipment.id
            ? { ...eq, calculationResult: cleanResult }
            : eq
        )
      );

      console.log(`Equipment ${equipment.id} calculated successfully`);
    } catch (err) {
      console.error(`Failed to calculate equipment ${equipment.id}:`, err);
      alert(`Failed to calculate equipment ${equipment.id}: ${err.message}`);
    }
  };

  const handleCalculateTotalSystem = async () => {
    // Validate all equipment
    for (const equipment of equipmentList) {
      const error = validateEquipment(equipment);
      if (error) {
        alert(`Equipment ${equipment.id}: ${error}`);
        return;
      }
    }

    try {
      const equipmentData = equipmentList.map((equipment) => ({
        flowrate: parseFloat(equipment.flowrate),
        width: parseFloat(equipment.width) || 0,
        height: parseFloat(equipment.height) || 0,
        diameter: parseFloat(equipment.diameter) || 0,
        length: parseFloat(equipment.length) || 0,
        coefficientOfFitting: parseFloat(equipment.coefficientOfFitting) || 0,
        equipmentName: equipment.equipmentName,
      }));

      const response = await calculateTotalSystem({
        equipmentList: equipmentData,
        project_id: projectId,
      }).unwrap();

      setTotalSystemResult(response.data);
      console.log("Total system calculated successfully");
    } catch (err) {
      console.error("Failed to calculate total system:", err);
      alert("Failed to calculate total system");
    }
  };

  const handleReload = () => {
    setEquipmentList([
      {
        id: 1,
        flowrate: "",
        width: "",
        height: "",
        diameter: "",
        length: "",
        coefficientOfFitting: "0",
        equipmentName: "",
        calculationResult: null,
      },
    ]);
    setTotalSystemResult(null);
  };

  return (
    <div className="flex  h-[90vh] bg-white">
      {/* Left Panel - Input Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              AHU Pressure Drop Calculator
            </h1>
            <div className="flex gap-2">
              <button
                onClick={addEquipment}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Equipment
              </button>
              <button
                onClick={handleReload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <ReloadIcon />
                Reset
              </button>
            </div>
          </div>

          {/* Equipment List */}
          {equipmentList.map((equipment, index) => (
            <div key={equipment.id} className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Equipment {index + 1}
                </h2>
                {equipmentList.length > 1 && (
                  <button
                    onClick={() => removeEquipment(equipment.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Basic Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flowrate (m³/s) *
                  </label>
                  <input
                    type="number"
                    value={equipment.flowrate}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "flowrate",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter flowrate"
                    step="any"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    value={equipment.equipmentName}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "equipmentName",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter equipment name"
                  />
                </div>
              </div>

              {/* Duct Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (m){" "}
                    <span className="text-gray-400">
                      (for rectangular ducts)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={equipment.width}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "width",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter width"
                    step="any"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (m){" "}
                    <span className="text-gray-400">
                      (for rectangular ducts)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={equipment.height}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "height",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter height"
                    step="any"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diameter (m){" "}
                    <span className="text-gray-400">(for round ducts)</span>
                  </label>
                  <input
                    type="number"
                    value={equipment.diameter}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "diameter",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter diameter"
                    step="any"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (m) <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={equipment.length}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "length",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter length"
                    step="any"
                    min="0"
                  />
                </div>
              </div>

              {/* Coefficient of Fitting */}
              {showCoefficientField[equipment.id] && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coefficient of Fitting{" "}
                    <span className="text-gray-400"></span>
                  </label>
                  <input
                    type="number"
                    value={equipment.coefficientOfFitting}
                    onChange={(e) =>
                      handleEquipmentChange(
                        equipment.id,
                        "coefficientOfFitting",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.09"
                    step="any"
                    min="0"
                  />
                </div>
              )}

              {/* Calculate Button for Individual Equipment */}
              <button
                onClick={() => handleCalculateEquipment(equipment)}
                disabled={totalSystemLoading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {totalSystemLoading ? "Calculating..." : "Calculate Equipment"}
              </button>

              {/* Individual Equipment Results */}
              {equipment.calculationResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">
                    Equipment {index + 1} Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <span className="font-medium">
                        Friction Pressure Loss:
                      </span>
                      <span className="ml-2">
                        {equipment.calculationResult.frictionPressureLoss.toFixed(
                          1
                        )}{" "}
                        Pa
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">
                        Fitting Pressure Loss:
                      </span>
                      <span className="ml-2">
                        {equipment.calculationResult.fittingPressureLoss.toFixed(
                          1
                        )}{" "}
                        Pa
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Total Pressure Loss:</span>
                      <span className="ml-2 font-semibold">
                        {equipment.calculationResult.totalPressureLoss.toFixed(
                          1
                        )}{" "}
                        Pa
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Calculate Total System Button */}
          <button
            onClick={handleCalculateTotalSystem}
            disabled={totalSystemLoading}
            className="w-full px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {totalSystemLoading
              ? "Calculating..."
              : "Calculate Total System Pressure Drop"}
          </button>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Results</h2>

        {totalSystemResult && (
          <div className="space-y-6">
            {/* Total System Pressure Loss Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Total System Pressure Loss
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total System Pressure Loss:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {totalSystemResult.totalSystemPressureLoss.toFixed(1)} Pa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total System Pressure Loss:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {(
                      totalSystemResult.totalSystemPressureLoss * 0.00001
                    ).toFixed(6)}{" "}
                    Bar
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Equipment Results */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Equipment Breakdown
              </h3>
              <div className="space-y-4">
                {totalSystemResult.individualResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <h4 className="font-medium text-gray-800 mb-2">
                      {result.equipmentName || `Equipment ${result.index}`}
                    </h4>
                    {result.error ? (
                      <p className="text-red-600 text-sm">{result.error}</p>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Friction Loss:</span>
                          <span>
                            {result.frictionPressureLoss.toFixed(1)} Pa
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fitting Loss:</span>
                          <span>
                            {result.fittingPressureLoss.toFixed(1)} Pa
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-700">Total:</span>
                          <span className="text-blue-600">
                            {result.totalPressureLoss.toFixed(1)} Pa
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* System Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                System Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Equipment:</span>
                  <span>{totalSystemResult.equipmentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Successful Calculations:
                  </span>
                  <span className="text-green-600">
                    {totalSystemResult.successfulCalculations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed Calculations:</span>
                  <span className="text-red-600">
                    {totalSystemResult.failedCalculations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!totalSystemResult && (
          <div className="text-center text-gray-500 py-8">
            <p>Calculate total system pressure drop to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AHU;
