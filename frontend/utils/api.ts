// By default, this will grab NEXT_PUBLIC_API_URL. 
// If it's not set (e.g., local development and they forgot to make .env.local), fallback to localhost.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Example: fetch(`${API_BASE_URL}/services`)
