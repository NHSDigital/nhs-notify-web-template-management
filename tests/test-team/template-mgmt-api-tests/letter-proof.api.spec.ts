/* eslint-disable sonarjs/no-commented-code */
/* eslint-disable jest/no-commented-out-tests */
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { randomUUID } from 'node:crypto';
import { docxFixtures } from 'fixtures/letters';
import type { LetterProofRequest } from 'nhs-notify-web-template-management-types';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';

test.describe('POST /v1/template/:templateId/letter-proof', () => {
  const authHelper = createAuthHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;
  let differentClientUser: TestUser;
  // let sameClientUser: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
    differentClientUser = await authHelper.getTestUser(testUsers.User2.userId);
    // sameClientUser = await authHelper.getTestUser(testUsers.User5.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 401 if no auth token', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template/some-template/letter-proof`,
      {
        headers: {
          'X-Lock-Number': '0',
        },
      }
    );

    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);

    expect(response.status(), debug).toBe(401);
    expect(result).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns 404 if template does not exist', async ({ request }) => {
    const response = await request.post(
      `${process.env.API_BASE_URL}/v1/template/noexist/letter-proof`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
          'X-Lock-Number': '0',
        },
      }
    );
    const result = await response.json();
    const debug = JSON.stringify(result, null, 2);
    expect(response.status(), debug).toBe(404);
    expect(result).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  test('returns 404 if template exists but is owned by a different client', async ({
    request,
  }) => {
    const template = TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'userProofingEnabledtemplate',
      'PENDING_PROOF_REQUEST'
    );

    await templateStorageHelper.seedTemplateData([template]);

    const updateResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${template.id}/letter-proof`,
      {
        headers: {
          Authorization: await differentClientUser.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
      }
    );

    const result = await updateResponse.json();
    const debug = JSON.stringify(result, null, 2);

    expect(updateResponse.status(), debug).toBe(404);
    expect(result).toEqual({
      statusCode: 404,
      technicalMessage: 'Template not found',
    });
  });

  // eslint-disable-next-line playwright/no-focused-test, sonarjs/no-exclusive-tests
  test.only('returns 200 and the updated template data', async ({
    request,
  }) => {
    // top level object for IDs
    const templateId = randomUUID();
    const currentVersion = randomUUID();

    await templateStorageHelper.putScannedDocxTemplateFile(
      {
        clientId: user.clientId,
        templateId,
      },
      currentVersion,
      docxFixtures.standard.open()
    );

    const template = TemplateFactory.createAuthoringLetterTemplate(
      templateId,
      user,
      // put ID in name
      'userProofingEnabledtemplate',
      'NOT_YET_SUBMITTED',
      {
        // add personalisation fields
        docxTemplate: {
          virusScanStatus: 'PASSED',
          currentVersion,
          fileName: `${currentVersion}.docx`,
        },
        longFormRender: false,
        shortFormRender: false,
      }
    );

    await templateStorageHelper.seedTemplateData([template]);

    const start = new Date();

    const requestProofResponse = await request.post(
      `${process.env.API_BASE_URL}/v1/template/${templateId}/letter-proof`,
      {
        headers: {
          Authorization: await user.getAccessToken(),
          'X-Lock-Number': String(template.lockNumber),
        },
        data: {
          personalisation: {
            address_line_1: '1 Long Lane',
            address_line_2: 'S70 0PQ',
            nhsNumber: '99999999999',
            myCustomParam: 'jalapeno',
          },
          systemPersonalisationPackId: 'pack-id',
          requestTypeVariant: 'long',
        } satisfies LetterProofRequest,
      }
    );

    const result = await requestProofResponse.json();
    const debug = JSON.stringify(result, null, 2);

    expect(requestProofResponse.status(), debug).toBe(200);

    expect(result.data).toEqual({
      name: template.name,
      templateType: 'LETTER',
      campaignId: template.campaignId,
      clientId: user.clientId,
      createdAt: expect.stringMatching(isoDateRegExp),
      lockNumber: template.lockNumber + 1,
      id: template.id,
      templateStatus: 'NOT_YET_SUBMITTED',
      updatedAt: expect.stringMatching(isoDateRegExp),
      updatedBy: `INTERNAL_USER#${user.internalUserId}`,
      letterType: 'x0',
      language: 'en',
      files: {
        docxTemplate: {
          currentVersion,
          fileName: `${currentVersion}.docx`,
          virusScanStatus: 'PASSED',
        },
        initialRender: {
          currentVersion: 'v1',
          fileName: 'initial-render.pdf',
          pageCount: 1,
          status: 'RENDERED',
        },
        longFormRender: {
          personalisationParameters: {
            address_line_1: '1 Long Lane',
            address_line_2: 'S70 0PQ',
            myCustomParam: 'jalapeno',
            nhsNumber: '99999999999',
          },
          requestedAt: expect.stringMatching(isoDateRegExp),
          status: 'PENDING',
          systemPersonalisationPackId: 'pack-id',
        },
      },
      letterVersion: 'AUTHORING',
    });

    expect(result.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
  });

  // test('returns 400 - cannot request a proof for a template where the status is not PENDING_PROOF_REQUEST', async ({
  //   request,
  // }) => {
  //   const templateId = randomUUID();
  //   const currentVersion = randomUUID();

  //   const template = {
  //     ...TemplateFactory.uploadLetterTemplate(
  //       templateId,
  //       userProofingEnabled,
  //       'userProofingEnabledtemplate',
  //       'PENDING_VALIDATION'
  //     ),
  //     files: {
  //       pdfTemplate: {
  //         virusScanStatus: 'PASSED',
  //         currentVersion,
  //         fileName: 'template.pdf',
  //       },
  //     },
  //   };

  //   await templateStorageHelper.seedTemplateData([template]);

  //   const proofResponse = await request.post(
  //     `${process.env.API_BASE_URL}/v1/template/${templateId}/letter-proof`,
  //     {
  //       headers: {
  //         Authorization: await userProofingEnabled.getAccessToken(),
  //         'X-Lock-Number': String(template.lockNumber),
  //       },
  //     }
  //   );

  //   const result = await proofResponse.json();
  //   const debug = JSON.stringify(result, null, 2);

  //   expect(proofResponse.status(), debug).toBe(400);

  //   expect(result).toEqual({
  //     statusCode: 400,
  //     technicalMessage: 'Template cannot be proofed',
  //   });
  // });

  // test('returns 400 - cannot request a proof for a non-letter', async ({
  //   request,
  // }) => {
  //   const templateId = randomUUID();

  //   const template = TemplateFactory.createEmailTemplate(
  //     templateId,
  //     userProofingEnabled,
  //     'userProofingEnabledtemplate'
  //   );

  //   await templateStorageHelper.seedTemplateData([template]);

  //   const proofResponse = await request.post(
  //     `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
  //     {
  //       headers: {
  //         Authorization: await userProofingEnabled.getAccessToken(),
  //         'X-Lock-Number': String(template.lockNumber),
  //       },
  //     }
  //   );

  //   const result = await proofResponse.json();
  //   const debug = JSON.stringify(result, null, 2);

  //   expect(proofResponse.status(), debug).toBe(400);

  //   expect(result).toEqual({
  //     statusCode: 400,
  //     technicalMessage: 'Template cannot be proofed',
  //   });
  // });

  // test('user can request a proof of template created by another user belonging to the same client', async ({
  //   request,
  // }) => {
  //   const templateId = randomUUID();
  //   const currentVersion = randomUUID();

  //   const template = {
  //     ...TemplateFactory.uploadLetterTemplate(
  //       templateId,
  //       sameClientUser,
  //       'sameClientUserTemplate',
  //       'PENDING_PROOF_REQUEST'
  //     ),
  //     files: {
  //       pdfTemplate: {
  //         virusScanStatus: 'PASSED',
  //         currentVersion,
  //         fileName: 'template.pdf',
  //       },
  //     },
  //     personalisationParameters: ['nhsNumber'],
  //     campaignId: userProofingEnabled.campaignIds?.[0],
  //   };

  //   await templateStorageHelper.seedTemplateData([template]);

  //   const start = new Date();

  //   const requestProofResponse = await request.post(
  //     `${process.env.API_BASE_URL}/v1/template/${templateId}/proof`,
  //     {
  //       headers: {
  //         Authorization: await userProofingEnabled.getAccessToken(),
  //         'X-Lock-Number': String(template.lockNumber),
  //       },
  //     }
  //   );

  //   const result = await requestProofResponse.json();
  //   const debug = JSON.stringify(result, null, 2);

  //   expect(requestProofResponse.status(), debug).toBe(200);

  //   expect(result).toEqual({
  //     statusCode: 200,
  //     data: expect.objectContaining({
  //       name: template.name,
  //       templateStatus: 'WAITING_FOR_PROOF',
  //       templateType: template.templateType,
  //     }),
  //   });

  //   expect(result.data.updatedAt).toBeDateRoughlyBetween([start, new Date()]);
  // });

  // test('returns 400 if the lock number header is not set', async ({
  //   request,
  // }) => {
  //   const template = {
  //     ...TemplateFactory.uploadLetterTemplate(
  //       randomUUID(),
  //       userProofingEnabled,
  //       'userProofingEnabledtemplate',
  //       'PENDING_PROOF_REQUEST'
  //     ),
  //     files: {
  //       pdfTemplate: {
  //         virusScanStatus: 'PASSED',
  //         currentVersion: randomUUID(),
  //         fileName: 'template.pdf',
  //       },
  //       testDataCsv: {
  //         virusScanStatus: 'PASSED',
  //         currentVersion: randomUUID(),
  //         fileName: 'data.csv',
  //       },
  //     },
  //     personalisationParameters: ['nhsNumber'],
  //     campaignId: userProofingEnabled.campaignIds?.[0],
  //   };

  //   await templateStorageHelper.seedTemplateData([template]);

  //   const response = await request.post(
  //     `${process.env.API_BASE_URL}/v1/template/${template.id}/proof`,
  //     {
  //       headers: {
  //         Authorization: await userProofingEnabled.getAccessToken(),
  //       },
  //     }
  //   );

  //   const result = await response.json();
  //   const debug = JSON.stringify(result, null, 2);

  //   expect(response.status(), debug).toBe(400);

  //   expect(result).toEqual({
  //     statusCode: 400,
  //     technicalMessage: 'Invalid lock number provided',
  //   });
  // });

  // test('returns 409 if the lock number header does not match the current one', async ({
  //   request,
  // }) => {
  //   const template = {
  //     ...TemplateFactory.uploadLetterTemplate(
  //       randomUUID(),
  //       userProofingEnabled,
  //       'userProofingEnabledtemplate',
  //       'PENDING_PROOF_REQUEST'
  //     ),
  //     files: {
  //       pdfTemplate: {
  //         virusScanStatus: 'PASSED',
  //         currentVersion: randomUUID(),
  //         fileName: 'template.pdf',
  //       },
  //       testDataCsv: {
  //         virusScanStatus: 'PASSED',
  //         currentVersion: randomUUID(),
  //         fileName: 'data.csv',
  //       },
  //     },
  //     personalisationParameters: ['nhsNumber'],
  //     campaignId: userProofingEnabled.campaignIds?.[0],
  //   };

  //   await templateStorageHelper.seedTemplateData([template]);

  //   const response = await request.post(
  //     `${process.env.API_BASE_URL}/v1/template/${template.id}/proof`,
  //     {
  //       headers: {
  //         Authorization: await userProofingEnabled.getAccessToken(),
  //         'X-Lock-Number': String(template.lockNumber + 1),
  //       },
  //     }
  //   );

  //   const result = await response.json();
  //   const debug = JSON.stringify(result, null, 2);

  //   expect(response.status(), debug).toBe(409);

  //   expect(result).toEqual({
  //     statusCode: 409,
  //     technicalMessage:
  //       'Lock number mismatch - Template has been modified since last read',
  //   });
  // });
});
