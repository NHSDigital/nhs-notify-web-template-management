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
} from 'nhsuk-react-components';
import { useFormState } from 'react-dom';
import { PageComponentProps, TemplateType } from '@utils/types';
import { FC } from 'react';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { createSmsTemplatePageContent as content } from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { processFormActions } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';

export const CreateSmsTemplate: FC<PageComponentProps> = ({ initialState }) => {
  const [state, action] = useFormState(processFormActions, initialState);

  const [smsTemplateName, smsTemplateNameHandler] =
    useTextInput<HTMLInputElement>(state.smsTemplateName ?? '');

  const [smsTemplateMessage, smsTemplateMessageHandler] =
    useTextInput<HTMLTextAreaElement>(state.smsTemplateMessage ?? '');

  const templateNameError =
    state.validationError?.fieldErrors.smsTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.smsTemplateMessage?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <NHSNotifyBackButton formId='create-sms-template-back' action={action}>
        <input type='hidden' name='smsTemplateName' value={smsTemplateName} />
        <input
          type='hidden'
          name='smsTemplateMessage'
          value={smsTemplateMessage}
        />
      </NHSNotifyBackButton>
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={content.errorHeading} state={state} />
        <h1 data-testid='page-heading'>{content.pageHeading}</h1>
        <NHSNotifyFormWrapper action={action} formId='create-sms-template'>
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='smsTemplateName'>
              {content.templateNameLabelText}
            </Label>
            <HintText>{content.templateNameHintText}</HintText>
            <TemplateNameGuidance template='SMS' />
            <TextInput
              id='smsTemplateName'
              defaultValue={smsTemplateName}
              onChange={smsTemplateNameHandler}
              error={templateNameError}
              errorProps={{ id: 'smsTemplateName-error-message' }}
            />
          </div>
          <Textarea
            id='smsTemplateMessage'
            label={content.templateMessageLabelText}
            defaultValue={smsTemplateMessage}
            onChange={smsTemplateMessageHandler}
            maxLength={MAX_SMS_CHARACTER_LENGTH}
            rows={10}
            error={templateMessageError}
            errorProps={{ id: 'smsTemplateMessage-error-message' }}
          />
          <div style={useJsEnabledStyle()} id='smsMessageCharacterCount'>
            <p className='nhsuk-u-margin-bottom-0' id='character-count'>
              {smsTemplateMessage.length} characters
            </p>
            <p>
              {content.smsCountText1}
              {calculateHowManySmsMessages(Number(smsTemplateMessage.length))}
              {content.smsCountText2}
            </p>
          </div>
          <p>
            <a
              href={content.smsPricingLink}
              data-testid='sms-pricing-link'
              target='_blank'
              rel='noreferrer'
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
      </div>
    </div>
  );
};
