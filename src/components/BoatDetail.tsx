import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Ship, Users, DoorOpen, Ruler, Anchor, 
  CheckCircle2, Play, ChevronLeft, ChevronRight,
  Calculator, MessageSquare, Calendar
} from 'lucide-react';
import { translations } from '../translations';

interface ServiceModel {
  id: string;
  name: string;
  category: 'Günübirlik' | 'Birden Çok Gün';
}

interface Boat {
  id: string;
  name: string;
  type: string;
  length: number;
  guests: number;
  cabins: number;
  serviceModelIds: string[];
  images: string[];
  videoUrl: string;
  captain: string;
  price: number;
  description?: string;
}

interface BoatDetailProps {
  boat: Boat;
  onClose: () => void;
  lang: keyof typeof translations;
  isRtl: boolean;
  dynamicServices: ServiceModel[];
  onBook: () => void;
}

export const BoatDetail: React.FC<BoatDetailProps> = ({ 
  boat, onClose, lang, isRtl, dynamicServices, onBook 
}) => {
  const t = translations[lang];
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  
  // Price calculation state
  const [calcDuration, setCalcDuration] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  
  const boatImages = boat.images && boat.images.length > 0 
    ? boat.images.filter(img => img !== '') 
    : ['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200'];

  const nextImage = () => setActiveImage((prev) => (prev + 1) % boatImages.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + boatImages.length) % boatImages.length);

  // Filter services that belong to this boat
  const boatServices = dynamicServices.filter(s => boat.serviceModelIds?.includes(s.id));

  const basePrice = boat.price || 0;
  const totalPrice = basePrice * calcDuration;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Map boat features for display
  const features = [
    { icon: <Ruler className="w-5 h-5" />, label: lang === 'tr' ? 'Uzunluk' : 'Length', value: `${boat.length}m` },
    { icon: <Users className="w-5 h-5" />, label: lang === 'tr' ? 'Kapasite' : 'Guests', value: `${boat.guests} ${t.fleet.guests}` },
    { icon: <DoorOpen className="w-5 h-5" />, label: lang === 'tr' ? 'Kabin' : 'Cabins', value: `${boat.cabins} ${t.fleet.cabins}` },
    { icon: <Anchor className="w-5 h-5" />, label: lang === 'tr' ? 'Kaptan' : 'Captain', value: boat.captain || (lang === 'tr' ? 'Mevcut' : 'Available') },
    { icon: <Ship className="w-5 h-5" />, label: lang === 'tr' ? 'Tip' : 'Type', value: t.boatTypes[boat.type as keyof typeof t.boatTypes] || boat.type },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#F5F2ED] overflow-y-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Navigation */}
      <div className="sticky top-0 z-[110] bg-[#0A192F]/95 backdrop-blur-md px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isRtl ? <ChevronRight /> : <ChevronLeft />}
          </button>
          <h2 className="text-xl md:text-2xl font-serif tracking-wide">{boat.name}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Media & Info */}
        <div className="lg:col-span-8 space-y-12">
          {/* Image Gallery */}
          <div className="relative aspect-video bg-black rounded-sm overflow-hidden group shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={boatImages[activeImage]}
                alt={`${boat.name} - ${activeImage + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

            {/* Controls */}
            {boatImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-[#D4AF37] text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-[#D4AF37] text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {boatImages.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'bg-[#D4AF37] w-8' : 'bg-white/50 w-2 hover:bg-white'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Video Overlay Badge */}
            {boat.videoUrl && (
              <button 
                onClick={() => setShowVideo(true)}
                className="absolute top-6 right-6 bg-[#D4AF37] text-white px-4 py-2 flex items-center gap-2 rounded-full font-semibold text-sm hover:bg-white hover:text-[#0A192F] transition-all shadow-lg animate-pulse"
              >
                <Play className="w-4 h-4 fill-current" />
                {t.boatDetail.watchVideo}
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2 group hover:border-[#D4AF37] transition-colors">
                <div className="text-[#D4AF37] group-hover:scale-110 transition-transform">{f.icon}</div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{f.label}</span>
                <span className="text-sm font-semibold text-[#0A192F]">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Features / Description Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-serif text-[#0A192F]">
              {t.boatDetail.features}
            </h3>
            <div className="w-16 h-1 bg-[#D4AF37]"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { tr: 'Lüks İç Tasarım', en: 'Luxury Interior Design' },
                { tr: 'Geniş Güneşlenme Alanı', en: 'Large Sunbathing Area' },
                { tr: 'Ses ve Müzik Sistemi', en: 'Premium Sound System' },
                { tr: 'Tam Donanımlı Mutfak', en: 'Fully Equipped Kitchen' },
                { tr: 'Klima ve Wi-Fi', en: 'Air Conditioning & Wi-Fi' },
                { tr: 'Su Sporları Ekipmanı', en: 'Water Sports Equipment' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <span className="text-sm">{lang === 'tr' ? feature.tr : feature.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Services Section */}
          {boatServices.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-3xl font-serif text-[#0A192F]">
                {t.boatDetail.extraServices}
              </h3>
              <div className="w-16 h-1 bg-[#D4AF37]"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boatServices.map(service => (
                  <div key={service.id} className="bg-[#0A192F] p-6 text-white rounded-sm relative overflow-hidden group">
                    <Anchor className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:text-white/10 transition-colors" />
                    <div className="relative z-10 flex justify-between items-start mb-2">
                       <h4 className="text-lg font-serif">{service.name}</h4>
                       <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold border ${service.category === 'Birden Çok Gün' ? 'border-purple-500 text-purple-400' : 'border-blue-500 text-blue-400'}`}>
                          {service.category === 'Birden Çok Gün' ? (lang === 'tr' ? 'Konaklamalı' : 'Overnight') : (lang === 'tr' ? 'Günübirlik' : 'Daily')}
                       </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4 relative z-10">
                      {lang === 'tr' ? 'Bu tekneye özel profesyonel hizmet.' : 'Professional service dedicated to this boat.'}
                    </p>
                    <div className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold relative z-10">
                      {lang === 'tr' ? 'İncele' : 'Explore'} →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Calculator & Booking */}
        <div className="lg:col-span-4 h-fit sticky top-28">
          <div className="bg-white shadow-2xl rounded-sm border-t-4 border-[#D4AF37] overflow-hidden">
            <div className="p-8 bg-[#0A192F] text-white">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">{lang === 'tr' ? 'BAŞLAYAN FİYAT' : 'STARTING FROM'}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-serif">€{basePrice.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">/{t.fleet.perDay.replace('/', '')}</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Duration Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#D4AF37]" />
                    {t.boatDetail.duration}
                  </label>
                  <span className="text-[#0A192F] font-serif font-bold text-xl">{calcDuration}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="1"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  <span>1 {lang === 'tr' ? 'GÜN' : 'DAY'}</span>
                  <span>30 {lang === 'tr' ? 'GÜN' : 'DAYS'}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#F5F2ED] p-6 rounded-sm space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{lang === 'tr' ? 'Günlük Birim' : 'Daily Rate'}</span>
                  <span>€{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{lang === 'tr' ? 'Toplam Süre' : 'Total Duration'}</span>
                  <span>{calcDuration} {lang === 'tr' ? 'Gün' : 'Days'}</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-serif text-[#0A192F] text-lg">{t.boatDetail.total}</span>
                  <span className="font-serif text-[#D4AF37] text-2xl font-bold">€{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={onBook}
                  className="w-full bg-[#0A192F] hover:bg-[#D4AF37] text-white py-5 flex items-center justify-center gap-3 transition-all duration-500 font-bold tracking-widest uppercase text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  {t.boatDetail.bookNow}
                </button>
                <button 
                  className="w-full border border-gray-200 hover:border-[#D4AF37] text-gray-600 hover:text-[#0A192F] py-4 flex items-center justify-center gap-3 transition-all duration-300 font-bold tracking-widest uppercase text-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  {lang === 'tr' ? 'WHATSAPP İLE SORUN' : 'INQUIRE VIA WHATSAPP'}
                </button>
              </div>
              
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                {lang === 'tr' 
                  ? '*Fiyatlar sezona ve özel taleplere göre değişiklik gösterebilir.' 
                  : '*Prices may vary depending on the season and special requests.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {showVideo && boat.videoUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-6 right-6 text-white hover:text-[#D4AF37] transition-colors"
            >
              <X className="w-10 h-10" />
            </button>
            <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl">
              <iframe 
                src={boat.videoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full"
                allowFullScreen
                title="Boat Video"
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
