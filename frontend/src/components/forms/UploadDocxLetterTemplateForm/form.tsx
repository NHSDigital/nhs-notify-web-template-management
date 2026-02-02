'use client';

import classNames from 'classnames';
import { Button, ErrorMessage, HintText, Label } from 'nhsuk-react-components';
import { FileUploadInput } from '@atoms/FileUpload/FileUpload';
import { NHSNotifyFormGroup } from '@atoms/NHSNotifyFormGroup/NHSNotifyFormGroup';
import copy from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { createNhsNotifyFormContext } from '@providers/form-provider';
import { DOCX_MIME, type UploadDocxLetterTemplateFormSchema } from './schema';
import { PropsWithChildren } from 'react';

const { useNHSNotifyForm, NHSNotifyFormProvider } =
  createNhsNotifyFormContext<UploadDocxLetterTemplateFormSchema>();

export const Provider = NHSNotifyFormProvider;

const content = copy.components.uploadDocxLetterTemplateForm;

export function NameField() {
  const [state] = useNHSNotifyForm();

  const error = state.errorState?.fieldErrors?.name?.join(',');

  return (
    <NHSNotifyFormGroup error={Boolean(error)}>
      <Label size='s' htmlFor='name'>
        {content.fields.name.label}
      </Label>
      <HintText>{content.fields.name.hint}</HintText>

      <TemplateNameGuidance className='nhsuk-u-margin-top-3' />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <input
        type='text'
        id='name'
        name='name'
        className='nhsuk-input nhsuk-u-margin-bottom-2'
        defaultValue={state.fields?.name}
      />
    </NHSNotifyFormGroup>
  );
}

export function CampaignIdField({ campaignIds }: { campaignIds: string[] }) {
  const [state] = useNHSNotifyForm();

  const error = state.errorState?.fieldErrors?.campaignId?.join(',');

  return (
    <NHSNotifyFormGroup error={Boolean(error)}>
      <Label size='s' htmlFor='campaignId'>
        {content.fields.campaignId.label}
      </Label>
      {campaignIds.length === 1 ? (
        <>
          <HintText>{content.fields.campaignId.single.hint}</HintText>
          <input
            type='hidden'
            name='campaignId'
            value={campaignIds[0]}
            readOnly
          />
          <p data-testid='single-campaign-id-text'>{campaignIds[0]}</p>
        </>
      ) : (
        <>
          <HintText>{content.fields.campaignId.select.hint}</HintText>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <select
            id='campaignId'
            name='campaignId'
            defaultValue={state.fields?.campaignId}
            key={state.fields?.campaignId}
            className={classNames('nhsuk-select', {
              'nhsuk-select--error': error,
            })}
          >
            <option />
            {campaignIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </>
      )}
    </NHSNotifyFormGroup>
  );
}

export function FileField() {
  const [state] = useNHSNotifyForm();

  const error = state.errorState?.fieldErrors?.file?.join(',');

  return (
    <NHSNotifyFormGroup error={Boolean(error)}>
      <Label size='s' htmlFor='file'>
        {content.fields.file.label}
      </Label>
      <HintText>
        <ContentRenderer content={content.fields.file.hint} />
      </HintText>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <FileUploadInput id='file' name='file' accept={DOCX_MIME} />
    </NHSNotifyFormGroup>
  );
}

export function Form({
  children,
  formId,
}: PropsWithChildren<{ formId: string }>) {
  const [, action] = useNHSNotifyForm();

  return (
    <NHSNotifyFormWrapper action={action} formId={formId}>
      {children}
      <Button type='submit'>{content.fields.submitButton.text}</Button>
    </NHSNotifyFormWrapper>
  );
}
