import { render } from '@testing-library/react';
import { ViewEmailTemplate } from '@molecules/ViewEmailTemplate/ViewEmailTemplate';
import {
  EmailTemplate,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';

describe('ViewEmailTemplate component', () => {
  it('matches submitted snapshot', () => {
    const container = render(
      <ViewEmailTemplate
        initialState={
          {
            id: 'template-id',
            name: 'Example template',
            templateStatus: TemplateStatus.SUBMITTED,
            subject: 'Example subject',
            message: 'Example message',
          } as EmailTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
