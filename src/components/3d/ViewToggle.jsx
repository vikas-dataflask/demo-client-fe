import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ViewToggle = ({ currentView = '2d', onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleToggle = () => {
    if (onToggle) {
      // If onToggle is provided, use it (for in-page toggling)
      onToggle();
    } else {
      // Otherwise, navigate to the appropriate 3D page
      const basePath = projectId ? `/project/${projectId}` : '';
      navigate(`${basePath}/3d`);
    }
  };

  const getCurrentPath = () => {
    const path = window.location.pathname;
    if (path.includes('/file-setup')) return 'file-setup';
    if (path.includes('/electrical')) return 'electrical';
    if (path.includes('/hvac')) return 'hvac';
    if (path.includes('/fire-fight')) return 'fire-fight';
    if (path.includes('/plumbing')) return 'plumbing';
    if (path.includes('/3d')) return '3d';
    return 'unknown';
  };

  const currentPath = getCurrentPath();
  const is3DView = currentPath === '3d';

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
          ${is3DView 
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-400'
          }
          shadow-sm hover:shadow-md
        `}
        title={is3DView ? 'Switch to 2D View' : 'Switch to 3D View'}
      >
        <div className="flex items-center space-x-2">
          {is3DView ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">2D</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">3D</span>
            </>
          )}
        </div>
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50">
          {is3DView ? 'Switch to 2D View' : 'Switch to 3D View'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default ViewToggle; 