const fs = require('fs');
const path = require('path');

// Domain setup instructions
const domainSetupInstructions = `
# 🌐 Domain Setup Guide

## 📋 Prerequisites

- Domain name purchased from a registrar (GoDaddy, Namecheap, etc.)
- Vercel account with project deployed
- DNS access to your domain

## 🚀 Step-by-Step Setup

### 1. Add Domain to Vercel

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain name (e.g., \`yourdomain.com\`)
5. Click "Add"

### 2. Configure DNS Records

Add these DNS records to your domain registrar:

#### For Root Domain (yourdomain.com):
\`\`\`
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600
\`\`\`

#### For WWW Subdomain (www.yourdomain.com):
\`\`\`
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
\`\`\`

#### For API Subdomain (api.yourdomain.com):
\`\`\`
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600
\`\`\`

### 3. SSL Certificate

Vercel automatically provides SSL certificates:
- ✅ Automatic HTTPS
- ✅ Let's Encrypt certificates
- ✅ Auto-renewal
- ✅ HTTP/2 support

### 4. Environment Variables Update

Update your environment variables:

\`\`\`bash
# Update base URL
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# Update CORS origin
CORS_ORIGIN="https://yourdomain.com"
\`\`\`

### 5. Test Domain Setup

\`\`\`bash
# Test DNS propagation
nslookup yourdomain.com

# Test HTTPS
curl -I https://yourdomain.com

# Test health endpoint
curl https://yourdomain.com/api/health
\`\`\`

## 🔧 Advanced Configuration

### Custom Headers

The \`vercel.json\` file includes security headers:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Redirects

Configured redirects:
- \`/home\` → \`/\`
- \`/dashboard\` → \`/affiliate\`

### Cache Control

- Static assets: 1 year cache
- API responses: No cache
- Sitemap/Robots: 1 hour cache

## 📊 Monitoring

After domain setup, monitor:
- SSL certificate status
- DNS propagation
- Performance metrics
- Error rates

## 🆘 Troubleshooting

### Common Issues:

1. **DNS not propagating**
   - Wait 24-48 hours
   - Check DNS propagation tools
   - Verify DNS records

2. **SSL certificate issues**
   - Check domain verification
   - Ensure DNS is correct
   - Contact Vercel support

3. **Redirect loops**
   - Check vercel.json redirects
   - Verify domain configuration
   - Clear browser cache

## 📞 Support

- Vercel Documentation: https://vercel.com/docs
- DNS Help: https://vercel.com/docs/concepts/projects/domains
- SSL Help: https://vercel.com/docs/concepts/projects/domains/certificates
`;

// Create domain setup guide
function createDomainSetupGuide() {
  try {
    console.log('🌐 Creating domain setup guide...');

    // Create DOMAIN_SETUP.md file
    const domainSetupPath = path.join(process.cwd(), 'DOMAIN_SETUP.md');
    fs.writeFileSync(domainSetupPath, domainSetupInstructions);
    console.log('✅ Created DOMAIN_SETUP.md file');

    // Create DNS records template
    const dnsRecordsTemplate = `# DNS Records Template

## Root Domain (yourdomain.com)
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600

## WWW Subdomain (www.yourdomain.com)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600

## API Subdomain (api.yourdomain.com)
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600

## Email Subdomain (mail.yourdomain.com)
Type: MX
Name: @
Value: mail.yourdomain.com
Priority: 10
TTL: 3600

## SPF Record
Type: TXT
Name: @
Value: "v=spf1 include:_spf.vercel.com ~all"
TTL: 3600

## DKIM Record
Type: TXT
Name: default._domainkey
Value: "v=DKIM1; k=rsa; p=YOUR_DKIM_KEY"
TTL: 3600

## DMARC Record
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
TTL: 3600
`;

    const dnsRecordsPath = path.join(process.cwd(), 'dns-records.txt');
    fs.writeFileSync(dnsRecordsPath, dnsRecordsTemplate);
    console.log('✅ Created dns-records.txt file');

    console.log('\n📋 Next steps:');
    console.log('1. Read DOMAIN_SETUP.md for detailed instructions');
    console.log('2. Use dns-records.txt as reference for DNS setup');
    console.log('3. Add your domain to Vercel dashboard');
    console.log('4. Configure DNS records at your registrar');
    console.log('5. Update environment variables with your domain');

  } catch (error) {
    console.error('❌ Error creating domain setup guide:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  createDomainSetupGuide();
}

module.exports = { createDomainSetupGuide };













