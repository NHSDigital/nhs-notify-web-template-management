'use client';

import { useJsEnabledStyle } from '@hooks/use-js-enabled-style.hook';
import { useTextInput } from '@hooks/use-text-input.hook';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import Link from 'next/link';
import {
  Button,
  HintText,
  Label,
  Textarea,
  TextInput,
} from 'nhsuk-react-components';
import { useFormState } from 'react-dom';
import { PageComponentProps } from '@utils/types';
import { FC } from 'react';
import Handlebars from 'handlebars';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { TemplateNameGuidance } from '@molecules/TemplateNameGuidance';
import { createSmsTemplatePageContent as content } from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { NHSNotifyBackButton } from '@molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { processFormActions } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';

const smsCountTemplate = Handlebars.compile(content.smsCountText);

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

  const smsCountText = smsCountTemplate({
    smsCount: calculateHowManySmsMessages(Number(smsTemplateMessage.length)),
  });

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
        <h1>{content.pageHeading}</h1>
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
            <p className='nhsuk-u-margin-bottom-0'>
              {smsTemplateMessage.length} characters
            </p>
            <p>USING HANDLEBARS: {smsCountText}</p>
            <p>
              {content.smsCountText1}
              {calculateHowManySmsMessages(Number(smsTemplateMessage.length))}
              {content.smsCountText2}
            </p>
          </div>
          <p>
            <Link href={content.smsPricingLink} target='_blank'>
              {content.smsPricingText}
            </Link>
          </p>
          <Button id='create-sms-template-submit-button'>
            {content.buttonText}
          </Button>
        </NHSNotifyFormWrapper>
      </div>
      <div className='nhsuk-grid-column-one-third'>
        <Personalisation />
        <MessageFormatting template='SMS' />
      </div>
    </div>
  );
};
