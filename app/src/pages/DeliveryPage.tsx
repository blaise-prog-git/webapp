import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Store, ArrowRight, ArrowLeft, MapPin, Clock, LocateFixed, Loader2 } from 'lucide-react';
import { WizardLayout } from '@/components/WizardLayout';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api, formatNaira } from '@/lib/api';
import type { PublicConfig } from '@/types';
import { Link } from 'react-router-dom';

export function DeliveryPage() {
  const { quote, itemCount, fulfillment, setFulfillment, customer, setCustomer } = useCart();
  const { addToast } = useToast();
  const geo = useGeolocation();
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {
      setConfig({
        menu: [],
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
          headline: '',
          intro: '',
          phone: '',
          whatsapp: '',
          instagram: '',
          tiktok: '',
          email: '',
          address: 'Lagos, Nigeria',
          serviceFeePercent: 1.5,
          deliveryBaseFee: 1000,
          deliveryPerKm: 220,
          longDistanceSurcharge: 1500,
          longDistanceKm: 15,
        },
        currency: 'NGN',
        paystackPublicKeyConfigured: false,
      });
    });
  }, []);

  // Apply geolocation address
  const applyGeoAddress = () => {
    if (geo.address) {
      setFulfillment({ ...fulfillment, address: geo.address });
      addToast('success', 'Location address applied');
    }
  };

  const isFormValid = () => {
    if (!customer.name || !customer.email || !customer.phone) return false;
    if (fulfillment.type === 'delivery' && !fulfillment.address) return false;
    return true;
  };

  return (
    <WizardLayout step={3} title="Delivery or Pickup?" showBack backTo="/cart" backLabel="Cart">
      {/* Method Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { type: 'delivery' as const, icon: Truck, label: 'Delivery', desc: 'We deliver to your location' },
          { type: 'pickup' as const, icon: Store, label: 'Pickup at Store', desc: 'Collect from our kitchen' },
        ].map(({ type, icon: Icon, label, desc }) => (
          <button
            key={type}
            onClick={() => setFulfillment({ ...fulfillment, type })}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              fulfillment.type === type ? 'border-[#E85D2B] bg-[#FFF0EB]' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              fulfillment.type === type ? 'border-[#E85D2B]' : 'border-gray-300'
            }`}>
              {fulfillment.type === type && <div className="w-3 h-3 rounded-full bg-[#E85D2B]" />}
            </div>
            <Icon className={`w-8 h-8 mb-3 ${fulfillment.type === type ? 'text-[#E85D2B]' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </button>
        ))}
      </div>

      {/* Form */}
      <motion.div
        key={fulfillment.type}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-gray-100 p-6 mb-8"
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="Your full name"
              className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] focus:ring-[3px] focus:ring-[#E85D2B]/15 outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] focus:ring-[3px] focus:ring-[#E85D2B]/15 outline-none transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] focus:ring-[3px] focus:ring-[#E85D2B]/15 outline-none transition-all"
            />
          </div>

          {fulfillment.type === 'delivery' ? (
            <>
              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Zone *</label>
                <select
                  value={fulfillment.zone}
                  onChange={(e) => {
                    const zone = config?.deliveryZones.find((z) => z.id === e.target.value);
                    setFulfillment({
                      ...fulfillment,
                      zone: e.target.value,
                      distanceKm: zone?.km ?? 5,
                    });
                  }}
                  className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] outline-none transition-all appearance-none"
                >
                  {config?.deliveryZones
                    .filter((z) => z.id !== 'pickup')
                    .map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} (~{zone.minutes} mins)
                      </option>
                    ))}
                </select>
              </div>

              {/* Custom Distance */}
              {fulfillment.zone === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Distance (km)</label>
                  <input
                    type="number"
                    value={fulfillment.distanceKm}
                    onChange={(e) =>
                      setFulfillment({
                        ...fulfillment,
                        distanceKm: Math.max(1, Math.min(80, Number(e.target.value))),
                      })
                    }
                    min={1}
                    max={80}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] outline-none transition-all"
                  />
                </div>
              )}

              {/* Address with Geolocation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Delivery Address *</label>
                  <button
                    onClick={geo.getLocation}
                    disabled={geo.loading}
                    className="flex items-center gap-1.5 text-xs text-[#E85D2B] hover:text-[#D14E1E] font-medium transition-colors disabled:opacity-50"
                  >
                    {geo.loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3 h-3" />
                    )}
                    {geo.loading ? 'Locating...' : 'Use My Location'}
                  </button>
                </div>

                {geo.error && <p className="text-xs text-red-500 mb-2">{geo.error}</p>}

                {geo.address && !fulfillment.address && (
                  <motion.button
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={applyGeoAddress}
                    className="w-full mb-2 px-4 py-2.5 bg-[#FFF0EB] border border-[#E85D2B]/20 rounded-lg text-sm text-[#E85D2B] hover:bg-[#E85D2B]/10 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{geo.address}</span>
                    <span className="ml-auto text-xs font-semibold shrink-0">Tap to use</span>
                  </motion.button>
                )}

                <textarea
                  value={fulfillment.address}
                  onChange={(e) => setFulfillment({ ...fulfillment, address: e.target.value })}
                  placeholder="Enter your full delivery address..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] focus:ring-[3px] focus:ring-[#E85D2B]/15 outline-none transition-all resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Time</label>
                <select
                  value={fulfillment.pickupTime}
                  onChange={(e) => setFulfillment({ ...fulfillment, pickupTime: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] outline-none transition-all appearance-none"
                >
                  <option value="">Select a time</option>
                  {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="bg-[#F5F5F3] rounded-lg p-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E85D2B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Pickup Location</p>
                  <p className="text-gray-500 text-sm">{config?.businessInfo.address || 'Lagos, Nigeria'}</p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Notes (optional)</label>
            <textarea
              value={customer.note}
              onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
              placeholder="Any special instructions?"
              rows={2}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:border-[#E85D2B] outline-none transition-all resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Order Summary — now reads from shared useCart.quote */}
      {quote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F5F5F3] rounded-xl p-6 mb-8"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Preparation
              </span>
              <span className="font-medium">~{quote.prepMinutes} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Delivery
              </span>
              <span className="font-medium">~{quote.deliveryMinutes} mins</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({itemCount} items)</span>
              <span className="font-medium">{formatNaira(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery fee</span>
              <span className="font-medium">
                {fulfillment.type === 'pickup' ? 'Free' : formatNaira(quote.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service fee (1.5%)</span>
              <span className="font-medium">{formatNaira(quote.serviceFee)}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#E85D2B]">{formatNaira(quote.total)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">Total estimated time</span>
              <span className="font-bold text-[#E85D2B]">~{quote.estimatedMinutes} mins</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/cart"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-[#E85D2B] hover:text-[#E85D2B] transition-all text-center"
        >
          <ArrowLeft className="w-4 h-4" /> Cart
        </Link>
        <Link
          to="/payment"
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-full transition-all text-center ${
            !isFormValid()
              ? 'bg-gray-200 text-gray-400 pointer-events-none'
              : 'bg-[#E85D2B] text-white hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-lg'
          }`}
          onClick={(e) => {
            if (!isFormValid()) {
              e.preventDefault();
              addToast('error', 'Please fill in all required fields');
            }
          }}
        >
          Payment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </WizardLayout>
  );
}
