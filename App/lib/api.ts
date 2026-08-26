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
    
    let errorMsg = 'An error occurred during the API request.';
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed.message || parsed.error || errorMsg;
    } catch (e) {
      errorMsg = errorText || errorMsg;
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        const supabase = createClient();
        supabase.auth.signOut().finally(() => {
          const authUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL || 'https://auth.faibah.com';
          window.location.href = `${authUrl}/login`;
        });
      }
      throw new Error(`${errorMsg} (URL: ${url}, Status: ${response.status})`);
    }

    if (response.status !== 429) {
      console.error(`[fetchApi] Error ${response.status} from ${url}:`, errorText);
    }
    
    throw new Error(`${errorMsg} (URL: ${url}, Status: ${response.status})`);
  }

  // Handle 204 No Content or empty response body
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text || !text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
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
  getOne: (id: string) => fetchApi(`/projects/${id}`),
  create: (data: { clientId: string, name: string }) => fetchApi('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => fetchApi(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateName: (id: string, name: string) => fetchApi(`/projects/${id}/name`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  createProposal: (projectId: string, content: string) => fetchApi(`/projects/${projectId}/proposals`, { method: 'POST', body: JSON.stringify({ content }) }),
  getMembers: (projectId: string) => fetchApi(`/projects/${projectId}/members`),
  inviteMember: (projectId: string, email: string, role?: string) => fetchApi(`/projects/${projectId}/members/invite`, { method: 'POST', body: JSON.stringify({ email, role }) }),
  getPendingInvitations: () => fetchApi('/projects/invitations/pending'),
  acceptInvitation: (memberId: string) => fetchApi(`/projects/invitations/${memberId}/accept`, { method: 'PATCH' }),
  declineInvitation: (memberId: string) => fetchApi(`/projects/invitations/${memberId}/decline`, { method: 'DELETE' }),
  removeMember: (memberId: string) => fetchApi(`/projects/members/${memberId}`, { method: 'DELETE' }),
  addUrl: (projectId: string, label: string, url: string) => fetchApi(`/projects/${projectId}/urls`, { method: 'POST', body: JSON.stringify({ label, url }) }),
  deleteUrl: (urlId: string) => fetchApi(`/projects/urls/${urlId}`, { method: 'DELETE' }),
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
  getTasks: (projectId: string, assignedTo?: string) => 
    fetchApi(`/tasks/project/${projectId}${assignedTo ? `?assignedTo=${assignedTo}` : ''}`),
  createTask: (data: any) => fetchApi('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => fetchApi(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assignUser: (taskId: string, projectMemberId: string) => fetchApi(`/tasks/${taskId}/assign`, { method: 'POST', body: JSON.stringify({ projectMemberId }) }),
};

export const ScheduleEventsApi = {
  getEvents: (projectId?: string) => 
    fetchApi(`/schedule-events${projectId ? `?projectId=${projectId}` : ''}`),
  create: (data: {
    projectId: string;
    title: string;
    description?: string;
    type?: string;
    startTime: string;
    endTime?: string;
    linkedTaskId?: string;
  }) => fetchApi('/schedule-events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/schedule-events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/schedule-events/${id}`, { method: 'DELETE' }),
};

export const ChannelsApi = {
  getAll: () => fetchApi('/channels'),
  create: (data: { projectId: string, channelName: string }) => fetchApi('/channels', { method: 'POST', body: JSON.stringify(data) }),
  getForProject: (projectId: string, channelName?: string) => fetchApi(`/projects/${projectId}/channel${channelName ? `?channel=${channelName}` : ''}`),
  postMessage: (projectId: string, data: { channelName: string, content: string, senderId?: string, attachmentUrl?: string, mentions?: any[] }) => fetchApi(`/projects/${projectId}/channel/messages`, { method: 'POST', body: JSON.stringify(data) }),
};

export const ReceiptsApi = {
  getAll: () => fetchApi('/receipts'),
  getById: (id: string) => fetchApi(`/receipts/${id}`),
  create: (data: any) => fetchApi('/receipts', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/receipts/${id}`, { method: 'DELETE' }),
};

export const PaymentsApi = {
  getAll: () => fetchApi('/payments'),
};

export const InvoicesApi = {
  getAll: () => fetchApi('/invoices'),
  getById: (id: string) => fetchApi(`/invoices/${id}`),
  create: (data: any) => fetchApi('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/invoices/${id}`, { method: 'DELETE' }),
};

