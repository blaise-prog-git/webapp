import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, AlertTriangle } from 'lucide-react';
import { WizardLayout } from '@/components/WizardLayout';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useCart } from '@/hooks/useCart';
import { formatNaira } from '@/lib/api';
import { Link } from 'react-router-dom';

export function CartPage() {
  const { items, quote, updateQuantity, removeItem, isBelowMinimum } = useCart();

  if (items.length === 0) {
    return (
      <WizardLayout
        step={2}
        title="Your Cart"
        subtitle="Review your selections"
        showBack
        backTo="/menu"
        backLabel="Back to Menu"
      >
        <div className="text-center py-20">
          <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-400 mb-6">Browse our menu to add items.</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] transition-all"
          >
            Go to Menu
          </Link>
        </div>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      step={2}
      title="Review Your Order"
      subtitle="Adjust quantities or remove items before proceeding."
      showBack
      backTo="/menu"
      backLabel="Menu"
    >
      {/* Cart Items */}
      <div className="flex flex-col gap-3 mb-8">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center hover:bg-gray-50/50 transition-colors"
            >
              <img
                src={item.image || '/hero.jpg'}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {formatNaira(item.unitPrice)} each
                </p>
                {item.belowMinimum && (
                  <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Min {item.minQty}{' '}
                    units
                  </p>
                )}
                <div className="mt-2">
                  <QuantitySelector
                    quantity={item.quantity}
                    onChange={(qty) => updateQuantity(item.id, qty)}
                    compact
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-bold text-gray-900">
                  {formatNaira(item.lineTotal)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Order Summary — uses shared quote from useCart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#F5F5F3] rounded-xl p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal ({items.length} items)</span>
            <span className="font-medium text-gray-900">
              {formatNaira(quote?.subtotal ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery fee</span>
            <span className="text-gray-400 italic">Calculated at delivery step</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service fee (1.5%)</span>
            <span className="text-gray-400 italic">Calculated at delivery step</span>
          </div>
        </div>
        <div className="border-t border-gray-200 my-3" />
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">Items Total</span>
          <span className="text-xl font-bold text-[#E85D2B]">
            {formatNaira(quote?.subtotal ?? 0)}
          </span>
        </div>
      </motion.div>

      {isBelowMinimum && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Some items are below minimum quantity. Please adjust before
            continuing.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/menu"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-[#E85D2B] hover:text-[#E85D2B] transition-all text-center"
        >
          <ArrowLeft className="w-4 h-4" /> Menu
        </Link>
        <Link
          to="/delivery"
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-full transition-all text-center ${
            isBelowMinimum
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
              : 'bg-[#E85D2B] text-white hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-lg'
          }`}
        >
          Delivery <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </WizardLayout>
  );
}
