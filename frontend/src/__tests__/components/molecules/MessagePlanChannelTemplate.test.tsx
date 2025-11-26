import { render, screen } from '@testing-library/react';
import {
  MessagePlanChannelTemplate,
  MessagePlanAccessibleFormatTemplate,
  MessagePlanLanguageTemplate,
} from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate';
import type { TemplateDto } from 'nhs-notify-backend-client';

describe('MessagePlanChannelTemplate', () => {
  const routingConfigId = 'test-routing-config-id';

  it('should display the channel heading', () => {
    render(
      <MessagePlanChannelTemplate
        channel='EMAIL'
        routingConfigId={routingConfigId}
      />
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Email' })
    ).toBeInTheDocument();
  });

  describe('when the channel is not required', () => {
    beforeEach(() => {
      render(
        <MessagePlanChannelTemplate
          channel='LETTER'
          required={false}
          routingConfigId={routingConfigId}
        />
      );
    });

    it('should display the heading with the "(optional)" suffix', () => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Standard English letter (optional)',
        })
      ).toBeInTheDocument();
    });
  });

  describe('when no template is selected', () => {
    beforeEach(() => {
      render(
        <MessagePlanChannelTemplate
          channel='NHSAPP'
          routingConfigId={routingConfigId}
        />
      );
    });

    it('should show the "Choose template" link with accessible name and href', () => {
      const link = screen.getByRole('link', {
        name: 'Choose NHS App template',
      });
      expect(link).toHaveAttribute(
        'href',
        `/message-plans/choose-nhs-app-template/${routingConfigId}`
      );
    });

    it('should not display the "Change template" or "Remove template" links', () => {
      expect(
        screen.queryByRole('link', { name: 'Change NHS App template' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Remove NHS App template' })
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
        <MessagePlanChannelTemplate
          channel='SMS'
          template={testTemplate}
          routingConfigId={routingConfigId}
        />
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
        `/message-plans/choose-text-message-template/${routingConfigId}`
      );
    });

    it('should display the "Remove template" button inside a form with hidden inputs', () => {
      const removeButton = screen.getByRole('button', {
        name: 'Remove Text message (SMS) template',
      });
      const form = removeButton.closest('form');

      expect(removeButton).toBeInTheDocument();
      expect(form).toBeInTheDocument();

      const routingConfigIdInput = form?.querySelector(
        'input[name="routingConfigId"]'
      );
      const templateIdInput = form?.querySelector('input[name="templateId"]');

      expect(routingConfigIdInput).toHaveAttribute('type', 'hidden');
      expect(routingConfigIdInput).toHaveAttribute('value', routingConfigId);
      expect(templateIdInput).toHaveAttribute('type', 'hidden');
      expect(templateIdInput).toHaveAttribute('value', testTemplate.id);
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
        <MessagePlanChannelTemplate
          channel={channel}
          routingConfigId={routingConfigId}
        />
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
        <MessagePlanChannelTemplate
          channel={channel}
          template={testTemplate}
          routingConfigId={routingConfigId}
        />
      );
      expect(container).toMatchSnapshot();
    }
  );
});

describe('MessagePlanAccessibleFormatTemplate', () => {
  const routingConfigId = 'test-routing-config-id';

  it('should display the accessible format heading', () => {
    render(
      <MessagePlanAccessibleFormatTemplate
        accessibleFormat='x1'
        routingConfigId={routingConfigId}
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Large print letter (optional)',
      })
    ).toBeInTheDocument();
  });

  describe('when no template is selected', () => {
    beforeEach(() => {
      render(
        <MessagePlanAccessibleFormatTemplate
          accessibleFormat='x1'
          routingConfigId={routingConfigId}
        />
      );
    });

    it('should not display template name', () => {
      expect(screen.queryByTestId('template-names')).not.toBeInTheDocument();
    });

    it('should show the "Choose template" link (singular) with accessible name and href', () => {
      const link = screen.getByRole('link', {
        name: 'Choose Large print letter template',
      });
      expect(link).toHaveAttribute(
        'href',
        `/message-plans/choose-large-print-letter-template/${routingConfigId}`
      );
    });
  });

  describe('when a template has been selected', () => {
    const testTemplate = {
      id: 'test-large-print-id',
      name: 'Large print letter template',
    } as TemplateDto;

    beforeEach(() => {
      render(
        <MessagePlanAccessibleFormatTemplate
          accessibleFormat='x1'
          template={testTemplate}
          routingConfigId={routingConfigId}
        />
      );
    });

    it('should display the selected template name', () => {
      expect(screen.getByText(testTemplate.name)).toBeInTheDocument();
    });

    it('should display the "Change template" link', () => {
      const link = screen.getByRole('link', {
        name: 'Change Large print letter template',
      });
      expect(link).toHaveAttribute(
        'href',
        `/message-plans/choose-large-print-letter-template/${routingConfigId}`
      );
    });

    it('should display the "Remove template" button', () => {
      const removeButton = screen.getByRole('button', {
        name: 'Remove Large print letter template',
      });
      expect(removeButton).toBeInTheDocument();
    });

    it.each(['x1'] as const)(
      'should match snapshot for empty state for letter type (%s)',
      (accessibleFormat) => {
        const { container } = render(
          <MessagePlanAccessibleFormatTemplate
            accessibleFormat={accessibleFormat}
            routingConfigId={routingConfigId}
          />
        );

        expect(container).toMatchSnapshot();
      }
    );

    it.each(['x1'] as const)(
      'should match snapshot for template selected state for letter type (%s)',
      (accessibleFormat) => {
        const { container } = render(
          <MessagePlanAccessibleFormatTemplate
            accessibleFormat={accessibleFormat}
            routingConfigId={routingConfigId}
            template={testTemplate}
          />
        );

        expect(container).toMatchSnapshot();
      }
    );
  });
});

describe('MessagePlanLanguageTemplate', () => {
  const routingConfigId = 'test-routing-config-id';

  it('should display the language templates heading', () => {
    render(
      <MessagePlanLanguageTemplate
        selectedTemplates={[]}
        routingConfigId={routingConfigId}
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Other language letters (optional)',
      })
    ).toBeInTheDocument();
  });

  describe('when no templates are selected', () => {
    beforeEach(() => {
      render(
        <MessagePlanLanguageTemplate
          selectedTemplates={[]}
          routingConfigId={routingConfigId}
        />
      );
    });

    it('should show the "Choose templates" link (plural) with accessible name and href', () => {
      const link = screen.getByRole('link', {
        name: 'Choose Other language letters templates',
      });
      expect(link).toHaveAttribute(
        'href',
        `/message-plans/choose-other-language-letter-template/${routingConfigId}`
      );
    });
  });

  describe('when multiple templates are selected', () => {
    const testTemplates = [
      {
        id: 'welsh-template-id',
        name: 'Welsh letter template',
      } as TemplateDto,
      {
        id: 'polish-template-id',
        name: 'Polish letter template',
      } as TemplateDto,
    ];

    beforeEach(() => {
      render(
        <MessagePlanLanguageTemplate
          selectedTemplates={testTemplates}
          routingConfigId={routingConfigId}
        />
      );
    });

    it('should display all selected template names', () => {
      expect(screen.getByText('Welsh letter template')).toBeInTheDocument();
      expect(screen.getByText('Polish letter template')).toBeInTheDocument();
    });

    it('should display the "Change templates" link (plural)', () => {
      const link = screen.getByRole('link', {
        name: 'Change Other language letters templates',
      });
      expect(link).toHaveAttribute(
        'href',
        `/message-plans/choose-other-language-letter-template/${routingConfigId}`
      );
    });

    it('should display the "Remove all templates" button with all template IDs', () => {
      const removeButton = screen.getByRole('button', {
        name: 'Remove all Other language letters templates',
      });
      expect(removeButton).toBeInTheDocument();

      const form = removeButton.closest('form');
      const templateIdInputs = form?.querySelectorAll(
        'input[name="templateId"]'
      );

      expect(templateIdInputs).toHaveLength(2);
      expect(templateIdInputs?.[0]).toHaveAttribute(
        'value',
        'welsh-template-id'
      );
      expect(templateIdInputs?.[1]).toHaveAttribute(
        'value',
        'polish-template-id'
      );
    });

    it('should match snapshot for empty state', () => {
      const { container } = render(
        <MessagePlanLanguageTemplate
          selectedTemplates={[]}
          routingConfigId={routingConfigId}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with multiple templates selected', () => {
      const { container } = render(
        <MessagePlanLanguageTemplate
          selectedTemplates={testTemplates}
          routingConfigId={routingConfigId}
        />
      );

      expect(container).toMatchSnapshot();
    });
  });
});
