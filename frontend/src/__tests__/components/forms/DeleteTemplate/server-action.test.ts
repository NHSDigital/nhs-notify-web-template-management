import { redirect, RedirectType } from 'next/navigation';
import {
  deleteTemplateYesAction,
  deleteTemplateNoAction,
} from '@forms/DeleteTemplate/server-action';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { setTemplateToDeleted } from '@utils/form-actions';

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
    clientId: 'client1',
    userId: 'user1',
    message: 'template-message',
    templateType: 'NHS_APP',
    templateStatus: 'NOT_YET_SUBMITTED',
    createdAt: 'today',
    updatedAt: 'today',
  };

  await deleteTemplateYesAction(mockTemplate);

  expect(mockSetTemplateToDeleted).toHaveBeenCalledWith('template-id');

  expect(mockRedirect).toHaveBeenCalledWith(
    '/message-templates',
    RedirectType.push
  );
});
