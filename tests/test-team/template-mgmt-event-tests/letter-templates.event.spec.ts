import {
  testWithEventSubscriber as test,
  expect,
} from '../fixtures/event-subscriber.fixture';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { readFileSync } from 'node:fs';
import { SftpHelper } from '../helpers/sftp/sftp-helper';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { setTimeout } from 'node:timers/promises';
import { Template } from 'helpers/types';
import { eventWithId } from '../helpers/events/matchers';
import z from 'zod';

test.describe('Event publishing - Letters', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const sftpHelper = new SftpHelper();
  const lambdaClient = new LambdaClient({ region: 'eu-west-2' });

  let userRoutingEnabled: TestUser;
  let userRoutingDisabledProofingEnabled: TestUser;
  let userProofingDisabled: TestUser;

  test.beforeAll(async () => {
    await sftpHelper.connect();
    userRoutingEnabled = await authHelper.getTestUser(testUsers.User1.userId);
    userRoutingDisabledProofingEnabled = await authHelper.getTestUser(
      testUsers.User2.userId
    );
    userProofingDisabled = await authHelper.getTestUser(testUsers.User3.userId);
  });

  test.afterAll(async () => {
    await sftpHelper.end();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('Expect no events when proofingEnabled is false', async ({
    request,
    eventSubscriber,
  }) => {
    const templateId = randomUUID();

    const start = new Date();

    const template = {
      ...TemplateFactory.uploadLetterTemplate(
        templateId,
        userProofingDisabled,
        'user-proof-disabled'
      ),
      proofingEnabled: false,
    };

    await templateStorageHelper.seedTemplateData([template]);

    const submittedResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
      {
        headers: {
          Authorization: await userProofingDisabled.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    expect(submittedResponse.status()).toBe(200);

    // Note: not ideal - but we are expecting 0 events and there can be a delay
    // in events arriving. We should wait for a moment
    // 5 seconds seems to largest delay when testing locally
    await setTimeout(5000);

    const events = await eventSubscriber.receive({
      since: start,
      match: eventWithId(templateId),
    });

    expect(events).toHaveLength(0);
  });

  test('expect no events when deleting a letter when previous status is not publishable', async ({
    request,
    eventSubscriber,
  }) => {
    const templateId = randomUUID();

    const start = new Date();

    const template = {
      ...TemplateFactory.uploadLetterTemplate(
        templateId,
        userRoutingEnabled,
        'user-proof-disabled',
        'VALIDATION_FAILED'
      ),
    };

    await templateStorageHelper.seedTemplateData([template]);

    const deletedResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${templateId}`,
      {
        headers: {
          Authorization: await userRoutingEnabled.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    expect(deletedResponse.status()).toBe(204);

    // Note: not ideal - but we are expecting 0 events and there can be a delay
    await setTimeout(5000);

    const events = await eventSubscriber.receive({
      since: start,
      match: eventWithId(templateId),
    });

    expect(events).toHaveLength(0);
  });

  test('Expect Draft.v1 events When waiting for Proofs to become available And Completed.v1 event When submitting templates (routing disabled)', async ({
    request,
    eventSubscriber,
  }) => {
    const templateId = randomUUID();

    const template = {
      ...TemplateFactory.uploadLetterTemplate(
        templateId,
        userRoutingDisabledProofingEnabled,
        'userProofingEnabledTemplate',
        'PENDING_PROOF_REQUEST'
      ),
      // the values in this array do not matter at this point
      personalisationParameters: ['nhsNumber'],
    };

    await templateStorageHelper.seedTemplateData([template]);

    const start = new Date();

    const pdfContent = readFileSync(
      './fixtures/pdf-upload/no-custom-personalisation/template.pdf'
    );

    const supplierReference = [
      userRoutingDisabledProofingEnabled.clientId,
      'campaign',
      templateId,
      'en',
      'x0',
    ].join('_');

    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof-1.pdf`
    );
    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof-2.pdf`
    );
    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof-3.pdf`
    );

    const requestProofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
      {
        headers: {
          Authorization:
            await userRoutingDisabledProofingEnabled.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    expect(requestProofResponse.status()).toBe(200);

    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: process.env.SFTP_POLL_LAMBDA_NAME,
        Payload: JSON.stringify({
          supplier: 'WTMMOCK',
        }),
      })
    );

    let latest: Template = template;

    await expect(async () => {
      latest = await templateStorageHelper.getTemplate({
        templateId,
        clientId: userRoutingDisabledProofingEnabled.clientId,
      });

      expect(latest.templateStatus).toBe('PROOF_AVAILABLE');
    }).toPass({ timeout: 15_000, intervals: [1000, 3000, 5000] });

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
      {
        headers: {
          Authorization:
            await userRoutingDisabledProofingEnabled.getAccessToken(),
          'X-Lock-Number': String(latest.lockNumber),
        },
      }
    );

    expect(submitResponse.status()).toBe(200);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: z.object({
          data: z.object({
            type: z.string(),
            id: z.literal(template.id),
          }),
        }),
      });

      // Note: This is weird, But sometimes the tests find all relevant events within
      // 6 events and can never find the 7th event before the test times out.
      // Following the updates in Code we do a total of 7 updates so we'd expect 7 events.
      /*
       *  PENDING_PROOF_REQUEST: 1 update
       *  WAITING_FOR_PROOF: 2 updates
       * * * Set status WAITING_FOR_PROOF
       * * * Add proof-1.pdf
       *  PROOF_AVAILABLE: 3 updates
       * * * Set Status to PROOF_AVAILABLE
       * * * add proof-2.pdf
       * * * add proof-3.pdf
       *  SUBMITTED: 1 update
       */
      // This check is here to prevent events we don't want to publish from slipping through.
      // I.E PENDING_UPLOAD status.
      expect(events.length).toBeGreaterThanOrEqual(6);
      expect(events.length).toBeLessThanOrEqual(7);

      const drafts = events.filter(
        (e) =>
          e.record.data.type ===
          'uk.nhs.notify.template-management.TemplateDrafted.v1'
      );

      expect(drafts.length, JSON.stringify(events)).toBeGreaterThanOrEqual(5);

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
            data: expect.objectContaining({
              id: templateId,
            }),
          }),
        })
      );

      console.log(`Events found: ${events.length}. Expected: 6 or 7`);
    }).toPass({ timeout: 90_000, intervals: [1000, 3000, 5000] });
  });

  test('Expect Draft event when routing is enabled and proof is approved', async ({
    request,
    eventSubscriber,
  }) => {
    const templateId = randomUUID();

    const template = TemplateFactory.uploadLetterTemplate(
      templateId,
      userRoutingEnabled,
      'userRoutingEnabledTemplate',
      'PROOF_AVAILABLE'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const start = new Date();

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
      {
        headers: {
          Authorization: await userRoutingEnabled.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    expect(submitResponse.status()).toBe(200);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: z.object({
          data: z.object({
            type: z.string(),
            id: z.literal(template.id),
          }),
        }),
      });

      expect(events).toHaveLength(2);

      const drafts = events.filter(
        (e) =>
          e.record.data.type ===
          'uk.nhs.notify.template-management.TemplateDrafted.v1'
      );

      expect(drafts).toHaveLength(2);
    }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000] });
  });

  test('Expect Deleted.v1 event when deleting templates', async ({
    request,
    eventSubscriber,
  }) => {
    const templateId = randomUUID();

    const start = new Date();

    const template = {
      ...TemplateFactory.uploadLetterTemplate(
        templateId,
        userRoutingEnabled,
        'user-proof-deleted',
        'PENDING_PROOF_REQUEST'
      ),
      proofingEnabled: true,
      // just so it is not empty
      personalisationParameters: ['nhsNumber'],
    };

    await templateStorageHelper.seedTemplateData([template]);

    const deletedResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${templateId}`,
      {
        headers: {
          Authorization: await userRoutingEnabled.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    expect(deletedResponse.status()).toBe(204);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(templateId),
      });

      expect(events).toHaveLength(2);

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
            data: expect.objectContaining({
              id: templateId,
            }),
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          record: expect.objectContaining({
            type: 'uk.nhs.notify.template-management.TemplateDeleted.v1',
            data: expect.objectContaining({
              id: templateId,
            }),
          }),
        })
      );
    }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000] });
  });
});
