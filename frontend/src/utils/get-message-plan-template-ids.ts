import { RoutingConfig } from 'nhs-notify-backend-client';

/**
 * Extracts all template IDs from a RoutingConfig
 */
export function getMessagePlanTemplateIds(
  messagePlan: RoutingConfig
): Set<string> {
  const templateIds = new Set<string>();

  for (const cascadeItem of messagePlan.cascade) {
    if (cascadeItem.defaultTemplateId)
      templateIds.add(cascadeItem.defaultTemplateId);
    if (cascadeItem.conditionalTemplates) {
      for (const conditionalTemplate of cascadeItem.conditionalTemplates) {
        if (conditionalTemplate.templateId)
          templateIds.add(conditionalTemplate.templateId);
      }
    }
  }

  return templateIds;
}
