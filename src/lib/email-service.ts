import nodemailer from 'nodemailer';

// Email transporter oluştur (demo modda)
const createTransporter = () => {
  // Demo modda gerçek email göndermek yerine console'a log yazacağız
  return {
    sendMail: async (options: any) => {
      console.log('📧 EMAIL SENT (Demo Mode):');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      console.log('HTML:', options.html);
      console.log('---');
      
      // Demo modda başarılı response döndür
      return {
        messageId: `demo-${Date.now()}`,
        accepted: [options.to],
        rejected: [],
        pending: [],
        response: 'Email sent successfully (demo mode)'
      };
    }
  };
};

export const emailService = {
  // Komisyon bildirimi gönder
  sendCommissionNotification: async (influencerEmail: string, commissionAmount: number, orderId: string) => {
    const transporter = createTransporter();
    
    const subject = `Yeni Komisyon Bildirimi - ₺${commissionAmount}`;
    const text = `
Merhaba,

Sipariş #${orderId} için ₺${commissionAmount} komisyon kazandınız!

Detaylar:
- Sipariş: #${orderId}
- Komisyon Tutarı: ₺${commissionAmount}
- Tarih: ${new Date().toLocaleDateString('tr-TR')}

Teşekkürler!
Affiliate Tracker Ekibi
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Yeni Komisyon Bildirimi</h2>
        <p>Merhaba,</p>
        <p>Sipariş <strong>#${orderId}</strong> için <strong>₺${commissionAmount}</strong> komisyon kazandınız!</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Komisyon Detayları</h3>
          <p><strong>Sipariş:</strong> #${orderId}</p>
          <p><strong>Komisyon Tutarı:</strong> ₺${commissionAmount}</p>
          <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        
        <p>Teşekkürler!</p>
        <p><strong>Affiliate Tracker Ekibi</strong></p>
      </div>
    `;

    return await transporter.sendMail({
      to: influencerEmail,
      subject,
      text,
      html
    });
  },

  // Ödeme bildirimi gönder
  sendPaymentNotification: async (influencerEmail: string, paymentAmount: number, paymentDate: string) => {
    const transporter = createTransporter();
    
    const subject = `Ödeme Bildirimi - ₺${paymentAmount}`;
    const text = `
Merhaba,

₺${paymentAmount} tutarındaki komisyonunuz ödendi!

Detaylar:
- Ödeme Tutarı: ₺${paymentAmount}
- Ödeme Tarihi: ${paymentDate}
- Hesap: Banka hesabınıza yatırıldı

Teşekkürler!
Affiliate Tracker Ekibi
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Ödeme Bildirimi</h2>
        <p>Merhaba,</p>
        <p><strong>₺${paymentAmount}</strong> tutarındaki komisyonunuz ödendi!</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Ödeme Detayları</h3>
          <p><strong>Ödeme Tutarı:</strong> ₺${paymentAmount}</p>
          <p><strong>Ödeme Tarihi:</strong> ${paymentDate}</p>
          <p><strong>Durum:</strong> Banka hesabınıza yatırıldı</p>
        </div>
        
        <p>Teşekkürler!</p>
        <p><strong>Affiliate Tracker Ekibi</strong></p>
      </div>
    `;

    return await transporter.sendMail({
      to: influencerEmail,
      subject,
      text,
      html
    });
  },

  // Performans bildirimi gönder
  sendPerformanceNotification: async (influencerEmail: string, clicks: number, conversions: number) => {
    const transporter = createTransporter();
    
    const subject = `Haftalık Performans Raporu`;
    const text = `
Merhaba,

Bu haftaki performansınız:

- Toplam Tıklama: ${clicks}
- Dönüşüm: ${conversions}
- Dönüşüm Oranı: ${clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0}%

Harika iş çıkarıyorsunuz! 🎉

Teşekkürler!
Affiliate Tracker Ekibi
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Haftalık Performans Raporu</h2>
        <p>Merhaba,</p>
        <p>Bu haftaki performansınız:</p>
        
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Performans İstatistikleri</h3>
          <p><strong>Toplam Tıklama:</strong> ${clicks}</p>
          <p><strong>Dönüşüm:</strong> ${conversions}</p>
          <p><strong>Dönüşüm Oranı:</strong> ${clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0}%</p>
        </div>
        
        <p>Harika iş çıkarıyorsunuz! 🎉</p>
        <p>Teşekkürler!</p>
        <p><strong>Affiliate Tracker Ekibi</strong></p>
      </div>
    `;

    return await transporter.sendMail({
      to: influencerEmail,
      subject,
      text,
      html
    });
  },

  // Genel email gönderme metodu
  sendEmail: async (options: { to: string; subject: string; text: string; html?: string }) => {
    const transporter = createTransporter();
    
    return await transporter.sendMail({
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    });
  }
};


