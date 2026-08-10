import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ShoppingBag, Home, Clock, Truck, MapPin, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { api, formatNaira } from '@/lib/api';
import type { Order } from '@/types';

export function Receipt() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('ref') || searchParams.get('reference');
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const result = await api.verifyPayment(reference);
        if (result.verified) {
          setOrder(result.order);
        } else {
          addToast('error', 'Payment verification failed');
        }
      } catch (err: any) {
        addToast('error', err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [reference, addToast]);

  const handleDownload = () => {
    if (!order?.receipt) return;
    const receipt = order.receipt;
    const content = `
Labliss Cakes & Sweeties
${receipt.business}
Receipt: ${receipt.receiptNo}
Date: ${new Date(receipt.issuedAt).toLocaleString()}

Customer: ${receipt.customer.name}
Phone: ${receipt.customer.phone}
Email: ${receipt.customer.email}

Items:
${receipt.items.map(i => `${i.quantity}x ${i.name} ..... ${formatNaira(i.lineTotal)}`).join('\n')}

Total: ${formatNaira(receipt.total)}
Payment Ref: ${receipt.paymentReference}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receiptNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Receipt downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#E85D2B]/30 border-t-[#E85D2B] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verifying your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <a href="/" className="text-[#E85D2B] hover:underline">Back to Home</a>
        </div>
      </div>
    );
  }

  const receipt = order.receipt;

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-20 px-6">
      <div className="max-w-[600px] mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">
            Your order has been received and is being prepared.
          </p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* Receipt Header */}
          <div className="p-8 text-center border-b border-gray-100">
            <h2 className="font-bold text-xl text-gray-900 mb-1">Labliss Cakes & Sweeties</h2>
            <p className="text-xs text-gray-400 font-mono">{receipt?.receiptNo || order.reference}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(receipt?.issuedAt || order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Items */}
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(receipt?.items || order.quote.items).map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-700"
                  >
                    <td className="py-3 font-medium">{item.quantity}x</td>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3 text-right font-medium">{formatNaira(item.lineTotal)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Fees */}
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatNaira(order.quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{formatNaira(order.quote.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Service fee</span>
                <span>{formatNaira(order.quote.serviceFee)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg">TOTAL</span>
              <span className="text-2xl font-bold text-[#E85D2B]">{formatNaira(order.quote.total)}</span>
            </div>

            {/* Delivery Info */}
            <div className="border-t border-gray-100 mt-6 pt-6 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                {order.fulfillment.type === 'delivery' ? <Truck className="w-4 h-4 text-gray-400 mt-0.5" /> : <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />}
                <div>
                  <p className="font-medium text-gray-700 capitalize">{order.fulfillment.type}</p>
                  {order.fulfillment.type === 'delivery' ? (
                    <p className="text-gray-500">{order.fulfillment.address}</p>
                  ) : (
                    <p className="text-gray-500">Pickup at store</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Estimated: ~{order.quote.estimatedMinutes} mins</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Ref: {order.reference}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col gap-3"
        >
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-[#E85D2B] hover:text-[#E85D2B] hover:bg-[#FFF0EB] transition-all"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> Place New Order
          </a>
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
          >
            <Home className="w-4 h-4" /> Back to Home
          </a>
        </motion.div>
      </div>
    </div>
  );
}
