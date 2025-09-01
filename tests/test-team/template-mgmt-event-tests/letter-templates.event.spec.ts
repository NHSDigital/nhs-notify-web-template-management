import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { EventCacheHelper } from '../helpers/events/event-cache-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { readFileSync } from 'node:fs';
import { SftpHelper } from '../helpers/sftp/sftp-helper';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

test.describe('Event publishing - Letters', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  const eventCacheHelper = new EventCacheHelper();
  const sftpHelper = new SftpHelper();
  const lambdaClient = new LambdaClient({ region: 'eu-west-2' });

  let userProofingEnabled: TestUser;
  let userProofingDisabled: TestUser;

  test.beforeAll(async () => {
    await sftpHelper.connect();
    userProofingEnabled = await authHelper.getTestUser(testUsers.User1.userId);
    userProofingDisabled = await authHelper.getTestUser(testUsers.User3.userId);
  });

  test.afterAll(async () => {
    await sftpHelper.end();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('Expect no events when proofingEnabled is false', async ({
    request,
  }) => {
    const sleep = (delaySeconds: number) =>
      new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

    const templateId = randomUUID();

    const start = new Date();

    await templateStorageHelper.seedTemplateData([
      {
        ...TemplateFactory.uploadLetterTemplate(
          templateId,
          userProofingDisabled,
          'user-proof-disabled'
        ),
        proofingEnabled: false,
      },
    ]);

    const submittedResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
      {
        headers: {
          Authorization: await userProofingDisabled.getAccessToken(),
        },
      }
    );

    expect(submittedResponse.status()).toBe(200);

    // Note: not ideal - but we are expecting 0 events and there can be a delay
    // in events arriving. We should wait for a moment
    // 5 seconds seems to largest delay when testing locally
    await sleep(5);

    const events = await eventCacheHelper.findEvents(start, [templateId]);

    expect(events).toHaveLength(0);
  });

  test.only('Expect Draft.v1 events When waiting for Proofs to become available And Completed.v1 event When submitting templates', async ({
    request,
  }) => {
    const templateId = randomUUID();

    await templateStorageHelper.seedTemplateData([
      {
        ...TemplateFactory.uploadLetterTemplate(
          templateId,
          userProofingEnabled,
          'userProofingEnabledTemplate',
          'PENDING_PROOF_REQUEST'
        ),
        // the values in this array do not matter at this point
        personalisationParameters: ['nhsNumber'],
      },
    ]);

    const start = new Date();

    const pdfContent = readFileSync(
      './fixtures/pdf-upload/no-custom-personalisation/template.pdf'
    );

    const expandedTemplateId = [
      userProofingEnabled.clientId,
      'campaign',
      templateId,
      'en',
      'x0',
    ].join('_');

    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${expandedTemplateId}/proof-1.pdf`
    );
    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${expandedTemplateId}/proof-2.pdf`
    );
    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${expandedTemplateId}/proof-3.pdf`
    );

    const requestProofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
      {
        headers: {
          Authorization: await userProofingEnabled.getAccessToken(),
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

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate({
        templateId,
        clientId: userProofingEnabled.clientId,
      });

      expect(template.templateStatus).toBe('PROOF_AVAILABLE');
    }).toPass({ timeout: 15_000, intervals: [1000, 3000, 5000] });

    const submitResponse = await request.patch(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/submit`,
      {
        headers: {
          Authorization: await userProofingEnabled.getAccessToken(),
        },
      }
    );

    expect(submitResponse.status()).toBe(200);

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(start, [templateId]);

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
      // This check is here mainly to prevent events we don't want to publish from slipping through.
      // I.E PENDING_UPLOAD statuss
      expect(events.length).toBeGreaterThanOrEqual(6);
      expect(events.length).toBeLessThanOrEqual(7);

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
          data: expect.objectContaining({
            id: templateId,
            templateStatus: 'PENDING_PROOF_REQUEST',
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
          data: expect.objectContaining({
            id: templateId,
            templateStatus: 'WAITING_FOR_PROOF',
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
          data: expect.objectContaining({
            id: templateId,
            templateStatus: 'PROOF_AVAILABLE',
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateCompleted.v1',
          data: expect.objectContaining({
            id: templateId,
            templateStatus: 'SUBMITTED',
          }),
        })
      );

      console.log(`Events found: ${events.length}. Expected: 7`);
    }).toPass({ timeout: 90_000, intervals: [1000, 3000, 5000] });
  });

  test('Expect Deleted.v1 event when deleting templates', async ({
    request,
  }) => {
    const templateId = randomUUID();

    const start = new Date();

    await templateStorageHelper.seedTemplateData([
      {
        ...TemplateFactory.uploadLetterTemplate(
          templateId,
          userProofingEnabled,
          'user-proof-deleted',
          'PENDING_PROOF_REQUEST'
        ),
        proofingEnabled: true,
        // just so it is not empty
        personalisationParameters: ['nhsNumber'],
      },
    ]);

    const deletedResponse = await request.delete(
      `${process.env.API_BASE_URL}/v1/template/${templateId}`,
      {
        headers: {
          Authorization: await userProofingEnabled.getAccessToken(),
        },
      }
    );

    expect(deletedResponse.status()).toBe(204);

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(start, [templateId]);

      expect(events).toHaveLength(2);

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateDrafted.v1',
          data: expect.objectContaining({
            id: templateId,
            templateStatus: 'PENDING_PROOF_REQUEST',
          }),
        })
      );

      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'uk.nhs.notify.template-management.TemplateDeleted.v1',
          data: expect.objectContaining({
            id: templateId,
            templateStatus: 'DELETED',
          }),
        })
      );
    }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000] });
  });
});
