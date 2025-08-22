import React, { useState } from 'react';
import axios from 'axios';

export default function BeamDesign({ projectName, activity }) {
  const [formData, setFormData] = useState({
    beamType: 'Simply Supported',
    spanLength: '',
    beamWidth: '',
    beamDepth: '',
    concreteGrade: 'M25',
    steelGrade: 'Fe 415',
    liveLoad: '',
    floorFinishLoad: '',
    superimposedLoad: '',
    coverToSteel: ''
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
        projectId: 'default-project-id', // This should come from context or props
        spanLength: parseFloat(formData.spanLength),
        beamWidth: parseFloat(formData.beamWidth),
        beamDepth: parseFloat(formData.beamDepth),
        liveLoad: parseFloat(formData.liveLoad),
        floorFinishLoad: parseFloat(formData.floorFinishLoad),
        superimposedLoad: parseFloat(formData.superimposedLoad) || 0,
        coverToSteel: parseFloat(formData.coverToSteel)
      };

      const response = await axios.post(
        `http://localhost:8000/api/structure/beam-design`,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Beam Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beam Type
              </label>
              <select
                name="beamType"
                value={formData.beamType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Simply Supported">Simply Supported</option>
                <option value="Continuous">Continuous</option>
                <option value="Cantilever">Cantilever</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Span Length (m)
              </label>
              <input
                type="number"
                name="spanLength"
                value={formData.spanLength}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Beam Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beam Width (mm)
              </label>
              <input
                type="number"
                name="beamWidth"
                value={formData.beamWidth}
                onChange={handleInputChange}
                min="150"
                max="1000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beam Depth (mm)
              </label>
              <input
                type="number"
                name="beamDepth"
                value={formData.beamDepth}
                onChange={handleInputChange}
                min="200"
                max="2000"
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

          {/* Loads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Load (kN/m²)
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
                Floor Finish Load (kN/m²)
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Superimposed Load (kN/m²)
              </label>
              <input
                type="number"
                name="superimposedLoad"
                value={formData.superimposedLoad}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover to Steel (mm)
            </label>
            <input
              type="number"
              name="coverToSteel"
              value={formData.coverToSteel}
              onChange={handleInputChange}
              min="20"
              max="75"
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
                  <p><span className="font-medium">Beam Type:</span> {result.data?.inputParameters?.beamType}</p>
                  <p><span className="font-medium">Span Length:</span> {result.data?.inputParameters?.spanLength} m</p>
                  <p><span className="font-medium">Beam Width:</span> {result.data?.inputParameters?.beamWidth} mm</p>
                  <p><span className="font-medium">Beam Depth:</span> {result.data?.inputParameters?.beamDepth} mm</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Calculated Results</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Ultimate Moment:</span> {result.data?.calculatedResults?.ultimateBendingMoment?.toFixed(2)} kN-m</p>
                  <p><span className="font-medium">Ultimate Shear:</span> {result.data?.calculatedResults?.ultimateShearForce?.toFixed(2)} kN</p>
                  <p><span className="font-medium">Required Steel:</span> {result.data?.calculatedResults?.requiredFlexuralSteel?.toFixed(2)} mm²</p>
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

            {/* Design Checks */}
            {result.data?.calculatedResults?.checks && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Design Checks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.data.calculatedResults.checks).map(([checkName, checkData]) => (
                    <div key={checkName} className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {checkName.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        checkData.status === 'Pass' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {checkData.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
