import nav from 'next/navigation';
import NhsAppTemplateSubmittedPage from '@app/nhs-app-template-submitted/[sessionId]/page';
import { render } from '@testing-library/react';

const mockSessionSupplier = {
  mockSession: {} as unknown,
};

jest.mock('@utils/form-actions', () => ({
  getSession: () =>
    new Promise((resolve, _) => {
      resolve(mockSessionSupplier.mockSession);
    }),
  sendEmail: () => {},
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

test('NhsAppTemplateSubmittedPage', async () => {
  const page = await NhsAppTemplateSubmittedPage({
    params: {
      sessionId: 'session-id',
    },
  });
  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('NhsAppTemplateSubmittedPage - should handle invalid session', async () => {
  mockSessionSupplier.mockSession = undefined;
  const redirectSpy = jest.spyOn(nav, 'redirect');

  await expect(
    NhsAppTemplateSubmittedPage({
      params: {
        sessionId: 'session-id',
      },
    })
  ).rejects.toThrow('Simulated redirect');

  expect(redirectSpy).toHaveBeenCalledWith('/invalid-session', 'replace');
});
