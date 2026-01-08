export type UserRole = 'client' | 'driver' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
}

export type ShipmentStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

export type CargoType = 'general' | 'fragile' | 'hazardous' | 'refrigerated' | 'oversized' | 'documents';

export interface Shipment {
  id: string;
  clientId: string;
  clientName: string;
  driverId?: string;
  driverName?: string;
  
  // Cargo details
  cargoType: CargoType;
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  quantity: number;
  description: string;
  specialInstructions?: string;
  
  // Locations
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  
  // Dates
  scheduledPickupDate: Date;
  actualPickupDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  // Status
  status: ShipmentStatus;
  statusHistory: StatusUpdate[];
  
  // Pricing
  price?: number;
  invoiceId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusUpdate {
  status: ShipmentStatus;
  timestamp: Date;
  note?: string;
  updatedBy: string;
}

export interface Invoice {
  id: string;
  shipmentId: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licensePlate: string;
  status: 'available' | 'busy' | 'offline';
  activeShipments: number;
  completedShipments: number;
  createdAt: Date;
}

export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  general: 'General Cargo',
  fragile: 'Fragile',
  hazardous: 'Hazardous Materials',
  refrigerated: 'Refrigerated',
  oversized: 'Oversized',
  documents: 'Documents',
};

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};
