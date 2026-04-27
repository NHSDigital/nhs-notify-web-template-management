import { uuidRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import {
  templateManagementEventSubscriber as test,
  expect,
} from 'fixtures/template-management-event-subscriber';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';
import { ContactDetailHelper } from 'helpers/db/contact-details-helper';
import {
  generateEmailAddress,
  generateMobileNumber,
} from 'helpers/factories/contact-details-factory';
import { eventWithId, eventWithIdIn } from 'helpers/events/matchers';

test.describe('ContactDetailVerificationRequested event publishing', () => {
  let user: TestUser;
  const contactDetailHelper = new ContactDetailHelper();
  const context = getTestContext();

  test.beforeAll(async () => {
    user = await context.auth.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await contactDetailHelper.cleanup();
  });

  test.describe('email contact details', () => {
    test('emits event with an OTP when a new unverified contact detail is added', async ({
      eventSubscriber,
      request,
    }) => {
      const start = new Date();

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

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 201,
        data: expect.objectContaining({
          id: expect.stringMatching(uuidRegExp),
        }),
      });

      contactDetailHelper.addAdHoc(body.data);

      const id = body.data.id as string;

      await expect(async () => {
        const events = await eventSubscriber.receive({
          since: start,
          match: eventWithId(id),
        });

        expect(events).toHaveLength(1);

        expect(events).toContainEqual(
          expect.objectContaining({
            record: expect.objectContaining({
              type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
              data: expect.objectContaining({
                id,
                type: 'EMAIL',
                value: email,
                otp: expect.stringMatching(/^\d{6}$/),
              }),
            }),
          })
        );
      }).toPass({ timeout: 90_000, intervals: [1000, 3000, 5000] });
    });

    test('emits multiple events with different OTPs when re-adding an existing unverified contact detail', async ({
      eventSubscriber,
      request,
    }) => {
      const start = new Date();

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

      const id = created.data.id as string;

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

      const id2 = created2.data.id as string;

      expect(created.data.id).not.toEqual(created2.data.id);

      await expect(async () => {
        const events = await eventSubscriber.receive({
          since: start,
          match: eventWithIdIn([id, id2]),
        });

        expect(events).toHaveLength(2);

        expect(events).toContainEqual(
          expect.objectContaining({
            record: expect.objectContaining({
              type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
              data: expect.objectContaining({
                id,
                type: 'EMAIL',
                value: email,
                otp: expect.stringMatching(/^\d{6}$/),
              }),
            }),
          })
        );

        expect(events).toContainEqual(
          expect.objectContaining({
            record: expect.objectContaining({
              type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
              data: expect.objectContaining({
                id: id2,
                type: 'EMAIL',
                value: email,
                otp: expect.stringMatching(/^\d{6}$/),
              }),
            }),
          })
        );

        expect(events[0].record.data.otp).not.toEqual(
          events[1].record.data.otp
        );
      }).toPass({ timeout: 90_000, intervals: [1000, 3000, 5000] });
    });
  });

  test.describe('sms contact details', () => {
    test('emits event with an OTP when a new unverified contact detail is added', async ({
      eventSubscriber,
      request,
    }) => {
      const start = new Date();

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

      const body = await response.json();

      expect(body).toEqual({
        statusCode: 201,
        data: expect.objectContaining({
          id: expect.stringMatching(uuidRegExp),
        }),
      });

      contactDetailHelper.addAdHoc(body.data);

      const id = body.data.id as string;

      await expect(async () => {
        const events = await eventSubscriber.receive({
          since: start,
          match: eventWithId(id),
        });

        expect(events).toHaveLength(1);

        expect(events).toContainEqual(
          expect.objectContaining({
            record: expect.objectContaining({
              type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
              data: expect.objectContaining({
                id,
                type: 'SMS',
                value: num,
                otp: expect.stringMatching(/^\d{6}$/),
              }),
            }),
          })
        );
      }).toPass({ timeout: 90_000, intervals: [1000, 3000, 5000] });
    });

    test('emits multiple events with different OTPs when re-adding an existing unverified contact detail', async ({
      eventSubscriber,
      request,
    }) => {
      const start = new Date();

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

      const id = created.data.id as string;

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

      const id2 = created2.data.id as string;

      expect(created.data.id).not.toEqual(created2.data.id);

      await expect(async () => {
        const events = await eventSubscriber.receive({
          since: start,
          match: eventWithIdIn([id, id2]),
        });

        expect(events).toHaveLength(2);

        expect(events).toContainEqual(
          expect.objectContaining({
            record: expect.objectContaining({
              type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
              data: expect.objectContaining({
                id,
                type: 'SMS',
                value: num,
                otp: expect.stringMatching(/^\d{6}$/),
              }),
            }),
          })
        );

        expect(events).toContainEqual(
          expect.objectContaining({
            record: expect.objectContaining({
              type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
              data: expect.objectContaining({
                id: id2,
                type: 'SMS',
                value: num,
                otp: expect.stringMatching(/^\d{6}$/),
              }),
            }),
          })
        );

        expect(events[0].record.data.otp).not.toEqual(
          events[1].record.data.otp
        );
      }).toPass({ timeout: 90_000, intervals: [1000, 3000, 5000] });
    });
  });
});
