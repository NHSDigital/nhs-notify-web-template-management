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
        planType='Draft'
        count={draft.count}
        plans={draft.plans}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when no data is available', async () => {
    const container = render(
      <MessagePlansList planType='Draft' count={0} plans={[]} />
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
        planType='Draft'
        count={draft.count}
        plans={draft.plans}
      />
    );

    expect(
      screen.getByTestId('message-plans-list-lastEdited-date')
    ).toHaveTextContent('8th Sep 2025');

    expect(
      screen.getByTestId('message-plans-list-lastEdited-time')
    ).toHaveTextContent('13:00');
  });
});
