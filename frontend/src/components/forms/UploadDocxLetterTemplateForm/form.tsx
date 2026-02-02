'use client';

import { useState, type PropsWithChildren } from 'react';
import classNames from 'classnames';
import {
  Button,
  ErrorMessage,
  HintText,
  InsetText,
  Label,
} from 'nhsuk-react-components';
import { z } from 'zod';
import { LANGUAGE_LIST } from 'nhs-notify-backend-client';
import {
  isLanguage,
  isRightToLeft,
} from 'nhs-notify-web-template-management-utils';
import { FileUploadInput } from '@atoms/FileUpload/FileUpload';
import { NHSNotifyFormGroup } from '@atoms/NHSNotifyFormGroup/NHSNotifyFormGroup';
import copy from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { useNHSNotifyForm } from '@providers/form-provider';

const content = copy.components.uploadDocxLetterTemplateForm;

export const DOCX_MIME: z.core.util.MimeTypes =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

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

const OTHER_LANGUAGES = LANGUAGE_LIST.filter((language) => language !== 'en');

export function LanguageField() {
  const [state] = useNHSNotifyForm();

  const [selectedLanguage, setLanguage] = useState(state.fields?.language);

  const error = state.errorState?.fieldErrors?.language?.join(',');

  return (
    <>
      <NHSNotifyFormGroup error={Boolean(error)}>
        <Label size='s' htmlFor='language'>
          {content.fields.language.label}
        </Label>

        <HintText>{content.fields.language.hint}</HintText>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <select
          id='language'
          name='language'
          defaultValue={state.fields?.language}
          key={state.fields?.language}
          className={classNames('nhsuk-select', {
            'nhsuk-select--error': error,
          })}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option />
          {OTHER_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </NHSNotifyFormGroup>
      {isLanguage(selectedLanguage) && isRightToLeft(selectedLanguage) && (
        <InsetText>
          <ContentRenderer content={content.fields.language.rtl} />
        </InsetText>
      )}
    </>
  );
}
