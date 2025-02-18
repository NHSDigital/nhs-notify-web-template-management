import { render } from '@testing-library/react';
import { DeleteTemplate } from '@forms/DeleteTemplate/DeleteTemplate';
import { mockDeep } from 'jest-mock-extended';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest.fn((action, initialState) => {
      return [initialState, action];
    }),
  };
});

jest.mock('@forms/DeleteTemplate/server-action', () => ({
  deleteTemplateYesAction: '/yes-action',
  deleteTemplateNoAction: '/no-action',
}));

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
