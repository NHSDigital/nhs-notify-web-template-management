import crypto from 'node:crypto';
import { OtpService } from '@backend-api/infra/otp-service';

const service = new OtpService();

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
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('stub implementation - logs the contact details and otp', async () => {
      jest.spyOn(console, 'log');

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

      expect(console.log).toHaveBeenCalledWith({
        id: 'contact-details-id',
        otp: '123456',
      });
    });
  });
});
