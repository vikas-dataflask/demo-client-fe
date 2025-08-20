// src/components/ProductComparison/ComparisonPlaceholder.jsx
import React from "react";

const ComparisonPlaceholder = () => {
  return (
    <div className="flex-1 bg-[#F8F8F8] flex items-center justify-center relative">
      <div className="text-center mt-[-40px]">
        <img
          src="img.png"
          alt="Placeholder"
          className="w-[300px] h-auto mx-auto mb-4"
        />
        <p className="text-sm text-[#9E9E9E]">
          Add basic details and select product to make comparison
        </p>
      </div>
    </div>
  );
};

export default ComparisonPlaceholder;
