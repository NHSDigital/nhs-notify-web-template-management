import { redirect, RedirectType } from 'next/navigation';
import {
  deleteTemplateYesAction,
  deleteTemplateNoAction,
} from '@forms/DeleteTemplate/server-action';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { saveTemplate } from '@utils/form-actions';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

test('redirects', async () => {
  const mockRedirect = jest.mocked(redirect);

  await deleteTemplateNoAction();

  expect(mockRedirect).toHaveBeenCalledWith(
    '/manage-templates',
    RedirectType.push
  );
});

test('calls form action and redirects', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockSaveTemplate = jest.mocked(saveTemplate);

  const mockTemplate: NHSAppTemplate = {
    id: 'template-id',
    name: 'template-name',
    message: 'template-message',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    createdAt: 'today',
    updatedAt: 'today',
  };

  await deleteTemplateYesAction(mockTemplate);

  expect(mockSaveTemplate).toHaveBeenCalledWith({
    ...mockTemplate,
    templateStatus: 'DELETED',
  });

  expect(mockRedirect).toHaveBeenCalledWith(
    '/manage-templates',
    RedirectType.push
  );
});
