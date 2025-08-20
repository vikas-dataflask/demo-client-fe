// src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBarPC from "./TopBarPC";
import BackArrowIcon from "../../icons/BackArrowIcon";
import { useGetProductsWithSpecsQuery } from "../../redux/features/api/adminApi";
// Import the available image as fallback
import productImage from "../../images/image.png";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from admin backend
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useGetProductsWithSpecsQuery();

  useEffect(() => {
    if (productsData && productsData.success && productsData.data.products) {
      try {
        // Find product by ID or model number
        const foundProduct = productsData.data.products.find(
          (p) => p.id === productId || p.modelNumber === productId
        );

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError("Product not found.");
        }
      } catch (e) {
        console.error("Failed to process product details:", e);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    } else if (productsError) {
      setError("Failed to load product details.");
      setLoading(false);
    } else if (!productsLoading) {
      setLoading(false);
    }
  }, [productsData, productsError, productsLoading, productId]);

  // Function to get the product image with proper fallback
  const getProductImage = (product) => {
    // Admin backend base URL for serving uploaded images
    const adminBaseUrl = 'http://localhost:3001';
    
    // First try to use the product's imageUrl if it exists and is valid
    if (product?.imageUrl && product.imageUrl !== 'Unknown' && product.imageUrl !== '--') {
      let finalImageUrl;
      
      // If imageUrl is already a full URL, use it as is
      if (product.imageUrl.startsWith('http')) {
        finalImageUrl = product.imageUrl;
      }
      // If imageUrl is a relative path, prepend the admin base URL
      else if (product.imageUrl.startsWith('/uploads/')) {
        finalImageUrl = `${adminBaseUrl}${product.imageUrl}`;
      }
      // If imageUrl is just a filename, construct the full path
      else {
        finalImageUrl = `${adminBaseUrl}/uploads/${product.imageUrl}`;
      }
      
      return finalImageUrl;
    }
    
    // If no valid imageUrl, use the imported fallback image
    return productImage;
  };

  if (loading || productsLoading) {
    return (
      <div className="h-screen w-full flex flex-col bg-white">
        <TopBarPC />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col bg-white">
        <TopBarPC />
        <div className="flex-1 flex items-center justify-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen w-full flex flex-col bg-white">
        <TopBarPC />
        <div className="flex-1 flex items-center justify-center">
          No product data available.
        </div>
      </div>
    );
  }

  // Generate dynamic specifications from product data
  const generateSpecificationsData = (product) => {
    const specs = [];
    
    // Always include essential specs
    if (product.brand) specs.push({ key: "Brand", value: product.brand });
    if (product.price) specs.push({ key: "Price", value: product.price });
    if (product.typesOfFixtures) specs.push({ key: "Product Name", value: product.typesOfFixtures });
    if (product.capacity) specs.push({ key: "Capacity", value: product.capacity });
    if (product.modelNumber) specs.push({ key: "Model Number", value: product.modelNumber });
    
    // Add specs from technicalSpecs object
    if (product.technicalSpecs && typeof product.technicalSpecs === 'object') {
      Object.entries(product.technicalSpecs).forEach(([key, value]) => {
        if (value && value !== 'Unknown' && value !== '--') {
          // Convert camelCase to Title Case for display
          const displayKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          specs.push({ key: displayKey, value: value });
        }
      });
    }
    
    // Add common direct properties if they exist and have values
    const directProps = [
      { key: 'voltage', display: 'Voltage' },
      { key: 'wattage', display: 'Wattage' },
      { key: 'current', display: 'Current' },
      { key: 'frequency', display: 'Frequency' },
      { key: 'lampType', display: 'Lamp Type' },
      { key: 'ipRatingAFO', display: 'IP Rating (AFO)' },
      { key: 'ipRatingMOS', display: 'IP Rating (MOS)' },
      { key: 'ikRating', display: 'IK Rating' },
      { key: 'cri', display: 'Color Rendering Index (CRI)' },
      { key: 'colorTemperature', display: 'Color Temperature' },
      { key: 'lumenOutput', display: 'Lumen Output' },
      { key: 'coolingCapacity', display: 'Cooling Capacity' },
      { key: 'heatingCapacity', display: 'Heating Capacity' },
      { key: 'airflow', display: 'Airflow' },
      { key: 'noiseLevel', display: 'Noise Level' },
      { key: 'flowRate', display: 'Flow Rate' },
      { key: 'pressure', display: 'Pressure' },
      { key: 'pipeSize', display: 'Pipe Size' },
      { key: 'extinguishingAgent', display: 'Extinguishing Agent' },
      { key: 'coverageArea', display: 'Coverage Area' },
      { key: 'dischargeTime', display: 'Discharge Time' },
      { key: 'dimensions', display: 'Dimensions' },
      { key: 'weight', display: 'Weight' },
      { key: 'material', display: 'Material' },
      { key: 'warranty', display: 'Warranty' }
    ];
    
    directProps.forEach(({ key, display }) => {
      if (product[key] && product[key] !== 'Unknown' && product[key] !== '--') {
        specs.push({ key: display, value: product[key] });
      }
    });
    
    return specs;
  };

  const specificationsData = generateSpecificationsData(product);
  
  // Generate dynamic product description based on available data
  const generateProductDescription = (product) => {
    const parts = [];
    
    if (product.typesOfFixtures) {
      parts.push(product.typesOfFixtures);
    }
    
    if (product.capacity) {
      parts.push(`with capacity ${product.capacity}`);
    }
    
    if (product.brand) {
      parts.push(`manufactured by ${product.brand}`);
    }
    
    if (product.technicalSpecs?.voltage) {
      parts.push(`operating at ${product.technicalSpecs.voltage}`);
    }
    
    if (parts.length > 0) {
      return parts.join(', ') + '.';
    }
    
    return 'Product details available from the manufacturer.';
  };

  const productDescription = generateProductDescription(product);
  const productTitle = product ? `${product.typesOfFixtures} ${product.capacity}` : "Product Details";
  const productModelNumber = product ? product.modelNumber : "";
  const productImageSrc = getProductImage(product);

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Top Bar is now fixed */}
      <TopBarPC />
      {/* Main content container with independent scrolling columns */}
      <div className="flex-1 px-[24px] pt-[24px] pb-[24px] bg-[#F3F4F6] flex gap-[24px] overflow-hidden">
        {/* Left side box container, now with independent scrolling */}
        <div className="flex-1 min-w-0 max-w-[895px] flex flex-col gap-[24px] overflow-y-auto">
          {/* Back to Comparison Button */}
          <button
            className="inline-flex items-center gap-2 border border-[#D0D5DD] px-[16px] py-[8px] rounded-[8px] text-[#344054] text-[14px] font-medium cursor-pointer hover:bg-[#F9FAFB] transition w-fit"
            onClick={() => navigate(-1)}
          >
            <span className="text-xl">
              <BackArrowIcon />
            </span>
            <span>Back to Comparison</span>
          </button>
          {/* The main content box on the left */}
          <div className="w-full bg-white p-[24px] rounded-lg border border-gray-200 shadow-sm flex flex-col gap-[24px]">
            {/* Product Details Header */}
            <div className="flex flex-col gap-[4px]">
              <h1 className="text-[20px] font-semibold text-gray-900">
                {productTitle}
              </h1>
              <p className="text-[14px] text-gray-500">{productModelNumber}</p>
            </div>
            {/* Image Box */}
            <div className="w-full h-auto rounded-lg overflow-hidden border border-gray-200">
              <img
                src={productImageSrc}
                alt={productTitle}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // If the product image fails to load, use the fallback
                  e.target.src = productImage;
                }}
              />
            </div>
            {/* Description Section */}
            <div>
              <h2 className="text-[16px] font-semibold text-gray-800 mb-[8px]">
                Description
              </h2>
              <p className="text-[13px] text-gray-600 leading-[18px]">
                {productDescription}
              </p>
            </div>
          </div>
        </div>
        {/* Right side box container, now with independent scrolling */}
        <div className="w-[450px] flex-shrink-0 bg-white p-[24px] rounded-lg border border-gray-200 shadow-sm overflow-y-auto">
          <h2 className="text-[16px] font-semibold text-gray-800 mb-[16px]">
            Key Specifications
          </h2>
          <div className="border border-[#E0E0E0] rounded-lg overflow-hidden text-[13px]">
            {specificationsData.map((spec, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 ${
                  index < specificationsData.length - 1
                    ? "border-b border-[#E0E0E0]"
                    : ""
                }`}
              >
                <div className="bg-[#F9FAFB] px-[16px] py-[12px] font-medium text-gray-800">
                  {spec.key}
                </div>
                <div className="bg-white px-[16px] py-[12px] font-normal text-gray-600">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
