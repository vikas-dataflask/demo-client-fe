import React, { useState } from 'react';
import axios from 'axios';

export default function ShearWallDesign({ projectName, activity }) {
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
        projectId: 'default-project-id',
        wallLength: parseFloat(formData.wallLength),
        wallThickness: parseFloat(formData.wallThickness),
        wallHeight: parseFloat(formData.wallHeight),
        axialLoad: parseFloat(formData.axialLoad),
        shearForce: parseFloat(formData.shearForce),
        bendingMoment: parseFloat(formData.bendingMoment),
        clearCover: parseFloat(formData.clearCover)
      };

      const response = await axios.post(
        'http://localhost:8000/api/structure/shear-wall-design',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during calculation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shear Wall Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate Design'}
            </button>
          </div>
        </form>

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
