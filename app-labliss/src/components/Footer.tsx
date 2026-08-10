import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Instagram, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { BusinessInfo } from '@/types';

export function Footer() {
  const [info, setInfo] = useState<BusinessInfo | null>(null);

  useEffect(() => {
    api.getConfig().then((config) => setInfo(config.businessInfo)).catch(() => {});
  }, []);

  // Fallback values
  const phone = info?.phone || '+2348065964065';
  const whatsapp = info?.whatsapp || '+2348065964065';
  const instagram = info?.instagram || 'la_blisscakesnsweeties';
  const tiktok = info?.tiktok || 'La_blisscakesnsweeties';
  const email = info?.email || 'orders@lablisscakesandsweeties.com.ng';
  const address = info?.address || 'Mbaise Owerri Road, Imo State';

  return (
    <footer id="contact" className="bg-[#1A1A1A] text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-[#E85D2B]">Labliss</span>
              <span className="block text-xs text-gray-400 tracking-wide">CAKES & SWEETIES</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fresh treats, delivered to your door. From our kitchen to your heart.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gray-300">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Menu', href: '/#/menu' },
                { label: 'Cart', href: '/#/cart' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gray-300">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4" /> {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4" /> {email}
              </a>
              <span className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" /> {address}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Labliss Cakes & Sweeties. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E85D2B] transition-colors" title={`@${instagram}`}>
              <Instagram className="w-5 h-5" />
            </a>
            {/* TikTok */}
            <a href={`https://tiktok.com/@${tiktok}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E85D2B] transition-colors" title={`@${tiktok}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.24 4.97v-7.14a8.24 8.24 0 004.55 1.37V10.4a4.85 4.85 0 01-3.77-4.25 4.85 4.85 0 013.77 4.25V6.69h3.45V2h-3.45v4.69h3.45z"/></svg>
            </a>
            {/* WhatsApp */}
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E85D2B] transition-colors" title={`WhatsApp: ${whatsapp}`}>
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
