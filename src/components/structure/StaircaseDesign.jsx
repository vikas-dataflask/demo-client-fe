import React, { useState } from 'react';
import axios from 'axios';

export default function StaircaseDesign({ projectName, activity }) {
  const [formData, setFormData] = useState({
    staircaseType: 'Dog-legged',
    floorHeight: '',
    riserHeight: '',
    treadWidth: '',
    stairWidth: '',
    landingWidth: '',
    liveLoad: '3000',
    floorFinishLoad: '1000',
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
        floorHeight: parseFloat(formData.floorHeight),
        riserHeight: parseFloat(formData.riserHeight),
        treadWidth: parseFloat(formData.treadWidth),
        stairWidth: parseFloat(formData.stairWidth),
        landingWidth: parseFloat(formData.landingWidth),
        liveLoad: parseFloat(formData.liveLoad),
        floorFinishLoad: parseFloat(formData.floorFinishLoad),
        clearCover: parseFloat(formData.clearCover)
      };

      const response = await axios.post(
        '/api/structure/staircase-design',
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Staircase Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staircase Type
              </label>
              <select
                name="staircaseType"
                value={formData.staircaseType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Dog-legged">Dog-legged</option>
                <option value="Open Well">Open Well</option>
                <option value="Quarter Turn">Quarter Turn</option>
                <option value="Half Turn">Half Turn</option>
                <option value="Spiral">Spiral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor Height (mm)
              </label>
              <input
                type="number"
                name="floorHeight"
                value={formData.floorHeight}
                onChange={handleInputChange}
                min="2000"
                max="50000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stair Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Riser Height (mm)
              </label>
              <input
                type="number"
                name="riserHeight"
                value={formData.riserHeight}
                onChange={handleInputChange}
                min="150"
                max="200"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tread Width (mm)
              </label>
              <input
                type="number"
                name="treadWidth"
                value={formData.treadWidth}
                onChange={handleInputChange}
                min="250"
                max="350"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stair Width and Landing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stair Width (mm)
              </label>
              <input
                type="number"
                name="stairWidth"
                value={formData.stairWidth}
                onChange={handleInputChange}
                min="800"
                max="2000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landing Width (mm)
              </label>
              <input
                type="number"
                name="landingWidth"
                value={formData.landingWidth}
                onChange={handleInputChange}
                min="800"
                max="2000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Loads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Load (N/m²)
              </label>
              <input
                type="number"
                name="liveLoad"
                value={formData.liveLoad}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor Finish Load (N/m²)
              </label>
              <input
                type="number"
                name="floorFinishLoad"
                value={formData.floorFinishLoad}
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
              min="15"
              max="25"
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
                  <p><span className="font-medium">Staircase Type:</span> {result.data?.inputParameters?.staircaseType}</p>
                  <p><span className="font-medium">Floor Height:</span> {result.data?.inputParameters?.floorHeight} mm</p>
                  <p><span className="font-medium">Riser Height:</span> {result.data?.inputParameters?.riserHeight} mm</p>
                  <p><span className="font-medium">Tread Width:</span> {result.data?.inputParameters?.treadWidth} mm</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Calculated Results</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Number of Risers:</span> {result.data?.calculatedResults?.numberOfRisers}</p>
                  <p><span className="font-medium">Number of Treads:</span> {result.data?.calculatedResults?.numberOfTreads}</p>
                  <p><span className="font-medium">Total Stair Length:</span> {result.data?.calculatedResults?.totalStairLength?.toFixed(2)} mm</p>
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
