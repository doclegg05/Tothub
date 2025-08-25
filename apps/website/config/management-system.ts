// Configuration for TotHub Management System URLs
// Update these URLs when deploying to production

export const MANAGEMENT_SYSTEM_CONFIG = {
  // Development URLs
  development: {
    baseUrl: 'http://127.0.0.1:5000',
    loginUrl: 'http://127.0.0.1:5000/login',
    registerUrl: 'http://127.0.0.1:5000/register',
    dashboardUrl: 'http://127.0.0.1:5000/dashboard',
  },
  
  // Production URLs (update these when deploying)
  production: {
    baseUrl: 'https://app.tothub.com', // or your production domain
    loginUrl: 'https://app.tothub.com/login',
    registerUrl: 'https://app.tothub.com/register',
    dashboardUrl: 'https://app.tothub.com/dashboard',
  }
};

// Get the appropriate URLs based on environment
export const getManagementSystemUrls = () => {
  // Default to development URLs for now
  // In production, this will be overridden by build process
  return MANAGEMENT_SYSTEM_CONFIG.development;
};

// Export individual URLs for easy use
export const { loginUrl, registerUrl, dashboardUrl } = MANAGEMENT_SYSTEM_CONFIG.development;
