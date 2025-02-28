import { SubmitTemplate } from '@forms/SubmitTemplate/SubmitTemplate';
import { render } from '@testing-library/react';

jest.mock('@utils/amplify-utils');

jest.mock('@forms/SubmitTemplate/server-action', () => ({
  submitTemplate: {
    bind: () => {},
  },
}));

describe('SubmitTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitTemplate
        templateId='template-id'
        templateName='template-name'
        goBackPath='example'
        submitPath='example-submit'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
