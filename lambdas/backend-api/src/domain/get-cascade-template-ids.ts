import type { CascadeItem } from 'nhs-notify-backend-client';

export function getCascadeTemplateIds(cascade: CascadeItem[]): string[] {
  const templateIds: string[] = [];

  for (const item of cascade) {
    // Add default template id if it exists and is not null
    if (item.defaultTemplateId) {
      templateIds.push(item.defaultTemplateId);
    }

    // Add conditional template ids if they exist
    if (item.conditionalTemplates) {
      for (const conditionalTemplate of item.conditionalTemplates) {
        if (conditionalTemplate.templateId) {
          templateIds.push(conditionalTemplate.templateId);
        }
      }
    }
  }

  // Remove duplicates and return
  return [...new Set(templateIds)];
}
