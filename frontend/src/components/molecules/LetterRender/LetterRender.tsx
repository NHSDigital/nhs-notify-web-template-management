'use client';

import { useState, useCallback } from 'react';
import { Tabs } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { LetterRenderTabContent } from './LetterRenderTabContent';
import { updateLetterPreview } from './server-action';
import type {
  LetterPreviewVariant,
  LetterRenderFormData,
  LetterRenderState,
  VariantState,
} from './types';

function buildPdfUrl(
  template: AuthoringLetterTemplate,
  fileName: string
): string {
  const basePath = getBasePath();
  return `${basePath}/files/${template.clientId}/renders/${template.id}/${fileName}`;
}

function buildInitialVariantState(
  template: AuthoringLetterTemplate,
  variant: LetterPreviewVariant
): VariantState {
  const renderDetails =
    variant === 'short'
      ? template.files.shortFormRender
      : template.files.longFormRender;

  const fileName =
    renderDetails?.fileName ?? template.files.initialRender?.fileName ?? null;

  return {
    formData: {
      systemPersonalisationPackId:
        renderDetails?.systemPersonalisationPackId ?? '',
      personalisationParameters: renderDetails?.personalisationParameters ?? {},
    },
    previewState: 'idle',
    pdfUrl: fileName ? buildPdfUrl(template, fileName) : null,
    errors: {},
  };
}

export function LetterRender({
  template,
}: {
  template: AuthoringLetterTemplate;
}) {
  const { letterPreviewSection: copy } = content.components;

  const [state, setState] = useState<LetterRenderState>({
    short: buildInitialVariantState(template, 'short'),
    long: buildInitialVariantState(template, 'long'),
  });

  const handleFormChange = useCallback(
    (variant: LetterPreviewVariant, formData: LetterRenderFormData) => {
      setState((prev) => ({
        ...prev,
        [variant]: {
          ...prev[variant],
          formData,
        },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (variant: LetterPreviewVariant) => {
      const variantState = state[variant];

      // Set loading state (for future spinner implementation)
      setState((prev) => ({
        ...prev,
        [variant]: {
          ...prev[variant],
          previewState: 'loading',
          errors: {},
        },
      }));

      // Call server action
      const result = await updateLetterPreview({
        templateId: template.id,
        variant,
        systemPersonalisationPackId:
          variantState.formData.systemPersonalisationPackId,
        personalisationParameters:
          variantState.formData.personalisationParameters,
      });

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          [variant]: {
            ...prev[variant],
            previewState: 'error',
            errors: result.errors ?? {},
          },
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        [variant]: {
          ...prev[variant],
          previewState: 'ready',
          pdfUrl: result.pdfUrl ?? prev[variant].pdfUrl,
          errors: {},
        },
      }));
    },
    [state, template.id]
  );

  return (
    <section className='nhsuk-u-margin-top-6'>
      <h2 className='nhsuk-heading-m'>{copy.heading}</h2>
      <p>{copy.guidance}</p>

      <Tabs className='nhsuk-u-margin-top-6'>
        <Tabs.Title>{copy.tabTitle}</Tabs.Title>
        <Tabs.List>
          <Tabs.ListItem id='tab-short'>{copy.tabs.short}</Tabs.ListItem>
          <Tabs.ListItem id='tab-long'>{copy.tabs.long}</Tabs.ListItem>
        </Tabs.List>

        <Tabs.Contents id='tab-short'>
          <LetterRenderTabContent
            template={template}
            variant='short'
            variantState={state.short}
            onFormChange={(formData) => handleFormChange('short', formData)}
            onSubmit={() => handleSubmit('short')}
          />
        </Tabs.Contents>

        <Tabs.Contents id='tab-long'>
          <LetterRenderTabContent
            template={template}
            variant='long'
            variantState={state.long}
            onFormChange={(formData) => handleFormChange('long', formData)}
            onSubmit={() => handleSubmit('long')}
          />
        </Tabs.Contents>
      </Tabs>
    </section>
  );
}
