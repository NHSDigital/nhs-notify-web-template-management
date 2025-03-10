import { createHandler } from '@backend-api/templates/api/create-letter';
import { mock } from 'jest-mock-extended';
import {
  CreateTemplate,
  ITemplateClient,
  TemplateDto,
} from 'nhs-notify-backend-client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { pdfLetterMultipart } from 'nhs-notify-web-template-management-test-helper-utils';

const setup = () => {
  const templateClient = mock<ITemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

const initialTemplate: CreateTemplate = {
  templateType: 'LETTER',
  name: 'template-name',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
    },
    testDataCsv: {
      fileName: 'test-data.csv',
    },
  },
};

const user = '8B892046';
const now = '2025-03-05T17:42:47.978Z';

describe('create-letter', () => {
  beforeEach(jest.resetAllMocks);

  test('successfully handles multipart form input and forwards PDF and CSV', async () => {
    const { handler, mocks } = setup();

    const pdf = new File(['letterPdf'], 'template.pdf', {
      type: 'application/pdf',
    });
    const csv = new File(['testCsv'], 'template.pdf', {
      type: 'text/csv',
    });

    const versionId = '2DD85694';

    const { contentType, multipart } = await pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: 'template.pdf',
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'testCsv',
          file: csv,
          fileName: 'test-data.csv',
          fileType: 'text/csv',
        },
      ],
      initialTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { user } },
    });

    const templateId = 'generated-template-id';

    const created: TemplateDto = {
      ...initialTemplate,
      id: templateId,
      createdAt: now,
      updatedAt: now,
      templateStatus: 'PENDING_VALIDATION',
      files: {
        pdfTemplate: {
          fileName: initialTemplate.files.pdfTemplate.fileName,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: initialTemplate.files.testDataCsv!.fileName,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      },
    };

    mocks.templateClient.createLetterTemplate.mockResolvedValueOnce({
      data: created,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({ body: expect.any(String), statusCode: 201 });

    expect(JSON.parse((result as APIGatewayProxyResult).body)).toEqual({
      statusCode: 201,
      template: created,
    });

    expect(mocks.templateClient.createLetterTemplate).toHaveBeenCalledWith(
      initialTemplate,
      user,
      pdf,
      csv
    );

    // expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);

    // expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
    //   Key: `pdf-template/${user}/${templateId}/${versionId}.pdf`,
    //   Bucket: quarantineBucketName,
    //   Body: pdfBuffer,
    //   Metadata: {
    //     'test-data-csv': 'true',
    //     owner: user,
    //     'version-id': versionId,
    //     'template-id': templateId,
    //     'user-filename': 'template.pdf',
    //   },
    // });

    // expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
    //   Key: `test-data/${user}/${templateId}/${versionId}.csv`,
    //   Bucket: quarantineBucketName,
    //   Body: csvBuffer,
    //   Metadata: {
    //     owner: user,
    //     'version-id': versionId,
    //     'template-id': templateId,
    //     'user-filename': 'test-data.csv',
    //   },
    // });

    // expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
    //   templateId,
    //   {
    //     ...templateWithFileVersions,
    //     templateStatus: 'PENDING_VALIDATION',
    //   },
    //   user
    // );
  });
});
