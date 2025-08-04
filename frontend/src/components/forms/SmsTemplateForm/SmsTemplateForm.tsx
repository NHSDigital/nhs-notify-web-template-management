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
import Link from 'next/link';
import classNames from 'classnames';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';

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
    smsPricingLink,
    smsPricingText,
    templateMessageLabelText,
    templateMessageFooterText,
    templateNameHintText,
    templateNameLabelText,
  } = content.components.templateFormSms;

  return (
    <>
      {editMode ? null : (
        <Link href='/choose-a-template-type' passHref legacyBehavior>
          <BackLink>{backLinkText}</BackLink>
        </Link>
      )}
      <NHSNotifyMain>
        <div className='nhsuk-grid-row nhsuk-grid-column-two-thirds'>
          <ZodErrorSummary
            errorHeading={errorHeading}
            state={{ validationError }}
          />
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
              <div className='nhsuk-form-group nhsuk-u-margin-bottom-6'>
                <Textarea
                  id='smsTemplateMessage'
                  label={templateMessageLabelText}
                  labelProps={{ size: 's' }}
                  defaultValue={smsTemplateMessage}
                  onChange={smsTemplateMessageHandler}
                  maxLength={MAX_SMS_CHARACTER_LENGTH}
                  rows={12}
                  error={templateMessageError}
                  errorProps={{ id: 'smsTemplateMessage--error-message' }}
                  autoComplete='off'
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
