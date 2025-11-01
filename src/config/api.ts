// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://7cvccltb-3100.inc1.devtunnels.ms/api',
  // BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.utpfund.live/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Environment variables that should be set:
// VITE_API_BASE_URL=http://localhost:3100/api (or your production API URL)
