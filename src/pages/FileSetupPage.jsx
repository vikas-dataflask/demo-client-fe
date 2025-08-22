import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";

import FloorEditor from "../components/FileSetupComponents/FloorEditor/FloorEditor";
import EditorLayout from "../components/SharedComponents/EditorLayout";
import FileSetupSidebar from "../components/FileSetupComponents/FileSetupSidebar";
import RoomEditor from "../components/FileSetupComponents/RoomEditor/roomEditor";
import AreaMarkup from "../components/fileSetup/AreaMarkup";
import DoorMarkup from "../components/fileSetup/DoorMarkup";
import AIFileProcessor from "../components/fileSetup/AIFileProcessor";
import AssignMaterial from "../components/fileSetup/AssignMaterial";
import VediPDFProcessor from "../components/FileSetupComponents/VediPDFProcessor";

export default function FileSetupPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("drawing-file");
  const [open, setOpen] = useState(true);

  console.log("🎯 FileSetupPage: projectId from URL params:", projectId);

  // Use the project data hook
  const {
    floors = [],
    rooms = [],
    currentFloorId,
    isLoading = false,
    error,
    clearProjectData,
    refetchProjectData,
    hasData = false,
  } = useProjectData(projectId);

  // Debug logging for project data
  useEffect(() => {
    console.log("🎯 FileSetupPage: Project data debug:", {
      projectId,
      floorsCount: floors?.length || 0,
      roomsCount: rooms?.length || 0,
      currentFloorId,
      isLoading,
      error,
      hasData,
      floors:
        floors?.map((f) => ({
          id: f.id,
          name: f.name,
          shapesCount: f.shapes?.length || 0,
          shapes: f.shapes,
        })) || [],
    });
  }, [projectId, floors, rooms, currentFloorId, isLoading, error, hasData]);

  // Clear project data when navigating to a different project
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't clear data on page refresh, only on navigation
      console.log("🔄 FileSetupPage: Page unloading, preserving data");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Force refetch on mount to ensure data is loaded
  useEffect(() => {
    if (projectId && !isLoading) {
      console.log("🔄 FileSetupPage: Force refetching project data on mount");
      refetchProjectData();
    }
  }, [projectId, isLoading, refetchProjectData]);

  // Log project data status
  useEffect(() => {
    console.log("📊 FileSetupPage: Project data status:", {
      projectId,
      floorsCount: floors?.length || 0,
      roomsCount: rooms?.length || 0,
      currentFloorId,
      isLoading,
      error,
      hasData,
    });
  }, [
    projectId,
    floors?.length,
    rooms?.length,
    currentFloorId,
    isLoading,
    error,
    hasData,
  ]);

  const renderContent = () => {
    switch (activeSection) {
      case "drawing-file":
        return <FloorEditor open={open} projectId={projectId} />;
      case "area-markup":
        return <AreaMarkup />;
      case "door-markup":
        return <DoorMarkup />;
      case "assign-material":
        return <AssignMaterial />;
      case "ai-file-processor":
        return <AIFileProcessor />;
      case "vedi-pdf-processor":
        return <VediPDFProcessor />;

      default:
        return <FloorEditor open={open} projectId={projectId} />;
    }
  };

  return (
    <EditorLayout>
      <div className="flex h-full overflow-hidden">
        <FileSetupSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setOpen={setOpen}
          open={open}
        />
        <div className="flex overflow-y-auto">
          {/* Debug panel for testing */}
          {/* {process.env.NODE_ENV === 'development' && (
             <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
               <h3 className="text-sm font-semibold mb-2">Debug Panel</h3>
               <div className="space-y-2 text-xs">
                 <div>Project ID: {projectId}</div>
                 <div>Floors: {floors?.length || 0}</div>
                 <div>Rooms: {rooms?.length || 0}</div>
                 <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                 <div>Error: {error ? 'Yes' : 'No'}</div>
                                   {error && (
                    <div className="text-red-600 text-xs max-w-48 break-words">
                      Error: {typeof error === 'string' ? error : error?.message || error?.data?.message || 'Unknown error'}
                    </div>
                  )}
                                   <button 
                    onClick={refetchProjectData}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Refetch Data
                  </button>
                  <button 
                    onClick={() => {
                      console.log('🧪 Manual API test triggered');
                      console.log('🧪 Current state:', { projectId, floors, currentFloorId, isLoading });
                      refetchProjectData();
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    Test API
                  </button>
                  <button 
                    onClick={async () => {
                      console.log('🧪 Direct API test triggered');
                      try {
                        const user = JSON.parse(localStorage.getItem('user'));
                        const token = user?.token;
                        console.log('🧪 Token:', token ? 'Present' : 'Missing');
                        
                        const response = await fetch(`http://localhost:8000/api/floors?projectId=${projectId}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        const data = await response.json();
                        console.log('🧪 Direct API response:', data);
                        console.log('🧪 Response status:', response.status);
                      } catch (error) {
                        console.error('🧪 Direct API error:', error);
                      }
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-1"
                  >
                    Direct API Test
                  </button>
               </div>
             </div>
           )} */}

          {renderContent()}
        </div>
      </div>
    </EditorLayout>
  );
}
