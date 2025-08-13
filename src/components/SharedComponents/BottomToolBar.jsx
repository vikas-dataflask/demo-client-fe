import { Box, Grid3X3, Minus, Plus, Ruler } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { setGrid } from "../../redux/features/app/editorSlice";

export default function BottomToolBar({ X, Y }) {
  const [measurements, setMeasurements] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const grid = useSelector((state) => state.editor.grid);

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

  const handle3D = () => {
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

  const handleGrid = () => {
    dispatch(setGrid(!grid));
  };

  const handleMeasurements = () => {
    setMeasurements(!measurements);
  };
  return (
    <div className="bg-blue-500 text-white text-xs px-4 py-2 flex items-center justify-end font-semibold gap-4">
      <div className="flex gap-1">
        X:
        <div>{X}</div>
      </div>
      <div className="flex gap-1">
        Y:
        <div>{Y}</div>
      </div>
      <div className="flex border-l border-r">
        <div
          className={`flex items-center gap-1 px-2 cursor-pointer ${
            grid && "bg-blue-700"
          }`}
          onClick={() => handleGrid()}
        >
          <Grid3X3 className="h-4 w-4" />
          <div>Grid</div>
        </div>
        <div
          className={`flex items-center gap-1 border-l px-2 cursor-pointer ${
            measurements && "bg-blue-700"
          }`}
          onClick={() => handleMeasurements()}
        >
          <Ruler className="h-4 w-4" />
          <div>Measurements</div>
        </div>
        <div
          className={`flex items-center gap-1 border-l px-2 cursor-pointer ${
            is3DView && "bg-blue-700"
          }`}
          onClick={() => handle3D()}
        >
          <Box className="h-4 w-4" />
          <div>{is3DView ? "2D View" : "3D View"}</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Plus className="h-4 w-4" />
        <div>100%</div>
        <Minus className="h-4 w-4" />
      </div>
    </div>
  );
}
