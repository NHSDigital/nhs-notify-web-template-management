'use client'; // we need this to be a client component because nhsuk-react-components uses client-only react features
import { CSSProperties, useEffect } from 'react';
import {
  TextInput,
  HintText,
  Details,
  Label,
  Textarea,
  Button,
  Fieldset,
} from 'nhsuk-react-components';
import { FC, FormEventHandler, useState } from 'react';
import { createNhsAppTemplatePageContent } from '../../../content/content';
import { ZodErrorSummary } from '../../../components/molecules/ZodErrorSummary/ZodErrorSummary';
import { PageComponentProps } from '../../../utils/types';
import { NHSNotifyFormWrapper } from '../../molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyBackButton } from '../../molecules/NHSNotifyBackButton/NHSNotifyBackButton';

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
  const [jsEnabledStyle, setJsEnabledStyle] = useState<
    CSSProperties | undefined
  >({ display: 'none' });

  useEffect(() => {
    setJsEnabledStyle(undefined);
  }, []);

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

  const templateNameError =
    state.validationError?.fieldErrors.nhsAppTemplateName?.join(', ');

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
          <div className={templateNameError && 'nhsuk-form-group--error'}>
            <Label htmlFor='nhsAppTemplateName'>{templateNameLabelText}</Label>
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
              error={templateNameError}
              errorProps={{ id: 'nhsAppTemplateName-error-message' }}
            />
          </div>
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
          <p style={jsEnabledStyle}>
            {templateMessage.length}
            {characterCountText}
          </p>
          <Button type='submit' id='create-nhs-app-template-submit-button'>
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
