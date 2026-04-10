import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { uuidRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';
import { ContactDetailHelper } from 'helpers/db/contact-details-helper';
import { makeVerifiedContactDetail } from 'helpers/factories/contact-details-factory';

const generateEmailAddress = () => faker.internet.exampleEmail().toLowerCase();

type Locale = 'GB' | 'GG' | 'IM' | 'JE';

const generateMobileNumber = (locale: Locale = 'GB') => {
  let regexp = '+4477[0-9]{8}';

  switch (locale) {
    case 'GG': {
      regexp = '+447781[0-9]{6}';
      break;
    }
    case 'IM': {
      regexp = '+447624[2-4]{1}[0-9]{5}';
      break;
    }
    case 'JE': {
      regexp = '+447509[0-9]{6}';
      break;
    }

    default: {
      break;
    }
  }

  return faker.helpers.fromRegExp(regexp);
};

test.describe('PUT /v1/contact-details', () => {
  let user: TestUser;
  let userFeatureDisabled: TestUser;
  const contactDetailHelper = new ContactDetailHelper();
  const context = getTestContext();

  test.beforeAll(async () => {
    user = await context.auth.getTestUser(
      testUsers.UserDigitalProofingEnabled.userId
    );
    userFeatureDisabled = await context.auth.getTestUser(
      testUsers.User1.userId
    );
  });

  test.afterAll(async () => {
    await contactDetailHelper.cleanup();
  });

  test.describe('email verification', () => {
    test('saves normalized email contact detail and sends otp', async ({
      request,
    }) => {
      const email = generateEmailAddress();
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'EMAIL',
            value: ` ${email.toUpperCase()} `,
          },
        }
      );

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 201,
        data: {
          id: expect.stringMatching(uuidRegExp),
          clientId: user.clientId,
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: email,
        },
      });

      contactDetailHelper.addAdHoc(body.data);
    });

    test('creates a new request for email verification when old request has not been verified', async ({
      request,
    }) => {
      const email = generateEmailAddress();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'EMAIL',
            value: email,
          },
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      contactDetailHelper.addAdHoc(created.data);

      const response2 = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'EMAIL',
            value: email,
          },
        }
      );

      expect(response2.status()).toBe(201);

      const created2 = await response2.json();

      expect(created.data.id).not.toEqual(created2.data.id);
    });

    for (const email of [
      '',
      'no-at.domain.com',
      `l${'o'.repeat(310)}ng@nhs.net`,
      'email@123.123.123.123',
      'notanemailaddress',
    ]) {
      test(`returns 400 if email address is invalid [${email || 'empty'}]`, async ({
        request,
      }) => {
        const response = await request.post(
          `${process.env.API_BASE_URL}/v1/contact-details`,
          {
            headers: {
              Authorization: await user.getAccessToken(),
            },
            data: {
              type: 'EMAIL',
              value: email,
            },
          }
        );

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body).toEqual({
          statusCode: 400,
          technicalMessage: 'Request failed validation',
          details: {
            value: 'Invalid email address',
          },
        });
      });
    }

    test('returns 409 if email contact detail is already verified for the client', async ({
      request,
    }) => {
      const email = generateEmailAddress();

      const contactDetail = makeVerifiedContactDetail({
        type: 'EMAIL',
        value: email,
        clientId: user.clientId,
      });

      await contactDetailHelper.seed([contactDetail]);

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'EMAIL',
            value: email,
          },
        }
      );

      expect(response.status()).toBe(409);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 409,
        technicalMessage: 'Contact details already verified.',
      });
    });

    test('allows verification of email address that is already verified for another client', async ({
      request,
    }) => {
      const email = generateEmailAddress();

      // Seed a verified email address for one client
      const contactDetail = makeVerifiedContactDetail({
        type: 'EMAIL',
        value: email,
        clientId: userFeatureDisabled.clientId,
      });

      await contactDetailHelper.seed([contactDetail]);

      // Request verification of the same email address for a different client
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'EMAIL',
            value: email,
          },
        }
      );

      // A new record is created
      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 201,
        data: {
          id: expect.stringMatching(uuidRegExp),
          clientId: user.clientId,
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: email,
        },
      });

      contactDetailHelper.addAdHoc(body.data);

      expect(body.data.id).not.toEqual(contactDetail.id);
    });

    test('returns 403 if the email proofing feature is disabled for the client', async ({
      request,
    }) => {
      const email = generateEmailAddress();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await userFeatureDisabled.getAccessToken(),
          },
          data: {
            type: 'EMAIL',
            value: email,
          },
        }
      );

      expect(response.status()).toBe(403);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 403,
        technicalMessage:
          'User cannot request contact detail verification for EMAIL.',
      });
    });
  });

  test.describe('sms verification', () => {
    for (const locale of ['GB', 'GG', 'IM', 'JE'] as Locale[]) {
      test(`saves normalized sms contact detail and sends otp (${locale})`, async ({
        request,
      }) => {
        const num = generateMobileNumber(locale);

        const response = await request.post(
          `${process.env.API_BASE_URL}/v1/contact-details`,
          {
            headers: {
              Authorization: await user.getAccessToken(),
            },
            data: {
              type: 'SMS',
              value: ` ${num.replace('+44', '0')} `,
            },
          }
        );

        expect(response.status()).toBe(201);

        const body = await response.json();

        expect(body).toEqual({
          statusCode: 201,
          data: {
            id: expect.stringMatching(uuidRegExp),
            clientId: user.clientId,
            status: 'PENDING_VERIFICATION',
            type: 'SMS',
            value: num,
          },
        });

        contactDetailHelper.addAdHoc(body.data);
      });
    }

    test('creates a new request for sms verification when old request has not been verified', async ({
      request,
    }) => {
      const num = generateMobileNumber();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'SMS',
            value: num,
          },
        }
      );

      expect(response.status()).toBe(201);

      const created = await response.json();

      contactDetailHelper.addAdHoc(created.data);

      const response2 = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'SMS',
            value: num,
          },
        }
      );

      expect(response2.status()).toBe(201);

      const created2 = await response2.json();

      expect(created.data.id).not.toEqual(created2.data.id);
    });

    for (const num of [
      '',
      '0772345678910', // invalid mobile
      '01174960860', // landline
      '0800001066', // commercial number
      '07700900010', // fictitious number
      '+0012025550104', // international number
      'notaphonenumber',
    ]) {
      test(`returns 400 if phone number is invalid [${num || 'empty'}]`, async ({
        request,
      }) => {
        const response = await request.post(
          `${process.env.API_BASE_URL}/v1/contact-details`,
          {
            headers: {
              Authorization: await user.getAccessToken(),
            },
            data: {
              type: 'SMS',
              value: num,
            },
          }
        );

        expect(response.status()).toBe(400);

        const body = await response.json();

        expect(body).toEqual({
          statusCode: 400,
          technicalMessage: 'Request failed validation',
          details: {
            value: 'Invalid phone number',
          },
        });
      });
    }

    test('returns 409 if sms contact detail is already verified for the client', async ({
      request,
    }) => {
      const num = generateMobileNumber();

      const contactDetail = makeVerifiedContactDetail({
        type: 'SMS',
        value: num,
        clientId: user.clientId,
      });

      await contactDetailHelper.seed([contactDetail]);

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'SMS',
            value: num,
          },
        }
      );

      expect(response.status()).toBe(409);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 409,
        technicalMessage: 'Contact details already verified.',
      });
    });

    test('allows verification of sms that is already verified for another client', async ({
      request,
    }) => {
      const num = generateMobileNumber();

      // Seed a verified phone number for one client
      const contactDetail = makeVerifiedContactDetail({
        type: 'SMS',
        value: num,
        clientId: userFeatureDisabled.clientId,
      });

      await contactDetailHelper.seed([contactDetail]);

      // Request verification of the same number for a different client
      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await user.getAccessToken(),
          },
          data: {
            type: 'SMS',
            value: num,
          },
        }
      );

      // A new record is created
      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 201,
        data: {
          id: expect.stringMatching(uuidRegExp),
          clientId: user.clientId,
          status: 'PENDING_VERIFICATION',
          type: 'SMS',
          value: num,
        },
      });

      contactDetailHelper.addAdHoc(body.data);

      expect(body.data.id).not.toEqual(contactDetail.id);
    });

    test('returns 403 if the sms proofing feature is disabled for the client', async ({
      request,
    }) => {
      const num = generateMobileNumber();

      const response = await request.post(
        `${process.env.API_BASE_URL}/v1/contact-details`,
        {
          headers: {
            Authorization: await userFeatureDisabled.getAccessToken(),
          },
          data: {
            type: 'SMS',
            value: num,
          },
        }
      );

      expect(response.status()).toBe(403);

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 403,
        technicalMessage:
          'User cannot request contact detail verification for SMS.',
      });
    });
  });

  test('returns 401 is no auth token on request', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/contact-details`,
      {
        data: {
          type: 'EMAIL',
          value: generateEmailAddress(),
        },
      }
    );

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 400 if type attribute is invalid', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/contact-details`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
        },
        data: {
          type: 'NHSAPP',
          value: '9000003334',
        },
      }
    );

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      details: {
        type: 'Invalid input',
      },
      statusCode: 400,
      technicalMessage: 'Request failed validation',
    });
  });
});
