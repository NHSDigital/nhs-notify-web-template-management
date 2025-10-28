import { render } from '@testing-library/react';
import ChooseMessageOrderPage, {
  generateMetadata,
} from '@app/message-plans/choose-message-order/page';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const { pageTitle } = content.components.chooseMessageOrder;

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

test('ChooseMessageOrderPage', async () => {
  const page = await ChooseMessageOrderPage();

  const container = render(page);

  expect(await generateMetadata()).toEqual({ title: pageTitle });
  expect(container.asFragment()).toMatchSnapshot();
});
