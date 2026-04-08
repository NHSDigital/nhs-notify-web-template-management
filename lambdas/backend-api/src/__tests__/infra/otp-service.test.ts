import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { OtpService } from '@backend-api/infra/otp-service';
import { TOTP } from 'totp-generator';

const SECRET_PATH = '/path/to/secret/parameter';

jest.mock('totp-generator');

function setup() {
  const ssm = mockClient(SSMClient);
  const service = new OtpService(ssm as unknown as SSMClient, SECRET_PATH);

  return { service, mocks: { ssm } };
}

describe('OtpService', () => {
  describe('generate', () => {
    it('returns an OTP generated using the secret stored in SSM', async () => {
      const { service, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).resolvesOnce({
        Parameter: { Value: 'SUPER_SECRET' },
      });

      jest
        .mocked(TOTP)
        .generate.mockResolvedValueOnce({ otp: '1234', expires: 0 });

      const result = await service.generate();

      expect(result).toEqual({ data: '1234' });

      expect(mocks.ssm).toHaveReceivedCommandWith(GetParameterCommand, {
        Name: SECRET_PATH,
        WithDecryption: true,
      });

      expect(TOTP.generate).toHaveBeenCalledWith('SUPER_SECRET');
    });

    it('returns internal error result if ssm call fails', async () => {
      const { service, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).rejectsOnce(new Error('oh no'));

      const result = await service.generate();

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.error?.errorMeta.description).toBe(
        'Unable to generate OTP'
      );
    });

    it('returns internal error result if ssm call returns no parameter', async () => {
      const { service, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).resolvesOnce({});

      const result = await service.generate();

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.error?.errorMeta.description).toBe(
        'Unable to generate OTP'
      );
    });

    it('returns internal error result if ssm call returns empty parameter', async () => {
      const { service, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).resolvesOnce({
        Parameter: {
          Value: '',
        },
      });

      const result = await service.generate();

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.error?.errorMeta.description).toBe(
        'Unable to generate OTP'
      );
    });

    it('returns internal error result if OTP generation fails', async () => {
      const { service, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).resolvesOnce({
        Parameter: {
          Value: 'SUPER_SECRET',
        },
      });

      jest.mocked(TOTP.generate).mockRejectedValueOnce(new Error('oh no'));

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

      const { service } = setup();

      const result = await service.send(
        {
          id: 'contact-details-id',
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: 'email@nhs.net',
        },
        '1234'
      );

      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();

      expect(console.log).toHaveBeenCalledWith({
        id: 'contact-details-id',
        otp: '1234',
      });
    });
  });
});
