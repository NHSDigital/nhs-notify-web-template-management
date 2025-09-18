'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { Button, Details } from 'nhsuk-react-components';
import {
  type MessagePlanListItem,
  MessagePlansList,
} from '@molecules/MessagePlansList/MessagePlansList';
import content from '@content/content';
import classNames from 'classnames';

const {
  pages: { messagePlansPage },
} = content;

const {
  pageHeading,
  button,
  draftAndProductionInfo: { draft, production },
} = messagePlansPage;

export type MessagePlansProps = {
  draft: {
    plans: MessagePlanListItem[];
    count: number;
  };
  production: {
    plans: MessagePlanListItem[];
    count: number;
  };
};

export const MessagePlans = (props: MessagePlansProps) => {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-full'>
          <h1>{pageHeading}</h1>
          <Details>
            <Details.Summary>
              {messagePlansPage.draftAndProductionInfo.heading}
            </Details.Summary>
            <Details.Text>
              <h2
                className={classNames(
                  'nhsuk-heading-s',
                  'nhsuk-u-margin-bottom-1'
                )}
              >
                {draft.heading}
              </h2>
              <p>{draft.text}</p>
              <ul>
                {draft.links.map((link) => (
                  <li key={link.text}>
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      href={link.href}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
              <h2
                className={classNames(
                  'nhsuk-heading-s',
                  'nhsuk-u-margin-bottom-1'
                )}
              >
                {production.heading}
              </h2>
              <p>
                {production.text1}
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={production.notifyApiLink.href}
                >
                  {production.notifyApiLink.text}
                </a>{' '}
                {production.text2}
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={production.meshAiLink.href}
                >
                  {production.meshAiLink.text}
                </a>
              </p>
            </Details.Text>
          </Details>
          <Button href={button.link}>{button.text}</Button>
          <MessagePlansList
            planType='Draft'
            plans={props.draft.plans}
            count={props.draft.count}
          />
          <MessagePlansList
            planType='Production'
            plans={props.production.plans}
            count={props.production.count}
          />
        </div>
      </div>
    </NHSNotifyMain>
  );
};
