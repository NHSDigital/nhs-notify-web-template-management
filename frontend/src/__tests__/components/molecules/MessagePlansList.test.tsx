import { fireEvent, render, screen } from '@testing-library/react';
import {
  MessagePlanListItem,
  MessagePlansList,
} from '@molecules/MessagePlansList/MessagePlansList';
import userEvent from '@testing-library/user-event';

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

  it('should copy message plan names and IDs to clipboard when button is clicked', async () => {
    const mockPlans: MessagePlanListItem[] = [
      { name: 'Plan 1', id: 'id-1', lastUpdated: '2026-01-23T10:00:00Z' },
      { name: 'Plan 2', id: 'id-2', lastUpdated: '2026-01-23T11:00:00Z' },
    ];

    const mockClipboardWrite = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: { write: mockClipboardWrite },
      writable: true,
      configurable: true,
    });

    global.ClipboardItem = jest.fn(
      (data) => data
    ) as unknown as typeof ClipboardItem;

    const { getByTestId } = render(
      <MessagePlansList status='DRAFT' count={2} plans={mockPlans} />
    );

    const expander = getByTestId('message-plans-list-draft');
    fireEvent.click(expander);

    const copyButton = getByTestId('copy-button-draft');

    await userEvent.click(copyButton);

    expect(mockClipboardWrite).toHaveBeenCalledTimes(1);
    expect(copyButton).toHaveTextContent("Names and ID's copied to clipboard");

    const [clipboardItem] = mockClipboardWrite.mock.calls[0][0];

    const csv = clipboardItem['text/plain'];

    const expectedCSV = [
      'routing_plan_name,routing_plan_id',
      '"Plan 1","id-1"',
      '"Plan 2","id-2"',
    ].join('\n');

    expect(csv).toEqual(expectedCSV);
  });
});
