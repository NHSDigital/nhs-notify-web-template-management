'use client';

import { JsEnabled } from '@hooks/js-enabled/JsEnabled';
import { useTextInput } from '@hooks/use-text-input.hook';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import {
  HintText,
  Label,
  Textarea,
  TextInput,
  BackLink,
} from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import {
  Draft,
  PageComponentProps,
  SMSTemplate,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { FC, useActionState } from 'react';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import content from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { processFormActions } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';
import PageTitle from '@hooks/page-title.hook';

export const SmsTemplateForm: FC<
  PageComponentProps<SMSTemplate | Draft<SMSTemplate>>
> = ({ initialState }) => {
  const [state, action] = useActionState(processFormActions, initialState);

  const [smsTemplateName, smsTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [smsTemplateMessage, smsTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const templateNameError =
    state.validationError?.fieldErrors.smsTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.smsTemplateMessage?.join(', ');

  const editMode = 'id' in initialState;

  const {
    pageTitle,
    backLinkText,
    buttonText,
    errorHeading,
    pageHeadingSuffix,
    smsCountText1,
    smsCountText2,
    smsPricingLink,
    smsPricingText,
    templateMessageLabelText,
    templateNameHintText,
    templateNameLabelText,
  } = content.components.templateFormSms;

  PageTitle(pageTitle);

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
            <h1 data-testid='page-heading'>
              {editMode ? 'Edit ' : 'Create '}
              {pageHeadingSuffix}
            </h1>
            <NHSNotifyFormWrapper action={action} formId='create-sms-template'>
              <div className={templateNameError && 'nhsuk-form-group--error'}>
                <Label htmlFor='smsTemplateName' size='s'>
                  {templateNameLabelText}
                </Label>
                <HintText>{templateNameHintText}</HintText>
                <TemplateNameGuidance template='SMS' />
                <TextInput
                  id='smsTemplateName'
                  defaultValue={smsTemplateName}
                  onChange={smsTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'smsTemplateName--error-message' }}
                  autoComplete='off'
                />
              </div>
              <Textarea
                id='smsTemplateMessage'
                label={templateMessageLabelText}
                labelProps={{ size: 's' }}
                defaultValue={smsTemplateMessage}
                onChange={smsTemplateMessageHandler}
                maxLength={MAX_SMS_CHARACTER_LENGTH}
                rows={10}
                error={templateMessageError}
                errorProps={{ id: 'smsTemplateMessage--error-message' }}
                autoComplete='off'
              />
              <JsEnabled>
                <p className='nhsuk-u-margin-bottom-0' id='character-count'>
                  {smsTemplateMessage.length} characters
                </p>
                <p>
                  {smsCountText1}
                  {calculateHowManySmsMessages(
                    Number(smsTemplateMessage.length)
                  )}
                  {smsCountText2}
                </p>
              </JsEnabled>
              <p>
                <a
                  href={smsPricingLink}
                  data-testid='sms-pricing-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {smsPricingText}
                </a>
              </p>
              <NHSNotifyButton id='create-sms-template-submit-button'>
                {buttonText}
              </NHSNotifyButton>
            </NHSNotifyFormWrapper>
          </div>
          <aside className='nhsuk-grid-column-one-third'>
            <Personalisation />
            <MessageFormatting template={TemplateType.SMS} />
            <ChannelGuidance template={TemplateType.SMS} />
          </aside>
        </div>
      </NHSNotifyMain>
    </>
  );
};
