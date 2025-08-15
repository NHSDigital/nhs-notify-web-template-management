import {
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { UserDataRepository } from '../../infra/user-data-repository';
import { Readable } from 'node:stream';

const internalBucket = 'nhs-notify-000000000000-eu-west-2-main-app-internal';
const clientId = 'b4b5db1b-8c76-40bf-b5f7-09c3a01e7236';
const templateId = '08d34521-1620-45a5-9314-f32eff96bcef';
const pdfVersion = '8e3ab488-0024-430c-8bec-af3ac22b6c47';
const testDataVersion = '8e3ab488-0024-430c-8bec-af3ac22b6c47';

function setup() {
  const mocks = { s3Client: mockClient(S3Client) };

  const userDataRepository = new UserDataRepository(
    mocks.s3Client as unknown as S3Client,
    internalBucket
  );
  return { mocks, userDataRepository };
}

describe('UserDataRepository', () => {
  test('fetches user data proofing files when testDataVersion is provided', async () => {
    const { mocks, userDataRepository } = setup();

    const pdf = Readable.from('data');
    const testData = 'this,is,a,csv';
    const csv = { transformToString: () => testData };

    mocks.s3Client
      .on(GetObjectCommand)
      .resolvesOnce({ Body: pdf as GetObjectCommandOutput['Body'] })
      .resolvesOnce({ Body: csv as unknown as GetObjectCommandOutput['Body'] });

    expect(
      await userDataRepository.get(
        clientId,
        templateId,
        pdfVersion,
        testDataVersion
      )
    ).toEqual({ pdf, testData });

    expect(mocks.s3Client).toHaveReceivedCommandTimes(GetObjectCommand, 2);
    expect(mocks.s3Client).toHaveReceivedNthCommandWith(1, GetObjectCommand, {
      Bucket: internalBucket,
      Key: `pdf-template/${clientId}/${templateId}/${pdfVersion}.pdf`,
    });
    expect(mocks.s3Client).toHaveReceivedNthCommandWith(2, GetObjectCommand, {
      Bucket: internalBucket,
      Key: `test-data/${clientId}/${templateId}/${testDataVersion}.csv`,
    });
  });

  test('fetches user data proofing files when testDataVersion is not provided', async () => {
    const { mocks, userDataRepository } = setup();

    const pdf = Readable.from('data');

    mocks.s3Client
      .on(GetObjectCommand)
      .resolvesOnce({ Body: pdf as GetObjectCommandOutput['Body'] });

    expect(
      await userDataRepository.get(clientId, templateId, pdfVersion, undefined)
    ).toEqual({ pdf });

    expect(mocks.s3Client).toHaveReceivedCommandTimes(GetObjectCommand, 1);
    expect(mocks.s3Client).toHaveReceivedCommandWith(GetObjectCommand, {
      Bucket: internalBucket,
      Key: `pdf-template/${clientId}/${templateId}/${pdfVersion}.pdf`,
    });
  });

  test('throws if Body is undefined', async () => {
    const { mocks, userDataRepository } = setup();

    mocks.s3Client.on(GetObjectCommand).resolves({ Body: undefined });

    await expect(
      userDataRepository.get(clientId, templateId, pdfVersion, testDataVersion)
    ).rejects.toThrow('Missing body on S3 response');
  });
});
