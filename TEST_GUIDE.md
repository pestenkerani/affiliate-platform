# 🧪 Database Test Rehberi - Adım Adım

## 📍 1. Deployed Site'ı Bulma

### Adım 1.1: Vercel Dashboard'a Git
1. https://vercel.com/dashboard adresine git
2. GitHub hesabın ile giriş yap
3. "mynewapp" project'ini bul ve tıkla

### Adım 1.2: Deployment URL'ini Bul
1. Project sayfasında yukarıda "Domains" sekmesine tıkla
2. Veya "Deployments" sekmesinde en üstteki (son) deployment'a tıkla
3. "Visit" butonuna tıkla veya URL'yi kopyala
4. URL şöyle olacak: `https://mynewapp-xxxxx.vercel.app` veya `https://mynewapp-pestens-projects.vercel.app`

---

## 🏥 2. Health Check Test (Database Bağlantısı)

### Adım 2.1: Health Check Endpoint'ine Git
1. Deployed site'ı aç (örn: `https://mynewapp-xxx.vercel.app`)
2. Browser adres çubuğuna şunu yaz:
   ```
   https://mynewapp-xxx.vercel.app/api/health
   ```
3. Enter'a bas

### Adım 2.2: Response'u İncele
Browser'da JSON formatında bir response görmelisin. Şöyle görünecek:

#### ✅ BAŞARILI BAĞLANTI:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "environment": "production",
  "demoMode": false,
  "database": {
    "status": "connected",
    "connected": true,
    "url": "configured",
    "error": null
  },
  "email": { ... },
  "stripe": { ... }
}
```

**ÖNEMLİ:** `database.status` = `"connected"` ve `database.connected` = `true` olmalı!

#### ❌ BAĞLANTI HATASI (Tablolar Yok):
```json
{
  "status": "degraded",
  "database": {
    "status": "error",
    "connected": false,
    "error": "relation \"influencers\" does not exist"
  }
}
```

**Bu durumda:** Database migration yapmamız gerekiyor (Adım 3'e git)

#### ❌ DATABASE_URL YOK:
```json
{
  "database": {
    "status": "not_configured",
    "connected": false,
    "url": "missing"
  }
}
```

**Bu durumda:** Environment variables kontrol et!

---

## 📊 3. Vercel Dashboard'da Database Kontrolü

### Adım 3.1: Postgres Database'e Git
1. Vercel Dashboard → Project → "Storage" sekmesine tıkla
2. Postgres database'ini bul (örn: "affiliate-db")
3. Database'e tıkla

### Adım 3.2: Table Editor'ı Kontrol Et
1. "Table Editor" tab'ına tıkla
2. Sol tarafta tablo listesini görmelisin

#### ✅ TABLOLAR VAR:
Şu tabloları görmelisin:
- `AuthToken` (veya `auth_tokens`)
- `Influencer` (veya `influencers`)
- `Link` (veya `links`)
- `Click` (veya `clicks`)
- `Commission` (veya `commissions`)
- `AutoPayment` (veya `auto_payments`)

#### ❌ TABLOLAR YOK:
Eğer hiç tablo görmüyorsan veya "No tables found" yazıyorsa:
- Database migration yapmamız gerekiyor
- Adım 4'e geç

---

## 🔍 4. Environment Variables Kontrolü

### Adım 4.1: Environment Variables'ı Kontrol Et
1. Vercel Dashboard → Project → "Settings" sekmesine tıkla
2. Sol menüden "Environment Variables" seçeneğine tıkla

### Adım 4.2: Gerekli Variable'ları Kontrol Et
Şu variable'lar olmalı:

| Variable | Durum | Not |
|----------|-------|-----|
| `DATABASE_URL` | ✅ Var | `PRISMA_DATABASE_URL` ile aynı değer |
| `SESSION_SECRET` | ✅ Var | Rastgele string |
| `DEMO_MODE` | ✅ Var | `false` olmalı |
| `NEXT_PUBLIC_BASE_URL` | ✅ Var | Deployed URL'in |

**Eğer eksik varsa:** O variable'ı ekle!

---

## 🔄 5. Database Migration (Gerekirse)

### Eğer Health Check `"error"` dönüyorsa veya tablolar yoksa:

#### Yöntem 1: Vercel CLI ile (Önerilen)
```bash
# Terminal'de şu komutları çalıştır:
cd "Desktop\yeni ikas\mynewapp"

# Vercel CLI install (eğer yoksa)
npm install -g vercel

# Login
vercel login

# Environment variables'ı çek
vercel env pull .env.local

# Prisma generate
pnpm prisma generate

# Database push (tabloları oluştur)
pnpm prisma db push
```

#### Yöntem 2: Vercel Dashboard SQL Editor ile
1. Vercel Dashboard → Storage → Postgres → "Query" tab
2. Prisma schema'dan SQL oluştur ve çalıştır
3. Ya da manual olarak tabloları oluştur

---

## 📝 6. Test Sonuçlarını Kaydet

Health check sonucunu buraya yapıştır:
- Database status: `connected` / `error` / `not_configured`
- Hata varsa error message'ı kopyala
- Tablolar var mı? Evet/Hayır

---

## ✅ 7. Başarılı Test Durumu

Tüm kontroller başarılıysa:
- ✅ Health check `"connected"` dönüyor
- ✅ Vercel Dashboard'da tablolar var
- ✅ Environment variables doğru ayarlanmış
- ✅ Deployment başarılı

**Sonraki Adım:** Production'da gerçek veri testleri!

---

## 🆘 Sorun Giderme

### Problem: Health check yüklemiyor
**Çözüm:** 
- Deployment'ın tamamlandığından emin ol
- Browser console'da hata var mı kontrol et
- URL doğru mu? `/api/health` ekli mi?

### Problem: "database": { "status": "error" }
**Çözüm:**
- Error message'ı kontrol et
- Genelde tablolar yok demektir
- Database migration yap (Adım 5)

### Problem: "database": { "status": "not_configured" }
**Çözüm:**
- `DATABASE_URL` environment variable var mı kontrol et
- Vercel Dashboard → Environment Variables
- Eksikse ekle

---

## 🎯 Hızlı Kontrol Listesi

- [ ] Deployed site'ı açabildim
- [ ] `/api/health` endpoint'ine gidebildim
- [ ] Health check response'u gördüm
- [ ] Database status'u kontrol ettim
- [ ] Vercel Dashboard'da tabloları kontrol ettim
- [ ] Environment variables'ı kontrol ettim

**Şimdi Health Check sonucunu paylaş!** 🚀

