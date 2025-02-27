'use client';

import { FC, useActionState } from 'react';
import {
  TextInput,
  HintText,
  Label,
  BackLink,
  Select,
} from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { processFormActions } from '@forms/LetterTemplateForm/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import {
  Draft,
  LetterTemplate,
  PageComponentProps,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { Language, LetterType } from 'nhs-notify-backend-client';

export const LetterTemplateForm: FC<
  PageComponentProps<LetterTemplate | Draft<LetterTemplate>>
> = ({ initialState }) => {
  const {
    pageHeadingSuffix,
    errorHeading,
    buttonText,
    templateNameLabelText,
    templateNameHintText,
    backLinkText,
  } = content.components.templateFormLetter;

  const [state, action] = useActionState(processFormActions, initialState);

  const [letterTemplateName, letterTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [letterType, letterTypeHandler] = useTextInput<HTMLOptionElement>(
    state.letterType || LetterType.STANDARD
  );

  const [letterLanguage, letterLanguageHandler] =
    useTextInput<HTMLOptionElement>(state.language || Language.ENGLISH);

  const templateNameError =
    state.validationError?.fieldErrors.letterTemplateName?.join(', ');

  const editMode = 'id' in initialState;

  return (
    <>
      {editMode ? null : (
        <BackLink href={`${getBasePath()}/choose-a-template-type`}>
          {backLinkText}
        </BackLink>
      )}
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <ZodErrorSummary errorHeading={errorHeading} state={state} />
            <NHSNotifyFormWrapper
              action={action}
              formId='create-letter-template'
            >
              <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
                {editMode ? 'Edit ' : 'Create '}
                {pageHeadingSuffix}
              </h1>
              <div className={templateNameError && 'nhsuk-form-group--error'}>
                <Label htmlFor='letterTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance template={TemplateType.LETTER} />
                <TextInput
                  id='letterTemplateName'
                  defaultValue={letterTemplateName}
                  onChange={letterTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'letterTemplateName--error-message' }}
                />
              </div>
              <Select
                hint='Choose the type of letter template you are uploading'
                label='Letter type'
                id='letterType'
              >
                {Object.values(LetterType).map((type) => (
                  <Select.Option
                    defaultValue={letterType}
                    onChange={letterTypeHandler}
                    key={type}
                    value={type}
                  >
                    {type}
                  </Select.Option>
                ))}
              </Select>
              <Select
                hint='Choose the language of this letter template'
                label='Additional language'
                id='letterLanguage'
              >
                {Object.values(Language).map((language) => (
                  <Select.Option
                    defaultValue={letterLanguage}
                    onChange={letterLanguageHandler}
                    key={language}
                    value={language}
                  >
                    {language}
                  </Select.Option>
                ))}
              </Select>
              <div>
                <span>Upload pdf </span>
                <input type='file' name='pdf' accept='application/pdf' />
              </div>
              <div>
                <span>Upload csv </span>
                <input type='file' name='csv' accept='text/csv' />
              </div>
              <NHSNotifyButton id='create-nhs-app-template-submit-button'>
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
};
