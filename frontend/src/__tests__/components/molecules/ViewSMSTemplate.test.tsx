import { render } from '@testing-library/react';
import { ViewSMSTemplate } from '@molecules/ViewSMSTemplate/ViewSMSTemplate';
import {
  SubmittedSMSTemplate,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';

describe('ViewNHSAppTemplate component', () => {
  it('matches submitted snapshot', () => {
    const container = render(
      <ViewSMSTemplate
        initialState={
          {
            id: 'template-id',
            name: 'Example template',
            templateStatus: TemplateStatus.SUBMITTED,
            message: 'Example message',
          } as SubmittedSMSTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
