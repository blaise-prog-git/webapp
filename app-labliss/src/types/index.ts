export interface Variant {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  minQty: number;
  available: boolean;
  prepMinutes: number;
  image?: string;
  hasVariants?: boolean;
  variants?: Variant[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  km: number;
  minutes: number;
}

export interface BusinessInfo {
  businessName: string;
  domain: string;
  headline: string;
  intro: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  email: string;
  address: string;
  serviceFeePercent: number;
  deliveryBaseFee: number;
  deliveryPerKm: number;
  longDistanceSurcharge: number;
  longDistanceKm: number;
}

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  minQty: number;
  prepMinutes: number;
  belowMinimum: boolean;
  image?: string;
  variantSize?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  note: string;
}

export interface FulfillmentInfo {
  type: 'delivery' | 'pickup';
  address: string;
  zone: string;
  distanceKm: number;
  pickupTime: string;
}

export interface Quote {
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  currency: string;
  fulfillmentType: string;
  distanceKm: number;
  prepMinutes: number;
  deliveryMinutes: number;
  estimatedMinutes: number;
  warnings: string[];
}

export interface Order {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  customer: CustomerInfo;
  fulfillment: FulfillmentInfo;
  quote: Quote;
  receipt: Receipt | null;
  staffNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  receiptNo: string;
  issuedAt: string;
  business: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  currency: string;
  fulfillment: FulfillmentInfo;
  estimatedMinutes: number;
  paymentReference: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  token: string;
}

export interface PublicConfig {
  menu: MenuItem[];
  deliveryZones: DeliveryZone[];
  businessInfo: BusinessInfo;
  currency: string;
  paystackPublicKeyConfigured: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type OrderStep = 1 | 2 | 3 | 4;
export type CategoryFilter = 'All' | 'Pastries' | 'Meals' | 'Treats' | 'Drinks';
