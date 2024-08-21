import { render } from '@testing-library/react';
import ChooseATemplateTypePage from '@app/choose-a-template-type/[sessionId]/page';
import { TemplateFormState } from '@utils/types';
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

test('ChooseATemplateTypePage', async () => {
  mockSessionSupplier.mockSession = {
    id: 'session-id',
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
  };

  const page = await ChooseATemplateTypePage({
    params: {
      sessionId: 'session-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('ChooseATemplateTypePage - should handle invalid session', async () => {
  mockSessionSupplier.mockSession = undefined;
  const redirectSpy = jest.spyOn(nav, 'redirect');

  await expect(
    ChooseATemplateTypePage({
      params: {
        sessionId: 'session-id',
      },
    })
  ).rejects.toThrow('Simulated redirect');

  expect(redirectSpy).toHaveBeenCalledWith('/invalid-session', 'replace');
});
