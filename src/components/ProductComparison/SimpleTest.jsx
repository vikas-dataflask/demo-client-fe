// src/components/ProductComparison/SimpleTest.jsx
import React, { useEffect, useState } from 'react';

const SimpleTest = () => {
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    const testApis = async () => {
      const results = {};
      
      try {
        // Test 1: Comparison data
        console.log('Testing comparison data...');
        const comparisonResponse = await fetch('http://localhost:3001/api/products/comparison-data');
        const comparisonData = await comparisonResponse.json();
        results.comparison = {
          success: comparisonResponse.ok,
          data: comparisonData,
          productsCount: comparisonData?.data?.products?.length || 0
        };
        console.log('Comparison data result:', results.comparison);
      } catch (error) {
        results.comparison = { success: false, error: error.message };
        console.error('Comparison data error:', error);
      }

      try {
        // Test 2: Disciplines
        console.log('Testing disciplines...');
        const disciplinesResponse = await fetch('http://localhost:3001/api/engineering-disciplines/comparison/list');
        const disciplinesData = await disciplinesResponse.json();
        results.disciplines = {
          success: disciplinesResponse.ok,
          data: disciplinesData,
          count: disciplinesData?.data?.length || 0
        };
        console.log('Disciplines result:', results.disciplines);
      } catch (error) {
        results.disciplines = { success: false, error: error.message };
        console.error('Disciplines error:', error);
      }

      try {
        // Test 3: Subcategories
        console.log('Testing subcategories...');
        const subcategoriesResponse = await fetch('http://localhost:3001/api/engineering-subcategories/comparison/list');
        const subcategoriesData = await subcategoriesResponse.json();
        results.subcategories = {
          success: subcategoriesResponse.ok,
          data: subcategoriesData,
          count: subcategoriesData?.data?.length || 0
        };
        console.log('Subcategories result:', results.subcategories);
      } catch (error) {
        results.subcategories = { success: false, error: error.message };
        console.error('Subcategories error:', error);
      }

      setTestResults(results);
    };

    testApis();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md max-h-96 overflow-auto shadow-lg z-50">
      <h3 className="font-bold text-sm mb-2">Simple API Test</h3>
      <div className="text-xs space-y-2">
        <div>
          <strong>Comparison Data:</strong> 
          {testResults.comparison?.success ? '✅' : '❌'}
          {testResults.comparison?.productsCount && ` (${testResults.comparison.productsCount} products)`}
        </div>
        <div>
          <strong>Disciplines:</strong> 
          {testResults.disciplines?.success ? '✅' : '❌'}
          {testResults.disciplines?.count && ` (${testResults.disciplines.count} disciplines)`}
        </div>
        <div>
          <strong>Subcategories:</strong> 
          {testResults.subcategories?.success ? '✅' : '❌'}
          {testResults.subcategories?.count && ` (${testResults.subcategories.count} subcategories)`}
        </div>
        
        {Object.keys(testResults).length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600">Show Details</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default SimpleTest; 