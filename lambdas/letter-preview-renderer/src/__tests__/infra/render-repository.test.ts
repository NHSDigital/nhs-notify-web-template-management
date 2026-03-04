import { randomUUID } from 'node:crypto';
import { mock } from 'jest-mock-extended';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { RenderRepository } from '../../infra/render-repository';
import {
  createInitialRequest,
  createPersonalisedRequest,
  createLongPersonalisedRequest,
} from '../fixtures/create-request';

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

    test('includes request-type-variant in metadata for short personalised request', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const request = createPersonalisedRequest({
        clientId: 'client-abc',
        templateId: 'tmpl-xyz',
      });
      const pageCount = 5;
      const uuid = '4CBEA40A-D9AE-478A-8E42-5A87C135AAE4';

      mockUUID.mockReturnValue(uuid);

      mocks.s3.putRawData.mockResolvedValue({
        $metadata: {},
      });

      await renderRepository.save(pdf, request, pageCount);

      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        `client-abc/renders/tmpl-xyz/${uuid}.pdf`,
        {
          ContentDisposition: 'inline',
          ContentType: 'application/pdf',
          Metadata: {
            'request-type': 'personalised',
            'request-type-variant': 'short',
            'file-type': 'render',
            'template-id': 'tmpl-xyz',
            'page-count': '5',
            'client-id': 'client-abc',
          },
        }
      );
    });

    test('includes request-type-variant in metadata for long personalised request', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const request = createLongPersonalisedRequest({
        clientId: 'client-long',
        templateId: 'tmpl-long',
      });
      const pageCount = 8;
      const uuid = '8D1E5F2A-3B4C-6D7E-9F0A-1B2C3D4E5F6A';

      mockUUID.mockReturnValue(uuid);

      mocks.s3.putRawData.mockResolvedValue({
        $metadata: {},
      });

      await renderRepository.save(pdf, request, pageCount);

      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        `client-long/renders/tmpl-long/${uuid}.pdf`,
        {
          ContentDisposition: 'inline',
          ContentType: 'application/pdf',
          Metadata: {
            'request-type': 'personalised',
            'request-type-variant': 'long',
            'file-type': 'render',
            'template-id': 'tmpl-long',
            'page-count': '8',
            'client-id': 'client-long',
          },
        }
      );
    });
  });
});
