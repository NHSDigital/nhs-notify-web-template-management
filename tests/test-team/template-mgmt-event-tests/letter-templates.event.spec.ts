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
  const NON_PUBLISHABLE_LETTER_STATUSES = [
    'PENDING_UPLOAD',
    'PENDING_VALIDATION',
    'VIRUS_SCAN_FAILED',
    'VALIDATION_FAILED',
  ] as const;

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

  test(`Expect no events for AnyOf: ${NON_PUBLISHABLE_LETTER_STATUSES}`, async () => {
    const templates = NON_PUBLISHABLE_LETTER_STATUSES.map((status) => {
      const templateId = randomUUID();

      return {
        ...TemplateFactory.uploadLetterTemplate(
          templateId,
          userProofingEnabled,
          `user-event-${status}-fails`,
          status
        ),
      };
    });

    const start = new Date();

    await templateStorageHelper.seedTemplateData(templates);

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(
        start,
        templates.map((r) => r.id)
      );

      expect(events).toHaveLength(0);
    }).toPass({ timeout: 60_000, intervals: [5000] });
  });

  test('Expect no events when proofingEnabled is false', async ({
    request,
  }) => {
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

    await expect(async () => {
      const events = await eventCacheHelper.findEvents(start, [templateId]);

      expect(events).toHaveLength(0);
    }).toPass({ timeout: 60_000, intervals: [5000] });
  });

  test('Expect Draft.v1 events When waiting for Proofs to become available And Completed.v1 event When submitting templates', async ({
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

      // Note: Although there are 4 unique statuses we get multiple events for some statuses
      /*
       *  PENDING_PROOF_REQUEST: 1 event
       *  WAITING_FOR_PROOF: 1 event
       *  PROOF_AVAILABLE: 3 events
       * * * proof-1.pdf (on first proof status is updated to PROOF_AVAILABLE)
       * * * proof-2.pdf
       * * * proof-3.pdf
       *  SUBMITTED: 1 event
       */
      expect(events).toHaveLength(6);

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
    }).toPass({ timeout: 120_000, intervals: [1000, 3000, 5000, 10_000] });
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
    }).toPass({ timeout: 60_000, intervals: [1000, 3000, 5000, 10_000] });
  });
});
