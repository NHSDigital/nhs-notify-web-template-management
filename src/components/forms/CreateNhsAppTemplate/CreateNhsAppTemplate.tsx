'use client';

import { FC } from 'react';
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
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { PageComponentProps, TemplateType } from '@utils/types';
import { createNhsAppTemplatePageContent } from '@content/content';
import { useRouter } from 'next/navigation';
import { useTextInput } from '@hooks/use-text-input.hook';
import { useJsEnabledStyle } from '@hooks/use-js-enabled-style.hook';

export const CreateNhsAppTemplate: FC<PageComponentProps> = ({
  initialState,
}) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateMessageLabelText,
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

  const [nhsAppTemplateMessage, nhsAppMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.nhsAppTemplateMessage);

  const [nhsAppTemplateName, nhsAppTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.nhsAppTemplateName);

  const templateNameError =
    state.validationError?.fieldErrors.nhsAppTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.nhsAppTemplateMessage?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton
        formId='create-nhs-app-template-back'
        action={action}
      >
        <input
          type='hidden'
          name='nhsAppTemplateName'
          value={nhsAppTemplateName}
        />
        <input
          type='hidden'
          name='nhsAppTemplateMessage'
          value={nhsAppTemplateMessage}
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
            <TemplateNameGuidance template={TemplateType.NHS_APP} />
            <TextInput
              id='nhsAppTemplateName'
              defaultValue={nhsAppTemplateName}
              onChange={nhsAppTemplateNameHandler}
              error={templateNameError}
              errorProps={{ id: 'nhsAppTemplateName-error-message' }}
            />
          </div>
          <Textarea
            label={templateMessageLabelText}
            id='nhsAppTemplateMessage'
            maxLength={5000}
            rows={10}
            onChange={nhsAppMessageHandler}
            defaultValue={nhsAppTemplateMessage}
            error={templateMessageError}
            errorProps={{ id: 'nhsAppTemplateMessage-error-message' }}
          />
          <p style={useJsEnabledStyle()}>
            {nhsAppTemplateMessage.length}
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
