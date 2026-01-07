import { PropsWithChildren } from 'react';
import {
  CascadeItem,
  Channel,
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
  ACCESSIBLE_FORMATS,
  ConditionalTemplate,
  getTemplateForAccessibleFormat,
  MessagePlanTemplates,
} from '@utils/routing-utils';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';

import styles from './MessagePlanConditionalTemplates.module.scss';

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

      {ACCESSIBLE_FORMATS.map((format) => (
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

export function MessagePlanCascadeConditionalTemplatesList({
  children,
}: PropsWithChildren) {
  return (
    <ul
      className={styles['message-plan-conditional-templates']}
      data-testid='message-plan-conditional-templates'
    >
      {children}
    </ul>
  );
}

export function MessagePlanCascadeConditionalTemplatesListItem({
  children,
}: PropsWithChildren) {
  return (
    <li className={styles['message-plan-conditional-templates__list-item']}>
      {children}
    </li>
  );
}
