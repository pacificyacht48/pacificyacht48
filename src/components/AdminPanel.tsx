import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { db, auth, storage } from '../firebase';
import { supabase } from '../lib/supabase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  Edit2
} from 'lucide-react';

const provider = new GoogleAuthProvider();

interface ServiceModel {
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

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'boats' | 'extra-services'>('dashboard');
  const [serviceModels, setServiceModels] = useState<ServiceModel[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  
  // Form States
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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

    // Set up real-time subscription for Supabase
    const serviceChannel = supabase
      .channel('admin_service_models')
      .on('postgres_changes', { event: '*', table: 'service_models', schema: 'public' }, () => {
        fetchServices();
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

    return () => {
      supabase.removeChannel(serviceChannel);
      supabase.removeChannel(extraChannel);
      supabase.removeChannel(boatChannel);
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const addServiceModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) return;
    
    if (editingServiceId) {
      const { error } = await supabase
        .from('service_models')
        .update({ name: serviceName, description: serviceDesc })
        .eq('id', editingServiceId);

      if (error) {
        console.error('Error updating service model:', error);
        alert('Hizmet modeli güncellenirken bir hata oluştu.');
      } else {
        setServiceName('');
        setServiceDesc('');
        setEditingServiceId(null);
      }
    } else {
      const { error } = await supabase
        .from('service_models')
        .insert([{ name: serviceName, description: serviceDesc }]);

      if (error) {
        console.error('Error adding service model:', error);
        alert('Hizmet modeli eklenirken bir hata oluştu.');
      } else {
        setServiceName('');
        setServiceDesc('');
      }
    }
  };

  const handleEditService = (service: ServiceModel) => {
    setServiceName(service.name);
    setServiceDesc(service.description);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <Ship className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
          <h1 className="text-2xl font-serif mb-4">Pacific Yachting Admin</h1>
          <p className="text-gray-600 mb-8">Lütfen yönetici girişi yapın.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-[#0A192F] text-white py-3 rounded-md hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2"
          >
            Google ile Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A192F] text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Ship className="text-[#D4AF37]" />
          <span className="font-serif text-xl tracking-wider">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-[#D4AF37] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} /> Panel Özeti
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'services' ? 'bg-[#D4AF37] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Settings size={20} /> Hizmet Modelleri
          </button>
          <button 
            onClick={() => setActiveTab('extra-services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'extra-services' ? 'bg-[#D4AF37] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Plus size={20} /> Ek Hizmetler
          </button>
          <button 
            onClick={() => setActiveTab('boats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === 'boats' ? 'bg-[#D4AF37] text-[#0A192F]' : 'hover:bg-white/10'}`}
          >
            <Ship size={20} /> Tekneler
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
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full" />
            <div className="text-xs overflow-hidden">
              <p className="font-semibold truncate">{user.displayName}</p>
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
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#D4AF37]">
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
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="Örn: Haftalık Konaklamalı"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea 
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#0A192F] text-white py-2 rounded-md hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2">
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
                        <h4 className="font-semibold">{service.name}</h4>
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
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="Örn: Havaalanı Transferi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea 
                        value={extraDesc}
                        onChange={(e) => setExtraDesc(e.target.value)}
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#0A192F] text-white py-2 rounded-md hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2">
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
                  className="bg-[#0A192F] text-white px-6 py-2 rounded-md hover:bg-[#D4AF37] transition-colors flex items-center gap-2"
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
                            className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tekne Tipi</label>
                            <select 
                              value={boatType}
                              onChange={(e) => setBoatType(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
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
                                <label key={s.id} className="flex items-center gap-3 text-sm cursor-pointer bg-white p-2.5 rounded-md border border-gray-200 hover:border-[#D4AF37] hover:shadow-sm transition-all">
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
                                    className="accent-[#D4AF37] w-5 h-5 shrink-0"
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
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Misafir</label>
                            <input 
                              type="number" 
                              value={boatGuests}
                              onChange={(e) => setBoatGuests(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kabin</label>
                            <input 
                              type="number" 
                              value={boatCabins}
                              onChange={(e) => setBoatCabins(e.target.value)}
                              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
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
                                className="w-full p-2 pl-8 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
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
                                      <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
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
                              className="w-full p-2 pl-8 border rounded-md outline-none focus:ring-2 focus:ring-[#D4AF37]"
                              placeholder="YouTube/Vimeo URL"
                            />
                          </div>
                        </div>
                        <div className="pt-4">
                          <button type="submit" className="w-full bg-[#0A192F] text-white py-4 rounded-md hover:bg-[#D4AF37] transition-all font-semibold uppercase tracking-widest shadow-lg">
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
                          <span className="text-[#D4AF37] font-semibold">€{(boat.price || 0).toLocaleString()}</span>
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
        </AnimatePresence>
      </div>
    </div>
  );
};
