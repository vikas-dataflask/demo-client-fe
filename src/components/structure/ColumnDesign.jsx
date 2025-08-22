import React, { useState } from 'react';
import axios from 'axios';

export default function ColumnDesign({ projectName, activity }) {
  const [formData, setFormData] = useState({
    columnType: 'Axial Load Only',
    columnWidth: '',
    columnDepth: '',
    effectiveLength: '',
    axialLoad: '',
    moment: '',
    concreteGrade: 'M25',
    steelGrade: 'Fe 415',
    clearCover: '',
    numberOfBars: '',
    barDiameter: ''
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
        columnWidth: parseFloat(formData.columnWidth),
        columnDepth: parseFloat(formData.columnDepth),
        effectiveLength: parseFloat(formData.effectiveLength),
        axialLoad: parseFloat(formData.axialLoad),
        moment: parseFloat(formData.moment) || 0,
        clearCover: parseFloat(formData.clearCover),
        numberOfBars: parseFloat(formData.numberOfBars) || 4,
        barDiameter: parseFloat(formData.barDiameter) || 16
      };

      const response = await axios.post(
        `/api/structure/column-design`,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Column Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Type
              </label>
              <select
                name="columnType"
                value={formData.columnType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Axial Load Only">Axial Load Only</option>
                <option value="Uniaxial Bending">Uniaxial Bending</option>
                <option value="Biaxial Bending">Biaxial Bending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Length (m)
              </label>
              <input
                type="number"
                name="effectiveLength"
                value={formData.effectiveLength}
                onChange={handleInputChange}
                step="0.1"
                min="0.5"
                max="20"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Column Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Width (mm)
              </label>
              <input
                type="number"
                name="columnWidth"
                value={formData.columnWidth}
                onChange={handleInputChange}
                min="150"
                max="1000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Column Depth (mm)
              </label>
              <input
                type="number"
                name="columnDepth"
                value={formData.columnDepth}
                onChange={handleInputChange}
                min="150"
                max="1000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Loads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Moment (kN-m)
              </label>
              <input
                type="number"
                name="moment"
                value={formData.moment}
                onChange={handleInputChange}
                min="0"
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

          {/* Reinforcement Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                max="75"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Bars
              </label>
              <input
                type="number"
                name="numberOfBars"
                value={formData.numberOfBars}
                onChange={handleInputChange}
                min="4"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bar Diameter (mm)
              </label>
              <select
                name="barDiameter"
                value={formData.barDiameter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="8">8</option>
                <option value="10">10</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="32">32</option>
                <option value="40">40</option>
              </select>
            </div>
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
                  <p><span className="font-medium">Column Type:</span> {result.data?.inputParameters?.columnType}</p>
                  <p><span className="font-medium">Width:</span> {result.data?.inputParameters?.columnWidth} mm</p>
                  <p><span className="font-medium">Depth:</span> {result.data?.inputParameters?.columnDepth} mm</p>
                  <p><span className="font-medium">Axial Load:</span> {result.data?.inputParameters?.axialLoad} kN</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Calculated Results</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Slenderness Ratio:</span> {result.data?.calculatedResults?.slendernessRatio?.toFixed(2)}</p>
                  <p><span className="font-medium">Required Steel:</span> {result.data?.calculatedResults?.requiredSteelArea?.toFixed(2)} mm²</p>
                  <p><span className="font-medium">Steel Percentage:</span> {result.data?.calculatedResults?.steelPercentage?.toFixed(2)}%</p>
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
