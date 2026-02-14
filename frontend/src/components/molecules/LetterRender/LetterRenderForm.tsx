'use client';

import { Label } from 'nhsuk-react-components';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import {
  SHORT_EXAMPLE_RECIPIENTS,
  LONG_EXAMPLE_RECIPIENTS,
} from '@content/example-recipients';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import type { RenderTab } from './types';
import styles from './LetterRenderForm.module.scss';

type LetterRenderFormProps = {
  template: AuthoringLetterTemplate;
  tab: RenderTab;
};

export function LetterRenderForm({ template, tab }: LetterRenderFormProps) {
  const { letterRender: copy } = content.components;

  const exampleRecipients =
    tab === 'short' ? SHORT_EXAMPLE_RECIPIENTS : LONG_EXAMPLE_RECIPIENTS;

  const hasCustomFields =
    template.customPersonalisation && template.customPersonalisation.length > 0;

  return (
    <NHSNotifyForm.Form formId={`letter-preview-${tab}`}>
      <h3 className='nhsuk-heading-s'>{copy.pdsSection.heading}</h3>
      <p className='nhsuk-body-s'>{copy.pdsSection.hint}</p>

      <NHSNotifyForm.FormGroup htmlFor='systemPersonalisationPackId'>
        <Label size='s' htmlFor={`system-personalisation-pack-id-${tab}`}>
          {copy.pdsSection.recipientLabel}
        </Label>
        <NHSNotifyForm.ErrorMessage htmlFor='systemPersonalisationPackId' />
        <NHSNotifyForm.Select
          id={`system-personalisation-pack-id-${tab}`}
          name='systemPersonalisationPackId'
          className={styles.recipientSelect}
        >
          <option value=''>{copy.pdsSection.recipientPlaceholder}</option>
          {exampleRecipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
            </option>
          ))}
        </NHSNotifyForm.Select>
      </NHSNotifyForm.FormGroup>

      {hasCustomFields && (
        <>
          <h3 className='nhsuk-heading-s nhsuk-u-padding-top-4'>
            {copy.customSection.heading}
          </h3>
          {template.customPersonalisation!.map((field) => {
            const id = `custom-${field}-${tab}`;
            const prefixedKey = `custom_${field}`;

            return (
              <NHSNotifyForm.FormGroup key={field}>
                <Label size='s' htmlFor={id}>
                  {field}
                </Label>
                <NHSNotifyForm.Input
                  type='text'
                  id={id}
                  name={prefixedKey}
                  maxLength={500}
                />
              </NHSNotifyForm.FormGroup>
            );
          })}
        </>
      )}

      <NHSNotifyButton type='submit' secondary className='nhsuk-u-margin-top-4'>
        {copy.updatePreviewButton}
      </NHSNotifyButton>
    </NHSNotifyForm.Form>
  );
}
