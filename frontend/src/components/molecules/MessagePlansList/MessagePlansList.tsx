'use client';

import classNames from 'classnames';
import content from '@content/content';
import { Details, Table } from 'nhsuk-react-components';
import { format } from 'date-fns/format';
import Link from 'next/link';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

export type MessagePlanListItem = {
  name: string;
  id: string;
  lastUpdated: string;
};

type MessagePlansListProps = {
  statusGroup: 'Draft' | 'Production';
  count: number;
  plans: MessagePlanListItem[];
};

const {
  components: { messagePlanComponent },
} = content;

export const MessagePlansList = (props: MessagePlansListProps) => {
  const { statusGroup, count } = props;

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
      <Table.Cell data-testid='message-plan-id-cell'>{plan.id}</Table.Cell>
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
    <Details expander id={`message-plans-list-${statusGroup.toLowerCase()}`}>
      <Details.Summary
        className={classNames('nhsuk-heading-s', 'nhsuk-u-margin-bottom-0')}
      >
        {statusGroup} ({count})
      </Details.Summary>
      <Details.Text>
        {rows.length > 0 ? (
          <Table responsive>
            <Table.Head role='rowgroup'>{header}</Table.Head>
            <Table.Body>{rows}</Table.Body>
          </Table>
        ) : (
          <MarkdownContent
            content={messagePlanComponent.noMessagePlansMessage}
            variables={{ status: statusGroup.toLowerCase() }}
          />
        )}
      </Details.Text>
    </Details>
  );
};
