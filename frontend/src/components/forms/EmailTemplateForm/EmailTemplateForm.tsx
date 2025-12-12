'use client';

import { FC, useActionState, useState } from 'react';
import { TextInput, HintText, Label, Textarea } from 'nhsuk-react-components';
import {
  $EmailTemplateFormSchema,
  processFormActions,
} from '@forms/EmailTemplateForm/server-action';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import {
  CreateUpdateEmailTemplate,
  EmailTemplate,
  ErrorState,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import classNames from 'classnames';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export const EmailTemplateForm: FC<
  PageComponentProps<CreateUpdateEmailTemplate | EmailTemplate>
> = ({ initialState }) => {
  const {
    pageHeadingSuffix,
    buttonText,
    templateNameLabelText,
    templateSubjectLineLabelText,
    templateMessageLabelText,
    templateNameHintText,
    backLinkText,
  } = content.components.templateFormEmail;

  const [state, action] = useActionState(processFormActions, initialState);

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($EmailTemplateFormSchema, setErrorState);

  const [emailTemplateName, emailTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [emailTemplateSubjectLine, emailTemplateSubjectLineHandler] =
    useTextInput<HTMLInputElement>(state.subject);

  const [emailTemplateMessage, emailTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const templateNameError =
    errorState?.fieldErrors?.emailTemplateName?.join(', ');

  const templateSubjectLineError =
    errorState?.fieldErrors?.emailTemplateSubjectLine?.join(', ');

  const templateMessageError =
    errorState?.fieldErrors?.emailTemplateMessage?.join(', ');

  const editMode = 'id' in initialState;

  return (
    <>
      {editMode ? null : (
        <Link href='/choose-a-template-type' passHref legacyBehavior>
          <NotifyBackLink>{backLinkText}</NotifyBackLink>
        </Link>
      )}
      <NHSNotifyMain>
        <div className='nhsuk-grid-row nhsuk-grid-column-two-thirds'>
          <NhsNotifyErrorSummary errorState={errorState} />
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {editMode ? 'Edit ' : 'Create '}
            {pageHeadingSuffix}
          </h1>
        </div>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <NHSNotifyFormWrapper
              action={action}
              formId='create-email-template'
              formAttributes={{ onSubmit: formValidate }}
            >
              <div
                className={classNames(
                  'nhsuk-form-group',
                  'nhsuk-u-margin-bottom-8',
                  templateNameError && 'nhsuk-form-group--error'
                )}
              >
                <Label htmlFor='emailTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance template={'EMAIL'} />
                <TextInput
                  id='emailTemplateName'
                  onChange={emailTemplateNameHandler}
                  value={emailTemplateName}
                  error={templateNameError}
                  errorProps={{ id: 'emailTemplateName--error-message' }}
                  data-testid='emailTemplateName-input'
                  autoComplete='off'
                />
              </div>
              <div
                className={classNames(
                  'nhsuk-form-group',
                  'nhsuk-u-margin-bottom-8',
                  templateSubjectLineError && 'nhsuk-form-group--error'
                )}
              >
                <Label htmlFor='emailTemplateSubjectLine' size='s'>
                  {templateSubjectLineLabelText}
                </Label>
                <TextInput
                  id='emailTemplateSubjectLine'
                  onChange={emailTemplateSubjectLineHandler}
                  value={emailTemplateSubjectLine}
                  error={templateSubjectLineError}
                  errorProps={{
                    id: 'emailTemplateSubjectLine--error-message',
                  }}
                  data-testid='emailTemplateSubjectLine-input'
                  autoComplete='off'
                />
              </div>
              <div className='nhsuk-form-group nhsuk-u-margin-bottom-8'>
                <Textarea
                  label={templateMessageLabelText}
                  labelProps={{ size: 's' }}
                  id='emailTemplateMessage'
                  rows={12}
                  onChange={emailTemplateMessageHandler}
                  value={emailTemplateMessage}
                  error={templateMessageError}
                  errorProps={{ id: 'emailTemplateMessage--error-message' }}
                  data-testid='emailTemplateMessage-input'
                  autoComplete='off'
                />
              </div>
              <NHSNotifyButton
                type='submit'
                data-testid='submit-button'
                id='create-email-template-submit-button'
              >
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
          <aside className='nhsuk-grid-column-one-third'>
            <Personalisation />
            <MessageFormatting templateType='EMAIL' />
            <ChannelGuidance template='EMAIL' />
          </aside>
        </div>
      </NHSNotifyMain>
    </>
  );
};
