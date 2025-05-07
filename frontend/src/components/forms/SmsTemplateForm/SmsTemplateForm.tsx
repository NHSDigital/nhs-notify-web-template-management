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
  CreateUpdateSMSTemplate,
  FormErrorState,
  PageComponentProps,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { FC, useActionState, useState } from 'react';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import content from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { ChannelGuidance } from '@molecules/ChannelGuidance/ChannelGuidance';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { $CreateSmsTemplateSchema, processFormActions } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';
import { validate } from '@utils/client-validate-form';

export const SmsTemplateForm: FC<
  PageComponentProps<SMSTemplate | CreateUpdateSMSTemplate>
> = ({ initialState }) => {
  const [state, action] = useActionState(processFormActions, initialState);

  const [validationError, setValidationError] = useState<
    FormErrorState | undefined
  >(state.validationError);

  const formValidate = validate($CreateSmsTemplateSchema, setValidationError);

  const [smsTemplateName, smsTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.name);

  const [smsTemplateMessage, smsTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.message);

  const templateNameError =
    validationError?.fieldErrors.smsTemplateName?.join(', ');

  const templateMessageError =
    validationError?.fieldErrors.smsTemplateMessage?.join(', ');

  const editMode = 'id' in initialState;

  const {
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
            <ZodErrorSummary
              errorHeading={errorHeading}
              state={{ validationError }}
            />
            <h1 data-testid='page-heading'>
              {editMode ? 'Edit ' : 'Create '}
              {pageHeadingSuffix}
            </h1>
            <NHSNotifyFormWrapper
              action={action}
              formId='create-sms-template'
              formAttributes={{ onSubmit: formValidate }}
            >
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
            <MessageFormatting template='SMS' />
            <ChannelGuidance template='SMS' />
          </aside>
        </div>
      </NHSNotifyMain>
    </>
  );
};
