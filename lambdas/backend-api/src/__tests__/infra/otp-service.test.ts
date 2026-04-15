import crypto from 'node:crypto';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { OtpService } from '@backend-api/infra/otp-service';

jest.mock('nhs-notify-web-template-management-utils/logger');

const service = new OtpService(jest.mocked(logger));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OtpService', () => {
  describe('generate', () => {
    it('returns a random 6 digit integer OTP', async () => {
      jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => 123_456);

      const result = await service.generate();

      expect(result).toEqual({ data: '123456' });

      expect(crypto.randomInt).toHaveBeenCalledWith(0, 1_000_000);
    });

    it('pads with leading 0s', async () => {
      jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => 123);

      const result = await service.generate();

      expect(result).toEqual({ data: '000123' });
    });

    it('returns internal error result if number generation fails', async () => {
      jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => {
        throw new Error('Oh no');
      });

      const result = await service.generate();

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.error?.errorMeta.description).toBe(
        'Unable to generate OTP'
      );
    });
  });

  describe('send', () => {
    it('stub implementation - logs the contact detail', async () => {
      const result = await service.send(
        {
          id: 'contact-details-id',
          clientId: 'client-id',
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: 'email@nhs.net',
        },
        '123456'
      );

      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();

      expect(logger.info).toHaveBeenCalledWith({
        description: 'Fake sending OTP',
        details: {
          id: 'contact-details-id',
          clientId: 'client-id',
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
        },
      });
    });
  });
});
