/* eslint-disable sonarjs/publicly-writable-directories */
import { randomUUID } from 'node:crypto';
import { createWriteStream, unlinkSync, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { mock } from 'jest-mock-extended';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { SourceRepository } from '../../infra/source-repository';
import { createInitialRequest } from '../fixtures/create-request';
import { Readable } from 'node:stream';

jest.mock('node:crypto');
jest.mock('node:fs');
jest.mock('node:stream/promises');

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

      const request = createInitialRequest();
      const uuid = '5B37238E-3F4F-4155-8DD4-20EE6942C571';
      const mockStream = new Readable({ read() {} });
      const mockWriteStream = {} as ReturnType<typeof createWriteStream>;

      mockUUID.mockReturnValue(uuid);
      mocks.s3.getObjectStream.mockResolvedValue(mockStream);
      mockCreateWriteStream.mockReturnValue(mockWriteStream);

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

      const request = createInitialRequest();
      const uuid = '5A491ECB-C769-4A43-B466-AC131431C5F6';

      mockUUID.mockReturnValue(uuid);
      mocks.s3.getObjectStream.mockResolvedValue(new Readable({ read() {} }));
      mockCreateWriteStream.mockReturnValue(
        {} as ReturnType<typeof createWriteStream>
      );

      const handle = await sourceRepository.getSource(request);

      handle.dispose();

      expect(mockUnlinkSync).toHaveBeenCalledWith(`/tmp/source/${uuid}.docx`);
    });

    test('dispose swallows errors from unlinkSync', async () => {
      const { sourceRepository, mocks } = setup();

      const request = createInitialRequest();

      mockUUID.mockReturnValue('B74266F2-73C7-4968-8FB9-EF90D7A12300');
      mocks.s3.getObjectStream.mockResolvedValue(new Readable({ read() {} }));
      mockCreateWriteStream.mockReturnValue(
        {} as ReturnType<typeof createWriteStream>
      );

      mockUnlinkSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const handle = await sourceRepository.getSource(request);

      expect(() => handle.dispose()).not.toThrow();
    });
  });
});
