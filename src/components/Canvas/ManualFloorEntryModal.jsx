import React, { useState } from 'react';

const ManualFloorEntryModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    length: '',
    width: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const length = parseFloat(formData.length);
    const width = parseFloat(formData.width);
    
    if (length > 0 && width > 0) {
      onSubmit({
        length,
        width,
        x: 5000, // Default center X
        y: 3000, // Default center Y
      });
      setFormData({ length: '', width: '' });
    }
  };

  const handleCancel = () => {
    setFormData({ length: '', width: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Enter Floor Dimensions</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
              Length (meters)
            </label>
            <input
              type="number"
              id="length"
              name="length"
              value={formData.length}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter length in meters"
            />
          </div>

          <div>
            <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
              Width (meters)
            </label>
            <input
              type="number"
              id="width"
              name="width"
              value={formData.width}
              onChange={handleChange}
              step="0.1"
              min="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter width in meters"
            />
          </div>

          <div className="text-xs text-gray-500">
            Floor will be placed at the center of the canvas (50m, 30m)
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Floor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualFloorEntryModal; 