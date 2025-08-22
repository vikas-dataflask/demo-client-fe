import React, { useState } from "react";
import DialuxIcon from "../../icons/DialuxIcon";
import { DbDetailsIcon } from "../../icons/DbDetailsIcon";
import { PowerDbDetailsIcon } from "../../icons/PowerDbDetailsIcon";
import BreakerSizingIcon from "../../icons/BreakerSizingIcon";
import CableSizeIcon from "../../icons/CableSizeIcon";
import ElectricalIcon from "../../icons/ElectricalIcon";
import CircuitingIcon from "../../icons/CircuitingIcon";

function SidebarElectrical({ activeSection, setActiveSection }) {
  const [isTesting, setIsTesting] = useState(false);
  
  const sidebarItems = [
    { icon: <DialuxIcon />, id: "dialux" },
    { icon: <CircuitingIcon />, id: "circuiting" },
    { icon: <DbDetailsIcon />, id: "db-details" },
    { icon: <DialuxIcon />, id: "power" },
    { icon: <CircuitingIcon />, id: "power-circuiting" },
    { icon: <PowerDbDetailsIcon />, id: "power-db-details" },
    { icon: <BreakerSizingIcon />, id: "breaker-sizing" },
    { icon: <CableSizeIcon />, id: "cable-size" },
    { icon: <CableSizeIcon />, id: "tray-size" },
    { icon: <ElectricalIcon />, id: "earthmat" },
  ];

  // Test function to check prefill API with 6 IDs
  const testPrefillAPI = async () => {
    setIsTesting(true);
    
    try {
      console.log('🧪 Testing Prefill API with 6 IDs...');
      
      // First, test if the server is reachable
      console.log('🔍 Testing server connectivity...');
      try {
        const healthResponse = await fetch('http://localhost:8000/api/prefill/health');
        console.log('✅ Health check response:', healthResponse.status);
      } catch (healthError) {
        console.error('❌ Health check failed:', healthError.message);
        console.log('💡 Make sure your client backend is running on port 8000');
        console.log('💡 Run: cd demo-client-be && npm start');
        return;
      }
      
      // Test payload with 6 IDs (you can modify these IDs as needed)
      const testPayload = {
        locationId: "68861873a268c23790397a6b",        // Example location ID
        buildingCategoryId: "6884a25c8f56dd2ac4b0fe2b", // Example building category ID
        buildingTypeId: "6884a3fa2f6bdd175a2c3cf1",     // Example building type ID
        disciplineId: "68886b0d58efabd4ef499874",        // Fixed Dialux discipline ID
        subCategoryId: "68886b0d58efabd4ef499879",       // Fixed Dialux subcategory ID
        calculationId: "68886c452e18491568a747d5"         // Fixed Dialux calculation ID
      };
      
      console.log('📤 Test Payload:', testPayload);
      
      // Test the prefill endpoint - use the correct backend port
      const response = await fetch(`http://localhost:8000/api/prefill/prefill-designform?locationId=${testPayload.locationId}&buildingCategoryId=${testPayload.buildingCategoryId}&buildingTypeId=${testPayload.buildingTypeId}`);
      
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Prefill API Response:', result);
      
             if (result.success && result.data) {
         console.log('🎯 Data Found in Database:', result.data);
         console.log('🔍 Factor Room Data:', result.data.factorRoomData);
         console.log('🔍 Calculation Data:', result.data.calculationData);
         console.log('🔍 Building Info:', {
           location: result.data.location,
           buildingCategory: result.data.buildingCategory,
           buildingType: result.data.buildingType
         });
         console.log('🔍 Engineering Info:', {
           discipline: result.data.discipline,
           subCategory: result.data.subCategory,
           calculation: result.data.calculation
         });
         
         // Debug: Log all available fields
         console.log('🔍 All Available Fields:', Object.keys(result.data));
         console.log('🔍 Complete Data Structure:', JSON.stringify(result.data, null, 2));
       } else {
        console.log('⚠️ No data found for the specified IDs');
      }
      
    } catch (error) {
      console.error('❌ Prefill API Test Failed:', error);
      console.error('Error Details:', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Function to set sample project data in localStorage
  const setSampleProjectData = () => {
    const sampleProjectData = {
      locationId: "68861873a268c23790397a6b",
      buildingCategoryId: "6884a25c8f56dd2ac4b0fe2b",
      buildingTypeId: "6884a3fa2f6bdd175a2c3cf1"
    };
    localStorage.setItem('projectData', JSON.stringify(sampleProjectData));
    console.log('✅ Sample project data set in localStorage:', sampleProjectData);
    alert('Sample project data set! Now you can test the blue button.');
  };

  // Test function with custom IDs from localStorage
  const testPrefillAPIWithCustomIDs = async () => {
    setIsTesting(true);
    
    try {
      console.log('🧪 Testing Prefill API with Custom IDs from localStorage...');
      
      // Get project data from localStorage
      let projectData = localStorage.getItem('projectData');
      
      // If no project data exists, create sample data for testing
      if (!projectData) {
        console.log('⚠️ No project data found in localStorage, creating sample data...');
        const sampleProjectData = {
          locationId: "68861873a268c23790397a6b",
          buildingCategoryId: "6884a25c8f56dd2ac4b0fe2b",
          buildingTypeId: "6884a3fa2f6bdd175a2c3cf1"
        };
        localStorage.setItem('projectData', JSON.stringify(sampleProjectData));
        projectData = JSON.stringify(sampleProjectData);
        console.log('✅ Sample project data created:', sampleProjectData);
      }
      
      const { locationId, buildingCategoryId, buildingTypeId } = JSON.parse(projectData);
      
      if (!locationId || !buildingCategoryId || !buildingTypeId) {
        console.log('⚠️ Missing required IDs in localStorage:', { locationId, buildingCategoryId, buildingTypeId });
        return;
      }
      
      // Fixed Dialux IDs
      const dialuxIds = {
        disciplineId: "68886b0d58efabd4ef499874",
        subCategoryId: "68886b0d58efabd4ef499879",
        calculationId: "68886c452e18491568a747d5"
      };
      
      const fullPayload = {
        ...dialuxIds,
        locationId,
        buildingCategoryId,
        buildingTypeId
      };
      
      console.log('📤 Full Test Payload (6 IDs):', fullPayload);
      
      // Test the prefill endpoint - use the correct backend port
      const response = await fetch(`http://localhost:8000/api/prefill/prefill-designform?locationId=${locationId}&buildingCategoryId=${buildingCategoryId}&buildingTypeId=${buildingTypeId}`);
      
      console.log('📥 Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Prefill API Response:', result);
      
      if (result.success && result.data) {
        console.log('🎯 Data Found in Database:', result.data);
        console.log('🔍 Factor Room Data:', result.data.factorRoomData);
        console.log('🔍 Calculation Data:', result.data.calculationData);
        console.log('🔍 Building Info:', {
          location: result.data.location,
          buildingCategory: result.data.buildingCategory,
          buildingType: result.data.buildingType
        });
        console.log('🔍 Engineering Info:', {
          discipline: result.data.discipline,
          subCategory: result.data.subCategory,
          calculation: result.data.calculation
        });
        
                 // Log detailed factor room data if available
         if (result.data.factorRoomData) {
           console.log('🔍 Detailed Factor Room Data:');
           Object.entries(result.data.factorRoomData).forEach(([factorName, rooms]) => {
             console.log(`  ${factorName}:`, rooms);
           });
         }
         
         // Debug: Log all available fields
         console.log('🔍 All Available Fields:', Object.keys(result.data));
         console.log('🔍 Complete Data Structure:', JSON.stringify(result.data, null, 2));
      } else {
        console.log('⚠️ No data found for the specified IDs');
      }
      
    } catch (error) {
      console.error('❌ Prefill API Test Failed:', error);
      console.error('Error Details:', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-[60px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between py-4">
      <div className="flex flex-col items-center gap-6 mt-2">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveSection(item.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition
            ${
              activeSection === item.id
                ? "bg-[#2E90FA] text-white"
                : "text-[#6B7280] hover:bg-gray-200"
            }`}
          >
            {item.icon}
          </div>
        ))}
        
        {/* Test Prefill API Button */}
        <div className="mt-4">
          <button
            onClick={testPrefillAPI}
            disabled={isTesting}
            className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition text-xs font-medium
            ${
              isTesting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            title="Test Prefill API with Hardcoded IDs"
          >
            {isTesting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "🧪"
            )}
          </button>
        </div>
        
        {/* Test Prefill API with Custom IDs Button */}
        <div className="mt-2">
          <button
            onClick={testPrefillAPIWithCustomIDs}
            disabled={isTesting}
            className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition text-xs font-medium
            ${
              isTesting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            title="Test Prefill API with IDs from localStorage"
          >
            {isTesting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "📋"
            )}
          </button>
        </div>
        
        {/* Set Sample Project Data Button */}
        <div className="mt-2">
          <button
            onClick={setSampleProjectData}
            className="w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition text-xs font-medium bg-orange-600 text-white hover:bg-orange-700"
            title="Set Sample Project Data in localStorage"
          >
            📝
          </button>
        </div>
      </div>
    </div>
  );
}

export default SidebarElectrical;
