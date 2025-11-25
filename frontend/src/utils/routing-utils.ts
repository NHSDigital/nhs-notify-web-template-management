import {
  CascadeGroup,
  CascadeGroupName,
  CascadeItem,
  ConditionalTemplateAccessible,
  ConditionalTemplateLanguage,
  Language,
  LetterType,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-backend-client';

export type ConditionalTemplate =
  | ConditionalTemplateAccessible
  | ConditionalTemplateLanguage;

export type MessagePlanTemplates = Record<string, TemplateDto>;

/**
 * Gets the conditional templates for a cascade item, from the provided templates object
 */
export function getConditionalTemplatesForItem(
  channelItem: CascadeItem,
  templates: MessagePlanTemplates
): MessagePlanTemplates {
  const conditionalTemplateIds =
    channelItem.conditionalTemplates?.map(({ templateId }) => templateId) || [];

  return Object.fromEntries(
    conditionalTemplateIds
      .filter((id): id is string => id != null && id in templates)
      .map((id) => [id, templates[id]])
  );
}

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

/**
 * Checks if a template ID should be removed based on the removal list
 */
export function shouldRemoveTemplate(
  templateId: string | null | undefined,
  templateIdsToRemove: string[]
): boolean {
  return !!templateId && templateIdsToRemove.includes(templateId);
}

/**
 * Filters out conditional templates whose IDs match the removal list
 */
export function removeTemplatesFromConditionalTemplates(
  conditionalTemplates: ConditionalTemplate[],
  templateIdsToRemove: string[]
): ConditionalTemplate[] {
  return conditionalTemplates.filter(
    (template) =>
      !shouldRemoveTemplate(template.templateId, templateIdsToRemove)
  );
}

/**
 * Determines which cascade groups should be present based on conditional templates
 */
export function buildCascadeGroupsForItem(
  cascadeItem: CascadeItem
): CascadeGroupName[] {
  const groups: CascadeGroupName[] = ['standard'];

  if (
    cascadeItem.conditionalTemplates &&
    cascadeItem.conditionalTemplates.length > 0
  ) {
    const hasAccessibleFormat = cascadeItem.conditionalTemplates.some(
      (template) => 'accessibleFormat' in template && template.templateId
    );
    const hasLanguage = cascadeItem.conditionalTemplates.some(
      (template) => 'language' in template && template.templateId
    );

    if (hasAccessibleFormat) {
      groups.push('accessible');
    }
    if (hasLanguage) {
      groups.push('translations');
    }
  }

  return groups;
}

/**
 * Removes templates from a cascade item by ID, updating both default and conditional templates
 */
export function removeTemplatesFromCascadeItem(
  cascadeItem: CascadeItem,
  templateIdsToRemove: string[]
): CascadeItem {
  const updatedCascadeItem: CascadeItem = { ...cascadeItem };

  const defaultTemplateId = shouldRemoveTemplate(
    cascadeItem.defaultTemplateId,
    templateIdsToRemove
  )
    ? null
    : cascadeItem.defaultTemplateId;

  updatedCascadeItem.defaultTemplateId = defaultTemplateId ?? null;

  if (cascadeItem.conditionalTemplates) {
    updatedCascadeItem.conditionalTemplates =
      removeTemplatesFromConditionalTemplates(
        cascadeItem.conditionalTemplates,
        templateIdsToRemove
      );
  }

  updatedCascadeItem.cascadeGroups =
    buildCascadeGroupsForItem(updatedCascadeItem);

  return updatedCascadeItem;
}

/**
 * Collects all remaining accessible format types from the cascade
 */
export function getRemainingAccessibleFormats(
  cascade: CascadeItem[]
): LetterType[] {
  const formats = new Set<LetterType>();

  for (const item of cascade) {
    if (!item.conditionalTemplates) continue;
    for (const template of item.conditionalTemplates) {
      if ('accessibleFormat' in template && template.templateId) {
        formats.add(template.accessibleFormat);
      }
    }
  }
  return [...formats];
}

/**
 * Collects all remaining language types from the cascade
 */
export function getRemainingLanguages(cascade: CascadeItem[]): Language[] {
  const languages = new Set<Language>();

  for (const item of cascade) {
    if (!item.conditionalTemplates) continue;
    for (const template of item.conditionalTemplates) {
      if ('language' in template && template.templateId) {
        languages.add(template.language);
      }
    }
  }
  return [...languages];
}

/**
 * Updates cascadeGroupOverrides by removing groups with no templates
 * or updating their arrays to reflect remaining templates
 */
export function updateCascadeGroupOverrides(
  cascadeGroupOverrides: CascadeGroup[],
  updatedCascade: CascadeItem[]
): CascadeGroup[] {
  return cascadeGroupOverrides
    .map((group): CascadeGroup => {
      if ('accessibleFormat' in group) {
        return {
          ...group,
          accessibleFormat: getRemainingAccessibleFormats(updatedCascade),
        };
      }

      if ('language' in group) {
        return {
          ...group,
          language: getRemainingLanguages(updatedCascade),
        };
      }

      return group;
    })
    .filter((group) => {
      if ('accessibleFormat' in group) {
        return group.accessibleFormat.length > 0;
      }
      if ('language' in group) {
        return group.language.length > 0;
      }
      return true;
    });
}
