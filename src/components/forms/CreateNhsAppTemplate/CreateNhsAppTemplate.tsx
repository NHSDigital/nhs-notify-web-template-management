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
import { createNhsAppTemplateAction } from '@forms/CreateNhsAppTemplate/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { NameYourTemplate } from '@molecules/NameYourTemplate/NameYourTemplate';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { PageComponentProps } from '@utils/types';
import { createNhsAppTemplatePageContent } from '@content/content';
import { useRouter } from 'next/navigation';

export const CreateNhsAppTemplate: FC<PageComponentProps> = ({
  initialState,
}) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateNameHintText,
  } = createNhsAppTemplatePageContent;
  const [state, action] = useFormState(
    createNhsAppTemplateAction,
    initialState
  );
  const router = useRouter();

  if (state.redirect) {
    router.push(state.redirect);
  }

  const [templateName, setTemplateName] = useState(state.nhsAppTemplateName);
  const [templateMessage, setTemplateMessage] = useState(
    state.nhsAppTemplateMessage
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
    state.validationError?.fieldErrors.nhsAppTemplateName?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton
        formId='create-nhs-app-template-back'
        action={action}
      >
        <input type='hidden' name='nhsAppTemplateName' value={templateName} />
        <input
          type='hidden'
          name='nhsAppTemplateMessage'
          value={templateMessage}
        />
      </NHSNotifyBackButton>
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyFormWrapper action={action} formId='create-nhs-app-template'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='nhsAppTemplateName'>{templateNameLabelText}</Label>
            <HintText>{templateNameHintText}</HintText>
            <NameYourTemplate />
            <TextInput
              id='nhsAppTemplateName'
              onChange={templateNameHandler}
              value={templateName}
              error={templateNameError}
              errorProps={{ id: 'nhsAppTemplateName-error-message' }}
            />
          </div>
          <Textarea
            label='Message'
            id='nhsAppTemplateMessage'
            maxLength={5000}
            rows={10}
            onChange={templateMessageHandler}
            value={templateMessage}
            error={state.validationError?.fieldErrors.nhsAppTemplateMessage?.join(
              ', '
            )}
            errorProps={{ id: 'nhsAppTemplateMessage-error-message' }}
          />
          <p style={jsEnabledStyle}>
            {templateMessage.length}
            {characterCountText}
          </p>
          <Button type='submit' id='create-nhs-app-template-submit-button'>
            {buttonText}
          </Button>
        </NHSNotifyFormWrapper>
      </div>
      <div className='nhsuk-grid-column-one-third'>
        <Personalisation />
        <MessageFormatting template='APP' />
      </div>
    </div>
  );
};
