import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useCart } from '@/hooks/useCart';
import { api, formatNaira } from '@/lib/api';
import type { MenuItem, CategoryFilter, PublicConfig, Variant } from '@/types';
import { Link } from 'react-router-dom';

const categories: CategoryFilter[] = ['All', 'Pastries', 'Meals', 'Treats', 'Drinks'];

const fallbackConfig: PublicConfig = {
  menu: [
    { id: 'meatpie', name: 'Meatpie', category: 'Pastries', price: 900, minQty: 10, available: true, prepMinutes: 35 },
    { id: 'sausage', name: 'Sausage Roll', category: 'Pastries', price: 700, minQty: 10, available: true, prepMinutes: 30 },
    {
      id: 'shawarma',
      name: 'Shawarma',
      category: 'Meals',
      price: 3000,
      minQty: 5,
      available: true,
      prepMinutes: 45,
      hasVariants: true,
      variants: [
        { id: 'shawarma-beef', name: 'Beef', price: 3000 },
        { id: 'shawarma-chicken', name: 'Chicken', price: 3800 },
        { id: 'shawarma-hotdog', name: 'Hotdog', price: 3500 },
        { id: 'shawarma-chicken-hotdog', name: 'Chicken & Hotdog', price: 4300 },
        { id: 'shawarma-beef-chicken', name: 'Beef & Chicken', price: 4200 },
        { id: 'shawarma-jumbo', name: 'Jumbo', price: 5300 },
        { id: 'shawarma-super-jumbo', name: 'Super Jumbo', price: 6500 },
        { id: 'shawarma-special', name: 'La_Bliss Special', price: 7000 },
      ],
    },
    { id: 'spaghetti', name: 'Spaghetti Pack', category: 'Meals', price: 2500, minQty: 5, available: true, prepMinutes: 50 },
    { id: 'fruit-parfait', name: 'Fruit Parfait', category: 'Treats', price: 1800, minQty: 6, available: true, prepMinutes: 25 },
    { id: 'yogurt', name: 'Yogurt', category: 'Drinks', price: 1200, minQty: 6, available: true, prepMinutes: 15 },
    {
      id: 'soft-drink',
      name: 'Soft Drink',
      category: 'Drinks',
      price: 500,
      minQty: 12,
      available: true,
      prepMinutes: 10,
      hasVariants: true,
      variants: [
        { id: 'soft-drink-pepsi', name: 'Pepsi', price: 500 },
        { id: 'soft-drink-fanta', name: 'Fanta', price: 500 },
        { id: 'soft-drink-sprite', name: 'Sprite', price: 500 },
        { id: 'soft-drink-coca-cola', name: 'Coca-Cola', price: 500 },
        { id: 'soft-drink-fanta-blackcurrant', name: 'Fanta Blackcurrant', price: 500 },
        { id: 'soft-drink-schweppes', name: 'Schweppes', price: 600 },
        { id: 'soft-drink-5alive', name: '5 Alive', price: 800 },
        { id: 'soft-drink-chivita', name: 'Chivita', price: 800 },
      ],
    },
    { id: 'juice', name: 'Juice', category: 'Drinks', price: 1000, minQty: 6, available: true, prepMinutes: 10 },
  ],
  deliveryZones: [
    { id: 'pickup', name: 'Pickup at store', km: 0, minutes: 0 },
    { id: 'near', name: 'Nearby, 0-5 km', km: 5, minutes: 20 },
    { id: 'mid', name: 'Within town, 6-12 km', km: 12, minutes: 35 },
    { id: 'far', name: 'Farther location, 13-25 km', km: 25, minutes: 60 },
    { id: 'custom', name: 'Custom distance', km: 1, minutes: 15 },
  ],
  businessInfo: {
    businessName: 'Labliss Cakes and Sweeties',
    domain: 'Lablisscakesandsweeties.com.ng',
    headline: 'Order fresh meatpie, shawarma and sweet treats in large quantity.',
    intro: 'Build your order, choose delivery or pickup, get instant totals in naira, pay securely with Paystack, and receive a receipt with delivery time.',
    phone: '+2348065964065',
    whatsapp: '+2348065964065',
    instagram: 'la_blisscakesnsweeties',
    tiktok: 'La_blisscakesnsweeties',
    email: 'orders@lablisscakesandsweeties.com.ng',
    address: 'Mbaise Owerri Road, Imo State',
    serviceFeePercent: 1.5,
    deliveryBaseFee: 1000,
    deliveryPerKm: 220,
    longDistanceSurcharge: 1500,
    longDistanceKm: 15,
  },
  currency: 'NGN',
  paystackPublicKeyConfigured: false,
};

// Image mapping for menu items
const menuImages: Record<string, string> = {
  meatpie: '/meatpie.jpg',
  sausage: '/sausage.jpg',
  shawarma: '/shawarma.jpg',
  spaghetti: '/spaghetti.jpg',
  'fruit-parfait': '/parfait.jpg',
  yogurt: '/yogurt.jpg',
  'soft-drink': '/soft-drink.jpg',
  juice: '/juice.jpg',
};

export function MenuPage() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { items, addItem, updateQuantity, itemCount } = useCart();

  useEffect(() => {
    api.getConfig()
      .then(setConfig)
      .catch(() => setConfig(fallbackConfig))
      .finally(() => setLoading(false));
  }, []);

  const getQuantity = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleQuantityChange = (menuItem: MenuItem, qty: number) => {
    if (qty === 1 && getQuantity(menuItem.id) === 0) {
      addItem(menuItem);
    } else {
      updateQuantity(menuItem.id, qty);
    }
  };

  const handleAddVariant = (menuItem: MenuItem, variant: Variant, qty: number) => {
    addItem(
      {
        id: variant.id,
        name: `${menuItem.name} (${variant.name})`,
        category: menuItem.category,
        price: variant.price,
        minQty: variant.minQty ?? menuItem.minQty,
        available: variant.available !== false,
        prepMinutes: variant.prepMinutes ?? menuItem.prepMinutes,
      },
      variant.name,
      variant.price
    );
    if (qty > 1) {
      setTimeout(() => updateQuantity(variant.id, qty), 0);
    }
  };

  const handleVariantQtyChange = (variantId: string, newQty: number, menuItem: MenuItem, variant: Variant) => {
    const currentQty = getQuantity(variantId);
    if (currentQty === 0 && newQty >= 1) {
      handleAddVariant(menuItem, variant, newQty);
    } else if (newQty === 0) {
      updateQuantity(variantId, 0);
    } else {
      updateQuantity(variantId, newQty);
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItem((prev) => (prev === itemId ? null : itemId));
  };

  const getVariantTotalQty = (item: MenuItem) => {
    if (!item.variants) return 0;
    const variantIds = item.variants.map((v) => v.id);
    return items.filter((i) => variantIds.includes(i.id)).reduce((sum, i) => sum + i.quantity, 0);
  };

  const filteredItems = config?.menu.filter((item) =>
    activeCategory === 'All' ? true : item.category === activeCategory
  ) ?? [];

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E85D2B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Labliss" className="h-8 w-auto" />
          </a>
          <Link
            to="/cart"
            className="relative p-2 text-gray-600 hover:text-[#E85D2B] transition-colors"
          >
            <span className="text-sm font-medium mr-2 hidden sm:inline">Cart</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E85D2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Choose Your Items</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Select from our menu. Minimum quantities apply for each item.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-[#E85D2B] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, index) => {
            const qty = item.hasVariants ? getVariantTotalQty(item) : getQuantity(item.id);
            const isBelowMin = !item.hasVariants && qty > 0 && qty < item.minQty;
            const isExpanded = expandedItem === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#E85D2B]/20 transition-all duration-300 group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={menuImages[item.id] || '/hero.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide">
                    {item.category}
                  </span>
                  {item.hasVariants && (
                    <span className="absolute top-3 right-3 bg-[#E85D2B] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {item.variants?.length} options
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {item.hasVariants
                      ? `From ${formatNaira(Math.min(...(item.variants?.map((v) => v.price) || [0])))} \u2022 Min: ${item.minQty} units`
                      : `Min: ${item.minQty} units \u2022 Ready in ${item.prepMinutes} mins`}
                  </p>
                  {!item.hasVariants && (
                    <p className="text-[#E85D2B] font-bold text-lg mb-4">
                      {formatNaira(item.price)}<span className="text-sm text-gray-400 font-normal">/unit</span>
                    </p>
                  )}

                  {item.hasVariants ? (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-[0.97]"
                    >
                      {isExpanded ? 'Hide Options' : 'Select Type'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  ) : (
                    <QuantitySelector
                      quantity={qty}
                      onChange={(newQty) => handleQuantityChange(item, newQty)}
                    />
                  )}

                  {/* Inline Variant Submenu */}
                  <AnimatePresence>
                    {item.hasVariants && isExpanded && item.variants && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                          {item.variants.map((variant) => {
                            const vQty = getQuantity(variant.id);
                            return (
                              <div
                                key={variant.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">{variant.name}</p>
                                  <p className="text-[#E85D2B] font-semibold text-sm">{formatNaira(variant.price)} · Min {variant.minQty ?? item.minQty}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  {vQty > 0 ? (
                                    <>
                                      <button
                                        onClick={() => handleVariantQtyChange(variant.id, vQty - 1, item, variant)}
                                        className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-sm font-bold text-gray-900 w-6 text-center">{vQty}</span>
                                    </>
                                  ) : null}
                                  <button
                                    onClick={() => handleVariantQtyChange(variant.id, vQty + 1, item, variant)}
                                    className="w-8 h-8 rounded-full bg-[#E85D2B] text-white flex items-center justify-center hover:bg-[#D14E1E] transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isBelowMin && (
                    <div className="mt-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Minimum {item.minQty} units required
                    </div>
                  )}

                  {!item.hasVariants && qty > 0 && !isBelowMin && (
                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      Subtotal: {formatNaira(item.price * qty)}
                    </p>
                  )}

                  {item.hasVariants && qty > 0 && (
                    <p className="mt-3 text-sm font-semibold text-[#E85D2B]">
                      {qty} in cart
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40"
        >
          <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{itemCount} item{itemCount > 1 ? 's' : ''} selected</p>
              <p className="text-lg font-bold text-gray-900">Subtotal: {formatNaira(subtotal)}</p>
            </div>
            <Link
              to="/cart"
              className="flex items-center gap-2 px-6 py-3 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Review Cart <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
