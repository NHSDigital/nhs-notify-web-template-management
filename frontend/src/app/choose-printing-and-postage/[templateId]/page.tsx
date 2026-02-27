import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import { $LockNumber } from 'nhs-notify-backend-client';
import { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import {
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@atoms/nhsuk-components';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import copy from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getLetterVariantsForTemplate, getTemplate } from '@utils/form-actions';
import { fetchClient } from '@utils/server-features';
import { choosePrintingAndPostage } from './server-action';

const content = copy.pages.choosePrintingAndPostagePage;

export const metadata: Metadata = {
  title: content.pageTitle,
};

export default async function ChoosePrintingAndPostagePage(
  props: TemplatePageProps
) {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  if (!template) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  if (template.templateType !== 'LETTER') {
    return redirect('/message-templates', RedirectType.replace);
  }

  const searchParams = await props.searchParams;
  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  const variants = await getLetterVariantsForTemplate(templateId);

  const previewUrl =
    template.templateStatus === 'SUBMITTED'
      ? `/preview-submitted-letter-template/${templateId}`
      : `/preview-letter-template/${templateId}`;

  if (
    template.templateStatus === 'SUBMITTED' ||
    template.letterVersion !== 'AUTHORING' ||
    !lockNumberResult.success ||
    !variants ||
    variants.length === 0
  ) {
    return redirect(previewUrl, RedirectType.replace);
  }

  const client = await fetchClient();

  if (!client?.features.letterAuthoring) {
    return redirect('/message-templates', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyFormProvider
          serverAction={choosePrintingAndPostage}
          initialState={{
            fields: {
              letterVariantId: template.letterVariantId,
            },
          }}
        >
          <NHSNotifyForm.ErrorSummary hint={content.errorSummaryHint} />
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-full'>
              <h1 className='nhsuk-heading-xl'>{content.pageHeading}</h1>

              <ContentRenderer content={content.hint} />

              <NHSNotifyForm.Form formId='choose-printing-and-postage'>
                <input
                  type='hidden'
                  name='templateId'
                  value={templateId}
                  readOnly
                />
                <input
                  type='hidden'
                  name='lockNumber'
                  value={lockNumberResult.data}
                  readOnly
                />

                <NHSNotifyForm.FormGroup
                  id='letterVariantId'
                  htmlFor='letterVariantId'
                >
                  <NHSNotifyForm.ErrorMessage htmlFor='letterVariantId' />
                  <Table className='nhsuk-u-margin-bottom-6' responsive>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {content.form.letterVariantId.table.headers.select}
                        </TableCell>
                        <TableCell>
                          {content.form.letterVariantId.table.headers.name}
                        </TableCell>
                        <TableCell>
                          {content.form.letterVariantId.table.headers.details}
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <span className='nhsuk-table-responsive__heading'>
                              {
                                content.form.letterVariantId.table.headers
                                  .select
                              }{' '}
                              {variant.name}
                            </span>
                            <div className='nhsuk-radios__item'>
                              <NHSNotifyForm.RadioInput
                                id={variant.id}
                                name='letterVariantId'
                                value={variant.id}
                                aria-labelledby={`label-${variant.id}`}
                              />
                              <span className='nhsuk-radios__label'> </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='nhsuk-table-responsive__heading'>
                              {
                                content.form.letterVariantId.table.headers.name
                              }{' '}
                            </span>
                            <Label
                              id={`label-${variant.id}`}
                              htmlFor={variant.id}
                            >
                              {variant.name}
                            </Label>
                          </TableCell>
                          <TableCell>
                            <span className='nhsuk-table-responsive__heading'>
                              {
                                content.form.letterVariantId.table.headers
                                  .details
                              }{' '}
                            </span>
                            <ul className='nhsuk-u-margin-bottom-0'>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .sheetSize
                                }
                                : {variant.sheetSize}
                              </li>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .maxSheets
                                }
                                : {variant.maxSheets}
                              </li>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .bothSides
                                }
                                : {variant.bothSides ? 'yes' : 'no'}
                              </li>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .printColour
                                }
                                : {variant.printColour}
                              </li>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .envelopeSize
                                }
                                : {variant.envelopeSize}
                              </li>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .dispatchTime
                                }
                                : {variant.dispatchTime}
                              </li>
                              <li>
                                {
                                  content.form.letterVariantId.table.details
                                    .postage
                                }
                                : {variant.postage}
                              </li>
                            </ul>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </NHSNotifyForm.FormGroup>

                <NHSNotifyForm.FormGroup>
                  <NHSNotifyButton type='submit'>
                    {content.form.submitButton.text}
                  </NHSNotifyButton>

                  <Link
                    href={content.backLink.href(templateId)}
                    data-testid='back-link-bottom'
                    className='nhsuk-u-display-inline-block nhsuk-u-font-size-19 nhsuk-u-margin-3'
                  >
                    {content.backLink.text}
                  </Link>
                </NHSNotifyForm.FormGroup>
              </NHSNotifyForm.Form>
            </div>
          </div>
        </NHSNotifyFormProvider>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
