import { render } from '@testing-library/react';
import ChooseATemplateTypePage from '@app/choose-a-template-type/page';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import { useActionState } from 'react';

jest.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('Simulated redirect');
  },

  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: (
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
