# 🛑 Otomatik Deploy'u Kapatma

## Vercel'de Otomatik Deploy'u Kapat

### Yöntem 1: GitHub Integration'ı Kapat (Önerilen)

1. **Vercel Dashboard → Project → Settings → Git**
2. **"Disconnect"** butonuna tıkla
3. Artık GitHub'a push yaptığında otomatik deploy olmayacak
4. Manuel deploy için: **Deployments → "Deploy"** butonuna tıklayabilirsin

### Yöntem 2: Ignore Build Step Ayarı

1. **Vercel Dashboard → Project → Settings → Git**
2. **"Ignore Build Step"** alanına şunu yaz:
   ```
   echo "Skipping build"
   ```
3. Bu, tüm build'leri atlar, sadece manuel deploy yapılabilir

### Yöntem 3: Branch Protection

1. **Vercel Dashboard → Project → Settings → Git**
2. **"Production Branch"** ayarını değiştir
3. Production branch'i ana branch dışında bir şeye ayarla
4. Ana branch'e push yaptığında production deploy olmaz

---

## Manuel Deploy Nasıl Yapılır?

1. **Vercel Dashboard → Project → "Deployments"** sekmesi
2. **Sağ üstte "Deploy"** butonuna tıkla
3. **"Deploy from GitHub"** seç (veya başka bir kaynak)
4. Branch ve commit seç
5. **"Deploy"** butonuna tıkla

---

## ⚠️ DATABASE_URL SORUNU İÇİN KONTROL

Redeploy yaptığın halde hala "missing" görünüyorsa:

1. **Variable Değeri Boş Olabilir:**
   - Vercel Dashboard → Settings → Environment Variables
   - `DATABASE_URL` variable'ına tıkla
   - "Reveal" → Değer boş mu kontrol et
   - Eğer boşsa, `PRISMA_DATABASE_URL` değerini kopyala ve `DATABASE_URL`'e yapıştır

2. **Variable İsmi Yanlış:**
   - Tam olarak `DATABASE_URL` olmalı (büyük harf, alt çizgi)
   - `database_url` veya `Database_URL` çalışmaz!

3. **Build Cache Sorunu:**
   - Vercel → Project → Settings → "Clear Build Cache"
   - Cache'i temizle ve tekrar redeploy yap

---

**Şimdi önce `DATABASE_URL` değerini kontrol et, sonra otomatik deploy'u kapat!** 🚀








