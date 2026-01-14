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
import React from 'react';

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
          <Details data-testid='message-plans-status-info'>
            <Details.Summary>{draftAndProdHeading}</Details.Summary>
            <Details.Text>
              {draftAndProductionInfo.map(
                ({ title, content: draftProdContent }) => (
                  <React.Fragment key={title}>
                    <h2
                      className={classNames(
                        'nhsuk-heading-s',
                        'nhsuk-u-margin-bottom-1'
                      )}
                    >
                      {title}
                    </h2>
                    <ContentRenderer content={draftProdContent} />
                  </React.Fragment>
                )
              )}
            </Details.Text>
          </Details>
          <Link passHref legacyBehavior href={button.link}>
            <Button data-testid='create-message-plan-button'>
              {button.text}
            </Button>
          </Link>
          <MessagePlansList
            status='DRAFT'
            plans={props.draft.plans}
            count={props.draft.count}
          />
          <MessagePlansList
            status='COMPLETED'
            plans={props.production.plans}
            count={props.production.count}
          />
        </div>
      </div>
    </NHSNotifyMain>
  );
};
