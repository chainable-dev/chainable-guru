import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

describe('Next.js Configuration', () => {
  describe('Image Configuration', () => {
    it('should have all required remote patterns', () => {
      const expectedPatterns = [
        {
          protocol: 'https',
          hostname: '**.public.blob.vercel-storage.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: '**.vercel-storage.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'avatar.vercel.sh',
          pathname: '/**',
        },
      ];

      expect(nextConfig.images?.remotePatterns).toBeDefined();
      expectedPatterns.forEach(pattern => {
        expect(nextConfig.images?.remotePatterns).toContainEqual(pattern);
      });
    });

    it('should have all required image domains', () => {
      const expectedDomains = [
        'avatar.vercel.sh',
        'avatars.githubusercontent.com',
        'img.clerk.com'
      ];

      expect(nextConfig.images?.domains).toEqual(
        expect.arrayContaining(expectedDomains)
      );
    });

    it('should not have duplicate domains in remotePatterns', () => {
      const patterns = nextConfig.images?.remotePatterns || [];
      const hostnames = patterns.map(pattern => pattern.hostname);
      const uniqueHostnames = new Set(hostnames);

      expect(hostnames.length).toBe(uniqueHostnames.size);
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have typescript configuration', () => {
      expect(nextConfig.typescript).toEqual({
        ignoreBuildErrors: true,
      });
    });
  });

  describe('Experimental Features', () => {
    it('should have serverActions enabled', () => {
      expect(nextConfig.experimental?.serverActions).toBeDefined();
      expect(typeof nextConfig.experimental?.serverActions).toBe('object');
      expect(nextConfig.experimental?.serverActions.allowedOrigins).toContain('localhost:3000');
    });
  });

  describe('Configuration Structure', () => {
    it('should have all required top-level properties', () => {
      const requiredProperties = ['images', 'typescript', 'experimental'];
      
      requiredProperties.forEach(prop => {
        expect(nextConfig).toHaveProperty(prop);
      });
    });

    it('should have valid image configuration structure', () => {
      expect(nextConfig.images).toEqual(
        expect.objectContaining({
          remotePatterns: expect.any(Array),
          domains: expect.any(Array),
        })
      );
    });
  });

  describe('Security Checks', () => {
    it('should only allow HTTPS protocol in remotePatterns', () => {
      const patterns = nextConfig.images?.remotePatterns || [];
      patterns.forEach(pattern => {
        expect(pattern.protocol).toBe('https');
      });
    });

    it('should have valid hostname patterns', () => {
      const patterns = nextConfig.images?.remotePatterns || [];
      patterns.forEach(pattern => {
        expect(pattern.hostname).toBeTruthy();
        expect(typeof pattern.hostname).toBe('string');
        expect(pattern.hostname.length).toBeGreaterThan(0);
      });
    });
  });
}); 