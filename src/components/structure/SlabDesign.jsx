import React, { useState } from 'react';
import axios from 'axios';

export default function SlabDesign({ projectName, activity }) {
  const [formData, setFormData] = useState({
    slabType: 'One-way',
    spanLengthShort: '',
    spanLengthLong: '',
    slabThickness: '',
    supportCondition: 'Simply Supported',
    liveLoad: '',
    floorFinishLoad: '',
    concreteGrade: 'M25',
    steelGrade: 'Fe 415',
    coverToReinforcement: ''
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
        spanLengthShort: parseFloat(formData.spanLengthShort),
        spanLengthLong: parseFloat(formData.spanLengthLong),
        slabThickness: parseFloat(formData.slabThickness),
        liveLoad: parseFloat(formData.liveLoad),
        floorFinishLoad: parseFloat(formData.floorFinishLoad),
        coverToReinforcement: parseFloat(formData.coverToReinforcement)
      };

      const response = await axios.post(
        `http://localhost:8000/api/structure/slab-design`,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Slab Design</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slab Type
              </label>
              <select
                name="slabType"
                value={formData.slabType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="One-way">One-way</option>
                <option value="Two-way">Two-way</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Condition
              </label>
              <select
                name="supportCondition"
                value={formData.supportCondition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Simply Supported">Simply Supported</option>
                <option value="Continuous">Continuous</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>
          </div>

          {/* Span Lengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Span (m)
              </label>
              <input
                type="number"
                name="spanLengthShort"
                value={formData.spanLengthShort}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Span (m)
              </label>
              <input
                type="number"
                name="spanLengthLong"
                value={formData.spanLengthLong}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Slab Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slab Thickness (mm)
            </label>
            <input
              type="number"
              name="slabThickness"
              value={formData.slabThickness}
              onChange={handleInputChange}
              min="100"
              max="500"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Cover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover to Reinforcement (mm)
            </label>
            <input
              type="number"
              name="coverToReinforcement"
              value={formData.coverToReinforcement}
              onChange={handleInputChange}
              min="15"
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
                  <p><span className="font-medium">Slab Type:</span> {result.data?.inputParameters?.slabType}</p>
                  <p><span className="font-medium">Short Span:</span> {result.data?.inputParameters?.spanLengthShort} m</p>
                  <p><span className="font-medium">Long Span:</span> {result.data?.inputParameters?.spanLengthLong} m</p>
                  <p><span className="font-medium">Thickness:</span> {result.data?.inputParameters?.slabThickness} mm</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Calculated Results</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Ultimate Moment:</span> {result.data?.calculatedResults?.ultimateBendingMoment?.toFixed(2)} kN-m</p>
                  <p><span className="font-medium">Required Steel:</span> {result.data?.calculatedResults?.requiredSteelArea?.toFixed(2)} mm²</p>
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
