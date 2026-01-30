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

const { useNHSNotifyForm, NHSNotifyFormProvider } =
  createNhsNotifyFormContext<UploadDocxLetterTemplateFormSchema>();

export { NHSNotifyFormProvider };

type FormProps = { campaignIds: string[] };

const { fields } = copy.components.uploadDocxLetterTemplateForm;

export function UploadDocxLetterTemplateForm({ campaignIds }: FormProps) {
  const [state, action] = useNHSNotifyForm();

  const nameError = state.errorState?.fieldErrors?.name?.join(',');
  const campaignIdError = state.errorState?.fieldErrors?.campaignId?.join(',');
  const fileError = state.errorState?.fieldErrors?.file?.join(',');

  return (
    <NHSNotifyFormWrapper
      action={action}
      formId='upload-standard-letter-template'
    >
      <NHSNotifyFormGroup error={Boolean(nameError)}>
        <Label size='s' htmlFor='name'>
          {fields.name.label}
        </Label>
        <HintText>{fields.name.hint}</HintText>

        <TemplateNameGuidance className='nhsuk-u-margin-top-3' />
        {nameError && <ErrorMessage>{nameError}</ErrorMessage>}
        <input
          type='text'
          id='name'
          name='name'
          className='nhsuk-input nhsuk-u-margin-bottom-2'
          defaultValue={state.fields?.name}
        />
      </NHSNotifyFormGroup>

      <NHSNotifyFormGroup error={Boolean(campaignIdError)}>
        <Label size='s' htmlFor='campaignId'>
          {fields.campaignId.label}
        </Label>
        {campaignIds.length === 1 ? (
          <>
            <HintText>{fields.campaignId.single.hint}</HintText>
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
            <HintText>{fields.campaignId.select.hint}</HintText>
            {campaignIdError && <ErrorMessage>{campaignIdError}</ErrorMessage>}
            <select
              id='campaignId'
              name='campaignId'
              defaultValue={state.fields?.campaignId}
              key={state.fields?.campaignId}
              className={classNames('nhsuk-select', {
                'nhsuk-select--error': campaignIdError,
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

      <NHSNotifyFormGroup error={Boolean(fileError)}>
        <Label size='s' htmlFor='file'>
          {fields.file.label}
        </Label>
        <HintText>
          <ContentRenderer content={fields.file.hint} />
        </HintText>
        {fileError && <ErrorMessage>{fileError}</ErrorMessage>}
        <FileUploadInput id='file' name='file' accept={DOCX_MIME} />
      </NHSNotifyFormGroup>

      <Button type='submit'>{fields.submitButton.text}</Button>
    </NHSNotifyFormWrapper>
  );
}
