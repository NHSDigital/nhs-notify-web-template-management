import { getAuthUrl } from '@utils/get-auth-url';

describe('getAuthUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('in production', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      });
      process.env.NOTIFY_DOMAIN_NAME = 'nhsnotify.nhs.uk';
    });

    it('should use https protocol', () => {
      const result = getAuthUrl('/auth');
      expect(result).toBe('https://nhsnotify.nhs.uk/auth');
    });

    it('should not include basePath for auth app URLs', () => {
      const result = getAuthUrl('/auth/signout');
      expect(result).toBe('https://nhsnotify.nhs.uk/auth/signout');
    });

    it('should handle query parameters', () => {
      const result = getAuthUrl('/auth?redirect=%2Ftemplates%2Fcreate');
      expect(result).toBe(
        'https://nhsnotify.nhs.uk/auth?redirect=%2Ftemplates%2Fcreate'
      );
    });

    it('should fallback to localhost when NOTIFY_DOMAIN_NAME is not set', () => {
      delete process.env.NOTIFY_DOMAIN_NAME;
      const result = getAuthUrl('/auth');
      expect(result).toBe('https://localhost:3000/auth');
    });
  });

  describe('in development', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    it('should use http protocol', () => {
      const result = getAuthUrl('/auth');
      expect(result).toBe('http://localhost:3000/templates/auth');
    });

    it('should include basePath to hit local auth pages', () => {
      process.env.NEXT_PUBLIC_BASE_PATH = '/templates';
      const result = getAuthUrl('/auth');
      expect(result).toBe('http://localhost:3000/templates/auth');
    });

    it('should fallback to /templates basePath when NEXT_PUBLIC_BASE_PATH is undefined', () => {
      delete process.env.NEXT_PUBLIC_BASE_PATH;
      const result = getAuthUrl('/auth');
      expect(result).toBe('http://localhost:3000/templates/auth');
    });

    it('should handle query parameters with basePath', () => {
      const result = getAuthUrl('/auth?redirect=%2Ftemplates%2Fcreate');
      expect(result).toBe(
        'http://localhost:3000/templates/auth?redirect=%2Ftemplates%2Fcreate'
      );
    });
  });
});
