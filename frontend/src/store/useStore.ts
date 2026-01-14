import { create } from 'zustand';
import { driverApi, authApi, userApi, shipmentApi, paymentApi, messageApi, jobApi } from '../lib/api';
import { initSocket, sendSocketMessage, onOnlineUsersUpdate, disconnectSocket, getSocket } from '../lib/socket';
import { toast } from 'sonner';

export type UserRole = 'broker' | 'driver' | 'owner' | 'admin';

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
  reactions?: { user: string; emoji: string }[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  } | null;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  url: string; // for display purposes in this mock
  size?: number;
}

export interface JobPost {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  budget: number;
  pickupDate: string;
  status: 'open' | 'filled' | 'cancelled';
  postedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  reactions: { user: string; emoji: string }[];
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  isAuthChecking: boolean;
  users: User[];
  drivers: DriverProfile[];
  shipments: Shipment[];
  payments: Payment[];
  messages: Message[];
  jobs: JobPost[];
  onlineUsers: string[];
  replyTo: Message['replyTo'] | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  addShipment: (shipment: Omit<Shipment, 'id' | 'trackingId' | 'statusHistory'>) => Promise<Shipment>;
  assignDriver: (shipmentId: string, driverId: string) => Promise<void>;
  addDriver: (driver: Omit<DriverProfile, 'id' | 'status' | 'role'>) => Promise<void>;
  updateDriverProfile: (driverId: string, updates: Partial<DriverProfile>, comment?: string) => Promise<void>;
  updateProfile: (updates: Partial<User & DriverProfile>) => Promise<void>;
  changePassword: (passwordData: any) => Promise<void>;
  updateShipmentStatus: (shipmentId: string, status: Shipment['status'], note?: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
  approveUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  signUp: (user: Omit<User, 'id' | 'isApproved'> & { password: string }) => Promise<User>;
  reportShipmentIncident: (shipmentId: string, note: string) => void;
  sendMessage: (recipientId: string, content: string, attachments?: Attachment[]) => void;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  setReplyTo: (reply: Message['replyTo'] | null) => void;
  createJob: (jobData: Omit<JobPost, 'id' | 'postedBy' | 'status' | 'reactions' | 'createdAt'>) => Promise<void>;
  fetchJobs: () => Promise<void>;
  reactToJob: (jobId: string, emoji: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobPost['status']) => Promise<void>;
  getMessagesBetweenUsers: (userId1: string, userId2: string) => Message[];
  getUnreadMessages: (userId: string) => Message[];
  markMessageAsRead: (messageId: string) => void;
  adminCreateUser: (userData: any) => Promise<void>;
  adminUpdateUser: (userId: string, updates: any) => Promise<void>;
  getConversations: (userId: string) => { user: User; lastMessage: Message; unreadCount: number }[];
  checkAuth: () => Promise<void>;
  init: () => Promise<void>;
  initRealTimeUpdates: () => void;
  broadcastShipmentUpdate: (shipmentId: string, updates: Partial<Shipment>) => void;
  broadcastDriverUpdate: (driverId: string, updates: Partial<DriverProfile>) => void;
  broadcastUserUpdate: (userId: string, updates: Partial<User>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  isAuthChecking: true,
  users: [],
  drivers: [],
  shipments: [],
  payments: [],
  messages: [],
  jobs: [],
  onlineUsers: [],
  replyTo: null,

  // Initialize store with data from API
  init: async () => {
    try {
      const { currentUser } = get();
      if (!currentUser) return;

      console.log('Initializing store data in parallel...');

      // Define all possible fetch operations
      const fetchOps = [
        { name: 'drivers', op: driverApi.getDrivers, mapper: (data: any[]) => data.map(d => ({ ...d, id: d._id })) },
        { name: 'users', op: userApi.getUsers, mapper: (data: any[]) => data.map(u => ({ ...u, id: u._id })) },
        { name: 'shipments', op: shipmentApi.getShipments, mapper: (data: any[]) => data.map(s => ({ ...s, id: s._id })) },
        { name: 'payments', op: paymentApi.getPayments, mapper: (data: any[]) => data.map(p => ({ ...p, id: p._id })) },
        {
          name: 'jobs',
          op: jobApi.getJobs,
          mapper: (data: any[]) => data.map(j => ({
            ...j,
            id: j._id || j.id,
            postedBy: { ...j.postedBy, id: j.postedBy?._id || j.postedBy?.id || j.postedBy }
          }))
        },
        {
          name: 'messages', op: messageApi.getMessages, mapper: (data: any[]) => data.map(m => ({
            ...m,
            id: m._id || m.id,
            senderId: m.sender?._id || m.sender?.id || m.sender,
            recipientId: m.recipient?._id || m.recipient?.id || m.recipient,
            timestamp: m.createdAt || m.timestamp,
            reactions: m.reactions || [],
            replyTo: m.replyTo
          }))
        }
      ];

      // Filter operations based on user role (expandable logic)
      const activeOps = fetchOps;

      const results = await Promise.allSettled(activeOps.map(op => op.op()));

      const newState: any = {};
      results.forEach((result, index) => {
        const op = activeOps[index];
        const opName = op.name;

        if (result.status === 'fulfilled') {
          const responseData = result.value.data;
          // Robustness check: Ensure result.value.data is an array before mapping
          if (Array.isArray(responseData)) {
            newState[opName] = op.mapper(responseData);
          } else if (responseData && typeof responseData === 'object' && Array.isArray((responseData as any).data)) {
            // Support for { success: true, data: [...] } format just in case
            newState[opName] = op.mapper((responseData as any).data);
          } else {
            console.warn(`Unexpected data format for ${opName}:`, responseData);
            newState[opName] = [];
          }
        } else {
          console.warn(`Failed to fetch ${opName}:`, result.reason);
          newState[opName] = [];
        }
      });

      set(newState);
      console.log('Store initialization complete.');
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },

  login: async (email, password) => {
    try {
      const response = await authApi.login({ email, password });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);

      // Create user object from response.user with all fields
      const responseData = response.data as any; // Type assertion for additional fields
      const user = {
        id: responseData._id,
        name: responseData.name,
        email: responseData.email,
        role: responseData.role,
        avatar: responseData.avatar,
        phone: responseData.phone,
        isApproved: true, // Assume approved for login
        // Include driver-specific fields if role is driver
        ...(responseData.role === 'driver' && {
          status: responseData.status,
          vehicleType: responseData.vehicleType,
          vehiclePlate: responseData.vehiclePlate,
          vehicleImage: responseData.vehicleImage,
          trailerPlate: responseData.trailerPlate,
          vehicleCategory: responseData.vehicleCategory,
          vehicleModel: responseData.vehicleModel,
          currentLocation: responseData.currentLocation
        })
      } as User;

      // Set current user and mark auth check as complete
      set({ currentUser: user, isAuthChecking: false });

      // Initialize WebSocket connection with token
      initSocket(response.data.token);

      // Setup online users listener
      onOnlineUsersUpdate((userIds) => {
        set({ onlineUsers: userIds });
      });

      // Initialize real-time updates
      get().initRealTimeUpdates();

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
    if (!token) {
      set({ isAuthChecking: false });
      return;
    }

    try {
      const response = await userApi.getCurrentUser();
      const responseData = response.data as any; // Type assertion for additional fields
      const user = {
        id: responseData._id,
        name: responseData.name,
        email: responseData.email,
        role: responseData.role,
        avatar: responseData.avatar,
        phone: responseData.phone,
        isApproved: true,
        // Include driver-specific fields if role is driver
        ...(responseData.role === 'driver' && {
          status: responseData.status,
          vehicleType: responseData.vehicleType,
          vehiclePlate: responseData.vehiclePlate,
          vehicleImage: responseData.vehicleImage,
          trailerPlate: responseData.trailerPlate,
          vehicleCategory: responseData.vehicleCategory,
          vehicleModel: responseData.vehicleModel,
          currentLocation: responseData.currentLocation
        })
      } as User;

      set({ currentUser: user, isAuthChecking: false });
      initSocket(token);

      // Setup online users listener
      onOnlineUsersUpdate((userIds) => {
        set({ onlineUsers: userIds });
      });

      // Initialize real-time updates
      get().initRealTimeUpdates();

      // Fetch initial data
      await get().init();
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({ currentUser: null, isAuthChecking: false });
    }
  },

  logout: () => {
    set({ currentUser: null });
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Disconnect WebSocket
    disconnectSocket();
  },

  addShipment: async (data) => {
    // Generate a tracking ID if the backend doesn't handle it
    const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const response = await shipmentApi.createShipment({
        ...data,
        trackingId,
        statusHistory: [{ status: data.status, timestamp: new Date().toISOString(), note: 'Shipment created' }]
      });

      const newShipment: Shipment = {
        ...response.data,
        id: response.data._id || response.data.id
      };

      set(state => ({ shipments: [newShipment, ...state.shipments] }));
      return newShipment;
    } catch (error) {
      console.error('Failed to create shipment:', error);
      throw error;
    }
  },

  assignDriver: async (shipmentId, driverId) => {
    try {
      const { data: updatedShipment } = await shipmentApi.updateShipment(shipmentId, {
        driverId,
        status: 'assigned',
      });

      set((state) => ({
        shipments: state.shipments.map((s) =>
          s.id === shipmentId ? { ...updatedShipment, id: updatedShipment._id || updatedShipment.id } : s
        ),
      }));

      toast.success('Driver assigned successfully');
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast.error('Failed to assign driver');
      throw error;
    }
  },

  addDriver: async (data) => {
    try {
      const { data: newDriver } = await userApi.createUser({
        ...data,
        role: 'driver',
        isApproved: true,
      });

      const mappedDriver: DriverProfile = {
        ...newDriver,
        id: newDriver._id,
        role: 'driver',
        status: newDriver.status || 'available',
        isApproved: true
      };

      set(state => ({
        drivers: [...state.drivers, mappedDriver],
        users: [...state.users, mappedDriver]
      }));

      toast.success('Driver onboarded successfully');
    } catch (error) {
      console.error('Failed to onboard driver:', error);
      toast.error('Failed to onboard driver');
      throw error;
    }
  },

  updateDriverProfile: async (driverId, updates, comment) => {
    try {
      const { data: updatedDriver } = await driverApi.updateDriverProfile(driverId, updates);

      set(state => {
        const newDrivers = state.drivers.map(d => d.id === driverId ? { ...updatedDriver, id: updatedDriver._id } : d);
        const newUsers = state.users.map(u => u.id === driverId ? { ...updatedDriver, id: updatedDriver._id } : u);

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

      if (comment) {
        toast.info(comment);
      } else {
        toast.success('Profile updated successfully');
      }

      // Broadcast the update to other clients
      get().broadcastDriverUpdate(driverId, updates);
    } catch (error) {
      console.error('Failed to update driver profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const { data: updatedUser } = await userApi.updateUserProfile(updates);

      const mappedUser = {
        ...updatedUser,
        id: updatedUser._id || updatedUser.id
      };

      set(state => ({
        currentUser: mappedUser,
        users: state.users.map(u => u.id === mappedUser.id ? { ...u, ...mappedUser } : u),
        drivers: state.drivers.map(d => d.id === mappedUser.id ? { ...d, ...mappedUser } : d)
      }));

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      await userApi.changePassword(passwordData);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
      throw error;
    }
  },

  updateShipmentStatus: async (shipmentId, status, note) => {
    try {
      const { data: updatedShipment } = await shipmentApi.updateShipment(shipmentId, {
        status,
        note,
      });

      set(state => {
        const updatedShipments = state.shipments.map(s =>
          s.id === shipmentId ? { ...updatedShipment, id: updatedShipment._id || updatedShipment.id } : s
        );

        // Broadcast the update to other clients
        get().broadcastShipmentUpdate(shipmentId, {
          status,
          statusHistory: updatedShipment.statusHistory
        });

        return { shipments: updatedShipments };
      });

      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update shipment status:', error);
      toast.error('Failed to update status');
      throw error;
    }
  },

  addPayment: async (payment) => {
    try {
      await paymentApi.createPayment(payment);
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
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
    const { currentUser, replyTo } = get();
    if (!currentUser) return;

    const messagePayload = {
      recipientId,
      content,
      attachments,
      replyTo // Include reply context if active
    };

    // Send via socket for real-time delivery
    sendSocketMessage('sendMessage', messagePayload);

    // Optimistically update local message list for better UX
    const optimisticMessage: Message = {
      id: `opt-${Date.now()}`,
      senderId: currentUser.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments,
      replyTo,
      reactions: []
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
      replyTo: null // Clear reply context after sending
    }));
  },

  addReaction: async (messageId, emoji) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Optimistically update reactions
    set(state => ({
      messages: state.messages.map(m => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          const existingIndex = reactions.findIndex(
            r => r.user === currentUser.id && r.emoji === emoji
          );

          if (existingIndex > -1) {
            // Remove
            const newReactions = [...reactions];
            newReactions.splice(existingIndex, 1);
            return { ...m, reactions: newReactions };
          } else {
            // Add
            return { ...m, reactions: [...reactions, { user: currentUser.id, emoji }] };
          }
        }
        return m;
      })
    }));

    try {
      await messageApi.addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Rollback on error if necessary
    }
  },

  setReplyTo: (reply) => set({ replyTo: reply }),

  createJob: async (jobData) => {
    try {
      const response = await jobApi.createJob(jobData);
      // We don't necessarily need to add to state here if we rely on WebSocket, 
      // but optimistic update is better
      const newJob = {
        ...response.data,
        id: response.data._id || response.data.id
      };
      set(state => ({ jobs: [newJob, ...state.jobs] }));
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  },

  fetchJobs: async () => {
    try {
      const response = await jobApi.getJobs();
      set({
        jobs: response.data.map((j: any) => ({
          ...j,
          id: j._id || j.id,
          postedBy: { ...j.postedBy, id: j.postedBy?._id || j.postedBy?.id || j.postedBy }
        }))
      });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  },

  reactToJob: async (jobId, emoji) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Optimistic update
    set(state => ({
      jobs: state.jobs.map(j => {
        if (j.id === jobId) {
          const reactions = j.reactions || [];
          const existingIndex = reactions.findIndex(
            r => r.user === currentUser.id && r.emoji === emoji
          );

          if (existingIndex > -1) {
            const newReactions = [...reactions];
            newReactions.splice(existingIndex, 1);
            return { ...j, reactions: newReactions };
          } else {
            return { ...j, reactions: [...reactions, { user: currentUser.id, emoji }] };
          }
        }
        return j;
      })
    }));

    try {
      await jobApi.reactToJob(jobId, emoji);
    } catch (error) {
      console.error('Failed to react to job:', error);
    }
  },

  updateJobStatus: async (jobId, status) => {
    try {
      await jobApi.updateJobStatus(jobId, status);
      set(state => ({
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, status } : j)
      }));
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
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

  markMessageAsRead: async (messageId) => {
    // 1. Optimistically update store to break potential re-render loops
    set(state => ({
      messages: state.messages.map(m =>
        m.id === messageId
          ? { ...m, read: true }
          : m
      )
    }));

    try {
      await messageApi.markAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      // Optional: Rollback if necessary, but for read receipts it's usually fine
    }
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
  },

  // Initialize real-time WebSocket event handlers
  initRealTimeUpdates: () => {
    const socket = getSocket();
    if (!socket) return;

    // Subscribe to update channels
    socket.emit('subscribeToUpdates', {
      updateTypes: ['shipment', 'driver', 'user']
    });

    // Clean up existing listeners to prevent duplicates
    socket.off('shipmentUpdate');
    socket.off('driverUpdate');
    socket.off('userUpdate');
    socket.off('data-updated');
    socket.off('new-message');
    socket.off('messageRead');

    // Listen for shipment updates
    socket.on('shipmentUpdate', (shipmentData: Partial<Shipment>) => {
      set(state => ({
        shipments: state.shipments.map(s =>
          s.id === shipmentData.id ? { ...s, ...shipmentData } : s
        )
      }));
    });

    // Listen for message read events
    socket.on('messageRead', (data: { messageId: string; conversationId: string; readAt: string }) => {
      console.log('Received messageRead:', data);
      set(state => ({
        messages: state.messages.map(m =>
          m.id === data.messageId ? { ...m, read: true } : m
        )
      }));
    });

    // Listen for driver updates
    socket.on('driverUpdate', (driverData: Partial<DriverProfile>) => {
      set(state => ({
        drivers: state.drivers.map(d =>
          d.id === driverData.id ? { ...d, ...driverData } : d
        ),
        users: state.users.map(u =>
          u.id === driverData.id ? { ...u, ...driverData } : u
        )
      }));
    });

    // Listen for user updates
    socket.on('userUpdate', (userData: Partial<User>) => {
      set(state => ({
        users: state.users.map(u =>
          u.id === userData.id ? { ...u, ...userData } : u
        )
      }));
    });

    // Listen for generic data-updated event
    socket.on('data-updated', (payload: { type: string; action: string; data: any }) => {
      const { type, action, data } = payload;
      console.log('Received data-updated:', payload);

      if (type === 'shipment') {
        set(state => {
          if (action === 'create') {
            // Deduplicate: remove if already exists (e.g. from optimistic update)
            const cleanedShipments = state.shipments.filter(s => s.id !== data.id && s.id !== data._id);
            return { shipments: [data, ...cleanedShipments] };
          } else if (action === 'update') {
            return {
              shipments: state.shipments.map(s =>
                (s.id === data.id || (s as any)._id === data.id) ? { ...s, ...data } : s
              )
            };
          } else if (action === 'delete') {
            return {
              shipments: state.shipments.filter(s => s.id !== data.id)
            };
          }
          return {};
        });
      } else if (type === 'user') {
        set(state => {
          // Handle user updates (affecting both users and drivers lists)
          const userId = data.id || data._id;
          let newUsers = state.users.filter(u => u.id !== userId);
          let newDrivers = state.drivers.filter(d => d.id !== userId);

          if (action === 'create' || action === 'update') {
            newUsers = [data, ...newUsers];
            if (data.role === 'driver') {
              newDrivers = [data as DriverProfile, ...newDrivers];
            }
          } else if (action === 'delete') {
            // Already filtered out above
          }

          return { users: newUsers, drivers: newDrivers };
        });
      } else if (type === 'payment') {
        set(state => {
          if (action === 'create') {
            // Check if payment already exists to prevent duplicates
            if (state.payments.some(p => p.id === data._id || p.id === data.id)) {
              return {};
            }
            return { payments: [{ ...data, id: data._id || data.id }, ...state.payments] };
          } else if (action === 'update') {
            return {
              payments: state.payments.map(p =>
                p.id === (data._id || data.id) ? { ...p, ...data, id: data._id || data.id } : p
              )
            };
          }
          return {};
        });
      }
    });

    // Listen for new-message event
    socket.on('new-message', (message: any) => {
      console.log('Received new-message:', message);

      // Ensure we map backend fields if necessary
      const mappedMessage: Message = {
        id: message.id || message._id,
        senderId: message.senderId || (typeof message.sender === 'object' ? message.sender._id : message.sender),
        recipientId: message.recipientId || (typeof message.recipient === 'object' ? message.recipient._id : message.recipient),
        content: message.content,
        timestamp: message.timestamp || message.createdAt,
        read: message.read,
        attachments: message.attachments,
        reactions: message.reactions || [],
        replyTo: message.replyTo
      };

      // Deduplicate and resolve optimistic messages
      set((state) => {
        const { currentUser } = get();
        let messages = state.messages;

        // 1. Check if this is a real message replacing an optimistic one
        let replaced = false;
        if (currentUser && mappedMessage.senderId === currentUser.id) {
          messages = messages.map(m => {
            if (m.id.startsWith('opt-') && m.content === mappedMessage.content && m.recipientId === mappedMessage.recipientId) {
              replaced = true;
              return mappedMessage;
            }
            return m;
          });
        }

        // 2. If not replaced, but already exists by ID, just ignore (or update)
        if (!replaced && messages.some(m => m.id === mappedMessage.id)) {
          return {};
        }

        // 3. If not replaced and doesn't exist, append
        if (!replaced) {
          messages = [...messages, mappedMessage];
        }

        return { messages };
      });

      // Show toast notification for new incoming messages
      const sender = get().users.find(u => u.id === mappedMessage.senderId);
      const senderName = sender?.name || 'Someone';

      toast(`New message from ${senderName}`, {
        description: mappedMessage.content.length > 50
          ? mappedMessage.content.substring(0, 50) + '...'
          : mappedMessage.content,
        action: {
          label: 'View',
          onClick: () => {
            // We can't easily navigate from here without a router context, 
            // but sonner toasts are usually self-contained. 
            // The user can click the sidebar link.
          }
        }
      });
    });

    // Listen for message reaction events
    socket.on('messageReaction', (data: { messageId: string; reactions: any[] }) => {
      console.log('Received messageReaction:', data);
      set(state => ({
        messages: state.messages.map(m =>
          m.id === data.messageId ? { ...m, reactions: data.reactions } : m
        )
      }));
    });

    // Job Board listeners
    socket.on('jobCreated', (job: any) => {
      console.log('Received jobCreated:', job);
      const mappedJob = {
        ...job,
        id: job._id || job.id,
        postedBy: { ...job.postedBy, id: job.postedBy?._id || job.postedBy?.id || job.postedBy }
      };
      set(state => ({
        jobs: [mappedJob, ...state.jobs.filter(j => j.id !== mappedJob.id)]
      }));
    });

    socket.on('jobReaction', (data: { jobId: string; reactions: any[] }) => {
      console.log('Received jobReaction:', data);
      set(state => ({
        jobs: state.jobs.map(j =>
          j.id === data.jobId ? { ...j, reactions: data.reactions } : j
        )
      }));
    });

    socket.on('jobStatusUpdated', (data: { jobId: string; status: JobPost['status'] }) => {
      console.log('Received jobStatusUpdated:', data);
      set(state => ({
        jobs: state.jobs.map(j =>
          j.id === data.jobId ? { ...j, status: data.status } : j
        )
      }));
    });

    // Listen for message read events
    socket.on('messageRead', (data: { messageId: string; conversationId: string; readAt: string }) => {
      console.log('Received messageRead:', data);
      set(state => ({
        messages: state.messages.map(m =>
          (m.id === data.messageId || (m as any)._id === data.messageId) ? { ...m, read: true } : m
        )
      }));
    });
  },

  // Broadcast shipment updates to other clients
  broadcastShipmentUpdate: (shipmentId: string, updates: Partial<Shipment>) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('shipmentUpdated', { id: shipmentId, ...updates });
    }
  },

  // Broadcast driver updates to other clients
  broadcastDriverUpdate: (driverId: string, updates: Partial<DriverProfile>) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('driverUpdated', { id: driverId, ...updates });
    }
  },

  // Broadcast user updates to other clients
  broadcastUserUpdate: (userId: string, updates: Partial<User>) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('userUpdated', { id: userId, ...updates });
    }
  }
}));
