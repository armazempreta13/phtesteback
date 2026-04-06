import { ClientProject, ContactFormData, PaymentOrder } from '../types';
import { generatePixCode } from './pix';

// Auto-detect API base: use relative URL in production (Cloudflare Pages proxy),
// or explicit VITE_API_URL in development
const isProd = import.meta.env.PROD;
const API_BASE = isProd ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api');

// Token storage — uses httpOnly cookies from backend when available,
// falls back to localStorage for dev compatibility
const getToken = (): string | null => localStorage.getItem('auth_token');
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// Generic request helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies
  });

  // Handle 401 — token expired/invalid
  if (res.status === 401) {
    removeToken();
    throw new Error('Sessao expirada. Faca login novamente.');
  }

  // Handle 429 — rate limited
  if (res.status === 429) {
    throw new Error('Muitas requisicoes. Tente novamente em alguns minutos.');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Erro na requisicao: ${res.status}`);
  }

  // Save token if returned (fallback for non-cookie auth)
  if (data.data?.token) {
    setToken(data.data.token);
  }

  return data;
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await request<{ success: boolean; data: { token: string; user: { id: number; name: string; email: string; role: string; avatar?: string } } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(response.data.token);
      return {
        role: response.data.user.role === 'admin' ? 'admin' : 'client',
        token: response.data.token,
        user: response.data.user,
      };
    },

    register: async (data: { name: string; email: string; password: string }) => {
      return request<{ success: boolean; data: { user: any } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getProfile: async () => {
      return request<{ success: boolean; data: { user: any } }>('/auth/profile');
    },

    updateProfile: async (data: { name?: string; avatar?: string }) => {
      return request<{ success: boolean; data: { user: any } }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    logout: () => {
      removeToken();
    }
  },

  admin: {
    getStats: async () => {
      return request<{ success: boolean; data: any }>('/admin/stats');
    },
    getAnalytics: async (days = 30) => {
      return request<{ success: boolean; data: any }>(`/analytics?days=${days}`);
    },
  },

  analytics: {
    track: async (type: string, path = '', referrer = '') => {
      try {
        return fetch(`${API_BASE}/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, path, referrer, userAgent: navigator.userAgent }),
        });
      } catch (e) { /* silently fail */ }
    },
  },

  posts: {
    getAll: async (published = true) => {
      const response = await request<{ success: boolean; data: { posts: any[]; total: number; page: number; limit: number } }>(`/posts?published=${published}`);
      return response.data.posts;
    },
    getOne: async (slug: string) => {
      const response = await request<{ success: boolean; data: { post: any } }>(`/posts/${slug}`);
      return response.data.post;
    },
    create: async (post: any) => {
      const response = await request<{ success: boolean; data: { post: any } }>('/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      });
      return response.data.post;
    },
    update: async (id: number | string, data: any) => {
      const response = await request<{ success: boolean; data: { post: any } }>(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data.post;
    },
    delete: async (id: number | string) => {
      return request<{ success: boolean }>(`/posts/${id}`, {
        method: 'DELETE',
      });
    },
  },

  portfolio: {
    getAll: async (featured?: boolean) => {
      const query = featured !== undefined ? `?featured=${featured ? 1 : 0}` : '';
      const response = await request<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number } }>(`/portfolio${query}`);
      return response.data.items;
    },
    getOne: async (id: string | number) => {
      const response = await request<{ success: boolean; data: { item: any } }>(`/portfolio/${id}`);
      return response.data.item;
    },
    create: async (item: any) => {
      const response = await request<{ success: boolean; message?: string; data: { item: any } }>('/portfolio', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return response.data.item;
    },
    update: async (id: string | number, data: any) => {
      const response = await request<{ success: boolean; message?: string; data: { item: any } }>(`/portfolio/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data.item;
    },
    delete: async (id: string | number) => {
      return request<{ success: boolean; message?: string }>(`/portfolio/${id}`, {
        method: 'DELETE',
      });
    },
  },

  projects: {
    getAll: async () => {
      return request<{ success: boolean; data: { projects: any[]; total: number; page: number; limit: number } }>('/projects');
    },
    getOne: async (id: number) => {
      return request<{ success: boolean; data: { project: any } }>(`/projects/${id}`);
    },
    create: async (data: any) => {
      return request<{ success: boolean; data: { project: any } }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: number, data: any) => {
      return request<{ success: boolean; data: { project: any } }>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: number) => {
      return request<{ success: boolean; message?: string }>(`/projects/${id}`, {
        method: 'DELETE',
      });
    },
  },

  briefings: {
    submit: async (data: ContactFormData & { project_type?: string }) => {
      return request<{ success: boolean; data: any }>('/briefings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  contact: {
    getAll: async (status?: string) => {
      const query = status ? `?status=${status}` : '';
      return request<{ success: boolean; data: { messages: any[]; total: number; page: number; limit: number } }>(`/contact${query}`);
    },
    submit: async (data: { name: string; email: string; phone?: string; subject: string; message: string; service_interest?: string }) => {
      return request<{ success: boolean; data: any }>('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  notifications: {
    getUser: async () => {
      return request<{ success: boolean; data: any[] }>('/notifications');
    },
    markAsRead: async (id: number) => {
      return request<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },
  },

  upload: {
    single: async (file: File, fieldName = 'file') => {
      const token = getToken();
      const formData = new FormData();
      formData.append(fieldName, file);

      const res = await fetch(`${API_BASE}/upload/single`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Erro no upload: ${res.status}`);
      }
      return data;
    },
  },

  settings: {
    getAll: async () => {
      return request<{ success: boolean; data: any }>('/settings');
    },
    update: async (data: any) => {
      return request<{ success: boolean; data: any }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  client: {
    getProjects: async () => {
      return request<{ success: boolean; data: { projects: any[]; total: number } }>('/client/projects');
    },
    getProject: async (id: number | string) => {
      return request<{ success: boolean; data: { project: any } }>(`/client/projects/${id}`);
    },
    getMessages: async (id: number | string) => {
      return request<{ success: boolean; data: { messages: any[] } }>(`/client/projects/${id}/messages`);
    },
    sendMessage: async (id: number | string, data: { message: string; subject?: string }) => {
      return request<{ success: boolean; data: any }>(`/client/projects/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  contract: {
    get: async (projectId: number | string) => {
      return request<{ success: boolean; data: { contract: any; project: any } }>(`/contract/${projectId}`);
    },
    generate: async (projectId: number | string) => {
      // Uses existing projects update endpoint (guaranteed to work without backend restart)
      const projectRes = await request<{ success: boolean; data: { project: any } }>(`/projects/${projectId}`);
      const p = projectRes.data.project;
      const contractData = {
        status: 'draft',
        adminSignature: null,
        clientSignature: null,
        sentAt: null,
        signedAt: null,
        generatedAt: new Date().toISOString(),
        clientName: p.client_name || 'Cliente',
        clientEmail: p.client_email || '',
        clientCpf: p.client_cpf || '',
        projectName: p.title || 'Sem titulo',
        dueDate: p.deadline || '',
        financialTotal: p.financial_total ?? p.budget ?? 0,
      };
      return request<{ success: boolean; data: { project: any } }>(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ contract: contractData }),
      });
    },
    update: async (projectId: number | string, data: any) => {
      return request<{ success: boolean; data: { project: any } }>(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ contract: data }),
      });
    },
    revoke: async (projectId: number | string) => {
      return request<{ success: boolean }>(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ contract: { status: 'draft', adminSignature: null, clientSignature: null, sentAt: null, signedAt: null } }),
      });
    },
  },

  // Keep existing PIX fallback for static payments
  payment: {
    create: async (amount: number, description: string, payerEmail: string): Promise<PaymentOrder> => {
      const txId = `PH${Math.floor(Math.random() * 10000)}`.toUpperCase();
      const pixCode = generatePixCode('05379507107', 'PH Development', 'BRASILIA', amount, txId);
      return {
        id: txId,
        description,
        amount,
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        pixCode,
      };
    },
  },
};
