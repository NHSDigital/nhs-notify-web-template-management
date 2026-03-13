import { randomUUID } from 'node:crypto';
import {
  templateManagementEventSubscriber as test,
  expect,
} from '../fixtures/template-management-event-subscriber';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { eventWithId } from '../helpers/events/matchers';
import { ProofRequestsStorageHelper } from 'helpers/db/proof-requests-storage-helper';

test.describe('ProofRequestedEvent', () => {
  const authHelper = createAuthHelper();
  const proofRequestsStorageHelper = new ProofRequestsStorageHelper();

  let user: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await proofRequestsStorageHelper.deleteSeeded();
  });

  test('Expect a ProofRequestedEventv1 to be published when a proof request is created', async ({
    eventSubscriber,
  }) => {
    const start = new Date();

    const proofRequestId = randomUUID();

    // TODO: CCM-7941 - use API rather than directly into DB.
    await proofRequestsStorageHelper.seed([
      {
        id: proofRequestId,
        owner: `CLIENT#${user.clientId}`,
        createdAt: new Date().toISOString(),
        personalisation: {
          gpSurgery: 'Test GP Surgery',
        },
        contactDetails: {
          sms: '07999999999',
        },
        templateId: randomUUID(),
        templateType: 'SMS',
        testPatientNhsNumber: '9999999999',
      },
    ]);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(proofRequestId),
      });

      expect(events).toHaveLength(1);

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.ProofRequested.v1',
            data: expect.objectContaining({
              id: proofRequestId,
              testPatientNhsNumber: '9999999999',
              templateType: 'SMS',
              personalisation: {
                gpSurgery: 'Test GP Surgery',
              },
              contactDetails: {
                sms: '07999999999',
              },
            }),
          }),
        })
      );
    }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000] });
  });
});
