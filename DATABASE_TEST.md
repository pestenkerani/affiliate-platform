# 🧪 Database Test Rehberi

## 📋 Test Yöntemleri

### Yöntem 1: Vercel Dashboard üzerinden (En Kolay)

#### 1.1 Postgres Tablolarını Kontrol Et
1. Vercel Dashboard → Project → "Storage" → Postgres database'in
2. "Table Editor" tab'ına git
3. Şu tabloları görmeli:
   - `AuthToken`
   - `Influencer`
   - `Link`
   - `Click`
   - `Commission`
   - `AutoPayment`

**Eğer tablolar yoksa:** Migration yapmamız gerekiyor (Yöntem 2 veya 3'e bak)

---

### Yöntem 2: Health Check API Test (Önerilen)

#### 2.1 Deployed Site'da Test Et
1. Deployed site'ını aç (örn: `https://mynewapp-xxx.vercel.app`)
2. `/api/health` endpoint'ine git
3. Response şöyle olmalı:
   ```json
   {
     "status": "healthy",
     "environment": "production",
     "database": "connected",
     "demoMode": false,
     "timestamp": "..."
   }
   ```

**Eğer "database": "error" görürsen:**
- Environment variables kontrol et
- `DATABASE_URL` doğru mu?
- Deployment yeniden yapıldı mı?

---

### Yöntem 3: Manual Migration (Gerekirse)

#### 3.1 Vercel CLI ile Migration
```bash
# Vercel CLI install (eğer yoksa)
npm install -g vercel

# Login
vercel login

# Environment variable'ı set et (local için)
vercel env pull .env.local

# Prisma generate
pnpm prisma generate

# Database push
pnpm prisma db push
```

#### 3.2 Vercel Postgres SQL Editor ile
1. Vercel Dashboard → Storage → Postgres → "Query" tab
2. Prisma migration SQL'ini çalıştır (otomatik oluşacak)
3. Ya da manual olarak tabloları oluştur

---

## ✅ Başarılı Test Sonuçları

### Health Check Response:
```json
{
  "status": "healthy",
  "environment": "production",
  "database": "connected",
  "demoMode": false,
  "services": {
    "database": "PostgreSQL",
    "cache": "node-cache",
    "email": "configured"
  },
  "timestamp": "2025-01-XX..."
}
```

### Database Tabloları:
- ✅ `auth_tokens` tablosu var
- ✅ `influencers` tablosu var
- ✅ `links` tablosu var
- ✅ `clicks` tablosu var
- ✅ `commissions` tablosu var
- ✅ `auto_payments` tablosu var

---

## 🆘 Sorun Giderme

### Problem: "Database connection error"
**Çözüm 1:**
1. Vercel Dashboard → Environment Variables
2. `DATABASE_URL` değerini kontrol et
3. `PRISMA_DATABASE_URL` ile aynı mı?

**Çözüm 2:**
```bash
# Redeploy yap
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Problem: "Table does not exist"
**Çözüm:**
1. Vercel Dashboard → Storage → Postgres → "Query" tab
2. Manual olarak tablo oluştur
3. Ya da Yöntem 3 ile migration yap

### Problem: Health check yanıt vermiyor
**Çözüm:**
1. Deployment loglarını kontrol et
2. Build başarılı mı?
3. Environment variables doğru mu?

---

## 🎯 Hızlı Test Adımları

1. **Deployed site'ı aç:** `https://your-app.vercel.app`
2. **Health check yap:** `/api/health` endpoint'ine git
3. **Response kontrol et:** `database: "connected"` olmalı
4. **Vercel Dashboard kontrol:** Storage → Postgres → Table Editor'de tablolar var mı?

---

**Şimdi `/api/health` endpoint'ini test et ve sonucu paylaş!** 🚀

