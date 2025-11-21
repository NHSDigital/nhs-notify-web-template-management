import { getAuthUrl } from '@utils/get-auth-url';

describe('getAuthUrl', () => {
  const originalWindow = { ...global.window };
  const originalEnv = { ...process.env };

  afterAll(() => {
    Object.defineProperty(process, 'env', {
      value: originalEnv,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: originalWindow,
      configurable: true,
    });
  });

  describe('client side (when window is available)', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            protocol: 'https:',
            host: 'nhsnotify.national.nhs.uk',
          },
        },
        configurable: true,
      });
    });

    afterAll(() => {
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        configurable: true,
      });
    });

    it('should construct URL', () => {
      const result = getAuthUrl('/auth');
      expect(result).toBe('https://nhsnotify.national.nhs.uk/auth');
    });

    it('should handle query parameters', () => {
      const result = getAuthUrl('/auth?redirect=%2Ftemplates%2Fcreate');

      expect(result).toBe(
        'https://nhsnotify.national.nhs.uk/auth?redirect=%2Ftemplates%2Fcreate'
      );
    });

    describe('in development env', () => {
      beforeEach(() => {
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'development',
          configurable: true,
        });
      });

      afterAll(() => {
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: originalEnv,
          configurable: true,
        });
      });

      it('should include the base path set', () => {
        process.env.NEXT_PUBLIC_BASE_PATH = '/base-path';

        const result = getAuthUrl('/auth');
        expect(result).toBe('https://nhsnotify.national.nhs.uk/base-path/auth');
      });

      it('should fallback to templates when no base path environment variable provided', () => {
        delete process.env.NEXT_PUBLIC_BASE_PATH;

        const result = getAuthUrl('/auth');
        expect(result).toBe('https://nhsnotify.national.nhs.uk/templates/auth');
      });
    });
  });

  describe('when window is not available', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).window;
    });

    afterAll(() => {
      global.window = originalWindow;
    });

    describe('when gateway URL environment variable is available', () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_GATEWAY_URL =
          'https://dev.web-gateway.nhsnotify.national.nhs.uk';
      });

      it('should use NEXT_PUBLIC_GATEWAY_URL', () => {
        const result = getAuthUrl('/auth');
        expect(result).toBe(
          'https://dev.web-gateway.nhsnotify.national.nhs.uk/auth'
        );
      });

      it('should handle query parameters', () => {
        const result = getAuthUrl('/auth?redirect=%2Ftemplates%2Fcreate');
        expect(result).toBe(
          'https://dev.web-gateway.nhsnotify.national.nhs.uk/auth?redirect=%2Ftemplates%2Fcreate'
        );
      });

      describe('in development env', () => {
        beforeEach(() => {
          Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'development',
            configurable: true,
          });
        });

        afterAll(() => {
          Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalEnv,
            configurable: true,
          });
        });

        it('should include the base path set', () => {
          process.env.NEXT_PUBLIC_BASE_PATH = '/base-path';

          const result = getAuthUrl('/auth');
          expect(result).toBe(
            'https://dev.web-gateway.nhsnotify.national.nhs.uk/base-path/auth'
          );
        });

        it('should fallback to templates when no base path environment variable provided', () => {
          delete process.env.NEXT_PUBLIC_BASE_PATH;

          const result = getAuthUrl('/auth');
          expect(result).toBe(
            'https://dev.web-gateway.nhsnotify.national.nhs.uk/templates/auth'
          );
        });
      });
    });

    describe('when no gateway URL environment variable is available', () => {
      beforeEach(() => {
        delete process.env.NEXT_PUBLIC_GATEWAY_URL;
      });

      it('should fallback to localhost:3000', () => {
        const result = getAuthUrl('/auth');
        expect(result).toBe('http://localhost:3000/auth');
      });

      describe('in development env', () => {
        beforeEach(() => {
          Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'development',
            configurable: true,
          });
        });

        afterAll(() => {
          Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalEnv,
            configurable: true,
          });
        });

        it('should include the base path set', () => {
          process.env.NEXT_PUBLIC_BASE_PATH = '/base-path';

          const result = getAuthUrl('/auth');
          expect(result).toBe('http://localhost:3000/base-path/auth');
        });

        it('should fallback to templates when no base path environment variable provided', () => {
          delete process.env.NEXT_PUBLIC_BASE_PATH;

          const result = getAuthUrl('/auth');
          expect(result).toBe('http://localhost:3000/templates/auth');
        });
      });
    });
  });
});
