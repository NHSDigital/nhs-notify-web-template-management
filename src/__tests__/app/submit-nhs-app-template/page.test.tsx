import SubmitNhsAppTemplatePage from '@app/submit-nhs-app-template/[sessionId]/page';
import { render } from '@testing-library/react';
import { TemplateType } from '@utils/types';
import nav from 'next/navigation';

jest.mock('@utils/form-actions', () => ({
  getSession: (sessionId: string) => {
    if (sessionId === 'session-id') {
      return {
        id: 'session-id',
        templateType: TemplateType.NHS_APP,
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      };
    }
  },
}));

jest.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('Simulated redirect');
  },
  useRouter: () => {},

  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('@forms/SubmitTemplate/SubmitTemplate', () => ({
  SubmitTemplate: () => <div>SubmitTemplatePlaceholder</div>,
}));

test('SubmitTemplatePage', async () => {
  const page = await SubmitNhsAppTemplatePage({
    params: {
      sessionId: 'session-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('SubmitTemplatePage - should handle invalid session', async () => {
  const redirectSpy = jest.spyOn(nav, 'redirect');

  await expect(
    SubmitNhsAppTemplatePage({
      params: {
        sessionId: 'invalid-session',
      },
    })
  ).rejects.toThrow('Simulated redirect');

  expect(redirectSpy).toHaveBeenCalledWith('/invalid-session', 'replace');
});
