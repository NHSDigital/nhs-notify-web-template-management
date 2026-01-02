import { runMigration } from '@/src/migration/migration';
import {
  discoverUserPoolId,
  retrieveUsers,
} from '@/src/utils/aws/cognito-util';
import { backupDataToS3 } from '@/src/utils/backup-util';
import { logger } from '@/src/utils/logger';
import {
  retrieveAllRoutingConfigurations,
  retrieveAllTemplates,
  updateRoutingConfigurationRecord,
  updateTemplateRecord,
} from '@/src/utils/template-management-repository';
import { readFileSync, writeFileSync } from 'node:fs';

jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/src/utils/aws/cognito-util', () => ({
  discoverUserPoolId: jest.fn(),
  retrieveUsers: jest.fn(),
  INTERNAL_ID_ATTRIBUTE: jest.requireActual('@/src/utils/aws/cognito-util')
    .INTERNAL_ID_ATTRIBUTE,
}));

jest.mock('@/src/utils/backup-util', () => ({
  backupDataToS3: jest.fn(),
  getTimestamp: () => '20251222103500000',
}));

jest.mock('@/src/utils/template-management-repository', () => ({
  retrieveAllRoutingConfigurations: jest.fn(),
  retrieveAllTemplates: jest.fn(),
  updateRoutingConfigurationRecord: jest.fn(),
  updateTemplateRecord: jest.fn(),
}));

const mockParseSync = jest.fn();

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('yargs', () => () => ({
  options: jest.fn().mockReturnThis(),
  parseSync: mockParseSync,
}));

jest.mock('yargs/helpers', () => ({
  hideBin: jest.fn(),
}));

describe('migration', () => {
  test('should export user details', async () => {
    // arrange
    const mockedWriteFileSync = jest.mocked(writeFileSync);
    const mockedInfoLogger = jest.mocked(logger).info;
    mockParseSync.mockImplementationOnce(() => ({
      env: 'test',
      dryRun: false,
    }));
    jest.mocked(discoverUserPoolId).mockResolvedValueOnce('eu-west-2_ABC123');
    jest.mocked(retrieveUsers).mockResolvedValueOnce(
      Promise.resolve([
        {
          Username: 'user1',
          Attributes: [
            {
              Name: 'custom:nhs_notify_user_id',
              Value: 'INTERNAL_USER#12345',
            },
            { Name: 'sub', Value: 'sub-12345' },
          ],
        },
        {
          Username: 'user2',
          Attributes: [
            {
              Name: 'custom:nhs_notify_user_id',
              Value: 'EXTERNAL_USER#67890',
            },
            { Name: 'sub', Value: 'sub-67890' },
          ],
        },
      ])
    );

    // act
    await runMigration();

    // assert
    expect(mockedWriteFileSync).toHaveBeenCalledWith(
      'user-migration-export-test-20251222103500000.json',
      JSON.stringify(
        {
          'sub-12345': 'INTERNAL_USER#12345',
          'sub-67890': 'EXTERNAL_USER#67890',
        },
        null,
        2
      )
    );
    expect(mockedInfoLogger).toHaveBeenCalledWith(
      'User details exported to file: user-migration-export-test-20251222103500000.json'
    );
  });

  test('should export user details - dry run', async () => {
    // arrange
    const mockedWriteFileSync = jest.mocked(writeFileSync);
    const mockedInfoLogger = jest.mocked(logger).info;
    mockParseSync.mockImplementationOnce(() => ({
      env: 'test',
      dryRun: true,
    }));
    jest.mocked(discoverUserPoolId).mockResolvedValueOnce('eu-west-2_ABC123');
    jest.mocked(retrieveUsers).mockResolvedValueOnce(
      Promise.resolve([
        {
          Username: 'user1',
          Attributes: [
            {
              Name: 'custom:nhs_notify_user_id',
              Value: 'INTERNAL_USER#12345',
            },
            { Name: 'sub', Value: 'sub-12345' },
          ],
        },
        {
          Username: 'user2',
          Attributes: [
            {
              Name: 'custom:nhs_notify_user_id',
              Value: 'EXTERNAL_USER#67890',
            },
            { Name: 'sub', Value: 'sub-67890' },
          ],
        },
      ])
    );

    // act
    await runMigration();

    // assert
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
    expect(mockedInfoLogger).toHaveBeenCalledWith(
      'User details exported to file: user-migration-export-test-20251222103500000.json'
    );
  });

  test('should perform migration with user details file', async () => {
    // arrange
    const mockTemplates: Array<Record<string, unknown>> = [
      {
        id: 'template1',
        updatedBy: 'sub-12345',
        createdBy: 'sub-67890',
      },
      {
        id: 'template2',
        updatedBy: 'INTERNAL_USER#12345',
        createdBy: 'INTERNAL_USER#12345',
      },
      { id: 'template3' },
      {
        id: 'template4',
        updatedBy: 'sub-67890',
        createdBy: 'sub-67890',
      },
      {
        id: 'template5',
        updatedBy: 'sub-unknown1',
        createdBy: 'sub-unknown2',
      },
    ];
    const mockRoutingConfigs: Array<Record<string, unknown>> = [
      {
        id: 'routingConfig1',
        updatedBy: 'sub-12345',
        createdBy: 'sub-67890',
      },
      {
        id: 'routingConfig2',
        updatedBy: 'INTERNAL_USER#12345',
        createdBy: 'INTERNAL_USER#12345',
      },
      { id: 'routingConfig3' },
    ];
    const mockUserDetails = {
      'sub-12345': '12345',
      'sub-67890': '67890',
    };
    const mockedInfoLogger = jest.mocked(logger).info;
    jest
      .mocked(readFileSync)
      .mockReturnValueOnce(JSON.stringify(mockUserDetails));
    mockParseSync.mockImplementationOnce(() => ({
      env: 'test',
      dryRun: false,
      userDetailsFile: 'path/to/user-details.json',
    }));
    jest.mocked(retrieveAllTemplates).mockResolvedValueOnce(mockTemplates);
    jest
      .mocked(retrieveAllRoutingConfigurations)
      .mockResolvedValueOnce(mockRoutingConfigs);
    jest.mocked(updateTemplateRecord).mockResolvedValue('success');
    jest.mocked(updateRoutingConfigurationRecord).mockResolvedValue('success');

    // act
    await runMigration();

    // assert
    expect(readFileSync).toHaveBeenCalledWith(
      'path/to/user-details.json',
      'utf8'
    );
    expect(backupDataToS3).toHaveBeenCalledWith(
      {
        templates: mockTemplates,
        routingConfigs: mockRoutingConfigs,
        userDetails: mockUserDetails,
      },
      'test'
    );
    expect(updateTemplateRecord).toHaveBeenCalledTimes(2);
    expect(updateRoutingConfigurationRecord).toHaveBeenCalledTimes(1);
    expect(updateTemplateRecord).toHaveBeenNthCalledWith(
      1,
      'test',
      mockTemplates[0],
      'INTERNAL_USER#67890',
      'INTERNAL_USER#12345'
    );
    expect(updateTemplateRecord).toHaveBeenNthCalledWith(
      2,
      'test',
      mockTemplates[3],
      'INTERNAL_USER#67890',
      'INTERNAL_USER#67890'
    );
    expect(updateRoutingConfigurationRecord).toHaveBeenNthCalledWith(
      1,
      'test',
      mockRoutingConfigs[0],
      'INTERNAL_USER#67890',
      'INTERNAL_USER#12345'
    );

    expect(mockedInfoLogger).toHaveBeenCalledWith('Templates updated: 2/5');
    expect(mockedInfoLogger).toHaveBeenCalledWith(
      'Routing configurations updated: 1/3'
    );
    expect(mockedInfoLogger).toHaveBeenCalledWith(
      'Data migration of user identifiers completed successfully'
    );
  });

  test('should perform migration with user details file - dry run', async () => {
    // arrange
    const mockTemplates: Array<Record<string, unknown>> = [
      {
        id: 'template1',
        updatedBy: 'sub-12345',
        createdBy: 'sub-67890',
      },
      {
        id: 'template2',
        updatedBy: 'INTERNAL_USER#12345',
        createdBy: 'INTERNAL_USER#12345',
      },
      { id: 'template3' },
      {
        id: 'template4',
        updatedBy: 'sub-67890',
        createdBy: 'sub-67890',
      },
    ];
    const mockRoutingConfigs: Array<Record<string, unknown>> = [
      {
        id: 'routingConfig1',
        updatedBy: 'sub-12345',
        createdBy: 'sub-67890',
      },
      {
        id: 'routingConfig2',
        updatedBy: 'INTERNAL_USER#12345',
        createdBy: 'INTERNAL_USER#12345',
      },
      { id: 'routingConfig3' },
    ];
    const mockUserDetails = {
      'sub-12345': '12345',
      'sub-67890': '67890',
    };
    const mockedInfoLogger = jest.mocked(logger).info;
    jest
      .mocked(readFileSync)
      .mockReturnValueOnce(JSON.stringify(mockUserDetails));
    mockParseSync.mockImplementationOnce(() => ({
      env: 'test',
      dryRun: true,
      userDetailsFile: 'path/to/user-details.json',
    }));
    jest.mocked(retrieveAllTemplates).mockResolvedValueOnce(mockTemplates);
    jest
      .mocked(retrieveAllRoutingConfigurations)
      .mockResolvedValueOnce(mockRoutingConfigs);
    jest.mocked(updateTemplateRecord).mockResolvedValue('success');
    jest.mocked(updateRoutingConfigurationRecord).mockResolvedValue('success');

    // act
    await runMigration();

    // assert
    expect(readFileSync).toHaveBeenCalledWith(
      'path/to/user-details.json',
      'utf8'
    );
    expect(backupDataToS3).toHaveBeenCalledWith(
      {
        templates: mockTemplates,
        routingConfigs: mockRoutingConfigs,
        userDetails: mockUserDetails,
      },
      'test'
    );
    expect(updateTemplateRecord).not.toHaveBeenCalled();
    expect(updateRoutingConfigurationRecord).not.toHaveBeenCalled();
    expect(mockedInfoLogger).toHaveBeenCalledWith('Templates updated: 2/4');
    expect(mockedInfoLogger).toHaveBeenCalledWith(
      'Routing configurations updated: 1/3'
    );
    expect(mockedInfoLogger).toHaveBeenCalledWith(
      'Data migration of user identifiers completed successfully'
    );
  });
});
