import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Anchor, Compass, Ship, MapPin, Search, Menu, X, Facebook, Instagram, Twitter, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { boatTypes, serviceTypes, durations, featuredYachts } from './data';
import { TypeWriter } from './components/TypeWriter';
import { translations } from './translations';
import { BookingModal } from './components/BookingModal';
import { AdminPanel } from './components/AdminPanel';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './lib/supabase';

type Language = keyof typeof translations;

interface ServiceModel {
  id: string;
  name: string;
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
}

interface Route {
  id: string;
  name: string;
  description: string;
  images: string[];
}


const YachtCard = ({ yacht, index, t, isRtl }: any) => {
  const [imgIdx, setImgIdx] = useState(0);
  
  let images: string[] = [];
  if ('images' in yacht && Array.isArray(yacht.images) && yacht.images.length > 0) {
    images = yacht.images.filter((img: string) => img !== '');
  } else if (yacht.image) {
    images = [yacht.image];
  }
  
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800');
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setImgIdx((prev) => (prev + 1) % images.length);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="group cursor-pointer"
    >
      <div className="relative h-80 md:h-96 overflow-hidden mb-6" onClick={handleNextImage}>
        <img 
          src={images[imgIdx]} 
          alt={yacht.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {images.length > 1 && (
          <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/40 p-2 rounded-full text-white backdrop-blur-sm pointer-events-none">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-[#D4AF37] w-6' : 'bg-white/50 w-2'}`} />
            ))}
          </div>
        )}
        <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} bg-[#0A192F]/80 backdrop-blur-sm px-4 py-2 text-xs uppercase tracking-widest border border-[#D4AF37]/30 pointer-events-none`}>
          {t.boatTypes?.[yacht.type as keyof typeof t.boatTypes] || yacht.type}
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-serif mb-2 group-hover:text-[#D4AF37] transition-colors">{yacht.name}</h3>
          <div className="flex gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1"><Ship className="w-4 h-4" /> {yacht.length}m</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {yacht.guests} {t.fleet.guests}</span>
            <span>{yacht.cabins} {t.fleet.cabins}</span>
          </div>
        </div>
        <div className={`text-${isRtl ? 'left' : 'right'}`}>
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">{t.fleet.from}</div>
          <div className="text-2xl font-serif text-[#D4AF37]">€{((yacht as any).pricePerDay || (yacht as any).price || 0).toLocaleString()} <span className="text-sm text-gray-400 font-sans">{t.fleet.perDay}</span></div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('tr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Booking Form State
  const [selectedBoatType, setSelectedBoatType] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [dynamicServices, setDynamicServices] = useState<ServiceModel[]>([]);
  const [dynamicBoats, setDynamicBoats] = useState<Boat[]>([]);
  const [dynamicRoutes, setDynamicRoutes] = useState<Route[]>([]);


  const t = translations[lang];
  const isRtl = lang === 'ar';

  // Handle scroll for navbar
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Fetch dynamic services from Supabase
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('service_models')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setDynamicServices(data || []);
      }
    };

    fetchServices();

    // Set up real-time subscription for Supabase
    const channel = supabase
      .channel('app_service_models')
      .on('postgres_changes', { event: '*', table: 'service_models', schema: 'public' }, () => {
        fetchServices();
      })
      .subscribe();

    // Fetch dynamic boats from Supabase
    const fetchBoats = async () => {
      const { data, error } = await supabase
        .from('boats')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching boats:', error);
      } else {
        // Map snake_case from DB to camelCase for the app
        const mappedBoats = (data || []).map((b: any) => ({
          ...b,
          serviceModelIds: b.service_model_ids || [],
          images: b.images || [],
          videoUrl: b.video_url || ''
        }));
        setDynamicBoats(mappedBoats);
      }
    };

    fetchBoats();

    // Set up real-time subscription for boats
    const boatChannel = supabase
      .channel('app_boats')
      .on('postgres_changes', { event: '*', table: 'boats', schema: 'public' }, () => {
        fetchBoats();
      })
      .subscribe();

    // Fetch dynamic routes from Supabase
    const fetchRoutes = async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching routes:', error);
      } else {
        setDynamicRoutes(data || []);
      }
    };

    fetchRoutes();

    // Set up real-time subscription for routes
    const routeChannel = supabase
      .channel('app_routes')
      .on('postgres_changes', { event: '*', table: 'routes', schema: 'public' }, () => {
        fetchRoutes();
      })
      .subscribe();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      supabase.removeChannel(channel);
      supabase.removeChannel(boatChannel);
      supabase.removeChannel(routeChannel);
    };
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingModalOpen(true);
  };

  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('home')} />;
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F5F2ED] text-[#0A192F] font-sans selection:bg-[#D4AF37] selection:text-white">
      {/* Header & Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0A192F]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        {/* Top Bar for Languages */}
        <div className={`px-6 flex justify-start gap-3 transition-all duration-500 ${isScrolled ? 'py-2 bg-[#020C1B]' : 'py-3 bg-[#0A192F]/40 backdrop-blur-sm'}`}>
          {[
            { code: 'tr', img: 'https://flagcdn.com/w40/tr.png', alt: 'Türkçe' },
            { code: 'en', img: 'https://flagcdn.com/w40/gb.png', alt: 'English' },
            { code: 'de', img: 'https://flagcdn.com/w40/de.png', alt: 'Deutsch' },
            { code: 'ru', img: 'https://flagcdn.com/w40/ru.png', alt: 'Русский' },
            { code: 'ar', img: 'https://flagcdn.com/w40/ae.png', alt: 'العربية' },
          ].map((l) => (
            <button 
              key={l.code} 
              onClick={() => setLang(l.code as Language)}
              className={`relative w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden transition-all duration-300 hover:scale-110 ${lang === l.code ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#0A192F] opacity-100' : 'opacity-60 hover:opacity-100'}`}
              title={l.alt}
            >
              <img src={l.img} alt={l.alt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>

        <nav className={`max-w-7xl mx-auto px-6 flex justify-between items-center transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
          <div className="flex items-center gap-2">
            <Anchor className={`w-8 h-8 ${isScrolled ? 'text-[#D4AF37]' : 'text-white'}`} />
            <span className={`text-2xl font-serif tracking-widest uppercase ${isScrolled ? 'text-white' : 'text-white'}`}>
              Pacific Yacht Lines
            </span>

          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'fleet', label: t.nav.fleet },
              { id: 'services', label: t.nav.services },
              { id: 'destinations', label: t.nav.destinations },
              { id: 'about', label: t.nav.about }
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} className={`text-sm uppercase tracking-widest hover:text-[#D4AF37] transition-colors ${isScrolled ? 'text-gray-300' : 'text-white/90'}`}>
                {item.label}
              </a>
            ))}
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="border border-[#00ADB5] text-[#00ADB5] px-6 py-2 text-sm uppercase tracking-widest hover:bg-[#00ADB5] hover:text-white transition-all"
            >
              {t.nav.bookNow}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0A192F] pt-32 px-6"
          >
            <div className="flex flex-col gap-6 text-center">
              {[
                { id: 'fleet', label: t.nav.fleet },
                { id: 'services', label: t.nav.services },
                { id: 'destinations', label: t.nav.destinations },
                { id: 'about', label: t.nav.about }
              ].map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-white hover:text-[#D4AF37]">
                  {item.label}
                </a>
              ))}
              <button 
                onClick={() => { setIsMenuOpen(false); setIsBookingModalOpen(true); }}
                className="mt-4 border border-[#00ADB5] text-[#00ADB5] px-6 py-3 text-sm uppercase tracking-widest hover:bg-[#00ADB5] hover:text-white transition-all inline-block mx-auto"
              >
                {t.nav.bookNow}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Luxury Yacht" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/60 via-[#0A192F]/40 to-[#0A192F]/80"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm md:text-base mb-6 font-medium">
              {t.hero.subtitle}
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight mb-8">
              <TypeWriter text={t.hero.title1} delay={0.5} /> <br />
              <span className="italic font-light"><TypeWriter text={t.hero.title2} delay={1.2} /></span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Booking/Search Bar */}
      <section className="relative z-20 -mt-24 px-4 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="bg-white p-6 md:p-8 shadow-2xl rounded-sm border-t-4 border-[#D4AF37]"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{t.search.boatType}</label>
              <select 
                value={selectedBoatType} 
                onChange={(e) => setSelectedBoatType(e.target.value)}
                className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent rounded-none text-sm"
              >
                <option value="">{t.search.allTypes}</option>
                {boatTypes.map(type => <option key={type} value={type}>{t.boatTypes[type as keyof typeof t.boatTypes]}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{t.search.service}</label>
              <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent rounded-none text-sm"
              >
                <option value="">{t.search.anyService}</option>
                {dynamicServices.length > 0 ? (
                  dynamicServices.map(service => <option key={service.id} value={service.name}>{service.name}</option>)
                ) : (
                  serviceTypes.map(service => <option key={service} value={service}>{t.serviceTypes[service as keyof typeof t.serviceTypes]}</option>)
                )}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{t.search.duration}</label>
              <select 
                value={selectedDuration} 
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent rounded-none text-sm"
              >
                <option value="">{t.search.anyDuration}</option>
                {durations.map(duration => <option key={duration} value={duration}>{t.durations[duration as keyof typeof t.durations]}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{t.search.date}</label>
              <button 
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full p-3 border-b border-gray-300 focus:border-[#D4AF37] outline-none bg-transparent text-left flex justify-between items-center text-sm"
              >
                <span className={selectedDate ? 'text-[#0A192F]' : 'text-gray-400'}>
                  {selectedDate ? format(selectedDate, 'PPP') : t.search.selectDate}
                </span>
                <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
              </button>
              
              {showDatePicker && (
                <div className={`absolute top-full ${isRtl ? 'right-0' : 'left-0'} mt-2 bg-white shadow-xl border border-gray-100 z-50 p-4`} dir="ltr">
                  <DayPicker 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={(date) => { setSelectedDate(date); setShowDatePicker(false); }}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="bg-[#0A192F] text-white p-4 uppercase tracking-widest text-sm hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> {t.search.searchBtn}
            </button>
          </form>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">{t.services.title}</h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">{t.services.desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(dynamicServices.length > 0 ? dynamicServices : serviceTypes).map((service, index) => (
            <motion.div 
              key={typeof service === 'string' ? service : service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden bg-white p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#0A192F] transition-colors">
                <Compass className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-serif mb-3 group-hover:text-[#D4AF37] transition-colors">
                {typeof service === 'string' ? t.serviceTypes[service as keyof typeof t.serviceTypes] : service.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t.services.desc}
              </p>
              <div className="mt-6 flex items-center text-sm font-semibold uppercase tracking-wider text-[#0A192F] group-hover:text-[#D4AF37] transition-colors cursor-pointer">
                {t.services.discover} <span className={`${isRtl ? 'mr-2 group-hover:-translate-x-2' : 'ml-2 group-hover:translate-x-2'} transition-transform`}>{isRtl ? '←' : '→'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Fleet */}
      <section id="fleet" className="py-24 bg-[#0A192F] text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-4">{t.fleet.title}</h2>
              <div className="w-16 h-1 bg-[#D4AF37]"></div>
            </div>
            <button className="text-[#D4AF37] uppercase tracking-widest text-sm hover:text-white transition-colors flex items-center gap-2">
              {t.fleet.viewAll} <span>{isRtl ? '←' : '→'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {(dynamicBoats.length > 0 ? dynamicBoats : featuredYachts).map((yacht, index) => (
              <YachtCard key={yacht.id} yacht={yacht} index={index} t={t} isRtl={isRtl} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section id="destinations" className="py-24 bg-[#F5F2ED] px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">{t.routes?.title || 'Popular Routes'}</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto">{t.routes?.desc || 'Discover the most enchanting locations across the coastline.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dynamicRoutes.map((route, index) => (
              <motion.div 
                key={route.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-[500px] overflow-hidden rounded-sm shadow-xl cursor-pointer"
              >
                <img 
                  src={route.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} 
                  alt={route.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:translate-y-[-20px] transition-transform duration-500">
                  <h3 className="text-3xl font-serif text-white mb-3">{route.name}</h3>
                  <div className="w-10 h-0.5 bg-[#D4AF37] mb-4 group-hover:w-20 transition-all duration-500"></div>
                  <p className="text-gray-300 text-sm line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 leading-relaxed mb-6">
                    {route.description}
                  </p>
                  <button className="text-white text-xs uppercase tracking-[0.2em] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:text-[#D4AF37]">
                    {t.routes?.explore || 'Explore Route'} <span className={isRtl ? 'rotate-180' : ''}>→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-[#020C1B] text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="col-span-1 md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <Anchor className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-2xl font-serif tracking-widest uppercase">Pacific Yacht Lines</span>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed mb-8">
              {t.footer.desc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="https://instagram.com/pacificyachtlines" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="https://wa.me/905497919999" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WhatsApp" /></a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-lg font-serif mb-6">{t.footer.quickLinks}</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">{t.nav.fleet}</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">{t.nav.destinations}</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">{t.nav.about}</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">{t.footer.contact}</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4">
            <h4 className="text-lg font-serif mb-6">{t.footer.contact}</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <span className="text-[#D4AF37] text-xs">@</span>
                </div>
                <a href="mailto:info@pacificyachtlines.com" className="hover:text-[#D4AF37] transition-colors whitespace-nowrap">info@pacificyachtlines.com</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-4 h-4" alt="WA" />
                </div>
                <a href="https://wa.me/905497919999" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">+90 549 791 99 99</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <Instagram className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <a href="https://instagram.com/pacificyachtlines" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">pacificyachtlines</a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mt-1 shrink-0">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="whitespace-nowrap">D-Marin Turgutreis Marina Bodrum / Mugla</span>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pacific Yacht Lines. {t.footer.rights}</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
            <button onClick={() => setView('admin')} className="text-gray-700 hover:text-[#D4AF37] transition-colors text-xs">Admin</button>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        lang={lang}
        dynamicServices={dynamicServices}
        initialData={{
          boatType: selectedBoatType,
          service: selectedService,
          duration: selectedDuration,
          date: selectedDate
        }}
      />
    </div>
  );
}

