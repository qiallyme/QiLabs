import { getConfig } from './config';

interface RequestOptions extends RequestInit {
  includeAuth?: boolean;
}

export const api = {
  async request(endpoint: string, options: RequestOptions = {}) {
    const config = getConfig();
    const { includeAuth = true, ...fetchOptions } = options;
    
    console.log('API Request - Config:', config);
    console.log('API Request - Endpoint:', endpoint);
    console.log('API Request - Full URL:', `${config.apiEndpoint}${endpoint}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> || {}),
    };
    
    // Add auth token if available
    if (includeAuth) {
      const tokensStr = localStorage.getItem('demoTokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      
      // Add selected firm ID for master users
      const userStr = localStorage.getItem('demoUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('API: User data from localStorage:', { role: user.role, selectedFirmId: user.selectedFirmId, lawFirmId: user.lawFirmId });
        if (user.role === 'master' && user.selectedFirmId) {
          headers['X-Selected-Firm-Id'] = user.selectedFirmId;
          console.log('API: Setting X-Selected-Firm-Id header:', user.selectedFirmId);
        }
      }
    }
    
    const response = await fetch(`${config.apiEndpoint}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
    
    if (!response.ok && response.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoTokens');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    return response;
  },
  
  async get(endpoint: string) {
    const response = await this.request(endpoint);
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async put(endpoint: string, data: any) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async delete(endpoint: string) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    });
    return response.json();
  },
};