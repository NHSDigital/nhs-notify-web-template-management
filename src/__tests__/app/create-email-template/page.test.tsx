import { render } from '@testing-library/react';
import CreateEmailTemplatePage from '@app/create-email-template/[sessionId]/page';
import { TemplateFormState } from '@utils/types';
import nav from 'next/navigation';

const mockSessionSupplier = {
  mockSession: {} as unknown,
};

jest.mock('@utils/form-actions', () => ({
  getSession: () => Promise.resolve(mockSessionSupplier.mockSession),
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

test('CreateEmailTemplatePage', async () => {
  mockSessionSupplier.mockSession = {
    id: 'session-id',
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  };

  const page = await CreateEmailTemplatePage({
    params: {
      sessionId: 'session-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('CreateEmailTemplatePage - should handle invalid session', async () => {
  mockSessionSupplier.mockSession = undefined;
  const redirectSpy = jest.spyOn(nav, 'redirect');

  await expect(
    CreateEmailTemplatePage({
      params: {
        sessionId: 'session-id',
      },
    })
  ).rejects.toThrow('Simulated redirect');

  expect(redirectSpy).toHaveBeenCalledWith('/invalid-session', 'replace');
});
