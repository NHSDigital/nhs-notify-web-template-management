'use client';

import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterRenderForm } from './LetterRenderForm';
import { LetterRenderIframe } from './LetterRenderIframe';
import type {
  LetterPreviewVariant,
  LetterRenderFormData,
  VariantState,
} from './types';
import styles from './LetterRenderTabContent.module.scss';

type LetterRenderTabContentProps = {
  template: AuthoringLetterTemplate;
  variant: LetterPreviewVariant;
  variantState: VariantState;
  onFormChange: (formData: LetterRenderFormData) => void;
  onSubmit: () => void;
};

export function LetterRenderTabContent({
  template,
  variant,
  variantState,
  onFormChange,
  onSubmit,
}: LetterRenderTabContentProps) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.formColumn}>
        <LetterRenderForm
          template={template}
          variant={variant}
          formData={variantState.formData}
          errors={variantState.errors}
          isLoading={variantState.previewState === 'loading'}
          onFormChange={onFormChange}
          onSubmit={onSubmit}
        />
      </div>
      <div className={styles.iframeColumn}>
        <LetterRenderIframe
          variant={variant}
          pdfUrl={variantState.pdfUrl}
          _previewState={variantState.previewState}
        />
      </div>
    </div>
  );
}
