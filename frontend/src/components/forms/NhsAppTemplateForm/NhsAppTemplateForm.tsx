'use client';

import { FC, useActionState } from 'react';
import {
  TextInput,
  HintText,
  Label,
  Textarea,
  BackLink,
} from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { processFormActions } from '@forms/NhsAppTemplateForm/server-action';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import {
  CreateNHSAppTemplate,
  NHSAppTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { JsEnabled } from '@hooks/js-enabled/JsEnabled';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';

export const NhsAppTemplateForm: FC<
  PageComponentProps<NHSAppTemplate | CreateNHSAppTemplate>
> = ({ initialState }) => {
  const {
    pageHeadingSuffix,
    errorHeading,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateMessageLabelText,
    templateNameHintText,
    backLinkText,
  } = content.components.templateFormNhsApp;

  const [state, action] = useActionState(processFormActions, initialState);

  const [nhsAppTemplateMessage, nhsAppMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const [nhsAppTemplateName, nhsAppTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const templateNameError =
    state.validationError?.fieldErrors.nhsAppTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.nhsAppTemplateMessage?.join(', ');

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
              formId='create-nhs-app-template'
            >
              <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
                {editMode ? 'Edit ' : 'Create '}
                {pageHeadingSuffix}
              </h1>
              <div className={templateNameError && 'nhsuk-form-group--error'}>
                <Label htmlFor='nhsAppTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance template={'NHS_APP'} />
                <TextInput
                  id='nhsAppTemplateName'
                  defaultValue={nhsAppTemplateName}
                  onChange={nhsAppTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'nhsAppTemplateName--error-message' }}
                  autoComplete='off'
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
                errorProps={{ id: 'nhsAppTemplateMessage--error-message' }}
                autoComplete='off'
              />
              <JsEnabled>
                <p id='character-count'>
                  {nhsAppTemplateMessage.length}
                  {characterCountText}
                </p>
              </JsEnabled>
              <NHSNotifyButton id='create-nhs-app-template-submit-button'>
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
          <aside className='nhsuk-grid-column-one-third'>
            <Personalisation />
            <MessageFormatting template='NHS_APP' />
            <ChannelGuidance template='NHS_APP' />
          </aside>
        </div>
      </NHSNotifyMain>
    </>
  );
};
