/**
 * @jest-environment node
 */
import { TemplateType, Session } from '@utils/types';
import {
  createSession,
  saveSession,
  getSession,
  saveTemplate,
  sendEmail,
  getTemplate,
  deleteSession,
} from '@utils/form-actions';
import { Template, TemplateInput } from '@domain/templates';
import { randomUUID } from 'node:crypto';
import { logger } from '@utils/logger';
import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@aws-amplify/adapter-nextjs/data');
jest.mock('node:crypto');
jest.mock('@utils/logger');

const randomUUIDMock = jest.mocked(randomUUID);

const mockResponseData = {
  id: 'id',
  sessionId: 'session-id',
  createdAt: 'created-at',
  updatedAt: 'updated-at',
  nhsAppTemplateName: 'template-name',
  nhsAppTemplateMessage: 'template-message',
};

const mockTemplateResponseData = {
  id: 'template-id',
  name: 'template-name',
  type: 'NHS_APP',
  version: 1,
  fields: {
    content: 'template-content',
  },
};
jest.mock('@utils/amplify-utils');

beforeEach(() => {
  jest.resetAllMocks();

  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 10:00'));
});

type MockSchema = ReturnType<typeof getAmplifyBackendClient>;

type MockSchemaInput = Parameters<typeof mockDeep<MockSchema>>[0];

const setup = (schema: MockSchemaInput) => {
  const mockSchema = mockDeep<MockSchema>(schema);

  jest.mocked(getAmplifyBackendClient).mockReturnValue(mockSchema);
};

test('createSession', async () => {
  const mockCreateSession = jest
    .fn()
    .mockReturnValue({ data: mockResponseData });
  setup({
    models: {
      SessionStorage: {
        create: mockCreateSession,
      },
    },
  });

  const createSessionInput: Omit<Session, 'id'> = {
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  };

  const response = await createSession(createSessionInput);

  expect(mockCreateSession).toHaveBeenCalledWith({
    ...createSessionInput,
    ttl: new Date('2022-01-06 10:00').getTime() / 1000,
  });
  expect(response).toEqual(mockResponseData);
});

test('createSession - error handling', async () => {
  const mockCreateSession = jest.fn().mockReturnValue({
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
      SessionStorage: {
        create: mockCreateSession,
      },
    },
  });

  await expect(
    createSession({
      templateType: 'UNKNOWN',
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    })
  ).rejects.toThrow('Failed to create new template');
});

test('saveSession', async () => {
  setup({
    models: {
      SessionStorage: {
        update: jest.fn().mockReturnValue({ data: mockResponseData }),
      },
    },
  });

  const response = await saveSession({
    id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  });

  expect(response).toEqual(mockResponseData);
});

test('saveSession - error handling', async () => {
  setup({
    models: {
      SessionStorage: {
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
    saveSession({
      id: '0c1d3422-a2f6-44ef-969d-d513c7c9d212',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    })
  ).rejects.toThrow('Failed to save template data');
});

test('getSession', async () => {
  setup({
    models: {
      SessionStorage: {
        get: jest.fn().mockReturnValue({ data: mockResponseData }),
      },
    },
  });

  const response = await getSession('session-id');

  expect(response).toEqual(mockResponseData);
});

test('getSession - returns undefined if session is not found', async () => {
  setup({
    models: {
      SessionStorage: {
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

  const response = await getSession('session-id');

  expect(response).toBeUndefined();
});

test('getTemplate', async () => {
  setup({
    models: {
      TemplateStorage: {
        get: jest.fn().mockReturnValue({ data: mockTemplateResponseData }),
      },
    },
  });

  const response = await getTemplate('template-id');

  expect(response).toEqual(mockTemplateResponseData);
});

test('getTemplate - returns undefined if session is not found', async () => {
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

test('saveTemplate - throws error when failing to save', async () => {
  setup({
    models: {
      TemplateStorage: {
        create: jest.fn().mockReturnValue({ errors: ['something went wrong'] }),
      },
    },
  });

  const template: Template = {
    id: 'template-id',
    fields: { content: 'body' },
    name: 'name',
    type: TemplateType.NHS_APP,
    version: 1,
  };

  await expect(saveTemplate(template)).rejects.toThrow(
    'Failed saving NHS_APP template'
  );
});

test('saveTemplate - no errors but no data', async () => {
  setup({
    models: {
      TemplateStorage: {
        create: jest.fn().mockReturnValue({}),
      },
    },
  });

  const template: Omit<Template, 'id'> = {
    fields: { content: 'body' },
    name: 'name',
    type: TemplateType.NHS_APP,
    version: 1,
  };

  await expect(saveTemplate(template)).rejects.toThrow(
    'NHS_APP template entity in unknown state. No errors reported but entity returned as falsy'
  );
});

test('saveTemplate - should return saved data', async () => {
  const template: TemplateInput = {
    fields: { content: 'body' },
    name: 'name',
    type: 'NHS_APP',
    version: 1,
  };

  const expected = {
    ...template,
    id: 'nhs_app-abc-123-def-456-ghi',
    createdAt: 'yesterday',
    updatedAt: 'today',
  };

  const mockCreateTemplate = jest.fn().mockReturnValue({ data: expected });

  setup({
    models: {
      TemplateStorage: {
        create: mockCreateTemplate,
      },
    },
  });

  randomUUIDMock.mockReturnValueOnce('abc-123-def-456-ghi');

  const entity = await saveTemplate(template);

  expect(entity).toEqual(expected);

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    ...template,
    id: 'nhs_app-abc-123-def-456-ghi',
  });
});

test('sendEmail - no errors', async () => {
  setup({
    queries: {
      sendEmail: jest.fn().mockReturnValue({}),
    },
  });

  const mockLogger = jest.mocked(logger);
  await sendEmail('template-id', 'template-name', 'template-message');

  expect(mockLogger.error).not.toHaveBeenCalled();
});

test('sendEmail - errors', async () => {
  setup({
    queries: {
      sendEmail: jest.fn().mockReturnValue({ errors: ['email error'] }),
    },
  });

  const mockLogger = jest.mocked(logger);
  await sendEmail('template-id-error', 'template-name', 'template-message');

  expect(mockLogger.error).toHaveBeenCalledWith({
    description: 'Error sending email',
    res: {
      errors: ['email error'],
    },
  });
});

test('deleteSession - returns undefined if session is not found', async () => {
  const mock = jest.fn().mockReturnValue({
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
      SessionStorage: {
        delete: mock,
      },
    },
  });

  const response = await deleteSession('session-id');

  expect(response).toBeFalsy();

  expect(mock).toHaveBeenCalledWith({ id: 'session-id' });
});

test('deleteSession - returns true when deleted', async () => {
  const mock = jest.fn().mockReturnValue({
    errors: undefined,
    data: {},
  });

  setup({
    models: {
      SessionStorage: {
        delete: mock,
      },
    },
  });

  const response = await deleteSession('session-id');

  expect(response).toBeTruthy();

  expect(mock).toHaveBeenCalledWith({ id: 'session-id' });
});
