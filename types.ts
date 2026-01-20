
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PRICE_WATCHER = 'PRICE_WATCHER',
  FARM_FLOW = 'FARM_FLOW',
  BUYERS_CONNECT = 'BUYERS_CONNECT',
  PROFILE = 'PROFILE',
  TECH_STACK = 'TECH_STACK',
  IMPLEMENTATION = 'IMPLEMENTATION'
}

export type Language = 'en' | 'hi' | 'mr' | 'pa';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  state: string;
  district: string;
  farm_size_acres: number;
  soil_type: string;
  preferred_crop: string;
  reputation_points?: number;
}

export interface NPKReading {
  n: number;
  p: number;
  k: number;
  ph: number;
  moisture: number;
  timestamp: string;
}

export interface ResourceUsage {
  water_liters: number;
  fertilizer_kg: number;
  timestamp: string;
}

export interface CropHealthAnalysis {
  status: 'Healthy' | 'Stressed' | 'Diseased';
  confidence: number;
  details: string;
  recommendations: string[];
}

export interface CropPrice {
  crop: string;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
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
