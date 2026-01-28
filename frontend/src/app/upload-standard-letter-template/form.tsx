'use client';

import classNames from 'classnames';
import {
  Button,
  Details,
  ErrorMessage,
  HintText,
  Label,
} from 'nhsuk-react-components';
import { FileUploadInput } from '@atoms/FileUpload/FileUpload';
import copy from '@content/content';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { createNhsNotifyFormContext } from '@providers/form-provider';
import { DOCX_MIME, type FormSchema } from './server-action';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormGroup } from '@atoms/NHSNotifyFormGroup/NHSNotifyFormGroup';

const { useNHSNotifyForm, NHSNotifyFormProvider } =
  createNhsNotifyFormContext<FormSchema>();

export { NHSNotifyFormProvider };

type FormProps = { campaignIds: string[] };

const content = copy.pages.uploadStandardLetterTemplate.form;

export function UploadStandardLetterTemplateForm({ campaignIds }: FormProps) {
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
          {content.name.label}
        </Label>
        <HintText>{content.name.hint}</HintText>

        <Details className='nhsuk-u-margin-top-3'>
          <Details.Summary>{content.name.details.summary}</Details.Summary>
          <Details.Text>
            <ContentRenderer content={content.name.details.text} />
          </Details.Text>
        </Details>
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
          {content.campaignId.label}
        </Label>
        {campaignIds.length === 1 ? (
          <>
            <HintText>{content.campaignId.single.hint}</HintText>
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
            <HintText>{content.campaignId.select.hint}</HintText>
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
          {content.file.label}
        </Label>
        <HintText>
          <ContentRenderer content={content.file.hint} />
        </HintText>
        {fileError && <ErrorMessage>{fileError}</ErrorMessage>}
        <FileUploadInput id='file' name='file' accept={DOCX_MIME} />
      </NHSNotifyFormGroup>

      <Button type='submit'>{content.submitButton.text}</Button>
    </NHSNotifyFormWrapper>
  );
}
