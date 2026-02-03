/**
 * API Configuration - Zero-Config Dynamic Detection
 * 
 * Automatically detects the backend API URL based on the current hostname.
 * This allows the application to work seamlessly whether accessed via:
 * - localhost
 * - LAN IP (e.g., 192.168.1.100)
 * - Public IP
 * - Domain name
 * 
 * No manual configuration needed!
 */

// Dynamic API URL based on window location
export const API_BASE_URL = `http://${window.location.hostname}:3001`;

// API endpoints
export const API_ENDPOINTS = {
    settings: `${API_BASE_URL}/api/settings`,
    files: `${API_BASE_URL}/api/files`,
    plugins: `${API_BASE_URL}/api/plugins`,
    properties: `${API_BASE_URL}/api/properties`,
    server: `${API_BASE_URL}/api/server`,
    players: `${API_BASE_URL}/api/players`,
    uploads: `${API_BASE_URL}/uploads`
};

// Helper function to get API URL
export const getApiUrl = (path = '') => {
    return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
