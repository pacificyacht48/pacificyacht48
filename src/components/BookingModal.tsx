import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Mail, MessageCircle, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { translations } from '../translations';
import { boatTypes, serviceTypes, durations } from '../data';
import { supabase } from '../lib/supabase';

type Language = keyof typeof translations;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  dynamicServices: { id: string; name: string; category?: string }[];
  initialData: {
    boatType: string;
    service: string;
    duration: string;
    date: Date | undefined;
  };
}

// Base pricing logic for estimation
const BASE_PRICES: Record<string, number> = {
  "Motor Yacht": 5000,
  "Gulet": 3000,
  "Catamaran": 2000,
  "Sailboat": 1500,
  "Trawler": 2500,
};

const DURATION_MULTIPLIER: Record<string, number> = {
  "1 Day": 1,
  "3 Days": 2.8,
  "1 Week": 6,
  "2 Weeks": 11,
};

export function BookingModal({ isOpen, onClose, lang, dynamicServices, initialData }: BookingModalProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    contactMethod: 'phone',
    boatType: initialData.boatType,
    service: initialData.service,
    duration: initialData.duration,
    date: initialData.date ? format(initialData.date, 'yyyy-MM-dd') : ''
  });

  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  // Update form if initialData changes while modal is closed
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        boatType: initialData.boatType,
        service: initialData.service,
        duration: initialData.duration,
        date: initialData.date ? format(initialData.date, 'yyyy-MM-dd') : prev.date
      }));
    }
  }, [isOpen, initialData]);

  // Calculate Price
  useEffect(() => {
    if (formData.boatType && formData.duration) {
      const base = BASE_PRICES[formData.boatType] || 2000;
      const multiplier = DURATION_MULTIPLIER[formData.duration] || 1;
      setEstimatedPrice(base * multiplier);
    } else {
      setEstimatedPrice(null);
    }
  }, [formData.boatType, formData.duration]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Lütfen isim, telefon ve e-posta alanlarını doldurun.");
      return;
    }

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      contact_method: formData.contactMethod,
      boat_type: formData.boatType,
      service: formData.service,
      duration: formData.duration,
      date: formData.date || null,
      estimated_price: estimatedPrice,
      language: lang,
      status: 'Yeni'
    };

    try {
      const { error } = await supabase.from('bookings').insert([payload]);
      if (error) throw error;
      
      alert("Talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.");
      onClose();
    } catch (error: any) {
      console.error("Booking error:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A192F]/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Left Side - Form */}
          <div className="flex-1 p-8 md:p-10 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif text-[#0A192F]">{t.booking.title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-[#D4AF37] transition-colors md:hidden">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.booking.name}</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.booking.phone}</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.booking.email}</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm" />
                  </div>
                </div>
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">{t.booking.contactMethod}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="contactMethod" value="phone" checked={formData.contactMethod === 'phone'} onChange={handleChange} className="accent-[#D4AF37]" />
                    <span className="text-sm flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400" /> {t.booking.phoneOpt}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="contactMethod" value="whatsapp" checked={formData.contactMethod === 'whatsapp'} onChange={handleChange} className="accent-[#D4AF37]" />
                    <span className="text-sm flex items-center gap-1"><MessageCircle className="w-4 h-4 text-green-500" /> {t.booking.whatsappOpt}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="contactMethod" value="email" checked={formData.contactMethod === 'email'} onChange={handleChange} className="accent-[#D4AF37]" />
                    <span className="text-sm flex items-center gap-1"><Mail className="w-4 h-4 text-gray-400" /> {t.booking.emailOpt}</span>
                  </label>
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.search.boatType}</label>
                  <select name="boatType" value={formData.boatType} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm">
                    <option value="">{t.search.allTypes}</option>
                    {boatTypes.map(type => <option key={type} value={type}>{t.boatTypes[type as keyof typeof t.boatTypes]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.search.service}</label>
                  <select name="service" value={formData.service} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm">
                    <option value="">{t.search.anyService}</option>
                    {dynamicServices.length > 0 ? (
                      dynamicServices.map(service => (
                        <option key={service.id} value={service.name}>
                          {service.name} {service.category ? `(${service.category})` : ''}
                        </option>
                      ))
                    ) : (
                      serviceTypes.map(service => <option key={service} value={service}>{t.serviceTypes[service as keyof typeof t.serviceTypes]}</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.search.duration}</label>
                  <select name="duration" value={formData.duration} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm">
                    <option value="">{t.search.anyDuration}</option>
                    {durations.map(duration => <option key={duration} value={duration}>{t.durations[duration as keyof typeof t.durations]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.search.date}</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-sm" />
                </div>
              </div>

              {/* Mobile Submit (Visible only on small screens) */}
              <div className="md:hidden pt-6">
                <div className="bg-[#F5F2ED] p-4 mb-4 text-center">
                  <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{t.booking.estimatedPrice}</div>
                  <div className="text-2xl font-serif text-[#D4AF37]">
                    {estimatedPrice ? `€${estimatedPrice.toLocaleString()}` : <span className="text-sm text-gray-400 font-sans">{t.booking.pending}</span>}
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#0A192F] text-white p-4 uppercase tracking-widest text-sm hover:bg-[#D4AF37] transition-colors">
                  {t.booking.submit}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Price Summary & Submit */}
          <div className="hidden md:flex w-1/3 bg-[#0A192F] text-white p-10 flex-col justify-between relative">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div>
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-6">
                <Calculator className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-serif mb-8">{t.booking.estimatedPrice}</h3>
              
              <div className="space-y-4 mb-8 text-sm text-gray-300">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>{t.search.boatType}</span>
                  <span className="text-white">{formData.boatType ? t.boatTypes[formData.boatType as keyof typeof t.boatTypes] : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span>{t.search.duration}</span>
                  <span className="text-white">{formData.duration ? t.durations[formData.duration as keyof typeof t.durations] : '-'}</span>
                </div>
              </div>

              <div className="text-4xl font-serif text-[#D4AF37] mb-2">
                {estimatedPrice ? `€${estimatedPrice.toLocaleString()}` : <span className="text-lg text-gray-400 font-sans">{t.booking.pending}</span>}
              </div>
              <p className="text-xs text-gray-500">{t.booking.priceNote}</p>
            </div>

            <button onClick={handleSubmit} className="w-full bg-[#D4AF37] text-[#0A192F] p-4 uppercase tracking-widest text-sm font-semibold hover:bg-white transition-colors mt-8">
              {t.booking.submit}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
