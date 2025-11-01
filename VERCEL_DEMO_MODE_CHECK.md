# ✅ Vercel'de DEMO_MODE Kontrol Adımları

## 🔍 Adım 1: Vercel Dashboard'da Kontrol

1. **https://vercel.com/dashboard** → Projeni aç
2. **Settings** → **Environment Variables**
3. `DEMO_MODE` variable'ını bul
4. Üzerine tıkla → **"Reveal"** butonuna bas
5. **Değer ne?**
   - ✅ `false` görüyorsan → Adım 2'ye geç
   - ❌ `true` görüyorsan → Edit et → `false` yap → Save → Adım 2'ye geç

---

## 🧹 Adım 2: Build Cache Temizle

1. **Settings** → **General** (sol menü)
2. En alta scroll yap
3. **"Clear Build Cache"** butonunu bul
4. Tıkla ve onayla

---

## 🚀 Adım 3: Redeploy

1. **Deployments** sekmesine git
2. En son deployment'ı bul
3. **"..."** (üç nokta) menüsüne tıkla
4. **"Redeploy"** seç
5. **ÖNEMLİ:** 
   - "Use existing Build Cache" checkbox'ını **KONTROL ET**
   - Eğer işaretliyse → **KALDIR** (tıklayarak kapat)
6. **"Redeploy"** butonuna tıkla
7. Build tamamlanana kadar bekle (2-3 dakika)

---

## 🧪 Adım 4: Test Et

Redeploy tamamlandıktan sonra:

```
GET https://mynewapp-rho.vercel.app/api/debug
```

**Beklenen sonuç:**
```json
{
  "envVars": {
    "DEMO_MODE": "false",
    "DEMO_MODE_raw": "false"  // ✅ Artık raw değeri de göreceksin
  }
}
```

---

## ❓ Hala `true` görüyorsan

### Durum 1: Vercel'de `false` ama hala `true` görünüyor

**Çözüm:** 
1. `DEMO_MODE` variable'ını **tamamen sil**
2. Yeniden ekle:
   - Key: `DEMO_MODE`
   - Value: `false` (tırnak işareti OLMADAN)
   - Environment: Production, Preview, Development (hepsini seç)
3. Save
4. Build cache temizle
5. Redeploy yap

### Durum 2: Vercel'de zaten `false` ve redeploy yaptın ama hala `true`

**Olası nedenler:**
- Build cache düzgün temizlenmemiş
- Eski deployment kullanılıyor
- Farklı environment (Preview vs Production)

**Çözüm:**
1. **Deployments** → **Production** deployment'ı kontrol et
2. Eğer Preview deployment'ı test ediyorsan → Production deployment'ını test et
3. Veya tamamen yeni bir deployment oluştur (Deployments → Deploy → En son commit seç)

---

**Şimdi Vercel'de `DEMO_MODE` değerini kontrol et ve bana sonucu söyle:**
- ✅ `false` ise: "Vercel'de false görüyorum, cache temizleyip redeploy yapıyorum"
- ❌ `true` ise: "Vercel'de true görüyorum, false yapıyorum"


