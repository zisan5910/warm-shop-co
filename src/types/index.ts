export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled' | 'returned' | 'refunded';
export type PaymentMethod = 'cod' | 'bkash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  deliveryAddress: string;
  deliveryCharge: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface Banner {
  id: string;
  imageUrl: string;
  targetUrl: string;
  active: boolean;
}

export interface Settings {
  paymentMethods: {
    cod: boolean;
    bkash: boolean;
  };
  deliveryCharges: {
    [location: string]: number;
  };
  // App Branding
  appName: string;
  appLogo: string;
  // Contact Info
  phone: string;
  whatsapp: string;
  email: string;
  // Payment Info
  bkashNumber: string;
  // Location
  location: string;
}
