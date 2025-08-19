// src/pages/ProductComparisonPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useGetProductsWithSpecsQuery,
  useGetFilteredProductsMutation,
  useGetEngineeringDisciplinesQuery,
  useGetEngineeringSubCategoriesQuery,
  useGetSubcategoriesByDisciplineQuery,
  useGetProductsBySubcategoryQuery,
  useGetCapacitiesByProductQuery,
  useGetManufacturersByProductQuery,
} from '../redux/features/api/adminApi';
import ProductComparison from '../components/ProductComparison/ProductComparison';
import Sidebar from '../components/ProductComparison/Sidebar';
import TopBarPC from '../components/ProductComparison/TopBarPC';
import { transformAdminDataToProductFormat } from '../utils/productDataTransformer';

const ProductComparisonPage = () => {
  // State for filters - initialized as empty to allow dynamic selection
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [allProducts, setAllProducts] = useState(null);
  const [comparisonTitle, setComparisonTitle] = useState('Product Comparison');
  const [searchTerm, setSearchTerm] = useState('');
  const [userHasMadeSelection, setUserHasMadeSelection] = useState(false);
  const [searchBasedFilter, setSearchBasedFilter] = useState(null);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

  // API queries with enhanced error handling and debugging
  const { 
    data: comparisonData, 
    isLoading: isLoadingComparison, 
    error: comparisonError,
    refetch: refetchComparison 
  } = useGetProductsWithSpecsQuery();

  const { 
    data: disciplinesData, 
    isLoading: isLoadingDisciplines,
    error: disciplinesError 
  } = useGetEngineeringDisciplinesQuery();

  const { 
    data: subCategoriesData, 
    isLoading: isLoadingSubCategories,
    error: subCategoriesError 
  } = useGetEngineeringSubCategoriesQuery();
  
  // Get the discipline ID for the selected discipline
  const selectedDisciplineId = useMemo(() => {
    if (!disciplinesData?.data || !selectedDiscipline) {
      return null;
    }
    const discipline = disciplinesData.data.find(d => 
      d.name.toLowerCase() === selectedDiscipline.toLowerCase()
    );
    return discipline?._id;
  }, [disciplinesData?.data, selectedDiscipline]);
  
  // Dependent filtering queries with proper error handling
  const { 
    data: subcategoriesByDiscipline, 
    isLoading: isLoadingSubCategoriesByDiscipline,
    error: subCategoriesByDisciplineError 
  } = useGetSubcategoriesByDisciplineQuery(
    selectedDisciplineId,
    { skip: !selectedDisciplineId }
  );
  
  // Get the subcategory ID for the selected sub-category
  const selectedSubCategoryId = useMemo(() => {
    if (!subcategoriesByDiscipline?.data || !selectedSubCategory) {
      return null;
    }
    const subCategory = subcategoriesByDiscipline.data.find(sc => 
      sc.name.toLowerCase() === selectedSubCategory.toLowerCase()
    );
    return subCategory?._id;
  }, [subcategoriesByDiscipline?.data, selectedSubCategory]);
  
  const { 
    data: productsBySubcategory, 
    isLoading: isLoadingProducts,
    error: productsError 
  } = useGetProductsBySubcategoryQuery(
    selectedSubCategoryId,
    { skip: !selectedSubCategoryId }
  );
  
  // Get the product ID for the selected product
  const selectedProductId = useMemo(() => {
    if (!productsBySubcategory?.data || !selectedProduct) {
      return null;
    }
    const product = productsBySubcategory.data.find(p => 
      p.name.toLowerCase() === selectedProduct.toLowerCase()
    );
    return product?._id;
  }, [productsBySubcategory?.data, selectedProduct]);
  
  const { 
    data: capacitiesByProduct, 
    isLoading: isLoadingCapacities,
    error: capacitiesError 
  } = useGetCapacitiesByProductQuery(
    selectedProductId,
    { skip: !selectedProductId }
  );
  
  // Get the capacity ID for the selected capacity
  const selectedCapacityId = useMemo(() => {
    if (!capacitiesByProduct?.data || !selectedCapacity) {
      return null;
    }
    const capacity = capacitiesByProduct.data.find(c => 
      (c.capacity_value && c.capacity_value.toString().toLowerCase() === selectedCapacity.toLowerCase()) ||
      (c.rating && c.rating.toString().toLowerCase() === selectedCapacity.toLowerCase())
    );
    return capacity?._id;
  }, [capacitiesByProduct?.data, selectedCapacity]);
  
  const { 
    data: manufacturersByProduct, 
    isLoading: isLoadingBrands,
    error: brandsError 
  } = useGetManufacturersByProductQuery(
    selectedProductId && selectedCapacityId ? {
      productId: selectedProductId,
      capacityId: selectedCapacityId
    } : null,
    { skip: !selectedProductId || !selectedCapacityId }
  );

  const [getFilteredProducts] = useGetFilteredProductsMutation();

  // Transform data for backward compatibility with enhanced error handling
  const transformedProducts = useMemo(() => {
    if (!comparisonData?.data?.products) {
      return [];
    }
    const transformed = transformAdminDataToProductFormat(comparisonData);
    return transformed;
  }, [comparisonData]);

  // Available filter options with validation and debugging
  const availableDisciplines = useMemo(() => {
    if (!disciplinesData?.data) {
      return [];
    }
    const disciplines = disciplinesData.data.map(d => d.name).filter(Boolean);
    return disciplines;
  }, [disciplinesData]);

  const availableSubCategories = useMemo(() => {
    if (!subcategoriesByDiscipline?.data) {
      return [];
    }
    const subCategories = subcategoriesByDiscipline.data.map(sc => sc.name).filter(Boolean);
    return subCategories;
  }, [subcategoriesByDiscipline, selectedDiscipline]);

  const availableProductTypes = useMemo(() => {
    if (!productsBySubcategory?.data) {
      return [];
    }
    const productTypes = productsBySubcategory.data.map(p => p.name).filter(Boolean);
    return productTypes;
  }, [productsBySubcategory, selectedSubCategory]);

  const availableCapacities = useMemo(() => {
    if (!capacitiesByProduct?.data) {
      return [];
    }
    const capacities = capacitiesByProduct.data
      .map(c => c.capacity_value || c.rating)
      .filter(Boolean)
      .map(c => c.toString());
    return capacities;
  }, [capacitiesByProduct, selectedProduct]);

  const availableBrands = useMemo(() => {
    if (!manufacturersByProduct?.data) {
      return [];
    }
    // Return full manufacturer objects instead of just names to include logoUrl
    const brands = manufacturersByProduct.data.filter(m => m.name).map(m => ({
      name: m.name,
      logoUrl: m.logoUrl || '',
      discipline: m.discipline || '',
      subCategory: m.subCategory || '',
      description: m.description || '',
      website: m.website || '',
      country: m.country || ''
    }));
    return brands;
  }, [manufacturersByProduct, selectedProduct, selectedCapacity]);

  // Memoized filtered products with enhanced debugging
  const filteredProductsData = useMemo(() => {
    console.log('🔍 FILTER_DEBUG: Starting product filtering', {
      totalProducts: transformedProducts.length,
      searchBasedFilter: searchBasedFilter ? `${searchBasedFilter.category}: ${searchBasedFilter.value}` : 'null',
      searchTerm: searchTerm
    });

    if (!transformedProducts || transformedProducts.length === 0) {
      return [];
    }

    let filtered = [...transformedProducts];

    // PRIORITY: Search-based filter takes precedence over dropdown filters
    if (searchBasedFilter) {
      console.log('🔍 FILTER_DEBUG: Applying search-based filter');
      const { category, value } = searchBasedFilter;
      
      filtered = filtered.filter(product => {
        let matches = false;
        
        switch (category) {
          case 'service':
            matches = product.service?.toLowerCase().includes(value.toLowerCase());
            break;
          case 'subService':
            matches = product.subService?.toLowerCase().includes(value.toLowerCase());
            break;
          case 'product':
            // Check both product name and typesOfFixtures
            matches = (product.typesOfFixtures?.toLowerCase().includes(value.toLowerCase()) ||
                      product.name?.toLowerCase().includes(value.toLowerCase()));
            break;
          case 'brand':
            matches = product.brand?.toLowerCase().includes(value.toLowerCase());
            break;
          case 'capacity':
            matches = product.capacity?.toString().toLowerCase().includes(value.toLowerCase());
            break;
          case 'modelNumber':
            // Extract model number from the value (format: "Model Number: XXX")
            const modelNumber = value.replace('Model Number: ', '');
            matches = product.modelNumber?.toLowerCase().includes(modelNumber.toLowerCase());
            break;
          case 'technicalSpec':
            // Search in technical specifications
            if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
              matches = Object.values(product.technicalSpecs).some(spec => 
                spec?.toString().toLowerCase().includes(value.toLowerCase())
              );
            }
            break;
          default:
            matches = false;
        }
        
        if (!matches) {
          console.log('❌ FILTER_DEBUG: Product filtered out', {
            product: product.typesOfFixtures || product.name,
            category: category,
            value: value
          });
        } else {
          console.log('✅ FILTER_DEBUG: Product matches', {
            product: product.typesOfFixtures || product.name,
            category: category,
            value: value
          });
        }
        
        return matches;
      });
    } else {
      // Apply dropdown filters only when no search-based filter is active
      // REMOVED: searchTerm filtering from here - it should only affect suggestions, not table
      filtered = filtered.filter(product => {
        // More flexible matching - allow partial matches and case-insensitive
        const matchesDiscipline = !selectedDiscipline || 
          product.service?.toLowerCase().includes(selectedDiscipline.toLowerCase());
        
        const matchesSubCategory = !selectedSubCategory || 
          product.subService?.toLowerCase().includes(selectedSubCategory.toLowerCase());
        
        const matchesProductType = !selectedProduct || 
          (product.typesOfFixtures?.toLowerCase().includes(selectedProduct.toLowerCase()) ||
           product.name?.toLowerCase().includes(selectedProduct.toLowerCase()));
        
        const matchesCapacity = !selectedCapacity || 
          product.capacity?.toString().toLowerCase().includes(selectedCapacity.toLowerCase());
        
        const matchesBrand = selectedBrands.length === 0 || 
          selectedBrands.some(brand => 
            product.brand?.toLowerCase().includes(brand.toLowerCase())
          );

        // REMOVED: searchTerm filtering - this was causing immediate table updates
        // The search term should only affect suggestions, not the comparison table

        const matches = matchesDiscipline && matchesSubCategory && matchesProductType && 
                       matchesCapacity && matchesBrand;

        return matches;
      });
    }

    console.log(`✅ FILTER_DEBUG: Filtered ${filtered.length} products from ${transformedProducts.length} total`);
    
    return filtered;
  }, [transformedProducts, selectedDiscipline, selectedSubCategory, selectedProduct, selectedCapacity, selectedBrands, searchBasedFilter]);

  // TARGETED LOGGING: Track search-based filter state changes
  useEffect(() => {
    // console.log('🔄 FILTER_DEBUG: searchBasedFilter state changed', {
    //   searchBasedFilter: searchBasedFilter ? `${searchBasedFilter.category}: ${searchBasedFilter.value}` : 'null',
    //   isSelectingSuggestion: isSelectingSuggestion
    // });
  }, [searchBasedFilter, isSelectingSuggestion]);

  // TARGETED LOGGING: Track search term changes
  useEffect(() => {
    // console.log('🔄 FILTER_DEBUG: searchTerm state changed', {
    //   searchTerm: searchTerm,
    //   searchTermLength: searchTerm.length,
    //   isSelectingSuggestion: isSelectingSuggestion
    // });
  }, [searchTerm, isSelectingSuggestion]);

  // Memoized handlers to prevent infinite re-renders with debugging
  const handleDisciplineChange = useCallback((discipline) => {
    // console.log('🔄 ProductComparisonPage: Discipline changed to:', discipline);
    setUserHasMadeSelection(true);
    setSelectedDiscipline(discipline);
    setSelectedSubCategory('');
    setSelectedProduct('');
    setSelectedCapacity('');
    setSelectedBrands([]);
  }, []);

  const handleSubCategoryChange = useCallback((subCategory) => {
    // console.log('🔄 ProductComparisonPage: SubCategory changed to:', subCategory);
    setUserHasMadeSelection(true);
    setSelectedSubCategory(subCategory);
    setSelectedProduct('');
    setSelectedCapacity('');
    setSelectedBrands([]);
  }, []);

  const handleProductChange = useCallback((product) => {
    // console.log('🔄 ProductComparisonPage: Product changed to:', product);
    setUserHasMadeSelection(true);
    setSelectedProduct(product);
    setSelectedCapacity('');
    setSelectedBrands([]);
  }, []);

  const handleCapacityChange = useCallback((capacity) => {
    // console.log('🔄 ProductComparisonPage: Capacity changed to:', capacity);
    setUserHasMadeSelection(true);
    setSelectedCapacity(capacity);
    setSelectedBrands([]);
  }, []);

  const handleBrandChange = useCallback((brands) => {
    // console.log('🔄 ProductComparisonPage: Brands changed to:', brands);
    setUserHasMadeSelection(true);
    setSelectedBrands(brands);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    
    // Only clear search-based filter if user clears the search completely
    // Don't clear if user is typing new search terms - let them select new suggestions
    if (!term || term.trim().length === 0) {
      // Only clear search-based filter if user is actively clearing the search
      if (!isSelectingSuggestion) {
        console.log('🔄 SEARCH_DEBUG: Clearing search-based filter - user cleared search completely');
        setSearchBasedFilter(null);
      }
    } else {
      console.log('🔄 SEARCH_DEBUG: User typing new search term, keeping current search-based filter');
    }
  }, [isSelectingSuggestion]);

  // Auto-selection effects with better logic and debugging
  // Only auto-select if there's no active search term, no search-based filter, and user hasn't made a manual selection
  useEffect(() => {
    if (availableDisciplines.length > 0 && !selectedDiscipline && !searchTerm.trim() && !searchBasedFilter && !userHasMadeSelection) {
      setSelectedDiscipline(availableDisciplines[0]);
    }
  }, [availableDisciplines, selectedDiscipline, searchTerm, searchBasedFilter, userHasMadeSelection]);

  useEffect(() => {
    if (availableSubCategories.length > 0 && !selectedSubCategory && !searchTerm.trim() && !searchBasedFilter && !userHasMadeSelection) {
      setSelectedSubCategory(availableSubCategories[0]);
    }
  }, [availableSubCategories, selectedSubCategory, searchTerm, searchBasedFilter, userHasMadeSelection]);

  useEffect(() => {
    if (availableProductTypes.length > 0 && !selectedProduct && !searchTerm.trim() && !searchBasedFilter && !userHasMadeSelection) {
      setSelectedProduct(availableProductTypes[0]);
    }
  }, [availableProductTypes, selectedProduct, searchTerm, searchBasedFilter, userHasMadeSelection]);

  useEffect(() => {
    if (availableCapacities.length > 0 && !selectedCapacity && !searchTerm.trim() && !searchBasedFilter && !userHasMadeSelection) {
      setSelectedCapacity(availableCapacities[0]);
    }
  }, [availableCapacities, selectedCapacity, searchTerm, searchBasedFilter, userHasMadeSelection]);

  // Set allProducts for backward compatibility
  useEffect(() => {
    setAllProducts(transformedProducts);
  }, [transformedProducts]);

  // Reset user selection flag when search term is cleared to allow auto-selection for new searches
  // But only if there's no active search-based filter
  useEffect(() => {
    if (!searchTerm.trim() && !searchBasedFilter) {
      setUserHasMadeSelection(false);
    }
  }, [searchTerm, searchBasedFilter]);

  // REMOVED: This useEffect was causing the search-based filter to be cleared
  // when searchTerm was cleared, which happened after selecting a suggestion.
  // The search-based filter should persist independently of the search term.

  const bothSelected = selectedProduct && selectedCapacity;
  
  // Check if we have selected filters or any products available
  const hasSelectedFilters = selectedProduct && selectedCapacity;
  const hasAnyProducts = filteredProductsData.length > 0;
  const hasSearchBasedFilter = !!searchBasedFilter;
  
  // Show comparison if we have selected filters, any products available, or search-based filter
  const shouldShowComparison = hasSelectedFilters || hasAnyProducts || hasSearchBasedFilter;

  // Enhanced loading states
  const isPageLoading = isLoadingComparison || isLoadingDisciplines || isLoadingSubCategories;
  const hasErrors = comparisonError || disciplinesError || subCategoriesError;

  // Enhanced error handling
  if (hasErrors) {
    // console.error('❌ ProductComparisonPage: Errors detected:', {
    //   comparisonError,
    //   disciplinesError,
    //   subCategoriesError
    // });
    
    return (
      <div className="h-screen w-full flex flex-col bg-white">
        <TopBarPC />
        <div className="flex-1 flex items-center justify-center text-red-600">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-lg font-medium mb-4">Failed to load product comparison data</div>
            <div className="text-sm text-gray-600 mb-4">
              {comparisonError?.data?.message || disciplinesError?.data?.message || 'Please check your connection and try again'}
            </div>
            <button 
              onClick={() => {
                // console.log('🔄 ProductComparisonPage: Retrying data fetch...');
                refetchComparison();
                window.location.reload();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const clearFilters = useCallback(() => {
    // console.log('🔄 ProductComparisonPage: Clearing all filters');
    setSelectedDiscipline('');
    setSelectedSubCategory('');
    setSelectedProduct('');
    setSelectedCapacity('');
    setSelectedBrands([]);
    setSearchTerm('');
    setSearchBasedFilter(null);
    setIsSelectingSuggestion(false);
    setUserHasMadeSelection(false);
  }, []);

  const handleSearchBasedFilter = useCallback((suggestion) => {
    console.log('🎯 SUGGESTION_DEBUG: Setting search-based filter:', suggestion);
    
    // Set the flag to prevent search term clearing from interfering
    setIsSelectingSuggestion(true);
    
    // Set the search-based filter
    setSearchBasedFilter(suggestion);
    
    // Clear all dropdown filter states to ensure independence
    setSelectedDiscipline('');
    setSelectedSubCategory('');
    setSelectedProduct('');
    setSelectedCapacity('');
    setSelectedBrands([]);
    
    // Clear search term to show that selection was applied
    setSearchTerm('');
    
    // Set user has made selection to prevent auto-selection interference
    setUserHasMadeSelection(true);
    
    // Reset the flag immediately after all state updates
    // Use requestAnimationFrame to ensure all state updates are processed first
    requestAnimationFrame(() => {
      console.log('🎯 SUGGESTION_DEBUG: Resetting isSelectingSuggestion to false');
      setIsSelectingSuggestion(false);
    });
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      <TopBarPC />
      <div
        className="flex flex-1 border-t border-[#E0E0E0] gap-2.5 bg-gray-300 pr-1.5 pl-1.5 pt-1.5"
        style={{ height: "calc(100vh - 72px)" }}
      >
        <Sidebar
          selectedProduct={selectedProduct}
          setSelectedProduct={handleProductChange}
          selectedCapacity={selectedCapacity}
          setSelectedCapacity={handleCapacityChange}
          selectedService={selectedDiscipline}
          setSelectedService={handleDisciplineChange}
          selectedSubService={selectedSubCategory}
          setSelectedSubService={handleSubCategoryChange}
          selectedBrands={selectedBrands}
          setSelectedBrands={handleBrandChange}
          availableProductTypes={availableProductTypes}
          availableServices={availableDisciplines}
          availableSubServices={availableSubCategories}
          availableCapacities={availableCapacities}
          availableBrands={availableBrands}
          isLoadingServices={isLoadingDisciplines}
          isLoadingSubServices={isLoadingSubCategoriesByDiscipline}
          isLoadingProducts={isLoadingProducts}
          isLoadingCapacities={isLoadingCapacities}
          isLoadingBrands={isLoadingBrands}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearFilters={clearFilters}
          allProducts={transformedProducts}
          onUserSelection={() => setUserHasMadeSelection(true)}
          onSearchBasedFilter={handleSearchBasedFilter}
        />
        {shouldShowComparison && allProducts ? (
          <ProductComparison
            selectedProduct={selectedProduct}
            selectedCapacity={selectedCapacity}
            selectedBrands={selectedBrands}
            selectedService={selectedDiscipline}
            selectedSubService={selectedSubCategory}
            allProducts={allProducts}
            comparisonTitle={comparisonTitle}
            filteredProducts={filteredProductsData}
          />
        ) : (
          <div className="flex-1 p-4 text-gray-500 text-center flex items-center flex-col justify-center border border-[#D1D5DB] rounded-[6px] bg-amber-50">
            <img src="/src/assets/img.png" alt="Placeholder" className="w-[300px] h-auto mx-auto mb-4" />
            <div className="text-lg font-medium mb-2">
              {filteredProductsData.length > 0
                ? `Showing ${filteredProductsData.length} available products`
                : 'Use smart search or select filters to compare products'
              }
            </div>
            <div className="text-sm text-gray-600">
              {isPageLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Loading product data...
                </div>
              ) : filteredProductsData.length > 0 ? (
                'Products are available. Use smart search to find specific services, products, brands, or select filters to narrow down results.'
              ) : (
                'Use the smart search box to find products by typing services, sub-services, products, brands, or capacities. Select from suggestions to filter products.'
              )}
            </div>
            {transformedProducts.length > 0 && (
              <div className="mt-4 text-xs text-gray-500">
                {transformedProducts.length} products available in database
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComparisonPage;
