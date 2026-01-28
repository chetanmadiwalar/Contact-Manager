import axios from 'axios';

// Direct API URL (bypass proxy if needed)
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CORS headers for development
api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export { api };