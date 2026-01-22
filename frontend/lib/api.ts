// API utility functions

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const getApiUrl = () => API_URL;

export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(token),
    ...options.headers,
  };

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
};
