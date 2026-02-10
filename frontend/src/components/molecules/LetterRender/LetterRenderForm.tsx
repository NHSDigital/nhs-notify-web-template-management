'use client';

import type { ChangeEvent, FormEvent } from 'react';
import classNames from 'classnames';
import { Button, ErrorMessage, Label } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import {
  SHORT_SYSTEM_RECIPIENTS,
  LONG_SYSTEM_RECIPIENTS,
} from './system-test-recipients';
import type { LetterPreviewVariant, LetterRenderFormData } from './types';
import styles from './LetterRenderForm.module.scss';

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

  const systemRecipients =
    variant === 'short' ? SHORT_SYSTEM_RECIPIENTS : LONG_SYSTEM_RECIPIENTS;
  const hasCustomFields =
    template.customPersonalisation && template.customPersonalisation.length > 0;

  const systemError = errors.systemPersonalisationPackId?.join(', ');

  const handlePdsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onFormChange({
      ...formData,
      systemPersonalisationPackId: e.target.value,
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

      <div
        className={classNames('nhsuk-form-group', {
          'nhsuk-form-group--error': systemError,
        })}
      >
        <Label size='s' htmlFor={`systemPersonalisationPackId-${variant}`}>
          {copy.pdsSection.recipientLabel}
        </Label>
        {systemError && <ErrorMessage>{systemError}</ErrorMessage>}
        <select
          id={`systemPersonalisationPackId-${variant}`}
          name='systemPersonalisationPackId'
          className={classNames('nhsuk-select', styles.recipientSelect, {
            'nhsuk-select--error': systemError,
          })}
          value={formData.systemPersonalisationPackId}
          onChange={handlePdsChange}
          disabled={isLoading}
        >
          <option value=''>{copy.pdsSection.recipientPlaceholder}</option>
          {systemRecipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Personalisation Section (conditional) */}
      {hasCustomFields && (
        <>
          <h3 className='nhsuk-heading-s nhsuk-u-padding-top-4'>
            {copy.customSection.heading}
          </h3>
          {template.customPersonalisation!.map((fieldName) => {
            const fieldError = errors[`custom_${fieldName}`]?.join(', ');
            return (
              <div
                key={fieldName}
                className={classNames('nhsuk-form-group', {
                  'nhsuk-form-group--error': fieldError,
                })}
              >
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
              </div>
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
