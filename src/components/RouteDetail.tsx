import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Calendar, Clock, Anchor, Camera, Ship, 
  ChevronLeft, ChevronRight, Compass
} from 'lucide-react';

interface Route {
  id: string;
  name: string;
  description: string;
  images: string[];
  coves?: string[];
  bestTime?: string;
  history?: string;
  highlights?: string[];
  bestSeason?: string;
  activities?: string[];
}

interface RouteDetailProps {
  route: Route | null;
  isOpen: boolean;
  onClose: () => void;
  t: any;
  isRtl: boolean;
}

const RouteDetail = ({ route, isOpen, onClose, t, isRtl }: RouteDetailProps) => {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !route) return null;

  const routeImages = route.images && route.images.length > 0 
    ? route.images.filter(img => img !== '') 
    : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'];

  const nextImage = () => setActiveImage((prev) => (prev + 1) % routeImages.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + routeImages.length) % routeImages.length);

  return (
    <motion.div 
      initial={{ opacity: 0, x: isRtl ? -100 : 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? -100 : 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#F5F2ED] overflow-y-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Navigation */}
      <div className="sticky top-0 z-[110] bg-[#0A192F]/95 backdrop-blur-md px-6 py-4 flex justify-between items-center text-white border-b border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isRtl ? <ChevronRight /> : <ChevronLeft />}
          </button>
          <h2 className="text-xl md:text-2xl font-serif tracking-wide">{route.name}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Media & Highlights */}
        <div className="lg:col-span-8 space-y-12">
          {/* Image Gallery */}
          <div className="relative aspect-video bg-black rounded-sm overflow-hidden group shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={routeImages[activeImage]}
                alt={`${route.name} - ${activeImage + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

            {/* Controls */}
            {routeImages.length > 1 && (
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
                  {routeImages.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'bg-[#D4AF37] w-8' : 'bg-white/50 w-2 hover:bg-white'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* About Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-serif text-[#0A192F]">
              {t.routes?.aboutTheRoute || 'About This Route'}
            </h3>
            <div className="w-16 h-1 bg-[#D4AF37]"></div>
            <p className="text-gray-600 leading-relaxed text-lg">
              {route.description}
            </p>
          </div>

          {/* Highlights */}
          {route.highlights && route.highlights.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-3xl font-serif text-[#0A192F] flex items-center gap-3">
                <Compass className="w-8 h-8 text-[#D4AF37]" />
                {t.routes?.highlights || 'Highlights'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {route.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-sm border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 shrink-0"></div>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coves / Places to Visit */}
          {route.coves && route.coves.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-3xl font-serif text-[#0A192F] flex items-center gap-3">
                <Anchor className="w-8 h-8 text-[#D4AF37]" />
                {t.routes?.coves || 'Coves & Bays'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {route.coves.map((cove, idx) => (
                  <div key={idx} className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm relative overflow-hidden group hover:border-[#D4AF37] transition-all">
                    <MapPin className="w-5 h-5 text-[#D4AF37] mb-3" />
                    <p className="text-lg font-serif text-[#0A192F]">{cove}</p>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {route.activities && route.activities.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-3xl font-serif text-[#0A192F] flex items-center gap-3">
                <Camera className="w-8 h-8 text-[#D4AF37]" />
                {t.routes?.activities || 'Activities'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {route.activities.map((activity, idx) => (
                  <span key={idx} className="px-6 py-3 bg-[#0A192F] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all cursor-default">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History Section */}
          {route.history && (
            <div className="bg-white p-10 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-[#D4AF37]"></div>
              <h3 className="text-3xl font-serif text-[#0A192F] mb-6 flex items-center gap-3">
                <Clock className="w-8 h-8 text-[#D4AF37]" />
                {t.routes?.history || 'Historical Context'}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                {route.history}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Sidebar Info */}
        <div className="lg:col-span-4 h-fit sticky top-28 space-y-8">
          {/* Best Time to Visit Card */}
          {(route.bestTime || route.bestSeason) && (
            <div className="bg-[#0A192F] text-white p-8 rounded-sm shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Calendar className="w-6 h-6 text-[#D4AF37]" />
                <h4 className="text-xl font-serif">
                  {t.routes?.bestTimeToVisit || 'Planning Your Trip'}
                </h4>
              </div>
              <div className="space-y-6 relative z-10">
                {route.bestTime && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-2">
                      {t.routes?.bestTimeToVisit || 'Best Months'}
                    </span>
                    <p className="text-white font-serif leading-relaxed italic border-l-2 border-[#D4AF37]/50 pl-4 py-1">
                      {route.bestTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact & Booking Card */}
          <div className="bg-white p-8 border border-gray-100 shadow-xl rounded-sm">
            <h4 className="text-2xl font-serif text-[#0A192F] mb-4">
              {isRtl ? 'حجز هذا المسار' : 'Book This Route'}
            </h4>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {isRtl 
                ? 'استمتع برحلة بحرية لا تُنسى مخصصة لاحتياجاتك.' 
                : 'Experience an unforgettable journey customized to your desires.'
              }
            </p>
            <div className="space-y-4">
              <button 
                onClick={onClose}
                className="w-full bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] py-4 font-bold uppercase tracking-widest text-xs transition-all shadow-lg"
              >
                {t.nav?.bookNow || (isRtl ? 'احجز الآن' : 'Book Now')}
              </button>
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                {isRtl ? 'استجابة سريعة عبر واتساب' : 'Quick response via WhatsApp'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default RouteDetail;
