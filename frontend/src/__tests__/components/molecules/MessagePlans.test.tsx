import { render } from '@testing-library/react';
import { MessagePlans } from '@molecules/MessagePlans/MessagePlans';
import { MessagePlansList } from '@molecules/MessagePlansList/MessagePlansList';

jest.mock('@molecules/MessagePlansList/MessagePlansList');

const MessagePlansListMock = jest.mocked(MessagePlansList);

describe('MessagePlans', () => {
  const errorLogger = console.error;

  beforeAll(() => {
    global.console.error = jest.fn(); // suppress error logging in tests
  });

  afterAll(() => {
    jest.resetAllMocks();
    global.console.error = errorLogger;
  });

  test('matches snapshot', () => {
    const production = {
      count: 2,
      plans: [
        {
          id: '1',
          name: 'Prod A',
          lastUpdated: '2025-09-10T10:00:00Z',
        },
        {
          id: '2',
          name: 'Prod X',
          lastUpdated: '2025-09-09T11:00:00Z',
        },
      ],
    };
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
      <MessagePlans draft={draft} production={production} />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('expect MessagePlansList to be called with Draft and Production', () => {
    const production = {
      count: 2,
      plans: [
        {
          id: '1',
          name: 'Prod A',
          lastUpdated: '2025-09-10T10:00:00Z',
        },
        {
          id: '2',
          name: 'Prod X',
          lastUpdated: '2025-09-09T11:00:00Z',
        },
      ],
    };
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
    render(<MessagePlans draft={draft} production={production} />);

    expect(MessagePlansListMock).toHaveBeenCalledTimes(2);

    expect(MessagePlansListMock).toHaveBeenNthCalledWith(
      1,
      {
        count: draft.count,
        plans: draft.plans,
        status: 'DRAFT',
      },
      undefined
    );

    expect(MessagePlansListMock).toHaveBeenNthCalledWith(
      2,
      {
        count: production.count,
        plans: production.plans,
        status: 'COMPLETED',
      },
      undefined
    );
  });
});
