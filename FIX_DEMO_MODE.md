# 🔧 DEMO_MODE Sorun Giderme

## ⚠️ Sorun
`/api/debug` hala `DEMO_MODE: "true"` gösteriyor.

## ✅ Çözüm Adımları

### 1. Vercel'de DEMO_MODE Değerini Kontrol Et

**Vercel Dashboard → Settings → Environment Variables → `DEMO_MODE`:**

1. `DEMO_MODE` variable'ına tıkla
2. "Reveal" butonuna tıkla
3. **Değer ne?**
   - Eğer `true` görüyorsan → Edit et → `false` yap → Save
   - Eğer `false` görüyorsan → Build cache sorunu var (adım 2'ye geç)

---

### 2. Build Cache Temizle

**Vercel Dashboard → Settings → General:**

1. En alta scroll yap
2. **"Clear Build Cache"** butonuna tıkla
3. Onayla

---

### 3. Redeploy Yap (Cache temizledikten sonra)

**Vercel Dashboard → Deployments:**

1. En son deployment'ı bul
2. **"..." menü → "Redeploy"**
3. **ÖNEMLİ:** "Use existing Build Cache" seçeneğini **KAPALI** bırak (işaretliyse kaldır)
4. Redeploy butonuna tıkla
5. Build tamamlanana kadar bekle (2-3 dakika)

---

### 4. Test Et

Redeploy sonrası:

```
GET https://mynewapp-rho.vercel.app/api/debug
```

**Beklenen:**
```json
{
  "envVars": {
    "DEMO_MODE": "false"  // ✅ Artık false olmalı!
  }
}
```

---

## 🔍 Kontrol Listesi

- [ ] Vercel'de `DEMO_MODE` değeri `false` mı?
- [ ] Build cache temizlendi mi?
- [ ] Redeploy yapıldı mı?
- [ ] Redeploy'da "Use existing Build Cache" kapalı mı?
- [ ] `/api/debug` `false` gösteriyor mu?

---

## 🐛 Hala `true` görüyorsan

### Alternatif Çözüm: Environment Variable'ı Sil ve Yeniden Ekle

1. **Vercel Dashboard → Settings → Environment Variables**
2. `DEMO_MODE` variable'ını **Sil**
3. **"Add New"** butonuna tıkla
4. **Key:** `DEMO_MODE`
5. **Value:** `false` (tırnak işareti olmadan)
6. **Environment:** ✅ Production, ✅ Preview, ✅ Development (hepsini seç)
7. **Save**
8. **Build cache temizle** (adım 2)
9. **Redeploy yap** (adım 3)

---

**Önce Vercel'de `DEMO_MODE` değerini kontrol et ve sonucu paylaş!** 🚀

