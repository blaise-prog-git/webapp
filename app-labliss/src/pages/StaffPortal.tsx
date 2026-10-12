import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, LogOut, RefreshCw, Clock, Phone, User, Package, CheckCircle, ChefHat, Truck as TruckIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { api, formatNaira } from '@/lib/api';
import type { Order } from '@/types';

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending_payment: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500' },
  confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500' },
  preparing: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500' },
  ready: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500' },
  delivered: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500' },
};

const statusLabels: Record<string, string> = {
  pending_payment: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function StaffPortal() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteOrderId, setNoteOrderId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const { addToast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const storedPin = useRef('');

  const fetchOrders = useCallback(async () => {
    if (!storedPin.current) return;
    try {
      const result = await api.getStaffOrders(storedPin.current);
      setOrders(result.orders);
    } catch {
      // Silent on poll
    }
  }, []);

  const handleLogin = async () => {
    if (!pin.trim()) return;
    setLoading(true);
    try {
      await api.getStaffOrders(pin.trim());
      storedPin.current = pin.trim();
      setAuthenticated(true);
      addToast('success', 'Access granted');
    } catch (err: any) {
      addToast('error', err.message || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(storedPin.current, orderId, { status });
      await fetchOrders();
      addToast('success', `Order marked as ${statusLabels[status] || status}`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update');
    }
  };

  const addNote = async (orderId: string) => {
    try {
      await api.updateOrderStatus(storedPin.current, orderId, { staffNote: noteText });
      setNoteOrderId(null);
      setNoteText('');
      await fetchOrders();
      addToast('success', 'Note added');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to add note');
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchOrders();
      intervalRef.current = setInterval(fetchOrders, 10000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [authenticated, fetchOrders]);

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[400px] bg-[#27354D] border border-white/10 rounded-2xl p-10"
        >
          <div className="text-center mb-8">
            <ClipboardList className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Staff Portal</h1>
            <p className="text-white/60 text-sm">Enter your PIN to access orders</p>
          </div>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter PIN"
            maxLength={20}
            className="w-full h-12 px-4 bg-[#1E293B] border border-white/20 rounded-lg text-white text-center text-lg tracking-widest focus:border-[#E85D2B] focus:ring-2 focus:ring-[#E85D2B]/20 outline-none transition-all mb-4"
          />

          <button
            onClick={handleLogin}
            disabled={loading || !pin.trim()}
            className="w-full h-12 bg-[#E85D2B] text-white font-semibold rounded-lg hover:bg-[#D14E1E] transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Orders'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Stats
  const newOrders = orders.filter((o) => o.status === 'pending_payment' || o.status === 'confirmed').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const completedToday = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-[#1E293B]">
      {/* Header */}
      <header className="h-16 bg-[#27354D] border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-white/60" />
          <span className="text-white font-semibold">Staff Portal</span>
          <span className="text-white/40">/</span>
          <span className="text-white/60 text-sm">Orders</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-white/60 text-xs">Online</span>
          </div>
          <button
            onClick={() => { setAuthenticated(false); storedPin.current = ''; setPin(''); }}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-4 max-w-3xl">
          {[
            { label: 'New Orders', value: newOrders, color: 'text-amber-400' },
            { label: 'Preparing', value: preparing, color: 'text-purple-400' },
            { label: 'Completed Today', value: completedToday, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#27354D] rounded-xl p-5">
              <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {orders.map((order) => {
              const sColors = statusColors[order.status] || statusColors.confirmed;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#27354D] rounded-xl border-l-4 ${sColors.border} p-5`}
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/40 text-xs font-mono">{order.id.slice(0, 12)}...</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sColors.bg} ${sColors.text}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="flex items-center gap-1.5 text-white/70">
                      <User className="w-3.5 h-3.5" /> {order.customer.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/70">
                      <Phone className="w-3.5 h-3.5" /> {order.customer.phone}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex items-center gap-1.5 text-white/50 text-sm mb-3">
                    <Package className="w-3.5 h-3.5" />
                    {order.quote.items.length} item{order.quote.items.length > 1 ? 's' : ''} &bull; {formatNaira(order.quote.total)}
                  </div>

                  {/* Full Order Details */}
                  <div className="mt-4 rounded-lg bg-[#1E293B]/70 border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white text-sm font-semibold">Order contents</h3>
                      <span className={`text-xs font-medium ${order.paymentStatus === 'paid' || order.paymentStatus === 'demo' ? 'text-green-400' : 'text-amber-400'}`}>
                        Payment: {order.paymentStatus || 'unpaid'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(Array.isArray(order.quote?.items) ? order.quote.items : []).length > 0 ? (
                        order.quote.items.map((item, index) => {
                          const quantity = Number(item.quantity || 0);
                          const unitPrice = Number(item.unitPrice ?? 0);
                          const lineTotal = Number(item.lineTotal ?? unitPrice * quantity);
                          return (
                            <div key={`${item.id || item.name || 'item'}-${index}`} className="flex items-start justify-between gap-4 text-sm">
                              <div className="min-w-0">
                                <p className="text-white/90 font-medium">{item.name || 'Unnamed item'}</p>
                                <p className="text-white/40 text-xs">{quantity} × {formatNaira(unitPrice)}</p>
                              </div>
                              <span className="text-white/80 font-semibold whitespace-nowrap">{formatNaira(lineTotal)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-white/50 text-sm">Item details are unavailable for this order.</p>
                      )}
                    </div>
                    <div className="border-t border-white/10 mt-3 pt-3 space-y-1 text-xs">
                      <div className="flex justify-between text-white/50"><span>Subtotal</span><span>{formatNaira(order.quote.subtotal)}</span></div>
                      <div className="flex justify-between text-white/50"><span>Delivery</span><span>{formatNaira(order.quote.deliveryFee)}</span></div>
                      <div className="flex justify-between text-white/50"><span>Service</span><span>{formatNaira(order.quote.serviceFee)}</span></div>
                      <div className="flex justify-between text-white font-bold text-sm pt-1"><span>Total</span><span>{formatNaira(order.quote.total)}</span></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/50 space-y-1">
                      <p><span className="text-white/30">Fulfillment:</span> {order.fulfillment.type === 'delivery' ? `Delivery · ${order.fulfillment.address || 'Address not provided'}` : 'Pickup'}</p>
                      {order.customer.note && <p><span className="text-white/30">Customer note:</span> {order.customer.note}</p>}
                      <p><span className="text-white/30">Reference:</span> {order.reference}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors"
                      >
                        <ChefHat className="w-3.5 h-3.5" /> Mark Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateStatus(order.id, 'delivered')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                      >
                        <TruckIcon className="w-3.5 h-3.5" /> Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => { setNoteOrderId(order.id); setNoteText(order.staffNote || ''); }}
                      className="px-3 py-1.5 bg-white/5 text-white/60 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
                    >
                      {order.staffNote ? 'Edit Note' : 'Add Note'}
                    </button>
                  </div>

                  {/* Staff Note Display */}
                  {order.staffNote && (
                    <p className="mt-2 text-xs text-white/40 italic">Note: {order.staffNote}</p>
                  )}

                  {/* Note Input */}
                  <AnimatePresence>
                    {noteOrderId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note..."
                            className="flex-1 h-9 px-3 bg-[#1E293B] border border-white/10 rounded-lg text-white text-sm focus:border-[#E85D2B] outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => addNote(order.id)}
                            className="px-3 h-9 bg-[#E85D2B] text-white rounded-lg text-xs font-medium hover:bg-[#D14E1E] transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setNoteOrderId(null)}
                            className="px-3 h-9 bg-white/5 text-white/60 rounded-lg text-xs hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Time */}
                  <div className="mt-3 flex items-center gap-1.5 text-white/30 text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {orders.length === 0 && (
            <div className="text-center py-20 text-white/40">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
