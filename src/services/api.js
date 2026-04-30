import {
  deleteWebsite as mockDeleteWebsite,
  generateWebsite as mockGenerateWebsite,
  getCurrentUser as mockGetCurrentUser,
  getWebsite as mockGetWebsite,
  listWebsites as mockListWebsites,
  login as mockLogin,
  saveWebsite as mockSaveWebsite,
  signup as mockSignup,
  updateWebsite as mockUpdateWebsite,
  logout as mockLogout,
} from './mockApi.js';
import { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from './storageKeys.js';

export { AUTH_STORAGE_KEY, USER_STORAGE_KEY } from './storageKeys.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}.`);
  }

  return payload;
}

function normalizeAuth(payload) {
  const token = payload?.token || payload?.access_token || payload?.data?.token;
  const user = payload?.user || payload?.data?.user || payload?.data;

  if (!token || !user) {
    throw new Error('The authentication response is missing required data.');
  }

  return { token, user };
}

function normalizeWebsite(payload) {
  return payload?.data || payload;
}

function normalizeWebsiteList(payload, page, pageSize) {
  const data = payload?.data || payload?.websites || [];
  const meta = payload?.meta || {
    page,
    pageSize,
    total: Array.isArray(data) ? data.length : 0,
    totalPages: 1,
  };

  return { data, meta };
}

const realApi = {
  async signup(payload) {
    const response = await request('/api/signup', {
      method: 'POST',
      body: payload,
    });

    return normalizeAuth(response);
  },

  async login(payload) {
    const response = await request('/api/login', {
      method: 'POST',
      body: payload,
    });

    return normalizeAuth(response);
  },

  async getCurrentUser(token) {
    const response = await request('/api/me', { token });
    return response?.data || response?.user || response;
  },

  async generateWebsite(payload, token) {
    const response = await request('/api/websites/generate', {
      method: 'POST',
      body: payload,
      token,
    });

    return normalizeWebsite(response);
  },

  async saveWebsite(payload, token) {
    const response = await request('/api/websites', {
      method: 'POST',
      body: payload,
      token,
    });

    return normalizeWebsite(response);
  },

  async listWebsites({ page, pageSize }, token) {
    const response = await request(`/api/websites?page=${page}&page_size=${pageSize}`, {
      token,
    });

    return normalizeWebsiteList(response, page, pageSize);
  },

  async getWebsite(id, token) {
    const response = await request(`/api/websites/${id}`, { token });
    return normalizeWebsite(response);
  },

  async updateWebsite(id, payload, token) {
    const response = await request(`/api/websites/${id}`, {
      method: 'PUT',
      body: payload,
      token,
    });

    return normalizeWebsite(response);
  },

  async deleteWebsite(id, token) {
    const response = await request(`/api/websites/${id}`, {
      method: 'DELETE',
      token,
    });

    return response || { success: true };
  },

  async logout(token) {
    try {
      await request('/api/logout', {
        method: 'POST',
        token,
      });
    } catch {
      // Local cleanup still happens in the auth context even if the backend logout fails.
    }
  },
};

export const api = USE_MOCK_API
  ? {
      signup: mockSignup,
      login: mockLogin,
      getCurrentUser: mockGetCurrentUser,
      generateWebsite: mockGenerateWebsite,
      saveWebsite: mockSaveWebsite,
      listWebsites: mockListWebsites,
      getWebsite: mockGetWebsite,
      updateWebsite: mockUpdateWebsite,
      deleteWebsite: mockDeleteWebsite,
      logout: mockLogout,
    }
  : realApi;
