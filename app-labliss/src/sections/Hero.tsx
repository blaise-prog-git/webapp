import { ArrowRight, Leaf, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="min-h-screen pt-[72px] flex items-center relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 85% 100%, rgba(232,93,43,0.06) 0%, transparent 60%)' }}>
      <div className="max-w-[1400px] mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Column */}
          <div className="order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-6"
            >
              Bulk Orders &bull; Lagos, Nigeria
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] mb-6"
            >
              Fresh Treats for{' '}
              <span className="text-[#E85D2B]">Every Occasion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg"
            >
              From meatpies to shawarma, fruit parfait to custom dessert boxes — we prepare everything fresh and deliver to your door. Minimum orders apply.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(232,93,43,0.3)] transition-all active:scale-[0.97]"
              >
                Order Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-[#E85D2B] hover:text-[#E85D2B] hover:bg-[#FFF0EB] transition-all"
              >
                View Menu
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Leaf, label: 'Fresh Daily' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: ShieldCheck, label: 'Secure Payment' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-gray-500">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative">
              {/* Decorative blurred circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#E85D2B]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#E85D2B]/8 rounded-full blur-3xl" />
              
              <img
                src="/hero.jpg"
                alt="Freshly prepared treats from Labliss Cakes & Sweeties"
                className="relative rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] w-full object-cover aspect-[4/3]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
