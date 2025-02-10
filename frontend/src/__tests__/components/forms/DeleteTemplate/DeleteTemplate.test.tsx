import { render } from '@testing-library/react';
import { DeleteTemplate } from '@forms/DeleteTemplate/DeleteTemplate';
import { mockDeep } from 'jest-mock-extended';
import {
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';

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

test('renders component correctly', () => {
  const container = render(
    <DeleteTemplate
      template={mockDeep<EmailTemplate>({
        id: 'template-id',
        name: 'template-name',
      })}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});
