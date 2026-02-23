/* eslint-disable sonarjs/publicly-writable-directories */
import { randomUUID } from 'node:crypto';
import { createWriteStream, unlinkSync, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { mock } from 'jest-mock-extended';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { SourceRepository } from '../../infra/source-repository';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import { Readable } from 'node:stream';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

jest.mock('node:fs', () => ({
  createWriteStream: jest.fn(),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn(),
}));

const mockUUID = jest.mocked(randomUUID);
const mockCreateWriteStream = jest.mocked(createWriteStream);
const mockUnlinkSync = jest.mocked(unlinkSync);
const mockMkdirSync = jest.mocked(mkdirSync);
const mockPipeline = jest.mocked(pipeline);

function setup() {
  const s3 = mock<S3Repository>();
  const { logger } = createMockLogger();

  const sourceRepository = new SourceRepository(s3, logger);

  return { sourceRepository, mocks: { s3 } };
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

describe('SourceRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('creates temp directory on construction', () => {
    setup();

    expect(mockMkdirSync).toHaveBeenCalledWith('/tmp/source', {
      recursive: true,
    });
  });

  describe('getSource', () => {
    test('downloads S3 object to temp file and returns handle with path', async () => {
      const { sourceRepository, mocks } = setup();
      const request = createRequest();
      const uuid = 'source-uuid-1234';
      const mockStream = new Readable({ read() {} });
      const mockWriteStream = {} as ReturnType<typeof createWriteStream>;

      mockUUID.mockReturnValue(uuid as ReturnType<typeof randomUUID>);
      mocks.s3.getObjectStream.mockResolvedValue(mockStream);
      mockCreateWriteStream.mockReturnValue(mockWriteStream);
      mockPipeline.mockResolvedValue();

      const handle = await sourceRepository.getSource(request);

      expect(handle.path).toBe(`/tmp/source/${uuid}.docx`);
      expect(mocks.s3.getObjectStream).toHaveBeenCalledWith(
        'docx-template/test-client/test-template/test-version.docx'
      );
      expect(mockCreateWriteStream).toHaveBeenCalledWith(
        `/tmp/source/${uuid}.docx`
      );
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockWriteStream);
    });

    test('returns a dispose function that deletes the temp file', async () => {
      const { sourceRepository, mocks } = setup();
      const request = createRequest();
      const uuid = 'dispose-uuid';

      mockUUID.mockReturnValue(uuid as ReturnType<typeof randomUUID>);
      mocks.s3.getObjectStream.mockResolvedValue(new Readable({ read() {} }));
      mockCreateWriteStream.mockReturnValue(
        {} as ReturnType<typeof createWriteStream>
      );
      mockPipeline.mockResolvedValue();

      const handle = await sourceRepository.getSource(request);

      handle.dispose();

      expect(mockUnlinkSync).toHaveBeenCalledWith(`/tmp/source/${uuid}.docx`);
    });

    test('dispose swallows errors from unlinkSync', async () => {
      const { sourceRepository, mocks } = setup();
      const request = createRequest();
      const uuid = 'error-uuid';

      mockUUID.mockReturnValue(uuid as ReturnType<typeof randomUUID>);
      mocks.s3.getObjectStream.mockResolvedValue(new Readable({ read() {} }));
      mockCreateWriteStream.mockReturnValue(
        {} as ReturnType<typeof createWriteStream>
      );
      mockPipeline.mockResolvedValue();

      mockUnlinkSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const handle = await sourceRepository.getSource(request);

      expect(() => handle.dispose()).not.toThrow();
    });
  });
});
