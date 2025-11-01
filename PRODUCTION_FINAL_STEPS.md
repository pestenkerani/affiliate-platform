# 🚀 Production Son Adımlar

## ✅ Tamamlanan
- [x] Database bağlantısı çalışıyor
- [x] Environment variables yüklendi
- [x] Prisma bağlantısı başarılı

---

## 🔧 Yapılması Gerekenler

### 1. Environment Variables Düzeltmeleri

**Vercel Dashboard → Settings → Environment Variables:**

#### a) `DEMO_MODE` Değiştir
- **Mevcut:** `true`
- **Yeni:** `false`
- **Environment:** All Environments seçili

#### b) `NEXT_PUBLIC_BASE_URL` Düzelt
- **Mevcut:** `mynewapp-rho.vercel.app` (protokol yok)
- **Yeni:** `https://mynewapp-rho.vercel.app`
- **Environment:** All Environments seçili

---

### 2. Database Migration

Vercel'de otomatik olarak `prisma generate && next build` çalışacak, ama migration yapılması gerekiyor.

**Seçenek A: Vercel Build'de Otomatik (Önerilen)**

Vercel build sırasında otomatik migration yapmak için `package.json`'da `postinstall` script'i var mı kontrol et.

**Seçenek B: Manuel Migration (Gerekirse)**

Eğer migration yapılması gerekiyorsa, Vercel'de bir script çalıştırabilirsin veya local'den migration yapabilirsin.

```bash
# Local'den migration (sadece gerekirse)
npx prisma migrate deploy
```

**Not:** Vercel Postgres kullanıyorsan, migration otomatik yapılmalı. Eğer sorun olursa, Vercel Dashboard → Deployments → Build logs kontrol et.

---

### 3. Redeploy

Environment variables'ları güncelledikten sonra:

1. **Vercel Dashboard → Deployments**
2. **En son deployment'ı bul**
3. **"..." menü → "Redeploy"**
4. Build tamamlanana kadar bekle (2-3 dakika)

---

### 4. Test Et

#### a) Health Check
```
GET https://mynewapp-rho.vercel.app/api/health
```

**Beklenen:**
```json
{
  "status": "ok",
  "database": {
    "status": "connected",
    "connected": true
  },
  "demoMode": false,
  "validation": {
    "success": true
  }
}
```

#### b) Debug Endpoint
```
GET https://mynewapp-rho.vercel.app/api/debug
```

**Beklenen:**
```json
{
  "envVars": {
    "DATABASE_URL": "***configured***",
    "DEMO_MODE": "false",
    "NEXT_PUBLIC_BASE_URL": "https://mynewapp-rho.vercel.app",
    "SESSION_SECRET": "***configured***"
  },
  "prisma": {
    "status": "connected"
  }
}
```

---

### 5. Database Tables Kontrol

Migration sonrası database'de tablolar oluşmuş mu kontrol et:

**Vercel Dashboard → Storage → Postgres → Data → Tables**

Aşağıdaki tablolar olmalı:
- ✅ `AuthToken`
- ✅ `influencers`
- ✅ `links`
- ✅ `clicks`
- ✅ `commissions`
- ✅ `auto_payments`

---

## 📋 Checklist

- [ ] `DEMO_MODE` = `false` yapıldı
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://...` formatında
- [ ] Environment variables kaydedildi
- [ ] Redeploy yapıldı
- [ ] `/api/health` status: `ok` döndü
- [ ] `/api/debug` tüm variables gösteriyor
- [ ] Database tabloları oluştu
- [ ] Production'da demo mode kapalı çalışıyor

---

## 🐛 Sorun Giderme

### Migration hatası alırsan:
1. Vercel Dashboard → Deployments → Build logs kontrol et
2. `prisma migrate deploy` hatası var mı bak
3. Eğer varsa, local'den migration yap:
   ```bash
   DATABASE_URL="<vercel_postgres_url>" npx prisma migrate deploy
   ```

### Health check hala `degraded` döndürüyorsa:
1. Database connection timeout olabilir
2. `/api/debug` endpoint'inden Prisma status'ü kontrol et
3. Vercel Postgres → Settings → Connection string kontrol et

---

**Şimdi sırayla yap ve sonuçları paylaş!** 🚀


