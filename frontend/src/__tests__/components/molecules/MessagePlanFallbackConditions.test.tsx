import { Channel } from 'nhs-notify-backend-client';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagePlanFallbackConditions } from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';

describe('MessagePlanFallbackConditions', () => {
  it('should render the title and list items for a digital channel', () => {
    const { container } = render(
      <MessagePlanFallbackConditions channel='NHSAPP' index={0} />
    );

    const details = container.querySelector('details')!;
    const summary = details.querySelector('.nhsuk-details__summary');
    expect(summary).toHaveTextContent('Fallback conditions');

    const list = within(details).getByRole('list');
    const listItems = within(list).getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    const completeListItem = listItems[0];
    const tickImg = within(completeListItem).getByRole('presentation', {
      hidden: true,
      name: '',
    });
    expect(tickImg.getAttribute('src')).toContain('icon-tick.svg');
    expect(completeListItem.textContent).toBe(
      'If first message read within 24 hours, no further messages sent.'
    );

    const continueListItem = listItems[1];
    const arrowImg = within(continueListItem).getByRole('presentation', {
      hidden: true,
      name: '',
    });
    expect(arrowImg.getAttribute('src')).toContain('icon-arrow-down.svg');
    expect(continueListItem.textContent).toBe(
      'If first message not read within 24 hours, second message sent.'
    );
  });

  it('should toggle details open/closed when clicking the summary', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessagePlanFallbackConditions channel='EMAIL' index={0} />
    );

    const details = container.querySelector('details')!;
    const summary = details.querySelector('.nhsuk-details__summary')!;

    expect(details.hasAttribute('open')).toBe(false);

    await user.click(summary);
    expect(details.hasAttribute('open')).toBe(true);

    await user.click(summary);
    expect(details.hasAttribute('open')).toBe(false);
  });

  it('should render correct title and only the continue item for letter channel', () => {
    const { container } = render(
      <MessagePlanFallbackConditions channel='LETTER' index={0} />
    );

    const details = container.querySelector('details')!;
    const summary = details.querySelector('.nhsuk-details__summary')!;
    expect(summary).toHaveTextContent(
      'Conditions for accessible and language letters'
    );

    const list = details.querySelector('ul.nhsuk-list--tick') as HTMLElement;
    const listItems = [...list.querySelectorAll(':scope > li')];
    expect(listItems).toHaveLength(1);

    const continueListItem = listItems[0] as HTMLElement;

    const arrowImg = continueListItem.querySelector(
      'img.nhsuk-icon--arrow-down'
    ) as HTMLImageElement;
    expect(arrowImg).toBeTruthy();
    expect(arrowImg.getAttribute('src')).toContain('icon-arrow-down.svg');

    expect(
      continueListItem.querySelector('img[src*="icon-tick.svg"]')
    ).toBeNull();

    expect(
      within(continueListItem).getByText(
        'The relevant accessible or language letter will be sent instead of the standard English letter if, both:'
      )
    ).toBeInTheDocument();

    const nestedList = continueListItem.querySelector('ul')!;
    const nestedListItems = within(nestedList).getAllByRole('listitem');
    expect(nestedListItems).toHaveLength(2);
    expect(nestedListItems.map((li) => li.textContent?.trim())).toEqual([
      'the recipient has requested an accessible or language letter in PDS',
      "you've included the relevant template in this message plan",
    ]);
  });

  it('renders correct ordinals at different indexes', async () => {
    render(
      <>
        <MessagePlanFallbackConditions channel='NHSAPP' index={0} />
        <MessagePlanFallbackConditions channel='NHSAPP' index={1} />
      </>
    );

    const [firstInstance, secondInstance] = screen.getAllByTestId(
      'message-plan-fallback-conditions-NHSAPP'
    );

    const firstInstanceListItems = within(
      within(firstInstance.querySelector('details')!).getByRole('list')
    ).getAllByRole('listitem');
    expect(firstInstanceListItems[1].textContent).toBe(
      'If first message not read within 24 hours, second message sent.'
    );

    const secondInstanceListItems = within(
      within(secondInstance.querySelector('details')!).getByRole('list')
    ).getAllByRole('listitem');
    expect(secondInstanceListItems[1].textContent).toBe(
      'If second message not read within 24 hours, third message sent.'
    );
  });

  it.each([
    ['NHSAPP', 0],
    ['EMAIL', 1],
    ['SMS', 2],
    ['LETTER', 3],
  ])('should match snapshot for %s at index %i', (channel, index) => {
    const { asFragment } = render(
      <MessagePlanFallbackConditions
        channel={channel as Channel}
        index={index}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
