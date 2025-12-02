'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { ChooseChannelTemplateProps } from './choose-channel-template.types';
import { SummaryList } from 'nhsuk-react-components';
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
import classNames from 'classnames';
import { ConditionalTemplate } from '@utils/routing-utils';
import baseContent from '@content/content';

const content = baseContent.components.chooseChannelTemplate;

export function ChooseChannelTemplate(props: ChooseChannelTemplateProps) {
  const {
    messagePlan,
    pageHeading,
    templateList,
    cascadeIndex,
    accessibleFormat,
  } = props;

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

  const cascadeItem = messagePlan.cascade[cascadeIndex];
  const selectedTemplateId = accessibleFormat
    ? cascadeItem.conditionalTemplates?.find(
        (template: ConditionalTemplate) =>
          'accessibleFormat' in template &&
          template.accessibleFormat === accessibleFormat &&
          template.templateId !== null
      )?.templateId || null
    : cascadeItem.defaultTemplateId || null;

  return (
    <NHSNotifyMain>
      <NhsNotifyErrorSummary
        hint={content.errorHintText}
        errorState={errorState}
      />
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-full'>
          <div className='nhsuk-u-reading-width'>
            <span className='nhsuk-caption-l'>{messagePlan.name}</span>
            <h1 className='nhsuk-heading-xl'>{pageHeading}</h1>
          </div>
          <NHSNotifyFormWrapper
            action={action}
            formId={'choose-channel-template'}
            formAttributes={{ onSubmit: formValidate }}
          >
            {selectedTemplateId && (
              <SummaryList data-testid='previous-selection-summary'>
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
                routingConfigId={messagePlan.id}
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
                <Link
                  href={content.actions.goToTemplates.href}
                  className='nhsuk-u-font-size-19 nhsuk-u-display-block nhsuk-body-m'
                >
                  {content.actions.goToTemplates.text}
                </Link>
              )}
              <Link
                href={interpolate(content.actions.backLink.href, {
                  routingConfigId: messagePlan.id,
                })}
                className={classNames(
                  'nhsuk-u-font-size-19',
                  templateList.length > 0 &&
                    'inline-block nhsuk-u-margin-left-4 nhsuk-u-padding-top-3'
                )}
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
