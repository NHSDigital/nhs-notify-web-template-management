import type { CascadeItem } from 'nhs-notify-backend-client';

export function getCascadeTemplateIds(cascade: CascadeItem[]): string[] {
  const templateIds: string[] = [];

  for (const item of cascade) {
    if (item.defaultTemplateId) {
      templateIds.push(item.defaultTemplateId);
    }

    if (item.conditionalTemplates) {
      for (const conditionalTemplate of item.conditionalTemplates) {
        if (conditionalTemplate.templateId) {
          templateIds.push(conditionalTemplate.templateId);
        }
      }
    }
  }

  return [...new Set(templateIds)];
}
