import { render, screen } from '@testing-library/react';
import { MessagePlanChannelTemplate } from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate';
import type { TemplateDto } from 'nhs-notify-backend-client';

describe('MessagePlanChannelTemplate', () => {
  it('should display the channel heading', () => {
    render(<MessagePlanChannelTemplate channel='EMAIL' />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Email' })
    ).toBeInTheDocument();
  });

  describe('when the channel is not required', () => {
    beforeEach(() => {
      render(<MessagePlanChannelTemplate channel='LETTER' required={false} />);
    });

    it('should display the heading with the "(optional)" suffix', () => {
      expect(
        screen.getByRole('heading', { level: 3, name: 'Letter (optional)' })
      ).toBeInTheDocument();
    });
  });

  describe('when no template is selected', () => {
    beforeEach(() => {
      render(<MessagePlanChannelTemplate channel='NHSAPP' />);
    });

    it('should show the "Choose template" link with accessible name and href', () => {
      const link = screen.getByRole('link', {
        name: 'Choose NHS App template',
      });
      expect(link).toHaveAttribute(
        'href',
        '/message-plans/choose-nhs-app-template'
      );
    });

    it('should not display the "Change template" or "Remove template" links', () => {
      expect(
        screen.queryByRole('link', { name: 'Change NHS App template' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Remove NHS App template' })
      ).not.toBeInTheDocument();
    });
  });

  describe('when a template has been selected', () => {
    const testTemplate = {
      id: 'test-id',
      name: 'Covid 65+ invitation v1',
    } as TemplateDto;

    beforeEach(() => {
      render(
        <MessagePlanChannelTemplate channel='SMS' template={testTemplate} />
      );
    });

    it('should display the selected template name', () => {
      expect(screen.getByText(testTemplate.name)).toBeInTheDocument();
    });

    it('should display the "Change template" link with accessible name and href', () => {
      const link = screen.getByRole('link', {
        name: 'Change Text message (SMS) template',
      });
      expect(link).toHaveAttribute(
        'href',
        '/message-plans/choose-text-message-template'
      );
    });

    it('should display the "Remove template" link with accessible name and href', () => {
      const link = screen.getByRole('link', {
        name: 'Remove Text message (SMS) template',
      });

      expect(link).toHaveAttribute('href', 'todo'); // TODO: CHANGE
    });

    it('should not display the "Choose template" link', () => {
      expect(
        screen.queryByRole('link', {
          name: 'Choose Text message (SMS) template',
        })
      ).not.toBeInTheDocument();
    });
  });

  it.each(['NHSAPP', 'EMAIL', 'SMS', 'LETTER'] as const)(
    'should match snapshot for empty state (%s)',
    (channel) => {
      const { container } = render(
        <MessagePlanChannelTemplate channel={channel} />
      );

      expect(container).toMatchSnapshot();
    }
  );

  it.each(['NHSAPP', 'EMAIL', 'SMS', 'LETTER'] as const)(
    'should match snapshot for selected template state (%s)',
    (channel) => {
      const testTemplate = {
        id: 'test-id',
        name: 'Covid 65+ reminder v1',
      } as TemplateDto;

      const { container } = render(
        <MessagePlanChannelTemplate channel={channel} template={testTemplate} />
      );
      expect(container).toMatchSnapshot();
    }
  );
});
