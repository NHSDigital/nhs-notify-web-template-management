import { randomUUID } from 'node:crypto';
import { mock } from 'jest-mock-extended';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { RenderRepository } from '../../infra/render-repository';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

const mockUUID = jest.mocked(randomUUID);

function setup() {
  const s3 = mock<S3Repository>();

  const renderRepository = new RenderRepository(s3);

  return { renderRepository, mocks: { s3 } };
}

const createRequest = (
  overrides: Partial<Omit<InitialRenderRequest, 'requestType'>> = {}
): InitialRenderRequest => ({
  requestType: 'initial',
  clientId: 'test-client',
  templateId: 'test-template',
  currentVersion: 'test-version',
  ...overrides,
});

describe('RenderRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('save', () => {
    test('saves PDF to S3 with correct key and metadata, returns filename', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const request = createRequest();
      const pageCount = 3;
      const uuid = 'generated-uuid-1234';

      mockUUID.mockReturnValue(uuid as ReturnType<typeof randomUUID>);

      mocks.s3.putRawData.mockResolvedValue({
        VersionId: 'v1',
        $metadata: {},
      });

      const result = await renderRepository.save(pdf, request, pageCount);

      expect(result).toBe(`${uuid}.pdf`);
      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        `test-client/test-template/renders/initial/${uuid}.pdf`,
        {
          Metadata: {
            'page-count': '3',
            'template-id': 'test-template',
            'client-id': 'test-client',
            variant: 'initial',
          },
        }
      );
    });

    test('throws when S3 does not return a VersionId', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const request = createRequest();
      const pageCount = 2;

      mockUUID.mockReturnValue('some-uuid' as ReturnType<typeof randomUUID>);

      mocks.s3.putRawData.mockResolvedValue({
        VersionId: undefined,
        $metadata: {},
      });

      await expect(
        renderRepository.save(pdf, request, pageCount)
      ).rejects.toThrow('S3 did not return a VersionId');
    });

    test('builds correct S3 key for different request types', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const uuid = 'uuid-for-key-test';

      mockUUID.mockReturnValue(uuid as ReturnType<typeof randomUUID>);

      mocks.s3.putRawData.mockResolvedValue({
        VersionId: 'v1',
        $metadata: {},
      });

      await renderRepository.save(
        pdf,
        {
          requestType: 'personalised-short',
          clientId: 'client-abc',
          templateId: 'tmpl-xyz',
          currentVersion: 'v1',
        },
        5
      );

      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        `client-abc/tmpl-xyz/renders/personalised-short/${uuid}.pdf`,
        expect.objectContaining({
          Metadata: expect.objectContaining({
            variant: 'personalised-short',
          }),
        })
      );
    });

    test('includes page count as string in metadata', async () => {
      const { renderRepository, mocks } = setup();
      const pdf = Buffer.from('pdf-content');
      const request = createRequest();

      mockUUID.mockReturnValue('uuid-meta' as ReturnType<typeof randomUUID>);

      mocks.s3.putRawData.mockResolvedValue({
        VersionId: 'v1',
        $metadata: {},
      });

      await renderRepository.save(pdf, request, 10);

      expect(mocks.s3.putRawData).toHaveBeenCalledWith(
        pdf,
        expect.any(String),
        expect.objectContaining({
          Metadata: expect.objectContaining({
            'page-count': '10',
          }),
        })
      );
    });
  });
});
