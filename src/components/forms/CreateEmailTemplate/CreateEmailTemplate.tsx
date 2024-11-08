'use client';

// we need this to be a client component because nhsuk-react-components uses client-only react features

import { FC } from 'react';
import { useFormState } from 'react-dom';
import {
  TextInput,
  HintText,
  Label,
  Textarea,
  Button,
} from 'nhsuk-react-components';
import { processFormActions } from '@forms/CreateEmailTemplate/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { PageComponentProps, Template } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { createEmailTemplatePageContent } from '@content/content';
import { FormSection } from '@molecules/FormSection/FormSection';
import { useTextInput } from '@hooks/use-text-input.hook';

export const CreateEmailTemplate: FC<PageComponentProps<Template>> = ({
  initialState,
}) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    templateNameLabelText,
    templateSubjectLineLabelText,
    templateMessageLabelText,
    templateNameHintText,
  } = createEmailTemplatePageContent;

  const [state, action] = useFormState(processFormActions, initialState);

  const [emailTemplateName, emailTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.EMAIL?.name ?? '');

  const [emailTemplateSubjectLine, emailTemplateSubjectLineHandler] =
    useTextInput<HTMLInputElement>(state.EMAIL?.subject ?? '');

  const [emailTemplateMessage, emailTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.EMAIL?.message ?? '');

  const templateNameError =
    state.validationError?.fieldErrors.emailTemplateName?.join(', ');

  const templateSubjectLineError =
    state.validationError?.fieldErrors.emailTemplateSubjectLine?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.emailTemplateMessage?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton formId='create-email-template-back' action={action}>
        <input
          type='hidden'
          name='emailTemplateName'
          value={emailTemplateName}
        />
        <input
          type='hidden'
          name='emailTemplateSubjectLine'
          value={emailTemplateSubjectLine}
        />
        <input
          type='hidden'
          name='emailTemplateMessage'
          value={emailTemplateMessage}
        />
      </NHSNotifyBackButton>
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyFormWrapper action={action} formId='create-email-template'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>

          <FormSection>
            <div className={templateNameError && 'nhsuk-form-group--error'}>
              <Label htmlFor='emailTemplateName'>{templateNameLabelText}</Label>
              <HintText>{templateNameHintText}</HintText>
              <TemplateNameGuidance template={TemplateType.EMAIL} />
              <TextInput
                id='emailTemplateName'
                onChange={emailTemplateNameHandler}
                value={emailTemplateName}
                error={templateNameError}
                errorProps={{ id: 'emailTemplateName-error-message' }}
                data-testid='emailTemplateName-input'
              />
            </div>
          </FormSection>

          <FormSection>
            <div
              className={templateSubjectLineError && 'nhsuk-form-group--error'}
            >
              <Label htmlFor='emailTemplateSubjectLine'>
                {templateSubjectLineLabelText}
              </Label>
              <TextInput
                id='emailTemplateSubjectLine'
                onChange={emailTemplateSubjectLineHandler}
                value={emailTemplateSubjectLine}
                error={templateSubjectLineError}
                errorProps={{ id: 'emailTemplateSubjectLine-error-message' }}
                data-testid='emailTemplateSubjectLine-input'
              />
            </div>

            <Textarea
              label={templateMessageLabelText}
              id='emailTemplateMessage'
              rows={10}
              onChange={emailTemplateMessageHandler}
              value={emailTemplateMessage}
              error={templateMessageError}
              errorProps={{ id: 'emailTemplateMessage-error-message' }}
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
      </div>
    </div>
  );
};
