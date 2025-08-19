// src/components/ProductComparison/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import SearchSuggestions from './SearchSuggestions';
import useSearchSuggestions from '../../hooks/useSearchSuggestions';

const Sidebar = ({
  selectedProduct,
  setSelectedProduct,
  selectedCapacity,
  setSelectedCapacity,
  selectedService,
  setSelectedService,
  selectedSubService,
  setSelectedSubService,
  selectedBrands,
  setSelectedBrands,
  availableProductTypes,
  availableServices,
  availableSubServices,
  availableCapacities,
  availableBrands,
  isLoadingServices,
  isLoadingSubServices,
  isLoadingProducts,
  isLoadingCapacities,
  isLoadingBrands,
  searchTerm,
  onSearchChange,
  onClearFilters,
  allProducts, // Add this prop for search suggestions
  onUserSelection, // Add this prop to notify parent of user selection
  onSearchBasedFilter, // Add this prop for search-based filtering
}) => {
  // REMOVED: Component render logging

  // Search suggestions logic
  const {
    suggestions,
    selectedIndex,
    isVisible: suggestionsVisible,
    handleKeyDown: handleSuggestionsKeyDown,
    handleSuggestionSelect: handleSuggestionsSelect,
    closeSuggestions
  } = useSearchSuggestions({
    searchTerm,
    availableServices,
    availableSubServices,
    availableProductTypes,
    availableCapacities,
    availableBrands,
    allProducts
  });

  // Handle suggestion selection from UI
  const handleSuggestionSelect = (suggestion) => {
    // Close suggestions dropdown
    closeSuggestions();
    
    // Notify parent of user selection
    if (onUserSelection) {
      onUserSelection();
    }
    
    // Set search-based filter for immediate filtering in parent
    if (onSearchBasedFilter) {
      onSearchBasedFilter(suggestion); // DELEGATE TO PARENT
    }
    
    // REMOVED: Direct setting of individual dropdown states (e.g., setSelectedProduct)
    // This was causing conflicts and race conditions.
    
    // REMOVED: setTimeout for clearing search term
    // The parent component now handles this properly in handleSearchBasedFilter
  };

  // Handle keyboard events for search input
  const handleSearchKeyDown = (event) => {
    const result = handleSuggestionsKeyDown(event);
    if (result) {
      handleSuggestionSelect(result);
    }
  };

  // Close suggestions when clicking outside
  const searchContainerRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        closeSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeSuggestions]);

  const handleServiceChange = (service) => {
    console.log('🔄 SIDEBAR_DEBUG: Service changed to:', service);
    setSelectedService(service);
  };

  const handleSubServiceChange = (subService) => {
    console.log('🔄 SIDEBAR_DEBUG: SubService changed to:', subService);
    setSelectedSubService(subService);
  };

  const handleProductChange = (product) => {
    console.log('🔄 SIDEBAR_DEBUG: Product changed to:', product);
    setSelectedProduct(product);
  };

  const handleCapacityChange = (capacity) => {
    console.log('🔄 SIDEBAR_DEBUG: Capacity changed to:', capacity);
    setSelectedCapacity(capacity);
  };

  const handleBrandChange = (brandName) => {
    console.log('🔄 SIDEBAR_DEBUG: Brand toggle:', brandName);
    setSelectedBrands(prev => {
      const isSelected = prev.includes(brandName);
      if (isSelected) {
        return prev.filter(brand => brand !== brandName);
      } else {
        return [...prev, brandName];
      }
    });
  };

  const getBrandLogo = (brandName, brandData) => {
    
    // Admin backend base URL for serving uploaded images
    const adminBaseUrl = 'http://localhost:3001';
    
    // Try to find logo URL from available brands data
    let logoUrl = null;
    
    if (brandData && typeof brandData === 'object') {
      logoUrl = brandData.logoUrl || brandData.logo;
    } else {
      // Fallback: try to find in availableBrands array
      const foundBrand = availableBrands.find(brand => 
        typeof brand === 'object' ? brand.name === brandName : brand === brandName
      );
      logoUrl = foundBrand?.logoUrl || foundBrand?.logo;
    }
    
    if (logoUrl) {
      // Construct the full URL if it's a relative path
      let finalLogoUrl = logoUrl;
      
      // If logoUrl is already a full URL, use it as is
      if (logoUrl.startsWith('http')) {
        finalLogoUrl = logoUrl;
      }
      // If logoUrl is a relative path, prepend the admin base URL
      else if (logoUrl.startsWith('/uploads/')) {
        finalLogoUrl = `${adminBaseUrl}${logoUrl}`;
      }
      // If logoUrl is just a filename, construct the full path
      else {
        finalLogoUrl = `${adminBaseUrl}/uploads/${logoUrl}`;
      }
      
      // Dynamic fallback to colored placeholder - no hardcoded brand names
      const getBrandColor = (name) => {
        // Generate consistent color based on brand name hash
        const colors = [
          'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 
          'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
          'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
        ];
        
        // Simple hash function for consistent color assignment
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          const char = name.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        
        const colorIndex = Math.abs(hash) % colors.length;
        const selectedColor = colors[colorIndex];
        return selectedColor;
      };
      
      return (
        <>
          <img 
            src={finalLogoUrl} 
            alt={brandName} 
            className="w-[32px] h-[32px] object-contain rounded-[4px] border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className={`w-[32px] h-[32px] rounded-[4px] flex items-center justify-center text-xs font-bold text-white ${getBrandColor(brandName)} hidden`}>
            {brandName.charAt(0).toUpperCase()}
          </div>
        </>
      );
    }
    
    // Dynamic fallback to colored placeholder - no hardcoded brand names
    const getBrandColor = (name) => {
      // Generate consistent color based on brand name hash
      const colors = [
        'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 
        'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
      ];
      
      // Simple hash function for consistent color assignment
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      const colorIndex = Math.abs(hash) % colors.length;
      const selectedColor = colors[colorIndex];
      return selectedColor;
    };
    
    return (
      <div className={`w-[32px] h-[32px] rounded-[4px] flex items-center justify-center text-xs font-bold text-white ${getBrandColor(brandName)}`}>
        {brandName.charAt(0).toUpperCase()}
      </div>
    );
  };

  // REMOVED: Render state logging

  return (
    <div className="w-[320px] bg-white border border-[#D1D5DB] rounded-[8px] p-[16px] overflow-y-auto">
      {/* Search Box */}
      <div className="mb-[16px]">
        <label className="block text-[13px] font-medium text-[#374151] mb-[8px]">
          Smart Search with Suggestions
        </label>
        <div className="relative" ref={searchContainerRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              onSearchChange(newValue);
            }}
            onKeyDown={handleSearchKeyDown}
            onFocus={(e) => {
            }}
            placeholder="Type to see smart suggestions..."
            className="w-full h-[36px] pl-10 pr-4 bg-[#F7F7F8] border border-[#D1D5DB] rounded-[6px] text-[13px] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                onSearchChange('');
                closeSuggestions();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Smart Suggestions Dropdown */}
          <SearchSuggestions
            searchTerm={searchTerm}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            onClose={closeSuggestions}
            isVisible={suggestionsVisible}
            selectedIndex={selectedIndex}
            onKeyDown={handleSuggestionsKeyDown}
          />
        </div>
        
        {/* Search Status */}
        {searchTerm && searchTerm.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {suggestionsVisible ? (
              <div className="flex items-center gap-2">
                <span>💡 Showing {suggestions.length} smart suggestions</span>
                <span className="text-blue-600">Click or use ↑↓ to select</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>🔍 Type at least 2 characters for suggestions</span>
              </div>
            )}
          </div>
        )}
        
        {searchTerm && searchTerm.length > 0 && !suggestionsVisible && (
          <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            💡 <strong>Smart Search Active!</strong> Type to see suggestions for services, products, brands, and more.
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {(selectedService || selectedSubService || selectedProduct || selectedCapacity || selectedBrands.length > 0 || searchTerm) && (
        <div className="mb-[16px]">
          <button
            onClick={onClearFilters}
            className="w-full h-[32px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-medium rounded-[6px] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        </div>
      )}

      <div className="border-t border-[#E5E7EB] pt-[16px]">
        <h2 className="text-[16px] font-semibold mb-[12px]">Compare Products</h2>
        
        <div className="text-[13px] text-[#6B7280] mb-[8px]">Basic Details</div>

        <div className="mb-[12px]">
          <label className="block mb-[4px] text-[13px] font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Engineering Discipline
          </label>
          <div className="relative">
            <select
              className={`w-full h-[40px] bg-white border rounded-lg px-3 text-[13px] appearance-none cursor-pointer transition-all duration-200 ${
                isLoadingServices 
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                  : selectedService 
                    ? 'border-blue-500 bg-blue-50 focus:ring-2 focus:ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value)}
              disabled={isLoadingServices}
            >
              <option value="">
                {isLoadingServices ? '🔄 Loading disciplines...' : '📋 Select Engineering Discipline'}
              </option>
              {availableServices.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${
                isLoadingServices ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {availableServices.length === 0 && !isLoadingServices && (
            <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              No engineering disciplines available
            </div>
          )}
          {/* Enhanced debug info */}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              availableServices.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {availableServices.length} available
            </span>
            {selectedService && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ✓ {selectedService}
              </span>
            )}
            {isLoadingServices && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔄 Loading...
              </span>
            )}
          </div>
        </div>

        <div className="mb-[12px]">
          <label className="block mb-[4px] text-[13px] font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Engineering SubCategory
          </label>
          <div className="relative">
            <select
              className={`w-full h-[40px] bg-white border rounded-lg px-3 text-[13px] appearance-none cursor-pointer transition-all duration-200 ${
                isLoadingSubServices || !selectedService
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                  : selectedSubService 
                    ? 'border-green-500 bg-green-50 focus:ring-2 focus:ring-green-200' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
              value={selectedSubService}
              onChange={(e) => handleSubServiceChange(e.target.value)}
              disabled={isLoadingSubServices || !selectedService}
            >
              <option value="">
                {isLoadingSubServices ? '🔄 Loading sub-categories...' : 
                 !selectedService ? '⚠️ Select Engineering Discipline first' : '📋 Select Engineering SubCategory'}
              </option>
              {availableSubServices.map((subService) => (
                <option key={subService} value={subService}>
                  {subService}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${
                isLoadingSubServices || !selectedService ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {availableSubServices.length === 0 && !isLoadingSubServices && selectedService && (
            <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              No sub-categories available for selected discipline
            </div>
          )}
          {/* Enhanced debug info */}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              availableSubServices.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {availableSubServices.length} available
            </span>
            {selectedSubService && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ {selectedSubService}
              </span>
            )}
            {isLoadingSubServices && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔄 Loading...
              </span>
            )}
            {selectedService && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                From: {selectedService}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-[16px]">
        <div className="mb-[12px]">
          <label className="block mb-[4px] text-[13px] font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Select Product
          </label>
          <div className="relative">
            <select
              className={`w-full h-[40px] bg-white border rounded-lg px-3 text-[13px] appearance-none cursor-pointer transition-all duration-200 ${
                isLoadingProducts || !selectedSubService
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                  : selectedProduct 
                    ? 'border-purple-500 bg-purple-50 focus:ring-2 focus:ring-purple-200' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              }`}
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              disabled={isLoadingProducts || !selectedSubService}
            >
              <option value="">
                {isLoadingProducts ? '🔄 Loading products...' : 
                 !selectedSubService ? '⚠️ Select Engineering SubCategory first' : '📋 Select Product'}
              </option>
              {availableProductTypes.length > 0 ? (
                availableProductTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))
              ) : (
                <option value="">No products available</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${
                isLoadingProducts || !selectedSubService ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {availableProductTypes.length === 0 && !isLoadingProducts && selectedSubService && (
            <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              No products available for selected sub-category
            </div>
          )}
          {/* Enhanced debug info */}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              availableProductTypes.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {availableProductTypes.length} available
            </span>
            {selectedProduct && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                ✓ {selectedProduct}
              </span>
            )}
            {isLoadingProducts && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔄 Loading...
              </span>
            )}
            {selectedSubService && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                From: {selectedSubService}
              </span>
            )}
          </div>
        </div>

        <div className="mb-[12px]">
          <label className="block mb-[4px] text-[13px] font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Capacity
          </label>
          <div className="relative">
            <select
              className={`w-full h-[40px] bg-white border rounded-lg px-3 text-[13px] appearance-none cursor-pointer transition-all duration-200 ${
                isLoadingCapacities || !selectedProduct
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                  : selectedCapacity 
                    ? 'border-orange-500 bg-orange-50 focus:ring-2 focus:ring-orange-200' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
              }`}
              value={selectedCapacity}
              onChange={(e) => handleCapacityChange(e.target.value)}
              disabled={isLoadingCapacities || !selectedProduct}
            >
              <option value="">
                {isLoadingCapacities ? '🔄 Loading capacities...' : 
                 !selectedProduct ? '⚠️ Select Product first' : '📋 Select Capacity'}
              </option>
              {availableCapacities.map((capacity) => (
                <option key={capacity} value={capacity}>
                  {capacity}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className={`w-4 h-4 transition-colors ${
                isLoadingCapacities || !selectedProduct ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {availableCapacities.length === 0 && !isLoadingCapacities && selectedProduct && (
            <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              No capacities available for selected product
            </div>
          )}
          {/* Enhanced debug info */}
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              availableCapacities.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {availableCapacities.length} available
            </span>
            {selectedCapacity && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ✓ {selectedCapacity}
              </span>
            )}
            {isLoadingCapacities && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔄 Loading...
              </span>
            )}
            {selectedProduct && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                From: {selectedProduct}
              </span>
            )}
          </div>
        </div>

        <div className="pt-[16px]">
          <h3 className="text-[14px] font-semibold mb-[12px] flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Manufacturers
          </h3>
          
          {/* Enhanced debug info for brands */}
          <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              availableBrands.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {availableBrands.length} available
            </span>
            {selectedBrands.length > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                ✓ {selectedBrands.length} selected
              </span>
            )}
            {isLoadingBrands && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔄 Loading...
              </span>
            )}
            {selectedProduct && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Product: {selectedProduct}
              </span>
            )}
            {selectedCapacity && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Capacity: {selectedCapacity}
              </span>
            )}
          </div>
          
          <div className="space-y-[8px]">
            {isLoadingBrands ? (
              <div className="text-[13px] text-[#6B7280] text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  <span className="font-medium">Loading manufacturers...</span>
                  <span className="text-xs text-gray-500">Please wait while we fetch available brands</span>
                </div>
              </div>
            ) : availableBrands.length > 0 ? (
              availableBrands.map((brand) => {
                const brandName = typeof brand === 'object' ? brand.name : brand;
                const brandData = typeof brand === 'object' ? brand : null;
                const isSelected = selectedBrands.includes(brandName);
                
                return (
                  <label
                    key={brandName}
                    htmlFor={`brand-checkbox-${brandName}`}
                    className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getBrandLogo(brandName, brandData)}
                      <span className={`text-[13px] font-medium ${
                        isSelected ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {brandName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <input
                        id={`brand-checkbox-${brandName}`}
                        type="checkbox"
                        className="w-5 h-5 rounded border-2 text-indigo-600 focus:ring-indigo-500 focus:ring-2 shrink-0 transition-colors"
                        checked={isSelected}
                        onChange={() => handleBrandChange(brandName)}
                      />
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="text-[13px] text-[#6B7280] text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">
                    {!selectedProduct || !selectedCapacity ? (
                      'Select product and capacity to see available manufacturers'
                    ) : (
                      'No manufacturers available for the selected criteria'
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {!selectedProduct || !selectedCapacity 
                      ? 'Complete the product selection above to view manufacturers'
                      : 'Try selecting different product or capacity options'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
