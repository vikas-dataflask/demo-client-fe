import { FileText, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFloorArea,
  setFloorHeight,
  setFloorLength,
  setFloorVolume,
  setFloorWidth,
} from "../../../redux/features/app/floorSlice";
import { useEffect } from "react";

export default function CreateFloorModal({ setShowModal }) {
  const dispatch = useDispatch();
  const scale = useSelector((state) => state.floor.scale);
  const floor_length = useSelector((state) => state.floor.floor_length);
  const floor_width = useSelector((state) => state.floor.floor_width);
  const floor_height = useSelector((state) => state.floor.floor_height);
  const floor_area = useSelector((state) => state.floor.floor_area);
  const floor_volume = useSelector((state) => state.floor.floor_volume);

  useEffect(() => {
    dispatch(setFloorArea(floor_length * floor_width));
    dispatch(setFloorVolume(floor_length * floor_width * floor_height));
  }, [floor_length, floor_width, floor_height]);

  return (
    <div className="bg-black/50 fixed inset-0 z-40 flex items-center justify-center h-screen">
      <div className="fixed mx-auto z-50 bg-white w-[650px] p-6 rounded shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="text-2xl font-bold textgray-900">
              Add Floor Details
            </div>
            <div className="cursor-pointer" onClick={() => setShowModal(false)}>
              <X />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-500">Length</div>
            <div className="flex items-center gap-2">
              <input
                className="bg-gray-100 w-full p-2 focus:outline-none focus:ring-1 rounded focus:ring-gray-300"
                value={floor_length}
                onChange={(e) => dispatch(setFloorLength(e.target.value))}
              />
              <div className="bg-blue-100 p-2 rounded font-bold text-blue-500">
                {scale}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-500">Width</div>
            <div className="flex items-center gap-2">
              <input
                className="bg-gray-100 w-full p-2 focus:outline-none focus:ring-1 rounded focus:ring-gray-300"
                value={floor_width}
                onChange={(e) => dispatch(setFloorWidth(e.target.value))}
              />
              <div className="bg-blue-100 p-2 rounded font-bold text-blue-500">
                {scale}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-gray-500">Height</div>
            <div className="flex items-center gap-2">
              <input
                className="bg-gray-100 w-full p-2 focus:outline-none focus:ring-1 rounded focus:ring-gray-300"
                value={floor_height}
                onChange={(e) => dispatch(setFloorHeight(e.target.value))}
              />
              <div className="bg-blue-100 p-2 rounded font-bold text-blue-500">
                {scale}
              </div>
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-1">
              <div className="text-xs font-bold text-gray-500">Area</div>
              <div className="bg-gray-100 border border-gray-400 rounded w-full p-2">
                {floor_area}
              </div>
            </div>
            <div className="w-full flex flex-col gap-1">
              <div className="text-xs font-bold text-gray-500">Volume</div>
              <div className="bg-gray-100 border border-gray-400 rounded w-full p-2">
                {floor_volume}
              </div>
            </div>
          </div>
          <div className="flex w-full gap-4 justify-center mt-4">
            <div className="bg-gray-100 flex flex-col gap-2 p-4 items-center w-full rounded text-red-500 font-bold hover:bg-red-500 hover:text-white cursor-pointer">
              <div>
                <FileText />
              </div>
              <div>Upload PDF</div>
            </div>
            <div className="bg-gray-100 flex flex-col gap-2 p-4 items-center w-full rounded text-green-500 font-bold hover:bg-green-500 hover:text-white cursor-pointer">
              <div>
                <FileText />
              </div>
              <div>Upload DWG</div>
            </div>
            <div className="bg-gray-100 flex flex-col gap-2 p-4 items-center w-full rounded text-indigo-500 font-bold hover:bg-indigo-500 hover:text-white cursor-pointer">
              <div>
                <FileText />
              </div>
              <div>Upload DXF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
