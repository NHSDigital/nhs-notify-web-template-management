'use client';

import { FC, useActionState, useState } from 'react';
import classNames from 'classnames';
import {
  TextInput,
  HintText,
  Label,
  Select,
  WarningCallout,
} from 'nhsuk-react-components';
import { processFormActions } from '@forms/LetterTemplateForm/server-action';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import {
  alphabeticalLanguageList,
  alphabeticalLetterTypeList,
  UploadLetterTemplate,
  ErrorState,
  isRightToLeft,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import FileUpload from '@atoms/FileUpload/FileUpload';
import { $UploadLetterTemplateForm } from './form-schema';
import { validate } from '@utils/client-validate-form';
import { Language } from 'nhs-notify-backend-client';
import Link from 'next/link';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export const LetterTemplateForm: FC<
  PageComponentProps<UploadLetterTemplate> & {
    campaignIds: string[];
  }
> = ({ initialState, campaignIds }) => {
  const {
    backLinkText,
    pageHeading,
    templateNameLabelText,
    templateNameHintText,
    campaignLabelText,
    singleCampaignHintText,
    multiCampaignHintText,
    templateTypeLabelText,
    templateTypeHintText,
    templateLanguageLabelText,
    templateLanguageHintText,
    templatePdfLabelText,
    templatePdfHintText,
    templatePdfGuidanceLink,
    templateCsvGuidanceLinkText,
    templateCsvLabelText,
    templateCsvHintText,
    templateCsvGuidanceLink,
    templatePdfGuidanceLinkText,
    buttonText,
    rtlWarning,
  } = content.components.templateFormLetter;

  const [state, action] = useActionState(processFormActions, initialState);
  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const [letterTemplateName, letterTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [letterTemplateCampaignId, campaignIdHandler] =
    useTextInput<HTMLSelectElement>(state.campaignId);

  const [letterTemplateLetterType, letterTypeHandler] =
    useTextInput<HTMLSelectElement>(state.letterType);

  const [letterTemplateLanguage, letterLanguageHandler] = useTextInput<
    HTMLSelectElement,
    Language
  >(state.language);

  const templateNameError =
    errorState?.fieldErrors?.letterTemplateName?.join(', ');

  const templateCampaignIdError =
    errorState?.fieldErrors?.letterTemplateCampaignId?.join(', ');

  const templateLetterTypeError =
    errorState?.fieldErrors?.letterTemplateLetterType?.join(', ');

  const templateLanguageError =
    errorState?.fieldErrors?.letterTemplateLanguage?.join(', ');

  const templatePdfError =
    errorState?.fieldErrors?.letterTemplatePdf?.join(', ');

  const templateCsvError =
    errorState?.fieldErrors?.letterTemplateCsv?.join(', ');

  const validateForm = validate($UploadLetterTemplateForm, setErrorState);

  const formGroupClasses = [
    'nhsuk-u-margin-bottom-6',
    'nhsuk-u-padding-top-2',
    'nhsuk-u-padding-bottom-2',
  ];

  return (
    <>
      <Link href='/choose-a-template-type' passHref legacyBehavior>
        <NotifyBackLink>{backLinkText}</NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <NhsNotifyErrorSummary errorState={errorState} />
            <NHSNotifyFormWrapper
              action={action}
              formId='upload-letter-template'
              formAttributes={{ onSubmit: validateForm }}
            >
              <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
                {pageHeading}
              </h1>
              <div
                className={classNames(
                  templateNameError && 'nhsuk-form-group--error',
                  ...formGroupClasses
                )}
              >
                <Label htmlFor='letterTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance template={'LETTER'} />
                <TextInput
                  formGroupProps={{ className: 'nhsuk-u-margin-bottom-0' }}
                  id='letterTemplateName'
                  defaultValue={letterTemplateName}
                  onChange={letterTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'letterTemplateName--error-message' }}
                />
              </div>
              {campaignIds.length === 1 ? (
                <div className={classNames(...formGroupClasses)}>
                  <Label htmlFor='letterTemplateName' size='s'>
                    {campaignLabelText}
                  </Label>
                  <HintText>{singleCampaignHintText}</HintText>
                  <input
                    type='hidden'
                    name='letterTemplateCampaignId'
                    value={letterTemplateCampaignId}
                    readOnly
                  />
                  {letterTemplateCampaignId}
                </div>
              ) : (
                <Select
                  formGroupProps={{
                    className: classNames(...formGroupClasses),
                  }}
                  label={campaignLabelText}
                  labelProps={{ size: 's' }}
                  hint={multiCampaignHintText}
                  id='letterTemplateCampaignId'
                  defaultValue={letterTemplateCampaignId}
                  onChange={campaignIdHandler}
                  error={templateCampaignIdError}
                  errorProps={{ id: 'letterTemplateCampaignId--error-message' }}
                >
                  {['', ...campaignIds].map((campaignId) => (
                    <Select.Option
                      key={`option-${campaignId}`}
                      value={campaignId}
                    >
                      {campaignId}
                    </Select.Option>
                  ))}
                </Select>
              )}
              <Select
                formGroupProps={{
                  className: classNames(...formGroupClasses),
                }}
                label={templateTypeLabelText}
                labelProps={{ size: 's' }}
                hint={templateTypeHintText}
                id='letterTemplateLetterType'
                defaultValue={letterTemplateLetterType}
                onChange={letterTypeHandler}
                error={templateLetterTypeError}
                errorProps={{ id: 'letterTemplateLetterType--error-message' }}
              >
                {alphabeticalLetterTypeList.map(([typeCode, typeName]) => (
                  <Select.Option key={`option-${typeCode}`} value={typeCode}>
                    {typeName}
                  </Select.Option>
                ))}
              </Select>
              <Select
                formGroupProps={{
                  className: classNames(...formGroupClasses),
                }}
                label={templateLanguageLabelText}
                labelProps={{ size: 's' }}
                hint={templateLanguageHintText}
                id='letterTemplateLanguage'
                defaultValue={letterTemplateLanguage}
                onChange={letterLanguageHandler}
                error={templateLanguageError}
                errorProps={{ id: 'letterTemplateLanguage--error-message' }}
                data-testid='language-select'
              >
                {alphabeticalLanguageList.map(([langCode, langMetadata]) => (
                  <Select.Option key={`option-${langCode}`} value={langCode}>
                    {langMetadata.name}
                  </Select.Option>
                ))}
              </Select>

              {letterTemplateLanguage &&
                isRightToLeft(letterTemplateLanguage) && (
                  <WarningCallout
                    data-testid='rtl-language-warning'
                    aria-live='polite'
                  >
                    <WarningCallout.Label>
                      {rtlWarning.heading}
                    </WarningCallout.Label>
                    <p>{rtlWarning.bodyPart1}</p>
                    <p>{rtlWarning.bodyPart2}</p>
                  </WarningCallout>
                )}

              <div
                className={classNames(
                  templatePdfError && 'nhsuk-form-group--error',
                  ...formGroupClasses
                )}
              >
                <Label htmlFor='letterTemplatePdf' size='s'>
                  {templatePdfLabelText}
                </Label>
                <HintText>{templatePdfHintText}</HintText>
                <p>
                  <a
                    href={templatePdfGuidanceLink}
                    data-testid='pdf-guidance-link'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {templatePdfGuidanceLinkText}
                  </a>
                </p>
                <FileUpload
                  accept='application/pdf'
                  id='letterTemplatePdf'
                  error={templatePdfError}
                />
              </div>
              <div
                className={classNames(
                  templateCsvError && 'nhsuk-form-group--error',
                  ...formGroupClasses
                )}
              >
                <Label htmlFor='letterTemplateCsv' size='s'>
                  {templateCsvLabelText}
                </Label>
                <HintText>{templateCsvHintText}</HintText>
                <p>
                  <a
                    href={templateCsvGuidanceLink}
                    data-testid='csv-guidance-link'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {templateCsvGuidanceLinkText}
                  </a>
                </p>
                <FileUpload
                  accept='text/csv'
                  id='letterTemplateCsv'
                  error={templateCsvError}
                />
              </div>
              <NHSNotifyButton
                data-testid='submit-button'
                id='upload-letter-template-submit-button'
              >
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
};
