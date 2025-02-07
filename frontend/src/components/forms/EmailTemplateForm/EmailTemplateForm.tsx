'use client';

import { FC, useActionState } from 'react';
import {
  TextInput,
  HintText,
  Label,
  Textarea,
  Button,
  BackLink,
} from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { processFormActions } from '@forms/EmailTemplateForm/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import {
  Draft,
  EmailTemplate,
  PageComponentProps,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { createEmailTemplatePageContent } from '@content/content';
import { FormSection } from '@molecules/FormSection/FormSection';
import { useTextInput } from '@hooks/use-text-input.hook';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';

export const EmailTemplateForm: FC<
  PageComponentProps<EmailTemplate | Draft<EmailTemplate>>
> = ({ initialState }) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    templateNameLabelText,
    templateSubjectLineLabelText,
    templateMessageLabelText,
    templateNameHintText,
    backLinkText,
  } = createEmailTemplatePageContent;

  const [state, action] = useActionState(processFormActions, initialState);

  const [emailTemplateName, emailTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [emailTemplateSubjectLine, emailTemplateSubjectLineHandler] =
    useTextInput<HTMLInputElement>(state.subject);

  const [emailTemplateMessage, emailTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const templateNameError =
    state.validationError?.fieldErrors.emailTemplateName?.join(', ');

  const templateSubjectLineError =
    state.validationError?.fieldErrors.emailTemplateSubjectLine?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.emailTemplateMessage?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      {'id' in initialState ? null : (
        <BackLink
          href={`${getBasePath()}/choose-a-template-type`}
          className='nhsuk-u-margin-bottom-5 nhsuk-u-margin-left-3'
        >
          {backLinkText}
        </BackLink>
      )}
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyFormWrapper action={action} formId='create-email-template'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>

          <FormSection>
            <div className={templateNameError && 'nhsuk-form-group--error'}>
              <Label htmlFor='emailTemplateName' size='s'>
                {templateNameLabelText}
              </Label>
              <HintText>{templateNameHintText}</HintText>
              <TemplateNameGuidance template={TemplateType.EMAIL} />
              <TextInput
                id='emailTemplateName'
                onChange={emailTemplateNameHandler}
                value={emailTemplateName}
                error={templateNameError}
                errorProps={{ id: 'emailTemplateName--error-message' }}
                data-testid='emailTemplateName-input'
              />
            </div>
          </FormSection>

          <FormSection>
            <div
              className={templateSubjectLineError && 'nhsuk-form-group--error'}
            >
              <Label htmlFor='emailTemplateSubjectLine' size='s'>
                {templateSubjectLineLabelText}
              </Label>
              <TextInput
                id='emailTemplateSubjectLine'
                onChange={emailTemplateSubjectLineHandler}
                value={emailTemplateSubjectLine}
                error={templateSubjectLineError}
                errorProps={{ id: 'emailTemplateSubjectLine--error-message' }}
                data-testid='emailTemplateSubjectLine-input'
              />
            </div>

            <Textarea
              label={templateMessageLabelText}
              labelProps={{ size: 's' }}
              id='emailTemplateMessage'
              rows={10}
              onChange={emailTemplateMessageHandler}
              value={emailTemplateMessage}
              error={templateMessageError}
              errorProps={{ id: 'emailTemplateMessage--error-message' }}
              data-testid='emailTemplateMessage-input'
            />
          </FormSection>
          <Button type='submit' id='create-email-template-submit-button'>
            {buttonText}
          </Button>
        </NHSNotifyFormWrapper>
      </div>
      <div className='nhsuk-grid-column-one-third'>
        <Personalisation />
        <MessageFormatting template={TemplateType.EMAIL} />
        <ChannelGuidance template={TemplateType.EMAIL} />
      </div>
    </div>
  );
};
