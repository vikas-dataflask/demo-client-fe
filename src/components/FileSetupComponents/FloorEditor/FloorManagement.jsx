import React, { useState } from 'react';
import { ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setFloors,
  addFloor,
  removeFloor,
  setCurrentFloorId,
  updateFloor,
} from '../../../redux/features/app/floorSlice';
import {
  createNewFloor,
  getFloorDisplayName,
  getNextFloorLevel,
  sortFloorsByLevel,
  validateFloor,
} from '../../../utils/floorUtils';

const FloorManagement = () => {
  const dispatch = useDispatch();
  const floors = useSelector((state) => state.floor.floors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showEditFloorModal, setShowEditFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [newFloorData, setNewFloorData] = useState({
    name: '',
    level: 0,
    height: 3200
  });

  const sortedFloors = sortFloorsByLevel(floors);
  const currentFloor = floors.find(f => f.id === currentFloorId);

  const handleAddFloor = () => {
    const nextLevel = getNextFloorLevel(floors);
    setNewFloorData({
      name: '',
      level: nextLevel,
      height: 3200
    });
    setShowAddFloorModal(true);
  };

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloorData({
      name: floor.name,
      level: floor.level,
      height: floor.height
    });
    setShowEditFloorModal(true);
  };

  const handleDeleteFloor = (floorId) => {
    if (floors.length <= 1) {
      alert('Cannot delete the last floor. At least one floor must remain.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this floor? This action cannot be undone.')) {
      dispatch(removeFloor(floorId));
    }
  };

  const handleSaveFloor = (isEdit = false) => {
    const validation = validateFloor(newFloorData);
    if (!validation.isValid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    // Check for duplicate level
    const existingFloorWithLevel = floors.find(f => f.level === newFloorData.level);
    if (existingFloorWithLevel && (!isEdit || existingFloorWithLevel.id !== editingFloor?.id)) {
      alert(`A floor with level ${newFloorData.level} already exists.`);
      return;
    }

    if (isEdit && editingFloor) {
      dispatch(updateFloor({
        id: editingFloor.id,
        updates: {
          ...newFloorData,
          updatedAt: new Date().toISOString()
        }
      }));
      setShowEditFloorModal(false);
      setEditingFloor(null);
    } else {
      const newFloor = createNewFloor(
        newFloorData.name,
        newFloorData.level,
        newFloorData.height
      );
      dispatch(addFloor(newFloor));
      dispatch(setCurrentFloorId(newFloor.id));
      setShowAddFloorModal(false);
    }

    setNewFloorData({ name: '', level: 0, height: 3200 });
  };

  const handleFloorSelect = (floorId) => {
    dispatch(setCurrentFloorId(floorId));
    setIsDropdownOpen(false);
  };

  const FloorModal = ({ isOpen, onClose, title, onSave, isEdit = false }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Name
              </label>
              <input
                type="text"
                value={newFloorData.name}
                onChange={(e) => setNewFloorData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter floor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Level
              </label>
              <input
                type="number"
                min="0"
                value={newFloorData.level}
                onChange={(e) => setNewFloorData(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Height (mm)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={newFloorData.height}
                onChange={(e) => setNewFloorData(prev => ({ ...prev, height: parseInt(e.target.value) || 3200 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3200"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={onSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {isEdit ? 'Update Floor' : 'Add Floor'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-b border-gray-300 pb-4 mx-4">
      <div className="text-sm font-semibold text-gray-700 mb-3">
        Floor Management
      </div>

      {/* Floor Dropdown */}
      <div className="relative mb-3">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm">
            {currentFloor ? getFloorDisplayName(currentFloor.name, currentFloor.level) : 'No floor selected'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            {sortedFloors.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No floors available
              </div>
            ) : (
              sortedFloors.map((floor) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className="flex-1"
                    onClick={() => handleFloorSelect(floor.id)}
                  >
                    <div className="text-sm font-medium">
                      {getFloorDisplayName(floor.name, floor.level)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Height: {floor.height}mm
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFloor(floor);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit floor"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    {floors.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFloor(floor.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete floor"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Floor Button */}
      <button
        onClick={handleAddFloor}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
      >
        <Plus className="h-4 w-4" />
        Add New Floor
      </button>

      {/* Floor Statistics */}
      {floors.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <div>Total Floors: {floors.length}</div>
          <div>Current Floor: {currentFloor ? getFloorDisplayName(currentFloor.name, currentFloor.level) : 'None'}</div>
        </div>
      )}

      {/* Modals */}
      <FloorModal
        isOpen={showAddFloorModal}
        onClose={() => setShowAddFloorModal(false)}
        title="Add New Floor"
        onSave={() => handleSaveFloor(false)}
      />

      <FloorModal
        isOpen={showEditFloorModal}
        onClose={() => {
          setShowEditFloorModal(false);
          setEditingFloor(null);
        }}
        title="Edit Floor"
        onSave={() => handleSaveFloor(true)}
        isEdit={true}
      />
    </div>
  );
};

export default FloorManagement; 