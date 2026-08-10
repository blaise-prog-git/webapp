import type {
  PublicConfig,
  Quote,
  CartItem,
  FulfillmentInfo,
  CustomerInfo,
  Order,
  User,
  MenuItem,
  DeliveryZone,
  BusinessInfo,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  getConfig: (): Promise<PublicConfig> =>
    fetchApi<PublicConfig>('/api/public-config'),

  getQuote: (items: CartItem[], fulfillment: FulfillmentInfo): Promise<Quote> =>
    fetchApi<Quote>('/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        fulfillment,
      }),
    }),

  initializePayment: (body: {
    items: { id: string; quantity: number }[];
    fulfillment: FulfillmentInfo;
    customer: CustomerInfo;
    token?: string;
  }): Promise<{
    mode: string;
    order: Order;
    authorizationUrl?: string;
    reference?: string;
    message?: string;
  }> => fetchApi('/api/paystack/initialize', { method: 'POST', body: JSON.stringify(body) }),

  verifyPayment: (reference: string): Promise<{ order: Order; verified: boolean; mode: string }> =>
    fetchApi(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`),

  signup: (body: { name: string; email: string; phone: string; password: string }): Promise<{ user: User; token: string }> =>
    fetchApi('/api/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }): Promise<{ user: User; token: string }> =>
    fetchApi('/api/login', { method: 'POST', body: JSON.stringify(body) }),

  askAI: (message: string, items: CartItem[], fulfillment: FulfillmentInfo): Promise<{
    reply: string;
    availableMenu: MenuItem[];
    quote: Quote;
  }> => fetchApi('/api/ai-assistant', {
    method: 'POST',
    body: JSON.stringify({ message, items, fulfillment }),
  }),

  // Staff
  getStaffOrders: (pin: string): Promise<{ orders: Order[] }> =>
    fetchApi('/api/staff/orders', { headers: { 'x-staff-pin': pin } }),

  updateOrderStatus: (pin: string, id: string, patch: { status?: string; staffNote?: string; paymentStatus?: string }): Promise<{ order: Order }> =>
    fetchApi(`/api/staff/orders/${id}`, {
      method: 'PATCH',
      headers: { 'x-staff-pin': pin, 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),

  // Admin
  getAdminConfig: (pin: string): Promise<{
    businessInfo: BusinessInfo;
    menu: MenuItem[];
    deliveryZones: DeliveryZone[];
    orders: Order[];
  }> => fetchApi('/api/admin/config', { headers: { 'x-admin-pin': pin } }),

  updateBusinessInfo: (pin: string, info: BusinessInfo): Promise<{ businessInfo: BusinessInfo }> =>
    fetchApi('/api/admin/business-info', {
      method: 'PUT',
      headers: { 'x-admin-pin': pin, 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    }),

  updateMenu: (pin: string, menu: MenuItem[]): Promise<{ menu: MenuItem[] }> =>
    fetchApi('/api/admin/menu', {
      method: 'PUT',
      headers: { 'x-admin-pin': pin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu }),
    }),

  updateDeliveryZones: (pin: string, zones: DeliveryZone[]): Promise<{ deliveryZones: DeliveryZone[] }> =>
    fetchApi('/api/admin/delivery-zones', {
      method: 'PUT',
      headers: { 'x-admin-pin': pin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryZones: zones }),
    }),

  getPaystackStatus: (pin: string): Promise<{
    publicKeyConfigured: boolean;
    secretKeyConfigured: boolean;
    mode: string;
  }> => fetchApi('/api/admin/paystack-status', { headers: { 'x-admin-pin': pin } }),
};

// Image mapping for menu items and variants
export const itemImages: Record<string, string> = {
  meatpie: '/meatpie.jpg',
  sausage: '/sausage.jpg',
  shawarma: '/shawarma.jpg',
  'shawarma-beef': '/shawarma.jpg',
  'shawarma-chicken': '/shawarma.jpg',
  'shawarma-hotdog': '/shawarma.jpg',
  'shawarma-chicken-hotdog': '/shawarma.jpg',
  'shawarma-beef-chicken': '/shawarma.jpg',
  'shawarma-jumbo': '/shawarma.jpg',
  'shawarma-super-jumbo': '/shawarma.jpg',
  'shawarma-special': '/shawarma.jpg',
  spaghetti: '/spaghetti.jpg',
  'fruit-parfait': '/parfait.jpg',
  yogurt: '/yogurt.jpg',
  'soft-drink': '/soft-drink.jpg',
  'soft-drink-pepsi': '/soft-drink.jpg',
  'soft-drink-fanta': '/soft-drink.jpg',
  'soft-drink-sprite': '/soft-drink.jpg',
  'soft-drink-coca-cola': '/soft-drink.jpg',
  'soft-drink-fanta-blackcurrant': '/soft-drink.jpg',
  'soft-drink-schweppes': '/soft-drink.jpg',
  'soft-drink-5alive': '/juice.jpg',
  'soft-drink-chivita': '/juice.jpg',
  juice: '/juice.jpg',
};

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
