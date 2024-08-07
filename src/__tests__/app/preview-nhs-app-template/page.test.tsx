import { render } from '@testing-library/react';
import PreviewNhsAppTemplatePage from '@/src/app/preview-nhs-app-template/[sessionId]/page';
import { TemplateFormState, TemplateType } from '@utils/types';

jest.mock('@utils/form-actions', () => ({
  getSession: () => ({
    id: 'session-id',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: 'template-name',
    nhsAppTemplateMessage: 'template-message',
  }),
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

test('ChooseTemplatePage', async () => {
  const page = await PreviewNhsAppTemplatePage({
    params: {
      sessionId: 'session-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
