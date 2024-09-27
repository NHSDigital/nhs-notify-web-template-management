'use client';

import { useJsEnabledStyle } from '@hooks/use-js-enabled-style.hook';
import { useTextAreaInput } from '@hooks/use-text-area-input.hook';
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
import { createSmsTemplateAction } from './server-action';
import { calculateHowManySmsMessages } from './view-actions';

export const CreateSmsTemplate: FC<PageComponentProps> = ({ initialState }) => {
  const [state, action] = useFormState(createSmsTemplateAction, initialState);
  const [smsMessageValue, handler] = useTextAreaInput(
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
        <ZodErrorSummary errorHeading='There was a problem' state={state} />
        <h1>Create text message template</h1>
        <NHSNotifyFormWrapper action={action} formId='create-sms-template'>
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='smsTemplateName'>Template name</Label>
            <HintText>This will not be visible to recipients.</HintText>
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
            label='Message'
            defaultValue={smsMessageValue}
            onChange={handler}
            maxLength={918}
            rows={10}
            error={templateMessageError}
            errorProps={{ id: 'smsTemplateMessage-error-message' }}
          />
          <div style={useJsEnabledStyle()} id='smsMessageCharacterCount'>
            <p className='nhsuk-u-margin-bottom-0'>
              {smsMessageValue.length} characters
            </p>
            <p>
              This template will be sent as{' '}
              {calculateHowManySmsMessages(Number(smsMessageValue.length))} text
              messages. If you&apos;re using personalisation fields, it could
              send as more.
            </p>
          </div>
          <p>
            <Link
              href='https://notify.nhs.uk/pricing/text-messages'
              target='_blank'
            >
              Learn more about character counts and text messaging pricing
              (opens in a new tab)
            </Link>
          </p>
          <Button id='create-sms-template-submit-button'>Continue</Button>
        </NHSNotifyFormWrapper>
      </div>
      <div className='nhsuk-grid-column-one-third'>
        <Personalisation />
        <MessageFormatting template='SMS' />
      </div>
    </div>
  );
};
