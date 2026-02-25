import { randomUUID } from 'node:crypto';
import { mock } from 'jest-mock-extended';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { RenderRepository } from '../../infra/render-repository';
import { createInitialRequest } from '../fixtures/create-request';

jest.mock('node:crypto');

const mockUUID = jest.mocked(randomUUID);

function setup() {
  const s3 = mock<S3Repository>();

  const renderRepository = new RenderRepository(s3);

  return { renderRepository, mocks: { s3 } };
}

describe('RenderRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('save', () => {
    test('saves PDF to S3 with correct key and metadata, returns filename', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const request = createInitialRequest();
      const pageCount = 3;
      const uuid = '99472D0D-7C5A-4162-B3B0-7F3F2C679EB4';

      mockUUID.mockReturnValue(uuid);

      mocks.s3.putRawData.mockResolvedValue({
        $metadata: {},
      });

      const result = await renderRepository.save(pdf, request, pageCount);

      expect(result).toEqual({
        fileName: `${uuid}.pdf`,
        currentVersion: uuid,
      });
      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        `test-client/renders/test-template/${uuid}.pdf`,
        {
          Metadata: {
            'page-count': '3',
            'template-id': 'test-template',
            'client-id': 'test-client',
            'request-type': 'initial',
            'file-type': 'render',
          },
          ContentType: 'application/pdf',
          ContentDisposition: 'inline',
        }
      );
    });

    test('builds correct S3 key for personalised render request', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const uuid = '4CBEA40A-D9AE-478A-8E42-5A87C135AAE4';

      mockUUID.mockReturnValue(uuid);

      mocks.s3.putRawData.mockResolvedValue({
        $metadata: {},
      });

      await renderRepository.save(
        pdf,
        {
          requestType: 'personalised',
          requestTypeVariant: 'short',
          clientId: 'client-abc',
          templateId: 'tmpl-xyz',
          currentVersion: 'v1',
          personalisation: { first_name: 'Test' },
          lockNumber: 1,
        },
        5
      );

      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        `client-abc/renders/tmpl-xyz/${uuid}.pdf`,
        expect.objectContaining({
          Metadata: expect.objectContaining({
            'request-type': 'personalised',
            'file-type': 'render',
          }),
        })
      );
    });
  });
});
