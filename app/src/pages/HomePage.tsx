import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, ShieldCheck, Clock, MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react';

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ===== HERO ===== */}
      <section
        className="min-h-screen pt-[72px] flex items-center relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 85% 100%, rgba(232,93,43,0.06) 0%, transparent 60%)',
        }}
      >
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
                Bulk Orders &bull; Owerri, Nigeria
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] mb-6"
              >
                Fresh Treats for <span className="text-[#E85D2B]">Every Occasion</span>
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

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Our Bestsellers</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Fan favourites loved by customers across Owerri. Order in bulk for your next event.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Meatpie', price: '900', min: '10 units', img: '/meatpie.jpg' },
              { name: 'Shawarma', price: '2,800', min: '5 units', img: '/shawarma.jpg' },
              { name: 'Fruit Parfait', price: '1,800', min: '6 units', img: '/parfait.jpg' },
              { name: 'Sausage Roll', price: '700', min: '10 units', img: '/sausage.jpg' },
            ].map((item, i) => (
              <AnimatedSection key={item.name} delay={i * 0.1}>
                <div className="group bg-[#FAFAF8] rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">Min: {item.min}</p>
                    <p className="text-[#E85D2B] font-bold">&#8358;{item.price}<span className="text-sm text-gray-400 font-normal">/unit</span></p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.4}>
            <div className="text-center mt-10">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                See Full Menu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-[1000px] mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-500">Ordering fresh treats is simple and straightforward.</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Browse Menu', desc: 'Explore our selection of pastries, meals, treats and drinks.' },
              { num: '02', title: 'Build Your Order', desc: 'Select quantities. Minimums apply for bulk freshness.' },
              { num: '03', title: 'Choose Delivery', desc: 'Pick delivery or pickup. We deliver anywhere in Owerri.' },
              { num: '04', title: 'Pay & Enjoy', desc: 'Secure Paystack payment. Get your receipt and wait time.' },
            ].map((step, i) => (
              <AnimatedSection key={step.num} delay={i * 0.1}>
                <div className="text-center">
                  <span className="text-5xl font-extrabold text-[#E85D2B]/10">{step.num}</span>
                  <h3 className="font-semibold text-gray-900 mt-3 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="grid grid-cols-2 gap-4">
                <img src="/meatpie.jpg" alt="Meatpies" className="rounded-xl w-full aspect-square object-cover" loading="lazy" />
                <img src="/parfait.jpg" alt="Fruit Parfait" className="rounded-xl w-full aspect-square object-cover mt-8" loading="lazy" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <span className="text-xs font-semibold text-[#E85D2B] uppercase tracking-[0.15em]">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">From Our Kitchen to Your Heart</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Labliss Cakes and Sweeties is an Owerri-based catering service specialising in fresh, delicious treats for events, offices, and personal enjoyment. Every item is made with quality ingredients and prepared the same day.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Whether you need 10 meatpies or 100, a single shawarma platter or a full dessert spread — we scale to your needs and deliver across Owerri with reliable timing.
              </p>
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-3xl font-bold text-[#E85D2B]">8+</p>
                  <p className="text-sm text-gray-500">Menu Items</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#E85D2B]">24h</p>
                  <p className="text-sm text-gray-500">Fresh Daily</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#E85D2B]">Owerri</p>
                  <p className="text-sm text-gray-500">Wide Delivery</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }} />
        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Order?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Browse our menu, build your order, and get everything delivered fresh to your door.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E85D2B] text-white font-semibold rounded-full hover:bg-[#D14E1E] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(232,93,43,0.4)] transition-all"
            >
              Start Ordering <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== CONTACT / FOOTER ===== */}
      <footer id="contact" className="bg-[#FAFAF8] border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo-icon.png" alt="Labliss" className="h-8 w-auto" />
                <div>
                  <span className="text-lg font-extrabold text-[#E85D2B]">Labliss</span>
                  <span className="block text-[9px] text-gray-500 font-semibold tracking-[0.15em] uppercase">Cakes & Sweeties</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Fresh treats, delivered to your door. From our kitchen to your heart.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gray-900">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-gray-500 hover:text-[#E85D2B] transition-colors">Home</Link>
                <Link to="/menu" className="text-sm text-gray-500 hover:text-[#E85D2B] transition-colors">Menu</Link>
                <Link to="/cart" className="text-sm text-gray-500 hover:text-[#E85D2B] transition-colors">Cart</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gray-900">Contact</h4>
              <div className="flex flex-col gap-3">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" /> +234 800 000 0000
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" /> orders@lablisscakesandsweeties.com.ng
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" /> Owerri, Nigeria
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" /> Mon - Sat: 8am - 6pm
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Labliss Cakes & Sweeties. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-[#E85D2B] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#E85D2B] transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
