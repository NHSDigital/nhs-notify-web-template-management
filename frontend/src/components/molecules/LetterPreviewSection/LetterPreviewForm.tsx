'use client';

import classNames from 'classnames';
import { Button, ErrorMessage, HintText, Label } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyFormGroup } from '@atoms/NHSNotifyFormGroup/NHSNotifyFormGroup';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { useNHSNotifyForm } from '@providers/form-provider';
import content from '@content/content';
import {
  SHORT_PDS_RECIPIENTS,
  LONG_PDS_RECIPIENTS,
} from './pds-test-recipients';
import type { LetterPreviewVariant, LetterPreviewFormState } from './types';

export function LetterPreviewForm({
  template,
  variant,
}: {
  template: AuthoringLetterTemplate;
  variant: LetterPreviewVariant;
}) {
  const [state, action] = useNHSNotifyForm();
  const formState = state as LetterPreviewFormState;
  const { letterPreviewSection: copy } = content.components;

  const pdsRecipients =
    variant === 'short' ? SHORT_PDS_RECIPIENTS : LONG_PDS_RECIPIENTS;
  const hasCustomFields =
    template.customPersonalisation && template.customPersonalisation.length > 0;

  const pdsError =
    formState.errorState?.fieldErrors?.pdsPersonalisationPackId?.join(', ');

  return (
    <NHSNotifyFormWrapper
      action={action}
      formId={`letter-preview-${variant}`}
    >
      {/* Hidden fields */}
      <input type='hidden' name='templateId' value={template.id} readOnly />
      <input type='hidden' name='variant' value={variant} readOnly />
      <input
        type='hidden'
        name='lockNumber'
        value={template.lockNumber}
        readOnly
      />

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
          defaultValue={formState.pdsPersonalisationPackId}
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
            const fieldError =
              formState.errorState?.fieldErrors?.[`custom_${fieldName}`]?.join(
                ', '
              );
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
                  defaultValue={
                    formState.personalisationParameters?.[fieldName]
                  }
                />
              </NHSNotifyFormGroup>
            );
          })}
        </>
      )}

      <Button type='submit' secondary className='nhsuk-u-margin-top-4'>
        {copy.updatePreviewButton}
      </Button>
    </NHSNotifyFormWrapper>
  );
}
