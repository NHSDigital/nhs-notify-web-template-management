import {
  CascadeItem,
  ConditionalTemplateAccessible,
  ConditionalTemplateLanguage,
  LetterType,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';
import {
  MessagePlanAccessibleFormatTemplate,
  MessagePlanLanguageTemplate,
} from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate';
import {
  ConditionalTemplate,
  MessagePlanTemplates,
} from '@utils/routing-utils';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';

import styles from './MessagePlanConditionalTemplates.module.scss';

const ACCESSIBLE_FORMATS: LetterType[] = ['x1']; // Large print only

export function MessagePlanConditionalLetterTemplates({
  cascadeItem,
  cascadeIndex,
  routingConfigId,
  lockNumber,
  conditionalTemplates: templates,
}: {
  cascadeItem: CascadeItem;
  cascadeIndex: number;
  routingConfigId: RoutingConfig['id'];
  lockNumber: number;
  conditionalTemplates: MessagePlanTemplates;
}) {
  if (cascadeItem.channel !== 'LETTER') {
    return null;
  }

  const accessibleFormats = ACCESSIBLE_FORMATS;

  const languageTemplates: TemplateDto[] = (
    cascadeItem.conditionalTemplates || []
  )
    .filter(
      (
        template: ConditionalTemplate
      ): template is ConditionalTemplateLanguage =>
        'language' in template && !!template.templateId
    )
    .map(
      (template: ConditionalTemplateLanguage) => templates[template.templateId!]
    )
    .filter(Boolean);

  return (
    <ul
      className={styles['message-plan-conditional-templates']}
      data-testid='message-plan-conditional-templates'
    >
      <MessagePlanFallbackConditions
        channel={cascadeItem.channel}
        index={cascadeIndex}
      />

      {accessibleFormats.map((format) => (
        <li
          key={format}
          className={styles['message-plan-conditional-templates__list-item']}
        >
          <MessagePlanAccessibleFormatTemplate
            accessibleFormat={format}
            template={getTemplateForAccessibleFormat(
              format,
              cascadeItem,
              templates
            )}
            lockNumber={lockNumber}
            routingConfigId={routingConfigId}
          />
        </li>
      ))}

      <li className={styles['message-plan-conditional-templates__list-item']}>
        <MessagePlanLanguageTemplate
          selectedTemplates={languageTemplates}
          lockNumber={lockNumber}
          routingConfigId={routingConfigId}
        />
      </li>
    </ul>
  );
}

const getTemplateForAccessibleFormat = (
  format: LetterType,
  cascadeItem: CascadeItem,
  templates: MessagePlanTemplates
): TemplateDto | undefined => {
  const conditionalTemplate = (cascadeItem.conditionalTemplates || []).find(
    (
      template: ConditionalTemplate
    ): template is ConditionalTemplateAccessible =>
      'accessibleFormat' in template && template.accessibleFormat === format
  );
  return conditionalTemplate?.templateId
    ? templates[conditionalTemplate.templateId]
    : undefined;
};
