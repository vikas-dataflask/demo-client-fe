// src/components/ProductComparison/DebugInfo.jsx
import React from 'react';

const DebugInfo = ({ 
  comparisonData, 
  disciplinesData, 
  subCategoriesData,
  transformedProducts,
  selectedDiscipline,
  selectedSubCategory,
  selectedProduct,
  selectedCapacity,
  selectedBrands,
  filteredProductsData
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md max-h-96 overflow-auto shadow-lg z-50">
      <h3 className="font-bold text-sm mb-2">Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Comparison Data:</strong> {comparisonData?.success ? '✅' : '❌'}</div>
        <div><strong>Products Count:</strong> {comparisonData?.data?.products?.length || 0}</div>
        <div><strong>Disciplines:</strong> {disciplinesData?.data?.length || 0}</div>
        <div><strong>SubCategories:</strong> {subCategoriesData?.data?.length || 0}</div>
        <div><strong>Transformed Products:</strong> {transformedProducts?.length || 0}</div>
        <div><strong>Filtered Products:</strong> {filteredProductsData?.length || 0}</div>
        <hr className="my-1" />
        <div><strong>Selected Discipline:</strong> {selectedDiscipline || 'None'}</div>
        <div><strong>Selected SubCategory:</strong> {selectedSubCategory || 'None'}</div>
        <div><strong>Selected Product:</strong> {selectedProduct || 'None'}</div>
        <div><strong>Selected Capacity:</strong> {selectedCapacity || 'None'}</div>
        <div><strong>Selected Brands:</strong> {selectedBrands?.length || 0}</div>
        <hr className="my-1" />
        <div><strong>Sample Product:</strong></div>
        {transformedProducts?.[0] && (
          <div className="text-xs bg-gray-100 p-1 rounded">
            <div>Discipline: {transformedProducts[0].service}</div>
            <div>SubCategory: {transformedProducts[0].subService}</div>
            <div>Brand: {transformedProducts[0].brand}</div>
            <div>Product: {transformedProducts[0].typesOfFixtures}</div>
            <div>Capacity: {transformedProducts[0].capacity}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo; 