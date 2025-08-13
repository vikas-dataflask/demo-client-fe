// import React from 'react';
// import { useSelector } from 'react-redux';

// const ProjectDataMonitor = ({ projectId }) => {
//   const floorState = useSelector(state => state.floor);
//   const roomState = useSelector(state => state.rooms);
  
//   const floors = floorState.floors || [];
//   const rooms = roomState.rooms || [];
  
//   return (
//     <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
//       <h3 className="text-sm font-semibold text-gray-800 mb-2">Project Data Monitor</h3>
      
//       <div className="space-y-2 text-xs">
//         <div className="flex justify-between">
//           <span className="text-gray-600">Project ID:</span>
//           <span className="font-mono text-gray-800">{projectId || 'None'}</span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Floor Project ID:</span>
//           <span className="font-mono text-gray-800">{floorState.currentProjectId || 'None'}</span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Room Project ID:</span>
//           <span className="font-mono text-gray-800">{roomState.currentProjectId || 'None'}</span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Floors:</span>
//           <span className={`font-semibold ${floors.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
//             {floors.length}
//           </span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Rooms:</span>
//           <span className={`font-semibold ${rooms.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
//             {rooms.length}
//           </span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Current Floor:</span>
//           <span className="font-mono text-gray-800">{floorState.currentFloorId || 'None'}</span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Floor Loading:</span>
//           <span className={`font-semibold ${floorState.isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
//             {floorState.isLoading ? '⏳' : '✅'}
//           </span>
//         </div>
        
//         <div className="flex justify-between">
//           <span className="text-gray-600">Room Loading:</span>
//           <span className={`font-semibold ${roomState.isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
//             {roomState.isLoading ? '⏳' : '✅'}
//           </span>
//         </div>
        
//         {(floorState.error || roomState.error) && (
//           <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
//             <div className="font-semibold">Errors:</div>
//             {floorState.error && <div>Floor: {floorState.error}</div>}
//             {roomState.error && <div>Room: {roomState.error}</div>}
//           </div>
//         )}
        
//         <div className="mt-2 pt-2 border-t border-gray-200">
//           <div className="text-xs text-gray-500">
//             Last updated: {new Date().toLocaleTimeString()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDataMonitor; 