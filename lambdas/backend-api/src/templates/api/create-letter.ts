import { randomUUID as uuidv4 } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import * as multipart from 'parse-multipart-data';
import { apiFailure, apiSuccess } from './responses';
import { CreateTemplate, TemplateDTO } from 'nhs-notify-backend-client';
import { TemplateClient } from '../app/template-client';

enum Parts {
  TEMPLATE = 'template',
  PDF = 'letterPdf',
  CSV = 'testCsv',
}

const PART_TYPE_MAP = {
  [Parts.PDF]: 'application/pdf',
  [Parts.CSV]: 'text/csv',
};

const FILE_NAME_PARAM = {
  [Parts.PDF]: 'pdfTemplateInputFile',
  [Parts.CSV]: 'testPersonalisationInputFile',
};

type RequestData = {
  [Parts.TEMPLATE]?: CreateTemplate;
  [Parts.PDF]?: Pick<TemplateDTO, 'pdfTemplateInputFile'>;
  [Parts.CSV]?: Pick<TemplateDTO, 'testPersonalisationInputFile'>;
};

const parseData = (event: APIGatewayProxyEvent) => {
  const bodyBuffer = Buffer.from(event.body || '', 'base64');

  const boundary = multipart.getBoundary(event.headers['Content-Type'] || '');

  return multipart.parse(bodyBuffer, boundary);
};

export const handler: APIGatewayProxyHandler = async (event) => {
  const user = event.requestContext.authorizer?.user;

  if (!user) {
    return apiFailure(400, 'Invalid request');
  }

  const id = uuidv4();

  const s3Client = new S3Client({ region: 'eu-west-2' });

  const retrievedData: RequestData = {};

  for (const formPart of parseData(event)) {
    const { name, type, filename, data } = formPart;
    switch (name) {
      case Parts.TEMPLATE: {
        retrievedData.template = JSON.parse(data.toString());

        break;
      }
      case Parts.PDF:
      case Parts.CSV: {
        if (type != PART_TYPE_MAP[name] || !filename) {
          return apiFailure(400, 'Invalid file data');
        }
        retrievedData[name] = {
          [FILE_NAME_PARAM[name]]: filename,
        };
        const params = {
          Bucket: process.env.SCAN_BUCKET_NAME,
          Key: `pending/${user}/${id}/${filename}`,
          Body: data,
        };
        try {
          await s3Client.send(new PutObjectCommand(params));
        } catch (error_) {
          return apiFailure(
            500,
            `Failed to upload ${name} ${filename}`,
            error_
          );
        }

        break;
      }
      default: {
        return apiFailure(400, `Unknown request part ${name}`);
      }
    }
  }

  if (
    Object.keys(PART_TYPE_MAP).some(
      (part) => !retrievedData[part as keyof RequestData]
    )
  ) {
    return apiFailure(400, 'Data missing');
  }

  const client = new TemplateClient(user, true);

  const dto = {
    ...retrievedData[Parts.TEMPLATE],
    ...retrievedData[Parts.PDF],
    ...retrievedData[Parts.CSV],
  };

  const { data, error } = await client.createTemplate(dto);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(201, data);
};
