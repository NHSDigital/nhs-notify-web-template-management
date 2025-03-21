'use client';

import { FC, useActionState } from 'react';
import {
  TextInput,
  HintText,
  Label,
  Select,
  BackLink,
} from 'nhsuk-react-components';
import { processFormActions } from '@forms/LetterTemplateForm/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import {
  CreateLetterTemplate,
  languageMapping,
  letterTypeMapping,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { LANGUAGE_LIST, LETTER_TYPE_LIST } from 'nhs-notify-backend-client';
import FileUpload from '@atoms/FileUpload/FileUpload';
import { getBasePath } from '@utils/get-base-path';

export const LetterTemplateForm: FC<
  PageComponentProps<CreateLetterTemplate>
> = ({ initialState }) => {
  const {
    backLinkText,
    errorHeading,
    pageHeading,
    templateNameLabelText,
    templateNameHintText,
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
  } = content.components.templateFormLetter;

  const [state, action] = useActionState(processFormActions, initialState);

  const [letterTemplateName, letterTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [letterTemplateLetterType, letterTypeHandler] =
    useTextInput<HTMLSelectElement>(state.letterType);

  const [letterTemplateLanguage, letterLanguageHandler] =
    useTextInput<HTMLSelectElement>(state.language);

  const templateNameError =
    state.validationError?.fieldErrors.letterTemplateName?.join(', ');

  const templateLetterTypeError =
    state.validationError?.fieldErrors.letterTemplateLetterType?.join(', ');

  const templateLanguageError =
    state.validationError?.fieldErrors.letterTemplateLanguage?.join(', ');

  const templatePdfError =
    state.validationError?.fieldErrors.letterTemplatePdf?.join(', ');

  const templateCsvError =
    state.validationError?.fieldErrors.letterTemplateCsv?.join(', ');

  return (
    <>
      <BackLink href={`${getBasePath()}/choose-a-template-type`}>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <ZodErrorSummary errorHeading={errorHeading} state={state} />
            <NHSNotifyFormWrapper
              action={action}
              formId='create-letter-template'
            >
              <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
                {pageHeading}
              </h1>
              <div className={templateNameError && 'nhsuk-form-group--error'}>
                <Label htmlFor='letterTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance template={'LETTER'} />
                <TextInput
                  id='letterTemplateName'
                  defaultValue={letterTemplateName}
                  onChange={letterTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'letterTemplateName--error-message' }}
                />
              </div>
              <Select
                label={templateTypeLabelText}
                hint={templateTypeHintText}
                id='letterTemplateLetterType'
                defaultValue={letterTemplateLetterType}
                onChange={letterTypeHandler}
                error={templateLetterTypeError}
                errorProps={{ id: 'letterTemplateLetterType--error-message' }}
              >
                {LETTER_TYPE_LIST.map((type) => (
                  <Select.Option key={`option-${type}`} value={type}>
                    {letterTypeMapping(type)}
                  </Select.Option>
                ))}
              </Select>
              <Select
                label={templateLanguageLabelText}
                hint={templateLanguageHintText}
                id='letterTemplateLanguage'
                defaultValue={letterTemplateLanguage}
                onChange={letterLanguageHandler}
                error={templateLanguageError}
                errorProps={{ id: 'letterTemplateLanguage--error-message' }}
              >
                {LANGUAGE_LIST.map((language) => (
                  <Select.Option key={`option-${language}`} value={language}>
                    {languageMapping(language)}
                  </Select.Option>
                ))}
              </Select>
              <div className={templatePdfError && 'nhsuk-form-group--error'}>
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
              <div className={templateCsvError && 'nhsuk-form-group--error'}>
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
              <NHSNotifyButton id='create-letter-template-submit-button'>
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
};
