import { $RenderRequest } from '../../schemas/render-request';

describe('$RenderRequest', () => {
  describe('InitialRenderRequest', () => {
    const validInitialRequest = {
      requestType: 'initial',
      templateId: 'template-123',
      clientId: 'client-456',
      docxCurrentVersion: 'version-789',
    };

    test('should pass validation for valid initial render request', () => {
      const result = $RenderRequest.safeParse(validInitialRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInitialRequest);
    });

    test.each(['templateId', 'clientId', 'docxCurrentVersion'] as const)(
      'should fail validation when %s is missing',
      (field) => {
        const { [field]: _, ...request } = validInitialRequest;

        const result = $RenderRequest.safeParse(request);

        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors).toEqual({
          [field]: ['Invalid input: expected string, received undefined'],
        });
      }
    );

    test('should fail validation when requestType is invalid', () => {
      const result = $RenderRequest.safeParse({
        ...validInitialRequest,
        requestType: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('PersonalisedRenderRequest - short variant', () => {
    const validShortRequest = {
      requestType: 'personalised',
      requestTypeVariant: 'short',
      templateId: 'template-123',
      clientId: 'client-456',
      docxCurrentVersion: 'version-789',
      personalisation: { name: 'Test User' },
      systemPersonalisationPackId: 'pack-abc',
      lockNumber: 1,
    };

    test('should pass validation for valid short personalised render request', () => {
      const result = $RenderRequest.safeParse(validShortRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validShortRequest);
    });

    test.each([
      'templateId',
      'clientId',
      'docxCurrentVersion',
      'personalisation',
      'systemPersonalisationPackId',
      'lockNumber',
    ] as const)('should fail validation when %s is missing', (field) => {
      const { [field]: _, ...request } = validShortRequest;

      const result = $RenderRequest.safeParse(request);

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toHaveProperty(field);
    });

    test('should fail validation when personalisation has non-string values', () => {
      const result = $RenderRequest.safeParse({
        ...validShortRequest,
        personalisation: { name: 123 },
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        personalisation: [expect.stringContaining('Invalid input')],
      });
    });

    test('should fail validation when lockNumber is not a number', () => {
      const result = $RenderRequest.safeParse({
        ...validShortRequest,
        lockNumber: 'not-a-number',
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        lockNumber: ['Invalid input: expected number, received string'],
      });
    });
  });

  describe('PersonalisedRenderRequest - long variant', () => {
    const validLongRequest = {
      requestType: 'personalised',
      requestTypeVariant: 'long',
      templateId: 'template-123',
      clientId: 'client-456',
      docxCurrentVersion: 'version-789',
      personalisation: { address: '123 Main St' },
      systemPersonalisationPackId: 'pack-xyz',
      lockNumber: 2,
    };

    test('should pass validation for valid long personalised render request', () => {
      const result = $RenderRequest.safeParse(validLongRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validLongRequest);
    });

    test('should fail validation when requestTypeVariant is invalid', () => {
      const result = $RenderRequest.safeParse({
        ...validLongRequest,
        requestTypeVariant: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('discriminated union behaviour', () => {
    test('should discriminate between initial and personalised request types', () => {
      const initialRequest = {
        requestType: 'initial',
        templateId: 'template-123',
        clientId: 'client-456',
        docxCurrentVersion: 'version-789',
      };

      const personalisedRequest = {
        requestType: 'personalised',
        requestTypeVariant: 'short',
        templateId: 'template-123',
        clientId: 'client-456',
        docxCurrentVersion: 'version-789',
        personalisation: {},
        systemPersonalisationPackId: 'pack-id',
        lockNumber: 0,
      };

      const initialResult = $RenderRequest.safeParse(initialRequest);
      const personalisedResult = $RenderRequest.safeParse(personalisedRequest);

      expect(initialResult.success).toBe(true);
      expect(personalisedResult.success).toBe(true);

      if (initialResult.success && personalisedResult.success) {
        expect(initialResult.data.requestType).toBe('initial');
        expect(personalisedResult.data.requestType).toBe('personalised');
      }
    });

    test('should discriminate between short and long personalised variants', () => {
      const basePersonalised = {
        requestType: 'personalised',
        templateId: 'template-123',
        clientId: 'client-456',
        docxCurrentVersion: 'version-789',
        personalisation: {},
        systemPersonalisationPackId: 'pack-id',
        lockNumber: 0,
      };

      const shortResult = $RenderRequest.safeParse({
        ...basePersonalised,
        requestTypeVariant: 'short',
      });

      const longResult = $RenderRequest.safeParse({
        ...basePersonalised,
        requestTypeVariant: 'long',
      });

      expect(shortResult.success).toBe(true);
      expect(longResult.success).toBe(true);

      if (shortResult.success && longResult.success) {
        expect(shortResult.data).toHaveProperty('requestTypeVariant', 'short');
        expect(longResult.data).toHaveProperty('requestTypeVariant', 'long');
      }
    });
  });
});
