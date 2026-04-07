import { render, screen } from '@testing-library/react';
import ChooseATemplateTypePage, {
  generateMetadata,
} from '@app/choose-a-template-type/page';
import { TemplateFormState } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useFeatureFlags } from '@providers/client-config-provider';

const { pageTitle } = content.components.chooseTemplateType;

jest.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('Simulated redirect');
  },

  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('@providers/client-config-provider', () => ({
  useFeatureFlags: jest.fn(),
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

test('ChooseATemplateTypePage with letter authoring disabled', async () => {
  jest.mocked(useFeatureFlags).mockReturnValue({
    letterAuthoring: false,
  });

  const page = await ChooseATemplateTypePage();

  const container = render(page);

  expect(screen.queryByTestId('letter-radio')).not.toBeInTheDocument();

  expect(await generateMetadata()).toEqual({ title: pageTitle });
  expect(container.asFragment()).toMatchSnapshot();
});

test('ChooseATemplateTypePage with letter authoring enabled', async () => {
  jest.mocked(useFeatureFlags).mockReturnValue({
    letterAuthoring: true,
  });

  const page = await ChooseATemplateTypePage();

  const container = render(page);

  expect(screen.getByTestId('letter-radio')).toBeInTheDocument();

  expect(container.asFragment()).toMatchSnapshot();
});
