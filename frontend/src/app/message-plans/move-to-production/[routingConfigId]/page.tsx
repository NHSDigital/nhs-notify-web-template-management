import classNames from 'classnames';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import type { MessagePlanPageProps } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getRoutingConfig } from '@utils/message-plans';
import styles from './page.module.scss';
import { moveRoutingConfigToProduction } from './server-action';

const pageContent = content.pages.moveMessagePlanToProduction;

export const metadata: Metadata = {
  title: pageContent.title,
};

export default async function MoveMessagePlanToProductionPage({
  params,
}: MessagePlanPageProps) {
  const { routingConfigId } = await params;

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig) {
    return redirect('/message-plans/invalid', RedirectType.replace);
  }

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-xl'>{pageContent.heading}</h1>
          <table
            className={classNames('nhsuk-u-margin-bottom-6', styles.table)}
          >
            <tbody className='nhsuk-table__body'>
              <tr className='nhsuk-table__row'>
                <th className='nhsuk-table__cell'>Name</th>
                <td className='nhsuk-table__cell'>{routingConfig.name}</td>
                <td className='nhsuk-table__cell'>
                  <Link href={pageContent.previewLink.href(routingConfigId)}>
                    {pageContent.previewLink.text}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
          <ContentRenderer content={pageContent.content} />
          <div className='nhsuk-warning-callout'>
            <h3 className='nhsuk-warning-callout__label'>
              {pageContent.callout.label}
              <span className='nhsuk-u-visually-hidden'>:</span>
            </h3>
            <ContentRenderer content={pageContent.callout.content} />
          </div>
          <NHSNotifyFormWrapper
            formId='move-message-plan-to-production'
            action={moveRoutingConfigToProduction}
          >
            <input
              type='hidden'
              name='routingConfigId'
              value={routingConfigId}
              readOnly
            />
            <div className='nhsuk-form-group'>
              <NHSNotifyButton warning data-testid='submit-button'>
                {pageContent.submit.text}
              </NHSNotifyButton>

              <NHSNotifyButton
                secondary
                href={pageContent.cancel.href}
                className='nhsuk-u-margin-left-3'
              >
                {pageContent.cancel.text}
              </NHSNotifyButton>
            </div>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
