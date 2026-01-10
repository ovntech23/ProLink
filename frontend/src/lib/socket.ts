import { io, Socket } from 'socket.io-client';
import type { Message } from '../store/useStore';

// Define the server URL
const SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create the socket connection
let socket: Socket | null = null;

// Initialize the socket connection
export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
    });

    // Join the user to the socket room
    socket.emit('join', userId);

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  return socket;
};

// Send a message through WebSocket
export const sendSocketMessage = (messageData: any) => {
  if (socket) {
    socket.emit('sendMessage', messageData);
  }
};

// Listen for incoming messages
export const onMessageReceived = (callback: (message: Message) => void) => {
  if (socket) {
    socket.on('receiveMessage', callback);
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
  }
};