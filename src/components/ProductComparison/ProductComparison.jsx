// src/components/ProductComparison/ProductComparison.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import productImage from '../../images/image.png';

const ProductComparison = ({
  selectedProduct,
  selectedCapacity,
  selectedBrands,
  selectedService,
  selectedSubService,
  allProducts,
  comparisonTitle,
  filteredProducts,
}) => {
  const navigate = useNavigate();

  // Move all hooks to the top, before any conditional returns
  const products = filteredProducts || [];
  const title = comparisonTitle || "Product Comparison";

  // Generate dynamic spec titles from filtered products only
  const generateRelevantSpecTitles = useMemo(() => {
    const specCategories = {
      basic: new Set(),
      electrical: new Set(),
      lighting: new Set(),
      hvac: new Set(),
      fireFighting: new Set(),
      mechanical: new Set(),
      dimensions: new Set(),
      other: new Set()
    };

    // Define spec categories
    const categoryMappings = {
      basic: ['brand', 'price', 'productName', 'capacity', 'modelNumber', 'description'],
      electrical: ['voltage', 'wattage', 'current', 'frequency', 'powerRating', 'efficiency'],
      lighting: ['lampType', 'ipRatingAFO', 'ipRatingMOS', 'ikRating', 'cri', 'colorTemperature', 'lumenOutput', 'beamAngle', 'colorRenderingIndex'],
      hvac: ['coolingCapacity', 'heatingCapacity', 'airflow', 'noiseLevel', 'refrigerant', 'compressorType', 'fanSpeed', 'temperatureRange'],
      fireFighting: ['flowRate', 'pressure', 'responseTime', 'extinguishingAgent', 'coverageArea', 'dischargeTime', 'activationTemperature'],
      mechanical: ['pipeSize', 'material', 'weight', 'durability', 'maintenance', 'lifespan'],
      dimensions: ['dimensions', 'length', 'width', 'height', 'diameter', 'thickness'],
      other: ['warranty', 'certification', 'compliance', 'installation', 'operatingTemperature', 'humidityRange']
    };

    // Extract specs from filtered products only
    products.forEach(product => {
      // Add specs from technicalSpecs object
      if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
        Object.keys(product.technicalSpecs).forEach(key => {
          const value = product.technicalSpecs[key];
          // Only add specs that have meaningful values
          if (value && value !== 'Unknown' && value !== '--' && value !== '' && value !== null) {
            const displayKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
            
            // Categorize the spec
            let categorized = false;
            for (const [category, specs] of Object.entries(categoryMappings)) {
              if (specs.some(spec => key.toLowerCase().includes(spec.toLowerCase()))) {
                specCategories[category].add(displayKey);
                categorized = true;
                break;
              }
            }
            if (!categorized) {
              specCategories.other.add(displayKey);
            }
          }
        });
      }

      // Add direct product properties
      const directProps = [
        'voltage', 'wattage', 'current', 'frequency', 'lampType', 'ipRatingAFO', 
        'ipRatingMOS', 'ikRating', 'cri', 'colorTemperature', 'lumenOutput', 
        'coolingCapacity', 'heatingCapacity', 'airflow', 'noiseLevel', 'flowRate', 
        'pressure', 'pipeSize', 'extinguishingAgent', 'coverageArea', 'dischargeTime', 
        'dimensions', 'weight', 'material', 'warranty', 'efficiency', 'refrigerant',
        'compressorType', 'fanSpeed', 'temperatureRange', 'responseTime', 
        'activationTemperature', 'durability', 'maintenance', 'lifespan', 'certification',
        'compliance', 'installation', 'operatingTemperature', 'humidityRange'
      ];

      directProps.forEach(prop => {
        if (product[prop] && product[prop] !== 'Unknown' && product[prop] !== '--' && product[prop] !== '') {
          const displayKey = prop
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          
          // Categorize the spec
          let categorized = false;
          for (const [category, specs] of Object.entries(categoryMappings)) {
            if (specs.some(spec => prop.toLowerCase().includes(spec.toLowerCase()))) {
              specCategories[category].add(displayKey);
              categorized = true;
              break;
            }
          }
          if (!categorized) {
            specCategories.other.add(displayKey);
          }
        }
      });
    });

    // Convert to organized structure
    const organizedSpecs = {};
    for (const [category, specs] of Object.entries(specCategories)) {
      if (specs.size > 0) {
        organizedSpecs[category] = Array.from(specs).sort();
      }
    }

    console.log('📋 ProductComparison: Generated relevant spec categories:', organizedSpecs);
    return organizedSpecs;
  }, [products]);

  console.log('🚀 ProductComparison: Component rendered with props:', {
    selectedProduct,
    selectedCapacity,
    selectedBrands: selectedBrands.length,
    selectedService,
    selectedSubService,
    allProductsCount: allProducts?.length || 0,
    filteredProductsCount: filteredProducts?.length || 0,
    comparisonTitle
  });

  if (!allProducts) {
    console.log('⚠️ ProductComparison: No allProducts data available');
    return (
      <div className="flex-1 p-4 text-gray-500 text-center flex items-center flex-col justify-center border border-[#D1D5DB] rounded-[6px] bg-amber-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg font-medium mb-2">Loading products...</div>
      </div>
    );
  }

  console.log('📊 ProductComparison: Processing products:', {
    productsCount: products.length,
    title
  });

  if (products.length === 0) {
    console.log('⚠️ ProductComparison: No products to display');
    return (
      <div className="flex-1 p-4 text-gray-500 text-center flex items-center flex-col justify-center border border-[#D1D5DB] rounded-[6px] bg-amber-50">
        <div className="text-lg font-medium mb-2">No products found</div>
        <div className="text-sm mb-4">Please adjust your filters or try different selections.</div>
        <div className="text-xs text-gray-400">
          Available products in database: {allProducts.length}
        </div>
      </div>
    );
  }

  const getSpecValue = (product, title) => {
    // Enhanced spec value extraction with better fallbacks and debugging
    const map = {
      Brand: product.brand || product.manufacturer?.name || "—",
      Price: product.price || product.technicalSpecs?.price || "₹0",
      "Product Name": product.typesOfFixtures || product.name || "—",
      Capacity: product.capacity ? `${product.capacity} ${product.capacityUnit || ''}`.trim() : "—",
      "Model Number": product.modelNumber || product.technicalSpecs?.modelNumber || "—",
    };
    
    // Check if it's a direct mapping first
    if (map[title]) {
      return map[title];
    }
    
    // Check technicalSpecs object
    if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
      // Convert display title back to camelCase for lookup
      const camelCaseKey = title
        .toLowerCase()
        .replace(/\s+(.)/g, (match, group) => group.toUpperCase());
      
      if (product.technicalSpecs[camelCaseKey] !== undefined && 
          product.technicalSpecs[camelCaseKey] !== null && 
          product.technicalSpecs[camelCaseKey] !== 'Unknown') {
        return product.technicalSpecs[camelCaseKey];
      }
      
      // Try direct key match
      if (product.technicalSpecs[title] !== undefined && 
          product.technicalSpecs[title] !== null && 
          product.technicalSpecs[title] !== 'Unknown') {
        return product.technicalSpecs[title];
      }
    }
    
    // Check direct product properties
    const camelCaseKey = title
      .toLowerCase()
      .replace(/\s+(.)/g, (match, group) => group.toUpperCase());
    
    if (product[camelCaseKey] !== undefined && 
        product[camelCaseKey] !== null && 
        product[camelCaseKey] !== 'Unknown') {
      return product[camelCaseKey];
    }
    
    // Return dash for missing specs instead of "Unknown"
    return "—";
  };

  const getProductImage = (product) => {
    const adminBaseUrl = 'http://localhost:3001';
    const productName = product.typesOfFixtures || product.productName || product.name || 'Product';
    
    // Use product image if available and valid
    if (product?.imageUrl && product.imageUrl !== 'Unknown' && product.imageUrl !== '--') {
      let finalImageUrl;
      if (product.imageUrl.startsWith('http')) {
        finalImageUrl = product.imageUrl;
      } else if (product.imageUrl.startsWith('/uploads/')) {
        finalImageUrl = `${adminBaseUrl}${product.imageUrl}`;
      } else {
        finalImageUrl = `${adminBaseUrl}/uploads/${product.imageUrl}`;
      }
      
      return (
        <img
          src={finalImageUrl}
          alt={productName}
          className="w-[80px] h-[80px] object-contain rounded-lg border border-gray-200 shadow-sm"
          onError={(e) => { 
            e.target.src = productImage; 
          }}
        />
      );
    }
    
    // If no product image, use brand logo if available
    if (product?.brandLogo) {
      let logoUrl = product.brandLogo;
      if (!logoUrl.startsWith('http')) {
        logoUrl = `${adminBaseUrl}/uploads/${logoUrl.replace(/^\/uploads\//, '')}`;
      }
      
      return (
        <img
          src={logoUrl}
          alt={product.brand || product.manufacturer?.name || 'Brand'}
          className="w-[80px] h-[80px] object-contain rounded-lg border border-gray-200 shadow-sm"
          onError={(e) => { 
            e.target.src = productImage; 
          }}
        />
      );
    }
    
    // Fallback colored placeholder
    const getProductColor = (name) => {
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    };
    
    return (
      <div className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center text-xs font-bold text-white ${getProductColor(productName)}`}>
        {productName.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      basic: 'Basic Information',
      electrical: 'Electrical Specifications',
      lighting: 'Lighting Specifications',
      hvac: 'HVAC Specifications',
      fireFighting: 'Fire Fighting Specifications',
      mechanical: 'Mechanical Specifications',
      dimensions: 'Dimensions & Physical',
      other: 'Other Specifications'
    };
    return categoryNames[category] || category;
  };

  console.log('📊 ProductComparison: Rendering comparison table with:', {
    productsCount: products.length,
    specCategoriesCount: Object.keys(generateRelevantSpecTitles).length,
    selectedBrandsCount: selectedBrands.length
  });

  // Log sample product data for debugging
  if (products.length > 0) {
    console.log('📋 ProductComparison: Sample product data:', {
      productName: products[0].typesOfFixtures,
      brand: products[0].brand,
      capacity: products[0].capacity,
      price: products[0].price,
      imageUrl: products[0].imageUrl,
      brandLogo: products[0].brandLogo,
      hasImageUrl: !!products[0].imageUrl,
      hasBrandLogo: !!products[0].brandLogo,
      technicalSpecs: products[0].technicalSpecs,
      manufacturer: products[0].manufacturer
    });
  }

  return (
    <div className="flex-1 bg-white flex flex-col border border-[#D1D5DB] rounded-[8px] overflow-hidden">
      <div className="text-[14px] font-semibold bg-[#F9FAFB] border-b border-[#D1D5DB] px-[16px] py-[12px]">
        {title} - {selectedProduct} ({selectedCapacity})
        <div className="text-xs font-normal text-gray-500 mt-1">
          {products.length} products found • {selectedBrands.length > 0 ? `${selectedBrands.length} manufacturers selected` : 'All manufacturers'}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div
          className="grid text-[13px] text-[#111928]"
          style={{
            gridTemplateColumns: `210px repeat(${products.length}, 200px)`,
            padding: "16px",
          }}
        >
          {/* Header Row */}
          <div className="border-r border-[#D1D5DB] bg-[#F9FAFB] font-medium px-[12px] py-[10px]">
            Product Images & Specifications
          </div>
          {products.map((product, i) => (
            <div
              key={i}
              className="border-r border-b border-[#D1D5DB] px-[16px] py-[16px] flex justify-center"
            >
              {getProductImage(product)}
            </div>
          ))}

          {/* Specs by Category */}
          {Object.entries(generateRelevantSpecTitles).map(([category, specs]) => (
            <React.Fragment key={category}>
              {/* Category Header */}
              <div className="border-t border-r border-[#D1D5DB] bg-[#E5E7EB] px-[12px] py-[8px] font-semibold text-[12px] text-[#374151] col-span-full">
                {getCategoryDisplayName(category)}
              </div>
              
              {/* Specs in this category */}
              {specs.map((spec, i) => (
                <React.Fragment key={`${category}-${spec}`}>
                  <div className="border-t border-r border-[#D1D5DB] bg-[#F9FAFB] px-[12px] py-[10px] font-medium">
                    {spec}
                  </div>
                  {products.map((product, j) => (
                    <div
                      key={j}
                      className="border-t border-r border-[#D1D5DB] px-[12px] py-[10px] text-center"
                    >
                      {getSpecValue(product, spec)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}

          {/* Action Buttons */}
          <div className="border-t border-[#D1D5DB] bg-[#F9FAFB] px-[12px] py-[10px]" />
          {products.map((product, i) => (
            <div
              key={i}
              className="border-t border-r border-[#D1D5DB] px-[16px] py-[14px] flex justify-center"
            >
              <button
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] px-[14px] py-[6px] rounded-[6px] transition-colors"
                onClick={() => {
                  console.log('🔄 ProductComparison: Navigating to product details:', product.id || product._id);
                  navigate(`/product/${product.id || product._id}`);
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
