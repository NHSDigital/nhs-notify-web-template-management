import { render } from '@testing-library/react';
import { ViewNHSAppTemplate } from '@molecules/ViewNHSAppTemplate/ViewNHSAppTemplate';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';

describe('ViewNHSAppTemplate component', () => {
  it('matches submitted snapshot', () => {
    const container = render(
      <ViewNHSAppTemplate
        initialState={
          {
            id: 'template-id',
            name: 'Example template',
            templateStatus: 'SUBMITTED',
            message: 'Example message',
          } as NHSAppTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
