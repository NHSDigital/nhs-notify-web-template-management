'use client';

// we need this to be a client component because nhsuk-react-components uses client-only react features

import {
  CSSProperties,
  useEffect,
  FC,
  FormEventHandler,
  useState,
} from 'react';
import { useFormState } from 'react-dom';
import {
  TextInput,
  HintText,
  Label,
  Textarea,
  Button,
} from 'nhsuk-react-components';
import { createEmailTemplateAction } from '@forms/CreateEmailTemplate/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { PageComponentProps, TemplateType } from '@utils/types';
import { createEmailTemplatePageContent } from '@content/content';
import { useRouter } from 'next/navigation';

export const CreateEmailTemplate: FC<PageComponentProps> = ({
  initialState,
}) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateNameHintText,
  } = createEmailTemplatePageContent;
  const [state, action] = useFormState(createEmailTemplateAction, initialState);
  const router = useRouter();

  if (state.redirect) {
    router.push(state.redirect);
  }

  const [templateName, setTemplateName] = useState(state.emailTemplateName);
  const [templateMessage, setTemplateMessage] = useState(
    state.emailTemplateMessage
  );
  const [jsEnabledStyle, setJsEnabledStyle] = useState<
    CSSProperties | undefined
  >({ display: 'none' });

  useEffect(() => {
    setJsEnabledStyle(undefined);
  }, []);

  const templateNameHandler: FormEventHandler<HTMLInputElement> = (event) => {
    const typedEventTarget = event.target as HTMLInputElement; // it would be great if we could do this without forcing the types
    setTemplateName(typedEventTarget.value);
  };

  const templateMessageHandler: FormEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const typedEventTarget = event.target as HTMLTextAreaElement; // it would be great if we could do this without forcing the types
    setTemplateMessage(typedEventTarget.value);
  };

  const templateNameError =
    state.validationError?.fieldErrors.emailTemplateName?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton
        formId='create-email-template-back' action={action}
      >
        <input type='hidden' name='emailTemplateName' value={templateName} />
        <input
          type='hidden'
          name='emailTemplateMessage'
          value={templateMessage}
        />
      </NHSNotifyBackButton>
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyFormWrapper action={action} formId='create-email-template'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='emailTemplateName'>{templateNameLabelText}</Label>
            <HintText>{templateNameHintText}</HintText>
            <TemplateNameGuidance template={TemplateType.EMAIL} />
            <TextInput
              id='emailTemplateName'
              onChange={templateNameHandler}
              value={templateName}
              error={templateNameError}
              errorProps={{ id: 'emailTemplateName-error-message' }}
            />
          </div>
          <Textarea
            label='Message'
            id='emailTemplateMessage'
            maxLength={5000}
            rows={10}
            onChange={templateMessageHandler}
            value={templateMessage}
            error={state.validationError?.fieldErrors.emailTemplateMessage?.join(
              ', '
            )}
            errorProps={{ id: 'emailTemplateMessage-error-message' }}
          />
          <p style={jsEnabledStyle}>
            {templateMessage?.length}
            {characterCountText}
          </p>
          <Button type='submit' id='create-email-template-submit-button'>
            {buttonText}
          </Button>
        </NHSNotifyFormWrapper>
      </div>
      <div className='nhsuk-grid-column-one-third'>
        <Personalisation />
        <MessageFormatting template='EMAIL' />
      </div>
    </div>
  );
};
