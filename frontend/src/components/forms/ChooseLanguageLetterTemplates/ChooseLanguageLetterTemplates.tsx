'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { Details, SummaryList } from 'nhsuk-react-components';
import Link from 'next/link';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useActionState, useState } from 'react';
import {
  ErrorState,
  PdfLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import {
  $ChooseLanguageLetterTemplates,
  chooseLanguageLetterTemplatesAction,
} from './server-action';
import { validate } from '@utils/client-validate-form';
import { getSelectedLanguageTemplateIds } from '@utils/routing-utils';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import classNames from 'classnames';
import { RoutingConfig } from 'nhs-notify-backend-client';
import baseContent from '@content/content';
import { LanguageLetterTemplates } from '@molecules/LanguageLetterTemplates/LanguageLetterTemplates';
import { interpolate } from '@utils/interpolate';

const content = baseContent.components.chooseLanguageLetterTemplates;

export type ChooseLanguageLetterTemplatesProps = {
  messagePlan: RoutingConfig;
  pageHeading: string;
  templateList: PdfLetterTemplate[];
  cascadeIndex: number;
  lockNumber: number;
};

export function ChooseLanguageLetterTemplates(
  props: ChooseLanguageLetterTemplatesProps
) {
  const { messagePlan, pageHeading, templateList, cascadeIndex, lockNumber } =
    props;

  const [state, action] = useActionState(chooseLanguageLetterTemplatesAction, {
    ...props,
  });
  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate(
    $ChooseLanguageLetterTemplates(content.error.missing.linkText),
    setErrorState
  );

  const cascadeItem = messagePlan.cascade[cascadeIndex];

  const selectedLanguageTemplateIds =
    getSelectedLanguageTemplateIds(cascadeItem);

  const initialSelectedTemplates =
    state.selectedTemplateIds ??
    selectedLanguageTemplateIds.map((item) => item.templateId);

  const activeErrorState = errorState?.fieldErrors
    ? errorState
    : state.errorState;
  const errorMessage =
    activeErrorState?.fieldErrors?.['language-templates']?.[0];
  const isDuplicateError = errorMessage === content.error.duplicate.linkText;

  const errorHintText = isDuplicateError
    ? content.error.duplicate.hintText
    : content.error.missing.hintText;

  return (
    <NHSNotifyMain>
      <NhsNotifyErrorSummary
        hint={errorHintText}
        errorState={activeErrorState}
      />
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-full'>
          <div className='nhsuk-u-reading-width'>
            <span className='nhsuk-caption-l'>{messagePlan.name}</span>
            <h1 className='nhsuk-heading-xl'>{pageHeading}</h1>
          </div>
          <NHSNotifyFormWrapper
            action={action}
            formId={'choose-language-letter-templates'}
            formAttributes={{ onSubmit: formValidate }}
          >
            <input
              type='hidden'
              name='lockNumber'
              value={lockNumber}
              readOnly
            />
            {selectedLanguageTemplateIds.length > 0 && (
              <Details data-testid='previous-selection-details'>
                <Details.Summary>
                  {content.previousSelectionLabel}
                </Details.Summary>
                <Details.Text>
                  <SummaryList>
                    <SummaryList.Row>
                      <SummaryList.Key>
                        {content.previousSelectionLabel}
                      </SummaryList.Key>
                      <SummaryList.Value>
                        <ul>
                          {selectedLanguageTemplateIds.map(
                            ({ language, templateId }) => {
                              return (
                                <li key={language}>
                                  {
                                    templateList.find(
                                      (template) => template.id === templateId
                                    )?.name
                                  }
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </SummaryList.Value>
                    </SummaryList.Row>
                  </SummaryList>
                </Details.Text>
              </Details>
            )}

            {templateList.length > 0 ? (
              <LanguageLetterTemplates
                routingConfigId={messagePlan.id}
                templateList={templateList}
                errorState={activeErrorState || null}
                selectedTemplates={initialSelectedTemplates}
                lockNumber={lockNumber}
              />
            ) : (
              <p className='nhsuk-body' data-testid='no-templates-message'>
                {content.noTemplatesText}
              </p>
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
                  className='nhsuk-u-font-size-19 nhsuk-body-m fit-content'
                  data-testid='go-to-templates-link'
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
                data-testid='back-link-bottom'
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
