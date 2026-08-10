import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, LayoutDashboard, Utensils, MapPin, Building2, ClipboardList,
  CreditCard, LogOut, ChevronLeft, Plus, Trash2, Pencil, Check, X,
  Loader2, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { api, formatNaira, itemImages } from '@/lib/api';
import type { MenuItem, DeliveryZone, BusinessInfo, Order } from '@/types';

type AdminView = 'dashboard' | 'menu' | 'zones' | 'business' | 'orders' | 'paystack';

const navItems: { id: AdminView; label: string; icon: typeof Settings }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu Items', icon: Utensils },
  { id: 'zones', label: 'Delivery Zones', icon: MapPin },
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'paystack', label: 'Paystack Status', icon: CreditCard },
];

export function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState<AdminView>('dashboard');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paystackStatus, setPaystackStatus] = useState<{ publicKeyConfigured: boolean; secretKeyConfigured: boolean; mode: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const storedPin = useRef('');

  // Fetch all config
  const fetchConfig = useCallback(async () => {
    if (!storedPin.current) return;
    try {
      const config = await api.getAdminConfig(storedPin.current);
      setMenu(config.menu);
      setZones(config.deliveryZones);
      setBusiness(config.businessInfo);
      setOrders(config.orders);
      const ps = await api.getPaystackStatus(storedPin.current);
      setPaystackStatus(ps);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load config');
    }
  }, [addToast]);

  useEffect(() => {
    if (authenticated) {
      fetchConfig();
    }
  }, [authenticated, fetchConfig]);

  const handleLogin = async () => {
    if (!pin.trim()) return;
    setLoading(true);
    try {
      await api.getAdminConfig(pin.trim());
      storedPin.current = pin.trim();
      setAuthenticated(true);
      addToast('success', 'Admin access granted');
    } catch (err: any) {
      addToast('error', err.message || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  const saveBusiness = async () => {
    if (!business) return;
    setSaving(true);
    try {
      await api.updateBusinessInfo(storedPin.current, business);
      addToast('success', 'Business info saved');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveMenu = async (newMenu: MenuItem[]) => {
    setSaving(true);
    try {
      const result = await api.updateMenu(storedPin.current, newMenu);
      setMenu(result.menu);
      addToast('success', 'Menu updated');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update menu');
    } finally {
      setSaving(false);
    }
  };

  const saveZones = async (newZones: DeliveryZone[]) => {
    setSaving(true);
    try {
      const result = await api.updateDeliveryZones(storedPin.current, newZones);
      setZones(result.deliveryZones);
      addToast('success', 'Zones updated');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update zones');
    } finally {
      setSaving(false);
    }
  };

  // Login
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[400px] bg-[#1E293B] border border-white/10 rounded-2xl p-10"
        >
          <div className="text-center mb-8">
            <Settings className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60 text-sm">Enter admin PIN to continue</p>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin PIN"
            className="w-full h-12 px-4 bg-[#0F172A] border border-white/20 rounded-lg text-white text-center text-lg tracking-widest focus:border-[#E85D2B] focus:ring-2 focus:ring-[#E85D2B]/20 outline-none transition-all mb-4"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !pin.trim()}
            className="w-full h-12 bg-[#E85D2B] text-white font-semibold rounded-lg hover:bg-[#D14E1E] transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
          <a href="/" className="block text-center mt-4 text-white/40 hover:text-white text-sm transition-colors">
            Back to site
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#1E293B] border-r border-white/8 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <span className="text-lg font-bold text-[#E85D2B]">Labliss Admin</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                view === item.id
                  ? 'bg-[#E85D2B]/15 text-[#E85D2B]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/8 space-y-2">
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </a>
          <button
            onClick={() => { setAuthenticated(false); storedPin.current = ''; setPin(''); }}
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm transition-colors w-full"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-[#1E293B] border-b border-white/8 flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-3 text-white font-semibold">Admin</span>
        </header>

        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* DASHBOARD */}
            {view === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Orders', value: orders.length, icon: ClipboardList, color: 'bg-blue-500/20 text-blue-400' },
                    { label: 'Revenue', value: formatNaira(orders.reduce((s, o) => s + (o.receipt?.total || o.quote?.total || 0), 0)), icon: CreditCard, color: 'bg-green-500/20 text-green-400' },
                    { label: 'Active Items', value: menu.filter((m) => m.available).length, icon: Utensils, color: 'bg-purple-500/20 text-purple-400' },
                    { label: 'Pending', value: orders.filter((o) => o.status === 'pending_payment' || o.status === 'confirmed').length, icon: Loader2, color: 'bg-amber-500/20 text-amber-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#1E293B] border border-white/8 rounded-xl p-6">
                      <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-white/50 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-[#1E293B] border border-white/8 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5">
                    <h3 className="text-white font-semibold">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 text-left">
                          <th className="px-6 py-3 font-medium">Order ID</th>
                          <th className="px-6 py-3 font-medium">Customer</th>
                          <th className="px-6 py-3 font-medium">Items</th>
                          <th className="px-6 py-3 font-medium">Total</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-3 text-white/60 font-mono text-xs">{order.id.slice(0, 10)}...</td>
                            <td className="px-6 py-3 text-white">{order.customer.name}</td>
                            <td className="px-6 py-3 text-white/60">{order.quote.items.length}</td>
                            <td className="px-6 py-3 text-white font-medium">{formatNaira(order.quote.total)}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered' ? 'bg-green-500/15 text-green-400' :
                                order.status === 'preparing' ? 'bg-purple-500/15 text-purple-400' :
                                order.status === 'ready' ? 'bg-cyan-500/15 text-cyan-400' :
                                'bg-amber-500/15 text-amber-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MENU */}
            {view === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Menu Items</h2>
                  <button
                    onClick={() => {
                      const newItem: MenuItem = {
                        id: `item_${Date.now()}`,
                        name: 'New Item',
                        category: 'Pastries',
                        price: 1000,
                        minQty: 1,
                        available: true,
                        prepMinutes: 30,
                      };
                      saveMenu([...menu, newItem]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E85D2B] text-white rounded-lg text-sm font-medium hover:bg-[#D14E1E] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>

                <div className="bg-[#1E293B] border border-white/8 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 text-left">
                          <th className="px-4 py-3 font-medium">Image</th>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Min Qty</th>
                          <th className="px-4 py-3 font-medium">Prep</th>
                          <th className="px-4 py-3 font-medium">Image URL</th>
                          <th className="px-4 py-3 font-medium">Available</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {menu.map((item) => (
                          <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-4 py-3">
                              <img src={itemImages[item.id] || '/hero.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            </td>
                            <td className="px-4 py-3 text-white">
                              <EditableText
                                value={item.name}
                                onSave={(v) => saveMenu(menu.map((m) => m.id === item.id ? { ...m, name: v } : m))}
                              />
                            </td>
                            <td className="px-4 py-3 text-white/60">
                              <select
                                value={item.category}
                                onChange={(e) => saveMenu(menu.map((m) => m.id === item.id ? { ...m, category: e.target.value } : m))}
                                className="bg-transparent text-white/60 text-sm focus:outline-none cursor-pointer"
                              >
                                {['Pastries', 'Meals', 'Treats', 'Drinks'].map((c) => (
                                  <option key={c} value={c} className="bg-[#1E293B]">{c}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-white">
                              <EditableNumber
                                value={item.price}
                                onSave={(v) => saveMenu(menu.map((m) => m.id === item.id ? { ...m, price: v } : m))}
                                prefix="N"
                              />
                            </td>
                            <td className="px-4 py-3 text-white/60">
                              <EditableNumber
                                value={item.minQty}
                                onSave={(v) => saveMenu(menu.map((m) => m.id === item.id ? { ...m, minQty: v } : m))}
                              />
                            </td>
                            <td className="px-4 py-3 text-white/60">{item.prepMinutes}m</td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={itemImages[item.id] || ''}
                                placeholder="Image filename (e.g., shawarma.jpg)"
                                onChange={() => {
                                  // Image mapping is client-side. Add image field to MenuItem type to persist.
                                }}
                                className="w-32 h-8 px-2 bg-[#0F172A] border border-white/15 rounded text-white/60 text-xs focus:border-[#E85D2B] outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => saveMenu(menu.map((m) => m.id === item.id ? { ...m, available: !m.available } : m))}
                                className={`w-10 h-5 rounded-full transition-colors relative ${
                                  item.available ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                  item.available ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  if (confirm('Delete this item?')) {
                                    saveMenu(menu.filter((m) => m.id !== item.id));
                                  }
                                }}
                                className="text-white/30 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ZONES */}
            {view === 'zones' && (
              <motion.div key="zones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Delivery Zones</h2>
                <div className="space-y-3 mb-8">
                  {zones.map((zone, i) => (
                    <div key={zone.id} className="bg-[#1E293B] border border-white/8 rounded-xl p-5 flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-white/40 mb-1 block">Zone Name</label>
                          <input
                            type="text"
                            value={zone.name}
                            onChange={(e) => {
                              const newZones = [...zones];
                              newZones[i] = { ...zone, name: e.target.value };
                              setZones(newZones);
                            }}
                            onBlur={() => saveZones(zones)}
                            className="w-full h-9 px-3 bg-[#0F172A] border border-white/15 rounded-lg text-white text-sm focus:border-[#E85D2B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 mb-1 block">Distance (km)</label>
                          <input
                            type="number"
                            value={zone.km}
                            onChange={(e) => {
                              const newZones = [...zones];
                              newZones[i] = { ...zone, km: Number(e.target.value) };
                              setZones(newZones);
                            }}
                            onBlur={() => saveZones(zones)}
                            className="w-full h-9 px-3 bg-[#0F172A] border border-white/15 rounded-lg text-white text-sm focus:border-[#E85D2B] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 mb-1 block">Time (mins)</label>
                          <input
                            type="number"
                            value={zone.minutes}
                            onChange={(e) => {
                              const newZones = [...zones];
                              newZones[i] = { ...zone, minutes: Number(e.target.value) };
                              setZones(newZones);
                            }}
                            onBlur={() => saveZones(zones)}
                            className="w-full h-9 px-3 bg-[#0F172A] border border-white/15 rounded-lg text-white text-sm focus:border-[#E85D2B] outline-none"
                          />
                        </div>
                      </div>
                      {zone.id !== 'pickup' && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this zone?')) saveZones(zones.filter((_, idx) => idx !== i));
                          }}
                          className="text-white/30 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const newZone: DeliveryZone = {
                      id: `zone_${Date.now()}`,
                      name: 'New Zone',
                      km: 5,
                      minutes: 20,
                    };
                    saveZones([...zones, newZone]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E85D2B] text-white rounded-lg text-sm font-medium hover:bg-[#D14E1E] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Zone
                </button>
              </motion.div>
            )}

            {/* BUSINESS INFO */}
            {view === 'business' && business && (
              <motion.div key="business" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Business Info</h2>
                <div className="bg-[#1E293B] border border-white/8 rounded-xl p-6 space-y-4 max-w-2xl">
                  {[
                    { label: 'Business Name', key: 'businessName' as keyof BusinessInfo },
                    { label: 'Domain', key: 'domain' as keyof BusinessInfo },
                    { label: 'Headline', key: 'headline' as keyof BusinessInfo },
                    { label: 'Phone', key: 'phone' as keyof BusinessInfo },
                    { label: 'WhatsApp', key: 'whatsapp' as keyof BusinessInfo },
                    { label: 'Instagram (@handle)', key: 'instagram' as keyof BusinessInfo },
                    { label: 'TikTok (@handle)', key: 'tiktok' as keyof BusinessInfo },
                    { label: 'Email', key: 'email' as keyof BusinessInfo },
                    { label: 'Address', key: 'address' as keyof BusinessInfo },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs text-white/40 mb-1 block">{field.label}</label>
                      <input
                        type="text"
                        value={business[field.key] as string}
                        onChange={(e) => setBusiness({ ...business, [field.key]: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0F172A] border border-white/15 rounded-lg text-white focus:border-[#E85D2B] outline-none transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Intro</label>
                    <textarea
                      value={business.intro}
                      onChange={(e) => setBusiness({ ...business, intro: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-white/15 rounded-lg text-white focus:border-[#E85D2B] outline-none transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Service Fee (%)</label>
                    <input
                      type="number"
                      value={business.serviceFeePercent}
                      onChange={(e) => setBusiness({ ...business, serviceFeePercent: Number(e.target.value) })}
                      min={0}
                      max={20}
                      step={0.1}
                      className="w-full h-11 px-4 bg-[#0F172A] border border-white/15 rounded-lg text-white focus:border-[#E85D2B] outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={saveBusiness}
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#E85D2B] text-white font-medium rounded-lg hover:bg-[#D14E1E] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ORDERS */}
            {view === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-white mb-6">All Orders</h2>
                <div className="bg-[#1E293B] border border-white/8 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/40 text-left">
                          <th className="px-6 py-3 font-medium">Order ID</th>
                          <th className="px-6 py-3 font-medium">Customer</th>
                          <th className="px-6 py-3 font-medium">Total</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium">Payment</th>
                          <th className="px-6 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-3 text-white/60 font-mono text-xs">{order.id.slice(0, 12)}...</td>
                            <td className="px-6 py-3 text-white">{order.customer.name}</td>
                            <td className="px-6 py-3 text-white font-medium">{formatNaira(order.quote.total)}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered' ? 'bg-green-500/15 text-green-400' :
                                order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                                'bg-amber-500/15 text-amber-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`text-xs ${
                                order.paymentStatus === 'paid' ? 'text-green-400' :
                                order.paymentStatus === 'demo' ? 'text-blue-400' :
                                'text-amber-400'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-white/40">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PAYSTACK STATUS */}
            {view === 'paystack' && paystackStatus && (
              <motion.div key="paystack" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-white mb-6">Paystack Status</h2>
                <div className="bg-[#1E293B] border border-white/8 rounded-xl p-6 max-w-lg space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-white/60">Public Key</span>
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${
                      paystackStatus.publicKeyConfigured ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {paystackStatus.publicKeyConfigured ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {paystackStatus.publicKeyConfigured ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-white/60">Secret Key</span>
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${
                      paystackStatus.secretKeyConfigured ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {paystackStatus.secretKeyConfigured ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      {paystackStatus.secretKeyConfigured ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-white/60">Mode</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      paystackStatus.mode === 'paystack' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      {paystackStatus.mode === 'paystack' ? 'Live Payments' : 'Demo Mode'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Inline editable text component
function EditableText({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => { onSave(val); setEditing(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onSave(val); setEditing(false); }
            if (e.key === 'Escape') { setVal(value); setEditing(false); }
          }}
          autoFocus
          className="w-full h-8 px-2 bg-[#0F172A] border border-[#E85D2B]/50 rounded text-white text-sm focus:outline-none"
        />
        <button onClick={() => { onSave(val); setEditing(false); }} className="text-green-400">
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 group">
      <span>{value}</span>
      <Pencil className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
    </button>
  );
}

// Inline editable number component
function EditableNumber({ value, onSave, prefix = '' }: { value: number; onSave: (v: number) => void; prefix?: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => { onSave(Number(val)); setEditing(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onSave(Number(val)); setEditing(false); }
          }}
          autoFocus
          className="w-20 h-8 px-2 bg-[#0F172A] border border-[#E85D2B]/50 rounded text-white text-sm focus:outline-none"
        />
        <button onClick={() => { onSave(Number(val)); setEditing(false); }} className="text-green-400">
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 group">
      <span>{prefix}{value.toLocaleString()}</span>
      <Pencil className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
    </button>
  );
}


