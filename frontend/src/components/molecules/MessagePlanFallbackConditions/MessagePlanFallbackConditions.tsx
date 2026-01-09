'use client';
import { HTMLProps, PropsWithChildren } from 'react';
import { Details, DetailsSummary, DetailsText } from '@atoms/nhsuk-components';
import { FallbackConditionBlock } from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { Channel } from 'nhs-notify-backend-client';
import {
  channelToTemplateType,
  ORDINALS,
} from 'nhs-notify-web-template-management-utils';
import Image from 'next/image';
import classNames from 'classnames';

import styles from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions.module.scss';

import copy from '@content/content';
const { messagePlanFallbackConditions } = copy.components;

export function MessagePlanFallbackConditionsListItem({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLLIElement>>) {
  return (
    <li
      className={classNames(
        styles['fallback-conditions'],
        'fallback-conditions',
        className
      )}
      {...props}
    >
      <div
        className={styles['fallback-conditions-branch-icon']}
        aria-hidden='true'
      >
        <svg
          viewBox='0 0 499.694748 700.749167'
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
            <g transform='translate(250.007401, 350.374584) scale(-1, 1) rotate(90.000000) translate(-250.007401, -350.374584) translate(-149.992599, -49.625416)'>
              <path
                d='M650,450 C604.526092,450.130889 564.879924,480.959947 553.55,525 L450,525 C408.597492,524.954532 375.045468,491.402508 375,450 L375,350 C374.90465,322.865486 365.895962,296.514017 349.36,275 L553.55,275 C566.139176,323.757668 613.019668,355.54813 662.975013,349.20297 C712.930358,342.857809 750.374584,300.356703 750.374584,250 C750.374584,199.643297 712.930358,157.142191 662.975013,150.79703 C613.019668,144.45187 566.139176,176.242332 553.55,225 L246.45,225 C233.860824,176.242332 186.980332,144.45187 137.024987,150.79703 C87.0696422,157.142191 49.6254163,199.643297 49.6254163,250 C49.6254163,300.356703 87.0696422,342.857809 137.024987,349.20297 C186.980332,355.54813 233.860824,323.757668 246.45,275 L250,275 C291.402508,275.045468 324.954532,308.597492 325,350 L325,450 C325.081278,519.001899 380.998101,574.918722 450,575 L553.55,575 C566.624846,625.202218 615.96959,657.0262 667.095128,648.228835 C718.220666,639.431469 754.090123,592.944356 749.632835,541.259282 C745.175547,489.574208 701.876844,449.914506 650,450 Z M650,200 C677.614237,200 700,222.385763 700,250 C700,277.614237 677.614237,300 650,300 C622.385763,300 600,277.614237 600,250 C600.031687,222.398898 622.398898,200.031687 650,200 Z M150,300 C122.385763,300 100,277.614237 100,250 C100,222.385763 122.385763,200 150,200 C177.614237,200 200,222.385763 200,250 C199.972439,277.602813 177.602813,299.972439 150,300 L150,300 Z M650,600 C622.385763,600 600,577.614237 600,550 C600,522.385763 622.385763,500 650,500 C677.614237,500 700,522.385763 700,550 C699.962817,577.598821 677.598821,599.962817 650,600 Z'
                fill='#005eb8'
                fillRule='nonzero'
              />
              <rect x='0' y='0' width='800' height='800' />
            </g>
          </g>
        </svg>
      </div>
      {children}
    </li>
  );
}

export function MessagePlanFallbackConditionsDetails({
  channel,
  className,
  index,
  ...props
}: HTMLProps<HTMLDetailsElement> & {
  channel: Channel;
  index: number;
}) {
  const { title, content }: FallbackConditionBlock =
    messagePlanFallbackConditions[channelToTemplateType(channel)];

  const ordinalVariables = {
    ordinal: ORDINALS[index].toLowerCase(),
    nextOrdinal: ORDINALS[index + 1].toLowerCase(),
  };

  return (
    <Details
      className={classNames(styles['fallback-conditions-details'], className)}
      {...props}
    >
      <DetailsSummary>{title}</DetailsSummary>
      <DetailsText>
        <ul className='nhsuk-list nhsuk-list--tick'>
          {content.stop && (
            <li>
              <Image
                src='/templates/lib/assets/icons/icon-tick.svg'
                width={34}
                height={34}
                aria-hidden={true}
                alt=''
                className='nhsuk-icon nhsuk-icon--tick'
              />
              <ContentRenderer
                content={content.stop}
                variables={ordinalVariables}
              />
            </li>
          )}
          {content.continue && (
            <li>
              <Image
                src='/templates/lib/assets/icons/icon-arrow-down.svg'
                width={34}
                height={34}
                aria-hidden={true}
                alt=''
                className='nhsuk-icon nhsuk-icon--arrow-down'
              />
              <ContentRenderer
                content={content.continue}
                variables={ordinalVariables}
              />
            </li>
          )}
        </ul>
      </DetailsText>
    </Details>
  );
}
