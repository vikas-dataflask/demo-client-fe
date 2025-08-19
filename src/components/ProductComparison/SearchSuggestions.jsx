import React, { useState, useEffect, useRef } from 'react';

const SearchSuggestions = ({
  searchTerm,
  suggestions,
  onSuggestionSelect,
  onClose,
  isVisible,
  selectedIndex,
  onKeyDown
}) => {
  const suggestionsRef = useRef(null);

  // Auto-scroll to selected suggestion
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (!isVisible || !searchTerm.trim() || suggestions.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    const icons = {
      service: '🔧',
      subService: '⚙️',
      product: '📦',
      brand: '🏢',
      capacity: '⚡'
    };
    return icons[category] || '🔍';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      service: 'Service',
      subService: 'Sub-Service',
      product: 'Product',
      brand: 'Brand',
      capacity: 'Capacity'
    };
    return labels[category] || 'Other';
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
      <div ref={suggestionsRef} className="py-1">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.category}-${suggestion.value}-${index}`}
            className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
              index === selectedIndex
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              console.log('🔍 SearchSuggestions: Suggestion clicked:', suggestion);
              onSuggestionSelect(suggestion);
            }}
            onMouseEnter={() => onKeyDown({ key: 'MouseHover', index })}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {getCategoryLabel(suggestion.category)}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-900 font-medium">
                    {highlightMatch(suggestion.value, searchTerm)}
                  </span>
                </div>
                {suggestion.description && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {suggestion.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {suggestions.length > 0 && (
        <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions; 