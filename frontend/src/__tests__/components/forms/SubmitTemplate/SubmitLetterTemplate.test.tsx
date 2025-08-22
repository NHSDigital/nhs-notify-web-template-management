import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';
import { render } from '@testing-library/react';

jest.mock('@utils/amplify-utils');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest.fn((action, initialState) => {
      return [initialState, action];
    }),
  };
});

jest.mock('@forms/SubmitTemplate/server-action', () => ({
  submitTemplate: '/action',
}));

describe('SubmitLetterTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        proofingEnabled={true}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render with client proofing disabled', () => {
    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        proofingEnabled={false}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
