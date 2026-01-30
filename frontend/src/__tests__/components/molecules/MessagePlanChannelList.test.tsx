import { render } from '@testing-library/react';
import { MessagePlanChannelList } from '@molecules/MessagePlanChannelList/MessagePlanChannelList';

describe('MessagePlanChannelList', () => {
  it('matches snapshot', () => {
    expect(
      render(
        <MessagePlanChannelList
          className='extra-channel-list-class'
          data-testid='channel-list'
        >
          List content
        </MessagePlanChannelList>
      ).asFragment()
    ).toMatchSnapshot();
  });
});
