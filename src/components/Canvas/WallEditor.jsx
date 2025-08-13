import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedWall, updateWallAsync, deleteWallAsync, clearSelectedWall } from '../../redux/features/app/wallSlice';
import { wallUtils } from '../../utils/wallApi';

const WallEditor = ({ onClose }) => {
  const dispatch = useDispatch();
  const selectedWall = useSelector(selectSelectedWall);
  
  const [formData, setFormData] = useState({
    type: 'Partition',
    thickness: 200,
    height: 3000,
    material: 'Brick'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form data when wall changes
  useEffect(() => {
    if (selectedWall) {
      setFormData({
        type: selectedWall.type || 'Partition',
        thickness: selectedWall.thickness || 200,
        height: selectedWall.height || 3000,
        material: selectedWall.material || 'Brick'
      });
    }
  }, [selectedWall]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedWall) return;
    
    setIsSaving(true);
    try {
      await dispatch(updateWallAsync({
        wallId: selectedWall.id,
        updates: formData
      })).unwrap();
      
      console.log('Wall updated successfully');
    } catch (error) {
      console.error('Error updating wall:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWall) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete this wall? ${
        selectedWall.connectedRooms.length > 1 
          ? 'This will only remove it from the current room since it\'s shared.' 
          : 'This will permanently delete the wall.'
      }`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      // For now, delete from the first connected room
      const roomId = selectedWall.connectedRooms[0];
      await dispatch(deleteWallAsync({
        wallId: selectedWall.id,
        roomId
      })).unwrap();
      
      console.log('Wall deleted successfully');
      dispatch(clearSelectedWall());
      if (onClose) onClose();
    } catch (error) {
      console.error('Error deleting wall:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    dispatch(clearSelectedWall());
    if (onClose) onClose();
  };

  if (!selectedWall) {
    return null;
  }

  const wallLength = wallUtils.getWallLength(selectedWall);
  const wallAngle = wallUtils.getWallAngle(selectedWall);
  const isShared = selectedWall.connectedRooms.length > 1;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Wall Properties</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Wall Info */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="font-medium text-gray-700 mb-2">Wall Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Length:</span>
              <span className="ml-1 font-medium">{wallLength.toFixed(1)} px</span>
            </div>
            <div>
              <span className="text-gray-500">Angle:</span>
              <span className="ml-1 font-medium">{wallAngle.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-gray-500">Connected Rooms:</span>
              <span className="ml-1 font-medium">{selectedWall.connectedRooms.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-1 font-medium ${isShared ? 'text-blue-600' : 'text-gray-600'}`}>
                {isShared ? 'Shared' : 'Single'}
              </span>
            </div>
          </div>
        </div>

        {/* Wall Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wall Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Partition">Partition</option>
            <option value="Load-bearing">Load-bearing</option>
            <option value="Glass">Glass</option>
            <option value="Exterior">Exterior</option>
          </select>
        </div>

        {/* Wall Thickness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thickness (mm)
          </label>
          <input
            type="number"
            value={formData.thickness}
            onChange={(e) => handleInputChange('thickness', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="50"
            max="1000"
            step="10"
          />
        </div>

        {/* Wall Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (mm)
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1000"
            max="10000"
            step="100"
          />
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material
          </label>
          <select
            value={formData.material}
            onChange={(e) => handleInputChange('material', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Brick">Brick</option>
            <option value="Concrete">Concrete</option>
            <option value="Steel">Steel</option>
            <option value="Wood">Wood</option>
            <option value="Glass">Glass</option>
            <option value="Drywall">Drywall</option>
          </select>
        </div>

        {/* Connected Rooms */}
        {isShared && (
          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="font-medium text-blue-700 mb-2">Connected Rooms</h4>
            <div className="text-sm text-blue-600">
              {selectedWall.connectedRooms.map((roomId, index) => (
                <div key={roomId} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Room {roomId}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WallEditor; 