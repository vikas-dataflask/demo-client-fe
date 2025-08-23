import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ShearWallDesign({ projectName, activity }) {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    wallType: 'Rectangular',
    wallLength: '',
    wallThickness: '',
    wallHeight: '',
    axialLoad: '',
    shearForce: '',
    bendingMoment: '',
    concreteGrade: 'M25',
    steelGrade: 'Fe 415',
    clearCover: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Check if user is logged in
  const checkAuthStatus = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return false;
    }
    try {
      const user = JSON.parse(storedUser);
      return user && user.token;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('user');
      return false;
    }
  };

  // Check if project ID is available
  const checkProjectStatus = () => {
    return projectId && projectId !== 'undefined' && projectId !== 'null';
  };

  // Check authentication and project status on component mount
  useEffect(() => {
    const authStatus = checkAuthStatus();
    const projectStatus = checkProjectStatus();
    
    if (!authStatus) {
      console.log('⚠️ User not authenticated in ShearWallDesign component');
    } else {
      console.log('✅ User authenticated in ShearWallDesign component');
    }
    
    if (!projectStatus) {
      console.log('⚠️ Project ID not available in ShearWallDesign component');
    } else {
      console.log('✅ Project ID available in ShearWallDesign component:', projectId);
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        ...formData,
        projectId: projectId || 'default-project-id',
        // Map frontend field names to backend expected names
        wallLength: parseFloat(formData.wallLength),
        wallThickness: parseFloat(formData.wallThickness),
        wallHeight: parseFloat(formData.wallHeight),
        axialLoad: parseFloat(formData.axialLoad),
        lateralLoad: parseFloat(formData.shearForce),        // shearForce → lateralLoad
        clearCover: parseFloat(formData.clearCover),
        
        // Add missing required fields with sensible defaults
        numberOfStoreys: 5,                                 // Default 5 storeys
        seismicZone: 'III',                                 // Default Zone III
        importanceFactor: 1.0,                              // Default 1.0
        responseReductionFactor: 3.0,                       // Default 3.0
        soilType: 'Type II',                                // Default Type II
        totalBuildingWeight: 50000,                         // Default 50000 kN
        mainBarDiameter: 16,                                // Default 16mm
        horizontalBarDiameter: 12                           // Default 12mm
      };

      // Get token from localStorage (stored in user object)
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          token = user.token;
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          localStorage.removeItem('user');
        }
      }

      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      if (!projectId) {
        setError('Project ID not available. Please ensure you\'re accessing this page from a valid project.');
        setLoading(false);
        return;
      }

      console.log('🔑 Token found:', token ? 'Yes' : 'No');
      console.log('📁 Project ID:', projectId);
      console.log('🌐 Making API call to:', 'http://localhost:8000/api/structure/shear-wall-design');
      console.log('📤 Payload:', payload);

      const response = await axios.post(
        'http://localhost:8000/api/structure/shear-wall-design',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error('❌ Shear wall design calculation error:', err);
      console.error('❌ Error response:', err.response);
      
      if (err.response?.status === 400 && err.response?.data?.message === 'Invalid token') {
        setError('Authentication failed. Please login again and try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred during calculation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shear Wall Design</h2>
        
        {/* Check authentication and project status */}
        {(() => {
          const isAuthenticated = checkAuthStatus();
          const hasProjectId = checkProjectStatus();
          const canSubmit = isAuthenticated && hasProjectId;
          
          return (
            <>
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    You are not authenticated. Please login to use this feature.
                  </div>
                </div>
              )}

              {!hasProjectId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Project ID not available. Please ensure you're accessing this page from a valid project.
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6" style={{ opacity: canSubmit ? 1 : 0.5 }}>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wall Type
                    </label>
                    <select
                      name="wallType"
                      value={formData.wallType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Rectangular">Rectangular</option>
                      <option value="L-Shaped">L-Shaped</option>
                      <option value="T-Shaped">T-Shaped</option>
                      <option value="C-Shaped">C-Shaped</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wall Height (mm)
                    </label>
                    <input
                      type="number"
                      name="wallHeight"
                      value={formData.wallHeight}
                      onChange={handleInputChange}
                      min="1000"
                      max="50000"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Wall Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wall Length (mm)
                    </label>
                    <input
                      type="number"
                      name="wallLength"
                      value={formData.wallLength}
                      onChange={handleInputChange}
                      min="1000"
                      max="20000"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wall Thickness (mm)
                    </label>
                    <input
                      type="number"
                      name="wallThickness"
                      value={formData.wallThickness}
                      onChange={handleInputChange}
                      min="150"
                      max="500"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Loads */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Axial Load (kN)
                    </label>
                    <input
                      type="number"
                      name="axialLoad"
                      value={formData.axialLoad}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shear Force (kN)
                    </label>
                    <input
                      type="number"
                      name="shearForce"
                      value={formData.shearForce}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bending Moment (kN-m)
                    </label>
                    <input
                      type="number"
                      name="bendingMoment"
                      value={formData.bendingMoment}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Material Properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Concrete Grade
                    </label>
                    <select
                      name="concreteGrade"
                      value={formData.concreteGrade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="M20">M20</option>
                      <option value="M25">M25</option>
                      <option value="M30">M30</option>
                      <option value="M35">M35</option>
                      <option value="M40">M40</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Steel Grade
                    </label>
                    <select
                      name="steelGrade"
                      value={formData.steelGrade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Fe 415">Fe 415</option>
                      <option value="Fe 500">Fe 500</option>
                    </select>
                  </div>
                </div>

                {/* Cover */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clear Cover (mm)
                  </label>
                  <input
                    type="number"
                    name="clearCover"
                    value={formData.clearCover}
                    onChange={handleInputChange}
                    min="20"
                    max="50"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Calculating...' : !canSubmit ? (!isAuthenticated ? 'Login Required' : 'Project Required') : 'Calculate Design'}
                  </button>
                </div>
              </form>
            </>
          );
        })()}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Design Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Input Parameters</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Wall Type:</span> {result.data?.inputParameters?.wallType}</p>
                  <p><span className="font-medium">Length:</span> {result.data?.inputParameters?.wallLength} mm</p>
                  <p><span className="font-medium">Thickness:</span> {result.data?.inputParameters?.wallThickness} mm</p>
                  <p><span className="font-medium">Height:</span> {result.data?.inputParameters?.wallHeight} mm</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Calculated Results</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Wall Area:</span> {result.data?.calculatedResults?.wallArea?.toFixed(2)} mm²</p>
                  <p><span className="font-medium">Slenderness Ratio:</span> {result.data?.calculatedResults?.slendernessRatio?.toFixed(2)}</p>
                  <p><span className="font-medium">Design Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      result.data?.calculatedResults?.designStatus === 'Pass' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.data?.calculatedResults?.designStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
