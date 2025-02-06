'use client';

import { useJsEnabledStyle } from '@hooks/use-js-enabled-style.hook';
import { useTextInput } from '@hooks/use-text-input.hook';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import {
  Button,
  HintText,
  Label,
  Textarea,
  TextInput,
  BackLink,
} from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { useFormState } from 'react-dom';
import {
  Draft,
  PageComponentProps,
  SMSTemplate,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { FC } from 'react';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { createSmsTemplatePageContent as content } from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { processFormActions } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';

export const SmsTemplateForm: FC<
  PageComponentProps<SMSTemplate | Draft<SMSTemplate>>
> = ({ initialState }) => {
  const [state, action] = useFormState(processFormActions, initialState);

  const [smsTemplateName, smsTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [smsTemplateMessage, smsTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const templateNameError =
    state.validationError?.fieldErrors.smsTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.smsTemplateMessage?.join(', ');

  return (
    <>
      {'id' in initialState ? null : (
        <BackLink href={`${getBasePath()}/choose-a-template-type`}>
          {content.backLinkText}
        </BackLink>
      )}
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <ZodErrorSummary
              errorHeading={content.errorHeading}
              state={state}
            />
            <h1 data-testid='page-heading'>{content.pageHeading}</h1>
            <NHSNotifyFormWrapper action={action} formId='create-sms-template'>
              <div className={templateNameError && 'nhsuk-form-group--error'}>
                <Label htmlFor='smsTemplateName' size='s'>
                  {content.templateNameLabelText}
                </Label>
                <HintText>{content.templateNameHintText}</HintText>
                <TemplateNameGuidance template='SMS' />
                <TextInput
                  id='smsTemplateName'
                  defaultValue={smsTemplateName}
                  onChange={smsTemplateNameHandler}
                  error={templateNameError}
                  errorProps={{ id: 'smsTemplateName--error-message' }}
                />
              </div>
              <Textarea
                id='smsTemplateMessage'
                label={content.templateMessageLabelText}
                labelProps={{ size: 's' }}
                defaultValue={smsTemplateMessage}
                onChange={smsTemplateMessageHandler}
                maxLength={MAX_SMS_CHARACTER_LENGTH}
                rows={10}
                error={templateMessageError}
                errorProps={{ id: 'smsTemplateMessage--error-message' }}
              />
              <div style={useJsEnabledStyle()} id='smsMessageCharacterCount'>
                <p className='nhsuk-u-margin-bottom-0' id='character-count'>
                  {smsTemplateMessage.length} characters
                </p>
                <p>
                  {content.smsCountText1}
                  {calculateHowManySmsMessages(
                    Number(smsTemplateMessage.length)
                  )}
                  {content.smsCountText2}
                </p>
              </div>
              <p>
                <a
                  href={content.smsPricingLink}
                  data-testid='sms-pricing-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {content.smsPricingText}
                </a>
              </p>
              <Button id='create-sms-template-submit-button'>
                {content.buttonText}
              </Button>
            </NHSNotifyFormWrapper>
          </div>
          <div className='nhsuk-grid-column-one-third'>
            <Personalisation />
            <MessageFormatting template={TemplateType.SMS} />
            <ChannelGuidance template={TemplateType.SMS} />
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
};
