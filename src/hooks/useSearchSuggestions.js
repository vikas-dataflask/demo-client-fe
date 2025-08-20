import { useState, useEffect, useMemo } from 'react';

const useSearchSuggestions = ({
  searchTerm,
  availableServices,
  availableSubServices,
  availableProductTypes,
  availableCapacities,
  availableBrands,
  allProducts
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  // Generate suggestions based on search term and available data
  const suggestions = useMemo(() => {
    console.log('🔍 SUGGESTION_DEBUG: Generating suggestions for term:', searchTerm);
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const suggestions = [];

    // Helper function to add unique suggestions
    const addSuggestion = (category, value, description = null) => {
      const existing = suggestions.find(s => s.category === category && s.value === value);
      if (!existing) {
        suggestions.push({
          category,
          value,
          description,
          action: category
        });
      }
    };

    // Search in services
    availableServices.forEach(service => {
      if (service.toLowerCase().includes(searchLower)) {
        addSuggestion('service', service, `Engineering discipline`);
      }
    });

    // Search in sub-services
    availableSubServices.forEach(subService => {
      if (subService.toLowerCase().includes(searchLower)) {
        addSuggestion('subService', subService, `Sub-category`);
      }
    });

    // Search in product types
    availableProductTypes.forEach(product => {
      if (product.toLowerCase().includes(searchLower)) {
        addSuggestion('product', product, `Product type`);
      }
    });

    // Search in capacities
    availableCapacities.forEach(capacity => {
      if (capacity.toString().toLowerCase().includes(searchLower)) {
        addSuggestion('capacity', capacity.toString(), `Product capacity`);
      }
    });

    // Search in brands
    availableBrands.forEach(brand => {
      const brandName = typeof brand === 'object' ? brand.name : brand;
      if (brandName.toLowerCase().includes(searchLower)) {
        addSuggestion('brand', brandName, `Manufacturer`);
      }
    });

    // Search in all products for additional matches
    if (allProducts && allProducts.length > 0) {
      allProducts.forEach(product => {
        // Search in product name
        const productName = product.typesOfFixtures || product.name || '';
        if (productName.toLowerCase().includes(searchLower)) {
          addSuggestion('product', productName, `Product name`);
        }

        // Search in brand name
        const brandName = product.brand || product.manufacturer?.name || '';
        if (brandName.toLowerCase().includes(searchLower)) {
          addSuggestion('brand', brandName, `Manufacturer`);
        }

        // Search in model number
        const modelNumber = product.modelNumber || '';
        if (modelNumber.toLowerCase().includes(searchLower)) {
          addSuggestion('modelNumber', `Model Number: ${modelNumber}`, `Model number`);
        }

        // Search in capacity
        const capacity = product.capacity || '';
        if (capacity.toString().toLowerCase().includes(searchLower)) {
          addSuggestion('capacity', capacity.toString(), `Product capacity`);
        }

        // Search in technical specifications
        if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
          Object.entries(product.technicalSpecs).forEach(([key, value]) => {
            if (value && value.toString().toLowerCase().includes(searchLower)) {
              addSuggestion('technicalSpec', `${key}: ${value}`, `Technical specification`);
            }
          });
        }
      });
    }

    // Sort suggestions by category priority
    const categoryOrder = ['service', 'subService', 'product', 'brand', 'capacity', 'modelNumber', 'technicalSpec'];
    suggestions.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    });

    console.log('🔍 SUGGESTION_DEBUG: Final suggestions:', suggestions);
    return suggestions;
  }, [searchTerm, availableServices, availableSubServices, availableProductTypes, availableCapacities, availableBrands, allProducts]);

  // Show suggestions when search term is valid
  useEffect(() => {
    const shouldBeVisible = searchTerm.trim().length >= 2 && suggestions.length > 0;
    setIsVisible(shouldBeVisible);
    
    // Only reset selected index if we're hiding suggestions or if search term changed significantly
    if (!shouldBeVisible || searchTerm.trim().length < 2) {
      setSelectedIndex(-1);
    }
  }, [searchTerm, suggestions.length]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!isVisible || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          return suggestions[selectedIndex];
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsVisible(false);
        setSelectedIndex(-1);
        break;
      case 'MouseHover':
        setSelectedIndex(event.index);
        break;
      default:
        break;
    }
    return null;
  };

  const handleSuggestionSelect = (suggestion) => {
    // Immediately hide suggestions to prevent race conditions
    setIsVisible(false);
    setSelectedIndex(-1);
    return suggestion;
  };

  const closeSuggestions = () => {
    setIsVisible(false);
    setSelectedIndex(-1);
  };

  return {
    suggestions,
    selectedIndex,
    isVisible,
    handleKeyDown,
    handleSuggestionSelect,
    closeSuggestions
  };
};

export default useSearchSuggestions; 