import { render } from '@testing-library/react';
import ChooseATemplateTypePage from '@app/choose-a-template-type/page';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('Simulated redirect');
  },

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
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({
      value: 'csrf-token',
    }),
  }),
}));

test('ChooseATemplateTypePage', async () => {
  const page = await ChooseATemplateTypePage();

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
