import { Channel } from 'nhs-notify-web-template-management-types';
import { render } from '@testing-library/react';
import {
  MessagePlanFallbackConditionsListItem,
  MessagePlanFallbackConditionsDetails,
} from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions';

describe('MessagePlanFallbackConditionsListItem', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(
      <MessagePlanFallbackConditionsListItem
        className='extra-list-item-class'
        data-testid='fallback-conditions-list-item'
      >
        List Item Content
      </MessagePlanFallbackConditionsListItem>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('MessagePlanFallbackConditionsDetails', () => {
  const cases: [Channel, number][] = [
    ['NHSAPP', 0],
    ['EMAIL', 1],
    ['SMS', 2],
    ['LETTER', 3],
  ];

  it.each(cases)(
    'should match snapshot for %s at index %i',
    (channel, index) => {
      const { asFragment } = render(
        <MessagePlanFallbackConditionsDetails
          channel={channel}
          className='extra-list-item-class'
          data-testid='fallback-conditions-details'
          index={index}
        />
      );

      expect(asFragment()).toMatchSnapshot();
    }
  );
});
