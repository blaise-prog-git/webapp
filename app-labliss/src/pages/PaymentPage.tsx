import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Shield, KeyRound, Loader2, Info } from 'lucide-react';
import { WizardLayout } from '@/components/WizardLayout';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { api, formatNaira } from '@/lib/api';
import { Link } from 'react-router-dom';

export function PaymentPage() {
  const { items, quote, fulfillment, customer } = useCart();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await api.initializePayment({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        fulfillment,
        customer,
      });
      if (result.mode === 'demo') {
        addToast('info', 'Demo mode: Order confirmed');
        if (result.order?.reference) {
          window.location.href = `/#/receipt?ref=${encodeURIComponent(result.order.reference)}`;
          return;
        }
      }
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return;
      }
      addToast('error', 'Payment initialization failed');
    } catch (err: any) {
      addToast('error', err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Show error if cart is empty
  if (items.length === 0) {
    return (
      <WizardLayout step={4} title="Complete Your Order" showBack backTo="/menu" backLabel="Menu">
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link to="/menu" className="text-[#E85D2B] hover:underline font-medium">
            Browse the menu
          </Link>
        </div>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      step={4}
      title="Complete Your Order"
      subtitle="Review everything before paying."
      showBack
      backTo="/delivery"
      backLabel="Delivery"
    >
      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

        {/* Items list */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium text-gray-900">{formatNaira(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 my-3" />

        {/* Fee breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatNaira(quote?.subtotal ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery fee</span>
            <span className="font-medium text-gray-900">
              {fulfillment.type === 'pickup'
                ? 'Free'
                : formatNaira(quote?.deliveryFee ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service fee (1.5%)</span>
            <span className="font-medium text-gray-900">
              {formatNaira(quote?.serviceFee ?? 0)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 my-3" />

        {/* Grand Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900 text-lg">Total Amount</span>
          <span className="text-2xl font-bold text-[#E85D2B]">
            {formatNaira(quote?.total ?? 0)}
          </span>
        </div>

        {/* Estimated time */}
        {quote && (
          <p className="text-sm text-gray-400 mt-2 text-right">
            Estimated delivery: ~{quote.estimatedMinutes} mins
          </p>
        )}
      </motion.div>

      {/* Customer Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#F5F5F3] rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {fulfillment.type === 'pickup' ? 'Pickup for' : 'Delivering to'}
          </h3>
          <Link to="/delivery" className="text-sm text-[#E85D2B] hover:underline">
            Edit
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-900">{customer.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{customer.email}</span>
          </div>
          {fulfillment.type === 'delivery' ? (
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-gray-900 text-right max-w-[200px]">
                {fulfillment.address}
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup time</span>
              <span className="font-medium text-gray-900">
                {fulfillment.pickupTime || 'Not specified'}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Paystack notice */}
      <div className="bg-[#FFF0EB] border border-[#E85D2B]/30 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#E85D2B] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#E85D2B]">
          You will pay <strong>{formatNaira(quote?.total ?? 0)}</strong> securely via Paystack.
          Your payment is protected with SSL encryption.
        </p>
      </div>

      {/* Pay Button */}
      <motion.button
        onClick={handlePayment}
        disabled={loading || !quote}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-14 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {formatNaira(quote?.total ?? 0)} with Paystack
          </>
        )}
      </motion.button>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {[
          { icon: Lock, label: 'SSL Secure' },
          { icon: Shield, label: 'Paystack Protected' },
          { icon: KeyRound, label: 'Encrypted' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-gray-400">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </WizardLayout>
  );
}
