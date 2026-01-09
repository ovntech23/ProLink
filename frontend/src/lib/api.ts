const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
    return fetchApi<{ token: string; user: any }>('/api/auth/register', {
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

// Export the base fetchApi function for custom requests
export { fetchApi };
