import { render } from '@testing-library/react';
import PreviewNhsAppTemplatePage from '@app/preview-nhs-app-template/[sessionId]/page';
import { TemplateFormState, TemplateType } from '@utils/types';
import nav from 'next/navigation';

const mockSessionSupplier = {
  mockSession: {} as unknown,
};

jest.mock('@utils/form-actions', () => ({
  getSession: () =>
    new Promise((resolve, _) => {
      resolve(mockSessionSupplier.mockSession);
    }),
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

jest.mock('react-dom', () => {
  const originalModule = jest.requireActual('react-dom');

  return {
    ...originalModule,
    useFormState: (
      _: (
        formState: TemplateFormState,
        formData: FormData
      ) => Promise<TemplateFormState>,
      initialState: TemplateFormState
    ) => [initialState, '/action'],
  };
});

test('PreviewNhsAppTemplatePage', async () => {
  mockSessionSupplier.mockSession = {
    id: 'session-id',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  };

  const page = await PreviewNhsAppTemplatePage({
    params: {
      sessionId: 'session-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('PreviewNhsAppTemplatePage - should handle invalid session', async () => {
  mockSessionSupplier.mockSession = undefined;
  const redirectSpy = jest.spyOn(nav, 'redirect');

  let caughtError: Error | undefined;
  try {
    await PreviewNhsAppTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    });
  } catch (error) {
    caughtError = error as Error;
  }

  expect(caughtError).toBeTruthy();
  expect(caughtError!.message).toBe('Simulated redirect');
  expect(redirectSpy).toHaveBeenCalledWith('/invalid-session', 'replace');
});
