import { create } from 'zustand';
import { driverApi } from '../lib/api';
import { 
  initSocket, 
  sendSocketMessage, 
  onMessageReceived, 
  onMessageSent,
  disconnectSocket
} from '../lib/socket';

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
  login: (email: string) => void;
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
  signUp: (user: Omit<User, 'id' | 'isApproved'>) => void;
  reportShipmentIncident: (shipmentId: string, note: string) => void;
  sendMessage: (recipientId: string, content: string, attachments?: Attachment[]) => void;
  getMessagesBetweenUsers: (userId1: string, userId2: string) => Message[];
  getUnreadMessages: (userId: string) => Message[];
  markMessageAsRead: (messageId: string) => void;
  getConversations: (userId: string) => { user: User; lastMessage: Message; unreadCount: number }[];
}

const MOCK_DRIVERS: DriverProfile[] = [
  {
    id: 'd1',
    name: 'John Doe',
    email: 'john@driver.com',
    role: 'driver',
    status: 'available',
    vehicleType: 'Truck 10T',
    vehiclePlate: 'ABC-1234',
    vehicleModel: 'Volvo FH16',
    vehicleCategory: 'Heavy Load',
    trailerPlate: 'TRL-9988',
    phone: '+260 96 123 4567',
    currentLocation: 'Lusaka',
    isApproved: true
  },
  {
    id: 'd2',
    name: 'Jane Smith',
    email: 'jane@driver.com',
    role: 'driver',
    status: 'busy',
    vehicleType: 'Van',
    vehiclePlate: 'XYZ-9876',
    vehicleModel: 'Mercedes Sprinter',
    vehicleCategory: 'Light Delivery',
    phone: '+260 97 888 9999',
    currentLocation: 'Ndola',
    isApproved: true
  }
];

const MOCK_USERS: User[] = [
  {
    id: 'b1',
    name: 'ProLink Admin',
    email: 'admin@prolink.com',
    role: 'broker',
    isApproved: true
  },
  {
    id: 'o1',
    name: 'Cargo King Ltd',
    email: 'client@cargoking.com',
    role: 'owner',
    isApproved: true,
    phone: '+260 95 555 1122'
  },
  {
    id: 'o2',
    name: 'New Cargo Co',
    email: 'new@cargo.com',
    role: 'owner',
    isApproved: false,
    phone: '+260 96 444 8899'
  },
  ...MOCK_DRIVERS
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    shipmentId: 's1',
    amount: 15000,
    currency: 'ZMW',
    status: 'completed',
    date: '2025-01-02T10:00:00Z',
    payer: 'Cargo King Ltd',
    payee: 'ProLink Logistics',
    type: 'client_invoice'
  },
  {
    id: 'p2',
    shipmentId: 's1',
    amount: 5000,
    currency: 'ZMW',
    status: 'pending',
    date: '2025-01-03T08:00:00Z',
    payer: 'ProLink Logistics',
    payee: 'Jane Smith',
    type: 'driver_payment'
  }
];

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 's1',
    trackingId: 'TRK-885421',
    ownerId: 'o1',
    driverId: 'd2',
    origin: 'Lusaka South MFEZ',
    destination: 'Copperbelt Hub, Kitwe',
    status: 'in_transit',
    cargoType: 'Electronics',
    weight: '2500kg',
    pickupDate: '2025-01-02',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2025-01-01T08:00:00Z',
        note: 'Order created'
      },
      {
        status: 'assigned',
        timestamp: '2025-01-01T10:00:00Z',
        note: 'Driver assigned'
      },
      {
        status: 'picked_up',
        timestamp: '2025-01-02T09:00:00Z',
        note: 'Cargo picked up at MFEZ'
      },
      {
        status: 'in_transit',
        timestamp: '2025-01-02T14:30:00Z',
        note: 'Passing Kabwe'
      }
    ]
  }
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'o1',
    recipientId: 'b1',
    content: 'Hello, I have a shipment that needs to be delivered to Kitwe.',
    timestamp: '2025-01-01T09:00:00Z',
    read: true
  },
  {
    id: 'm2',
    senderId: 'b1',
    recipientId: 'o1',
    content: 'Sure, we can arrange that for you. What is the cargo type?',
    timestamp: '2025-01-01T09:15:00Z',
    read: true
  },
  {
    id: 'm3',
    senderId: 'o1',
    recipientId: 'b1',
    content: 'It\'s electronics equipment, about 2.5 tons.',
    timestamp: '2025-01-01T09:20:00Z',
    read: true
  },
  {
    id: 'm4',
    senderId: 'd2',
    recipientId: 'b1',
    content: 'I\'m available for the Kitwe delivery tomorrow.',
    timestamp: '2025-01-01T10:00:00Z',
    read: true
  },
  {
    id: 'm5',
    senderId: 'o1',
    recipientId: 'b1',
    content: 'Here are the shipping documents:',
    timestamp: '2025-01-01T10:30:00Z',
    read: true,
    attachments: [
      {
        id: 'a1',
        name: 'invoice.pdf',
        type: 'application/pdf',
        url: '#',
        size: 102400
      },
      {
        id: 'a2',
        name: 'cargo-photo.jpg',
        type: 'image/jpeg',
        url: '#',
        size: 204800
      }
    ]
  }
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: MOCK_USERS,
  drivers: MOCK_DRIVERS,
  shipments: MOCK_SHIPMENTS,
  payments: MOCK_PAYMENTS,
  messages: MOCK_MESSAGES,

  // Initialize store with data from API
  init: async () => {
    try {
      const { data: drivers } = await driverApi.getDrivers();
      set({ drivers });
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  },

  login: (email) => {
    const user = get().users.find(u => u.email === email);
    if (user) {
      set({ currentUser: user });
      // Initialize WebSocket connection
      initSocket(user.id);
      
      // Listen for incoming messages
      onMessageReceived((message) => {
        set((state) => ({
          messages: [...state.messages, {
            id: message.id,
            senderId: message.senderId,
            recipientId: message.recipientId,
            content: message.content,
            timestamp: message.timestamp,
            read: false,
            attachments: message.attachments
          }]
        }));
      });
    }
  },

  logout: () => {
    set({ currentUser: null });
    // Disconnect WebSocket
    disconnectSocket();
  },

  addShipment: (data) => {
    const newShipment: Shipment = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      statusHistory: [{
        status: data.status,
        timestamp: new Date().toISOString(),
        note: 'Shipment created'
      }]
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
                {
                  status: 'assigned',
                  timestamp: new Date().toISOString(),
                  note: `Driver assigned`
                }
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
      const newDrivers = state.drivers.map(d =>
        d.id === driverId ? { ...d, ...updates } : d
      );
      const newUsers = state.users.map(u =>
        u.id === driverId ? { ...u, ...updates } : u
      );
      
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
                {
                  status: s.status,
                  timestamp: new Date().toISOString(),
                  note: historyNote
                }
              ]
            }
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
                {
                  status,
                  timestamp: new Date().toISOString(),
                  note
                }
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
        p.id === paymentId ? { ...p, status } : p
      )
    }));
  },

  approveUser: (userId) => {
    set(state => ({
      users: state.users.map(u =>
        u.id === userId ? { ...u, isApproved: true } : u
      ),
      drivers: state.drivers.map(d =>
        d.id === userId ? { ...d, isApproved: true } : d
      )
    }));
  },

  deleteUser: (userId) => {
    set(state => ({
      users: state.users.filter(u => u.id !== userId),
      drivers: state.drivers.filter(d => d.id !== userId)
    }));
  },

  signUp: (userData) => {
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      isApproved: false
    } as User;
    set(state => {
      const users = [...state.users, newUser];
      const drivers = userData.role === 'driver' 
        ? [...state.drivers, newUser as DriverProfile] 
        : state.drivers;
      return { users, drivers };
    });
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
                {
                  status: s.status,
                  timestamp: new Date().toISOString(),
                  note: `INCIDENT: ${note}`
                }
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
        m.id === messageId ? { ...m, read: true } : m
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
        userMessages.flatMap(m => 
          m.senderId === userId ? [m.recipientId] : [m.senderId]
        )
      )
    );
    
    // For each partner, get last message and unread count
    partnerIds.forEach(partnerId => {
      const partner = state.users.find(u => u.id === partnerId);
      if (!partner) return;
      
      const conversationMessages = userMessages.filter(
        m =>
          (m.senderId === userId && m.recipientId === partnerId) ||
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