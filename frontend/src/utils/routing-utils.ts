import type {
  CascadeGroupName,
  CascadeItem,
  ConditionalTemplateAccessible,
  ConditionalTemplateLanguage,
  Language,
  RoutingConfig,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
import {
  LetterTemplate,
  ROUTING_ACCESSIBLE_FORMAT_LETTER_TYPES,
  RoutingAccessibleFormatLetterType,
} from 'nhs-notify-web-template-management-utils';

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
 * Gets the default template for a cascade item, from the provided templates object
 */
export function getDefaultTemplateForItem(
  channelItem: CascadeItem,
  templates: MessagePlanTemplates
): TemplateDto | undefined {
  if (!channelItem.defaultTemplateId) return;
  return templates[channelItem.defaultTemplateId];
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
      .filter((id) => id in templates)
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
    if (cascadeItem.defaultTemplateId) {
      templateIds.add(cascadeItem.defaultTemplateId);
    }

    for (const conditionalTemplate of cascadeItem.conditionalTemplates ?? []) {
      if (conditionalTemplate.templateId) {
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
      (template): template is ConditionalTemplateLanguage =>
        'language' in template
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
      (template) => 'accessibleFormat' in template
    );
    const hasLanguage = cascadeItem.conditionalTemplates.some(
      (template) => 'language' in template
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
      selectedTemplate.letterVersion === 'PDF' && {
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
    ...(selectedTemplate.letterVersion === 'PDF' && {
      supplierReferences: selectedTemplate.supplierReferences,
    }),
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
        ...(template.letterVersion === 'PDF' && {
          supplierReferences: template.supplierReferences,
        }),
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

/**
 * Gets the template for a cascade item with the given accessible format from the provided templates object
 */
export function getTemplateForAccessibleFormat(
  format: RoutingAccessibleFormatLetterType,
  cascadeItem: CascadeItem,
  templates: MessagePlanTemplates
): TemplateDto | undefined {
  const conditionalTemplate = (cascadeItem.conditionalTemplates || []).find(
    (
      template: ConditionalTemplate
    ): template is ConditionalTemplateAccessible =>
      'accessibleFormat' in template && template.accessibleFormat === format
  );
  return conditionalTemplate?.templateId
    ? templates[conditionalTemplate.templateId]
    : undefined;
}

/**
 * Returns a list of language templates for a cascade item from the provided templates object
 */
export function getLanguageTemplatesForCascadeItem(
  cascadeItem: CascadeItem,
  templates: MessagePlanTemplates
): TemplateDto[] {
  return (cascadeItem.conditionalTemplates || [])
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
}

/**
 * Returns a list of supported accessible format templates for a cascade item from the provided templates object
 */
export function getAccessibleTemplatesForCascadeItem(
  cascadeItem: CascadeItem,
  templates: MessagePlanTemplates
): [RoutingAccessibleFormatLetterType, TemplateDto][] {
  return ROUTING_ACCESSIBLE_FORMAT_LETTER_TYPES.map((format) => [
    format,
    getTemplateForAccessibleFormat(format, cascadeItem, templates),
  ]).filter((pair): pair is [RoutingAccessibleFormatLetterType, TemplateDto] =>
    Boolean(pair[1])
  );
}
/**
 * Gets the indices of channels that are missing templates in a routing config.
 * Conditional templates (large print, foreign language) are optional and not validated.
 * @returns Array of indices for channels missing templates
 */
export function getChannelsMissingTemplates(
  messagePlan: RoutingConfig
): number[] {
  const missingTemplateIndices: number[] = [];

  for (const [index, cascadeItem] of messagePlan.cascade.entries()) {
    if (!cascadeItem.defaultTemplateId) {
      missingTemplateIndices.push(index);
    }
  }

  return missingTemplateIndices;
}
