import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ZodError } from 'zod';
import {
  getConfigFromSsmString,
  SftpSupplierClientRepository,
} from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { ICache } from 'nhs-notify-web-template-management-utils';
import { mock } from 'jest-mock-extended';

jest.mock('../../infra/sftp-client');

function setup() {
  const environment = 'testenv';

  const ssmClient = mockClient(SSMClient);

  const { logger } = createMockLogger();

  const cacheRelease = jest.fn();
  const cache = mock<ICache>({ acquireLock: async () => cacheRelease });

  const mocks = {
    logger,
    environment,
    ssmClient,
    cache,
  };
  return { mocks, cacheRelease };
}

describe('getClient', () => {
  test('Returns client when credentials are not cached', async () => {
    const {
      mocks: { logger, environment, ssmClient, cache },
      cacheRelease,
    } = setup();

    cache.get.mockResolvedValueOnce(null);

    ssmClient.on(GetParameterCommand).resolvesOnce({
      Parameter: {
        Value: JSON.stringify({
          host: 'testHost',
          username: 'testUser',
          privateKey: 'testKey',
          hostKey: 'hostKey',
          baseUploadDir: 'upload/dir',
          baseDownloadDir: 'download/dir',
        }),
      },
    });

    const sftpClientRepository = new SftpSupplierClientRepository(
      environment,
      ssmClient as unknown as SSMClient,
      cache,
      logger
    );

    const supplier: string = 'SYNERTEC';
    const client = await sftpClientRepository.getClient(supplier);
    const mockSftpClient = (SftpClient as jest.Mock).mock.instances[0];
    const credKey = '/testenv/sftp-config/SYNERTEC';

    expect(client).toEqual({
      sftpClient: mockSftpClient,
      baseUploadDir: 'upload/dir',
      baseDownloadDir: 'download/dir',
    });

    expect(cache.get).toHaveBeenCalledWith(credKey);

    expect(ssmClient).toHaveReceivedCommandWith(GetParameterCommand, {
      Name: credKey,
    });

    expect(SftpClient).toHaveBeenCalledWith(
      'testHost',
      'testUser',
      'testKey',
      'hostKey'
    );

    expect(cacheRelease).toHaveBeenCalled();
  });

  test('Returns client when credentials are cached', async () => {
    const {
      mocks: { logger, environment, ssmClient, cache },
      cacheRelease,
    } = setup();

    cache.get.mockResolvedValueOnce(
      JSON.stringify({
        host: 'testHost',
        username: 'testUser',
        privateKey: 'testKey',
        hostKey: 'hostKey',
        baseUploadDir: 'upload/dir',
        baseDownloadDir: 'download/dir',
      })
    );

    const sftpClientRepository = new SftpSupplierClientRepository(
      environment,
      ssmClient as unknown as SSMClient,
      cache,
      logger
    );

    const supplier: string = 'SYNERTEC';
    const client = await sftpClientRepository.getClient(supplier);
    const mockSftpClient = (SftpClient as jest.Mock).mock.instances[0];
    const credKey = '/testenv/sftp-config/SYNERTEC';

    expect(client).toEqual({
      sftpClient: mockSftpClient,
      baseUploadDir: 'upload/dir',
      baseDownloadDir: 'download/dir',
    });

    expect(cache.get).toHaveBeenCalledWith(credKey);

    expect(ssmClient).not.toHaveReceivedAnyCommand();

    expect(SftpClient).toHaveBeenCalledWith(
      'testHost',
      'testUser',
      'testKey',
      'hostKey'
    );

    expect(cacheRelease).toHaveBeenCalled();
  });

  test('throws if parameter response is empty', async () => {
    const {
      mocks: { logger, environment, ssmClient, cache },
    } = setup();

    ssmClient.on(GetParameterCommand).resolvesOnce({
      Parameter: {},
    });

    const sftpClientRepository = new SftpSupplierClientRepository(
      environment,
      ssmClient as unknown as SSMClient,
      cache,
      logger
    );

    await expect(sftpClientRepository.getClient('SYNERTEC')).rejects.toThrow(
      'SFTP credentials are undefined'
    );
  });
});

describe('getConfigFromSsmString', () => {
  test('Returns ssm config', async () => {
    const testConfig = {
      host: 'testhost',
      username: 'testusername',
      privateKey: 'testprivatekey',
      hostKey: 'testhostkey',
      baseUploadDir: 'upload/dir',
      baseDownloadDir: 'download/dir',
    };

    const config = getConfigFromSsmString(JSON.stringify(testConfig));

    expect(config).toEqual(testConfig);
  });

  test('Requires host', async () => {
    const testConfig = {
      username: 'testusername',
      privateKey: 'testprivatekey',
      hostKey: 'testhostkey',
    };

    expect(() => getConfigFromSsmString(JSON.stringify(testConfig))).toThrow(
      ZodError
    );
  });

  test('Requires username', async () => {
    const testConfig = {
      host: 'testhost',
      privateKey: 'testprivatekey',
      hostKey: 'testhostkey',
    };

    expect(() => getConfigFromSsmString(JSON.stringify(testConfig))).toThrow(
      ZodError
    );
  });

  test('Requires private key', async () => {
    const testConfig = {
      host: 'testhost',
      username: 'testusername',
      hostKey: 'testhostkey',
    };

    expect(() => getConfigFromSsmString(JSON.stringify(testConfig))).toThrow(
      ZodError
    );
  });
});

test('Requires host key', async () => {
  const testConfig = {
    host: 'testhost',
    username: 'testusername',
    privateKey: 'testprivatekey',
  };

  expect(() => getConfigFromSsmString(JSON.stringify(testConfig))).toThrow(
    ZodError
  );
});
