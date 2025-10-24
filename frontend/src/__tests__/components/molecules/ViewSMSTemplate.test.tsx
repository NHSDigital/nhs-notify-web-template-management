import { render } from '@testing-library/react';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';
import { SMSTemplate } from 'nhs-notify-web-template-management-utils';

describe('ViewNHSAppTemplate component', () => {
  it('matches submitted snapshot', () => {
    const container = render(
      <ViewSMSTemplate
        initialState={
          {
            id: 'template-id',
            name: 'Example template',
            templateStatus: 'SUBMITTED',
            message: 'Example message',
            templateType: 'SMS',
            createdAt: '2025-03-28T12:30:54.684Z',
            updatedAt: '2025-03-28T12:31:54.684Z',
            lockNumber: 1,
          } satisfies SMSTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
