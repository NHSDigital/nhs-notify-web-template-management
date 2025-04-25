import { SubmitDigitalTemplate } from '@forms/SubmitTemplate/SubmitDigitalTemplate';
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

describe('SubmitDigitalTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitDigitalTemplate
        templateId='template-id'
        templateName='template-name'
        goBackPath='example'
        submitPath='example-submit'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
