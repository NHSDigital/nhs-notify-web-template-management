/**
 * @jest-environment node
 */
import {
  NHSAppTemplate,
  Draft,
  TemplateType,
  TemplateStatus,
  logger,
} from 'nhs-notify-web-template-management-utils';
import {
  createTemplate,
  saveTemplate,
  getTemplate,
  sendEmail,
  getTemplates,
} from '@utils/form-actions';
import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { mockDeep } from 'jest-mock-extended';
import type { Template } from 'nhs-notify-web-template-management-utils';

jest.mock('@aws-amplify/adapter-nextjs/data');
jest.mock('node:crypto');

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

  const createTemplateInput: Draft<NHSAppTemplate> = {
    version: 1,
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'name',
    message: 'message',
  };

  const response = await createTemplate(createTemplateInput);

  expect(mockCreateTemplate).toHaveBeenCalledWith(createTemplateInput);
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

  const mockErrorLogger = jest.spyOn(logger, 'error');
  await sendEmail('template-id', 'template-name', 'template-message', null);

  expect(mockErrorLogger).not.toHaveBeenCalled();
});

test('sendEmail - errors', async () => {
  setup({
    queries: {
      sendEmail: jest.fn().mockReturnValue({ errors: ['email error'] }),
    },
  });

  const mockErrorLogger = jest.spyOn(logger, 'error');
  await sendEmail(
    'template-id-error',
    'template-name',
    'template-message',
    null
  );

  expect(mockErrorLogger).toHaveBeenCalledWith({
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

  const mockErrorLogger = jest.spyOn(logger, 'error');
  const response = await getTemplates();

  expect(mockErrorLogger).toHaveBeenCalledWith('Failed to get templates', [
    {
      errorInfo: { error: 'test-error' },
      errorType: 'test-error-type',
      message: 'test-error-message',
    },
  ]);

  expect(response).toEqual([]);
});

test('getTemplates - order by createdAt and then id', async () => {
  const baseTemplate = {
    version: 1,
    templateType: 'SMS',
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'Template',
    message: 'Message',
  };

  const templates = [
    { ...baseTemplate, id: '06', createdAt: '2022-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '08', createdAt: '2020-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '05', createdAt: '2021-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '02', createdAt: '2021-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '09' },
    { ...baseTemplate, id: '10' },
    { ...baseTemplate, id: '01', createdAt: '2021-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '07' },
    { ...baseTemplate, id: '03', createdAt: '2021-01-01T00:00:00.000Z' },
    { ...baseTemplate, id: '04', createdAt: '2021-01-01T00:00:00.000Z' },
  ];

  // 06 is the newest, 08 is the oldest.
  // Templates without a createdAt, 07, 09 and 10, go at the end.
  // 01 - 05 all have the same createdAt.
  const expectedOrder = [
    '06',
    '01',
    '02',
    '03',
    '04',
    '05',
    '08',
    '07',
    '09',
    '10',
  ];

  setup({
    models: {
      TemplateStorage: {
        list: jest.fn().mockReturnValue({ data: templates }),
      },
    },
  });

  const response = await getTemplates();

  const actualOrder = [];
  for (const template of response) {
    actualOrder.push(template.id);
  }

  expect(actualOrder).toEqual(expectedOrder);
});
