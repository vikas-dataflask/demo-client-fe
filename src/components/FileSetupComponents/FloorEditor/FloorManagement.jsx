import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setFloors,
  addFloor,
  removeFloor,
  setCurrentFloorId,
  updateFloor,
  selectUserProjectFloors,
  selectCurrentUserId,
  selectCurrentProjectId,
} from '../../../redux/features/app/floorSlice';
import {
  createNewFloor,
  getFloorDisplayName,
  getNextFloorLevel,
  sortFloorsByLevel,
  validateFloor,
} from '../../../utils/floorUtils';
import { createFloorInBackend } from '../../../utils/floorRoomApi';

// Memoized FloorModal component to prevent re-renders
const FloorModal = memo(({ isOpen, onClose, title, onSave, isEdit = false, floorData, onFloorDataChange }) => {
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
              value={floorData.name}
              onChange={(e) => onFloorDataChange(prev => ({ ...prev, name: e.target.value }))}
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
              value={floorData.level}
              onChange={(e) => onFloorDataChange(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
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
              value={floorData.height}
              onChange={(e) => onFloorDataChange(prev => ({ ...prev, height: parseInt(e.target.value) || 3200 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={floorData.description}
              onChange={(e) => onFloorDataChange(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter floor description"
              rows="3"
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
});

FloorModal.displayName = 'FloorModal';

const FloorManagement = () => {
  const dispatch = useDispatch();
  const floors = useSelector(selectUserProjectFloors);
  const currentFloorId = useSelector((state) => state.floor.currentFloorId);
  const currentUserId = useSelector(selectCurrentUserId);
  const currentProjectId = useSelector(selectCurrentProjectId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showEditFloorModal, setShowEditFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [newFloorData, setNewFloorData] = useState({
    name: '',
    level: 0,
    height: 3200,
    description: ''
  });
  
  // Use ref to track dropdown state more reliably and persist across re-renders
  const dropdownRef = useRef(false);
  const dropdownStateRef = useRef(false);

  const sortedFloors = sortFloorsByLevel(floors);
  const currentFloor = floors.find(f => f.id === currentFloorId);
  
  // Log filtering information
  console.log('🔍 FloorManagement: Current state', {
    currentUserId,
    currentProjectId,
    totalFloors: floors.length,
    sortedFloors: sortedFloors.length,
    currentFloorId,
    currentFloor: currentFloor ? { id: currentFloor.id, name: currentFloor.name } : null,
    allFloors: floors.map(f => ({ id: f.id, name: f.name, createdBy: f.createdBy, projectId: f.projectId })),
    isDropdownOpen
  });

  // Use ref as source of truth for dropdown state to prevent re-render issues
  useEffect(() => {
    if (dropdownStateRef.current !== isDropdownOpen) {
      dropdownStateRef.current = isDropdownOpen;
      console.log('🔍 FloorManagement: Dropdown state changed to:', isDropdownOpen);
    }
  }, [isDropdownOpen]);

  // Restore dropdown state after re-renders - more aggressive approach
  useEffect(() => {
    console.log('🔍 FloorManagement: Re-render detected, floors:', floors.length, 'currentFloorId:', currentFloorId, 'dropdownStateRef:', dropdownStateRef.current);
    if (dropdownStateRef.current && !isDropdownOpen) {
      console.log('🔍 FloorManagement: Restoring dropdown state after re-render');
      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => {
        if (dropdownStateRef.current) {
          setIsDropdownOpen(true);
        }
      }, 0);
    }
  }, [floors, currentFloorId, isDropdownOpen]); // Re-run when floors or currentFloorId changes

  // Force dropdown to stay open during floor selection
  useEffect(() => {
    if (dropdownStateRef.current && !isDropdownOpen) {
      console.log('🔍 FloorManagement: Force restoring dropdown state');
      setIsDropdownOpen(true);
    }
  });

  const handleAddFloor = () => {
    const nextLevel = getNextFloorLevel(floors);
    setNewFloorData({
      name: '',
      level: nextLevel,
      height: 3200,
      description: ''
    });
    setShowAddFloorModal(true);
  };

  // Robust dropdown toggle function that uses ref to prevent re-render issues
  const handleDropdownToggle = useCallback(() => {
    const newState = !dropdownStateRef.current;
    console.log('🔍 FloorManagement: Toggling dropdown, current state:', dropdownStateRef.current, 'new state:', newState);
    dropdownStateRef.current = newState;
    setIsDropdownOpen(newState);
  }, []);

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloorData({
      name: floor.name,
      level: floor.level,
      height: floor.height,
      description: floor.description || ''
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

  const handleSaveFloor = async (isEdit = false) => {
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
      try {
        // Create floor data for backend
        const backendFloorData = {
          projectId: currentProjectId,
          name: newFloorData.name,
          description: newFloorData.description || `${newFloorData.name} - Level ${newFloorData.level} floor`,
          shape: {
            type: 'rect',
            coordinates: [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
              { x: 10, y: 10 },
              { x: 0, y: 10 }
            ],
            width: 10, // Default 10 meters
            height: 10
          },
          height: (newFloorData.height || 3200) / 1000, // Convert mm to meters
          material: 'RCC',
          slabThickness: 0.2, // Default 0.2 meters
          unit: 'm',
          level: newFloorData.level,
          source: 'manual',
          layer: 'A-FLOR'
        };
        
        console.log('🔍 FloorManagement: Creating new floor in backend:', backendFloorData);
        
        // Save to backend
        const response = await createFloorInBackend(backendFloorData);
        console.log('🔍 FloorManagement: Backend response:', response);
        
        if (response && response.data) {
          // Create frontend floor object from backend response
          const newFloor = {
            id: response.data._id || response.data.id,
            name: response.data.name,
            level: response.data.level || 0,
            height: (response.data.height || 3.2) * 1000, // Convert meters to millimeters
            createdBy: response.data.createdBy,
            projectId: response.data.projectId,
            shapes: [], // Initialize with empty shapes array
            canvasSettings: {
              scale: 1,
              position: { x: 0, y: 0 },
              grid: true
            },
            createdAt: response.data.createdAt || new Date().toISOString(),
            updatedAt: response.data.updatedAt || new Date().toISOString()
          };
          
          dispatch(addFloor(newFloor));
          dispatch(setCurrentFloorId(newFloor.id));
          
          console.log('🔍 FloorManagement: New floor added to Redux:', newFloor);
          setShowAddFloorModal(false);
        }
      } catch (error) {
        console.error('🔍 FloorManagement: Error creating floor:', error);
        alert('Failed to create floor. Please try again.');
      }
    }

    setNewFloorData({ name: '', level: 0, height: 3200, description: '' });
  };

  const handleFloorSelect = (floorId) => {
    console.log('🔍 FloorManagement: Selecting floor:', floorId, 'dropdown state before:', dropdownStateRef.current);
    dispatch(setCurrentFloorId(floorId));
    // Ensure dropdown stays open after floor selection
    if (!dropdownStateRef.current) {
      console.log('🔍 FloorManagement: Restoring dropdown state after floor selection');
      dropdownStateRef.current = true;
      setIsDropdownOpen(true);
    }
    // Don't close the dropdown automatically - let user close it manually
    // This prevents the dropdown from disappearing when switching floors
  };

  // Memoized callback for floor data changes to prevent re-renders
  const handleFloorDataChange = useCallback((updater) => {
    setNewFloorData(updater);
  }, []);

  // Memoized modal close handlers to prevent re-renders
  const handleAddModalClose = useCallback(() => {
    setShowAddFloorModal(false);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setShowEditFloorModal(false);
    setEditingFloor(null);
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownContainer = event.target.closest('.floor-dropdown-container');
      if (dropdownStateRef.current && !dropdownContainer) {
        dropdownStateRef.current = false;
        setIsDropdownOpen(false);
      }
    };

    if (dropdownStateRef.current) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownStateRef.current]);

  return (
    <div className="border-b border-gray-300 pb-4 mx-4">
      <div className="text-sm font-semibold text-gray-700 mb-3">
        Floor Management
      </div>

      {/* Floor Dropdown */}
      <div className="relative mb-3 floor-dropdown-container">
        <button
          onClick={handleDropdownToggle}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm">
            {currentFloor ? getFloorDisplayName(currentFloor.name, currentFloor.level) : 'No floor selected'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end p-2 border-b border-gray-200">
              <button
                onClick={() => {
                  dropdownStateRef.current = false;
                  setIsDropdownOpen(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            {sortedFloors.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No floors available
              </div>
            ) : (
              sortedFloors.map((floor) => (
                <div
                  key={floor.id}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    currentFloorId === floor.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div
                    className="flex-1"
                    onClick={() => handleFloorSelect(floor.id)}
                  >
                    <div className={`text-sm font-medium ${
                      currentFloorId === floor.id ? 'text-blue-700' : ''
                    }`}>
                      {getFloorDisplayName(floor.name, floor.level)}
                      {currentFloorId === floor.id && ' (Current)'}
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
        onClose={handleAddModalClose}
        title="Add New Floor"
        onSave={() => handleSaveFloor(false)}
        isEdit={false}
        floorData={newFloorData}
        onFloorDataChange={handleFloorDataChange}
      />

      <FloorModal
        isOpen={showEditFloorModal}
        onClose={handleEditModalClose}
        title="Edit Floor"
        onSave={() => handleSaveFloor(true)}
        isEdit={true}
        floorData={newFloorData}
        onFloorDataChange={handleFloorDataChange}
      />
    </div>
  );
};

export default FloorManagement; 