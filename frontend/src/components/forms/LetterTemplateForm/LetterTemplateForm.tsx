'use client';

import { FC, useActionState, useState } from 'react';
import classNames from 'classnames';
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
  alphabeticalLanguageList,
  alphabeticalLetterTypeList,
  CreateUpdateLetterTemplate,
  FormErrorState,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import FileUpload from '@atoms/FileUpload/FileUpload';
import { getBasePath } from '@utils/get-base-path';
import { $CreateUpdateLetterTemplateForm } from './form-schema';

export const LetterTemplateForm: FC<
  PageComponentProps<CreateUpdateLetterTemplate>
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
  const [validationError, setValidationError] = useState<
    FormErrorState | undefined
  >(state.validationError);

  const [letterTemplateName, letterTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [letterTemplateLetterType, letterTypeHandler] =
    useTextInput<HTMLSelectElement>(state.letterType);

  const [letterTemplateLanguage, letterLanguageHandler] =
    useTextInput<HTMLSelectElement>(state.language);

  const templateNameError =
    validationError?.fieldErrors.letterTemplateName?.join(', ');

  const templateLetterTypeError =
    validationError?.fieldErrors.letterTemplateLetterType?.join(', ');

  const templateLanguageError =
    validationError?.fieldErrors.letterTemplateLanguage?.join(', ');

  const templatePdfError =
    validationError?.fieldErrors.letterTemplatePdf?.join(', ');

  const templateCsvError =
    validationError?.fieldErrors.letterTemplateCsv?.join(', ');

  const validateForm = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    const validationResult = $CreateUpdateLetterTemplateForm.safeParse(data);
    if (!validationResult.success) {
      event.preventDefault();
      setValidationError(validationResult.error.flatten());
    }
  };

  const formGroupClasses = [
    'nhsuk-u-margin-bottom-6',
    'nhsuk-u-padding-top-2',
    'nhsuk-u-padding-bottom-2',
  ];

  return (
    <>
      <BackLink href={`${getBasePath()}/choose-a-template-type`}>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <ZodErrorSummary
              errorHeading={errorHeading}
              state={{ validationError }}
            />
            <NHSNotifyFormWrapper
              action={action}
              formId='create-letter-template'
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
              >
                {alphabeticalLanguageList.map(([langCode, langName]) => (
                  <Select.Option key={`option-${langCode}`} value={langCode}>
                    {langName}
                  </Select.Option>
                ))}
              </Select>
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
                id='create-letter-template-submit-button'
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
