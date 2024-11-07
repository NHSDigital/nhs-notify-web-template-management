import { render } from '@testing-library/react';
import ChooseATemplateTypePage from '@app/choose-a-template-type/[templateId]/page';
import { TemplateFormState } from '@utils/types';
import nav from 'next/navigation';

const mockTemplateSupplier = {
  mockTemplate: {} as unknown,
};

jest.mock('@utils/form-actions', () => ({
  getTemplate: () => Promise.resolve(mockTemplateSupplier.mockTemplate),
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
  mockTemplateSupplier.mockTemplate = {
    id: 'template-id',
    templateType: 'UNKNOWN',
  };

  const page = await ChooseATemplateTypePage({
    params: {
      templateId: 'template-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('ChooseATemplateTypePage - should handle invalid template', async () => {
  mockTemplateSupplier.mockTemplate = undefined;
  const redirectSpy = jest.spyOn(nav, 'redirect');

  await expect(
    ChooseATemplateTypePage({
      params: {
        templateId: 'template-id',
      },
    })
  ).rejects.toThrow('Simulated redirect');

  expect(redirectSpy).toHaveBeenCalledWith('/invalid-template', 'replace');
});
