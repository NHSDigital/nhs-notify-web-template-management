'use client';

import { useJsEnabledStyle } from '@hooks/use-js-enabled-style.hook';
import { useTextInput } from '@hooks/use-text-input.hook';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { Personalisation } from '@molecules/Personalisation/Personalisation';
import Link from 'next/link';
import {
  Button,
  ChevronLeftIcon,
  HintText,
  Label,
  Textarea,
  TextInput,
} from 'nhsuk-react-components';
import { useFormState } from 'react-dom';
import { PageComponentProps } from '@utils/types';
import { FC } from 'react';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NameYourTemplate } from '@molecules/NameYourTemplate';
import { createSmsTemplatePageContent as content } from '@content/content';
import { MAX_SMS_CHARACTER_LENGTH } from '@utils/constants';
import { createSmsTemplateAction } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';

export const CreateSmsTemplate: FC<PageComponentProps> = ({ initialState }) => {
  const [state, action] = useFormState(createSmsTemplateAction, initialState);

  const [smsMessageValue, handler] = useTextInput<HTMLTextAreaElement>(
    state.smsTemplateMessage ?? ''
  );

  const templateNameError =
    state.validationError?.fieldErrors.smsTemplateName?.join(', ');

  const templateMessageError =
    state.validationError?.fieldErrors.smsTemplateMessage?.join(', ');

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-back-link nhsuk-u-margin-bottom-6 nhsuk-u-margin-left-3'>
        <Link
          href={`/choose-a-template-type/${initialState.id}`}
          className='nhsuk-back-link__link'
        >
          <ChevronLeftIcon />
          Go back
        </Link>
      </div>
      <div className='nhsuk-grid-column-two-thirds'>
        <ZodErrorSummary errorHeading={content.errorHeading} state={state} />
        <h1>{content.pageHeading}</h1>
        <NHSNotifyFormWrapper action={action} formId='create-sms-template'>
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='smsTemplateName'>
              {content.templateNameLabelText}
            </Label>
            <HintText>{content.templateNameHintText}</HintText>
            <NameYourTemplate template='SMS' />
            <TextInput
              id='smsTemplateName'
              defaultValue={state.smsTemplateName}
              error={templateNameError}
              errorProps={{ id: 'smsTemplateName-error-message' }}
            />
          </div>
          <Textarea
            id='smsTemplateMessage'
            label={content.templateMessageLabelText}
            defaultValue={smsMessageValue}
            onChange={handler}
            maxLength={MAX_SMS_CHARACTER_LENGTH}
            rows={10}
            error={templateMessageError}
            errorProps={{ id: 'smsTemplateMessage-error-message' }}
          />
          <div style={useJsEnabledStyle()} id='smsMessageCharacterCount'>
            <p className='nhsuk-u-margin-bottom-0'>
              {smsMessageValue.length} characters
            </p>
            <p>
              {content.smsCountText1}
              {calculateHowManySmsMessages(Number(smsMessageValue.length))}
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
