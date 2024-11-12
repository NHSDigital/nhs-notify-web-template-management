import { render } from '@testing-library/react';
import ChooseATemplateTypePage from '@app/choose-a-template-type/page';
import { TemplateFormState } from '@utils/types';

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
  const page = await ChooseATemplateTypePage();

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
