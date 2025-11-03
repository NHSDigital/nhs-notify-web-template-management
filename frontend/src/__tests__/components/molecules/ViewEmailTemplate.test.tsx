import { render } from '@testing-library/react';
import { ViewEmailTemplate } from '@molecules/ViewEmailTemplate/ViewEmailTemplate';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';

describe('ViewEmailTemplate component', () => {
  it('matches submitted snapshot', () => {
    const container = render(
      <ViewEmailTemplate
        initialState={
          {
            id: 'template-id',
            templateType: 'EMAIL',
            name: 'Example template',
            templateStatus: 'SUBMITTED',
            subject: 'Example subject',
            message: 'Example message',
            createdAt: '2025-03-28T12:30:54.684Z',
            updatedAt: '2025-03-28T12:31:54.684Z',
            lockNumber: 1,
          } satisfies EmailTemplate
        }
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
