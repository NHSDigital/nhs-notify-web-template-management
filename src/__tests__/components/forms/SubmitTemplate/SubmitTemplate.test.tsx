import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { render } from '@testing-library/react';

describe('SubmitTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitTemplate sessionId='session-id' templateName='template-name' />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
