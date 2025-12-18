import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { mock } from 'jest-mock-extended';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ZodError } from 'zod';
import {
  getConfigFromSsmString,
  SftpSupplierClientRepository,
} from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import NodeCache from 'node-cache';

jest.mock('../../infra/sftp-client');
jest.mock('node-cache');

function setup() {
  const environment = 'testenv';

  const ssmClient = mockClient(SSMClient);

  const { logger } = createMockLogger();

  const cache = mock<NodeCache>();

  const mocks = {
    logger,
    environment,
    ssmClient,
    cache,
  };
  return { mocks };
}

describe('getClient', () => {
  test('Returns client when credentials are not cached', async () => {
    const {
      mocks: { logger, environment, ssmClient, cache },
    } = setup();

    cache.get.mockReturnValueOnce(undefined);

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
    const mockSftpClient = jest.mocked(SftpClient).mock.instances[0];
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
  });

  test('Returns client when credentials are cached', async () => {
    const {
      mocks: { logger, environment, ssmClient, cache },
    } = setup();

    cache.get.mockReturnValueOnce(
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
  });

  test('throws if parameter response is empty', async () => {
    const {
      mocks: { logger, environment, ssmClient, cache },
    } = setup();

    ssmClient.on(GetParameterCommand).resolvesOnce({});

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
