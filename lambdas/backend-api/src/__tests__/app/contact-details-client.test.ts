import { mock } from 'jest-mock-extended';
import type { FailureResult } from 'nhs-notify-backend-client/types';
import type { User } from 'nhs-notify-web-template-management-utils';
import { ContactDetailsClient } from '@backend-api/app/contact-details-client';
import type { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';
import type { OtpService } from '@backend-api/infra/otp-service';

const USER: User = {
  internalUserId: 'user-id',
  clientId: 'client-id',
};

const OTP = '1234';

function setup() {
  const contactDetailsRepo = mock<ContactDetailsRepository>();
  contactDetailsRepo.putContactDetail.mockImplementation(
    ({ rawValue, ...input }, _, user) =>
      Promise.resolve({
        data: {
          ...input,
          clientId: user.clientId,
          id: 'contact-details-id',
          status: 'PENDING_VERIFICATION',
        },
      })
  );

  const otpService = mock<OtpService>();
  otpService.generate.mockResolvedValue({
    data: OTP,
  });
  otpService.send.mockResolvedValue({
    data: undefined,
  });

  const client = new ContactDetailsClient(contactDetailsRepo, otpService);

  return {
    client,
    mocks: { contactDetailsRepo, otpService },
  };
}

describe('ContactDetailsClient', () => {
  describe('requestVerification', () => {
    it.each([
      {
        input: { type: 'EMAIL', value: ' TEST@nhs.net ' },
        validated: {
          type: 'EMAIL',
          value: 'test@nhs.net',
          rawValue: ' TEST@nhs.net ',
        },
        expected: {
          clientId: USER.clientId,
          id: 'contact-details-id',
          type: 'EMAIL',
          value: 'test@nhs.net',
          status: 'PENDING_VERIFICATION',
        },
      },
      {
        input: { type: 'SMS', value: '07890 123 456' },
        validated: {
          type: 'SMS',
          value: '+447890123456',
          rawValue: '07890 123 456',
        },
        expected: {
          clientId: USER.clientId,
          id: 'contact-details-id',
          type: 'SMS',
          value: '+447890123456',
          status: 'PENDING_VERIFICATION',
        },
      },
    ])(
      'validates, saves and sends OTP for $input.type contact details',
      async ({ input, validated, expected }) => {
        const { client, mocks } = setup();

        const result = await client.requestVerification(input, USER);

        expect(result).toEqual({ data: expected });

        expect(mocks.contactDetailsRepo.putContactDetail).toHaveBeenCalledWith(
          validated,
          OTP,
          USER
        );

        expect(mocks.otpService.send).toHaveBeenCalledWith(expected, OTP);
      }
    );
    it('returns payload validation error result', async () => {
      const { client } = setup();

      const result = await client.requestVerification({}, USER);

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(400);
      expect(result.error?.errorMeta.description).toBe(
        'Request failed validation'
      );
    });

    it('returns otp generation error result', async () => {
      const { client, mocks } = setup();

      const error: FailureResult = {
        error: {
          errorMeta: {
            code: 500,
            description: 'Something went wrong',
          },
        },
      };

      mocks.otpService.generate.mockResolvedValueOnce(error);

      const result = await client.requestVerification(
        {
          type: 'SMS',
          value: '07890123456',
        },
        USER
      );

      expect(result).toBe(error);
    });

    it('returns error result from saving contact details', async () => {
      const { client, mocks } = setup();

      const error: FailureResult = {
        error: {
          errorMeta: {
            code: 500,
            description: 'Something went wrong',
          },
        },
      };

      mocks.contactDetailsRepo.putContactDetail.mockResolvedValueOnce(error);

      const result = await client.requestVerification(
        {
          type: 'SMS',
          value: '07890123456',
        },
        USER
      );

      expect(result).toBe(error);
    });

    it('returns error result from sending otp', async () => {
      const { client, mocks } = setup();

      const error: FailureResult = {
        error: {
          errorMeta: {
            code: 500,
            description: 'Something went wrong',
          },
        },
      };

      mocks.otpService.send.mockResolvedValueOnce(error);

      const result = await client.requestVerification(
        {
          type: 'SMS',
          value: '07890123456',
        },
        USER
      );

      expect(result).toBe(error);
    });
  });
});
