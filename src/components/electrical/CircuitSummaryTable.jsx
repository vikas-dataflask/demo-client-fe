import React from "react";
import { useSelector } from "react-redux";

const CircuitSummaryTable = ({ circuits, onCircuitClick }) => {
  const circuitMapping = useSelector(
    (state) => state.circuiting.circuitMapping
  );
  const phaseColors = useSelector((state) => state.circuiting.phaseColors);

  if (!circuits || circuits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No circuits generated yet</p>
        <p className="text-xs">Generate circuits from the Room Selection tab</p>
      </div>
    );
  }

  const getCircuitColor = (circuit) => {
    if (circuit.phase && phaseColors[circuit.phase]) {
      return phaseColors[circuit.phase];
    }
    return circuit.isEmergency ? "#FF4444" : "#4CAF50";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Circuit Summary</h4>
        <span className="text-xs text-gray-500">
          {circuits.length} circuits
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {circuits.map((circuit) => {
          const circuitColor = getCircuitColor(circuit);

          return (
            <div
              key={circuit.circuitId}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => onCircuitClick && onCircuitClick(circuit)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: circuitColor }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {circuit.displayName || circuit.circuitId}
                  </span>
                  <div className="flex gap-1">
                    {circuit.isEmergency && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Emergency
                      </span>
                    )}
                    {circuit.phase && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Phase {circuit.phase}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {circuit.load || 0}W
                  </div>
                  <div className="text-xs text-gray-600">
                    {circuit.fixtures?.length || 0} fixtures
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Zone:</span>
                  <span className="ml-1">{circuit.zone || "Unknown"}</span>
                </div>
                <div>
                  <span className="font-medium">MCB:</span>
                  <span className="ml-1">{circuit.mcb || "Not set"}</span>
                </div>
                <div>
                  <span className="font-medium">Cable:</span>
                  <span className="ml-1">{circuit.cableSize || "Not set"}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-1">{circuit.status || "draft"}</span>
                </div>
              </div>

              {circuit.fixtures && circuit.fixtures.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">
                    Fixtures: {circuit.fixtures.length}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h5 className="text-xs font-medium text-gray-700 mb-2">
          Summary Statistics
        </h5>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-600">Total Circuits:</span>
            <span className="ml-1 font-medium">{circuits.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Fixtures:</span>
            <span className="ml-1 font-medium">
              {circuits.reduce(
                (total, circuit) => total + (circuit.fixtures?.length || 0),
                0
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Load:</span>
            <span className="ml-1 font-medium">
              {circuits.reduce(
                (total, circuit) => total + (circuit.load || 0),
                0
              )}
              W
            </span>
          </div>
          <div>
            <span className="text-gray-600">Avg Load:</span>
            <span className="ml-1 font-medium">
              {circuits.length > 0
                ? Math.round(
                    circuits.reduce(
                      (total, circuit) => total + (circuit.load || 0),
                      0
                    ) / circuits.length
                  )
                : 0}
              W
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitSummaryTable;
