import { generateShortCode, addUtmParams } from '../utils';

describe('Utils', () => {
  describe('generateShortCode', () => {
    it('should generate a short code', () => {
      const code = generateShortCode();
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.length).toBeGreaterThan(0);
    });

    it('should generate unique codes', () => {
      const code1 = generateShortCode();
      const code2 = generateShortCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('addUtmParams', () => {
    it('should add UTM parameters to URL', () => {
      const url = 'https://example.com';
      const utmParams = {
        utm_source: 'test',
        utm_medium: 'social',
        utm_campaign: 'campaign1'
      };
      
      const result = addUtmParams(url, utmParams);
      expect(result).toContain('utm_source=test');
      expect(result).toContain('utm_medium=social');
      expect(result).toContain('utm_campaign=campaign1');
    });

    it('should handle URL with existing parameters', () => {
      const url = 'https://example.com?existing=param';
      const utmParams = {
        utm_source: 'test'
      };
      
      const result = addUtmParams(url, utmParams);
      expect(result).toContain('existing=param');
      expect(result).toContain('utm_source=test');
    });

    it('should handle empty UTM parameters', () => {
      const url = 'https://example.com';
      const utmParams = {};
      
      const result = addUtmParams(url, utmParams);
      expect(result).toContain('https://example.com');
    });
  });
});
