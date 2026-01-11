import { create } from 'zustand';
import { driverApi, authApi, userApi, shipmentApi, paymentApi, messageApi } from '../lib/api';
import { initSocket, sendSocketMessage, onMessageReceived, onOnlineUsersUpdate, disconnectSocket } from '../lib/socket';

export type UserRole = 'broker' | 'driver' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isApproved: boolean;
}

export interface DriverProfile extends User {
  role: 'driver';
  status: 'available' | 'busy' | 'offline';
  vehicleType: string;
  vehiclePlate: string;
  vehicleImage?: string;
  trailerPlate?: string;
  vehicleCategory?: string;
  vehicleModel?: string;
  currentLocation?: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  ownerId: string;
  driverId?: string;
  origin: string;
  destination: string;
  pickupContactPerson?: string;
  pickupContactPhone?: string;
  deliveryContactPerson?: string;
  deliveryContactPhone?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  cargoType: string;
  weight: string;
  quantity?: number;
  description?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  specialInstructions?: string;
  incidentNote?: string;
  pickupDate: string;
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface Payment {
  id: string;
  shipmentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  payer: string; // User ID or Name
  payee: string; // User ID or Name
  type: 'driver_payment' | 'client_invoice';
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  url: string; // for display purposes in this mock
  size?: number;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  drivers: DriverProfile[];
  shipments: Shipment[];
  payments: Payment[];
  messages: Message[];
  onlineUsers: string[];
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  addShipment: (shipment: Omit<Shipment, 'id' | 'trackingId' | 'statusHistory'>) => Shipment;
  assignDriver: (shipmentId: string, driverId: string) => void;
  addDriver: (driver: Omit<DriverProfile, 'id' | 'status' | 'role'>) => void;
  updateDriverProfile: (driverId: string, updates: Partial<DriverProfile>, comment?: string) => void;
  updateShipmentStatus: (shipmentId: string, status: Shipment['status'], note?: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
  approveUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  signUp: (user: Omit<User, 'id' | 'isApproved'> & { password: string }) => Promise<User>;
  reportShipmentIncident: (shipmentId: string, note: string) => void;
  sendMessage: (recipientId: string, content: string, attachments?: Attachment[]) => void;
  getMessagesBetweenUsers: (userId1: string, userId2: string) => Message[];
  getUnreadMessages: (userId: string) => Message[];
  markMessageAsRead: (messageId: string) => void;
  adminCreateUser: (userData: any) => Promise<void>;
  adminUpdateUser: (userId: string, updates: any) => Promise<void>;
  getConversations: (userId: string) => { user: User; lastMessage: Message; unreadCount: number }[];
  checkAuth: () => Promise<void>;
  init: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  drivers: [],
  shipments: [],
  payments: [],
  messages: [],
  onlineUsers: [],

  // Initialize store with data from API
  init: async () => {
    try {
      // Fetch data with individual error handling
      let drivers = [];
      let users = [];
      let shipments = [];
      let payments = [];
      let messages = [];

      try {
        const { data: driversData } = await driverApi.getDrivers();
        drivers = driversData.map((d: any) => ({ ...d, id: d._id }));
      } catch (error) {
        console.warn('Failed to fetch drivers:', error);
      }

      try {
        const { data: usersData } = await userApi.getUsers();
        users = usersData.map((u: any) => ({ ...u, id: u._id }));
      } catch (error) {
        console.warn('Failed to fetch users:', error);
      }

      try {
        const { data: shipmentsData } = await shipmentApi.getShipments();
        shipments = shipmentsData.map((s: any) => ({ ...s, id: s._id }));
      } catch (error) {
        console.warn('Failed to fetch shipments:', error);
      }

      try {
        const { data: paymentsData } = await paymentApi.getPayments();
        payments = paymentsData.map((p: any) => ({ ...p, id: p._id }));
      } catch (error) {
        console.warn('Failed to fetch payments:', error);
      }

      try {
        const { data: messagesData } = await messageApi.getMessages();
        messages = messagesData.map((m: any) => ({ ...m, id: m._id }));
      } catch (error) {
        console.warn('Failed to fetch messages:', error);
      }

      set({ drivers, users, shipments, payments, messages });
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },

  login: async (email, password) => {
    try {
      const response = await authApi.login({ email, password });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);

      // Create user object from response.user
      const user = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        isApproved: true // Assume approved for login
      } as User;

      // Set current user
      set({ currentUser: user });

      // Initialize WebSocket connection with token
      initSocket(response.data.token);

      // Listen for incoming messages
      onMessageReceived((message) => {
        set((state) => ({
          messages: [...state.messages, {
            id: message.id,
            senderId: message.senderId,
            recipientId: message.recipientId,
            content: message.content,
            timestamp: message.timestamp,
            read: message.read
          }]
        }));
      });

      // Initialize store data
      await get().init();

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await userApi.getCurrentUser();
      const user = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        isApproved: true
      } as User;

      set({ currentUser: user });
      initSocket(token);

      // Setup message listener
      onMessageReceived((message) => {
        set((state) => ({
          messages: [...state.messages, {
            id: message.id,
            senderId: message.senderId,
            recipientId: message.recipientId,
            content: message.content,
            timestamp: message.timestamp,
            read: message.read
          }]
        }));
      });

      // Setup online users listener
      onOnlineUsersUpdate((userIds) => {
        set({ onlineUsers: userIds });
      });

      // Fetch initial data
      await get().init();
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({ currentUser: null });
    }
  },

  logout: () => {
    set({ currentUser: null });
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Disconnect WebSocket
    disconnectSocket();
  },

  addShipment: (data) => {
    const newShipment: Shipment = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      statusHistory: [{ status: data.status, timestamp: new Date().toISOString(), note: 'Shipment created' }]
    };
    set(state => ({ shipments: [newShipment, ...state.shipments] }));
    return newShipment;
  },

  assignDriver: (shipmentId, driverId) => {
    set(state => ({
      shipments: state.shipments.map(s =>
        s.id === shipmentId
          ? {
            ...s,
            driverId,
            status: 'assigned',
            statusHistory: [
              ...s.statusHistory,
              { status: 'assigned', timestamp: new Date().toISOString(), note: `Driver assigned` }
            ]
          }
          : s
      )
    }));
  },

  addDriver: (data) => {
    const newDriver: DriverProfile = {
      ...data,
      id: `d${Math.floor(1000 + Math.random() * 9000).toString()}`,
      role: 'driver',
      status: 'available',
      isApproved: true
    };
    set(state => ({
      drivers: [...state.drivers, newDriver],
      users: [...state.users, newDriver]
    }));
  },

  updateDriverProfile: (driverId, updates, comment) => {
    set(state => {
      const newDrivers = state.drivers.map(d => d.id === driverId ? { ...d, ...updates } : d);
      const newUsers = state.users.map(u => u.id === driverId ? { ...u, ...updates } : u);

      // Sync location updates to status history of active shipments
      let newShipments = state.shipments;
      if (updates.currentLocation) {
        newShipments = state.shipments.map(s => {
          if (s.driverId === driverId && (s.status === 'in_transit' || s.status === 'picked_up')) {
            const historyNote = comment
              ? `Location update: ${updates.currentLocation} (${comment})`
              : `Location update: ${updates.currentLocation}`;
            return {
              ...s,
              statusHistory: [
                ...s.statusHistory,
                { status: s.status, timestamp: new Date().toISOString(), note: historyNote }
              ]
            };
          }
          return s;
        });
      }

      return { drivers: newDrivers, users: newUsers, shipments: newShipments };
    });
  },

  updateShipmentStatus: (shipmentId, status, note) => {
    set(state => ({
      shipments: state.shipments.map(s =>
        s.id === shipmentId
          ? {
            ...s,
            status,
            statusHistory: [
              ...s.statusHistory,
              { status, timestamp: new Date().toISOString(), note }
            ]
          }
          : s
      )
    }));
  },

  addPayment: (payment) => {
    const newPayment: Payment = {
      ...payment,
      id: `p${Math.random().toString(36).substr(2, 9)}`
    };
    set(state => ({ payments: [newPayment, ...state.payments] }));
  },

  updatePaymentStatus: (paymentId, status) => {
    set(state => ({
      payments: state.payments.map(p =>
        p.id === paymentId
          ? { ...p, status }
          : p
      )
    }));
  },

  approveUser: async (userId) => {
    try {
      await userApi.adminUpdateUser(userId, { isApproved: true });
      set(state => ({
        users: state.users.map(u => u.id === userId ? { ...u, isApproved: true } : u),
        drivers: state.drivers.map(d => d.id === userId ? { ...d, isApproved: true } : d)
      }));
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  },

  deleteUser: async (userId) => {
    try {
      await userApi.deleteUser(userId);
      set(state => ({
        users: state.users.filter(u => u.id !== userId),
        drivers: state.drivers.filter(d => d.id !== userId)
      }));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  },

  adminCreateUser: async (userData) => {
    try {
      const response = await userApi.createUser(userData);
      const newUser = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        isApproved: true,
        phone: userData.phone
      } as User;

      set(state => ({
        users: [newUser, ...state.users],
        drivers: newUser.role === 'driver' ? [newUser as DriverProfile, ...state.drivers] : state.drivers
      }));
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  adminUpdateUser: async (userId, updates) => {
    try {
      await userApi.adminUpdateUser(userId, updates);
      // Map API response to store User format if needed, or just apply updates locally
      // leveraging the fact that updates contains the changed fields

      set(state => {
        const updateFn = (u: any) => u.id === userId ? { ...u, ...updates } : u;
        return {
          users: state.users.map(updateFn),
          drivers: state.drivers.map(updateFn)
        };
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  signUp: async (userData) => {
    try {
      const response = await authApi.register(userData);
      const newUser = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        isApproved: false
      } as User;
      set(state => {
        const users = [...state.users, newUser];
        const drivers = userData.role === 'driver'
          ? [...state.drivers, newUser as DriverProfile]
          : state.drivers;
        return { users, drivers };
      });
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  reportShipmentIncident: (shipmentId, note) => {
    set(state => ({
      shipments: state.shipments.map(s =>
        s.id === shipmentId
          ? {
            ...s,
            incidentNote: note,
            statusHistory: [
              ...s.statusHistory,
              { status: s.status, timestamp: new Date().toISOString(), note: `INCIDENT: ${note}` }
            ]
          }
          : s
      )
    }));
  },

  sendMessage: (recipientId, content, attachments) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Send message through WebSocket
    const messageData = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments
    };

    // Send through WebSocket
    sendSocketMessage(messageData);

    // Add to local state
    set(state => ({ messages: [...state.messages, messageData] }));
  },

  getMessagesBetweenUsers: (userId1, userId2) => {
    const state = get();
    return state.messages
      .filter(m =>
        (m.senderId === userId1 && m.recipientId === userId2) ||
        (m.senderId === userId2 && m.recipientId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  getUnreadMessages: (userId) => {
    const state = get();
    return state.messages.filter(m => m.recipientId === userId && !m.read);
  },

  markMessageAsRead: (messageId) => {
    set(state => ({
      messages: state.messages.map(m =>
        m.id === messageId
          ? { ...m, read: true }
          : m
      )
    }));
  },

  getConversations: (userId) => {
    const state = get();
    const conversations: { user: User; lastMessage: Message; unreadCount: number }[] = [];

    // Get all messages where the user is either sender or recipient
    const userMessages = state.messages.filter(
      m => m.senderId === userId || m.recipientId === userId
    );

    // Get unique conversation partners
    const partnerIds = Array.from(
      new Set(
        userMessages.flatMap(m => m.senderId === userId ? [m.recipientId] : [m.senderId])
      )
    );

    // For each partner, get last message and unread count
    partnerIds.forEach(partnerId => {
      const partner = state.users.find(u => u.id === partnerId);
      if (!partner) return;

      const conversationMessages = userMessages.filter(
        m => (m.senderId === userId && m.recipientId === partnerId) ||
          (m.senderId === partnerId && m.recipientId === userId)
      );

      if (conversationMessages.length === 0) return;

      const lastMessage = conversationMessages.reduce((latest, current) =>
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );

      const unreadCount = conversationMessages.filter(
        m => m.recipientId === userId && !m.read
      ).length;

      conversations.push({ user: partner, lastMessage, unreadCount });
    });

    // Sort by last message timestamp
    return conversations.sort((a, b) =>
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  }
}));
