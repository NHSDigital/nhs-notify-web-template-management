'use client';

import { FC } from 'react';
import { useFormState } from 'react-dom';
import {
  TextInput,
  HintText,
  Label,
  Textarea,
  Button,
  BackLink,
} from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { processFormActions } from '@forms/NhsAppTemplateForm/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { NHSAppTemplate, PageComponentProps, Draft } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { createNhsAppTemplatePageContent } from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { useJsEnabledStyle } from '@hooks/use-js-enabled-style.hook';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';

export const NhsAppTemplateForm: FC<
  PageComponentProps<NHSAppTemplate | Draft<NHSAppTemplate>>
> = ({ initialState }) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateMessageLabelText,
    templateNameHintText,
  } = createNhsAppTemplatePageContent;
  const [state, action] = useFormState(processFormActions, initialState);

  const [nhsAppTemplateMessage, nhsAppMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const [nhsAppTemplateName, nhsAppTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const templateNameError =
    state.validationError?.fieldErrors.nhsAppTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.nhsAppTemplateMessage?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <BackLink
        href={`${getBasePath()}/choose-a-template-type`}
        className='nhsuk-u-margin-bottom-5 nhsuk-u-margin-left-3'
      >
        Go back
      </BackLink>
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyFormWrapper action={action} formId='create-nhs-app-template'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='nhsAppTemplateName' size='s'>
              {templateNameLabelText}
            </Label>
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
            labelProps={{ size: 's' }}
            id='nhsAppTemplateMessage'
            maxLength={5000}
            rows={10}
            onChange={nhsAppMessageHandler}
            defaultValue={nhsAppTemplateMessage}
            error={templateMessageError}
            errorProps={{ id: 'nhsAppTemplateMessage-error-message' }}
          />
          <p style={useJsEnabledStyle()} id='character-count'>
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
        <MessageFormatting template={TemplateType.NHS_APP} />
        <ChannelGuidance template={TemplateType.NHS_APP} />
      </div>
    </div>
  );
};
