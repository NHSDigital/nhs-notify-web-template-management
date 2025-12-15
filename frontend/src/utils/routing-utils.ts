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
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

export type ConditionalTemplate =
  | ConditionalTemplateAccessible
  | ConditionalTemplateLanguage;

export type MessagePlanTemplates = Record<string, TemplateDto>;

/**
 * Type guard to check if a template is a letter template
 */
export function isLetterTemplate(
  template: TemplateDto
): template is LetterTemplate {
  return template.templateType === 'LETTER';
}

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
 * Gets selected language template IDs from a cascade item
 * Returns array of { language, templateId } for language-based conditional templates
 */
export function getSelectedLanguageTemplateIds(
  cascadeItem: CascadeItem
): Array<{ language: Language; templateId: string }> {
  if (!cascadeItem.conditionalTemplates) return [];

  return cascadeItem.conditionalTemplates
    .filter(
      (
        template
      ): template is ConditionalTemplateLanguage & { templateId: string } =>
        'language' in template && template.templateId !== null
    )
    .map(({ language, templateId }) => ({
      language,
      templateId,
    }));
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
    const remainingTemplates = removeTemplatesFromConditionalTemplates(
      cascadeItem.conditionalTemplates,
      templateIdsToRemove
    );

    if (remainingTemplates.length > 0) {
      updatedCascadeItem.conditionalTemplates = remainingTemplates;
    } else {
      delete updatedCascadeItem.conditionalTemplates;
    }
  }

  updatedCascadeItem.cascadeGroups =
    buildCascadeGroupsForItem(updatedCascadeItem);

  return updatedCascadeItem;
}

/**
 * Gets all accessible format types from the cascade
 */
export function getAccessibleLetterFormatsFromCascade(
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
 * Collects all language types from the cascade
 */
export function getCascadeLanguages(cascade: CascadeItem[]): Language[] {
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
 * Builds cascadeGroupOverrides by analysing the cascade to determine which conditional
 * template groups (accessible formats, languages) are present.
 * Returns overrides with only groups that have templates.
 */
export function buildCascadeGroupOverridesFromCascade(
  updatedCascade: CascadeItem[]
): CascadeGroup[] {
  const overrides: CascadeGroup[] = [];

  const accessibleFormats =
    getAccessibleLetterFormatsFromCascade(updatedCascade);
  if (accessibleFormats.length > 0) {
    overrides.push({
      name: 'accessible',
      accessibleFormat: accessibleFormats,
    });
  }

  const languages = getCascadeLanguages(updatedCascade);
  if (languages.length > 0) {
    overrides.push({
      name: 'translations',
      language: languages,
    });
  }

  return overrides;
}

/**
 * Add default template to cascade at specific index
 */
export function addDefaultTemplateToCascade(
  cascade: CascadeItem[],
  cascadeIndex: number,
  selectedTemplateId: string,
  selectedTemplate?: TemplateDto
): CascadeItem[] {
  const newCascade = [...cascade];
  const currentItem = newCascade[cascadeIndex];

  newCascade[cascadeIndex] = {
    ...currentItem,
    defaultTemplateId: selectedTemplateId,
    ...(selectedTemplate &&
      isLetterTemplate(selectedTemplate) &&
      selectedTemplate.supplierReferences && {
        supplierReferences: selectedTemplate.supplierReferences,
      }),
  };

  return newCascade;
}

/**
 * Add accessible format letter template to existing cascade item
 */
export function addAccessibleFormatLetterTemplateToCascadeItem(
  cascadeItem: CascadeItem,
  selectedTemplate: LetterTemplate
): CascadeItem {
  const newConditionalTemplate: ConditionalTemplateAccessible = {
    accessibleFormat: selectedTemplate.letterType,
    templateId: selectedTemplate.id,
    supplierReferences: selectedTemplate.supplierReferences,
  };

  const conditionalTemplates = [...(cascadeItem.conditionalTemplates ?? [])];

  const existingIndex = conditionalTemplates.findIndex(
    (template: ConditionalTemplate) =>
      'accessibleFormat' in template &&
      template.accessibleFormat === selectedTemplate.letterType
  );

  if (existingIndex >= 0) {
    conditionalTemplates[existingIndex] = newConditionalTemplate;
  } else {
    conditionalTemplates.push(newConditionalTemplate);
  }

  return {
    ...cascadeItem,
    conditionalTemplates,
  };
}

/**
 * Add accessible format letter template to cascade at specific index
 */
export function addAccessibleFormatLetterTemplateToCascade(
  cascade: CascadeItem[],
  cascadeIndex: number,
  selectedTemplate: LetterTemplate
): CascadeItem[] {
  const updatedCascade = [...cascade];
  updatedCascade[cascadeIndex] = addAccessibleFormatLetterTemplateToCascadeItem(
    updatedCascade[cascadeIndex],
    selectedTemplate
  );
  return updatedCascade;
}

/**
 * Add language letter templates to a cascade item
 */
export function addLanguageLetterTemplatesToCascadeItem(
  cascadeItem: CascadeItem,
  selectedTemplates: LetterTemplate[]
): CascadeItem {
  if (selectedTemplates.length === 0) {
    return cascadeItem;
  }

  const newConditionalTemplates: ConditionalTemplateLanguage[] =
    selectedTemplates.map((template) => {
      if (!template.language) {
        throw new Error('Selected template must have a language property');
      }
      return {
        language: template.language,
        templateId: template.id,
        supplierReferences: template.supplierReferences,
      };
    });

  const conditionalTemplates = [
    ...(cascadeItem.conditionalTemplates ?? []),
    ...newConditionalTemplates,
  ];

  return {
    ...cascadeItem,
    conditionalTemplates,
  };
}

/**
 * Add language letter templates to cascade at specific index
 */
export function addLanguageLetterTemplatesToCascade(
  cascade: CascadeItem[],
  cascadeIndex: number,
  selectedTemplates: LetterTemplate[]
): CascadeItem[] {
  const updatedCascade = [...cascade];
  updatedCascade[cascadeIndex] = addLanguageLetterTemplatesToCascadeItem(
    updatedCascade[cascadeIndex],
    selectedTemplates
  );
  return updatedCascade;
}

/**
 * Remove all language templates from a cascade item
 * Keeps other conditional templates like accessible format templates (e.g. large print)
 */
export function removeLanguageTemplatesFromCascadeItem(
  cascadeItem: CascadeItem
): CascadeItem {
  const existingConditionalTemplates = cascadeItem.conditionalTemplates ?? [];

  const nonLanguageTemplates = existingConditionalTemplates.filter(
    (template) => !('language' in template)
  );

  const updatedItem = { ...cascadeItem };

  if (nonLanguageTemplates.length > 0) {
    updatedItem.conditionalTemplates = nonLanguageTemplates;
  } else {
    delete updatedItem.conditionalTemplates;
  }

  return updatedItem;
}

/**
 * Replace all language templates in a cascade item with new ones
 * Removes existing language templates but preserves other conditional templates
 */
export function replaceLanguageTemplatesInCascadeItem(
  cascadeItem: CascadeItem,
  selectedTemplates: LetterTemplate[]
): CascadeItem {
  const cascadeItemWithoutLanguages =
    removeLanguageTemplatesFromCascadeItem(cascadeItem);
  return addLanguageLetterTemplatesToCascadeItem(
    cascadeItemWithoutLanguages,
    selectedTemplates
  );
}
