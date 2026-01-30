import { render, screen } from '@testing-library/react';
import { MessagePlansList } from '@molecules/MessagePlansList/MessagePlansList';

describe('MessagePlansList', () => {
  it('matches snapshot when data is available', async () => {
    const draft = {
      count: 1,
      plans: [
        {
          id: '3',
          name: 'Draft Y',
          lastUpdated: '2025-09-08T12:00:00Z',
        },
      ],
    };

    const container = render(
      <MessagePlansList
        status='DRAFT'
        count={draft.count}
        plans={draft.plans}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when no data is available', async () => {
    const container = render(
      <MessagePlansList status='DRAFT' count={0} plans={[]} />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('formats lastEdited date and time', async () => {
    const draft = {
      count: 1,
      plans: [
        {
          id: '3',
          name: 'Draft Y',
          lastUpdated: '2025-09-08T12:00:00Z',
        },
      ],
    };

    render(
      <MessagePlansList
        status='DRAFT'
        count={draft.count}
        plans={draft.plans}
      />
    );

    const lastEditedCell = screen.getByTestId('message-plans-list-lastEdited');

    expect(lastEditedCell).toHaveTextContent('8th Sep 2025');

    expect(lastEditedCell).toHaveTextContent('13:00');
  });

  it('matches snapshot when data is available - COMPLETED', async () => {
    const data = {
      count: 1,
      plans: [
        {
          id: '3',
          name: 'Draft Y',
          lastUpdated: '2025-09-08T12:00:00Z',
        },
      ],
    };

    const container = render(
      <MessagePlansList
        status='COMPLETED'
        count={data.count}
        plans={data.plans}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
