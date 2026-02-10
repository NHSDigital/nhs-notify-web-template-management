'use client';

import { useState } from 'react';
import { HintText, InsetText, Label } from 'nhsuk-react-components';
import { LANGUAGE_LIST } from 'nhs-notify-backend-client';
import {
  isLanguage,
  isRightToLeft,
  languageMapping,
} from 'nhs-notify-web-template-management-utils';
import { FileUploadInput } from '@atoms/FileUpload/FileUpload';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import copy from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { useNHSNotifyForm } from '@providers/form-provider';

const content = copy.components.uploadDocxLetterTemplateForm;

export function NameField() {
  const [state] = useNHSNotifyForm();

  return (
    <NHSNotifyForm.FormGroup className='nhsuk-u-margin-bottom-6' htmlFor='name'>
      <Label size='s' htmlFor='name'>
        {content.fields.name.label}
      </Label>
      <HintText>{content.fields.name.hint}</HintText>

      <TemplateNameGuidance className='nhsuk-u-margin-top-3' />
      <NHSNotifyForm.ErrorMessage htmlFor='name' />
      <input
        type='text'
        id='name'
        name='name'
        className='nhsuk-input nhsuk-u-margin-bottom-2'
        defaultValue={state.fields?.name}
      />
    </NHSNotifyForm.FormGroup>
  );
}

export function CampaignIdField({ campaignIds }: { campaignIds: string[] }) {
  return (
    <NHSNotifyForm.FormGroup
      className='nhsuk-u-margin-bottom-6'
      htmlFor='campaignId'
    >
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
          <NHSNotifyForm.ErrorMessage htmlFor='campaignId' />
          <NHSNotifyForm.Select id='campaignId' name='campaignId'>
            <option />
            {campaignIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </NHSNotifyForm.Select>
        </>
      )}
    </NHSNotifyForm.FormGroup>
  );
}

export function FileField() {
  return (
    <NHSNotifyForm.FormGroup className='nhsuk-u-margin-bottom-6' htmlFor='file'>
      <Label size='s' htmlFor='file'>
        {content.fields.file.label}
      </Label>
      <HintText>
        <ContentRenderer content={content.fields.file.hint} />
      </HintText>
      <NHSNotifyForm.ErrorMessage htmlFor='file' />
      <FileUploadInput
        id='file'
        name='file'
        accept='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      />
    </NHSNotifyForm.FormGroup>
  );
}

const OTHER_LANGUAGES = LANGUAGE_LIST.filter((language) => language !== 'en');

export function LanguageField() {
  const [state] = useNHSNotifyForm();

  const [selectedLanguage, setLanguage] = useState(state.fields?.language);

  return (
    <>
      <NHSNotifyForm.FormGroup
        className='nhsuk-u-margin-bottom-6'
        htmlFor='language'
      >
        <Label size='s' htmlFor='language'>
          {content.fields.language.label}
        </Label>

        <HintText>{content.fields.language.hint}</HintText>
        <NHSNotifyForm.ErrorMessage htmlFor='language' />
        <NHSNotifyForm.Select
          id='language'
          name='language'
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>{content.fields.language.placeholder}</option>
          {OTHER_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {languageMapping(language)}
            </option>
          ))}
        </NHSNotifyForm.Select>
      </NHSNotifyForm.FormGroup>
      {isLanguage(selectedLanguage) && isRightToLeft(selectedLanguage) && (
        <InsetText>
          <ContentRenderer content={content.fields.language.rtl} />
        </InsetText>
      )}
    </>
  );
}
