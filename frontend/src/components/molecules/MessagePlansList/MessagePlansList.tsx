'use client';

import classNames from 'classnames';
import content from '@content/content';
import { Details, Table } from 'nhsuk-react-components';
import { format } from 'date-fns/format';
import Link from 'next/link';

export type MessagePlanListItem = {
  name: string;
  id: string;
  lastUpdated: string;
};

type MessagePlansListProps = {
  planType: string;
  count: number;
  plans: MessagePlanListItem[];
};

const {
  components: { messagePlanComponent },
} = content;

export const MessagePlansList = (props: MessagePlansListProps) => {
  const { planType: status, count } = props;

  const header = (
    <Table.Row>
      {messagePlanComponent.tableHeadings.map((item) => (
        <Table.Cell key={item}>{item}</Table.Cell>
      ))}
    </Table.Row>
  );

  const rows = props.plans.map((plan) => (
    <Table.Row key={plan.id}>
      <Table.Cell>
        <Link href={messagePlanComponent.previewLink(plan.id)}>
          {plan.name}
        </Link>
      </Table.Cell>
      <Table.Cell>{plan.id}</Table.Cell>
      <Table.Cell>
        <span data-testid='message-plans-list-lastEdited-date'>
          {format(`${plan.lastUpdated}`, 'do MMM yyyy')}
        </span>
        <br />
        <span data-testid='message-plans-list-lastEdited-time'>
          {format(`${plan.lastUpdated}`, 'HH:mm')}
        </span>
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <Details expander>
      <Details.Summary
        className={classNames('nhsuk-heading-s', 'nhsuk-u-margin-bottom-0')}
      >
        {status} ({count})
      </Details.Summary>
      <Details.Text>
        <Table responsive>
          <Table.Head role='rowgroup'>
            {count > 0 ? header : undefined}
          </Table.Head>
          <Table.Body>
            {count > 0 ? (
              rows
            ) : (
              <Table.Row>
                <Table.Cell>
                  {messagePlanComponent.noMessagePagesMessage(
                    status.toLowerCase()
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Details.Text>
    </Details>
  );
};
