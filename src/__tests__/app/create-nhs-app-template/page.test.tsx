import { render } from '@testing-library/react';
import CreateNhsAppTemplatePage from '@app/create-nhs-app-template/[sessionId]/page';
import { TemplateFormState } from '@utils/types';

jest.mock('@utils/form-actions', () => ({
  getSession: () => ({
    id: 'session-id',
    templateType: 'UNKNOWN',
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
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
  const page = await CreateNhsAppTemplatePage({
    params: {
      sessionId: 'session-id',
    },
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});
