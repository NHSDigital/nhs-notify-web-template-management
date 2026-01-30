import { render } from '@testing-library/react';
import { MessagePlanChannelCard } from '@molecules/MessagePlanChannelCard/MessagePlanChannelCard';

describe('MessagePlanChannelCard', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(
      <MessagePlanChannelCard
        heading='Card Heading'
        className='extra-channel-card-class'
        data-testid='channel-card'
      >
        Card Content
      </MessagePlanChannelCard>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
