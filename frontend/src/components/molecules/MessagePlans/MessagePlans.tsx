'use client';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { Button, Details } from 'nhsuk-react-components';
import {
  type MessagePlanListItem,
  MessagePlansList,
} from '@molecules/MessagePlansList/MessagePlansList';
import content from '@content/content';
import classNames from 'classnames';
import Link from 'next/link';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';

const {
  pages: { messagePlansPage },
} = content;

const { pageHeading, button, draftAndProdHeading, draftAndProductionInfo } =
  messagePlansPage;

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
          <Details id='message-plans-status-info'>
            <Details.Summary>{draftAndProdHeading}</Details.Summary>
            <Details.Text>
              {draftAndProductionInfo.map(
                ({ title, content: draftProdContent }) => (
                  <>
                    <h2
                      className={classNames(
                        'nhsuk-heading-s',
                        'nhsuk-u-margin-bottom-1'
                      )}
                    >
                      {title}
                    </h2>
                    <ContentRenderer content={draftProdContent} />
                  </>
                )
              )}
            </Details.Text>
          </Details>
          <Link passHref legacyBehavior href={button.link}>
            <Button id='create-message-plan-button'>{button.text}</Button>
          </Link>
          <MessagePlansList
            statusGroup='Draft'
            plans={props.draft.plans}
            count={props.draft.count}
          />
          <MessagePlansList
            statusGroup='Production'
            plans={props.production.plans}
            count={props.production.count}
          />
        </div>
      </div>
    </NHSNotifyMain>
  );
};
