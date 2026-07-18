# Pacific Yacht Lines

React, Vite ve Supabase tabanlı tanıtım, teklif ve rezervasyon uygulaması.

## Yerel kurulum

1. `npm ci`
2. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase değerlerini girin.
3. Supabase SQL Editor içinde `supabase-sql/production_schema.sql` dosyasını çalıştırın.
4. `supabase-sql/ADMIN_SETUP.md` içindeki adımlarla yönetici kullanıcıyı yetkilendirin.
5. `npm run dev`

## Doğrulama ve yayın

```bash
npm run check
npm run build
```

Vercel için `vercel.json` güvenlik başlıklarını ve SPA yönlendirmesini içerir. `dist/` dizini üretim çıktısıdır. `.env.local` hiçbir zaman kaynak kontrolüne eklenmemelidir.

Gizlilik ve kullanım koşulları taslakları yayın öncesinde işletmenin gerçek süreçlerine göre hukuk danışmanı tarafından doğrulanmalıdır.

