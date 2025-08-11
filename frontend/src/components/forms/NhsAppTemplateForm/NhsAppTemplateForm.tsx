'use client';

import { FC, useActionState, useState } from 'react';
import {
  TextInput,
  HintText,
  Label,
  Textarea,
  BackLink,
} from 'nhsuk-react-components';
import {
  $CreateNhsAppTemplateSchema,
  processFormActions,
} from '@forms/NhsAppTemplateForm/server-action';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import {
  CreateUpdateNHSAppTemplate,
  ErrorState,
  NHSAppTemplate,
  PageComponentProps,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { JsEnabled } from '@hooks/js-enabled/JsEnabled';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import classNames from 'classnames';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

export const NhsAppTemplateForm: FC<
  PageComponentProps<NHSAppTemplate | CreateUpdateNHSAppTemplate>
> = ({ initialState }) => {
  const {
    pageHeadingSuffix,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateMessageLabelText,
    templateNameHintText,
    backLinkText,
  } = content.components.templateFormNhsApp;

  const [state, action] = useActionState(processFormActions, initialState);

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($CreateNhsAppTemplateSchema, setErrorState);

  const [nhsAppTemplateMessage, nhsAppMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const [nhsAppTemplateName, nhsAppTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const templateNameError =
    errorState?.fieldErrors?.nhsAppTemplateName?.join(', ');

  const templateMessageError =
    errorState?.fieldErrors?.nhsAppTemplateMessage?.join(', ');

  const editMode = 'id' in initialState;

  return (
    <>
      {editMode ? null : (
        <Link href='/choose-a-template-type' passHref legacyBehavior>
          <BackLink>{backLinkText}</BackLink>
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
              formId='create-nhs-app-template'
              formAttributes={{ onSubmit: formValidate }}
            >
              <div
                className={classNames(
                  'nhsuk-form-group',
                  'nhsuk-u-margin-bottom-8',
                  templateNameError && 'nhsuk-form-group--error'
                )}
              >
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
              <div className='nhsuk-form-group nhsuk-u-margin-bottom-6'>
                <Textarea
                  label={templateMessageLabelText}
                  labelProps={{ size: 's' }}
                  id='nhsAppTemplateMessage'
                  maxLength={5000}
                  rows={12}
                  onChange={nhsAppMessageHandler}
                  defaultValue={nhsAppTemplateMessage}
                  error={templateMessageError}
                  errorProps={{ id: 'nhsAppTemplateMessage--error-message' }}
                  autoComplete='off'
                />
                <JsEnabled>
                  <MarkdownContent
                    id='character-count'
                    content={characterCountText}
                    variables={{ characters: nhsAppTemplateMessage.length }}
                  />
                </JsEnabled>
              </div>
              <NHSNotifyButton
                id='create-nhs-app-template-submit-button'
                data-testid='submit-button'
              >
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
          <aside className='nhsuk-grid-column-one-third'>
            <Personalisation />
            <MessageFormatting templateType='NHS_APP' />
            <ChannelGuidance template='NHS_APP' />
          </aside>
        </div>
      </NHSNotifyMain>
    </>
  );
};
