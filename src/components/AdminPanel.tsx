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
  Mail,
  Power,
  Compass,
  Anchor,
  Clock
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
  isActive: boolean;
}

interface Route {
  id: string;
  name: string;
  description: string;
  images: string[];
  coves?: string[];
  bestTime?: string;
  bestSeason?: string;
  history?: string;
  highlights?: string[];
  activities?: string[];
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'boats' | 'routes' | 'bookings' | 'headings'>('dashboard');
  const [serviceModels, setServiceModels] = useState<ServiceModel[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [headings, setHeadings] = useState<any[]>([]);

  // Form States
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceCategory, setServiceCategory] = useState<'Günübirlik' | 'Birden Çok Gün'>('Günübirlik');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

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

  // Route Form States
  const [routeName, setRouteName] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [routeCoves, setRouteCoves] = useState<string[]>(['', '', '']);
  const [routeBestTime, setRouteBestTime] = useState('');
  const [routeBestSeason, setRouteBestSeason] = useState('');
  const [routeHistory, setRouteHistory] = useState('');
  const [routeHighlights, setRouteHighlights] = useState<string[]>(['', '', '']);
  const [routeActivities, setRouteActivities] = useState<string[]>(['', '', '']);
  const [routeImages, setRouteImages] = useState(['', '', '', '']);
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [uploadingRouteIdx, setUploadingRouteIdx] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!user) return;
    
    // Services
    const { data: svcs } = await supabase.from('service_models').select('*').order('name');
    setServiceModels(svcs || []);

    // Boats
    const { data: bts } = await supabase.from('boats').select('*').order('name');
    setBoats((bts || []).map((b: any) => ({
      ...b,
      serviceModelIds: b.service_model_ids || [],
      images: b.images || [],
      videoUrl: b.video_url || '',
      isActive: b.is_active ?? true
    })));

    // Routes
    const { data: rts } = await supabase.from('routes').select('*').order('name');
    setRoutes((rts || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      images: r.images || [],
      coves: r.coves || [],
      bestTime: r.best_time || '',
      bestSeason: r.best_season || '',
      history: r.history || '',
      highlights: r.highlights || [],
      activities: r.activities || []
    })));

    // Bookings
    const { data: bks } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setBookings(bks || []);

    // Headings
    const { data: hds } = await supabase.from('headings').select('*').order('id');
    setHeadings(hds || []);
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const channel = supabase.channel('admin_all').on('postgres_changes', { event: '*', schema: 'public' }, fetchData).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`Hata: ${error.message}`);
    setIsLoginLoading(false);
  };

  const handleLogout = () => supabase.auth.signOut();

  // Image Upload Logic (using optimized 'uploads' bucket)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, isRoute: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      if (isRoute) setUploadingRouteIdx(index); else setUploadingIdx(index);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
      
      if (isRoute) {
        const newImages = [...routeImages];
        newImages[index] = publicUrl;
        setRouteImages(newImages);
      } else {
        const newImages = [...boatImages];
        newImages[index] = publicUrl;
        setBoatImages(newImages);
      }
    } catch (error: any) {
      alert(`Yükleme hatası: ${error.message}`);
    } finally {
      setUploadingIdx(null); setUploadingRouteIdx(null);
    }
  };

  // Boat Logic
  const addBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    const boatData = {
      name: boatName, type: boatType, length: Number(boatLength), guests: Number(boatGuests), cabins: Number(boatCabins),
      service_model_ids: boatServiceModels, images: boatImages.filter(img => img !== ''), video_url: boatVideo, price: Number(boatPrice)
    };
    const { error } = editingBoatId ? await supabase.from('boats').update(boatData).eq('id', editingBoatId) : await supabase.from('boats').insert([boatData]);
    if (error) alert('Hata: ' + error.message); else resetBoatForm();
  };

  const resetBoatForm = () => {
    setBoatName(''); setBoatLength(''); setBoatGuests(''); setBoatCabins(''); setBoatServiceModels([]); 
    setBoatImages(['', '', '', '']); setBoatVideo(''); setBoatPrice(''); setIsBoatFormOpen(false); setEditingBoatId(null);
  };

  const handleEditBoat = (boat: Boat) => {
    setBoatName(boat.name); setBoatType(boat.type); setBoatLength(boat.length.toString()); setBoatGuests(boat.guests.toString()); 
    setBoatCabins(boat.cabins.toString()); setBoatServiceModels(boat.serviceModelIds);
    setBoatImages([...boat.images, ...Array(4 - boat.images.length).fill('')].slice(0, 4));
    setBoatVideo(boat.videoUrl); setBoatPrice(boat.price.toString()); setEditingBoatId(boat.id); setIsBoatFormOpen(true);
  };

  const toggleBoatStatus = async (boatId: string, currentStatus: boolean) => {
    await supabase.from('boats').update({ is_active: !currentStatus }).eq('id', boatId);
  };

  const deleteBoat = async (id: string) => {
    if (window.confirm('Bu tekneyi silmek istediğinize emin misiniz?')) {
      await supabase.from('boats').delete().eq('id', id);
    }
  };

  // Route Logic
  const addRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const routeData = {
      name: routeName, description: routeDesc, images: routeImages.filter(img => img !== ''),
      coves: routeCoves.filter(c => c.trim() !== ''),
      best_time: routeBestTime, best_season: routeBestSeason, history: routeHistory,
      highlights: routeHighlights.filter(h => h.trim() !== ''), activities: routeActivities.filter(a => a.trim() !== '')
    };
    const { error } = editingRouteId ? await supabase.from('routes').update(routeData).eq('id', editingRouteId) : await supabase.from('routes').insert([routeData]);
    if (error) alert('Hata: ' + error.message); else resetRouteForm();
  };

  const resetRouteForm = () => {
    setRouteName(''); setRouteDesc(''); setRouteCoves(['', '', '']); setRouteBestTime(''); setRouteBestSeason(''); 
    setRouteHistory(''); setRouteHighlights(['', '', '']); setRouteActivities(['', '', '']); 
    setRouteImages(['', '', '', '']); setIsRouteFormOpen(false); setEditingRouteId(null);
  };

  const handleEditRoute = (route: Route) => {
    setRouteName(route.name); setRouteDesc(route.description); 
    setRouteImages([...route.images, ...Array(4 - route.images.length).fill('')].slice(0, 4));
    setRouteCoves(route.coves && route.coves.length > 0 ? route.coves : ['', '', '']);
    setRouteBestTime(route.bestTime || ''); setRouteBestSeason(route.bestSeason || ''); setRouteHistory(route.history || '');
    setRouteHighlights(route.highlights && route.highlights.length > 0 ? route.highlights : ['', '', '']);
    setRouteActivities(route.activities && route.activities.length > 0 ? route.activities : ['', '', '']);
    setEditingRouteId(route.id); setIsRouteFormOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="bg-white p-8 rounded shadow-2xl max-w-md w-full">
          <Ship className="w-16 h-16 text-[#00ADB5] mx-auto mb-6" />
          <h1 className="text-2xl font-serif mb-8 text-center">Pacific Yacht Lines Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded" placeholder="E-posta" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded" placeholder="Şifre" />
            <button className="w-full bg-[#0A192F] text-white py-3 rounded hover:bg-[#00ADB5] transition-all disabled:opacity-50" disabled={isLoginLoading}>Giriş Yap</button>
          </form>
          <button onClick={onBack} className="w-full mt-4 text-gray-400 text-sm">Siteye Geri Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A192F] text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Ship className="text-[#00ADB5]" /><span className="font-serif text-xl">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'dashboard' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/5'}`}><LayoutDashboard size={20}/> Özet</button>
          <button onClick={()=>setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'bookings' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/5'}`}><UserIcon size={20}/> Rezervasyonlar</button>
          <button onClick={()=>setActiveTab('boats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'boats' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/5'}`}><Ship size={20}/> Tekneler</button>
          <button onClick={()=>setActiveTab('routes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'routes' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/5'}`}><MapPin size={20}/> Rotalar</button>
          <button onClick={()=>setActiveTab('headings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'headings' ? 'bg-[#00ADB5] text-[#0A192F]' : 'hover:bg-white/5'}`}><Settings size={20}/> Başlıklar</button>
          <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 mt-10">Siteye Dön</button>
        </nav>
        <div className="p-4 border-t border-gray-800"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded"><LogOut size={18}/> Çıkış</button></div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'routes' && (
            <motion.div key="routes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Rotalar</h2>
                <button onClick={()=>isRouteFormOpen ? resetRouteForm() : setIsRouteFormOpen(true)} className="bg-[#0A192F] text-white px-6 py-2 rounded flex items-center gap-2">{isRouteFormOpen ? <X size={18}/> : <Plus size={18}/>} {isRouteFormOpen ? 'İptal' : 'Yeni Rota'}</button>
              </div>

              {isRouteFormOpen && (
                <div className="bg-white p-8 rounded shadow-sm mb-12 border">
                  <form onSubmit={addRoute} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold border-b pb-2">Temel Bilgiler</h3>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">Rota Adı</label><input type="text" value={routeName} onChange={e=>setRouteName(e.target.value)} className="w-full p-2 border rounded" required /></div>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">Açıklama</label><textarea value={routeDesc} onChange={e=>setRouteDesc(e.target.value)} className="w-full p-2 border rounded" rows={3} /></div>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">Tarihçe</label><textarea value={routeHistory} onChange={e=>setRouteHistory(e.target.value)} className="w-full p-2 border rounded" rows={3} /></div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold border-b pb-2">Planlama Detayları</h3>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">En İyi Zaman</label><input type="text" value={routeBestTime} onChange={e=>setRouteBestTime(e.target.value)} className="w-full p-2 border rounded" placeholder="Örn: Haziran - Ağustos" /></div>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">Mevsim</label><input type="text" value={routeBestSeason} onChange={e=>setRouteBestSeason(e.target.value)} className="w-full p-2 border rounded" placeholder="Örn: Yaz Sezonu" /></div>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">Popüler Koylar (Satır satır veya virgülle ayırın)</label><textarea value={routeCoves.join('\n')} onChange={e=>setRouteCoves(e.target.value.split(/[\n,]/).filter(s=>s.trim()))} className="w-full p-2 border rounded text-sm" rows={4} /></div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold border-b pb-2">Öne Çıkanlar & Medya</h3>
                      <div><label className="text-xs text-gray-400 font-bold uppercase">Öne Çıkan Özellikler</label><textarea value={routeHighlights.join('\n')} onChange={e=>setRouteHighlights(e.target.value.split(/[\n,]/).filter(s=>s.trim()))} className="w-full p-2 border rounded text-sm" rows={2} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        {routeImages.map((url, idx) => (
                          <div key={idx} className="aspect-video bg-gray-50 border border-dashed rounded relative overflow-hidden flex items-center justify-center">
                            {url ? <><img src={url} className="w-full h-full object-cover" /><button onClick={()=>{const n=[...routeImages]; n[idx]=''; setRouteImages(n);}} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10}/></button></> : <label className="cursor-pointer">{uploadingRouteIdx === idx ? <Loader2 className="animate-spin"/> : <Upload size={16}/><input type="file" className="hidden" onChange={e=>handleFileUpload(e, idx, true)}/></label>}
                          </div>
                        ))}
                      </div>
                      <button type="submit" className="w-full bg-[#0A192F] text-white py-4 rounded font-bold uppercase tracking-widest mt-4 hover:bg-[#00ADB5] transition-all shadow-lg">{editingRouteId ? 'Güncelle' : 'Kaydet'}</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map(route => (
                  <div key={route.id} className="bg-white rounded shadow-sm border overflow-hidden group">
                    <div className="h-48 relative overflow-hidden">
                      <img src={route.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={()=>handleEditRoute(route)} className="bg-white text-[#0A192F] p-3 rounded-full hover:bg-[#D4AF37] transition-all"><Edit2 size={18}/></button>
                        <button onClick={()=> {if(window.confirm('Emin misiniz?')) supabase.from('routes').delete().eq('id', route.id)}} className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 transition-all"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <div className="p-4"><h3 className="font-serif text-lg">{route.name}</h3><p className="text-xs text-gray-500 line-clamp-1">{route.description}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-serif mb-8">Rezervasyonlar</h2>
              <div className="bg-white rounded border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold border-b">
                    <tr><th className="p-4">Tarih</th><th className="p-4">Müşteri</th><th className="p-4">Hizmet Detayı</th><th className="p-4">Durum</th><th className="p-4">İşlem</th></tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="p-4">{new Date(b.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="p-4 font-bold">{b.name}<br/><span className="text-xs font-normal text-gray-500">{b.phone}</span></td>
                        <td className="p-4">{b.service} - {b.boat_type}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${b.status === 'Yeni' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{b.status}</span></td>
                        <td className="p-4">
                          <button onClick={async ()=>{if(window.confirm('Onaylıyor musunuz?')) await supabase.from('bookings').update({status:'Onaylandı'}).eq('id', b.id)}} className="text-blue-500 mr-4">Onayla</button>
                          <button onClick={async ()=>{if(window.confirm('Siliyorsunuz?')) await supabase.from('bookings').delete().eq('id', b.id)}} className="text-red-500"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'boats' && (
            <motion.div key="boats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif">Tekneler</h2>
                <button onClick={()=>isBoatFormOpen ? resetBoatForm() : setIsBoatFormOpen(true)} className="bg-[#0A192F] text-white px-6 py-2 rounded flex items-center gap-2">{isBoatFormOpen ? <X size={18}/> : <Plus size={18}/>} Yeni Tekne</button>
              </div>
              {isBoatFormOpen && (
                <div className="bg-white p-8 rounded shadow-sm mb-12 border">
                  <form onSubmit={addBoat} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <input value={boatName} onChange={e=>setBoatName(e.target.value)} placeholder="Tekne Adı" className="w-full p-2 border rounded" required />
                       <select value={boatType} onChange={e=>setBoatType(e.target.value)} className="w-full p-2 border rounded">
                         <option>Motor Yat</option><option>Gulet</option><option>Katamaran</option><option>Yelkenli</option>
                       </select>
                       <div className="grid grid-cols-3 gap-2">
                         <input value={boatLength} onChange={e=>setBoatLength(e.target.value)} placeholder="m" className="p-2 border rounded" />
                         <input value={boatGuests} onChange={e=>setBoatGuests(e.target.value)} placeholder="Misafir" className="p-2 border rounded" />
                         <input value={boatPrice} onChange={e=>setBoatPrice(e.target.value)} placeholder="€" className="p-2 border rounded" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-2">
                         {boatImages.map((u, i) => (
                           <div key={i} className="aspect-video bg-gray-50 border border-dashed rounded relative flex items-center justify-center">
                             {u ? <img src={u} className="w-full h-full object-cover" /> : <label className="cursor-pointer">{uploadingIdx === i ? <Loader2 className="animate-spin"/> : <Upload size={16}/><input type="file" className="hidden" onChange={e=>handleFileUpload(e, i)}/></label>}
                           </div>
                         ))}
                       </div>
                       <button className="w-full bg-[#0A192F] text-white py-4 font-bold uppercase tracking-widest">{editingBoatId ? 'Güncelle' : 'Kaydet'}</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boats.map(boat => (
                  <div key={boat.id} className="bg-white rounded shadow-sm border overflow-hidden">
                    <div className="h-48 relative overflow-hidden">
                      <img src={boat.images?.[0] || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800'} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={()=>handleEditBoat(boat)} className="bg-blue-500 text-white p-2 rounded"><Edit2 size={16}/></button>
                        <button onClick={()=>toggleBoatStatus(boat.id, boat.isActive)} className={`p-2 rounded ${boat.isActive ? 'bg-green-500' : 'bg-gray-400'} text-white`}><Power size={16}/></button>
                        <button onClick={()=>deleteBoat(boat.id)} className="bg-red-500 text-white p-2 rounded"><Trash2 size={16}/></button>
                      </div>
                    </div>
                    <div className="p-4"><h3 className="font-serif text-lg">{boat.name}</h3><p className="text-xs text-[#00ADB5] font-bold">€{(boat.price || 0).toLocaleString()}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'headings' && <div className="text-2xl font-serif">Başlık ve Görünürlük Ayarları Gelecek...</div>}
          {activeTab === 'dashboard' && <div className="bg-white p-12 rounded shadow-sm border text-center font-serif text-2xl text-gray-400">Hoş Geldiniz, Pacific Yacht Admin</div>}
        </AnimatePresence>
      </div>
    </div>
  );
};
