import { createClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

/**
 * Standard fetch wrapper for the NestJS Backend.
 * Automatically handles JSON parsing, Content-Type headers, and basic error throwing.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Try to attach Supabase Auth token if we are in the browser
  if (typeof window !== 'undefined') {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[fetchApi] Error ${response.status} from ${url}:`, errorText);
    let errorMsg = 'An error occurred during the API request.';
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed.message || parsed.error || errorMsg;
    } catch (e) {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(`${errorMsg} (URL: ${url}, Status: ${response.status})`);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  const data = await response.json();
  return data;
}

// ==========================================
// API Services
// ==========================================

export const CompanyApi = {
  getProfile: () => fetchApi('/company/profile'),
  updateProfile: (data: any) => fetchApi('/company/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getOverview: () => fetchApi('/company/overview'),
};

export const UsersApi = {
  getProfile: () => fetchApi('/users/profile'),
  updateProfile: (data: any) => fetchApi('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const ClientsApi = {
  getAll: () => fetchApi('/clients'),
  getById: (id: string) => fetchApi(`/clients/${id}`),
  create: (data: any) => fetchApi('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addContact: (clientId: string, data: any) => fetchApi(`/clients/${clientId}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (clientId: string, contactId: string, data: any) => fetchApi(`/clients/${clientId}/contacts/${contactId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteContact: (clientId: string, contactId: string) => fetchApi(`/clients/${clientId}/contacts/${contactId}`, { method: 'DELETE' }),
  delete: (id: string) => fetchApi(`/clients/${id}`, { method: 'DELETE' }),
};

export const ProjectsApi = {
  getAll: (clientId?: string) => fetchApi(clientId ? `/projects/client/${clientId}` : '/projects'),
  create: (data: { clientId: string, name: string }) => fetchApi('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => fetchApi(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createProposal: (projectId: string, content: string) => fetchApi(`/projects/${projectId}/proposals`, { method: 'POST', body: JSON.stringify({ content }) }),
};

export const AppointmentsApi = {
  getAll: async () => fetchApi('/appointments'),
  create: async (data: any) => fetchApi('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id: string, data: any) => fetchApi(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: async (id: string) => fetchApi(`/appointments/${id}`, {
    method: 'DELETE',
  }),
};

export const UploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi('/upload/image', { method: 'POST', body: formData });
  },
  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi('/upload/pdf', { method: 'POST', body: formData });
  }
};

export const TasksApi = {
  getTasks: (projectId: string) => fetchApi(`/tasks/project/${projectId}`),
  createTask: (data: any) => fetchApi('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => fetchApi(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const ReceiptsApi = {
  getAll: () => fetchApi('/receipts'),
  getById: (id: string) => fetchApi(`/receipts/${id}`),
  create: (data: any) => fetchApi('/receipts', { method: 'POST', body: JSON.stringify(data) }),
};

export const InvoicesApi = {
  getAll: () => fetchApi('/invoices'),
  getById: (id: string) => fetchApi(`/invoices/${id}`),
  create: (data: any) => fetchApi('/invoices', { method: 'POST', body: JSON.stringify(data) }),
};

