import {
  CloudUpload,
  Info,
  LaptopMinimal,
  LaptopMinimalCheck,
  Plus,
  FileText,
} from "lucide-react";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  setScale,
  setFloorLength,
  setFloorWidth,
  setFloorHeight,
  setFloorArea,
  setFloorVolume,
  setFloorDxf,
} from "../../../redux/features/app/floorSlice";
import { useGetDxfEntitiesMutation } from "../../../redux/features/api/api";

const FloorEditorSidebar = () => {
  const [parseDxf] = useGetDxfEntitiesMutation();
  const [updated, setUpdated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const floorLength = useSelector((state) => state.floor.floor_length);
  const floorWidth = useSelector((state) => state.floor.floor_width);
  const floorHeight = useSelector((state) => state.floor.floor_height);
  const floorArea = useSelector((state) => state.floor.floor_area);
  const floorVolume = useSelector((state) => state.floor.floor_volume);
  const floorDxf = useSelector((state) => state.floor.floor_dxf);
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".dxf")) {
      setSelectedFile(file);
      setIsUploading(true);
    }
    const form = new FormData();
    form.append("dxf_file", file);
    try {
      const response = await parseDxf(form).unwrap();
      console.log("DXF Entities:", response);
      console.log("DXF Response structure:", {
        hasResponse: !!response,
        keys: response ? Object.keys(response) : [],
        dxfEntities: response?.dxf_entities,
        dxfEntitiesLength: response?.dxf_entities?.length,
        dxfLayers: response?.dxf_layers,
        dxfBlocks: response?.dxf_blocks,
      });

      // Extract the actual DXF data from the response
      const dxfData = response?.dxf || response;
      console.log("Extracted DXF data:", dxfData);
      console.log("Extracted DXF data structure:", {
        hasDxfData: !!dxfData,
        keys: dxfData ? Object.keys(dxfData) : [],
        dxfEntities: dxfData?.dxf_entities,
        dxfEntitiesLength: dxfData?.dxf_entities?.length,
        dxfLayers: dxfData?.dxf_layers,
        dxfLayersLength: dxfData?.dxf_layers?.length,
        dxfBlocks: dxfData?.dxf_blocks,
        dxfBlocksKeys: dxfData?.dxf_blocks
          ? Object.keys(dxfData.dxf_blocks)
          : [],
        fullDxfData: JSON.stringify(dxfData, null, 2),
      });

      dispatch(setFloorDxf(dxfData));
      console.log("Dispatched setFloorDxf with:", dxfData);

      setIsUploading(false);
      setUpdated(true);
    } catch (error) {
      console.error("Error parsing DXF file:", error);
      setIsUploading(false);
    }
  };
  return (
    <div className="fixed bg-white w-[450px] h-[87.9vh] z-50 border-r border-gray-300">
      <div className="mt-6 mx-4 flex flex-col gap-4">
        <div className="border-b border-gray-300 pb-4 flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">Floor Editor</div>
            {updated ? (
              <div className="flex items-center gap-2">
                <LaptopMinimalCheck className="text-green-500 h-4 w-4" />
                <div className="text-xs font-semibold text-green-500">
                  Updated Now
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LaptopMinimal className="text-red-500 h-4 w-4" />
                <div className="text-xs font-semibold text-red-500">
                  Waiting for Input
                </div>
              </div>
            )}
          </div>
          <div>
            <Info />
          </div>
        </div>
        {/* DXF Upload Section */}
        <div className="border-b border-gray-300 pb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            DXF Drawing
          </div>
          <div
            className={`flex gap-2 justify-center items-center bg-gray-200 p-2 text-gray-500 font-semibold rounded ${
              !selectedFile &&
              !isUploading &&
              "hover:bg-blue-500 hover:text-white"
            } cursor-pointer relative`}
          >
            {isUploading ? (
              <>
                <div>Uploading...</div>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </>
            ) : selectedFile ? (
              <>
                <div>{selectedFile.name}</div>
                <FileText className="h-4 w-4" />
              </>
            ) : (
              <>
                <div>Upload DXF file</div>
                <CloudUpload className="h-4 w-4" />
              </>
            )}

            {!isUploading && (
              <input
                type="file"
                accept=".dxf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </div>

          {hasDxfEntities && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
              <FileText className="h-3 w-3" />
              <span>{floorDxf.entities.length} entities loaded</span>
            </div>
          )}
        </div>
        {/* <div
          className={`flex gap-2 justify-center items-center bg-gray-200 p-2 text-gray-500 font-semibold rounded ${
            !selectedFile && "hover:bg-blue-500 hover:text-white"
          }  cursor-pointer`}
        > */}
        {/* <div>Upload a drawing</div>
          {selectedFile ? selectedFile.name : "Upload file"}
          {!selectedFile && (
            <input
              type="file"
              accept=".dxf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          )}

          <CloudUpload />
        </div> */}
        <div>
          <div className="text-xs text-gray-500 font-semibold">Scale</div>
          <div>
            <select
              className="w-full bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-0"
              onChange={(e) => dispatch(setScale(e.target.value))}
            >
              <option>m</option>
              <option>mm</option>
              <option>cm</option>
              <option>ft</option>
              <option>inch</option>
              <option>sq yd</option>
            </select>
          </div>
        </div>
        w{" "}
        <div className="flex flex-col gap-4 border p-4 rounded border-gray-300">
          <div className="">
            <div className="text-xs text-gray-500 font-semibold">Length</div>
            <div className="bg-gray-100 border border-gray-300 p-2 rounded">
              {floorLength}
            </div>
          </div>
          <div className="">
            <div className="text-xs text-gray-500 font-semibold">Width</div>
            <div className="bg-gray-100 border border-gray-300 p-2 rounded">
              {floorWidth}
            </div>
          </div>
          <div className="">
            <div className="text-xs text-gray-500 font-semibold">Height</div>
            <input
              type="number"
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded outline-none focus:ring-1 focus:ring-blue-500"
              value={floorHeight}
              onChange={(e) => {
                const newHeight = parseFloat(e.target.value || 0);
                dispatch(setFloorHeight(newHeight));

                // Optional: Recalculate volume and area if length & width exist
                const length = parseFloat(floorLength || 0);
                const width = parseFloat(floorWidth || 0);
                const area = length * width;
                const volume = area * newHeight;

                dispatch(setFloorArea(area.toFixed(2)));
                dispatch(setFloorVolume(volume.toFixed(2)));
              }}
            />
          </div>

          <div className="">
            <div className="text-xs text-gray-500 font-semibold">Area</div>
            <div className="bg-gray-100 border border-gray-300 p-2 rounded">
              {floorArea}
            </div>
          </div>
          <div className="">
            <div className="text-xs text-gray-500 font-semibold">Volume</div>
            <div className="bg-gray-100 border border-gray-300 p-1 rounded">
              {floorVolume}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorEditorSidebar;
