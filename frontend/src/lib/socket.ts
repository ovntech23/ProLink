import { io, Socket } from 'socket.io-client';
import type { Message } from '../store/useStore';

// Define the server URL
const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  // In production, if VITE_API_BASE_URL is not set, connect to the same host/origin
  // In development (localhost), connect to the default backend port (5000)
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      return window.location.origin;
    }
  }
  return 'http://localhost:5000';
};

const SERVER_URL = getSocketUrl();

// Extended window interface to hold global socket instance
declare global {
  interface Window {
    _socket: Socket | null;
  }
}

// Create the socket connection & track active token
let socket: Socket | null = window._socket || null;
let activeToken: string | null = null;

// Initialize the socket connection with token authentication
export const initSocket = (token: string) => {
  // If we have an active socket with the same token, reuse it
  if (socket && activeToken === token) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  // If we have an existing socket but with a different token (or no token tracked yet), clean it up
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners(); // Ensure no listeners remain
  }

  activeToken = token;

  socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'], // Enable polling fallback
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token: token
    }
  });

  // Store in global window to persist across HMR
  window._socket = socket;

  // Handle connection events
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    // Emit join event to register user as online
    if (socket) {
      socket.emit('join');
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  return socket;
};

// Send a data through WebSocket
export const sendSocketMessage = (eventName: string, data: any) => {
  if (socket) {
    socket.emit(eventName, data);
  }
};

// Listen for incoming messages
export const onMessageReceived = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('receiveMessage', callback);
    // Removed messageSent listener to prevent duplication with optimistic updates
  }
};

export const onOnlineUsersUpdate = (callback: (userIds: string[]) => void) => {
  if (socket) {
    socket.on('onlineUsers', callback);
  }
};

// Listen for message sent confirmation
export const onMessageSent = (callback: (message: Message) => void) => {
  if (socket) {
    socket.on('messageSent', callback);
  }
};

// Send typing indicator
export const sendTypingIndicator = (data: { senderId: string; recipientId: string; isTyping: boolean }) => {
  if (socket) {
    socket.emit('typing', data);
  }
};

// Listen for typing indicator
export const onTypingIndicator = (callback: (data: { senderId: string; recipientId: string; isTyping: boolean }) => void) => {
  if (socket) {
    socket.on('userTyping', callback);
  }
};

// Disconnect the socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    window._socket = null;
    activeToken = null;
  }
};
