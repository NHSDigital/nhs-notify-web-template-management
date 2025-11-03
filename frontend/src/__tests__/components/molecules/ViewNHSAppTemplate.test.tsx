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
            templateType: 'NHS_APP',
            createdAt: '2025-03-28T12:30:54.684Z',
            updatedAt: '2025-03-28T12:31:54.684Z',
            lockNumber: 1,
          } satisfies NHSAppTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
