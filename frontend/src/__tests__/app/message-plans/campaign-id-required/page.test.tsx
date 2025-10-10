import { render } from '@testing-library/react';
import MessagePlanCampaignIdRequiredPage from '@app/message-plans/campaign-id-required/page';

test('matches snapshot', () => {
  const container = render(MessagePlanCampaignIdRequiredPage());

  expect(container.asFragment()).toMatchSnapshot();
});
