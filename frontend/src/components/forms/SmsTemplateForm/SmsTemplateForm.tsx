'use client';

import { JsEnabled } from '@hooks/js-enabled/JsEnabled';
import { useTextInput } from '@hooks/use-text-input.hook';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import { HintText, Label, TextInput } from 'nhsuk-react-components';
import {
  CreateUpdateSMSTemplate,
  ErrorState,
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { FC, useActionState, useState } from 'react';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import content from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { $CreateSmsTemplateSchema, processFormActions } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import classNames from 'classnames';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import NHSNotifyTextArea from '@atoms/NHSNotifyTextArea/NHSNotifyTextArea';
import { renderErrorItem } from '@molecules/NhsNotifyErrorItem/NHSNotifyErrorItem';

export const SmsTemplateForm: FC<
  PageComponentProps<SMSTemplate | CreateUpdateSMSTemplate>
> = ({ initialState }) => {
  const [state, action] = useActionState(processFormActions, initialState);

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($CreateSmsTemplateSchema, setErrorState);

  const [smsTemplateName, smsTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [smsTemplateMessage, smsTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const templateNameError =
    errorState?.fieldErrors?.smsTemplateName?.join(', ');

  const hasTemplateMessageError =
    (errorState?.fieldErrors?.smsTemplateMessage?.length ?? 0) > 0;
  const templateMessageError = hasTemplateMessageError ? (
    <>
      {errorState?.fieldErrors?.smsTemplateMessage.map((error) =>
        renderErrorItem(error)
      )}
    </>
  ) : undefined;

  const editMode = 'id' in initialState;

  const {
    backLinkText,
    buttonText,
    pageHeadingSuffix,
    templateMessageLabelText,
    templateMessageFooterText,
    templateNameHintText,
    templateNameLabelText,
  } = content.components.templateFormSms;

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
          <h1 data-testid='page-heading'>
            {editMode ? 'Edit ' : 'Create '}
            {pageHeadingSuffix}
          </h1>
        </div>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <NHSNotifyFormWrapper
              action={action}
              formId='create-sms-template'
              formAttributes={{ onSubmit: formValidate }}
            >
              <div
                className={classNames(
                  'nhsuk-form-group',
                  'nhsuk-u-margin-bottom-8',
                  templateNameError && 'nhsuk-form-group--error'
                )}
              >
                <Label htmlFor='smsTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance templateType='SMS' />
                <TextInput
                  id='smsTemplateName'
                  defaultValue={smsTemplateName}
                  onChange={smsTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'smsTemplateName--error-message' }}
                  autoComplete='off'
                />
              </div>
              <div className='nhsuk-form-group nhsuk-u-margin-bottom-6'>
                <NHSNotifyTextArea
                  label={templateMessageLabelText}
                  id='smsTemplateMessage'
                  textAreaProps={{
                    rows: 12,
                    onChange: smsTemplateMessageHandler,
                    defaultValue: smsTemplateMessage,
                    autoComplete: 'off',
                    maxLength: MAX_SMS_CHARACTER_LENGTH,
                  }}
                  error={templateMessageError}
                />
                <JsEnabled>
                  <ContentRenderer
                    content={templateMessageFooterText}
                    variables={{
                      characters: smsTemplateMessage.length,
                      count: calculateHowManySmsMessages(
                        Number(smsTemplateMessage.length)
                      ),
                    }}
                  />
                </JsEnabled>
              </div>
              <NHSNotifyButton
                id='create-sms-template-submit-button'
                data-testid='submit-button'
              >
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
          <aside className='nhsuk-grid-column-one-third'>
            <Personalisation />
            <MessageFormatting templateType='SMS' />
            <ChannelGuidance template='SMS' />
          </aside>
        </div>
      </NHSNotifyMain>
    </>
  );
};
