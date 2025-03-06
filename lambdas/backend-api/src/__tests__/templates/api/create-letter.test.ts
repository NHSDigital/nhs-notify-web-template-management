import {
  createHandler,
  CreateLetter,
} from '@backend-api/templates/api/create-letter/handler';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { TemplateClient } from '@backend-api/templates/app/template-client';
import { mock } from 'jest-mock-extended';
import { readFileSync } from 'node:fs';
import {
  TemplateType,
  LetterType,
  Language,
  TemplateStatus,
} from 'nhs-notify-backend-client';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import FormData from 'form-data';

const baseTemplate: CreateLetter = {
  templateType: TemplateType.LETTER,
  name: 'template-name',
  letterType: LetterType.STANDARD,
  language: Language.ENGLISH,
  pdfTemplateInputFile: 'template.pdf',
  testPersonalisationInputFile: 'test-data.csv',
};

const user = '8B892046';
const generatedId = '2DD85694';
const quarantineBucketName = 'q-bucket';

const setup = () => {
  const s3Client = mockClient(S3Client);

  const templateClient = mock<TemplateClient>();

  const handler = createHandler({
    s3Client: s3Client as unknown as S3Client,
    templateClient,
    generateId: () => generatedId,
    quarantineBucketName,
  });

  return {
    handler,
    mocks: { s3Client, templateClient },
  };
};

const createMockFormData = (
  fileConfig: {
    partName: string;
    filename?: string;
    type?: string;
  }[],
  template: CreateLetter | undefined
) => {
  const fd = new FormData();
  for (const file of fileConfig) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const fileBuf = readFileSync(`src/__tests__/fixtures/${file.filename}`);

    fd.append(file.partName, fileBuf, {
      filename: file.filename,
      contentType: file.type,
    });
  }

  if (template) fd.append('template', JSON.stringify(template));

  return { data: fd, boundary: fd.getBoundary() };
};

describe('create-letter', () => {
  test('successfully validates multipart form input and forwards PDF and CSV', async () => {
    const { mocks, handler } = setup();

    const { data, boundary } = createMockFormData(
      [
        {
          partName: 'letterPdf',
          filename: 'template.pdf',
          type: 'application/pdf',
        },
        { partName: 'testCsv', filename: 'test-data.csv', type: 'text/csv' },
      ],
      baseTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: data.getBuffer().toString('base64'),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      requestContext: { authorizer: { user } },
    });

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
      data: {
        ...baseTemplate,
        id: 'generated',
        createdAt: '2025-03-05T17:42:47.978Z',
        updatedAt: '2025-03-05T17:42:47.978Z',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      },
    });

    await handler(event, mock<Context>(), jest.fn());

    expect(mocks.s3Client).toHaveReceivedCommandTimes(PutObjectCommand, 2);
    expect(mocks.s3Client).toHaveReceivedCommandWith(PutObjectCommand, {
      Key: `pdf-template/${user}/template__${generatedId}.pdf`,
      Bucket: quarantineBucketName,
      Body: '',
      Metadata: { 'test-data-csv': baseTemplate.testPersonalisationInputFile },
    });

    expect(mocks.templateClient.createTemplate).toHaveBeenCalledWith(
      baseTemplate,
      user
    );
  });
});
