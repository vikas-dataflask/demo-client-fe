import React, { useState } from "react";
import PowerCircuitingControlPanel from "./PowerCircuitingControlPanel";
import PowerCircuitingSummaryDisplay from "./PowerCircuitingSummaryDisplay";

const PowerCircuitingPage = () => {
  const [activeTab, setActiveTab] = useState("control"); // "control" or "summary"

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Power Circuiting</h1>
          <p className="text-gray-600">
            Create independent zones and generate power device circuits with RYB phasing - completely separate from lighting circuiting
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("control")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "control"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>⚙️</span>
                  <span>Control Panel</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Circuit Summary</span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "control" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Control Panel */}
              <div>
                <PowerCircuitingControlPanel />
              </div>
              
            </div>
          )}

          {activeTab === "summary" && (
            <div>
              <PowerCircuitingSummaryDisplay />
              
              {/* Back to Control Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab("control")}
                  className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                >
                  ← Back to Control Panel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Information */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Circuit Limits</h4>
              <ul className="space-y-1">
                <li>• Maximum 12 devices per circuit</li>
                <li>• 4 devices per phase (R, Y, B)</li>
                <li>• Automatic circuit incrementation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Labeling System</h4>
              <ul className="space-y-1">
                <li>• Format: PZ[zone]/C[circuit]/[batch][phase]1</li>
                <li>• Example: PZ1/C1/1R1</li>
                <li>• Unique identification per device</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Phase Distribution</h4>
              <ul className="space-y-1">
                <li>• RYB sequence: R → Y → B → R...</li>
                <li>• Balanced load across phases</li>
                <li>• Batch numbering for organization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerCircuitingPage;
