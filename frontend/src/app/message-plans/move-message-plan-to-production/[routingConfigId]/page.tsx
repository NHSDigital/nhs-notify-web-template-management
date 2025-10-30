import classNames from 'classnames';
import type { Metadata } from 'next';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import styles from './page.module.scss';

// TODO: CCM-11496 move content into here
const pageContent = content.pages.moveMessagePlanToProduction;

export const metadata: Metadata = {
  title: pageContent.title,
};

export default function Page() {
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
                <td className='nhsuk-table__cell'>df</td>
                <td className='nhsuk-table__cell'>
                  <a href='move-message-preview'>Preview</a>
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            Moving message plans from draft to production means that they are
            ready to send.
          </p>
          <p>
            Messages will only be sent to recipients when you make a request
            with{' '}
            <a
              href='https://digital.nhs.uk/developer/api-catalogue/nhs-notify'
              target='_blank'
              rel='noopener noreferrer'
            >
              NHS Notify API
            </a>{' '}
            or{' '}
            <a
              href='https://digital.nhs.uk/developer/api-catalogue/nhs-notify-mesh'
              target='_blank'
              rel='noopener noreferrer'
            >
              NHS Notify MESH
            </a>
            .
          </p>
          <h2 className='nhsuk-heading-m'>
            Before you move message plans to production
          </h2>
          <p>Any templates used in these message plans will be locked.</p>
          <p>Make sure:</p>
          <ul className='nhsuk-list nhsuk-list--bullet'>
            <li>
              the relevant stakeholders in your team have approved your
              templates and message plan
            </li>
            <li>your templates have no errors</li>
          </ul>
          <div className='nhsuk-warning-callout'>
            <h3 className='nhsuk-warning-callout__label'>
              Important<span className='nhsuk-u-visually-hidden'>:</span>
            </h3>
            <p>You cannot edit anything that is in production.</p>
            <p>
              If you need to edit your templates or message plans, you can copy
              and replace them.
            </p>
          </div>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
