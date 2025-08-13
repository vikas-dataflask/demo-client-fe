import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const ZoomControls = ({
  zoomIn,
  zoomOut,
  resetZoom,
  fitCanvas,
  fitContent,
  toggleMeasurementMode,
  clearMeasurements,
  getZoomPercentage,
  isMeasuring,
  measurements,
  scale,
  minScale = 0.01,
  maxScale = 3,
  showMeasurementTools = true,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  // Determine if we're currently in 3D view
  const is3DView = location.pathname.includes('/3d');
  
  // Get the current 2D page path (file-setup, electrical, hvac, etc.)
  const getCurrent2DPath = () => {
    const path = location.pathname;
    if (path.includes('/file-setup')) return 'file-setup';
    if (path.includes('/electrical')) return 'electrical';
    if (path.includes('/hvac')) return 'hvac';
    if (path.includes('/fire-fight')) return 'fire-fight';
    if (path.includes('/plumbing')) return 'plumbing';
    return 'file-setup'; // default
  };

  const handleToggle3D = () => {
    const current2DPath = getCurrent2DPath();
    
    if (is3DView) {
      // Switch to 2D view
      const basePath = projectId ? `/project/${projectId}` : '';
      navigate(`${basePath}/${current2DPath}`);
    } else {
      // Switch to 3D view
      const basePath = projectId ? `/project/${projectId}` : '';
      navigate(`${basePath}/3d`);
    }
  };

  return (
    <div className={`absolute top-2 left-2 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-2 ${className}`}>
      <div className="zoom-controls flex items-center gap-2">
        {/* Zoom Level Display */}
        <div className="text-sm font-bold text-gray-800 min-w-[50px] text-center">
          {getZoomPercentage()}%
        </div>

        {/* Zoom Out Button */}
        <button
          onClick={zoomOut}
          disabled={scale <= minScale}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border border-gray-300 transition-colors"
          title="Zoom Out (Mouse wheel down)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        {/* Zoom In Button */}
        <button
          onClick={zoomIn}
          disabled={scale >= maxScale}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded border border-gray-300 transition-colors"
          title="Zoom In (Mouse wheel up)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Fit All Button */}
        <button
          onClick={fitCanvas}
          className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors text-xs"
          title="Fit entire canvas in viewport"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span>Fit All</span>
        </button>

        {/* Fit Window Button */}
        <button
          onClick={fitContent}
          className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors text-xs"
          title="Fit content in viewport"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
          <span>Fit Window</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={resetZoom}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 transition-colors text-xs"
          title="Reset zoom to 100%"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset</span>
        </button>

        {/* Measurement Tool */}
        {showMeasurementTools && (
          <>
            <button
              onClick={toggleMeasurementMode}
              className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors text-xs ${
                isMeasuring 
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' 
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
              }`}
              title={isMeasuring ? "Exit measurement mode" : "Start measuring distances"}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
              <span>{isMeasuring ? 'Exit' : 'Measure'}</span>
            </button>

            {/* Clear Measurements */}
            {measurements.length > 0 && (
              <button
                onClick={clearMeasurements}
                className="flex items-center gap-1 px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 transition-colors text-xs"
                title="Clear all measurements"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear</span>
              </button>
            )}
          </>
        )}

        {/* 2D/3D Toggle Button */}
        <button
          onClick={handleToggle3D}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors text-xs ${
            is3DView 
              ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' 
              : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
          }`}
          title={is3DView ? "Switch to 2D View" : "Switch to 3D View"}
        >
          {is3DView ? (
            // 2D icon
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ) : (
            // 3D icon
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
          <span>{is3DView ? '2D' : '3D'}</span>
        </button>
      </div>
    </div>
  );
};

export default ZoomControls; 