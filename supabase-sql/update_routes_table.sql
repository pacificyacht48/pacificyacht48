-- Rotalar tablosu için yeni sütunlar ekle
-- Bu SQL'i Supabase > SQL Editörü'nde çalıştırın

ALTER TABLE routes
ADD COLUMN IF NOT EXISTS coves TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_time TEXT,
ADD COLUMN IF NOT EXISTS history TEXT,
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS activities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_season TEXT;

-- Yeni sütunlar için açıklamalar (opsiyonel)
COMMENT ON COLUMN routes.coves IS 'Gezilecek koyların listesi';
COMMENT ON COLUMN routes.best_time IS 'Yılın en iyi zamanı (örn: Mayıs-Eylül)';
COMMENT ON COLUMN routes.history IS 'Rotanın tarihçesi ve arka plan bilgisi';
COMMENT ON COLUMN routes.highlights IS 'Rotadaki öne çıkanlar, görülmesi gereken yerler';
COMMENT ON COLUMN routes.activities IS 'Yapılabilecek aktiviteler listesi';
COMMENT ON COLUMN routes.best_season IS 'Ziyaret için önerilen mevsim';

-- Mevcut rotaları kontrol et (opsiyonel - veri yoksa çalıştırmayın)
-- SELECT * FROM routes;
