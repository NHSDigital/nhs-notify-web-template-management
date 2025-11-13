'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { ChooseChannelTemplateProps } from './choose-channel-template.types';
import { SummaryList } from 'nhsuk-react-components';
import baseContent from '@content/content';
import { ChannelTemplates } from '@molecules/ChannelTemplates/ChannelTemplates';
import Link from 'next/link';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { interpolate } from '@utils/interpolate';
import { useActionState, useState } from 'react';
import { ErrorState } from 'nhs-notify-web-template-management-utils';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import {
  $ChooseChannelTemplate,
  chooseChannelTemplateAction,
} from './server-action';
import { validate } from '@utils/client-validate-form';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';

const content = baseContent.components.chooseChannelTemplate;

export function ChooseChannelTemplate(props: ChooseChannelTemplateProps) {
  const { messagePlan, pageHeading, templateList, cascadeIndex } = props;

  const [state, action] = useActionState(chooseChannelTemplateAction, {
    ...props,
  });
  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate(
    $ChooseChannelTemplate(pageHeading),
    setErrorState
  );

  const selectedTemplateId =
    messagePlan.cascade[cascadeIndex].defaultTemplateId || null;

  return (
    <NHSNotifyMain>
      <NhsNotifyErrorSummary
        hint={content.errorHintText}
        errorState={errorState}
      />
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-full'>
          <span className='nhsuk-caption-l'>{messagePlan.name}</span>
          <h1 className='nhsuk-heading-l'>{pageHeading}</h1>
          <NHSNotifyFormWrapper
            action={action}
            formId={'choose-channel-template'}
            formAttributes={{ onSubmit: formValidate }}
          >
            {selectedTemplateId && (
              <SummaryList>
                <SummaryList.Row>
                  <SummaryList.Key>
                    {content.previousSelectionLabel}
                  </SummaryList.Key>
                  <SummaryList.Value>
                    {
                      templateList.find(
                        (template) => template.id === selectedTemplateId
                      )?.name
                    }
                  </SummaryList.Value>
                </SummaryList.Row>
              </SummaryList>
            )}

            {templateList.length > 0 ? (
              <ChannelTemplates
                templateList={templateList}
                errorState={errorState || null}
                selectedTemplate={selectedTemplateId}
              />
            ) : (
              <p>{content.noTemplatesText}</p>
            )}
            <div
              className='nhsuk-form-group'
              data-testid='channel-template-actions'
            >
              {templateList.length > 0 ? (
                <NHSNotifyButton
                  type='submit'
                  data-testid='submit-button'
                  id={'channel-template-submit-button'}
                >
                  {content.actions.save.text}
                </NHSNotifyButton>
              ) : (
                <p>
                  <Link
                    href={content.actions.goToTemplates.href}
                    className='nhsuk-u-font-size-19'
                  >
                    {content.actions.goToTemplates.text}
                  </Link>
                </p>
              )}
              <Link
                href={interpolate(content.actions.backLink.href, {
                  routingConfigId: messagePlan.id,
                })}
                className={`nhsuk-u-font-size-19 ${templateList.length > 0 && 'inline-block nhsuk-u-margin-left-3 nhsuk-u-padding-top-3'}`}
              >
                {content.actions.backLink.text}
              </Link>
            </div>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
