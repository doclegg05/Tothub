// Configuration for TotHub Management System URLs
// Uses environment variables for flexibility across environments

// Get base URL from environment or use defaults
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ variables
    return process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:5000';
  }
  // Server-side: same for now, but could use different variables
  return process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:5000';
};

// Build URLs from base or use specific overrides
const baseUrl = getAppUrl();

export const loginUrl = process.env.NEXT_PUBLIC_APP_LOGIN_URL || `${baseUrl}/login`;
export const registerUrl = process.env.NEXT_PUBLIC_APP_REGISTER_URL || `${baseUrl}/register`;
export const dashboardUrl = process.env.NEXT_PUBLIC_APP_DASHBOARD_URL || `${baseUrl}/dashboard`;

// Legacy export for backwards compatibility
export const MANAGEMENT_SYSTEM_CONFIG = {
  development: {
    baseUrl: 'http://127.0.0.1:5000',
    loginUrl: 'http://127.0.0.1:5000/login',
    registerUrl: 'http://127.0.0.1:5000/register',
    dashboardUrl: 'http://127.0.0.1:5000/dashboard',
  },
  production: {
    baseUrl: 'https://thetothub.com',
    loginUrl: 'https://thetothub.com/login',
    registerUrl: 'https://thetothub.com/register',
    dashboardUrl: 'https://thetothub.com/dashboard',
  }
};

export const getManagementSystemUrls = () => {
  return {
    baseUrl,
    loginUrl,
    registerUrl,
    dashboardUrl,
  };
};
