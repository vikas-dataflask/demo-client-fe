import { useParams } from "react-router-dom";
import { useGetProjectListByIdQuery } from "../../redux/features/api/api";
import { useSelector } from "react-redux";
import DrawingFileSideBar from "./DrawingFileSideBar";
import EntityRenderer from "../../drawing/EntityRender";
import FloorPlanEditor from "../../drawing/FloorPlanEditor";

const DrawingFile = () => {
  const { projectId } = useParams();
  const { data, isLoading, isError } = useGetProjectListByIdQuery(projectId);

  const entities = data?.dxf_entities || [];
  const blocks = data?.dxf_blocks || {};
  const layers = data?.dxf_layers || {};

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading project.</div>;

  return (
    <div className="flex ">
      <div className="w-[340px] bg-white border-r border-gray-300 px-2 font-sans text-[13px] text-[#4B5563] overflow-auto">
        <DrawingFileSideBar />
      </div>
      <div className="flex-1 h-full">
        {entities.length > 0 ? (
          <EntityRenderer entities={entities} blocks={blocks} layers={layers} />
        ) : (
          <FloorPlanEditor />
        )}
      </div>
    </div>
  );
};

export default DrawingFile;
