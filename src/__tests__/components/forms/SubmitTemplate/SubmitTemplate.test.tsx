import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { render } from '@testing-library/react';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

jest.mock('@forms/SubmitTemplate/server-action', () => ({
  submitTemplate: {
    bind: () => {},
  },
}));

describe('SubmitTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitTemplate
        sessionId='session-id'
        templateName='template-name'
        goBackPath='example'
        submitPath='example-submit'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
