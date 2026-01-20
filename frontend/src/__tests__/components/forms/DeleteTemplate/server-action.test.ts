import { redirect, RedirectType } from 'next/navigation';
import {
  deleteTemplateYesAction,
  deleteTemplateNoAction,
} from '@forms/DeleteTemplate/server-action';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { setTemplateToDeleted } from '@utils/form-actions';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('nhs-notify-web-template-management-utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('redirects', async () => {
  const mockRedirect = jest.mocked(redirect);

  await deleteTemplateNoAction();

  expect(mockRedirect).toHaveBeenCalledWith(
    '/message-templates',
    RedirectType.push
  );
});

test('calls form action and redirects', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockSetTemplateToDeleted = jest.mocked(setTemplateToDeleted);

  const mockTemplate: NHSAppTemplate = {
    id: 'template-id',
    name: 'template-name',
    message: 'template-message',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  await deleteTemplateYesAction(mockTemplate);

  expect(mockSetTemplateToDeleted).toHaveBeenCalledWith('template-id', 1);

  expect(mockRedirect).toHaveBeenCalledWith(
    '/message-templates',
    RedirectType.push
  );
});

test('redirects to error page when template is linked to message plans', async () => {
  const mockSetTemplateToDeleted = jest.mocked(setTemplateToDeleted);
  const mockRedirect = jest.mocked(redirect);

  mockSetTemplateToDeleted.mockRejectedValueOnce(new Error('TEMPLATE_IN_USE'));

  const mockTemplate: NHSAppTemplate = {
    id: 'template-id',
    name: 'template-name',
    message: 'template-message',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  await deleteTemplateYesAction(mockTemplate);

  expect(mockSetTemplateToDeleted).toHaveBeenCalledWith('template-id', 1);
  expect(mockRedirect).toHaveBeenCalledWith(
    '/delete-template-error/template-id',
    RedirectType.push
  );
});

test('rethrows other errors', async () => {
  const mockSetTemplateToDeleted = jest.mocked(setTemplateToDeleted);
  const mockRedirect = jest.mocked(redirect);

  const unexpectedError = new Error('Database connection failed');
  mockSetTemplateToDeleted.mockRejectedValueOnce(unexpectedError);

  const mockTemplate: NHSAppTemplate = {
    id: 'template-id',
    name: 'template-name',
    message: 'template-message',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  await expect(deleteTemplateYesAction(mockTemplate)).rejects.toThrow(
    'Database connection failed'
  );

  expect(mockSetTemplateToDeleted).toHaveBeenCalledWith('template-id', 1);
  expect(mockRedirect).not.toHaveBeenCalled();
});
