# 🗄️ PostgreSQL Database Setup Guide

## 📋 Adım 1: Vercel Dashboard'da Veritabanı Oluşturma

### 1.1 Vercel'e Giriş Yap
1. https://vercel.com adresine git
2. "Sign In" butonuna tıkla
3. GitHub hesabın ile giriş yap

### 1.2 Project'i Seç
1. Ana sayfada "mynewapp" project'ini seç
2. Sol menüden "Storage" tab'ına tıkla

### 1.3 Postgres Veritabanı Oluştur
1. "Create Database" butonuna tıkla
2. "Postgres" seçeneğini seç
3. Database ismi: `affiliate-db` (veya istediğin bir isim)
4. Region: "Europe West" (Frankfurt) - en yakın region'ı seç
5. "Create" butonuna tıkla

### 1.4 Connection String'i Kopyala
1. Database oluşturulduktan sonra "Settings" tab'ına git
2. "Connection string" bölümünde `.env` tab'ına tıkla
3. **TÜM CONNECTION STRING'i kopyala** (şu formatta olacak):
   ```
   postgres://username:password@host:port/database?sslmode=require
   ```
4. Bu string'i bir yere kaydet (not defterine yapıştır)

---

## 📋 Adım 2: Environment Variables Ayarlama

### 2.1 Vercel Dashboard'da Environment Variables Ekle
1. Project sayfasında "Settings" tab'ına git
2. Sol menüden "Environment Variables" seçeneğine tıkla
3. Aşağıdaki değişkenleri TEK TEK ekle:

#### Zorunlu Değişkenler:

**1. DATABASE_URL**
- Key: `DATABASE_URL`
- Value: **`PRISMA_DATABASE_URL` değerini kopyala ve buraya yapıştır**
  - Vercel Dashboard → Environment Variables → `PRISMA_DATABASE_URL` variable'ını bul
  - Value kısmındaki değeri kopyala (asterisks yerine gerçek değer görünecek)
  - Bu değeri `DATABASE_URL` variable'ına yapıştır
- Environment: Production, Preview, Development (tümünü seç)
- "Save" butonuna tıkla

**NOT:** Vercel Postgres otomatik olarak `PRISMA_DATABASE_URL` oluşturur. Bizim Prisma schema `DATABASE_URL` bekliyor, bu yüzden aynı değeri `DATABASE_URL` olarak da eklememiz gerekiyor.

**2. SESSION_SECRET**
- Key: `SESSION_SECRET`
- Value: Güvenli bir random string oluştur
  ```
  Şu komutu kullan (terminalde):
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Çıkan değeri kopyala ve yapıştır
- Environment: Production, Preview, Development
- "Save" butonuna tıkla

**3. DEMO_MODE**
- Key: `DEMO_MODE`
- Value: `false`
- Environment: Production, Preview, Development
- "Save" butonuna tıkla

**4. NEXT_PUBLIC_BASE_URL**
- Key: `NEXT_PUBLIC_BASE_URL`
- Value: Vercel deployment URL'in (örn: `https://mynewapp-boz9ckz72-pestens-projects.vercel.app`)
- Environment: Production, Preview, Development
- "Save" butonuna tıkla

### 2.2 Opsiyonel Değişkenler (Şimdilik Atla)
- Email, Stripe, Redis gibi servisler şimdilik önemli değil
- İleride gerektiğinde ekleyebiliriz

---

## 📋 Adım 3: Database Migration

### 3.1 Local'de Migration Hazırla
1. Terminal'de project klasörüne git:
   ```bash
   cd "Desktop\yeni ikas\mynewapp"
   ```

2. Prisma Client'ı generate et:
   ```bash
   pnpm prisma generate
   ```

3. Database schema'sını oluştur:
   ```bash
   pnpm prisma db push
   ```

### 3.2 Production Database'e Push Et

**Seçenek 1: Vercel CLI ile (Önerilen)**
```bash
# Vercel CLI'yi install et (eğer yoksa)
npm install -g vercel

# Vercel'e login ol
vercel login

# Production environment variables'ı kullanarak push et
DATABASE_URL="varcel-connection-string-buraya" pnpm prisma db push
```

**Seçenek 2: Vercel Dashboard üzerinden**
1. Deployment yaptıktan sonra "Postgres" tab'ında "Connect" butonuna tıkla
2. SQL Editor açılacak
3. `prisma/migrations` klasöründeki SQL dosyasını buraya paste et

---

## 📋 Adım 4: Deployment ve Test

### 4.1 GitHub'a Push Et
```bash
git add .
git commit -m "Setup PostgreSQL database"
git push
```

### 4.2 Vercel Otomatik Deploy
1. GitHub'a push yaptığında Vercel otomatik deploy başlatacak
2. Deployment sayfasında build loglarını izle
3. Build başarılı olunca "Visit" butonuna tıkla

### 4.3 Veritabanı Bağlantısını Test Et
1. Deployed site'da `/api/health` endpoint'ine git
2. Response'da şu bilgileri görmelisin:
   - Environment: Production
   - Database: Connected
   - Demo Mode: false

### 4.4 Database Schema'yı Kontrol Et
1. Vercel Dashboard → Storage → Postgres
2. "Table Editor" tab'ına git
3. Şu tabloları görmeli:
   - `AuthToken`
   - `Influencer`
   - `Link`
   - `Click`
   - `Commission`
   - `AutoPayment`

---

## ✅ Doğrulama Checklist

- [ ] Vercel Postgres database oluşturuldu
- [ ] DATABASE_URL environment variable eklendi
- [ ] SESSION_SECRET environment variable eklendi
- [ ] DEMO_MODE=false ayarlandı
- [ ] NEXT_PUBLIC_BASE_URL ayarlandı
- [ ] Database migration tamamlandı
- [ ] Production deployment başarılı
- [ ] Health check başarılı
- [ ] Database tabloları oluşturuldu

---

## 🆘 Sorun Giderme

### Problem: "Database connection error"
**Çözüm:**
1. Vercel Dashboard → Environment Variables → DATABASE_URL'i kontrol et
2. Connection string doğru formatta mı?
3. `.env` tab'ından doğru değeri kopyaladın mı?

### Problem: "Table does not exist"
**Çözüm:**
```bash
# Production'a tekrar push et
pnpm prisma db push --force-reset
```

### Problem: "Migration failed"
**Çözüm:**
1. Prisma client'ı yeniden generate et:
   ```bash
   pnpm prisma generate
   ```
2. Database'i reset et (DİKKAT: Veriler silinir):
   ```bash
   pnpm prisma db push --force-reset
   ```

---

## 🎉 Sonuç

Artık production PostgreSQL veritabanın hazır! 

**Sonraki Adım:** Environment variables ve monitoring setup

