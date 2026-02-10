'use client';

import type { ChangeEvent, FormEvent } from 'react';
import classNames from 'classnames';
import { Button, ErrorMessage, Label } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyFormGroup } from '@atoms/NHSNotifyFormGroup/NHSNotifyFormGroup';
import content from '@content/content';
import {
  SHORT_PDS_RECIPIENTS,
  LONG_PDS_RECIPIENTS,
} from './pds-test-recipients';
import type { LetterPreviewVariant, LetterRenderFormData } from './types';

type LetterRenderFormProps = {
  template: AuthoringLetterTemplate;
  variant: LetterPreviewVariant;
  formData: LetterRenderFormData;
  errors: Record<string, string[]>;
  isLoading: boolean;
  onFormChange: (formData: LetterRenderFormData) => void;
  onSubmit: () => void;
};

export function LetterRenderForm({
  template,
  variant,
  formData,
  errors,
  isLoading,
  onFormChange,
  onSubmit,
}: LetterRenderFormProps) {
  const { letterPreviewSection: copy } = content.components;

  const pdsRecipients =
    variant === 'short' ? SHORT_PDS_RECIPIENTS : LONG_PDS_RECIPIENTS;
  const hasCustomFields =
    template.customPersonalisation && template.customPersonalisation.length > 0;

  const pdsError = errors.pdsPersonalisationPackId?.join(', ');

  const handlePdsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onFormChange({
      ...formData,
      pdsPersonalisationPackId: e.target.value,
    });
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    onFormChange({
      ...formData,
      personalisationParameters: {
        ...formData.personalisationParameters,
        [fieldName]: value,
      },
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} id={`letter-preview-${variant}`}>
      {/* PDS Personalisation Section */}
      <h3 className='nhsuk-heading-s'>{copy.pdsSection.heading}</h3>
      <p className='nhsuk-body-s'>{copy.pdsSection.hint}</p>

      <NHSNotifyFormGroup error={Boolean(pdsError)}>
        <Label size='s' htmlFor={`pdsPersonalisationPackId-${variant}`}>
          {copy.pdsSection.recipientLabel}
        </Label>
        {pdsError && <ErrorMessage>{pdsError}</ErrorMessage>}
        <select
          id={`pdsPersonalisationPackId-${variant}`}
          name='pdsPersonalisationPackId'
          className={classNames('nhsuk-select', {
            'nhsuk-select--error': pdsError,
          })}
          value={formData.pdsPersonalisationPackId}
          onChange={handlePdsChange}
          disabled={isLoading}
        >
          <option value=''>{copy.pdsSection.recipientPlaceholder}</option>
          {pdsRecipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
            </option>
          ))}
        </select>
      </NHSNotifyFormGroup>

      {/* Custom Personalisation Section (conditional) */}
      {hasCustomFields && (
        <>
          <h3 className='nhsuk-heading-s nhsuk-u-padding-top-4'>
            {copy.customSection.heading}
          </h3>
          {template.customPersonalisation!.map((fieldName) => {
            const fieldError = errors[`custom_${fieldName}`]?.join(', ');
            return (
              <NHSNotifyFormGroup key={fieldName} error={Boolean(fieldError)}>
                <Label size='s' htmlFor={`custom-${fieldName}-${variant}`}>
                  {fieldName}
                </Label>
                {fieldError && <ErrorMessage>{fieldError}</ErrorMessage>}
                <input
                  type='text'
                  id={`custom-${fieldName}-${variant}`}
                  name={`custom_${fieldName}`}
                  className={classNames('nhsuk-input', {
                    'nhsuk-input--error': fieldError,
                  })}
                  maxLength={500}
                  value={formData.personalisationParameters[fieldName] ?? ''}
                  onChange={(e) =>
                    handleCustomFieldChange(fieldName, e.target.value)
                  }
                  disabled={isLoading}
                />
              </NHSNotifyFormGroup>
            );
          })}
        </>
      )}

      <Button
        type='submit'
        secondary
        className='nhsuk-u-margin-top-4'
        disabled={isLoading}
      >
        {copy.updatePreviewButton}
      </Button>
    </form>
  );
}
