import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  LogOut, 
  LayoutDashboard, 
  Ship, 
  Settings, 
  Image as ImageIcon, 
  Video, 
  User as UserIcon, 
  Euro,
  ChevronRight,
  X,
  Loader2,
  Upload,
  Edit2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';



interface ServiceModel {
  id: string;
  name: string;
  description: string;
  category: 'Günübirlik' | 'Birden Çok Gün';
}

interface BoatType {
  id: string;
  name: string;
  description: string;
}

interface AdditionalService {
  id: string;
  name: string;
  description: string;
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
  price: number;
}

interface Route {
  id: string;
  name: string;
  description: string;
  images: string[];
}

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  contact_method: string;
  boat_type: string;
  service: string;
  duration: string;
  date: string;
  estimated_price: number;
  language: string;
  status: string;
  created_at: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'boat-types' | 'extra-services' | 'boats' | 'routes' | 'bookings' | 'headings'>('dashboard');
  const [serviceModels, setServiceModels] = useState<ServiceModel[]>([]);
  const [boatTypes, setBoatTypes] = useState<BoatType[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [headings, setHeadings] = useState<any[]>([]);


  
  // Form States
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceCategory, setServiceCategory] = useState<'Günübirlik' | 'Birden Çok Gün'>('Günübirlik');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [boatTypeName, setBoatTypeName] = useState('');
  const [boatTypeDesc, setBoatTypeDesc] = useState('');
  const [editingBoatTypeId, setEditingBoatTypeId] = useState<string | null>(null);

  const [extraName, setExtraName] = useState('');
  const [extraDesc, setExtraDesc] = useState('');
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
  
  const [boatName, setBoatName] = useState('');
  const [boatType, setBoatType] = useState('Motor Yat');
  const [boatLength, setBoatLength] = useState('');
  const [boatGuests, setBoatGuests] = useState('');
  const [boatCabins, setBoatCabins] = useState('');
  const [boatServiceModels, setBoatServiceModels] = useState<string[]>([]);
  const [boatImages, setBoatImages] = useState(['', '', '', '']);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [boatVideo, setBoatVideo] = useState('');
  const [boatPrice, setBoatPrice] = useState('');

  const [isBoatFormOpen, setIsBoatFormOpen] = useState(false);
  const [editingBoatId, setEditingBoatId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [routeName, setRouteName] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [routeImages, setRouteImages] = useState(['', '', '', '']);
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [uploadingRouteIdx, setUploadingRouteIdx] = useState<number | null>(null);




  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) return;

    // Fetch Service Models from Supabase
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('service_models')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServiceModels(data || []);
      }
    };

    fetchServices();

    // Fetch Boat Types from Supabase
    const fetchBoatTypes = async () => {
      const { data, error } = await supabase
        .from('boat_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching boat types:', error);
      } else {
        setBoatTypes(data || []);
      }
    };

    fetchBoatTypes();

    // Fetch Additional Services from Supabase
    const fetchExtras = async () => {
      const { data, error } = await supabase
        .from('additional_services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching extras:', error);
      } else {
        setAdditionalServices(data || []);
      }
    };

    fetchExtras();

    // Fetch Boats from Supabase
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
        setBoats(mappedBoats);
      }
    };

    fetchBoats();

    // Fetch Routes from Supabase
    const fetchRoutes = async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching routes:', error);
      } else {
        setRoutes(data || []);
      }
    };

    fetchRoutes();

    // Fetch Bookings from Supabase
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
    };

    fetchBookings();

    // Fetch Headings from Supabase
    const fetchHeadings = async () => {
      const { data, error } = await supabase
        .from('headings')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('Error fetching headings:', error);
      } else {
        setHeadings(data || []);
      }
    };

    fetchHeadings();



    // Set up real-time subscription for Supabase
    const serviceChannel = supabase
      .channel('admin_service_models')
      .on('postgres_changes', { event: '*', table: 'service_models', schema: 'public' }, () => {
        fetchServices();
      })
      .subscribe();

    const boatTypeChannel = supabase
      .channel('admin_boat_types')
      .on('postgres_changes', { event: '*', table: 'boat_types', schema: 'public' }, () => {
        fetchBoatTypes();
      })
      .subscribe();

    const extraChannel = supabase
      .channel('admin_additional_services')
      .on('postgres_changes', { event: '*', table: 'additional_services', schema: 'public' }, () => {
        fetchExtras();
      })
      .subscribe();

    const boatChannel = supabase
      .channel('admin_boats')
      .on('postgres_changes', { event: '*', table: 'boats', schema: 'public' }, () => {
        fetchBoats();
      })
      .subscribe();

    const routeChannel = supabase
      .channel('admin_routes')
      .on('postgres_changes', { event: '*', table: 'routes', schema: 'public' }, () => {
        fetchRoutes();
      })
      .subscribe();

    const bookingChannel = supabase
      .channel('admin_bookings')
      .on('postgres_changes', { event: '*', table: 'bookings', schema: 'public' }, () => {
        fetchBookings();
      })
      .subscribe();

    const headingChannel = supabase
      .channel('admin_headings')
      .on('postgres_changes', { event: '*', table: 'headings', schema: 'public' }, () => {
        fetchHeadings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(serviceChannel);
      supabase.removeChannel(boatTypeChannel);
      supabase.removeChannel(extraChannel);
      supabase.removeChannel(boatChannel);
      supabase.removeChannel(routeChannel);
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(headingChannel);
    };


  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoginLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed", error);
      alert(`Giriş hatası: ${error.message}\n\nLütfen e-posta ve şifrenizin doğruluğundan emin olun.`);
    } finally {
      setIsLoginLoading(false);
    }
  };


  const handleLogout = () => supabase.auth.signOut();


  const addServiceModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) return;
    
    if (editingServiceId) {
      const { error } = await supabase
        .from('service_models')
        .update({ name: serviceName, description: serviceDesc, category: serviceCategory })
        .eq('id', editingServiceId);

      if (error) {
        console.error('Error updating service model:', error);
        alert('Hizmet modeli güncellenirken bir hata oluştu.');
      } else {
        setServiceName('');
        setServiceDesc('');
        setServiceCategory('Günübirlik');
        setEditingServiceId(null);
      }
    } else {
      const { error } = await supabase
        .from('service_models')
        .insert([{ name: serviceName, description: serviceDesc, category: serviceCategory }]);

      if (error) {
        console.error('Error adding service model:', error);
        alert('Hizmet modeli eklenirken bir hata oluştu.');
      } else {
        setServiceName('');
        setServiceDesc('');
        setServiceCategory('Günübirlik');
      }
    }
  };

  const handleEditService = (service: ServiceModel) => {
    setServiceName(service.name);
    setServiceDesc(service.description);
    setServiceCategory(service.category || 'Günübirlik');
    setEditingServiceId(service.id);
  };

  const deleteServiceModel = async (id: string) => {
    if (window.confirm('Bu hizmet modelini silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('service_models')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service model:', error);
        alert('Hizmet modeli silinirken bir hata oluştu.');
      }
    }
  };

  const addBoatType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boatTypeName) return;
    
    if (editingBoatTypeId) {
      const { error } = await supabase
        .from('boat_types')
        .update({ name: boatTypeName, description: boatTypeDesc })
        .eq('id', editingBoatTypeId);

      if (error) {
        console.error('Error updating boat type:', error);
        alert('Tekne tipi güncellenirken bir hata oluştu.');
      } else {
        setBoatTypeName('');
        setBoatTypeDesc('');
        setEditingBoatTypeId(null);
      }
    } else {
      const { error } = await supabase
        .from('boat_types')
        .insert([{ name: boatTypeName, description: boatTypeDesc }]);

      if (error) {
        console.error('Error adding boat type:', error);
        alert('Tekne tipi eklenirken bir hata oluştu.');
      } else {
        setBoatTypeName('');
        setBoatTypeDesc('');
      }
    }
  };

  const handleEditBoatType = (type: BoatType) => {
    setBoatTypeName(type.name);
    setBoatTypeDesc(type.description);
    setEditingBoatTypeId(type.id);
  };

  const deleteBoatType = async (id: string) => {
    if (window.confirm('Bu tekne tipini silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('boat_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting boat type:', error);
        alert('Tekne tipi silinirken bir hata oluştu.');
      }
    }
  };

  const addAdditionalService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName) return;
    
    if (editingExtraId) {
      const { error } = await supabase
        .from('additional_services')
        .update({ name: extraName, description: extraDesc })
        .eq('id', editingExtraId);

      if (error) {
        console.error('Error updating extra service:', error);
        alert('Ek hizmet güncellenirken bir hata oluştu.');
      } else {
        setExtraName('');
        setExtraDesc('');
        setEditingExtraId(null);
      }
    } else {
      const { error } = await supabase
        .from('additional_services')
        .insert([{ name: extraName, description: extraDesc }]);

      if (error) {
        console.error('Error adding extra service:', error);
        alert('Ek hizmet eklenirken bir hata oluştu.');
      } else {
        setExtraName('');
        setExtraDesc('');
      }
    }
  };

  const handleEditExtra = (extra: AdditionalService) => {
    setExtraName(extra.name);
    setExtraDesc(extra.description);
    setEditingExtraId(extra.id);
  };

  const deleteAdditionalService = async (id: string) => {
    if (window.confirm('Bu ek hizmeti silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('additional_services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting extra service:', error);
        alert('Ek hizmet silinirken bir hata oluştu.');
      }
    }
  };

  const addBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boatName || boatServiceModels.length === 0) return;
    
    const boatData = {
      name: boatName,
      type: boatType,
      length: Number(boatLength),
      guests: Number(boatGuests),
      cabins: Number(boatCabins),
      service_model_ids: boatServiceModels,
      images: boatImages.filter(img => img !== ''),
      video_url: boatVideo,
      price: Number(boatPrice)
    };

    if (editingBoatId) {
      const { error } = await supabase
        .from('boats')
        .update(boatData)
        .eq('id', editingBoatId);
      
      if (error) {
        console.error('Error updating boat:', error);
        alert('Tekne güncellenirken bir hata oluştu.');
        return;
      }
    } else {
      const { error } = await supabase
        .from('boats')
        .insert([boatData]);
      
      if (error) {
        console.error('Error adding boat:', error);
        alert('Tekne eklenirken bir hata oluştu.');
        return;
      }
    }

    // Reset Form
    setBoatName('');
    setBoatLength('');
    setBoatGuests('');
    setBoatCabins('');
    setBoatServiceModels([]);
    setBoatImages(['', '', '', '']);
    setBoatVideo('');
    setBoatPrice('');
    setIsBoatFormOpen(false);
    setEditingBoatId(null);
  };

  const handleEditBoat = (boat: Boat) => {
    const images = boat.images || [];
    const serviceModelIds = boat.serviceModelIds || [];
    
    setBoatName(boat.name);
    setBoatType(boat.type);
    setBoatLength(boat.length.toString());
    setBoatGuests(boat.guests.toString());
    setBoatCabins(boat.cabins.toString());
    setBoatServiceModels(serviceModelIds);
    setBoatImages([...images, ...Array(4 - images.length).fill('')].slice(0, 4));
    setBoatVideo(boat.videoUrl || '');
    setBoatPrice(boat.price.toString());
    setEditingBoatId(boat.id);
    setIsBoatFormOpen(true);
  };

  const deleteBoat = async (id: string) => {
    if (window.confirm('Bu tekneyi silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting boat:', error);
        alert('Tekne silinirken bir hata oluştu.');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingIdx(index);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('Tekneler')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('Tekneler')
        .getPublicUrl(fileName);
      
      const newImages = [...boatImages];
      newImages[index] = publicUrl;
      setBoatImages(newImages);
    } catch (error: any) {
      console.error("Full Upload Error Object:", error);
      alert(`Resim yüklenemedi: ${error.message || 'Bilinmeyen hata'}\n\nLütfen Supabase SQL Editor'da Storage politikalarını (Policy) ayarladığınızdan emin olun.`);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRouteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingRouteIdx(index);
      const fileExt = file.name.split('.').pop();
      const fileName = `route_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('Tekneler') // Reusing the same bucket for routes
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('Tekneler')
        .getPublicUrl(fileName);
      
      const newImages = [...routeImages];
      newImages[index] = publicUrl;
      setRouteImages(newImages);
    } catch (error: any) {
      console.error("Route Upload Error:", error);
      alert(`Resim yüklenemedi: ${error.message}`);
    } finally {
      setUploadingRouteIdx(null);
    }
  };

  const addRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName) return;
    
    const routeData = {
      name: routeName,
      description: routeDesc,
      images: routeImages.filter(img => img !== '')
    };

    if (editingRouteId) {
      const { error } = await supabase
        .from('routes')
        .update(routeData)
        .eq('id', editingRouteId);
      
      if (error) {
        console.error('Error updating route:', error);
        alert('Rota güncellenirken bir hata oluştu.');
        return;
      }
    } else {
      const { error } = await supabase
        .from('routes')
        .insert([routeData]);
      
      if (error) {
        console.error('Error adding route:', error);
        alert('Rota eklenirken bir hata oluştu.');
        return;
      }
    }

    setRouteName('');
    setRouteDesc('');
    setRouteImages(['', '', '', '']);
    setIsRouteFormOpen(false);
    setEditingRouteId(null);
  };

  const handleEditRoute = (route: Route) => {
    setRouteName(route.name);
    setRouteDesc(route.description);
    setRouteImages([...route.images, ...Array(4 - route.images.length).fill('')].slice(0, 4));
    setEditingRouteId(route.id);
    setIsRouteFormOpen(true);
  };

  const deleteRoute = async (id: string) => {
    if (window.confirm('Bu rotayı silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting route:', error);
        alert('Rota silinirken bir hata oluştu.');
      }
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <Ship className="w-16 h-16 text-[#00ADB5] mx-auto mb-6" />
          <h1 className="text-2xl font-serif mb-2 text-center">Pacific Yacht Lines Admin</h1>
          <p className="text-gray-600 mb-8 text-center">Kullanıcı adı ve şifrenizle giriş yapın.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-[#0A192F] text-white py-3 rounded-md hover:bg-[#00ADB5] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoginLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
          <button 
            onClick={onBack}
            className="w-full mt-4 text-gray-500 text-sm hover:underline"
          >
            Siteye Geri Dön
          </button>
        </div>
      </div>
    );
  }


  // Admin Email Check
  const isAdmin = user?.email === 'pacificyacht.48@gmail.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F] p-6">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-serif mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-8">
            Bu e-pota adresi ile panel erişimi yetkiniz bulunmamaktadır: <br/>
            <span className="font-semibold text-[#0A192F]">{user?.email}</span>
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleLogout}
              className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Farklı Hesapla Giriş Yap
            </button>
            <button 
              onClick={onBack}
              className="w-full bg-[#0A192F] text-white py-2 rounded-md hover:bg-[#00ADB5] transition-colors"
            >
              Siteye Dön
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A192F] text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Ship className="text-[#00ADB5]" />
          <span className="font-serif text-xl tracking-wider">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} /> Panel Özeti
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${activeTab === 'bookings' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3"><UserIcon size={20} /> Rezervasyonlar</div>
            {bookings.filter(b => b.status === 'Yeni').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {bookings.filter(b => b.status === 'Yeni').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('boats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'boats' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Ship size={20} /> Tekneler
          </button>
          <button 
            onClick={() => setActiveTab('routes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'routes' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <MapPin size={20} /> Rotalar
          </button>

          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4 border-b border-gray-800 pb-2 mb-2">Data Girişi</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'services' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Settings size={20} /> Hizmet Modelleri
          </button>
          <button 
            onClick={() => setActiveTab('boat-types')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'boat-types' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Ship size={20} /> Tekne Tipi
          </button>
          <button 
            onClick={() => setActiveTab('extra-services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'extra-services' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Plus size={20} /> Ek Hizmetler
          </button>
          <button 
            onClick={() => setActiveTab('headings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'headings' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Settings size={20} /> Başlıklar
          </button>


          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-white/10 text-gray-400"
          >
            <ChevronRight size={20} className="rotate-180" /> Siteye Dön
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-4">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00ADB5] flex items-center justify-center text-white text-sm font-bold">
                {user.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="text-xs overflow-hidden">
              <p className="font-semibold truncate">{user.user_metadata?.full_name}</p>
              <p className="text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors text-sm"
          >
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-3xl font-serif mb-8">Panel Özeti</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#00ADB5]">
                  <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Toplam Tekne</p>
                  <p className="text-4xl font-serif">{boats.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Hizmet Modelleri</p>
                  <p className="text-4xl font-serif">{serviceModels.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                  <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Ek Hizmetler</p>
                  <p className="text-4xl font-serif">{additionalServices.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                  <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Toplam Rota</p>
                  <p className="text-4xl font-serif">{routes.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                  <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Yeni Rezervasyonlar</p>
                  <p className="text-4xl font-serif">{bookings.filter(b => b.status === 'Yeni').length}</p>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Rezervasyonlar</h2>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                        <th className="p-4 border-b">Tarih</th>
                        <th className="p-4 border-b">Müşteri</th>
                        <th className="p-4 border-b">Plan & Tercihler</th>
                        <th className="p-4 border-b">Tutar</th>
                        <th className="p-4 border-b">Durum</th>
                        <th className="p-4 border-b text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Henüz rezervasyon bulunmuyor.</td></tr>
                      ) : bookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 align-top">
                            <div className="text-sm font-medium">{new Date(booking.created_at).toLocaleDateString('tr-TR')}</div>
                            <div className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="font-semibold text-[#0A192F]">{booking.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={12}/> {booking.phone}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail size={12}/> {booking.email}</div>
                            <div className="text-xs text-blue-500 capitalize mt-1">İletişim: {booking.contact_method}</div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="text-sm mb-1"><span className="text-gray-500">Tekne:</span> {booking.boat_type || '-'}</div>
                            <div className="text-sm mb-1"><span className="text-gray-500">Hizmet:</span> {booking.service || '-'}</div>
                            <div className="text-sm mb-1"><span className="text-gray-500">Süre:</span> {booking.duration || '-'}</div>
                            {booking.date && <div className="text-sm"><span className="text-gray-500">Tarih:</span> {new Date(booking.date).toLocaleDateString('tr-TR')}</div>}
                          </td>
                          <td className="p-4 font-serif text-[#D4AF37] align-top whitespace-nowrap">
                            {booking.estimated_price ? `€${booking.estimated_price.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-4 align-top">
                            <select 
                              value={booking.status}
                              onChange={async (e) => {
                                await supabase.from('bookings').update({ status: e.target.value }).eq('id', booking.id);
                              }}
                              className={`text-xs font-semibold px-3 py-1 rounded-full outline-none cursor-pointer border-none
                                ${booking.status === 'Yeni' ? 'bg-orange-100 text-orange-700' : 
                                  booking.status === 'İletişime Geçildi' ? 'bg-blue-100 text-blue-700' : 
                                  booking.status === 'Onaylandı' ? 'bg-green-100 text-green-700' : 
                                  'bg-red-100 text-red-700'
                                }
                              `}
                            >
                              <option value="Yeni">Yeni</option>
                              <option value="İletişime Geçildi">İletişime Geçildi</option>
                              <option value="Onaylandı">Onaylandı</option>
                              <option value="İptal">İptal</option>
                            </select>
                          </td>
                          <td className="p-4 text-right align-top">
                            <button 
                              onClick={async () => {
                                if (window.confirm('Bu rezervasyonu sistemden silmek istediğinize emin misiniz?')) {
                                  await supabase.from('bookings').delete().eq('id', booking.id);
                                }
                              }}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center justify-center ml-auto"
                              title="Sil"
                            >
                              <Trash2 size={16} />
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

          {activeTab === 'services' && (
            <motion.div 
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Hizmet Modelleri</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                  <form onSubmit={addServiceModel} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        {editingServiceId ? 'Hizmet Modeli Düzenle' : 'Yeni Hizmet Modeli'}
                      </h3>
                      {editingServiceId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingServiceId(null);
                            setServiceName('');
                            setServiceDesc('');
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model Adı</label>
                      <input 
                        type="text" 
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                        placeholder="Örn: Haftalık Konaklamalı"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <select 
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value as any)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                      >
                        <option value="Günübirlik">Günübirlik</option>
                        <option value="Birden Çok Gün">Birden Çok Gün</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea 
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#0A192F] text-white py-2 rounded-md hover:bg-[#00ADB5] transition-colors flex items-center justify-center gap-2">
                      {editingServiceId ? <Edit2 size={18} /> : <Plus size={18} />}
                      {editingServiceId ? 'Güncelle' : 'Ekle'}
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  {serviceModels.map(service => (
                    <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold shadow-sm ${service.category === 'Birden Çok Gün' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {service.category || 'Günübirlik'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteServiceModel(service.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'boat-types' && (
            <motion.div 
              key="boat-types"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Tekne Tipleri</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                  <form onSubmit={addBoatType} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        {editingBoatTypeId ? 'Tekne Tipi Düzenle' : 'Yeni Tekne Tipi'}
                      </h3>
                      {editingBoatTypeId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingBoatTypeId(null);
                            setBoatTypeName('');
                            setBoatTypeDesc('');
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tip Adı</label>
                      <input 
                        type="text" 
                        value={boatTypeName}
                        onChange={(e) => setBoatTypeName(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                        placeholder="Örn: Motor Yacht, Gulet"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea 
                        value={boatTypeDesc}
                        onChange={(e) => setBoatTypeDesc(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#0A192F] text-white py-2 rounded-md hover:bg-[#00ADB5] transition-colors flex items-center justify-center gap-2">
                      {editingBoatTypeId ? <Edit2 size={18} /> : <Plus size={18} />}
                      {editingBoatTypeId ? 'Güncelle' : 'Ekle'}
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  {boatTypes.map(type => (
                    <div key={type.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{type.name}</h4>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditBoatType(type)}
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteBoatType(type.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'extra-services' && (
            <motion.div 
              key="extra-services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Ek Hizmetler</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                  <form onSubmit={addAdditionalService} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        {editingExtraId ? 'Ek Hizmet Düzenle' : 'Yeni Ek Hizmet'}
                      </h3>
                      {editingExtraId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingExtraId(null);
                            setExtraName('');
                            setExtraDesc('');
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet Adı</label>
                      <input 
                        type="text" 
                        value={extraName}
                        onChange={(e) => setExtraName(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                        placeholder="Örn: Havaalanı Transferi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea 
                        value={extraDesc}
                        onChange={(e) => setExtraDesc(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#0A192F] text-white py-2 rounded-md hover:bg-[#00ADB5] transition-colors flex items-center justify-center gap-2">
                      {editingExtraId ? <Edit2 size={18} /> : <Plus size={18} />}
                      {editingExtraId ? 'Güncelle' : 'Ekle'}
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  {additionalServices.map(extra => (
                    <div key={extra.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{extra.name}</h4>
                        <p className="text-sm text-gray-500">{extra.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditExtra(extra)}
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteAdditionalService(extra.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'boats' && (
            <motion.div 
              key="boats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Tekneler</h2>
                <button 
                  onClick={() => {
                    if (isBoatFormOpen) {
                      setEditingBoatId(null);
                      setBoatName('');
                      setBoatLength('');
                      setBoatGuests('');
                      setBoatCabins('');
                      setBoatServiceModels([]);
                      setBoatImages(['', '', '', '']);
                      setBoatVideo('');
                      setBoatPrice('');
                    }
                    setIsBoatFormOpen(!isBoatFormOpen);
                  }}
                  className="bg-[#0A192F] text-white px-6 py-2 rounded-md hover:bg-[#00ADB5] transition-colors flex items-center gap-2"
                >
                  {isBoatFormOpen ? <X size={18} /> : <Plus size={18} />}
                  {isBoatFormOpen ? 'İptal' : 'Yeni Tekne'}
                </button>
              </div>
              
              <AnimatePresence>
                {isBoatFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-12"
                  >
                    <form onSubmit={addBoat} className="bg-white p-8 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          {editingBoatId ? 'Tekne Düzenle' : 'Temel Bilgiler'}
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tekne Adı</label>
                          <input 
                            type="text" 
                            value={boatName}
                            onChange={(e) => setBoatName(e.target.value)}
                            className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tekne Tipi</label>
                            <select 
                              value={boatType}
                              onChange={(e) => setBoatType(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                            >
                              <option>Motor Yat</option>
                              <option>Gulet</option>
                              <option>Katamaran</option>
                              <option>Yelkenli</option>
                              <option>Trawler</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet Modelleri (Çoklu Seçim)</label>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50">
                              {serviceModels.map(s => (
                                <label key={s.id} className="flex items-center gap-3 text-sm cursor-pointer bg-white p-2.5 rounded-md border border-gray-200 hover:border-[#00ADB5] hover:shadow-sm transition-all">
                                  <input 
                                    type="checkbox"
                                    checked={boatServiceModels.includes(s.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setBoatServiceModels([...boatServiceModels, s.id]);
                                      } else {
                                        setBoatServiceModels(boatServiceModels.filter(id => id !== s.id));
                                      }
                                    }}
                                    className="accent-[#00ADB5] w-5 h-5 shrink-0"
                                  />
                                  <span className="font-medium text-gray-700 leading-tight">{s.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Uzunluk (m)</label>
                            <input 
                              type="number" 
                              value={boatLength}
                              onChange={(e) => setBoatLength(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Misafir</label>
                            <input 
                              type="number" 
                              value={boatGuests}
                              onChange={(e) => setBoatGuests(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kabin</label>
                            <input 
                              type="number" 
                              value={boatCabins}
                              onChange={(e) => setBoatCabins(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ücret (€)</label>
                            <div className="relative">
                              <Euro className="absolute left-2 top-2.5 text-gray-400" size={16} />
                              <input 
                                type="number" 
                                value={boatPrice}
                                onChange={(e) => setBoatPrice(e.target.value)}
                                className="w-full p-2 pl-8 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Medya Bilgileri</h3>
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">Resimler (4 Adet) - İlk resim ana görseldir</label>
                          <div className="grid grid-cols-2 gap-4">
                            {boatImages.map((url, idx) => (
                              <div key={idx} className="relative aspect-video bg-gray-100 rounded-md border-2 border-dashed border-gray-300 overflow-hidden group">
                                {url ? (
                                  <>
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newImgs = [...boatImages];
                                        newImgs[idx] = '';
                                        setBoatImages(newImgs);
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X size={12} />
                                    </button>
                                  </>
                                ) : (
                                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                    {uploadingIdx === idx ? (
                                      <Loader2 className="w-6 h-6 text-[#00ADB5] animate-spin" />
                                    ) : (
                                      <>
                                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Yükle</span>
                                      </>
                                    )}
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, idx)}
                                      className="hidden"
                                      disabled={uploadingIdx !== null}
                                    />
                                  </label>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                          <div className="relative">
                            <Video className="absolute left-2 top-2.5 text-gray-400" size={16} />
                            <input 
                              type="url" 
                              value={boatVideo}
                              onChange={(e) => setBoatVideo(e.target.value)}
                              className="w-full p-2 pl-8 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                              placeholder="YouTube/Vimeo URL"
                            />
                          </div>
                        </div>
                        <div className="pt-4">
                          <button type="submit" className="w-full bg-[#0A192F] text-white py-4 rounded-md hover:bg-[#00ADB5] transition-all font-semibold uppercase tracking-widest shadow-lg">
                            {editingBoatId ? 'Değişiklikleri Kaydet' : 'Tekneyi Kaydet'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boats List */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boats.map(boat => (
                    <div key={boat.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={(boat.images && boat.images[0]) || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800'} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditBoat(boat)}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteBoat(boat.id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif text-lg">{boat.name}</h4>
                          <span className="text-[#00ADB5] font-semibold">€{(boat.price || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{boat.type}</span>
                          <span>•</span>
                          <span>{boat.length}m</span>
                          <span>•</span>
                          <span>{boat.guests} Misafir</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'routes' && (
            <motion.div 
              key="routes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Rotalar</h2>
                <button 
                  onClick={() => {
                    if (isRouteFormOpen) {
                      setEditingRouteId(null);
                      setRouteName('');
                      setRouteDesc('');
                      setRouteImages(['', '', '', '']);
                    }
                    setIsRouteFormOpen(!isRouteFormOpen);
                  }}
                  className="bg-[#0A192F] text-white px-6 py-2 rounded-md hover:bg-[#00ADB5] transition-colors flex items-center gap-2"
                >
                  {isRouteFormOpen ? <X size={18} /> : <Plus size={18} />}
                  {isRouteFormOpen ? 'İptal' : 'Yeni Rota'}
                </button>
              </div>

              <AnimatePresence>
                {isRouteFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-12"
                  >
                    <form onSubmit={addRoute} className="bg-white p-8 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          {editingRouteId ? 'Rota Düzenle' : 'Rota Bilgileri'}
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rota Adı</label>
                          <input 
                            type="text" 
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                          <textarea 
                            value={routeDesc}
                            onChange={(e) => setRouteDesc(e.target.value)}
                            className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#00ADB5]"
                            rows={3}
                          />
                        </div>
                        <div className="pt-4">
                          <button type="submit" className="w-full bg-[#0A192F] text-white py-4 rounded-md hover:bg-[#00ADB5] transition-all font-semibold uppercase tracking-widest shadow-lg">
                            {editingRouteId ? 'Değişiklikleri Kaydet' : 'Rotayı Kaydet'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Rota Görselleri (4 Adet)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {routeImages.map((url, idx) => (
                            <div key={idx} className="relative aspect-video bg-gray-100 rounded-md border-2 border-dashed border-gray-300 overflow-hidden group">
                              {url ? (
                                <>
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newImgs = [...routeImages];
                                      newImgs[idx] = '';
                                      setRouteImages(newImgs);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                  {uploadingRouteIdx === idx ? (
                                    <Loader2 className="w-6 h-6 text-[#00ADB5] animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Yükle</span>
                                    </>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleRouteImageUpload(e, idx)}
                                    className="hidden"
                                    disabled={uploadingRouteIdx !== null}
                                  />
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map(route => (
                  <div key={route.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={(route.images && route.images[0]) || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditRoute(route)}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteRoute(route.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-serif text-lg mb-1">{route.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{route.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'headings' && (
            <motion.div 
              key="headings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Başlıklar ve Görünürlük</h2>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Ana Sayfa Bölüm Ayarları</h3>
                    <p className="text-sm text-blue-700">Ana sayfadaki bölümlerin başlıklarını düzenleyebilir ve görünürlüklerini açıp kapatabilirsiniz.</p>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {headings.length === 0 ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Başlıklar yükleniyor...</p>
                      <button 
                        onClick={async () => {
                          const initialHeadings = [
                            { key: 'hero', title_tr: 'Sınırların Ötesinde Bir Tatil', title_en: 'A Vacation Beyond Boundaries', is_active: true },
                            { key: 'aboutUs', title_tr: 'Hakkımızda', title_en: 'About Us', is_active: true },
                            { key: 'fleet', title_tr: 'Filo', title_en: 'Fleet', is_active: true },
                            { id: 'services', key: 'services', title_tr: 'Hizmetler', title_en: 'Services', is_active: true },
                            { key: 'destinations', title_tr: 'Rotalar', title_en: 'Routes', is_active: true }
                          ];
                          await supabase.from('headings').insert(initialHeadings);
                        }}
                        className="mt-4 text-[#00ADB5] hover:underline text-sm"
                      >
                        Varsayılan Başlıkları Oluştur
                      </button>
                    </div>
                  ) : headings.map(heading => (
                    <div key={heading.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#00ADB5] bg-blue-50 px-2 py-1 rounded">
                              Bölüm: {heading.key === 'aboutUs' ? 'Hakkımızda' : 
                                      heading.key === 'fleet' ? 'Filo' : 
                                      heading.key === 'services' ? 'Hizmetler' : 
                                      heading.key === 'destinations' ? 'Rotalar' : heading.key}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Başlık (TR)</label>
                              <input 
                                type="text" 
                                defaultValue={heading.title_tr}
                                onBlur={async (e) => {
                                  if (e.target.value !== heading.title_tr) {
                                    await supabase.from('headings').update({ title_tr: e.target.value }).eq('id', heading.id);
                                  }
                                }}
                                className="w-full p-2 border border-gray-200 rounded outline-none focus:ring-2 focus:ring-[#00ADB5] text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Başlık (EN)</label>
                              <input 
                                type="text" 
                                defaultValue={heading.title_en}
                                onBlur={async (e) => {
                                  if (e.target.value !== heading.title_en) {
                                    await supabase.from('headings').update({ title_en: e.target.value }).eq('id', heading.id);
                                  }
                                }}
                                className="w-full p-2 border border-gray-200 rounded outline-none focus:ring-2 focus:ring-[#00ADB5] text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 min-w-[120px]">
                          <span className={`text-xs font-bold uppercase ${heading.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                            {heading.is_active ? 'AKTİF' : 'PASİF'}
                          </span>
                          <button 
                            onClick={async () => {
                              const newStatus = !heading.is_active;
                              
                              // Optimistik güncelleme (Hızlı geri bildirim için)
                              setHeadings(prev => prev.map(h => 
                                h.id === heading.id ? { ...h, is_active: newStatus } : h
                              ));

                              const { error } = await supabase
                                .from('headings')
                                .update({ is_active: newStatus })
                                .eq('id', heading.id);

                              if (error) {
                                console.error('Error updating status:', error);
                                // Hata durumunda eski haline geri döndür
                                setHeadings(prev => prev.map(h => 
                                  h.id === heading.id ? { ...h, is_active: !newStatus } : h
                                ));
                                alert('Durum güncellenirken bir hata oluştu.');
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${heading.is_active ? 'bg-[#00ADB5]' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${heading.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
