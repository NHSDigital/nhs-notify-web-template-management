import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessagePlanConditionalLetterTemplates } from '@molecules/MessagePlanConditionalTemplates/MessagePlanConditionalTemplates';
import type { CascadeItem, TemplateDto } from 'nhs-notify-backend-client';
import { MessagePlanTemplates } from '@utils/routing-utils';

const routingConfigId = 'test-routing-config-id';

function buildLetterCascadeItem(
  conditionalTemplates?: CascadeItem['conditionalTemplates']
): CascadeItem {
  return {
    cascadeGroups: [],
    channel: 'LETTER',
    channelType: 'primary',
    defaultTemplateId: 'standard-letter-id',
    conditionalTemplates,
  };
}

describe('MessagePlanConditionalLetterTemplates', () => {
  it('should return null when channel is not LETTER', () => {
    const cascadeItem: CascadeItem = {
      cascadeGroups: [],
      channel: 'EMAIL',
      channelType: 'primary',
      defaultTemplateId: 'email-id',
    };

    const { container } = render(
      <MessagePlanConditionalLetterTemplates
        cascadeItem={cascadeItem}
        cascadeIndex={0}
        routingConfigId={routingConfigId}
        conditionalTemplates={{}}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('should render fallback conditions for LETTER channel', () => {
    const cascadeItem = buildLetterCascadeItem();

    render(
      <MessagePlanConditionalLetterTemplates
        cascadeItem={cascadeItem}
        cascadeIndex={0}
        routingConfigId={routingConfigId}
        conditionalTemplates={{}}
      />
    );

    expect(
      screen.getByTestId('message-plan-fallback-conditions-LETTER')
    ).toBeInTheDocument();
  });

  it('should render large print letter template section', () => {
    const cascadeItem = buildLetterCascadeItem();

    render(
      <MessagePlanConditionalLetterTemplates
        cascadeItem={cascadeItem}
        cascadeIndex={0}
        routingConfigId={routingConfigId}
        conditionalTemplates={{}}
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Large print letter (optional)',
      })
    ).toBeInTheDocument();
  });

  it('should render language templates section', () => {
    const cascadeItem = buildLetterCascadeItem();

    render(
      <MessagePlanConditionalLetterTemplates
        cascadeItem={cascadeItem}
        cascadeIndex={0}
        routingConfigId={routingConfigId}
        conditionalTemplates={{}}
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Other language letters (optional)',
      })
    ).toBeInTheDocument();
  });

  describe('with no templates selected', () => {
    it('should not display template names', () => {
      const cascadeItem = buildLetterCascadeItem();

      render(
        <MessagePlanConditionalLetterTemplates
          cascadeItem={cascadeItem}
          cascadeIndex={0}
          routingConfigId={routingConfigId}
          conditionalTemplates={{}}
        />
      );

      expect(screen.queryByTestId('template-names')).not.toBeInTheDocument();
    });

    it('should show the "Choose" links with correct href', () => {
      const cascadeItem = buildLetterCascadeItem();

      render(
        <MessagePlanConditionalLetterTemplates
          cascadeItem={cascadeItem}
          cascadeIndex={0}
          routingConfigId={routingConfigId}
          conditionalTemplates={{}}
        />
      );

      const largePrintChooseLink = screen.getByRole('link', {
        name: 'Choose Large print letter template',
      });
      expect(largePrintChooseLink).toHaveAttribute(
        'href',
        `/message-plans/choose-large-print-letter-template/${routingConfigId}`
      );

      const languageChooseLink = screen.getByRole('link', {
        name: 'Choose Other language letters templates',
      });
      expect(languageChooseLink).toHaveAttribute(
        'href',
        `/message-plans/choose-other-language-letter-template/${routingConfigId}`
      );
    });

    it('should not show the "Change" or "Remove" links', () => {
      const cascadeItem = buildLetterCascadeItem();

      render(
        <MessagePlanConditionalLetterTemplates
          cascadeItem={cascadeItem}
          cascadeIndex={0}
          routingConfigId={routingConfigId}
          conditionalTemplates={{}}
        />
      );

      expect(
        screen.queryByRole('link', {
          name: 'Change Large print letter template',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: 'Remove Large print letter template',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', {
          name: 'Change Other language letters templates',
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: 'Remove Other language letters templates',
        })
      ).not.toBeInTheDocument();
    });

    it('should match snapshot', () => {
      const cascadeItem = buildLetterCascadeItem();

      const { container } = render(
        <MessagePlanConditionalLetterTemplates
          cascadeItem={cascadeItem}
          cascadeIndex={0}
          routingConfigId={routingConfigId}
          conditionalTemplates={{}}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('should handle cascade item with empty conditionalTemplates array', () => {
      const cascadeItem = buildLetterCascadeItem([]);

      render(
        <MessagePlanConditionalLetterTemplates
          cascadeItem={cascadeItem}
          cascadeIndex={0}
          routingConfigId={routingConfigId}
          conditionalTemplates={{}}
        />
      );

      const largePrintChooseLink = screen.getByRole('link', {
        name: 'Choose Large print letter template',
      });
      expect(largePrintChooseLink).toBeInTheDocument();

      const languageChooseLink = screen.getByRole('link', {
        name: 'Choose Other language letters templates',
      });
      expect(languageChooseLink).toBeInTheDocument();
    });
  });

  describe('with templates selected', () => {
    describe('accessible format', () => {
      const largePrintTemplate: TemplateDto = {
        id: 'large-print-id',
        name: 'Large print covid reminder',
      } as TemplateDto;

      let cascadeItem: CascadeItem;
      let templates: MessagePlanTemplates;

      beforeEach(() => {
        cascadeItem = buildLetterCascadeItem([
          {
            accessibleFormat: 'x1',
            templateId: 'large-print-id',
          },
        ]);

        templates = {
          'large-print-id': largePrintTemplate,
        };
      });

      it('should display the name of the selected large print letter template', () => {
        render(
          <MessagePlanConditionalLetterTemplates
            cascadeItem={cascadeItem}
            cascadeIndex={0}
            routingConfigId={routingConfigId}
            conditionalTemplates={templates}
          />
        );

        const templateName = screen.getByTestId('template-name-x1');
        expect(templateName).toHaveTextContent('Large print covid reminder');
      });

      it('should display the "Change" and "Remove" links', () => {
        render(
          <MessagePlanConditionalLetterTemplates
            cascadeItem={cascadeItem}
            cascadeIndex={0}
            routingConfigId={routingConfigId}
            conditionalTemplates={templates}
          />
        );

        const changeLink = screen.getByRole('link', {
          name: 'Change Large print letter template',
        });
        expect(changeLink).toBeInTheDocument();
        expect(changeLink).toHaveAttribute(
          'href',
          `/message-plans/choose-large-print-letter-template/${routingConfigId}`
        );

        expect(
          screen.getByRole('button', {
            name: 'Remove Large print letter template',
          })
        ).toBeInTheDocument();
      });
    });

    describe('translated languages', () => {
      const polishTemplate: TemplateDto = {
        id: 'polish-id',
        name: 'Polish covid reminder',
      } as TemplateDto;

      const frenchTemplate: TemplateDto = {
        id: 'french-id',
        name: 'French covid reminder',
      } as TemplateDto;

      let cascadeItem: CascadeItem;
      let templates: MessagePlanTemplates;

      beforeEach(() => {
        cascadeItem = buildLetterCascadeItem([
          {
            language: 'pl',
            templateId: 'polish-id',
          },
          {
            language: 'fr',
            templateId: 'french-id',
          },
        ]);

        templates = {
          'polish-id': polishTemplate,
          'french-id': frenchTemplate,
        };
      });

      it('should display multiple template names when multiple languages are selected', () => {
        render(
          <MessagePlanConditionalLetterTemplates
            cascadeItem={cascadeItem}
            cascadeIndex={0}
            routingConfigId={routingConfigId}
            conditionalTemplates={templates}
          />
        );

        const templateNames = screen.getAllByTestId(
          'template-name-foreign-language'
        );
        expect(templateNames).toHaveLength(2);
        expect(templateNames[0]).toHaveTextContent('Polish covid reminder');
        expect(templateNames[1]).toHaveTextContent('French covid reminder');
      });

      it('should show the "Change" and "Remove all" links', () => {
        render(
          <MessagePlanConditionalLetterTemplates
            cascadeItem={cascadeItem}
            cascadeIndex={0}
            routingConfigId={routingConfigId}
            conditionalTemplates={templates}
          />
        );

        const changeLink = screen.getByRole('link', {
          name: 'Change Other language letters templates',
        });
        expect(changeLink).toBeInTheDocument();
        expect(changeLink).toHaveAttribute(
          'href',
          `/message-plans/choose-other-language-letter-template/${routingConfigId}`
        );

        expect(
          screen.getByRole('button', {
            name: 'Remove all Other language letters templates',
          })
        ).toBeInTheDocument();
      });
    });

    it('should match snapshot with all conditional template types selected', () => {
      const cascadeItem = buildLetterCascadeItem([
        {
          accessibleFormat: 'x1',
          templateId: 'large-print-id',
        },
        {
          language: 'pl',
          templateId: 'polish-id',
        },
        {
          language: 'fr',
          templateId: 'french-id',
        },
      ]);

      const templates: MessagePlanTemplates = {
        'large-print-id': {
          id: 'large-print-id',
          name: 'Large print template',
        } as TemplateDto,
        'polish-id': {
          id: 'polish-id',
          name: 'Polish template',
        } as TemplateDto,
        'french-id': {
          id: 'french-id',
          name: 'French template',
        } as TemplateDto,
      };

      const { container } = render(
        <MessagePlanConditionalLetterTemplates
          cascadeItem={cascadeItem}
          cascadeIndex={0}
          routingConfigId={routingConfigId}
          conditionalTemplates={templates}
        />
      );

      expect(container).toMatchSnapshot();
    });
  });
});
