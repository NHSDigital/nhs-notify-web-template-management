'use client'; // we need this to be a client component because nhsuk-react-components uses client-only react features
import {
  TextInput,
  HintText,
  Details,
  Label,
  Textarea,
  Button,
  ChevronLeftIcon,
} from 'nhsuk-react-components';
import { FC, FormEventHandler, useState } from 'react';
import { createNhsAppTemplatePageContent } from '../../../content/content';
import { ZodErrorSummary } from '../../../components/molecules/ZodErrorSummary/ZodErrorSummary';
import { PageComponentProps } from '../../../utils/types';
import { NHSNotifyFormWrapper } from '../../molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyBackButton } from '../../molecules/NHSNotifyBackButton/NHSNotifyBackButton';
import { FormEvent } from 'react';

export const CreateNhsAppTemplate: FC<PageComponentProps> = ({
  state,
  action,
}) => {
  const {
    pageHeading,
    errorHeading,
    buttonText,
    characterCountText,
    templateNameLabelText,
    templateNameHintText,
    templateNameDetailsSummary,
    templateNameDetailsOpeningParagraph,
    templateNameDetailsListHeader,
    templateNameDetailsList,
    templateNameDetailsExample,
  } = createNhsAppTemplatePageContent;
  const [templateName, setTemplateName] = useState(state.nhsAppTemplateName);
  const [templateMessage, setTemplateMessage] = useState(
    state.nhsAppTemplateMessage
  );

  const templateNameHandler: FormEventHandler<HTMLInputElement> = (event) => {
    const typedEventTarget = event.target as HTMLInputElement; // it would be great if we could do this without forcing the types
    setTemplateName(typedEventTarget.value);
  };

  const templateMessageHandler: FormEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const typedEventTarget = event.target as HTMLTextAreaElement; // it would be great if we could do this without forcing the types
    setTemplateMessage(typedEventTarget.value);
  };

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <NHSNotifyBackButton
          formId='create-nhs-app-template-back'
          action={action}
        >
          <input type='hidden' name='nhsAppTemplateName' value={templateName} />
          <input
            type='hidden'
            name='nhsAppTemplateMessage'
            value={templateMessage}
          />
        </NHSNotifyBackButton>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyFormWrapper action={action} formId='create-nhs-app-template'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {pageHeading}
          </h1>
          <Label>{templateNameLabelText}</Label>
          <HintText>{templateNameHintText}</HintText>
          <Details>
            <Details.Summary>{templateNameDetailsSummary}</Details.Summary>
            <Details.Text>
              <p>{templateNameDetailsOpeningParagraph}</p>
              <p>{templateNameDetailsListHeader}</p>
              <ul>
                {templateNameDetailsList.map((listItem, index) => (
                  <li key={`list-item-${index}`}>{listItem}</li>
                ))}
              </ul>
              <p>{templateNameDetailsExample}</p>
            </Details.Text>
          </Details>
          <TextInput
            id='nhsAppTemplateName'
            onChange={templateNameHandler}
            value={templateName}
            error={state.validationError?.fieldErrors.nhsAppTemplateName?.join(
              ', '
            )}
            errorProps={{ id: 'nhsAppTemplateName-error-message' }}
          />
          <Textarea
            label='Message'
            id='nhsAppTemplateMessage'
            maxLength={5000}
            rows={10}
            onChange={templateMessageHandler}
            value={templateMessage}
            error={state.validationError?.fieldErrors.nhsAppTemplateMessage?.join(
              ', '
            )}
            errorProps={{ id: 'nhsAppTemplateMessage-error-message' }}
          />
          <p>
            {templateMessage.length}
            {characterCountText}
          </p>
          <Button type='submit' data-testid='submit-button'>
            {buttonText}
          </Button>
        </NHSNotifyFormWrapper>
      </div>
      <div className='nhsuk-grid-column-one-third'>
        Placeholder for personalisation and message formatting guidance
      </div>
    </div>
  );
};
