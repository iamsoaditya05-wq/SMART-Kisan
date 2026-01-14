
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PRICE_WATCHER = 'PRICE_WATCHER',
  FARM_FLOW = 'FARM_FLOW',
  BUYERS_CONNECT = 'BUYERS_CONNECT',
  TECH_STACK = 'TECH_STACK',
  IMPLEMENTATION = 'IMPLEMENTATION'
}

export type Language = 'en' | 'hi' | 'mr' | 'pa';

export interface CropPrice {
  crop: string;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export interface SensorData {
  moisture: number;
  temperature: number;
  humidity: number;
  npk: { n: number; p: number; k: number };
  timestamp: string;
}

export interface BuyerListing {
  id: string;
  name: string;
  type: 'Wholesaler' | 'Retailer' | 'Exporter';
  rating: number;
  location: string;
  verified: boolean;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface FarmerNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  read: boolean;
  category: 'soil' | 'pesticide' | 'market' | 'irrigation';
}
