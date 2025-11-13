import { ChannelTemplates } from '@molecules/ChannelTemplates/ChannelTemplates';
import { render } from '@testing-library/react';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation');

jest
  .mocked(usePathname)
  .mockReturnValue('message-plans/choose-email-template/testid');

describe('ChannelTemplates', () => {
  it('renders templates', () => {
    const container = render(
      <ChannelTemplates
        templateList={[
          NHS_APP_TEMPLATE,
          EMAIL_TEMPLATE,
          SMS_TEMPLATE,
          LETTER_TEMPLATE,
        ]}
        errorState={null}
        selectedTemplate={null}
        routingConfigId='abc'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders templates with pre-selected template', () => {
    const container = render(
      <ChannelTemplates
        templateList={[
          NHS_APP_TEMPLATE,
          EMAIL_TEMPLATE,
          SMS_TEMPLATE,
          LETTER_TEMPLATE,
        ]}
        errorState={null}
        selectedTemplate={EMAIL_TEMPLATE.id}
        routingConfigId='abc'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(container.getByTestId(`${EMAIL_TEMPLATE.id}-radio`)).toHaveAttribute(
      'checked'
    );
  });

  it('renders templates with error state', () => {
    const container = render(
      <ChannelTemplates
        templateList={[
          NHS_APP_TEMPLATE,
          EMAIL_TEMPLATE,
          SMS_TEMPLATE,
          LETTER_TEMPLATE,
        ]}
        errorState={{
          fieldErrors: {
            channelTemplate: ['You must select a template'],
          },
        }}
        selectedTemplate={null}
        routingConfigId='abc'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(
      container.getByText('You must select a template')
    ).toBeInTheDocument();
  });
});
