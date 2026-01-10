const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Types for our data models
interface Statistic {
  _id: string;
  label: string;
  value: string;
  description: string;
  category: 'company' | 'service' | 'achievement';
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Cargo {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Feature {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  category: 'core-value' | 'service' | 'benefit';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return fetchApi<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: { name: string; email: string; password: string; role: string }) => {
    return fetchApi<{ _id: string; name: string; email: string; role: string; message: string }>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return fetchApi<null>('/api/auth/logout', {
      method: 'POST',
    });
  },
};

// User API
export const userApi = {
  getCurrentUser: async () => {
    return fetchApi<any>('/api/users/me');
  },
  
  updateUser: async (userData: Partial<any>) => {
    return fetchApi<any>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Shipment API
export const shipmentApi = {
  getShipments: async () => {
    return fetchApi<any[]>('/api/shipments');
  },
  
  getShipmentById: async (id: string) => {
    return fetchApi<any>(`/api/shipments/${id}`);
  },
  
  createShipment: async (shipmentData: any) => {
    return fetchApi<any>('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },
  
  updateShipment: async (id: string, shipmentData: any) => {
    return fetchApi<any>(`/api/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shipmentData),
    });
  },
};

// Driver API
export const driverApi = {
  getDrivers: async () => {
    return fetchApi<any[]>('/api/drivers');
  },
  getDriverById: async (id: string) => {
    return fetchApi<any>(`/api/drivers/${id}`);
  },
  updateDriverProfile: async (id: string, driverData: any) => {
    return fetchApi<any>(`/api/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  },
};

// Statistics API
export const statisticsApi = {
  getStatistics: async (): Promise<Statistic[]> => {
    const response = await fetchApi<Statistic[]>('/api/statistics');
    return response.data;
  },
  createStatistic: async (statisticData: Omit<Statistic, '_id' | 'createdAt' | 'updatedAt'>): Promise<Statistic> => {
    const response = await fetchApi<Statistic>('/api/statistics', {
      method: 'POST',
      body: JSON.stringify(statisticData),
    });
    return response.data;
  },
};

// Cargo API
export const cargoApi = {
  getCargos: async (): Promise<Cargo[]> => {
    const response = await fetchApi<Cargo[]>('/api/cargos');
    return response.data;
  },
  createCargo: async (cargoData: Omit<Cargo, '_id' | 'createdAt' | 'updatedAt'>): Promise<Cargo> => {
    const response = await fetchApi<Cargo>('/api/cargos', {
      method: 'POST',
      body: JSON.stringify(cargoData),
    });
    return response.data;
  },
};

// Features API
export const featuresApi = {
  getFeatures: async (): Promise<Feature[]> => {
    const response = await fetchApi<Feature[]>('/api/features');
    return response.data;
  },
  createFeature: async (featureData: Omit<Feature, '_id' | 'createdAt' | 'updatedAt'>): Promise<Feature> => {
    const response = await fetchApi<Feature>('/api/features', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
    return response.data;
  },
};

// Messages API
export const messagesApi = {
  getMessages: async (): Promise<any[]> => {
    const response = await fetchApi<any[]>('/api/messages');
    return response.data;
  },
  sendMessage: async (messageData: { recipientId: string; content: string; attachments?: any[] }): Promise<any> => {
    const response = await fetchApi<any>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    return response.data;
  },
  markAsRead: async (messageId: string): Promise<any> => {
    const response = await fetchApi<any>(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    });
    return response.data;
  },
};

// Conversations API
export const conversationsApi = {
  getConversations: async (): Promise<any[]> => {
    const response = await fetchApi<any[]>('/api/conversations');
    return response.data;
  },
  startConversation: async (participantId: string): Promise<any> => {
    const response = await fetchApi<any>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
    return response.data;
  },
  getConversationMessages: async (conversationId: string): Promise<any[]> => {
    const response = await fetchApi<any[]>(`/api/conversations/${conversationId}/messages`);
    return response.data;
  },
};

// Export the base fetchApi function for custom requests and types
export { fetchApi };
export type { Statistic, Cargo, Feature };
