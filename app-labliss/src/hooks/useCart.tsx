import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CartItem, MenuItem, Quote, FulfillmentInfo, CustomerInfo } from '@/types';
import { api, itemImages } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  quote: Quote | null;
  fulfillment: FulfillmentInfo;
  customer: CustomerInfo;
  step: number;
  addItem: (menuItem: MenuItem, variantSize?: string, variantPrice?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setFulfillment: (f: FulfillmentInfo) => void;
  setCustomer: (c: CustomerInfo) => void;
  setStep: (s: number) => void;
  clearCart: () => void;
  itemCount: number;
  isBelowMinimum: boolean;
}

const defaultFulfillment: FulfillmentInfo = {
  type: 'delivery',
  address: '',
  zone: 'near',
  distanceKm: 5,
  pickupTime: '',
};

const defaultCustomer: CustomerInfo = {
  name: '',
  email: '',
  phone: '',
  note: '',
};

// Business config defaults (mirrors server.js defaults)
const businessConfig = {
  serviceFeePercent: 1.5,
  deliveryBaseFee: 1000,
  deliveryPerKm: 220,
  longDistanceSurcharge: 1500,
  longDistanceKm: 15,
};

// Zone distance lookup
const zoneDistances: Record<string, number> = {
  near: 5,
  mid: 12,
  far: 25,
  custom: 1,
  pickup: 0,
};

const zoneMinutes: Record<string, number> = {
  near: 20,
  mid: 35,
  far: 60,
  custom: 15,
  pickup: 0,
};

/**
 * Client-side quote calculator — mirrors the backend logic exactly.
 * This ensures the quote is ALWAYS available even when the backend is down.
 */
function calculateQuoteClientSide(
  items: CartItem[],
  fulfillment: FulfillmentInfo
): Quote | null {
  if (items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const fulfillmentType = fulfillment.type === 'pickup' ? 'pickup' : 'delivery';

  // Distance
  let distanceKm = 0;
  if (fulfillmentType === 'pickup') {
    distanceKm = 0;
  } else if (fulfillment.zone === 'custom') {
    distanceKm = Math.max(1, Math.min(80, fulfillment.distanceKm || 1));
  } else {
    distanceKm = zoneDistances[fulfillment.zone] || 5;
  }

  // Delivery fee
  let deliveryFee = 0;
  if (fulfillmentType === 'delivery') {
    const base = businessConfig.deliveryBaseFee;
    const perKm = businessConfig.deliveryPerKm;
    const surcharge = distanceKm > businessConfig.longDistanceKm ? businessConfig.longDistanceSurcharge : 0;
    deliveryFee = Math.round(base + distanceKm * perKm + surcharge);
  }

  // Prep time
  const prepMinutes = items.reduce((max, item) => Math.max(max, item.prepMinutes), 0);

  // Delivery time
  const deliveryMinutes = fulfillmentType === 'pickup'
    ? 0
    : Math.max(15, Math.round(zoneMinutes[fulfillment.zone] || 20));

  // Service fee
  const serviceFee = subtotal
    ? Math.round(subtotal * (businessConfig.serviceFeePercent / 100))
    : 0;

  const total = subtotal + deliveryFee + serviceFee;

  const warnings = items
    .filter((item) => item.belowMinimum)
    .map((item) => `${item.name} minimum order is ${item.minQty}.`);

  return {
    items: [...items],
    subtotal,
    serviceFee,
    deliveryFee,
    total,
    currency: 'NGN',
    fulfillmentType,
    distanceKm,
    prepMinutes,
    deliveryMinutes,
    estimatedMinutes: prepMinutes + deliveryMinutes,
    warnings,
  };
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [fulfillment, setFulfillment] = useState<FulfillmentInfo>(defaultFulfillment);
  const [customer, setCustomer] = useState<CustomerInfo>(defaultCustomer);
  const [step, setStep] = useState(1);

  // ===== Auto-recalculate quote whenever items or fulfillment change =====
  useEffect(() => {
    const clientQuote = calculateQuoteClientSide(items, fulfillment);
    setQuote(clientQuote);
  }, [items, fulfillment]);

  // ===== Also try to sync with backend (for accuracy) =====
  const syncQuoteWithBackend = useCallback(async () => {
    if (items.length === 0) return;
    try {
      const serverQuote = await api.getQuote(items, fulfillment);
      setQuote(serverQuote);
    } catch {
      // Backend unavailable — client-side quote already calculated by useEffect above
    }
  }, [items, fulfillment]);

  // Sync when items/fulfillment change (after client-side calc)
  useEffect(() => {
    syncQuoteWithBackend();
  }, [syncQuoteWithBackend]);

  const addItem = useCallback((menuItem: MenuItem, variantSize?: string, variantPrice?: number) => {
    const unitPrice = variantPrice ?? menuItem.price;
    const displayName = variantSize ? `${menuItem.name} (${variantSize})` : menuItem.name;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id && i.variantSize === variantSize);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id && i.variantSize === variantSize
            ? {
                ...i,
                quantity: i.quantity + 1,
                lineTotal: i.unitPrice * (i.quantity + 1),
                belowMinimum: i.quantity + 1 < i.minQty,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: displayName,
          unitPrice,
          quantity: 1,
          lineTotal: unitPrice,
          minQty: menuItem.minQty,
          prepMinutes: menuItem.prepMinutes,
          belowMinimum: 1 < menuItem.minQty,
          image: itemImages[menuItem.id] || '',
          variantSize,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity,
              lineTotal: i.unitPrice * quantity,
              belowMinimum: quantity < i.minQty,
            }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setQuote(null);
    setStep(1);
    setFulfillment(defaultFulfillment);
    setCustomer(defaultCustomer);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isBelowMinimum = items.some((i) => i.belowMinimum);

  return (
    <CartContext.Provider
      value={{
        items,
        quote,
        fulfillment,
        customer,
        step,
        addItem,
        removeItem,
        updateQuantity,
        setFulfillment,
        setCustomer,
        setStep,
        clearCart,
        itemCount,
        isBelowMinimum,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
