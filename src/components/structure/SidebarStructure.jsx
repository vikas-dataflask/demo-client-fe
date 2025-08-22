import React from 'react';

export default function SidebarStructure({ activeSection, setActiveSection }) {
  const structureSections = [
    { id: 'slab', label: 'Slab Design', icon: '🏗️' },
    { id: 'beam', label: 'Beam Design', icon: '🔨' },
    { id: 'column', label: 'Column Design', icon: '🏛️' },
    { id: 'footing', label: 'Footing Design', icon: '🔧' },
    { id: 'staircase', label: 'Staircase Design', icon: '🪜' },
    { id: 'shearwall', label: 'Shear Wall Design', icon: '🧱' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Structure Design</h2>
        <p className="text-sm text-gray-600 mt-1">Select design type</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {structureSections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-medium text-blue-800 text-sm">Quick Info</h3>
          <p className="text-blue-600 text-xs mt-1">
            All calculations follow IS 456:2000 standards
          </p>
        </div>
      </div>
    </div>
  );
}
