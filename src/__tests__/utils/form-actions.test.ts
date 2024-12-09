/**
 * @jest-environment node
 */
import { NHSAppTemplate, Draft } from '@utils/types';
import { TemplateType, TemplateStatus } from '@utils/enum';
import {
  createTemplate,
  saveTemplate,
  getTemplate,
  sendEmail,
  getTemplates,
} from '@utils/form-actions';
import { logger } from '@utils/logger';
import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { mockDeep } from 'jest-mock-extended';
import type { Template } from '@utils/types';

jest.mock('@aws-amplify/adapter-nextjs/data');
jest.mock('node:crypto');
jest.mock('@utils/logger');

const mockResponseData = {
  id: 'id',
  templateId: 'template-id',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
  name: 'template-name',
  message: 'template-message',
};

const mockTemplates: Template[] = [
  {
    id: '1',
    version: 1,
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'Template 1',
    message: 'Message',
    subject: 'Subject Line',
    createdAt: '2021-01-01T00:00:00.000Z',
  },
];

jest.mock('@utils/amplify-utils');

beforeEach(() => {
  jest.resetAllMocks();
});

type MockSchema = ReturnType<typeof getAmplifyBackendClient>;

type MockSchemaInput = Parameters<typeof mockDeep<MockSchema>>[0];

const setup = (schema: MockSchemaInput) => {
  const mockSchema = mockDeep<MockSchema>(schema);

  jest.mocked(getAmplifyBackendClient).mockReturnValue(mockSchema);
};

test('createTemplate', async () => {
  const mockCreateTemplate = jest
    .fn()
    .mockReturnValue({ data: mockResponseData });
  setup({
    models: {
      TemplateStorage: {
        create: mockCreateTemplate,
      },
    },
  });

  const CreateTemplate: Draft<NHSAppTemplate> = {
    version: 1,
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'name',
    message: 'message',
  };

  const response = await createTemplate(CreateTemplate);

  expect(mockCreateTemplate).toHaveBeenCalledWith(CreateTemplate);
  expect(response).toEqual(mockResponseData);
});

test('createTemplate - error handling', async () => {
  const mockcreateTemplate = jest.fn().mockReturnValue({
    errors: [
      {
        message: 'test-error-message',
        errorType: 'test-error-type',
        errorInfo: { error: 'test-error' },
      },
    ],
  });
  setup({
    models: {
      TemplateStorage: {
        create: mockcreateTemplate,
      },
    },
  });

  await expect(
    createTemplate({
      version: 1,
      templateType: TemplateType.NHS_APP,
    } as unknown as Template)
  ).rejects.toThrow('Failed to create new template');
});

test('saveTemplate', async () => {
  setup({
    models: {
      TemplateStorage: {
        update: jest.fn().mockReturnValue({ data: mockResponseData }),
      },
    },
  });

  const response = await saveTemplate({
    id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
    version: 1,
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'template-name',
    message: 'template-message',
  });

  expect(response).toEqual(mockResponseData);
});

test('saveTemplate - error handling', async () => {
  setup({
    models: {
      TemplateStorage: {
        update: jest.fn().mockReturnValue({
          errors: [
            {
              message: 'test-error-message',
              errorType: 'test-error-type',
              errorInfo: { error: 'test-error' },
            },
          ],
        }),
      },
    },
  });

  await expect(
    saveTemplate({
      id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      message: 'template-message',
    })
  ).rejects.toThrow('Failed to save template data');
});

test('saveTemplate - error handling - when no data returned', async () => {
  setup({
    models: {
      TemplateStorage: {
        update: jest.fn().mockReturnValue({
          errors: undefined,
          data: undefined,
        }),
      },
    },
  });

  await expect(
    saveTemplate({
      id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
      version: 1,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      message: 'template-message',
    })
  ).rejects.toThrow(
    'Template in unknown state. No errors reported but entity returned as falsy'
  );
});

test('getTemplate', async () => {
  setup({
    models: {
      TemplateStorage: {
        get: jest.fn().mockReturnValue({ data: mockResponseData }),
      },
    },
  });

  const response = await getTemplate('template-id');

  expect(response).toEqual(mockResponseData);
});

test('getTemplate - returns undefined if template is not found', async () => {
  setup({
    models: {
      TemplateStorage: {
        get: jest.fn().mockReturnValue({
          errors: [
            {
              message: 'test-error-message',
              errorType: 'test-error-type',
              errorInfo: { error: 'test-error' },
            },
          ],
        }),
      },
    },
  });

  const response = await getTemplate('template-id');

  expect(response).toBeUndefined();
});

test('sendEmail - no errors', async () => {
  setup({
    queries: {
      sendEmail: jest.fn().mockReturnValue({}),
    },
  });

  const mockLogger = jest.mocked(logger);
  await sendEmail('template-id', 'template-name', 'template-message', null);

  expect(mockLogger.error).not.toHaveBeenCalled();
});

test('sendEmail - errors', async () => {
  setup({
    queries: {
      sendEmail: jest.fn().mockReturnValue({ errors: ['email error'] }),
    },
  });

  const mockLogger = jest.mocked(logger);
  await sendEmail(
    'template-id-error',
    'template-name',
    'template-message',
    null
  );

  expect(mockLogger.error).toHaveBeenCalledWith({
    description: 'Error sending email',
    res: {
      errors: ['email error'],
    },
  });
});

test('getTemplates', async () => {
  setup({
    models: {
      TemplateStorage: {
        list: jest.fn().mockReturnValue({ data: mockTemplates }),
      },
    },
  });
  const response = await getTemplates();

  expect(response).toEqual(mockTemplates);
});

test('getTemplates - remove invalid templates from response', async () => {
  const templatesWithInvalidData = [
    ...mockTemplates,
    {
      id: '1',
      version: 1,
      templateType: 'invalidType',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'Template 1',
      message: 'Message',
      subject: 'Subject Line',
      createdAt: '2021-01-01T00:00:00.000Z',
    },
  ];
  setup({
    models: {
      TemplateStorage: {
        list: jest.fn().mockReturnValue({ data: templatesWithInvalidData }),
      },
    },
  });
  const response = await getTemplates();

  expect(response).toEqual(mockTemplates);
});

test('getTemplates - returns empty array if there are no templates/data returned', async () => {
  setup({
    models: {
      TemplateStorage: {
        list: jest.fn().mockReturnValue({ data: [] }),
      },
    },
  });

  const response = await getTemplates();

  expect(response).toEqual([]);
});

test('getTemplates - errors', async () => {
  setup({
    models: {
      TemplateStorage: {
        list: jest.fn().mockReturnValue({
          errors: [
            {
              message: 'test-error-message',
              errorType: 'test-error-type',
              errorInfo: { error: 'test-error' },
            },
          ],
        }),
      },
    },
  });

  const mockLogger = jest.mocked(logger);
  const response = await getTemplates();

  expect(mockLogger.error).toHaveBeenCalledWith('Failed to get templates', [
    {
      errorInfo: { error: 'test-error' },
      errorType: 'test-error-type',
      message: 'test-error-message',
    },
  ]);

  expect(response).toEqual([]);
});
