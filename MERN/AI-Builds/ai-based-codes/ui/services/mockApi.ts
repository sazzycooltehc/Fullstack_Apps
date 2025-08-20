import type { User, DropdownOption, Article } from '../types';
import { Flow } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * A wrapper for the fetch API that provides better error handling for network errors.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(url, options);
        return await handleResponse<T>(response);
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Network Error: Could not connect to API. Please ensure the mock server is running.');
        }
        // Re-throw other errors (e.g., from handleResponse)
        throw error;
    }
}

export const loginApi = (user: string, pass: string): Promise<User> => {
  return apiFetch<User>(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: user, password: pass }),
  });
};

export const getDropdown1Options = (flow: Flow): Promise<DropdownOption[]> => {
  return apiFetch<DropdownOption[]>(`${API_BASE_URL}/dropdown1-options/${flow}`);
};

export const getDropdown2Options = (flow: Flow, category: string): Promise<DropdownOption[]> => {
  return apiFetch<DropdownOption[]>(`${API_BASE_URL}/dropdown2-options/${flow}/${category}`);
};

export const getArticles = (flow: Flow, category: string, topic: string): Promise<Article[]> => {
    return apiFetch<Article[]>(`${API_BASE_URL}/articles/${flow}/${category}/${topic}`);
};
