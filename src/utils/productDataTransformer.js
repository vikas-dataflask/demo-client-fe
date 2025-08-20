// Utility to transform admin backend data to match existing JSON structure

export const transformAdminDataToProductFormat = (adminData) => {
  if (!adminData || !adminData.success || !adminData.data) {
    return [];
  }

  const products = [];
  
  // Handle the new comparison-data structure from ProductSpecification collection
  if (adminData.data.products && Array.isArray(adminData.data.products)) {
    // Validate each product before adding
    adminData.data.products.forEach((product, index) => {
      // Enhanced validation - check for essential fields
      const isValidProduct = product.service && 
                           product.subService && 
                           product.brand && 
                           product.typesOfFixtures &&
                           product.capacity;
      
      if (!isValidProduct) {
        return;
      }

      // Clean and filter technical specifications
      const cleanTechnicalSpecs = {};
      if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
        Object.entries(product.technicalSpecs).forEach(([key, value]) => {
          // Only include specs with meaningful values
          if (value && 
              value !== 'Unknown' && 
              value !== '--' && 
              value !== '' && 
              value !== null && 
              value !== undefined &&
              !key.toLowerCase().includes('id') && // Skip ID fields
              !key.toLowerCase().includes('created') && // Skip timestamp fields
              !key.toLowerCase().includes('updated')) {
            cleanTechnicalSpecs[key] = value;
          }
        });
      }
      
      const transformedProduct = {
        id: product.id || `product-${index + 1}`,
        service: product.service,
        subService: product.subService,
        brand: product.brand,
        brandLogo: product.brandLogo || '',
        imageUrl: product.imageUrl || '',  // ← ADD THIS LINE!
        price: product.price || '₹0',
        typesOfFixtures: product.typesOfFixtures,
        capacity: product.capacity || 'Unknown',
        capacityUnit: product.capacityUnit || '',
        modelNumber: product.modelNumber || product.typesOfFixtures,
        
        // Enhanced technical specifications mapping with cleaned data
        voltage: product.voltage || cleanTechnicalSpecs.voltage || null,
        wattage: product.wattage || cleanTechnicalSpecs.wattage || null,
        lampType: product.lampType || cleanTechnicalSpecs.lampType || null,
        ipRatingAFO: product.ipRatingAFO || cleanTechnicalSpecs.ipRatingAFO || null,
        ipRatingMOS: product.ipRatingMOS || cleanTechnicalSpecs.ipRatingMOS || null,
        ikRating: product.ikRating || cleanTechnicalSpecs.ikRating || null,
        cri: product.cri || cleanTechnicalSpecs.cri || null,
        
        button: 'View Details',
        
        // Full technical specifications object for comprehensive access (cleaned)
        technicalSpecs: cleanTechnicalSpecs,
        
        // Additional metadata for debugging and future use
        productId: product.productId,
        disciplineId: product.disciplineId,
        subCategoryId: product.subCategoryId,
        manufacturerId: product.manufacturerId,
        capacityId: product.capacityId,
        locationId: product.locationId,
        
        // Manufacturer information
        manufacturer: product.manufacturer || null
      };
      
      products.push(transformedProduct);
    });
  }
  
  // Handle direct ProductSpecification array (fallback)
  else if (Array.isArray(adminData.data)) {
    adminData.data.forEach((spec, index) => {
      // Transform ProductSpecification to product format
      const transformedProduct = transformSpecificationToProduct(spec, index);
      if (transformedProduct) {
        products.push(transformedProduct);
      }
    });
  }
  
  return products;
};

const transformSingleProduct = (product, index) => {
  try {
    console.log(`🔄 DataTransformer: Transforming single product ${index + 1}:`, {
      productName: product.name,
      hasDiscipline: !!product.discipline_id,
      hasSubCategory: !!product.sub_category_id,
      hasManufacturer: !!product.manufacturerId,
      hasTechnicalSpecs: !!product.technicalSpecs
    });
    
    // Extract basic product info from real database data
    const discipline = product.discipline_id?.name || product.discipline || 'Unknown';
    const subCategory = product.sub_category_id?.name || product.subCategory || 'Unknown';
    
    // Use real discipline and subcategory names - no hardcoded mapping
    const service = discipline;
    const subService = subCategory;

    // Extract and clean specifications from technicalSpecs if available
    const rawSpecs = product.technicalSpecs || product.specifications || {};
    const cleanSpecs = {};
    
    Object.entries(rawSpecs).forEach(([key, value]) => {
      if (value && 
          value !== 'Unknown' && 
          value !== '--' && 
          value !== '' && 
          value !== null && 
          value !== undefined &&
          !key.toLowerCase().includes('id') &&
          !key.toLowerCase().includes('created') &&
          !key.toLowerCase().includes('updated')) {
        cleanSpecs[key] = value;
      }
    });
    
    const transformed = {
      id: product._id || product.id || `prod-${index + 1}`,
      service: service,
      subService: subService,
      brand: product.manufacturerId?.name || product.manufacturer || 'Unknown',
      brandLogo: product.manufacturerId?.logoUrl || product.manufacturer?.logoUrl || '',
      imageUrl: product.imageUrl || '',  // ← ADD THIS LINE!
      price: cleanSpecs.price || cleanSpecs.cost || '₹0',
      typesOfFixtures: product.name || product.typesOfFixtures || 'Unknown',
      capacity: product.capacity || cleanSpecs.capacity || 'Unknown',
      capacityUnit: product.capacityUnit || cleanSpecs.capacityUnit || '',
      modelNumber: cleanSpecs.modelNumber || cleanSpecs.model || product.name || 'Unknown',
      voltage: cleanSpecs.voltage || cleanSpecs.voltageRating || null,
      wattage: cleanSpecs.wattage || cleanSpecs.power || null,
      lampType: cleanSpecs.lampType || cleanSpecs.lamp || null,
      ipRatingAFO: cleanSpecs.ipRatingAFO || cleanSpecs.ipRating || null,
      ipRatingMOS: cleanSpecs.ipRatingMOS || null,
      ikRating: cleanSpecs.ikRating || cleanSpecs.impactRating || null,
      cri: cleanSpecs.cri || cleanSpecs.colorRenderingIndex || null,
      button: 'View Details',
      technicalSpecs: cleanSpecs
    };
    
    console.log(`✅ DataTransformer: Single product ${index + 1} transformed:`, {
      name: transformed.typesOfFixtures,
      brand: transformed.brand,
      service: transformed.service,
      subService: transformed.subService,
      cleanSpecsCount: Object.keys(cleanSpecs).length
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ DataTransformer: Error transforming product:', error, product);
    return null;
  }
};

const transformSpecificationToProduct = (spec, index) => {
  try {
    console.log(`🔄 DataTransformer: Transforming ProductSpecification ${index + 1}:`, {
      hasDiscipline: !!spec.disciplineId,
      hasSubCategory: !!spec.subCategoryId,
      hasProduct: !!spec.productId,
      hasManufacturer: !!spec.manufacturerId,
      hasCapacity: !!spec.capacityId,
      hasLocation: !!spec.locationId,
      disciplineName: spec.disciplineId?.name,
      subCategoryName: spec.subCategoryId?.name,
      productName: spec.productId?.name,
      manufacturerName: spec.manufacturerId?.name,
      capacityValue: spec.capacityId?.capacity_value || spec.capacityId?.rating,
      locationInfo: spec.locationId ? `${spec.locationId.city}, ${spec.locationId.state}, ${spec.locationId.country}` : 'Unknown'
    });

    // Validate required relationships
    if (!spec.disciplineId || !spec.subCategoryId || !spec.productId || !spec.manufacturerId || !spec.capacityId) {
      console.log(`⚠️ DataTransformer: Skipping spec ${index + 1} - missing required relationships`);
      return null;
    }

    const discipline = spec.disciplineId;
    const subCategory = spec.subCategoryId;
    const product = spec.productId;
    const manufacturer = spec.manufacturerId;
    const capacity = spec.capacityId;
    const location = spec.locationId;

    // Convert technicalSpecs Map to object and clean it
    const rawTechSpecs = spec.technicalSpecs ? Object.fromEntries(spec.technicalSpecs) : {};
    const cleanTechSpecs = {};
    
    Object.entries(rawTechSpecs).forEach(([key, value]) => {
      if (value && 
          value !== 'Unknown' && 
          value !== '--' && 
          value !== '' && 
          value !== null && 
          value !== undefined &&
          !key.toLowerCase().includes('id') &&
          !key.toLowerCase().includes('created') &&
          !key.toLowerCase().includes('updated')) {
        cleanTechSpecs[key] = value;
      }
    });
    
    console.log(`📋 DataTransformer: Technical specs for spec ${index + 1}:`, {
      rawSpecsCount: Object.keys(rawTechSpecs).length,
      cleanSpecsCount: Object.keys(cleanTechSpecs).length,
      cleanSpecs: Object.keys(cleanTechSpecs)
    });
    
    const transformed = {
      id: spec._id || `spec-${index + 1}`,
      service: discipline.name,
      subService: subCategory.name,
      brand: manufacturer.name,
      brandLogo: manufacturer.logoUrl || '',
      imageUrl: spec.imageUrl || '',  // ← ADD THIS LINE!
      price: cleanTechSpecs.price || cleanTechSpecs.cost || '₹0',
      typesOfFixtures: product.name,
      capacity: capacity.capacity_value || capacity.rating || 'Unknown',
      capacityUnit: capacity.unit || '',
      modelNumber: cleanTechSpecs.modelNumber || cleanTechSpecs.model_number || cleanTechSpecs.model || product.name,
      
      // Enhanced technical specifications mapping with cleaned data
      voltage: cleanTechSpecs.voltage || cleanTechSpecs.voltageRating || null,
      wattage: cleanTechSpecs.wattage || cleanTechSpecs.power || null,
      current: cleanTechSpecs.current || cleanTechSpecs.ampRating || null,
      frequency: cleanTechSpecs.frequency || cleanTechSpecs.freq || null,
      
      // Lighting specific specs
      lampType: cleanTechSpecs.lampType || cleanTechSpecs.lamp_type || null,
      ipRatingAFO: cleanTechSpecs.ipRatingAFO || cleanTechSpecs.ip_rating || null,
      ipRatingMOS: cleanTechSpecs.ipRatingMOS || null,
      ikRating: cleanTechSpecs.ikRating || cleanTechSpecs.impactRating || null,
      cri: cleanTechSpecs.cri || cleanTechSpecs.colorRenderingIndex || null,
      colorTemperature: cleanTechSpecs.colorTemperature || cleanTechSpecs.cct || null,
      lumenOutput: cleanTechSpecs.lumenOutput || cleanTechSpecs.lumens || null,
      
      // HVAC specific specs
      coolingCapacity: cleanTechSpecs.coolingCapacity || cleanTechSpecs.cooling || null,
      heatingCapacity: cleanTechSpecs.heatingCapacity || cleanTechSpecs.heating || null,
      airflow: cleanTechSpecs.airflow || cleanTechSpecs.airFlow || null,
      pressure: cleanTechSpecs.pressure || cleanTechSpecs.pressureRating || null,
      efficiency: cleanTechSpecs.efficiency || cleanTechSpecs.energyEfficiency || null,
      noiseLevels: cleanTechSpecs.noiseLevels || cleanTechSpecs.noise || null,
      
      // Fire fighting specific specs
      flowRate: cleanTechSpecs.flowRate || cleanTechSpecs.flow || null,
      pressureRating: cleanTechSpecs.pressureRating || cleanTechSpecs.pressure || null,
      responseTime: cleanTechSpecs.responseTime || cleanTechSpecs.response || null,
      
      button: 'View Details',
      
      // Full technical specifications object for comprehensive access (cleaned)
      technicalSpecs: cleanTechSpecs,
      
      // Additional metadata for debugging and future use
      productId: product._id,
      disciplineId: discipline._id,
      subCategoryId: subCategory._id,
      manufacturerId: manufacturer._id,
      capacityId: capacity._id,
      locationId: location?._id,
      
      // Manufacturer information for enhanced brand display
      manufacturer: {
        name: manufacturer.name,
        logoUrl: manufacturer.logoUrl,
        discipline: manufacturer.discipline,
        subCategory: manufacturer.subCategory
      },
      
      // Location information
      location: location ? {
        city: location.city,
        state: location.state,
        country: location.country
      } : null,
      
      // Timestamps
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt
    };
    
    console.log(`✅ DataTransformer: Specification ${index + 1} successfully transformed:`, {
      name: transformed.typesOfFixtures,
      brand: transformed.brand,
      service: transformed.service,
      subService: transformed.subService,
      capacity: transformed.capacity,
      price: transformed.price,
      hasLogo: !!transformed.brandLogo,
      technicalSpecsCount: Object.keys(cleanTechSpecs).length,
      manufacturer: transformed.manufacturer
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ DataTransformer: Error transforming specification:', error, spec);
    return null;
  }
};

// Transform engineering disciplines to service options
export const transformDisciplinesToServices = (disciplines) => {
  console.log('🔄 DataTransformer: Transforming disciplines to services:', {
    hasData: !!disciplines,
    hasDataProperty: !!disciplines?.data,
    isArray: Array.isArray(disciplines?.data),
    count: disciplines?.data?.length || 0
  });
  
  if (!disciplines || !disciplines.data || !Array.isArray(disciplines.data)) {
    console.log('❌ DataTransformer: Invalid disciplines data structure:', disciplines);
    return [];
  }
  
  // Use real discipline names from database - no hardcoded mapping
  const services = disciplines.data
    .map(discipline => discipline.name)
    .filter((service, index, arr) => arr.indexOf(service) === index); // Remove duplicates
    
  console.log('✅ DataTransformer: Transformed services:', services);
  return services;
};

// Transform subcategories to subService options
export const transformSubCategoriesToSubServices = (subCategories) => {
  console.log('🔄 DataTransformer: Transforming subcategories to subServices:', {
    hasData: !!subCategories,
    hasDataProperty: !!subCategories?.data,
    isArray: Array.isArray(subCategories?.data),
    count: subCategories?.data?.length || 0,
    dataType: typeof subCategories?.data
  });
  
  if (!subCategories || !subCategories.data || !Array.isArray(subCategories.data)) {
    console.log('❌ DataTransformer: Invalid subcategories data structure:', subCategories);
    return [];
  }
  
  console.log('✅ DataTransformer: Data structure is valid, processing subcategories...');
  console.log('📊 DataTransformer: Number of subcategories:', subCategories.data.length);
  
  // Extract all subcategories from the data structure - no hardcoded mapping
  const allSubCategories = [];
  
  // Handle both flat array and grouped structure
  if (subCategories.data.length > 0 && subCategories.data[0].subcategories) {
    console.log('📊 DataTransformer: Processing grouped structure...');
    // Grouped structure
    subCategories.data.forEach(group => {
      if (group.subcategories && Array.isArray(group.subcategories)) {
        group.subcategories.forEach(subCategory => {
          allSubCategories.push(subCategory.name);
        });
      }
    });
  } else {
    console.log('📊 DataTransformer: Processing flat structure...');
    // Flat structure
    subCategories.data.forEach((subCategory, index) => {
      console.log(`📋 DataTransformer: SubCategory ${index + 1}:`, subCategory.name);
      if (subCategory.name) {
        allSubCategories.push(subCategory.name);
      }
    });
  }
  
  console.log('📊 DataTransformer: All subcategories extracted:', allSubCategories);
  
  // Use real subcategory names from database - no hardcoded mapping
  const subServices = allSubCategories
    .filter((subService, index, arr) => arr.indexOf(subService) === index); // Remove duplicates
    
  console.log('✅ DataTransformer: Transformed subServices:', subServices);
  return subServices;
};

// Transform manufacturers to brand options
export const transformManufacturersToBrands = (manufacturers) => {
  console.log('🔄 DataTransformer: Transforming manufacturers to brands:', {
    hasData: !!manufacturers,
    hasDataProperty: !!manufacturers?.data,
    isArray: Array.isArray(manufacturers?.data),
    count: manufacturers?.data?.length || 0
  });
  
  if (!manufacturers || !manufacturers.data || !Array.isArray(manufacturers.data)) {
    console.log('❌ DataTransformer: Invalid manufacturers data structure:', manufacturers);
    return [];
  }
  
  // Use real manufacturer names from database - no hardcoded mapping
  const brands = manufacturers.data
    .map(manufacturer => manufacturer.name)
    .filter((brand, index, arr) => arr.indexOf(brand) === index); // Remove duplicates
    
  console.log('✅ DataTransformer: Transformed brands:', brands);
  return brands;
}; 
