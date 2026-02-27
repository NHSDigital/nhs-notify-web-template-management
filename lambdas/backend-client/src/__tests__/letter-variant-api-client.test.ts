import MockAdapter from 'axios-mock-adapter';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';
import {
  letterVariantApiClient as client,
  httpClient,
} from '../letter-variant-api-client';

let axiosMock: MockAdapter;

const testToken = 'abc';

describe('LetterVariantAPIClient', () => {
  beforeEach(() => {
    axiosMock = new MockAdapter(httpClient);
  });

  describe('getLetterVariant', () => {
    test('should return error', async () => {
      axiosMock.onGet('/v1/letter-variant/variant-123').reply(404, {
        statusCode: 404,
        technicalMessage: 'Not found',
        details: {
          message: 'Letter variant not found',
        },
      });

      const result = await client.getLetterVariant('variant-123', testToken);

      expect(result.error).toEqual({
        errorMeta: {
          code: 404,
          description: 'Not found',
          details: {
            message: 'Letter variant not found',
          },
        },
      });

      expect(result.data).toBeUndefined();

      expect(axiosMock.history.get.length).toBe(1);
    });

    test('should return letter variant', async () => {
      const letterVariant: LetterVariant = {
        id: 'variant-123',
        name: 'Test Variant',
        bothSides: true,
        dispatchTime: 'standard',
        envelopeSize: 'C4',
        maxSheets: 4,
        postage: 'economy',
        printColour: 'black',
        sheetSize: 'A4',
        status: 'PROD',
        type: 'STANDARD',
      };

      axiosMock.onGet('/v1/letter-variant/variant-123').reply(200, {
        statusCode: 200,
        data: letterVariant,
      });

      const result = await client.getLetterVariant('variant-123', testToken);

      expect(result.data).toEqual(letterVariant);

      expect(result.error).toBeUndefined();
    });
  });
});
