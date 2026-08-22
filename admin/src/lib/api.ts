import { createClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'; // Services default port

export class AdminApi {
  private static async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'An error occurred while fetching the data.');
    }

    return response.json();
  }

  static getOverview() {
    return this.fetchWithAuth('/admin/overview');
  }

  static getBusinesses() {
    return this.fetchWithAuth('/admin/businesses');
  }

  static getBusinessDetail(id: string) {
    return this.fetchWithAuth(`/admin/businesses/${id}`);
  }

  static getWebhookLogs() {
    return this.fetchWithAuth('/admin/health/webhooks');
  }

  static getUsers() {
    return this.fetchWithAuth('/admin/users');
  }

  static getSubscriptions() {
    return this.fetchWithAuth('/admin/subscriptions');
  }

  static getAuditLogs() {
    return this.fetchWithAuth('/admin/audit-logs');
  }

  static getTeam() {
    return this.fetchWithAuth('/admin/team');
  }
}
