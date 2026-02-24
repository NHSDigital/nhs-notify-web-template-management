import { test, expect, APIRequestContext } from '@playwright/test';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { PDFParse } from 'pdf-parse';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateAPIPayloadFactory } from '../helpers/factories/template-api-payload-factory';
import { docxFixtures } from '../fixtures/letters';
import { Template } from 'helpers/types';

const authHelper = createAuthHelper();
const templateStorageHelper = new TemplateStorageHelper();

const baseTemplateData = {
  templateType: 'LETTER',
  campaignId: 'Campaign1',
  letterVersion: 'AUTHORING',
};

async function initialRenderTest(
  request: APIRequestContext,
  docx: Buffer,
  user: TestUser,
  assert: (t: Template) => void
) {
  const { multipart, contentType } =
    TemplateAPIPayloadFactory.getUploadLetterTemplatePayload(
      baseTemplateData,
      docx
    );

  const response = await request.post(
    `${process.env.API_BASE_URL}/v1/docx-letter-template`,
    {
      data: multipart,
      headers: {
        Authorization: await user.getAccessToken(),
        'Content-Type': contentType,
      },
    }
  );

  const result = await response.json();
  const debug = JSON.stringify(result, null, 2);

  expect(response.status(), debug).toBe(201);

  const template = result.data as Template;

  const templateKey = {
    templateId: template.id,
    clientId: user.clientId,
  };

  templateStorageHelper.addAdHocTemplateKey(templateKey);

  expect(template.templateStatus).toBe('PENDING_VALIDATION');

  let updatedTemplate: Template | undefined;

  await expect(async () => {
    updatedTemplate = await templateStorageHelper.getTemplate(templateKey);

    assert(updatedTemplate);
  }).toPass({ intervals: [1000] });

  return updatedTemplate;
}

test.describe('Letter rendering', () => {
  let user: TestUser;

  test.beforeAll(async () => {
    user = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test.describe('Initial render', () => {
    test('produces initial render', async ({ request }) => {
      const template = await initialRenderTest(
        request,
        docxFixtures.standard.open(),
        user,
        (t: Template) => {
          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'NOT_YET_SUBMITTED',
              files: expect.objectContaining({
                initialRender: expect.objectContaining({
                  status: 'RENDERED',
                  fileName: expect.any(String),
                }),
              }),
              customPersonalisation: [
                'gpSurgeryName',
                'gpSurgeryAddress',
                'gpSurgeryPhone',
              ],
              systemPersonalisation: [
                'fullName',
                'firstName',
                'nhsNumber',
                'address_line_1',
                'address_line_2',
                'address_line_3',
                'address_line_4',
                'address_line_5',
                'address_line_6',
                'address_line_7',
                'date',
              ],
            })
          );
        }
      );

      const render = await templateStorageHelper.getRenderFile(
        { clientId: template!.clientId!, templateId: template!.id },
        'initial',
        template!.files!.initialRender!.fileName
      );

      expect(render?.metadata).toEqual({
        'client-id': template!.clientId,
        'page-count': '2',
        'template-id': template!.id,
        variant: 'initial',
      });

      expect(render?.buffer).toBeDefined();

      const parser = new PDFParse({ data: render!.buffer });

      const { text: pdfTextContent } = await parser.getText();

      expect(pdfTextContent).toContain('This is the body text');

      for (const n of [1, 2, 3, 4, 5, 6, 7]) {
        expect(pdfTextContent).toContain(`{d.address_line_${n}}`);
      }
    });

    test('Uploaded docx file is virus scanned - if threat detected, file is deleted from quarantine and not copied, file and template status updated in database', async ({
      request,
    }) => {
      const template = await initialRenderTest(
        request,
        docxFixtures.fakeVirus.open(),
        user,
        (t: Template) => {
          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'VALIDATION_FAILED',
              validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
              files: {
                docxTemplate: expect.objectContaining({
                  virusScanStatus: 'FAILED',
                }),
              },
            })
          );
        }
      );

      const docxQuarantine =
        await templateStorageHelper.getQuarantineDocxMetadata(
          { clientId: template!.clientId!, templateId: template!.id },
          template!.files!.docxTemplate!.currentVersion
        );

      expect(docxQuarantine).toBe(null);
    });

    test('password protected docx template fails virus scan', async ({
      request,
    }) => {
      const template = await initialRenderTest(
        request,
        docxFixtures.password.open(),
        user,
        (t: Template) => {
          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'VALIDATION_FAILED',
              validationErrors: [{ name: 'VIRUS_SCAN_FAILED' }],
              files: {
                docxTemplate: expect.objectContaining({
                  virusScanStatus: 'FAILED',
                }),
              },
            })
          );
        }
      );

      const docxQuarantine =
        await templateStorageHelper.getQuarantineDocxMetadata(
          { clientId: template!.clientId!, templateId: template!.id },
          template!.files!.docxTemplate!.currentVersion
        );

      expect(docxQuarantine).toBe(null);
    });

    test('template with missing address line fails with appropriate validation error', async ({
      request,
    }) => {
      await initialRenderTest(
        request,
        docxFixtures.incompleteAddress.open(),
        user,
        (t: Template) => {
          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'VALIDATION_FAILED',
              validationErrors: [{ name: 'MISSING_ADDRESS_LINES' }],
              files: expect.objectContaining({
                initialRender: expect.objectContaining({ status: 'RENDERED' }),
              }),
              customPersonalisation: [
                'gpSurgeryName',
                'gpSurgeryAddress',
                'gpSurgeryPhone',
              ],
              systemPersonalisation: [
                'fullName',
                'firstName',
                'nhsNumber',
                'address_line_1',
                'address_line_2',
                'address_line_3',
                'address_line_4',
                'address_line_5',
                'address_line_6',
                'date',
              ],
            })
          );
        }
      );
    });

    test('docx containing invalid XML fails with VALIDATION_FAILED status and no specific validation error', async ({
      request,
    }) => {
      await initialRenderTest(
        request,
        docxFixtures.corrupted.open(),
        user,
        (t: Template) => {
          expect(t.validationErrors).toBeUndefined();

          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'VALIDATION_FAILED',
              files: expect.objectContaining({
                initialRender: { status: 'FAILED' },
              }),
            })
          );
        }
      );
    });

    test('docx containing non-renderable marker is not rendered', async ({
      request,
    }) => {
      await initialRenderTest(
        request,
        docxFixtures.nonRenderableMarker.open(),
        user,
        (t: Template) => {
          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'VALIDATION_FAILED',
              validationErrors: [
                { name: 'INVALID_MARKERS', issues: ['c.fullName'] },
              ],
              files: expect.objectContaining({
                initialRender: { status: 'FAILED' },
              }),
            })
          );
        }
      );
    });

    test('docx containing renderable but invalid marker is rendered, but has VALIDATION_FAILED template status', async ({
      request,
    }) => {
      await initialRenderTest(
        request,
        docxFixtures.invalidMarkers.open(),
        user,
        (t: Template) => {
          expect(t).toEqual(
            expect.objectContaining({
              templateStatus: 'VALIDATION_FAILED',
              validationErrors: [
                { name: 'INVALID_MARKERS', issues: ['parameter!'] },
              ],
              files: expect.objectContaining({
                initialRender: expect.objectContaining({ status: 'RENDERED' }),
              }),
            })
          );
        }
      );
    });
  });
});
