import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ZodError } from 'zod';
import {
  getConfigFromSsmString,
  SftpSupplierClientRepository,
} from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils';

jest.mock('../../infra/sftp-client');

function setup() {
  const environment = 'testenv';

  const ssmClient = mockClient(SSMClient);

  const { logger } = createMockLogger();

  const mocks = {
    logger,
    environment,
    ssmClient,
  };
  return { mocks };
}

describe('getClient', () => {
  test('Returns client', async () => {
    const {
      mocks: { logger, environment, ssmClient },
    } = setup();

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
      ssmClient as unknown as SSMClient
    );

    const supplier: string = 'SYNERTEC';
    const client = await sftpClientRepository.getClient(supplier, logger);
    const mockSftpClient = (SftpClient as jest.Mock).mock.instances[0];

    expect(client).toEqual({
      sftpClient: mockSftpClient,
      baseUploadDir: 'upload/dir',
      baseDownloadDir: 'download/dir',
    });

    expect(ssmClient).toHaveReceivedCommandWith(GetParameterCommand, {
      Name: '/testenv/sftp-config/SYNERTEC',
    });

    expect(SftpClient).toHaveBeenCalledWith(
      'testHost',
      'testUser',
      'testKey',
      'hostKey'
    );
  });

  test('throws if parameter response is empty', async () => {
    const {
      mocks: { logger, environment, ssmClient },
    } = setup();

    ssmClient.on(GetParameterCommand).resolvesOnce({
      Parameter: {},
    });

    const sftpClientRepository = new SftpSupplierClientRepository(
      environment,
      ssmClient as unknown as SSMClient
    );

    await expect(
      sftpClientRepository.getClient('SYNERTEC', logger)
    ).rejects.toThrow('SFTP credentials are undefined');
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
