'use client';

import Link from 'next/link';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { Button } from 'nhsuk-react-components';
import { SummaryList, Tag, Details } from 'nhsuk-react-components';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';

import styles from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan.module.scss';

import content from '@content/content';
const { messagePlanFallbackConditions } = content.components;

type Plan = {
  id: string;
  name: string;
  status: string;
};

type NHSNotifyChooseTemplatesProps = {
  plan: Plan;
};

export function CreateEditMessagePlan({ plan }: NHSNotifyChooseTemplatesProps) {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-three-quarters'>
          <span className='nhsuk-caption-l'>Message plan</span>
          <h1 className='nhsuk-heading-l'>{plan.name}</h1>
          <p className='nhsuk-body-s'>
            <Link href='/templates/message-plans/create-name?rename-message=1'>
              Change name
            </Link>
          </p>

          <SummaryList className='nhsuk-u-margin-bottom-7 nhsuk-u-margin-top-6'>
            <SummaryList.Row>
              <SummaryList.Key>Routing Plan ID</SummaryList.Key>
              <SummaryList.Value>
                <span
                  style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}
                >
                  {plan.id}
                </span>
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Status</SummaryList.Key>
              <SummaryList.Value>
                <Tag color='green'>{plan.status}</Tag>
              </SummaryList.Value>
            </SummaryList.Row>
          </SummaryList>

          <ul className={styles['channel-list']}>
            <MessagePlanBlock
              number={1}
              title='First message'
              channel='NHS App'
            />
            <MessagePlanFallbackConditions
              title={messagePlanFallbackConditions.NHS_APP.title}
              content={messagePlanFallbackConditions.NHS_APP.content}
            />
            <MessagePlanBlock
              number={2}
              title='Second message'
              channel='Email'
            />
            <MessagePlanFallbackConditions
              title={messagePlanFallbackConditions.EMAIL.title}
              content={messagePlanFallbackConditions.EMAIL.content}
            />
            <MessagePlanBlock
              number={3}
              title='Third message'
              channel='Text message (SMS)'
            />
            <MessagePlanFallbackConditions
              title={messagePlanFallbackConditions.SMS.title}
              content={messagePlanFallbackConditions.SMS.content}
            />
            <MessagePlanBlock
              number={4}
              title='Fourth message'
              channel='Standard English letter'
            />
            {/* <AccessibleLetterBlocks /> */}
          </ul>

          <div className='nhsuk-form-group notify-message-button-container'>
            <Button
              onClick={() => alert('TODO: validate & move to production')}
            >
              Move to production
            </Button>
            <Button secondary className='nhsuk-u-margin-left-3'>
              Save and close
            </Button>
          </div>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
