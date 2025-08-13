import React from "react";
import { useDispatch } from "react-redux";
import { generatePowerCircuits } from "../../redux/features/app/powerCircuitingSlice";

const PowerCircuitingDemo = () => {
  const dispatch = useDispatch();

  // Example data matching your specification
  const exampleDevices = [
    { name: "Switch 6A", quantity: 2, room: "Room1", watt: 60 },
    { name: "Socket 5A", quantity: 3, room: "Room1", watt: 40 },
    { name: "USB Socket", quantity: 1, room: "Room1", watt: 1150 },
    { name: "Dimmer 16A", quantity: 2, room: "Room2", watt: 2208 },
    { name: "Timer Switch", quantity: 1, room: "Room2", watt: 5 },
    { name: "Socket 10A", quantity: 4, room: "Room3", watt: 1840 }
  ];

  const handleDemoGeneration = () => {
    // Generate circuits for Zone 1
    dispatch(generatePowerCircuits({
      zoneId: "Zone 1",
      devices: exampleDevices
    }));

    alert("Demo circuits generated for Zone 1! Check the Circuit Summary tab to see the results.");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Power Circuiting Demo</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">
          This demo shows how the power circuiting system works with example data:
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Example Devices:</h4>
          <div className="space-y-2 text-sm">
            {exampleDevices.map((device, index) => (
              <div key={index} className="flex justify-between text-gray-600">
                <span>{device.name} ({device.quantity} units)</span>
                <span>{device.watt}W each</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Devices:</span>
              <span>{exampleDevices.reduce((sum, d) => sum + d.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total Power:</span>
              <span>{exampleDevices.reduce((sum, d) => sum + (d.watt * d.quantity), 0)}W</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDemoGeneration}
        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
      >
        🚀 Generate Demo Circuits
      </button>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">What This Demo Will Show:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Automatic RYB phasing (R → Y → B → R...)</li>
          <li>• Max 12 devices per circuit (4R, 4Y, 4B)</li>
          <li>• Label format: PZ1/C1/1R1, PZ1/C1/1Y1, PZ1/C1/1B1...</li>
          <li>• New circuits when 12 devices limit is reached</li>
          <li>• Batch numbering for organization</li>
        </ul>
      </div>
    </div>
  );
};

export default PowerCircuitingDemo;
