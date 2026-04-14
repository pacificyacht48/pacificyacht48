import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Anchor, CheckCircle2, Award, Users, Ship, Star, ArrowLeft } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
  lang: string;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onBack, lang }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-[100] bg-[#F5F2ED] overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-[110] bg-[#0A192F]/95 backdrop-blur-md px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-widest hidden md:inline">Geri</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
           <img 
              src="https://hwggdexxphmwqqoifrvv.supabase.co/storage/v1/object/public/Logo/pacific%20logo.png" 
              alt="Pacific Yacht Lines" 
              className="h-10 object-contain"
            />
        </div>
        <div className="w-20"></div> {/* Spacer for balance */}
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* SEO Optimized Content */}
        <article className="prose prose-slate max-w-none">
          <header className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif text-[#0A192F] mb-6"
            >
              Pacific Yacht Lines – Hakkımızda
            </motion.h1>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed italic">
              "Denizcilik tutkusunu yılların kurumsal deneyimiyle birleştiren güçlü bir marka."
            </p>
          </header>

          <section className="space-y-12">
            <div className="bg-white p-8 md:p-12 shadow-xl border-l-4 border-[#D4AF37] rounded-sm">
              <p className="text-lg text-gray-700 leading-relaxed mb-6 font-medium">
                Pacific Yacht Lines, Türkiye’nin köklü kuruluşlarından <span className="text-[#0A192F] font-bold">Akartaş Holding</span> ve hizmet sektöründe fark yaratan <span className="text-[#0A192F] font-bold">So Big Group</span> iştirakidir.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Bu iki büyük yapının hizmet kalitesi ve müşteri deneyimi konusundaki uzmanlığı, Pacific Yacht Lines ile denizlere taşınmıştır.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-[#0A192F]">Bodrum’da Lüks Yat Kiralama Deneyimi</h2>
                <p className="text-gray-600 leading-relaxed">
                   Ege’nin en gözde destinasyonlarından biri olan Bodrum’da, <strong>lüks yat kiralama Bodrum</strong>, <strong>günlük yat kiralama Bodrum</strong> ve <strong>haftalık yat kiralama Bodrum</strong> hizmetlerimizle misafirlerimize unutulmaz bir deneyim sunuyoruz.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Pacific Yacht Lines olarak amacımız yalnızca bir yat kiralama hizmeti sunmak değil; misafirlerimize denizde ayrıcalıklı bir yaşam deneyimi yaşatmaktır.
                </p>
              </div>
              <div className="relative">
                 <img 
                    src="https://hwggdexxphmwqqoifrvv.supabase.co/storage/v1/object/public/Tekneler/1776190715162_3l3jo5.JPG" 
                    alt="Bodrum Yat Kiralama" 
                    className="rounded-sm shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-[#D4AF37] p-6 text-white hidden md:block">
                    <Award className="w-10 h-10" />
                  </div>
              </div>
            </div>

            <div className="bg-[#0A192F] text-white p-10 md:p-16 rounded-sm relative overflow-hidden">
              <Anchor className="absolute -top-10 -left-10 w-40 h-40 text-white/5" />
              <h2 className="text-3xl font-serif mb-8 text-center">Deneyimimizi Denizlere Taşıyoruz</h2>
              <p className="text-gray-300 text-center mb-10 max-w-2xl mx-auto">
                Akartaş Holding ve So Big Group’un yıllara dayanan tecrübesi Pacific Yacht Lines çatısı altında birleşerek Bodrum yat kiralama sektörüne yeni bir standart kazandırmaktadır.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Üst Düzey Hizmet", icon: <Ship className="w-6 h-6 text-[#D4AF37]" /> },
                  { title: "Misafir Odaklılık", icon: <Users className="w-6 h-6 text-[#D4AF37]" /> },
                  { title: "Gastronomi Uzmanlığı", icon: <Star className="w-6 h-6 text-[#D4AF37]" /> }
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      {item.icon}
                    </div>
                    <span className="block font-semibold tracking-wide uppercase text-xs">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-serif text-[#0A192F] text-center">Hizmetlerimiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Günlük yat kiralama (Bodrum koyları turu)",
                  "Haftalık lüks yat kiralama",
                  "Özel etkinlik ve organizasyonlar",
                  "Doğum günü, Nişan / evlilik teklifi",
                  "Kurumsal davetler",
                  "Şefli yemek hizmetleri ve özel menüler",
                  "Su sporları ve eğlence aktiviteleri"
                ].map((service, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-4 border border-gray-100 shadow-sm rounded-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F5F2ED] border-2 border-dashed border-[#D4AF37] p-8 md:p-12 text-center">
              <h2 className="text-3xl font-serif text-[#0A192F] mb-8">Neden Pacific Yacht Lines?</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "Kurumsal güç: Akartaş Holding & So Big Group güvencesi",
                  "Premium hizmet anlayışı",
                  "Modern ve bakımlı yat filosu",
                  "Kişiye özel planlama",
                  "Bodrum’un en özel koylarında deneyim"
                ].map((item, i) => (
                  <span key={i} className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm">
                    ✅ {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center pt-12 space-y-6">
              <h2 className="text-3xl font-serif text-[#0A192F]">Bodrum Yat Kiralama’da Doğru Adres</h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Eğer siz de Bodrum’da yat kiralama, <strong>lüks yat kiralama Bodrum fiyatları</strong> veya özel yat turu organizasyonu arıyorsanız, Pacific Yacht Lines olarak size en doğru çözümü sunuyoruz.
              </p>
              <div className="text-2xl font-serif text-[#D4AF37] italic">
                Denizin özgürlüğünü, konforun en üst seviyesiyle buluşturuyoruz.
              </div>
              <button 
                onClick={onBack}
                className="mt-8 bg-[#0A192F] text-white px-12 py-5 rounded-sm font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl"
              >
                HEMEN REZERVASYON YAPIN
              </button>
            </div>
          </section>
        </article>
      </div>

      {/* Footer copy for About Us */}
      <footer className="bg-[#020C1B] text-white py-12 px-6 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Pacific Yacht Lines. Bodrum Lüks Yat Kiralama Hizmetleri.
        </p>
      </footer>
    </motion.div>
  );
};
