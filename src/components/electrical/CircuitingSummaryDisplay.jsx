import React from 'react';
import { useSelector } from 'react-redux';
import { 
  selectCircuitingSummary, 
  selectTotalZones, 
  selectTotalFixtures 
} from '../../redux/features/app/circuitingSummarySlice';

const CircuitingSummaryDisplay = () => {
  // Use the new permanent circuiting summary slice
  const circuitingSummary = useSelector(selectCircuitingSummary);
  const totalZones = useSelector(selectTotalZones);
  const totalFixtures = useSelector(selectTotalFixtures);
  
  // Check if we have any data
  const hasData = Object.keys(circuitingSummary).length > 0;
  
  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No circuiting summary available</p>
        <p className="text-xs">Generate circuits for zones to see the summary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
             <div className="flex items-center justify-between">
         <h3 className="text-lg font-semibold text-gray-800">Circuiting Summary</h3>
         <span className="text-sm text-gray-500">
           {totalZones} zone(s) • {totalFixtures} total fixtures
         </span>
       </div>

             {/* Render zones from permanent circuiting summary */}
       {Object.entries(circuitingSummary).map(([zoneId, fixtures]) => (
         <div key={zoneId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
           {/* Zone Header */}
           <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
             <div className="flex items-center justify-between">
               <div>
                 <h4 className="text-md font-semibold text-blue-800">
                   {zoneId}
                 </h4>
                 <p className="text-sm text-blue-600">
                   {fixtures.length} fixtures
                 </p>
               </div>
               <div className="text-right">
                 <div className="text-xs text-blue-600">
                   Permanent Summary
                 </div>
                 <div className="text-xs text-blue-500">
                   Circuiting completed
                 </div>
               </div>
             </div>
           </div>

          {/* Fixture Labels Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fixture #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Circuit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                </tr>
              </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                 {fixtures.map((label, index) => {
                  // Parse the label: Z1/C1/1R1
                  const parts = label.split('/');
                  const zonePart = parts[0]; // Z1
                  const circuitPart = parts[1]; // C1
                  const batchPhasePart = parts[2]; // 1R1
                  
                  // Extract batch number and phase
                  const batchMatch = batchPhasePart.match(/(\d+)([RYB])(\d+)/);
                  const batchNumber = batchMatch ? batchMatch[1] : '';
                  const phase = batchMatch ? batchMatch[2] : '';
                  const phaseNum = batchMatch ? batchMatch[3] : '';
                  
                  // Get phase color
                  const phaseColors = {
                    'R': '#FF4444',
                    'Y': '#FFAA00',
                    'B': '#4444FF'
                  };
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-900">
                        {label}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {circuitPart}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {batchNumber}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: phaseColors[phase] || '#999' }}
                          ></div>
                          <span className="text-gray-600">
                            {phase}{phaseNum}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

                     {/* Zone Summary */}
           <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <span className="text-gray-600">Total Fixtures:</span>
                 <span className="ml-2 font-medium">
                   {fixtures.length}
                 </span>
               </div>
               <div>
                 <span className="text-gray-600">Status:</span>
                 <span className="ml-2 font-medium text-green-600">
                   Completed
                 </span>
               </div>
             </div>
           </div>
                 </div>
       ))}
     </div>
   );
 };

export default CircuitingSummaryDisplay;
