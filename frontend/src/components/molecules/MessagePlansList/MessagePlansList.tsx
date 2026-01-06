'use client';

import classNames from 'classnames';
import content from '@content/content';
import { Details, Table } from 'nhsuk-react-components';
import { format } from 'date-fns/format';
import Link from 'next/link';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';
import type { RoutingConfigStatusActive } from 'nhs-notify-backend-client';
import { messagePlanStatusToDisplayText } from 'nhs-notify-web-template-management-utils';
import { interpolate } from '@utils/interpolate';

export type MessagePlanListItem = {
  name: string;
  id: string;
  lastUpdated: string;
};

type MessagePlansListProps = {
  status: RoutingConfigStatusActive;
  count: number;
  plans: MessagePlanListItem[];
};

const {
  components: { messagePlansListComponent },
} = content;

export const MessagePlansList = (props: MessagePlansListProps) => {
  const { status, count } = props;
  const statusDisplayMapping = messagePlanStatusToDisplayText(status);
  const statusDisplayLower = statusDisplayMapping.toLowerCase();
  const messagePlanLink =
    status === 'DRAFT'
      ? messagePlansListComponent.draftMessagePlanLink
      : messagePlansListComponent.productionMessagePlanLink;

  const header = (
    <Table.Row>
      {messagePlansListComponent.tableHeadings.map((item) => (
        <Table.Cell key={item}>{item}</Table.Cell>
      ))}
    </Table.Row>
  );

  const rows = props.plans.map((plan) => (
    <Table.Row key={plan.id}>
      <Table.Cell>
        <Link
          href={interpolate(messagePlanLink, {
            routingConfigId: plan.id,
          })}
        >
          {plan.name}
        </Link>
      </Table.Cell>
      <Table.Cell data-testid='message-plan-id-cell'>{plan.id}</Table.Cell>
      <Table.Cell data-testid='message-plans-list-lastEdited'>
        {format(`${plan.lastUpdated}`, 'do MMM yyyy')}
        <br />
        {format(`${plan.lastUpdated}`, 'HH:mm')}
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <Details expander data-testid={`message-plans-list-${statusDisplayLower}`}>
      <Details.Summary
        className={classNames('nhsuk-heading-s', 'nhsuk-u-margin-bottom-0')}
      >
        {statusDisplayMapping} ({count})
      </Details.Summary>
      <Details.Text>
        {rows.length > 0 ? (
          <Table responsive>
            <Table.Head role='rowgroup'>{header}</Table.Head>
            <Table.Body>{rows}</Table.Body>
          </Table>
        ) : (
          <MarkdownContent
            content={messagePlansListComponent.noMessagePlansMessage}
            variables={{ status: statusDisplayLower }}
          />
        )}
      </Details.Text>
    </Details>
  );
};
