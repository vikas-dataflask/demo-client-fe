// Vedi API Configuration
export const vediConfig = {
  // Development: Use proxy to avoid CORS
  // Production: Use direct API endpoints
  baseUrl: import.meta.env.DEV ? '/vedi-api' : 'https://oauth1.askmantu.com',
  
  // API Endpoints
  uploadEndpoint: '/vedi/upload',
  queryEndpoint: '/vedi/query',
  
  // Request Configuration
  timeout: 30000, // 30 seconds
  
  // CORS and Proxy Settings
  useProxy: import.meta.env.DEV,
  fallbackToDirect: true, // Try direct URL if proxy fails
  
  // Headers
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  
  // File Upload Settings
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: ['.pdf', '.dxf', '.dwg'],
  
  // Rate Limiting
  requestDelay: 500, // ms between requests
  maxRetries: 3,
};

// Helper function to get full endpoint URL
export const getEndpointUrl = (endpoint) => {
  return `${vediConfig.baseUrl}${endpoint}`;
};

// Helper function to check if we're in development
export const isDevelopment = () => {
  return import.meta.env.DEV;
};
