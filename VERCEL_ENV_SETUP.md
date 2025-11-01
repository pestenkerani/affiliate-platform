# ⚙️ Vercel Environment Variables Kurulumu

## 🔴 SORUN: Environment Variables Eksik

Debug endpoint'i şunu gösteriyor:
- ❌ `DATABASE_URL`: missing
- ❌ `SESSION_SECRET`: missing
- ❌ `NEXT_PUBLIC_BASE_URL`: not set
- ⚠️ `DEMO_MODE`: "true" (production'da "false" olmalı)

---

## ✅ ÇÖZÜM: Vercel Dashboard'da Environment Variables Ekle

### Adım 1: Vercel Dashboard'a Git
1. https://vercel.com/dashboard adresine git
2. "mynewapp" project'ini aç

### Adım 2: Environment Variables Sekmesine Git
1. Project sayfasında **"Settings"** sekmesine tıkla
2. Sol menüden **"Environment Variables"** seçeneğine tıkla

### Adım 3: DATABASE_URL Ekle

**3.1 PRISMA_DATABASE_URL Değerini Bul:**
1. Hala "Environment Variables" sayfasındayken
2. Üstteki listede `PRISMA_DATABASE_URL` var mı kontrol et
3. Varsa: Üzerine tıkla → "Reveal" veya "Show" butonuna tıkla
4. Değeri kopyala (tüm connection string)

**Eğer PRISMA_DATABASE_URL yoksa:**
1. Vercel Dashboard → Project → **"Storage"** sekmesine git
2. Postgres database'ini seç
3. **"Settings"** tab'ına git
4. **"Connection string"** bölümünde **`.env`** tab'ına tıkla
5. Değeri kopyala

**3.2 DATABASE_URL Ekle:**
1. **"Add New"** butonuna tıkla
2. **Key:** `DATABASE_URL` yaz
3. **Value:** Daha önce kopyaladığın connection string'i yapıştır
4. **Environment:** 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   (Hepsini seç!)
5. **"Save"** butonuna tıkla

---

### Adım 4: SESSION_SECRET Ekle

**4.1 SESSION_SECRET Değeri Oluştur:**
Terminal'de şu komutu çalıştır:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıkan değeri kopyala (örn: `024ace16d4c4c8b6afdc5038d31b2170a5db1be78ed1c6a50e922b88d8d581e1`)

**4.2 SESSION_SECRET Ekle:**
1. **"Add New"** butonuna tıkla
2. **Key:** `SESSION_SECRET` yaz
3. **Value:** Kopyaladığın random string'i yapıştır
4. **Environment:** Production, Preview, Development (hepsini seç)
5. **"Save"** butonuna tıkla

---

### Adım 5: DEMO_MODE Güncelle (veya Ekle)

**5.1 DEMO_MODE Kontrolü:**
1. Environment Variables listesinde `DEMO_MODE` var mı kontrol et
2. **Varsa:** Üzerine tıkla → Edit → Value'yu `false` yap → Save
3. **Yoksa:** 
   - "Add New" → Key: `DEMO_MODE`, Value: `false`
   - Environment: Production, Preview, Development
   - "Save"

---

### Adım 6: NEXT_PUBLIC_BASE_URL Ekle

**6.1 Deployed URL'ini Bul:**
1. Vercel Dashboard → Project → "Domains" sekmesine git
2. Production URL'ini kopyala (örn: `https://mynewapp-bd6d987d0-pestens-projects.vercel.app`)

**6.2 NEXT_PUBLIC_BASE_URL Ekle:**
1. **"Add New"** butonuna tıkla
2. **Key:** `NEXT_PUBLIC_BASE_URL` yaz
3. **Value:** Deployed URL'ini yapıştır (örn: `https://mynewapp-bd6d987d0-pestens-projects.vercel.app`)
4. **Environment:** Production, Preview, Development (hepsini seç)
5. **"Save"** butonuna tıkla

---

## 🔄 Adım 7: Redeploy Yap

Environment variables ekledikten sonra **mutlaka redeploy yapman gerekiyor!**

### Yöntem 1: Vercel Dashboard'dan
1. Project sayfasına git
2. En üstteki deployment'a tıkla
3. Sağ üstte "..." (üç nokta) menüsüne tıkla
4. **"Redeploy"** seçeneğine tıkla
5. **"Redeploy"** butonuna tıkla

### Yöntem 2: Git Push ile
```bash
cd "Desktop\yeni ikas\mynewapp"
git commit --allow-empty -m "Trigger redeploy for environment variables"
git push
```

---

## ✅ Kontrol Checklist

Ekledikten sonra şunları kontrol et:

- [ ] `DATABASE_URL` eklendi ve değeri doğru
- [ ] `SESSION_SECRET` eklendi
- [ ] `DEMO_MODE` = `false` (production için)
- [ ] `NEXT_PUBLIC_BASE_URL` eklendi ve deployed URL'i doğru
- [ ] Tüm variable'lar Production, Preview, Development için seçili
- [ ] Redeploy yapıldı

---

## 🧪 Test Et

Redeploy tamamlandıktan sonra:

1. `/api/debug` endpoint'ine tekrar git
2. Artık şöyle görmeli:
   ```json
   {
     "envVars": {
       "DATABASE_URL": "***configured***",
       "SESSION_SECRET": "***configured***",
       "DEMO_MODE": "false",
       "NEXT_PUBLIC_BASE_URL": "https://..."
     },
     "prisma": {
       "status": "connected"
     }
   }
   ```

3. `/api/health` endpoint'i artık çalışmalı!

---

## 🆘 SORUN GİDERME

### Problem: "DATABASE_URL" hala "missing" görünüyor
**Çözüm:**
- Redeploy yaptın mı? Mutlaka redeploy yap!
- Variable'ın değeri doğru mu? `PRISMA_DATABASE_URL` ile aynı olmalı
- Environment'lar seçili mi? (Production, Preview, Development)

### Problem: "prisma.status": "import_failed"
**Çözüm:**
- Build loglarını kontrol et
- Prisma client generate edilmiş mi?
- Deployment başarılı olmuş mu?

---

**Şimdi yukarıdaki adımları takip et ve redeploy yap!** 🚀








