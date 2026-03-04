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

    test('should fail validation when required field is missing', () => {
      const { templateId: _, ...request } = validInitialRequest;

      const result = $RenderRequest.safeParse(request);

      expect(result.success).toBe(false);
    });

    test('should fail validation when requestType is invalid', () => {
      const result = $RenderRequest.safeParse({
        ...validInitialRequest,
        requestType: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('PersonalisedRenderRequest', () => {
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

    test('should pass validation for valid personalised render request', () => {
      const result = $RenderRequest.safeParse(validShortRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validShortRequest);
    });

    test('should fail validation when required field is missing', () => {
      const { templateId: _, ...request } = validShortRequest;

      const result = $RenderRequest.safeParse(request);

      expect(result.success).toBe(false);
    });

    test('should fail validation when personalisation has non-string values', () => {
      const result = $RenderRequest.safeParse({
        ...validShortRequest,
        personalisation: { name: 123 },
      });

      expect(result.success).toBe(false);
    });

    test('should fail validation when lockNumber is not a number', () => {
      const result = $RenderRequest.safeParse({
        ...validShortRequest,
        lockNumber: 'not-a-number',
      });

      expect(result.success).toBe(false);
    });
  });
});
