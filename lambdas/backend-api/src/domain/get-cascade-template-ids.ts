import type { CascadeItem } from 'nhs-notify-backend-client';

export function getCascadeTemplateIds(cascade: CascadeItem[]): string[] {
  return cascade
    .flatMap((cascadeItem) => {
      if (cascadeItem.conditionalTemplates) {
        return cascadeItem.conditionalTemplates.map(
          (template) => template.templateId
        );
      }

      return cascadeItem.defaultTemplateId;
    })
    .filter(
      (templateId, i, list): templateId is string =>
        typeof templateId === 'string' && list.indexOf(templateId) === i
    );
}
