import { render } from '@testing-library/react';
import ChooseMessageOrderPage, {
  generateMetadata,
} from '@app/message-plans/choose-message-order/page';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useFeatureFlags } from '@providers/client-config-provider';
import { initialFeatureFlags } from '@utils/client-config';

const { pageTitle } = content.components.chooseMessageOrder;

jest.mock('@providers/client-config-provider');

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

const mockUseFeatureFlags = jest.mocked(useFeatureFlags);

test('ChooseMessageOrderPage', async () => {
  mockUseFeatureFlags.mockReturnValue({
    ...initialFeatureFlags,
    letterAuthoring: true,
  });

  const page = await ChooseMessageOrderPage();

  const container = render(page);

  expect(await generateMetadata()).toEqual({ title: pageTitle });
  expect(container.asFragment()).toMatchSnapshot();
});
