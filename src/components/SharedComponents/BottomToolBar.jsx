import { Box, Grid3X3, Minus, Plus, Ruler } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setGrid } from "../../redux/features/app/editorSlice";

export default function BottomToolBar({ X, Y }) {
  const [mode3D, setMode3D] = useState(false);
  const [measurements, setMeasurements] = useState(false);
  const dispatch = useDispatch();
  const grid = useSelector((state) => state.editor.grid);

  const handle3D = () => {
    setMode3D(!mode3D);
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
            mode3D && "bg-blue-700"
          }`}
          onClick={() => handle3D()}
        >
          <Box className="h-4 w-4" />
          <div>View in 3D</div>
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
