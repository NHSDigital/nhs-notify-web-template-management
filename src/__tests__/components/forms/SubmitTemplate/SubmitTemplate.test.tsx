import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { render } from '@testing-library/react';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

describe('SubmitTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitTemplate sessionId='session-id' templateName='template-name' />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
