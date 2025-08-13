import React from 'react';

const CircuitingIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Main circuit path */}
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    
    {/* Circuit nodes */}
    <circle cx="13" cy="2" r="1" fill="currentColor" />
    <circle cx="3" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="22" r="1" fill="currentColor" />
    <circle cx="21" cy="10" r="1" fill="currentColor" />
  </svg>
);

export default CircuitingIcon;
